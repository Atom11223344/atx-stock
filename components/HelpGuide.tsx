// components/HelpGuide.tsx
"use client";

import { useState } from "react";
import { HelpCircle, X, BookOpen, LineChart, BellRing, Calculator } from "lucide-react";

export function HelpGuide({ status }: { status: 'profit' | 'loss' | 'even' }) {
  const [isOpen, setIsOpen] = useState(false);

  // --- กำหนดธีมสี (Neon Theme) ---
  let iconColorClass = "text-gray-400 hover:text-white";
  let boxBorderClass = "border-gray-700";
  let boxShadowClass = "";
  let titleColorClass = "text-white";

  if (status === 'profit') {
    iconColorClass = "text-gray-400 hover:text-green-400";
    boxBorderClass = "border-green-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.green.900)]";
    titleColorClass = "text-green-400";
  } else if (status === 'loss') {
    iconColorClass = "text-gray-400 hover:text-red-400";
    boxBorderClass = "border-red-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.red.900)]";
    titleColorClass = "text-red-400";
  }

  return (
    <>
      {/* 1. ปุ่มไอคอน Help (?) */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`p-2 transition-colors duration-200 ${iconColorClass}`}
        title="คู่มือการใช้งาน"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* 2. Modal คู่มือ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* กล่อง Modal นีออน */}
          <div 
            className={`bg-black w-full max-w-2xl rounded-2xl border-2 ${boxBorderClass} ${boxShadowClass} p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh]`}
          >
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className={`w-8 h-8 ${titleColorClass}`} />
                <h2 className="text-2xl font-bold text-white">ยินดีต้อนรับสู่ ATX Dashboard</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content (คำอธิบาย) */}
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                เว็บแอปพลิเคชันนี้ถูกออกแบบมาเพื่อช่วยให้คุณบริหารจัดการพอร์ตหุ้นและติดตามตลาดได้อย่างมีประสิทธิภาพ 
                โดยมีฟีเจอร์หลักๆ ดังนี้:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Feature 1 */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-white font-bold">
                    <LineChart className="w-5 h-5 text-blue-400" />
                    <h3>Portfolio Tracking</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    ติดตามมูลค่าพอร์ตของคุณแบบ Real-time, ดูต้นทุนเฉลี่ย, และคำนวณกำไร/ขาดทุน (P/L) ได้ทันที พร้อมกราฟประวัติย้อนหลัง
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-white font-bold">
                    <BellRing className="w-5 h-5 text-yellow-400" />
                    <h3>Price Alerts</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    ตั้งค่าการแจ้งเตือนราคาหุ้นที่คุณสนใจ ระบบจะแจ้งเตือนทันทีเมื่อราคาถึงเป้าหมาย (แจ้งเตือนที่กระดิ่งมุมขวาบน)
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-white font-bold">
                    <Calculator className="w-5 h-5 text-purple-400" />
                    <h3>Smart Tools</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    เครื่องมือคำนวณพิเศษ เช่น โปรแกรมถัวเฉลี่ยหุ้น และคำนวณจุดคุ้มทุน เพื่อวางแผนการเทรดอย่างแม่นยำ
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-white font-bold">
                    <BookOpen className="w-5 h-5 text-pink-400" />
                    <h3>Watchlist & Bookmarks</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    จัดกลุ่มหุ้นที่คุณสนใจเป็นรายการโปรด (Bookmark Lists) เพื่อติดตามราคาได้ง่ายๆ ในหน้าเดียว
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-900 rounded-lg text-center text-sm text-gray-500">
                <p>Developed by Satapana Sunthornsaratoon</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}