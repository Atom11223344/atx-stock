// components/AlertItem.tsx
"use client"; 

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import type { AlertActionResponse } from "@/app/alerts/actions";

export function AlertItem({ 
  alert,
  onDeleteAlert
}: { 
  alert: { id: string, ticker: string, targetPrice: number };
  onDeleteAlert: (alertId: string) => Promise<AlertActionResponse>;
}) {
  
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`ลบการแจ้งเตือน ${alert.ticker}?`)) {
      startTransition(async () => {
        await onDeleteAlert(alert.id);
      });
    }
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
      <td className="p-3">
        <span className="font-bold text-white bg-gray-800 px-2 py-1 rounded border border-gray-600">
          {alert.ticker}
        </span>
      </td>
      {/* เอา column condition ออก */}
      <td className="p-3 text-white font-mono text-lg">
        {alert.targetPrice.toFixed(2)}
      </td>
      <td className="p-3 text-right">
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="text-gray-500 hover:text-red-500 disabled:opacity-50 p-2 rounded-full hover:bg-gray-800 transition-all"
          title="ลบ"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}