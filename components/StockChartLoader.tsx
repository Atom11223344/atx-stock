// components/StockChartLoader.tsx

"use client"; 

import dynamic from 'next/dynamic';

// 1. โหลด "FullChart" (เหมือนเดิม)
const DynamicFullChart = dynamic(
  () => import('./FullChart').then(mod => mod.FullChart),
  { 
    ssr: false, 
    loading: () => (
      <div className="space-y-4">
        {/* ... (Skeleton UI เหมือนเดิม) ... */}
      </div>
    )
  }
);

// 2. Loader (รับ Prop "currentTf" ใหม่)
export function StockChartLoader({ 
  data, 
  currentTf 
}: { 
  data: any, 
  currentTf: string // <-- Prop ใหม่
}) {
  
  return (
    <DynamicFullChart 
      data={data} 
      currentTf={currentTf} // <-- ส่ง Prop ต่อไป
    />
  );
}