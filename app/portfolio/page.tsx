import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { getLatestPrice } from "@/lib/polygon";
import { PortfolioManager } from "@/components/PortfolioManager";
import { getPortfolioStatus } from "@/lib/portfolioUtils";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">กรุณา Login</h1>
      </main>
    );
  }
  const userId = session.user.id;

  // 1. ดึงข้อมูล
  const items = await db.portfolioItem.findMany({ where: { userId }, orderBy: { ticker: "asc" } });
  const snapshots = await db.portfolioSnapshot.findMany({ where: { userId }, orderBy: { date: "asc" } });
  const status = await getPortfolioStatus();

  // 2. ดึงราคาล่าสุด & คำนวณ P/L
  const pricePromises = items.map(item => getLatestPrice(item.ticker));
  const latestPrices = await Promise.all(pricePromises);

  let totalCostBasis = 0;
  let totalMarketValue = 0;

  const portfolioData = items.map((item, index) => {
    const cost = item.shares * item.averagePrice;
    const marketValue = item.shares * latestPrices[index];
    const pl = marketValue - cost;
    totalCostBasis += cost;
    totalMarketValue += marketValue;
    
    return {
      ...item,
      marketValue,
      pl,
      currentPrice: latestPrices[index] // ส่งราคาปัจจุบันไปด้วย
    };
  });

  const totalPL = totalMarketValue - totalCostBasis;
  const totalPLPercent = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0;

  // 3. ส่งทุกอย่างให้ Client Component จัดการหน้าตา
  return (
    <PortfolioManager 
      status={status}
      summary={{
        marketValue: totalMarketValue,
        cost: totalCostBasis,
        pl: totalPL,
        plPercent: totalPLPercent
      }}
      items={portfolioData}
      snapshots={snapshots}
    />
  );
}