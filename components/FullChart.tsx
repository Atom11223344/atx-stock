"use client"; 

import {
  createChart, ColorType, Time, IChartApi, ISeriesApi,
  CandlestickSeries, LineSeries, HistogramSeries,
  CrosshairMode,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react'; 
import { useRouter, usePathname } from 'next/navigation';
import { EMA, MACD, RSI } from 'technicalindicators';
import { Settings, Check, Bookmark, BookmarkPlus } from 'lucide-react';

// --- Helper Functions (เหมือนเดิม) ---
function formatCandleData(res: any[]) { return res.map(b => ({ time: b.t / 1000 as Time, open: b.o, high: b.h, low: b.l, close: b.c })); }
function formatLineData(res: any[]) { return res.map(b => ({ time: b.t / 1000 as Time, value: b.c })); }
function calculateEMA(res: any[], period: number) { const c = res.map(b => b.c); const e = EMA.calculate({ period, values: c }); const diff = res.length - e.length; return e.map((v, i) => ({ time: res[diff + i].t / 1000 as Time, value: v })); }
function calculateRSI(res: any[]) { const c = res.map(b => b.c); const r = RSI.calculate({ period: 14, values: c }); const diff = res.length - r.length; return r.map((v, i) => ({ time: res[diff + i].t / 1000 as Time, value: v })); }
function calculateMACD(res: any[]) { const c = res.map(b => b.c); const m = MACD.calculate({ values: c, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false }); const diff = res.length - m.length; const h: any[] = [], ml: any[] = [], sl: any[] = []; m.forEach((v, i) => { const t = res[diff + i].t / 1000 as Time; if (v.histogram) h.push({ time: t, value: v.histogram, color: v.histogram > 0 ? '#26a69a' : '#ef5350' }); if (v.MACD) ml.push({ time: t, value: v.MACD }); if (v.signal) sl.push({ time: t, value: v.signal }); }); return { histogram: h, macdLine: ml, signalLine: sl }; }
function calculateHeikinAshi(data: any[]) { if (!data || data.length === 0) return []; let haData = []; if (data.length > 0 && data[0].o) { let prevHAOpen = data[0].o; let prevHAClose = data[0].c; for (const bar of data) { const haClose = (bar.o + bar.h + bar.l + bar.c) / 4; const haOpen = (prevHAOpen + prevHAClose) / 2; const haHigh = Math.max(bar.h, haOpen, haClose); const haLow = Math.min(bar.l, haOpen, haClose); haData.push({ time: (bar.t / 1000) as Time, open: haOpen, high: haHigh, low: haLow, close: haClose, }); prevHAOpen = haOpen; prevHAClose = haClose; } } return haData; }

export function FullChart({ data, currentTf }: { data: any, currentTf: string }) {
  
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const macdChartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  
  const [chartType, setChartType] = useState('Candle');
  const [showSettings, setShowSettings] = useState(false);
  const [indicators, setIndicators] = useState({ ema: true, macd: false, rsi: false });
  
  const router = useRouter();
  const pathname = usePathname();
  const ticker = pathname.split('/')[2]?.toUpperCase() || "STOCK";
  const currentPrice = data.results && data.results.length > 0 ? data.results[data.results.length - 1].c : 0;
  
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!mainChartContainerRef.current || !data || !data.results) return;
    
    const cleanup = () => { 
      if (mainChart) mainChart.remove();
      if (macdChart) macdChart.remove();
      if (rsiChart) rsiChart.remove();
    };
    
    // 1. Main Chart
    const mainChart = createChart(mainChartContainerRef.current, { 
      width: mainChartContainerRef.current.clientWidth, 
      height: 500,
      layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: 'rgba(255, 255, 255, 0.9)' }, 
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } }, 
      crosshair: { mode: CrosshairMode.Normal }, 
      timeScale: { timeVisible: true, secondsVisible: false }, 
      rightPriceScale: { width: 70, borderColor: '#374151' } 
    } as any);

    if (chartType === 'Line') {
      const lineSeries = mainChart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2 });
      lineSeries.setData(formatLineData(data.results));
    } else {
      const candleSeries = mainChart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
      const formattedData = (chartType === 'HeikinAshi') ? calculateHeikinAshi(data.results) : formatCandleData(data.results);
      if (formattedData.length > 0) candleSeries.setData(formattedData);
    }

    if (indicators.ema) {
      mainChart.addSeries(LineSeries, { color: '#fbbf24', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 50));
      mainChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 100));
      mainChart.addSeries(LineSeries, { color: '#ffffff', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(calculateEMA(data.results, 200));
    }

    // 2. MACD
    let macdChart: IChartApi | null = null;
    if (indicators.macd && macdChartContainerRef.current) {
      macdChart = createChart(macdChartContainerRef.current, { 
        width: macdChartContainerRef.current.clientWidth, 
        height: 200, 
        layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: 'rgba(255, 255, 255, 0.9)' }, 
        grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } }, 
        crosshair: { mode: CrosshairMode.Normal }, 
        timeScale: { visible: false }, 
        rightPriceScale: { width: 70, borderColor: '#374151' } 
      } as any);
      const { histogram, macdLine, signalLine } = calculateMACD(data.results);
      macdChart.addSeries(HistogramSeries, { color: '#26a69a', priceFormat: { type: 'volume' }, priceLineVisible: false }).setData(histogram);
      macdChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceLineVisible: false }).setData(macdLine);
      macdChart.addSeries(LineSeries, { color: '#ef5350', lineWidth: 2, priceLineVisible: false }).setData(signalLine);
    }

    // 3. RSI
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
      } as any);
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 2, priceLineVisible: false });
      rsiSeries.setData(calculateRSI(data.results));
      rsiSeries.createPriceLine({ price: 70, color: 'red', lineStyle: 2, title: 'OB' });
      rsiSeries.createPriceLine({ price: 30, color: 'green', lineStyle: 2, title: 'OS' });
    }

    // Sync Charts
    const charts = [mainChart, macdChart, rsiChart].filter(c => c !== null) as IChartApi[];
    if (charts.length > 1) {
      charts[0].timeScale().subscribeVisibleTimeRangeChange(range => {
        if (range) {
          charts.forEach(c => {
            if (c !== charts[0]) c.timeScale().setVisibleRange(range);
          });
        }
      });
    }
    
    mainChart.timeScale().fitContent();

    return cleanup;
  }, [data, chartType, indicators]);

  const handleTimeframeChange = (newTf: string) => {
    router.push(`${pathname}?timeframe=${newTf}`);
  };
  const toggleIndicator = (key: 'ema' | 'macd' | 'rsi') => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // สไตล์ปุ่ม Timeframe
  const tfButtonClass = (tf: string) => 
    `px-4 py-1.5 text-sm font-bold rounded-lg transition-all border ${
      currentTf === tf 
      ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]" 
      : "bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="space-y-4">
      
      {/* --- 1. (ใหม่) Timeframe Bar (ย้ายมาไว้ข้างบนสุด) --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['1m', '1h', '4h', '1d', '1w', '1M'].map((tf) => (
          <button 
            key={tf} 
            onClick={() => handleTimeframeChange(tf)} 
            className={tfButtonClass(tf)}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- 2. BOX 1: กราฟหลัก --- */}
      <div className="bg-black rounded-xl border-2 border-gray-800 overflow-hidden shadow-2xl relative">
        
        {/* Header ภายในกราฟ */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700">
            <h1 className="text-3xl font-bold text-white tracking-wider">{ticker}</h1>
            <div className="text-xl font-mono text-green-400">${currentPrice.toFixed(2)}</div>
          </div>
          
          <div className="flex gap-2 pointer-events-auto relative">
            <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-2.5 rounded-lg border transition-all ${isBookmarked ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800'}`}>
                {isBookmarked ? <Bookmark className="w-6 h-6 fill-black" /> : <BookmarkPlus className="w-6 h-6" />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-lg border transition-all ${showSettings ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800'}`}>
              <Settings className="w-6 h-6" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-14 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 z-30 animate-fadeIn">
                <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Chart Type</p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {['Candle', 'Line', 'HeikinAshi'].map(type => (
                    <button key={type} onClick={() => setChartType(type)} className={`p-2 text-xs font-bold rounded border transition-colors ${chartType === type ? 'bg-blue-600 text-white border-blue-500' : 'bg-black text-gray-400 border-gray-800 hover:bg-gray-800'}`}>{type === 'HeikinAshi' ? 'HA' : type}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Indicators</p>
                <div className="space-y-2">
                  <button onClick={() => toggleIndicator('ema')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group"><span className="text-sm text-gray-300 group-hover:text-white">EMA</span>{indicators.ema && <Check className="w-4 h-4 text-green-400" />}</button>
                  <button onClick={() => toggleIndicator('macd')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group"><span className="text-sm text-gray-300 group-hover:text-white">MACD</span>{indicators.macd && <Check className="w-4 h-4 text-green-400" />}</button>
                  <button onClick={() => toggleIndicator('rsi')} className="w-full flex justify-between items-center p-2 rounded bg-black border border-gray-800 hover:border-gray-600 group"><span className="text-sm text-gray-300 group-hover:text-white">RSI</span>{indicators.rsi && <Check className="w-4 h-4 text-green-400" />}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div ref={mainChartContainerRef} className="w-full h-[500px]" />
      </div>

      {/* --- BOX 2: Indicators --- */}
      <div className="grid grid-cols-1 gap-4">
         {indicators.macd && <div className="bg-black rounded-xl border border-gray-800 p-1 relative h-[200px]"><span className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 z-10">MACD</span><div ref={macdChartContainerRef} className="w-full h-full" /></div>}
         {indicators.rsi && <div className="bg-black rounded-xl border border-gray-800 p-1 relative h-[150px]"><span className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 z-10">RSI</span><div ref={rsiChartContainerRef} className="w-full h-full" /></div>}
      </div>

      {/* (ลบแถบ Timeframe ล่างสุดออกแล้ว) */}
    </div>
  );
}