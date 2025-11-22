// components/BottomNavbar.tsx

"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Wrench, 
  Briefcase, 
  Megaphone, 
  Bookmark,
  User 
} from "lucide-react";
import { useState, useEffect } from 'react';
import { ProfileModal } from './ProfileModal';

// (Type User - เหมือนเดิม)
type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function BottomNavbar({ 
  status, 
  user 
}: { 
  status: 'profit' | 'loss' | 'even';
  user: User | undefined;
}) {
  
  const pathname = usePathname(); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // (ตรรกะ "ซ่อน/โชว์" - เหมือนเดิม)
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // (ฟังก์ชัน getLinkClass - เหมือนเดิม)
  const getLinkClass = (href: string) => {
    const isActive = (href === "/profile" && isProfileOpen) || (pathname === href);
    return isActive 
      ? "text-blue-400" 
      : "text-gray-400 hover:text-gray-200";
  };

  // --- !!! VVVVVV (แก้ไขแล้ว: เปลี่ยน 'shadowClass') VVVVVV !!! ---
  let navBgClass = "bg-black"; 
  let navBorderClass = "border-gray-900";
  let navShadowClass = ""; // (ตัวแปรสำหรับ "เงาเรืองแสง" [source: 217, 218])

  if (status === 'profit') {
    navBgClass = "bg-gradient-to-t from-black to-green-950";
    navBorderClass = "border-green-950"; 
    // (ใช้ 'box-shadow' ที่กำหนดเอง: เรืองแสง [source: 217, 218] "ขึ้นบน")
    navShadowClass = "shadow-[0_-4px_15px_-5px_theme(colors.green.800)]"; 
  } else if (status === 'loss') {
    navBgClass = "bg-gradient-to-t from-black to-red-950";
    navBorderClass = "border-red-950"; 
    // (ใช้ 'box-shadow' ที่กำหนดเอง: เรืองแสง [source: 217, 218] "ขึ้นบน")
    navShadowClass = "shadow-[0_-4px_15px_-5px_theme(colors.red.800)]"; 
  }
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/alerts", label: "Alerts", icon: Megaphone },
    { href: "/bookmarks", label: "Bookmark", icon: Bookmark },
  ];

  return (
    <>
      {/* (Navbar ล่าง - หนา 2px [source: 217] + เรืองแสง [source: 217, 218]) */}
      <nav 
        className={`fixed bottom-0 left-0 w-full h-16 ${navBgClass} border-t-2 ${navBorderClass} ${navShadowClass} z-30 
                    transition-transform duration-300 ease-in-out
                    ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-around w-full h-full">
          
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`flex flex-col items-center justify-center p-2 ${getLinkClass(item.href)}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}

          <button 
            onClick={() => setIsProfileOpen(true)}
            className={`flex flex-col items-center justify-center p-2 ${getLinkClass("/profile")}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span> 
          </button>
        </div>
      </nav>

      {/* (Profile Modal - เหมือนเดิม) */}
      {isProfileOpen && (
        <ProfileModal 
          user={user} 
          onClose={() => setIsProfileOpen(false)}
          status={status}
        />
      )}
    </>
  );
}