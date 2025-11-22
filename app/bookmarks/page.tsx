// app/bookmarks/page.tsx

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { BookmarkManager } from "@/components/BookmarkManager";
import { getLatestPrice } from "@/lib/polygon";
// --- 1. (เพิ่ม) Import เพื่อดึงสถานะพอร์ต ---
import { getPortfolioStatus } from "@/lib/portfolioUtils";

export default async function BookmarksPage() {
  
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-500">กรุณา Login</h1>
      </main>
    );
  }

  // 1. ดึงข้อมูล Lists
  const lists = await db.bookmarkList.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      items: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  // 2. ดึงราคาหุ้น
  const allTickers = new Set<string>();
  lists.forEach(list => {
    list.items.forEach(item => {
      allTickers.add(item.ticker);
    });
  });

  const pricePromises = Array.from(allTickers).map(ticker => getLatestPrice(ticker));
  const priceResults = await Promise.all(pricePromises);

  const priceMap: { [ticker: string]: number } = {};
  Array.from(allTickers).forEach((ticker, index) => {
    priceMap[ticker] = priceResults[index];
  });

  // --- 3. (เพิ่ม) ดึงสถานะพอร์ต (Profit/Loss) ---
  const status = await getPortfolioStatus();

  return (
    // --- 4. ส่ง 'status' ไปให้ UI ---
    <BookmarkManager 
      lists={lists} 
      priceMap={priceMap} 
      status={status} // (ส่งไปที่นี่)
    />
  );
}