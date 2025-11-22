"use client"; 

import {
  createChart, ColorType, Time, IChartApi, ISeriesApi,
  CandlestickSeries, LineSeries, HistogramSeries,
  CrosshairMode,
} from 'lightweight-charts';
import { useEffect, useRef, useState, useMemo } from 'react'; 
import { useRouter, usePathname } from 'next/navigation';
import { EMA, MACD, RSI } from 'technicalindicators';
// Import Icons
import { Settings, ChevronDown, BarChart2, Check } from 'lucide-react';

// --- (ฟังก์ชันคำนวณ Helper เดิม - ผมละไว้เพื่อความกระชับ คุณใช้โค้ดเดิมต่อได้เลย) ---
// ... formatCandleData, formatLineData, calculateHeikinAshi, calculateEMA, calculateMACD, calculateRSI ...
// (ถ้าคุณลบไปแล้ว บอกผมนะครับ เดี๋ยวผมส่งฟังก์ชันพวกนี้ให้ใหม่)

// --- (สมมติว่าคุณมีฟังก์ชันคำนวณอยู่แล้วข้างบนนี้) ---
// ...

// --- Mock Functions (เผื่อคุณไม่มี) ---
function formatCandleData(res: any[]) { return res.map(b => ({ time: b.t / 1000 as Time, open: b.o, high: b.h, low: b.l, close: b.c })); }
function formatLineData(res: any[]) { return res.map(b => ({ time: b.t / 1000 as Time, value: b.c })); }
function calculateEMA(res: any[], period: number) { const c = res.map(b => b.c); const e = EMA.calculate({ period, values: c }); const diff = res.length - e.length; return e.map((v, i) => ({ time: res[diff + i].t / 1000 as Time, value: v })); }
function calculateRSI(res: any[]) { const c = res.map(b => b.c); const r = RSI.calculate({ period: 14, values: c }); const diff = res.length - r.length; return r.map((v, i) => ({ time: res[diff + i].t / 1000 as Time, value: v })); }
function calculateMACD(res: any[]) { const c = res.map(b => b.c); const m = MACD.calculate({ values: c, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false }); const diff = res.length - m.length; const h: any[] = [], ml: any[] = [], sl: any[] = []; m.forEach((v, i) => { const t = res[diff + i].t / 1000 as Time; if (v.histogram) h.push({ time: t, value: v.histogram, color: v.histogram > 0 ? '#26a69a' : '#ef5350' }); if (v.MACD) ml.push({ time: t, value: v.MACD }); if (v.signal) sl.push({ time: t, value: v.signal }); }); return { histogram: h, macdLine: ml, signalLine: sl }; }
function calculateHeikinAshi(data: any[]) { if (!data || data.length === 0) return []; let haData = []; if (data.length > 0 && data[0].o) { let prevHAOpen = data[0].o; let prevHAClose = data[0].c; for (const bar of data) { const haClose = (bar.o + bar.h + bar.l + bar.c) / 4; const haOpen = (prevHAOpen + prevHAClose) / 2; const haHigh = Math.max(bar.h, haOpen, haClose); const haLow = Math.min(bar.l, haOpen, haClose); haData.push({ time: (bar.t / 1000) as Time, open: haOpen, high: haHigh, low: haLow, close: haClose, }); prevHAOpen = haOpen; prevHAClose = haClose; } } return haData; }
// -------------------------------------------------------


