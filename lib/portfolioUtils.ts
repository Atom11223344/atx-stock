import { cache } from 'react';
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { getLatestPrice } from "@/lib/polygon";

// (ฟังก์ชัน getPortfolioStatus เหมือนเดิม)
export const getPortfolioStatus = cache(async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return 'even'; 
  
  try {
    const items = await db.portfolioItem.findMany({ where: { userId: userId } });
    if (items.length === 0) return 'even';

    let totalCostBasis = 0;
    let totalMarketValue = 0;

    for (const item of items) {
      const currentPrice = await getLatestPrice(item.ticker); 
      
      const cost = item.shares * item.averagePrice;
      const marketValue = item.shares * currentPrice;
      
      totalCostBasis += cost;
      totalMarketValue += marketValue;
    }

    const totalPL = totalMarketValue - totalCostBasis;
    
    if (totalPL > 0.01) return 'profit';
    if (totalPL < -0.01) return 'loss'; 
    return 'even';

  } catch (error) {
    console.error("Failed to get portfolio status:", error);
    return 'even'; 
  }
});


// --- ฟังก์ชันเช็ค Alert (แก้ไขแล้ว: ลบ type ออก) ---
export const checkAlertsAndNotify = cache(async (userId: string) => {
  try {
    // 1. ดึง Alert ที่ยัง Active อยู่
    const alerts = await db.priceAlert.findMany({
      where: { userId: userId, active: true }
    });

    if (alerts.length === 0) return;

    // 2. วนลูปเช็คทีละตัว
    for (const alert of alerts) {
      const currentPrice = await getLatestPrice(alert.ticker);
      
      let isTriggered = false;
      // เช็ค condition
      const condition = alert.condition || 'gte';

      if (condition === 'gte' && currentPrice >= alert.targetPrice) {
        isTriggered = true;
      } else if (condition === 'lte' && currentPrice <= alert.targetPrice) {
        isTriggered = true;
      }

      // 3. ถ้าเงื่อนไขเป็นจริง -> สร้าง Notification
      if (isTriggered) {
        await db.notification.create({
          data: {
            userId: userId,
            message: `🔔 ${alert.ticker} ได้ถึงราคาเป้าหมาย ${alert.targetPrice.toFixed(2)} แล้ว! (ราคาปัจจุบัน: ${currentPrice.toFixed(2)})`,
            // type: 'PRICE_ALERT', <--- ลบบรรทัดนี้ทิ้งแล้ว (แก้ Error)
            isRead: false,
          }
        });

        // ปิด Alert
        await db.priceAlert.update({
          where: { id: alert.id },
          data: { active: false }
        });
      }
    }
  } catch (error) {
    console.error("Failed to check alerts:", error);
  }
});