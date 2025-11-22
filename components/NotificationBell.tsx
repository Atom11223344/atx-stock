// components/NotificationBell.tsx

"use client"; 

import { useState, useTransition, useRef, useEffect } from 'react';
import type { Notification } from '@prisma/client'; 
import { Bell, BellRing } from 'lucide-react'; // (ใช้ไอคอนจาก Lucide ให้เข้ากับธีม)

export function NotificationBell({
  initialNotifications,
  markAsReadAction
}: {
  initialNotifications: Notification[];
  markAsReadAction: () => Promise<void>;
}) {
  
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // (Ref สำหรับเช็คการคลิกข้างนอก)
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);

    if (newOpenState === true && unreadCount > 0) {
      startTransition(async () => {
        await markAsReadAction(); 
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      });
    }
  };

  // (Effect: คลิกข้างนอกเพื่อปิด Dropdown)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- ปุ่มกระดิ่ง --- */}
      <button 
        onClick={handleToggle} 
        className={`relative p-2 rounded-full transition-all duration-200 ${
          isOpen ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        {/* (ถ้ามีแจ้งเตือนใหม่ ใช้ไอคอนสั่นกระดิ่ง, ถ้าไม่มี ใช้แบบปกติ) */}
        {unreadCount > 0 ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}

        {/* Badge สีแดง */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white border-2 border-black shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* --- Dropdown --- */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-black border-2 border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
            <h3 className="font-bold text-white text-lg">การแจ้งเตือน</h3>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {notifications.length} รายการ
            </span>
          </div>
          
          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-600 flex flex-col items-center gap-3">
                <Bell className="w-10 h-10 opacity-20" />
                <p>ไม่มีการแจ้งเตือนใหม่</p>
              </div>
            ) : (
              notifications.map((noti) => (
                <div 
                  key={noti.id} 
                  className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors flex gap-3 group"
                >
                  {/* จุดสีแสดงสถานะ */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${noti.message.includes('ถึงราคาเป้าหมาย') ? 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)]' : 'bg-blue-500'}`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 leading-relaxed group-hover:text-white transition-colors">
                      {noti.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {new Date(noti.createdAt).toLocaleString('th-TH', {
                        day: '2-digit', month: 'short', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer (Optional) */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-900/30 border-t border-gray-800 text-center">
              <span className="text-[10px] text-gray-600">แสดง 20 รายการล่าสุด</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}