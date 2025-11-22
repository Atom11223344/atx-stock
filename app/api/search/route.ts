// app/api/search/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const API_KEY = process.env.POLYGON_API_KEY;

  // --- !!! นี่คือ URL ที่แก้ไขแล้ว (ใช้ ticker=... แทน ticker.gte=...) !!! ---
  // เราเปลี่ยนมาใช้ "ticker=" (ที่แปลว่า "ตรงตัวเป๊ะๆ")
  // และเราเอา limit=10 ออก เพราะเราต้องการแค่ตัวเดียว
  const url = `https://api.polygon.io/v3/reference/tickers?ticker=${query.toUpperCase()}&active=true&limit=1&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Polygon API failed with status ${response.status}`);
    }
    const data = await response.json();
    
    // --- (ลบ .sort() ทิ้ง เพราะไม่จำเป็นแล้ว) ---
    
    // ส่งข้อมูลกลับไป (ถ้าไม่เจอ 'SES', data.results จะเป็น [] ว่างเปล่า)
    return NextResponse.json(data.results || []);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data from Polygon' }, { status: 500 });
  }
}