// lib/portfolioUtils.ts

import { cache } from 'react';
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { getLatestPrice } from "@/lib/polygon";

// Helper: แบ่ง Array เป็นก้อนๆ (Chunk)
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const getPortfolioStatus = cache(async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return 'even'; 
  
  try {
    const items = await db.portfolioItem.findMany({ where: { userId: userId } });
    if (items.length === 0) return 'even';

    let totalCostBasis = 0;
    let totalMarketValue = 0;

    // --- !!! แก้ไข: ยิงทีละกลุ่ม (Batching) เพื่อความเร็ว !!! ---
    const BATCH_SIZE = 3; // ยิงพร้อมกันทีละ 3 ตัว (เร็วกว่าทีละ 1 ตัว ถึง 3 เท่า)
    const batches = chunkArray(items, BATCH_SIZE);

    for (const batch of batches) {
      // 1. ยิง API พร้อมกันในกลุ่มนี้ (Parallel within batch)
      const promises = batch.map(async (item) => {
        const currentPrice = await getLatestPrice(item.ticker);
        return { item, currentPrice };
      });

      // 2. รอให้กลุ่มนี้เสร็จทั้งหมด
      const results = await Promise.all(promises);

      // 3. คำนวณผลลัพธ์
      for (const { item, currentPrice } of results) {
        const cost = item.shares * item.averagePrice;
        const marketValue = item.shares * currentPrice;
        totalCostBasis += cost;
        totalMarketValue += marketValue;
      }
      // (วนไปกลุ่มต่อไปทันที)
    }
    // --- !!! สิ้นสุดส่วนแก้ไข !!! ---

    const totalPL = totalMarketValue - totalCostBasis;
    
    if (totalPL > 0.01) return 'profit';
    if (totalPL < -0.01) return 'loss'; 
    return 'even';

  } catch (error) {
    console.error("Failed to get portfolio status:", error);
    return 'even'; 
  }
});

// (ฟังก์ชัน checkAlertsAndNotify คงเดิม ไม่ต้องแก้)
export const checkAlertsAndNotify = cache(async (userId: string) => {
  try {
    const alerts = await db.priceAlert.findMany({
      where: { userId: userId, active: true }
    });

    if (alerts.length === 0) return;

    // ใช้เทคนิค Batching เดียวกันกับ Alert เพื่อความเร็ว
    const BATCH_SIZE = 3;
    const batches = chunkArray(alerts, BATCH_SIZE);

    for (const batch of batches) {
      const promises = batch.map(async (alert) => {
        const currentPrice = await getLatestPrice(alert.ticker);
        return { alert, currentPrice };
      });

      const results = await Promise.all(promises);

      for (const { alert, currentPrice } of results) {
        let isTriggered = false;
        const condition = alert.condition || 'gte';

        if (condition === 'gte' && currentPrice >= alert.targetPrice) isTriggered = true;
        else if (condition === 'lte' && currentPrice <= alert.targetPrice) isTriggered = true;

        if (isTriggered) {
          await db.notification.create({
            data: {
              userId: userId,
              message: `🔔 ${alert.ticker} ถึงเป้าแล้ว! (${alert.targetPrice.toFixed(2)}) ราคาปัจจุบัน: ${currentPrice.toFixed(2)}`,
              isRead: false,
            }
          });
          await db.priceAlert.update({ where: { id: alert.id }, data: { active: false } });
        }
      }
    }
  } catch (error) {
    console.error("Failed to check alerts:", error);
  }
});