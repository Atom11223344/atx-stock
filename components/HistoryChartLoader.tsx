// components/HistoryChartLoader.tsx

// --- "use client" อยู่บรรทัดแรกสุด! ---
"use client"; 

import dynamic from 'next/dynamic';

// 1. เราจะ "Dynamic Import" กราฟตัวจริง (HistoryChart) จากที่นี่
const DynamicHistoryChart = dynamic(
  () => import('@/components/HistoryChart').then(mod => mod.HistoryChart),
  { 
    ssr: false, // <-- ปลอดภัยแล้ว! เพราะเราอยู่ใน Client Component
    loading: () => <p className="text-center p-4">Loading History Chart...</p>
  }
);

// 2. Loader นี้มีหน้าที่แค่ส่งต่อ data ไปให้กราฟ
export function HistoryChartLoader({ data }: { data: any[] }) {
  return <DynamicHistoryChart data={data} />;
}