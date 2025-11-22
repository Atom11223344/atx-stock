// lib/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

// T คือ Generic Type, ในที่นี้มันคือ "string" (คำค้นหา)
export function useDebounce<T>(value: T, delay: number): T {
  // State ที่จะเก็บค่าที่ถูกหน่วงเวลาแล้ว
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // สร้าง timer
      const handler = setTimeout(() => {
        // เมื่อครบ 500ms (ค่า delay) ให้อัปเดต state
        setDebouncedValue(value);
      }, delay);

      // นี่คือส่วนที่สำคัญที่สุด:
      // ถ้า 'value' (คำที่พิมพ์) หรือ 'delay' เปลี่ยนแปลง "ก่อน" ที่ timer จะครบ
      // ให้ "ยกเลิก" timer เก่าทิ้งไป แล้วเริ่มนับใหม่
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Effect นี้จะรันใหม่ "ทุกครั้ง" ที่ผู้ใช้พิมพ์ (value เปลี่ยน)
  );

  // คืนค่าที่ถูกหน่วงเวลาแล้วออกไป
  return debouncedValue;
}