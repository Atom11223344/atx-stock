// components/HomeDisplay.tsx

"use client"; 

import Lottie from 'react-lottie-player';
import { StockSearch } from './StockSearch';
// --- 1. Import Hooks (ยังต้องใช้) ---
import { useState, useEffect } from 'react';

// (Path ถูกต้องแล้ว - ไม่ต้อง Import JSON)

interface HomeDisplayProps {
  status: 'profit' | 'loss' | 'even';
  isLoggedIn: boolean; 
}

// =======================================================
// --- 2. Component "กำไร" (Profit) [source: 171] (แก้ไขตรรกะ Loop) ---
// =======================================================
function ProfitDisplay() {
  
  // --- VVVVVV (นี่คือตรรกะ "Key" ใหม่) VVVVVV ---
  
  // 1. สร้าง 'key' (เป็นแค่ตัวเลข 0, 1, 2, ...)
  const [rocketKey, setRocketKey] = useState(0);

  useEffect(() => {
    // 2. "ทุกๆ 5 วินาที [source: 189]...
    const timer = setTimeout(() => {
      // 3. ...ให้เปลี่ยน 'key' (เช่น 0 -> 1, 1 -> 2)
      setRocketKey(prevKey => prevKey + 1);
    }, 9000); // (5000ms = 5 วินาที)

    // 4. (สำคัญ) เคลียร์ Timer เมื่อ Component ถูกทำลาย
    return () => clearTimeout(timer);
    
    // 5. 'useEffect' นี้จะรันใหม่ "ทุกครั้ง" ที่ 'key' เปลี่ยน
  }, [rocketKey]); 
  
  // --- ^^^^^^ (สิ้นสุดตรรกะ "Key" ใหม่) ^^^^^^ ---

  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn">
      <div 
        className="relative bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg" 
        style={{ width: 400, height: 400 }} 
      >
        {/* Lottie กราฟ [source: 171] (Loop ตลอด - เหมือนเดิม) */}
        <Lottie
          loop
          path="/lottie/profit-graph.json" 
          play
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Lottie จรวด [source: 171] (แก้ไข Prop) */}
        <Lottie
          // 1. (ใส่ 'key' ที่เปลี่ยนทุก 5 วิ [source: 189])
          key={rocketKey} 
          
          loop={false} // (2. เล่นแค่ 1 รอบ)
          path="/lottie/rocket-launch.json" 
          play={true}  // (3. เล่นทันทีที่ "เกิดใหม่")
          
          // (4. ตำแหน่งและขนาด - เหมือนเดิม)
          style={{ 
            position: 'absolute', 
            width: 300, 
            height: 300,
            bottom: 20, 
            left: 60, 
          }}
        />
      </div>
      
      {/* Search Bar */}
      <div className="w-full max-w-lg mt-8"> 
        <StockSearch />
      </div>
    </div>
  );
}

// =======================================================
// --- 3. Component "ขาดทุน" (Loss) [source: 173, 174] (เหมือนเดิม) ---
// =======================================================
function LossDisplay() {
  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
        <Lottie
          loop
          path="/lottie/loss-animation.json"
          play
          style={{ width: 400, height: 400 }}
        />
      </div>
      <div className="w-full max-w-lg mt-8"> 
        <StockSearch />
      </div>
    </div>
  );
}

// =======================================================
// --- 4. Component "เท่าทุน" (Even) [source: 173, 174] (เหมือนเดิม) ---
// =======================================================
function EvenDisplay({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center animate-fadeIn">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
        <Lottie
          loop
          path="/lottie/even-animation.json"
          play
          style={{ width: 400, height: 400 }}
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-400 mt-8">Welcome to ATX</h1>
      <p className="text-lg text-gray-500">
        {isLoggedIn ? "Your portfolio is breakeven." : "Please log in to see your portfolio."}
      </p>
      <div className="w-full max-w-lg mt-4">
        <StockSearch /> 
      </div>
    </div>
  );
}


// =======================================================
// --- 5. Component หลัก (เหมือนเดิม) ---
// =======================================================
export function HomeDisplay({ status, isLoggedIn }: HomeDisplayProps) {
  
  if (status === 'profit') {
    return <ProfitDisplay />;
  }
  
  if (status === 'loss') {
    return <LossDisplay />;
  }
  
  return <EvenDisplay isLoggedIn={isLoggedIn} />;
}