// components/AlertForm.tsx
"use client";

import { useState, useTransition } from 'react';
import type { AlertActionResponse } from "@/app/alerts/actions";

export function AlertForm({ 
  onAddAlert 
}: { 
  onAddAlert: (formData: FormData) => Promise<AlertActionResponse>;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition(); 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); 
    
    startTransition(async () => {
      setMessage("กำลังบันทึก...");
      const result = await onAddAlert(formData);
      setMessage(result.message);
      if (result.success) {
        (event.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ช่อง Ticker */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Ticker</label>
          <input 
            type="text" 
            name="ticker" 
            placeholder="e.g. AAPL"
            required
            className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* ช่อง Target Price (เอา Condition ออกแล้ว) */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Target Price</label>
          <input 
            type="number" 
            step="0.01"
            name="targetPrice" 
            placeholder="0.00"
            required
            className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className={`text-sm ${message.includes('สำเร็จ') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
        <button 
          type="submit" 
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 shadow-md"
        >
          {isPending ? "Saving..." : "Create Alert"}
        </button>
      </div>
    </form>
  );
}