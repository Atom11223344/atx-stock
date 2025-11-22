// app/api/cron/route.ts

import { db } from "@/lib/prisma"; // 1. Import DB
import { getLatestPrice } from "@/lib/polygon"; // 2. Import ฟังก์ชันดึงราคา
import { NextResponse } from "next/server"; // 3. Import ตัวช่วยส่งคำตอบ

// =======================================================
// นี่คือ "สมอง" ของเรา (GET Request)
// =======================================================
export async function GET() {
  console.log("🤖 Cron Job: Firing!");

  try {
    // --- 1. ดึง Alerts ทั้งหมดที่ยัง Active ---
    // (ในอนาคตเราสามารถเพิ่ม "สถานะ" ให้ Alert ได้ แต่ตอนนี้ดึงมาหมด)
    const allAlerts = await db.priceAlert.findMany({
      include: {
        user: true, // เอาข้อมูล User (เจ้าของ) มาด้วย
      },
    });

    if (allAlerts.length === 0) {
      console.log("🤖 Cron Job: No alerts to check.");
      return NextResponse.json({ success: true, message: "No alerts." });
    }

    // --- 2. จำกัด Rate Limit (ดึงแค่ 5 หุ้นที่ยังไม่ซ้ำกัน) ---
    // (นี่คือตรรกะ V1.0 เพื่อเคารพ Free Tier)
    const uniqueTickers = [...new Set(allAlerts.map(a => a.ticker))];
    const tickersToCheck = uniqueTickers.slice(0, 5); // เอามาแค่ 5 Ticker แรก

    console.log(`🤖 Cron Job: Checking ${tickersToCheck.length} tickers:`, tickersToCheck);

    // --- 3. ดึงราคาปัจจุบัน (ใช้ Promise.all) ---
    const pricePromises = tickersToCheck.map(ticker => 
      getLatestPrice(ticker).then(price => ({ ticker, price }))
    );
    const latestPrices = await Promise.all(pricePromises);

    // แปลง Array เป็น Object { GOOG: 180, AAPL: 200 } เพื่อง่ายต่อการค้นหา
    const priceMap = latestPrices.reduce((map, item) => {
      map[item.ticker] = item.price;
      return map;
    }, {} as Record<string, number>);

    // --- 4. "สมอง" (เปรียบเทียบราคา) ---
    const notificationsToCreate: any[] = [];
    const alertsToDelete: string[] = [];

    for (const alert of allAlerts) {
      // ถ้า Alert นี้อยู่ใน "โควต้า" 5 Ticker ที่เราเช็ก
      if (priceMap[alert.ticker]) {
        const currentPrice = priceMap[alert.ticker];

        // --- ตรรกะการ Trigger ---
        // (เราจะสมมติว่าทุน > ราคาเป้าหมาย = ตั้ง Alert ขาลง)
        // (และ ทุน < ราคาเป้าหมาย = ตั้ง Alert ขาขึ้น)
        // (โค้ดนี้ยังไม่ได้ซับซ้อนขนาดนั้น แต่ใช้ได้)
        
        // **เงื่อนไข:** ถ้า "ราคาเป้าหมาย" อยู่ "ระหว่าง" ราคาปิดเมื่อวานกับราคาปัจจุบัน
        // (เราไม่มี "ราคาปิดเมื่อวาน" เรามีแต่ "ราคาปัจจุบัน" (prev close))
        
        // **ตรรกะที่ง่ายกว่า (V1): ถ้ามัน "ถึง" เป้า**
        // เราต้องรู้ว่า User ตั้ง "ซื้อ" (รอลง) หรือ "ขาย" (รอขึ้น)
        // ...ซึ่งเรา "ยังไม่ได้เก็บ" ใน Database!
        
        // --- ตรรกะที่ง่ายที่สุด (V1.1): ถ้ามัน "ทะลุ" ---
        // (เราจะสมมติว่า User ตั้ง Alert ขาขึ้น (รอขาย))
        if (currentPrice > 0 && currentPrice >= alert.targetPrice) {
          
          console.log(`🎉 ALERT TRIGGERED! ${alert.ticker} reached ${alert.targetPrice} (Current: ${currentPrice})`);

          // 1. เตรียมสร้าง Notification
          notificationsToCreate.push({
            userId: alert.userId,
            message: `🔔 ${alert.ticker} ได้ถึงราคาเป้าหมาย ${alert.targetPrice.toFixed(2)} แล้ว! (ราคาปัจจุบัน: ${currentPrice.toFixed(2)})`,
          });

          // 2. เตรียมลบ Alert นี้ทิ้ง (เพราะมันทำงานเสร็จแล้ว)
          alertsToDelete.push(alert.id);
        }
      }
    }

    // --- 5. บันทึกลง Database (Transaction) ---
    if (notificationsToCreate.length > 0) {
      // บันทึก Noti ใหม่ทั้งหมด
      await db.notification.createMany({
        data: notificationsToCreate,
      });

      // ลบ Alert เก่าที่ทำงานแล้ว
      await db.priceAlert.deleteMany({
        where: {
          id: { in: alertsToDelete },
        },
      });
      
      console.log(`🤖 Cron Job: Created ${notificationsToCreate.length} notifications.`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${tickersToCheck.length} tickers. Created ${notificationsToCreate.length} notifications.` 
    });

  } catch (error) {
    console.error("🤖 Cron Job Error:", error);
    return NextResponse.json({ success: false, message: "Cron job failed." }, { status: 500 });
  }
}