"use client";

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

// --- Interface สำหรับรับ Props สไตล์ ---
interface StyleProps {
  boxBorderClass: string;
  boxShadowClass: string;
}

// --- 1. เครื่องมือถัวเฉลี่ย (Logic เดิม 100% - แก้แค่ CSS) ---
function AverageCalculator({ boxBorderClass, boxShadowClass }: StyleProps) {
  const [origShares, setOrigShares] = useState("100");
  const [origPrice, setOrigPrice] = useState("1.45");
  const [newShares, setNewShares] = useState("100");
  const [newPrice, setNewPrice] = useState("1.00");

  const nOrigShares = parseFloat(origShares) || 0;
  const nOrigPrice = parseFloat(origPrice) || 0;
  const nNewShares = parseFloat(newShares) || 0;
  const nNewPrice = parseFloat(newPrice) || 0;

  const totalShares = nOrigShares + nNewShares;
  const totalCost = (nOrigShares * nOrigPrice) + (nNewShares * nNewPrice);
  const newAvgPrice = totalShares > 0 ? (totalCost / totalShares) : 0;

  return (
    <div className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}>
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <Calculator className="w-6 h-6" />
        โปรแกรมถัวเฉลี่ยหุ้น
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* กลุ่มเดิม */}
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">ของเดิมที่มี</h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">จำนวนหุ้นเดิม</label>
            <input 
              type="number" 
              value={origShares} 
              onChange={(e) => setOrigShares(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">ทุนเดิม @</label>
            <input 
              type="number" 
              value={origPrice}
              onChange={(e) => setOrigPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* กลุ่มซื้อเพิ่ม */}
        <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">ซื้อเพิ่ม</h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">จำนวนที่ซื้อเพิ่ม</label>
            <input 
              type="number" 
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">ราคาซื้อใหม่ @</label>
            <input 
              type="number" 
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ผลลัพธ์ */}
      <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-900 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">ทุนเฉลี่ยใหม่</p>
            <p className="text-2xl font-bold text-yellow-400">{newAvgPrice.toFixed(2)}</p>
        </div>
        <div className="text-center p-4 bg-gray-900 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">จำนวนหุ้นรวม</p>
            <p className="text-2xl font-bold text-white">{totalShares.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// --- 2. เครื่องมือคำนวณกำไร (Logic เดิม 100% - แก้แค่ CSS) ---
function ProfitCalculator({ boxBorderClass, boxShadowClass }: StyleProps) {
  const [costPrice, setCostPrice] = useState("1.65");
  const [sellPrice, setSellPrice] = useState("3.50");
  const [shares, setShares] = useState("1000");

  const nCostPrice = parseFloat(costPrice) || 0;
  const nSellPrice = parseFloat(sellPrice) || 0;
  const nShares = parseFloat(shares) || 0;

  const totalCost = nCostPrice * nShares;
  const totalSell = nSellPrice * nShares;
  const netProfit = totalSell - totalCost;
  const percentProfit = (totalCost > 0) ? (netProfit / totalCost) * 100 : 0;

  return (
    <div className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}>
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        โปรแกรมคำนวณกำไร (Realized)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">ทุนซื้อ @</label>
          <input 
            type="number" 
            value={costPrice} 
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors" 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">ราคาขาย @</label>
          <input 
            type="number" 
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">จำนวนหุ้น</label>
          <input 
            type="number" 
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`} />
            <h3 className="text-lg text-gray-300">กำไร/ขาดทุน สุทธิ</h3>
        </div>
        <div className="flex items-baseline gap-3">
             <span className={`text-4xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {netProfit.toFixed(2)}
             </span>
             <span className={`text-xl ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                ({percentProfit.toFixed(2)}%)
             </span>
        </div>
      </div>
    </div>
  );
}

// --- Component หลัก ---
export default function Calculators({ status }: { status: 'profit' | 'loss' | 'even' }) {
  
  // --- คำนวณธีมสี (เหมือนหน้า Bookmark/Alerts) ---
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
    // ใส่ BG ไล่สีเต็มจอ
    <div className={`p-8 pb-32 min-h-[calc(100vh-73px)] ${pageBgClass}`}>
      <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
            <Wrench className="w-8 h-8" />
            เครื่องมือคำนวณ (Tools)
          </h1>
          
          {/* ส่ง Style ลงไปให้ Child Components */}
          <AverageCalculator boxBorderClass={boxBorderClass} boxShadowClass={boxShadowClass} />
          <ProfitCalculator boxBorderClass={boxBorderClass} boxShadowClass={boxShadowClass} />
      </div>
    </div>
  );
}

// (Import icon เพิ่มเติมสำหรับหัวข้อ)
import { Wrench } from 'lucide-react';