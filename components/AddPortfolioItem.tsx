// components/AddPortfolioItem.tsx

"use client"; // นี่คือฟอร์ม ต้องเป็น Client Component

import { useState } from 'react';

// เราจะรับ "Server Action" (ฟังก์ชัน) เข้ามาทาง props
export function AddPortfolioItem({ 
  onAddItem 
}: { 
  onAddItem: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}) {
  
  // --- ใช้ string state (ตามที่เราตกลง) เพื่อแก้ปัญหา UX เลข 0 ---
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  
  const [message, setMessage] = useState(""); // สำหรับแสดงผลลัพธ์

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ป้องกันเว็บรีโหลด
    setMessage("กำลังบันทึก...");

    // สร้าง FormData เพื่อส่งให้ Server Action
    const formData = new FormData();
    formData.append("ticker", ticker.toUpperCase());
    formData.append("shares", shares);
    formData.append("averagePrice", price);
    
    // เรียก Server Action (ที่อยู่ใน page.tsx)
    const result = await onAddItem(formData);

    if (result.success) {
      setMessage("บันทึกสำเร็จ!");
      // ล้างฟอร์ม
      setTicker("");
      setShares("");
      setPrice("");
    } else {
      setMessage(`เกิดข้อผิดพลาด: ${result.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-bold">เพิ่ม / แก้ไข หุ้นในพอร์ต</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Ticker (ชื่อหุ้น)</label>
          <input 
            type="text" 
            placeholder="เช่น GOOG"
            value={ticker} 
            onChange={(e) => setTicker(e.target.value)}
            className="w-full p-2 rounded bg-gray-700" 
            required
          />
        </div>
        <div>
          <label className="block text-sm">จำนวน (หุ้น)</label>
          <input 
            type="number" 
            step="any" // อนุญาตทศนิยม
            placeholder="10"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm">ทุนเฉลี่ย @</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="150.25"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>
      </div>
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        บันทึกรายการ
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}