// lib/polygon.ts

// =======================================================
// === 1. ฟังก์ชันสำหรับ "หน้า Portfolio" (P/L) ===
// (นี่คือฟังก์ชันที่ "หายไป" และเราเอากลับมา)
// =======================================================
export async function getLatestPrice(ticker: string) {
  const apiKey = process.env.POLYGON_API_KEY;
  // (ใช้ /prev ที่ถูกต้อง)
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 } // Cache 15 นาที
    });
    
    if (!res.ok) {
      console.error(`[Polygon API] Failed to fetch prev price for ${ticker} (Status: ${res.status})`);
      return 0; 
    }
    
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].c; // คืนค่าราคาปิด (c)
    } else {
      console.warn(`[Polygon API] No 'prev' data found for ${ticker}`);
      return 0;
    }
  
  } catch (error) {
    console.error(`[Polygon API] Error in getLatestPrice for ${ticker}:`, error);
    return 0; 
  }
}

// =======================================================
// === 2. ฟังก์ชันสำหรับ "หน้ากราฟ" (Timeframes) ===
// (นี่คือฟังก์ชันที่เราอัปเกรดไปล่าสุด)
// =======================================================
export async function getStockData(ticker: string, timeframe: string) {
  const apiKey = process.env.POLYGON_API_KEY;

  // 1. "แปล" Timeframe
  let multiplier = 1;
  let timespan = "day";
  let from = getTwoYearsAgoDate(); 

  switch (timeframe) {
    case "1m":
      multiplier = 1;
      timespan = "minute";
      from = getDaysAgoDate(2); // (2 วันล่าสุด)
      break;
    case "1h":
      multiplier = 1;
      timespan = "hour";
      from = getDaysAgoDate(60); // (60 วันล่าสุด)
      break;
    case "4h":
      multiplier = 4;
      timespan = "hour";
      from = getDaysAgoDate(120); // (120 วันล่าสุด)
      break;
    case "1w":
      multiplier = 1;
      timespan = "week";
      from = getFiveYearsAgoDate(); // (5 ปี)
      break;
    case "1M":
      multiplier = 1;
      timespan = "month";
      from = getFiveYearsAgoDate(); // (5 ปี)
      break;
    // (case "1d" (Default) ไม่ต้องทำอะไร)
  }

  const to = getTodayDate();
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=5000&apiKey=${apiKey}`;
  
  try {
    const revalidateTime = (timespan === 'day' || timespan === 'week' || timespan === 'month') ? 300 : 60;
    
    const res = await fetch(url, { next: { revalidate: revalidateTime } }); 
    if (!res.ok) { throw new Error(`Failed to fetch data (${res.status})`); }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// =======================================================
// === 3. ฟังก์ชันผู้ช่วย (สำหรับวันที่) ===
// =======================================================
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}
function getDaysAgoDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
function getTwoYearsAgoDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2);
  return date.toISOString().split('T')[0];
}
function getFiveYearsAgoDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 5);
  return date.toISOString().split('T')[0];
}