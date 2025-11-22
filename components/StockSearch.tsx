// components/StockSearch.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// 1. ลบ useDebounce ออก
// import { useDebounce } from '../lib/hooks/useDebounce'; 

interface TickerResult {
  ticker: string;
  name: string;
}

export function StockSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 2. ลบ const debouncedSearchTerm... ทั้งบรรทัด
  // const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 3. ลบ useEffect ที่เคยใช้ fetch ข้อมูลทิ้งทั้งหมด
  // useEffect(() => { ... }, [debouncedSearchTerm]);

  // 4. (เพิ่มใหม่) สร้างฟังก์ชันสำหรับ Submit
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ป้องกันหน้าเว็บ Refresh
    
    if (searchTerm.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setResults([]); // ล้างผลลัพธ์เก่าก่อน

    try {
      const response = await fetch(`/api/search?query=${searchTerm}`);
      const data: TickerResult[] = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (ticker: string) => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    router.push(`/stock/${ticker}?timeframe=1d`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  return (
    // 5. เปลี่ยน div นอกสุดเป็น <form> และใส่ onSubmit
    <form className="relative w-full max-w-md" ref={searchContainerRef} onSubmit={handleSearchSubmit}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        // 6. ลบ onFocus ออก (เราไม่ต้องการให้มันเปิดเมื่อคลิก)
        // onFocus={() => setIsOpen(true)} 
        placeholder="Search for a stock (e.g., AAPL)"
        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-5 h-5 border-2 border-t-blue-500 border-gray-400 rounded-full animate-spin"></div>
        </div>
      )}

      {/* 7. แก้ไขเงื่อนไขการเปิด Dropdown (ไม่ขึ้นกับ debouncedSearchTerm แล้ว) */}
      {isOpen && (results.length > 0 || isLoading) && (
        <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-400">Loading...</li>
          ) : (
            results.map((result) => (
              <li
                key={result.ticker}
                onClick={() => handleResultClick(result.ticker)}
                className="px-4 py-2 text-gray-200 cursor-pointer hover:bg-gray-700"
              >
                <span className="font-bold">{result.ticker}</span>
                <span className="ml-2 text-sm text-gray-400 truncate">{result.name}</span>
              </li>
            ))
          )}
          {/* 8. แก้ไขเงื่อนไข 'ไม่พบ' */}
          {!isLoading && results.length === 0 && searchTerm && (
             <li className="px-4 py-2 text-gray-400">No results found for "{searchTerm}"</li>
          )}
        </ul>
      )}
    </form> // <-- ปิด </form>
  );
}