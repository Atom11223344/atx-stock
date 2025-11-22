// app/stock/[ticker]/page.tsx

import { StockChartLoader } from '@/components/StockChartLoader';
import { getStockData } from '@/lib/polygon';
import { StockSearch } from '@/components/StockSearch';
import { getPortfolioStatus } from '@/lib/portfolioUtils';

export default async function StockPage(props: any) {
  const params = props.params ? await props.params : null;
  const searchParams = props.searchParams ? await props.searchParams : {};

  if (!params || !params.ticker) {
    return <div className="p-8 text-red-500">Error: Invalid Ticker</div>;
  }

  const ticker = params.ticker.toUpperCase();
  const timeframe = searchParams.timeframe || "1d";
  
  // 1. ดึงข้อมูลกราฟ
  const data = await getStockData(ticker, timeframe);
  
  // 2. ดึงสถานะพอร์ต (เพื่อทำธีมสีพื้นหลัง)
  const status = await getPortfolioStatus();

  // --- ธีมสี (Neon) ---
  let pageBgClass = "bg-gradient-to-b from-black to-gray-900";
  if (status === 'profit') pageBgClass = "bg-gradient-to-b from-black via-green-950 to-black";
  else if (status === 'loss') pageBgClass = "bg-gradient-to-b from-black via-red-950 to-black";

  return (
    <main className={`p-4 md:p-8 space-y-6 pb-32 min-h-[calc(100vh-73px)] ${pageBgClass}`}>
      
      {/* 1. Search Bar (ลอยอยู่บนสุด) */}
      <div className="w-full max-w-md mx-auto mb-4 z-40 relative">
        <StockSearch />
      </div>

      {/* 2. พื้นที่กราฟ */}
      {data && data.resultsCount > 0 ? (
        // ส่ง ticker เข้าไปให้กราฟด้วย เพื่อเอาไปโชว์ใน Header
        <StockChartLoader 
          data={data} 
          currentTf={timeframe} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm text-center p-6">
          <p className="text-red-400 text-xl font-bold mb-2">ไม่พบข้อมูลหุ้น {ticker}</p>
          <p className="text-gray-500 text-sm">
            กรุณาตรวจสอบชื่อหุ้น หรือลองเปลี่ยน Timeframe<br/>
            (ตลาดอาจจะปิด หรือ API Key มีปัญหา)
          </p>
        </div>
      )}
    </main>
  );
}