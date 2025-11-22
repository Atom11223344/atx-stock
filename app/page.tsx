// app/page.tsx

import { auth } from "@/auth";
// --- 1. (ลบ 'db' และ 'getLatestPrice' [source: 167]) ---
import { HomeDisplay } from "@/components/HomeDisplay"; 
// --- 2. (เพิ่ม) Import "ฟังก์ชันคำนวณครั้งเดียว" [source: 204] ---
import { getPortfolioStatus } from "@/lib/portfolioUtils";

// --- 3. (ลบ 'getPortfolioStatus' เวอร์ชันเก่าออกจากตรงนี้) ---


// --- 4. Home (Server Component) ---
export default async function Home() {
  const session = await auth();
  
  // --- 5. "เรียกใช้" ฟังก์ชันคำนวณครั้งเดียว [source: 204] ---
  // (React จะ "Cache" ผลลัพธ์จาก 'layout' [source: 167] มาให้... ไม่ยิง API ซ้ำ)
  const status = await getPortfolioStatus();

  // (containerClass - แก้ไขล่าสุด - เหมือนเดิม)
  let containerClass = "flex flex-col w-full items-center p-8 transition-colors duration-500";
  containerClass += " min-h-[calc(100vh-73px)]"; 
  containerClass += " pb-75"; 
  containerClass += " pt-16"; 
  
  if (status === 'profit') {
    containerClass += " bg-gradient-to-b from-black via-green-950 to-black";
  } else if (status === 'loss') {
    containerClass += " bg-gradient-to-b from-black via-red-950 to-black";
  } else {
    containerClass += " bg-gradient-to-b from-black to-gray-900"; 
  }

  return (
    <div className={containerClass}> 
      <HomeDisplay 
        status={status} 
        isLoggedIn={!!session?.user?.id} 
      />
    </div>
  );
}