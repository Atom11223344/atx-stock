// components/BookmarkManager.tsx

"use client";

import { useState, useRef, useTransition } from "react";
import type { BookmarkList, BookmarkItem } from "@prisma/client";
import { 
  createListAction, 
  deleteListAction, 
  addStockToListAction,
  deleteStockFromListAction,
  ActionResponse 
} from "@/app/bookmarks/actions";
import { Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

type BookmarkListWithItems = BookmarkList & {
  items: BookmarkItem[];
};

interface BookmarkManagerProps {
  lists: BookmarkListWithItems[];
  priceMap: { [ticker: string]: number };
  status: 'profit' | 'loss' | 'even';
}

export function BookmarkManager({ lists, priceMap, status }: BookmarkManagerProps) {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const listFormRef = useRef<HTMLFormElement>(null);

  const [addStockModalListId, setAddStockModalListId] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const stockFormRef = useRef<HTMLFormElement>(null);
  
  const [isPending, startTransition] = useTransition();

  // --- 1. สไตล์สำหรับ "กล่อง" (Box) ---
  let boxBorderClass = "border-gray-700";
  let boxShadowClass = "";
  let buttonColorClass = "bg-blue-600 hover:bg-blue-700";

  // --- 2. สไตล์สำหรับ "พื้นหลังหน้าเว็บ" (Page BG) ---
  // (แก้จาก BG ขาว -> BG ไล่สี ตาม P/L)
  let pageBgClass = "bg-gradient-to-b from-black to-gray-900"; // Default

  if (status === 'profit') {
    // กำไร: กล่องขอบเขียว + พื้นหลังไล่สีเขียว
    boxBorderClass = "border-green-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.green.900)]"; 
    buttonColorClass = "bg-green-700 hover:bg-green-600";
    pageBgClass = "bg-gradient-to-b from-black via-green-950 to-black";
  } else if (status === 'loss') {
    // ขาดทุน: กล่องขอบแดง + พื้นหลังไล่สีแดง
    boxBorderClass = "border-red-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.red.900)]";
    buttonColorClass = "bg-red-700 hover:bg-red-600";
    pageBgClass = "bg-gradient-to-b from-black via-red-950 to-black";
  }

  // Actions... (เหมือนเดิม)
  const handleCreateList = async (formData: FormData) => {
    setListError(null); 
    startTransition(async () => {
      const result: ActionResponse = await createListAction(formData);
      if (result.success) {
        setIsListModalOpen(false);
        listFormRef.current?.reset();
      } else {
        setListError(result.message);
      }
    });
  };

  const handleDeleteList = async (formData: FormData) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าจะลบ List นี้?")) return;
    startTransition(async () => { await deleteListAction(formData); });
  };

  const handleAddStock = async (formData: FormData) => {
    setStockError(null);
    startTransition(async () => {
      const result: ActionResponse = await addStockToListAction(formData);
      if (result.success) {
        setAddStockModalListId(null); stockFormRef.current?.reset();
      } else {
        setStockError(result.message);
      }
    });
  };

  const handleDeleteStock = async (formData: FormData) => {
    startTransition(async () => { await deleteStockFromListAction(formData); });
  };


  return (
    // --- 3. ใช้ 'pageBgClass' ตรงนี้ (เพื่อให้เต็มจอ) ---
    <div className={`p-8 space-y-8 pb-32 min-h-[calc(100vh-73px)] ${pageBgClass}`}>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">รายการโปรด (Bookmarks)</h1>
        <button
          onClick={() => { setIsListModalOpen(true); setListError(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${buttonColorClass} shadow-lg`}
        >
          <Plus className="w-5 h-5" />
          Create new list
        </button>
      </div>

      <div className="space-y-6">
        {lists.length === 0 ? (
          <p className="text-gray-400 text-center">คุณยังไม่มี Bookmark List</p>
        ) : (
          lists.map((list) => (
            <div 
              key={list.id} 
              // กล่องสีดำ + ขอบเรืองแสง
              className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{list.name}</h2>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setAddStockModalListId(list.id); setStockError(null); }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  
                  <form action={handleDeleteList}>
                    <input type="hidden" name="listId" value={list.id} />
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="text-gray-500 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-800">
                {list.items.length === 0 ? (
                  <p className="text-gray-600 text-sm py-2">... List นี้ว่างเปล่า ...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {list.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded border border-gray-800 hover:border-gray-600 transition-colors">
                        <Link href={`/stock/${item.ticker}?timeframe=1d`} className="flex-1 truncate">
                          <span className="font-bold text-white hover:text-blue-400 transition-colors">
                            {item.ticker}
                          </span>
                        </Link>
                        <span className="text-sm text-gray-300 w-20 text-right font-mono">
                          {priceMap[item.ticker] ? priceMap[item.ticker].toFixed(2) : '...'}
                        </span>
                        <form action={handleDeleteStock} className="ml-2">
                          <input type="hidden" name="itemId" value={item.id} />
                          <button 
                            type="submit" 
                            disabled={isPending}
                            className="text-gray-600 hover:text-red-500 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* (Modals - ปรับสี BG และขอบให้เข้าธีม) */}
      {isListModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`bg-gray-900 w-full max-w-sm m-4 rounded-2xl border-2 ${boxBorderClass} ${boxShadowClass} p-6 relative`}>
            <h2 className="text-xl font-bold mb-4 text-white">New List</h2>
            <form ref={listFormRef} action={handleCreateList}>
              <input
                type="text"
                name="listName"
                placeholder="List Name..."
                required
                className="w-full px-4 py-2 text-white bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
              />
              {listError && <p className="text-red-400 text-sm mt-2">{listError}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsListModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-4 py-2 text-white rounded-lg ${buttonColorClass}`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addStockModalListId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`bg-gray-900 w-full max-w-sm m-4 rounded-2xl border-2 ${boxBorderClass} ${boxShadowClass} p-6 relative`}>
            <h2 className="text-xl font-bold mb-4 text-white">Add Stock</h2>
            <form ref={stockFormRef} action={handleAddStock}>
              <input type="hidden" name="listId" value={addStockModalListId} />
              <input
                type="text"
                name="ticker"
                placeholder="Ticker (e.g. AAPL)"
                required
                className="w-full px-4 py-2 text-white bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
              />
              {stockError && <p className="text-red-400 text-sm mt-2">{stockError}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAddStockModalListId(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-4 py-2 text-white rounded-lg ${buttonColorClass}`}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}