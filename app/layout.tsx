// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import AuthButton from "@/components/AuthButton";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NotificationBell } from "@/components/NotificationBell";
import { revalidatePath } from "next/cache";
import Link from "next/link"; 
import { BottomNavbar } from "@/components/BottomNavbar";
// Import ฟังก์ชันที่เราเพิ่งเพิ่ม
import { getPortfolioStatus, checkAlertsAndNotify } from "@/lib/portfolioUtils";
import { HelpGuide } from "@/components/HelpGuide";

const inter = Inter({ subsets: ["latin"] }); 

export const metadata = {
  title: "ATX Stock Dashboard",
  description: "Your personal stock analysis dashboard",
};

async function markNotificationsAsRead() {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/"); 
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();
  
  // --- 1. เรียกฟังก์ชันสร้าง Notification (สำคัญมาก!) ---
  if (session?.user?.id) {
    // ฟังก์ชันนี้จะเช็คราคาและ "สร้าง" notification ลง DB ถ้าถึงเป้า
    await checkAlertsAndNotify(session.user.id);
  }

  // 2. ดึงสถานะพอร์ต
  const status = await getPortfolioStatus();

  // 3. ดึง Notification มาแสดง (ตอนนี้จะมีข้อมูลใหม่แล้ว เพราะเราสั่งสร้างไปในข้อ 1)
  let notifications: any[] = []; 
  if (session?.user?.id) {
    notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, 
    });
  }

  // (Style Navbar - เหมือนเดิม)
  let navBgClass = "bg-black"; 
  let navBorderClass = "border-gray-900";
  let navShadowClass = ""; 

  if (status === 'profit') {
    navBgClass = "bg-gradient-to-b from-black to-green-950";
    navBorderClass = "border-green-950"; 
    navShadowClass = "shadow-[0_4px_15px_-5px_theme(colors.green.800)]"; 
  } else if (status === 'loss') {
    navBgClass = "bg-gradient-to-b from-black to-red-950";
    navBorderClass = "border-red-950"; 
    navShadowClass = "shadow-[0_4px_15px_-5px_theme(colors.red.800)]"; 
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100 pb-16 md:pb-0`}>
        
        <header 
          className={`w-full p-4 ${navBgClass} border-b-2 ${navBorderClass} ${navShadowClass} sticky top-0 z-30`}
        >
          <nav className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/portfolio" className="text-xl font-bold text-white">
                My Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {session && (
                <NotificationBell 
                  initialNotifications={notifications}
                  markAsReadAction={markNotificationsAsRead} 
                />
              )}
              <HelpGuide status={status} />
              <AuthButton />
            </div>
          </nav>
        </header>

        {children}
        
        <BottomNavbar 
          status={status} 
          user={session?.user} 
        />
        
      </body>
    </html>
  );
}