export function FullChart({ data, currentTf }: { data: any, currentTf: string }) {
  
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const macdChartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  
  // State สำหรับการตั้งค่ากราฟ
  const [chartType, setChartType] = useState('Candle');
  const [showSettings, setShowSettings] = useState(false); // เปิด/ปิดเมนูฟันเฟือง
  
  // State สำหรับเปิด/ปิด Indicator (ตาม Sketch)
  const [indicators, setIndicators] = useState({
    ema: true,
    macd: true,
    rsi: true
  });
  
  const router = useRouter();
  const pathname = usePathname();
  const ticker = pathname.split('/')[2]?.toUpperCase() || "STOCK"; // ดึง Ticker จาก URL
  const currentPrice = data.results[data.results.length - 1]?.c || 0; // ราคาล่าสุด

  // --- useEffect วาดกราฟ ---
  useEffect(() => {
    if (!mainChartContainerRef.current || !data || !data.results) return;

    // 1. สร้าง Main Chart
    const mainChart = createChart(mainChartContainerRef.current, { 
      width: mainChartContainerRef.current.clientWidth, 
      height: 500, // ความสูงเริ่มต้น (อาจปรับได้)
      layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: 'rgba(255, 255, 255, 0.9)' }, 
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } }, 
      crosshair: { mode: CrosshairMode.Normal }, 
      timeScale: { timeVisible: true, secondsVisible: false }, 
      rightPriceScale: { width: 70, borderColor: '#374151' } 
    });

    // Add Series (Candle/Line/HA)
    if (chartType === 'Line') {
      const lineSeries = mainChart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2 });
      lineSeries.setData(formatLineData(data.results));
    } else {
      const candleSeries = mainChart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
      const formattedData = (chartType === 'HeikinAshi') ? calculateHeikinAshi(data.results) : formatCandleData(data.results);
      if (formattedData.length > 0) candleSeries.setData(formattedData);
    }

    // Add EMA (ถ้าเปิด)
    if (indicators.ema) {
      mainChart.addSeries(LineSeries, { color: '#fbbf24', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 50));
      mainChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 100));
      mainChart.addSeries(LineSeries, { color: '#ffffff', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 200));
    }

    // 2. สร้าง MACD Chart (ถ้าเปิด)
    let macdChart: IChartApi | null = null;
    if (indicators.macd && macdChartContainerRef.current) {
      macdChart = createChart(macdChartContainerRef.current, { 
        width: macdChartContainerRef.current.clientWidth, 
        height: 200, 
        layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: 'rgba(255, 255, 255, 0.9)' }, 
        grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } }, 
        crosshair: { mode: CrosshairMode.Normal }, 
        timeScale: { visible: false }, // ซ่อนเวลา (ให้ใช้ของ Main)
        rightPriceScale: { width: 70, borderColor: '#374151' } 
      });
      const { histogram, macdLine, signalLine } = calculateMACD(data.results);
      macdChart.addSeries(HistogramSeries, { color: '#26a69a', priceFormat: { type: 'volume' }, priceLineVisible: false }).setData(histogram);
      macdChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceLineVisible: false }).setData(macdLine);
      macdChart.addSeries(LineSeries, { color: '#ef5350', lineWidth: 2, priceLineVisible: false }).setData(signalLine);
    }

    // 3. สร้าง RSI Chart (ถ้าเปิด)
    let rsiChart: IChartApi | null = null;
    if (indicators.rsi && rsiChartContainerRef.current) {
      rsiChart = createChart(rsiChartContainerRef.current, { 
        width: rsiChartContainerRef.current.clientWidth, 
        height: 150, 
        layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: 'rgba(255, 255, 255, 0.9)' }, 
        grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } }, 
        rightPriceScale: { width: 70, borderColor: '#374151', minimumValue: 0, maximumValue: 100 }, 
        crosshair: { mode: CrosshairMode.Normal }, 
        timeScale: { visible: false } 
      });
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 2, priceLineVisible: false });
      rsiSeries.setData(calculateRSI(data.results));
      rsiSeries.createPriceLine({ price: 70, color: 'red', lineStyle: 2, title: 'OB' });
      rsiSeries.createPriceLine({ price: 30, color: 'green', lineStyle: 2, title: 'OS' });
    }

    // Sync Charts
    const charts = [mainChart, macdChart, rsiChart].filter(c => c !== null) as IChartApi[];
    if (charts.length > 1) {
      charts[0].timeScale().subscribeVisibleTimeRangeChange(range => {
        charts.forEach(c => c !== charts[0] && c.timeScale().applyOptions({ visibleTimeRange: range }));
      });
      charts[0].subscribeCrosshairMove(param => {
        charts.forEach(c => c !== charts[0] && c.applyOptions({ crosshair: { time: param.time || undefined } }));
      });
    }
    
    mainChart.timeScale().fitContent();

    return () => { 
      mainChart.remove(); 
      if (macdChart) macdChart.remove(); 
      if (rsiChart) rsiChart.remove(); 
    };
  }, [data, chartType, indicators]); // รันใหม่เมื่อ indicators เปลี่ยน

  const handleTimeframeChange = (newTf: string) => {
    router.push(`${pathname}?timeframe=${newTf}`);
  };

  // สไตล์ปุ่ม Timeframe
  const tfButtonClass = (tf: string) => 
    `px-4 py-2 text-sm font-bold rounded-full transition-all border ${
      currentTf === tf 
      ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]" 
      : "bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
    }`;

  // ฟังก์ชันสลับ Indicator
  const toggleIndicator = (key: 'ema' | 'macd' | 'rsi') => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative bg-black border-2 border-gray-800 rounded-xl shadow-2xl overflow-hidden">
      
      {/* --- HEADER (ชื่อหุ้น + ราคา + Settings) --- */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">
        
        {/* ซ้าย: ชื่อหุ้น */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-white tracking-wider">{ticker}</h1>
          <div className="text-xl font-mono text-green-400">${currentPrice.toFixed(2)}</div>
        </div>

        {/* ขวา: ปุ่ม Settings (ฟันเฟือง) */}
        <div className="pointer-events-auto relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-lg border transition-all ${showSettings ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-gray-900 text-gray-300 border-gray-700 hover:text-white'}`}
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Dropdown Menu */}
          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 z-30 animate-fadeIn">
              
              {/* 1. Chart Type */}
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Chart Type</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['Candle', 'Line', 'HeikinAshi'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`p-2 text-xs font-bold rounded border transition-colors ${chartType === type ? 'bg-blue-600 text-white border-blue-500' : 'bg-black text-gray-400 border-gray-800 hover:bg-gray-800'}`}
                  >
                    {type === 'HeikinAshi' ? 'HA' : type}
                  </button>
                ))}
              </div>

              {/* 2. Indicators (Toggles) */}
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Indicators</p>
              <div className="space-y-2">
                <button onClick={() => toggleIndicator('ema')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group">
                  <span className="text-sm text-gray-300 group-hover:text-white">EMA (50/100/200)</span>
                  {indicators.ema && <Check className="w-4 h-4 text-green-400" />}
                </button>
                <button onClick={() => toggleIndicator('macd')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group">
                  <span className="text-sm text-gray-300 group-hover:text-white">MACD</span>
                  {indicators.macd && <Check className="w-4 h-4 text-green-400" />}
                </button>
                <button onClick={() => toggleIndicator('rsi')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group">
                  <span className="text-sm text-gray-300 group-hover:text-white">RSI</span>
                  {indicators.rsi && <Check className="w-4 h-4 text-green-400" />}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* --- CHART AREA --- */}
      <div className="flex flex-col">
        {/* Main Chart */}
        <div ref={mainChartContainerRef} className="w-full" />
        
        {/* Indicators (Conditional Rendering) */}
        {indicators.macd && (
          <div className="border-t border-gray-800 relative">
            <span className="absolute top-1 left-2 text-[10px] font-bold text-gray-500 z-10">MACD (12, 26, 9)</span>
            <div ref={macdChartContainerRef} className="w-full" />
          </div>
        )}
        {indicators.rsi && (
          <div className="border-t border-gray-800 relative">
            <span className="absolute top-1 left-2 text-[10px] font-bold text-gray-500 z-10">RSI (14)</span>
            <div ref={rsiChartContainerRef} className="w-full" />
          </div>
        )}
      </div>

      {/* --- TIMEFRAME BAR (ล่างสุด) --- */}
      <div className="bg-black border-t border-gray-800 p-2 flex justify-center gap-2 overflow-x-auto">
        {['1m', '1h', '4h', '1d', '1w', '1M'].map((tf) => (
          <button key={tf} onClick={() => handleTimeframeChange(tf)} className={tfButtonClass(tf)}>
            {tf.toUpperCase()}
          </button>
        ))}
      </div>

    </div>
  );
}