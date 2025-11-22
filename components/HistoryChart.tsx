// components/HistoryChart.tsx

"use client"; // กราฟต้องเป็น Client

import {
  createChart,
  ColorType,
  Time,
  IChartApi,
  ISeriesApi,
  LineSeries,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

// ฟังก์ชันแปลงข้อมูล (จาก Snapshot -> กราฟ)
function formatChartData(snapshots: any[]) {
  if (!snapshots || snapshots.length === 0) {
    return [];
  }
  // เราต้องเรียงข้อมูลตามวันที่ก่อน
  const sortedData = snapshots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return sortedData.map(snapshot => ({
    time: (new Date(snapshot.date).getTime() / 1000) as Time, // แปลง Date -> timestamp (วินาที)
    value: snapshot.totalValue, // มูลค่าพอร์ต
  }));
}

// Component วาดกราฟเส้น
export function HistoryChart({ data }: { data: any[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) {
      return;
    }

    const chart: IChartApi = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300, // กราฟประวัติ
    });

    // --- 1. วาดกราฟเส้น (Line Series) ---
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#00BFFF', // สีฟ้า
      lineWidth: 2,
    });

    const formattedData = formatChartData(data);
    lineSeries.setData(formattedData);

    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [data]); 

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-[300px] border border-gray-700 rounded-lg mt-4"
    />
  );
}