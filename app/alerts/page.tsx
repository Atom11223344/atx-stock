// app/alerts/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { AlertForm } from "@/components/AlertForm";
import { AlertItem } from "@/components/AlertItem";
import { createAlertAction, deleteAlertAction } from "./actions";
import { getPortfolioStatus } from "@/lib/portfolioUtils";
import { BellRing } from "lucide-react";

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8 text-red-500">กรุณา Login</div>;
  }

  const alerts = await db.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const status = await getPortfolioStatus();

  // ธีมสี (เหมือน Bookmark)
  let boxBorderClass = "border-gray-700";
  let boxShadowClass = "";
  let pageBgClass = "bg-gradient-to-b from-black to-gray-900";

  if (status === 'profit') {
    boxBorderClass = "border-green-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.green.900)]";
    pageBgClass = "bg-gradient-to-b from-black via-green-950 to-black";
  } else if (status === 'loss') {
    boxBorderClass = "border-red-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.red.900)]";
    pageBgClass = "bg-gradient-to-b from-black via-red-950 to-black";
  }

  return (
    <main className={`p-8 space-y-8 pb-32 min-h-[calc(100vh-73px)] ${pageBgClass}`}>
      
      <div className="flex items-center gap-3 mb-4">
        <BellRing className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold text-white">การแจ้งเตือน (Alerts)</h1>
      </div>

      {/* กล่องสร้าง Alert */}
      <div className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}>
        <h2 className="text-xl font-bold mb-4 text-white">สร้างการแจ้งเตือนใหม่</h2>
        <AlertForm onAddAlert={createAlertAction} />
      </div>

      {/* กล่องรายการ Alerts */}
      <div className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}>
        <h2 className="text-xl font-bold mb-4 text-white">รายการที่ตั้งไว้ ({alerts.length})</h2>
        
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-4">ยังไม่มีการแจ้งเตือน</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-3">Ticker</th>
                  {/* ลบหัวตารางเงื่อนไขออก */}
                  <th className="p-3">ราคาเป้าหมาย</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <AlertItem 
                    key={alert.id} 
                    alert={alert} 
                    onDeleteAlert={deleteAlertAction} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}