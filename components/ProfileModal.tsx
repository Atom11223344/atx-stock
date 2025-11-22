// components/ProfileModal.tsx

"use client";

import { X, LogOut } from 'lucide-react';
import { signOut } from "@/auth"; 

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ProfileModalProps {
  user: User | undefined; 
  onClose: () => void; 
  status: 'profit' | 'loss' | 'even';
}

export function ProfileModal({ user, onClose, status }: ProfileModalProps) {
  
  const firstName = user?.name?.split(' ')[0] || "User";
  const surname = user?.name?.split(' ').slice(1).join(' ') || "";

  // --- !!! VVVVVV (แก้ไขแล้ว: เปลี่ยน "สูตร" เงาเรืองแสง [source: 217, 218]) VVVVVV !!! ---
  let accentClass = "text-gray-400"; // สี Default (เทา)
  let borderClass = "border-gray-700"; // สีขอบ Default (เทาเข้ม)
  let shadowClass = ""; // (ตัวแปรสำหรับ "เงาเรืองแสง" [source: 217, 218])
  
  if (status === 'profit') {
    accentClass = "text-green-400"; // (สีชื่อ - เหมือนเดิม [source: 217])
    borderClass = "border-green-800"; 
    // (เปลี่ยนสูตร: 0 0 30px 5px -> เบลอ 30px, ฟุ้ง 5px)
    shadowClass = "shadow-[0_0_30px_5px_theme(colors.green.800)]"; 
  } else if (status === 'loss') {
    accentClass = "text-red-400"; // (สีชื่อ - เหมือนเดิม)
    borderClass = "border-red-800"; 
    // (เปลี่ยนสูตร: 0 0 30px 5px -> เบลอ 30px, ฟุ้ง 5px)
    shadowClass = "shadow-[0_0_30px_5px_theme(colors.red.800)]"; 
  }
  // --- !!! ^^^^^^ (สิ้นสุดการแก้ไข) ^^^^^^ !!! ---

  return (
    // 1. "ฉากหลัง" (สีดำโปร่งแสง) [source: 215]
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onClose} 
    >
      {/* 2. "หน้าต่าง" Modal (หนา 2px [source: 217] + เรืองแสง [source: 217, 218] สูตรใหม่) */}
      <div
        className={`bg-gray-800 w-full max-w-md m-4 rounded-2xl border-3 ${borderClass} ${shadowClass} p-6 relative animate-fadeIn`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 3. ปุ่ม "ปิด" (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 4. ส่วนหัว (ตัวอักษร "ไม่" เรืองแสง) [source: 217] */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.image || `https://avatar.vercel.sh/${user?.email}`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-gray-600"
          />
          <div>
            <h2 className={`text-2xl font-bold ${accentClass}`}>{firstName}</h2> 
            <p className="text-gray-400">{surname}</p>
          </div>
        </div>

        {/* 5. รายละเอียด (ฟ้อนต์สีขาว/เทา) [source: 215] */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Email</label>
            <p className="text-lg text-gray-200">{user?.email || "No Email"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">First Name</label>
            <p className="text-lg text-gray-200">{firstName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Surname</label>
            <p className="text-lg text-gray-200">{surname}</p>
          </div>
        </div>

        {/* 6. ปุ่ม "Sign Out" (สีแดง [source: 215] ตลอด) */}
        <form
          action={async () => {
            await signOut();
          }}
          className="mt-8"
        >
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
        
      </div>
    </div>
  );
}