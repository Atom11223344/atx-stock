"use client";

import { useState, useTransition, useRef } from "react";
import { 
  addPortfolioItemAction, 
  deletePortfolioItemAction, 
  saveSnapshotAction 
} from "@/app/portfolio/actions";
import { HistoryChartLoader } from "@/components/HistoryChartLoader";
import { Trash2, Plus, X, TrendingUp, List, History, Save } from "lucide-react";
import Link from "next/link";

// Type Definitions
interface PortfolioItem {
  id: string;
  ticker: string;
  shares: number;
  averagePrice: number;
  marketValue: number;
  pl: number;
  currentPrice: number;
}

interface Snapshot {
  id: string;
  date: Date;
  totalValue: number;
}

interface PortfolioManagerProps {
  status: 'profit' | 'loss' | 'even';
  summary: {
    marketValue: number;
    cost: number;
    pl: number;
    plPercent: number;
  };
  items: PortfolioItem[];
  snapshots: Snapshot[];
}

export function PortfolioManager({ status, summary, items, snapshots }: PortfolioManagerProps) {
  // State สำหรับ Tabs (1=Summary, 2=Chart, 3=Stats)
  const [activeTab, setActiveTab] = useState<'summary' | 'chart' | 'stats'>('summary');
  
  // State สำหรับ Modal (Add Stock)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Action States
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // --- คำนวณธีมสี (เหมือนหน้าอื่นๆ) ---
  let boxBorderClass = "border-gray-700";
  let boxShadowClass = "";
  let textAccentClass = "text-white";
  let pageBgClass = "bg-gradient-to-b from-black to-gray-900";

  if (status === 'profit') {
    boxBorderClass = "border-green-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.green.900)]";
    textAccentClass = "text-green-400";
    pageBgClass = "bg-gradient-to-b from-black via-green-950 to-black";
  } else if (status === 'loss') {
    boxBorderClass = "border-red-800";
    boxShadowClass = "shadow-[0_0_30px_5px_theme(colors.red.900)]";
    textAccentClass = "text-red-400";
    pageBgClass = "bg-gradient-to-b from-black via-red-950 to-black";
  }

  // --- Handlers ---
  const handleSaveSnapshot = () => {
    if (!confirm("บันทึกมูลค่าพอร์ตวันนี้?")) return;
    startTransition(async () => {
      const res = await saveSnapshotAction(summary.marketValue);
      alert(res?.message || "Error");
    });
  };

  const handleAddStock = async (formData: FormData) => {
    setMessage("กำลังบันทึก...");
    startTransition(async () => {
      const res = await addPortfolioItemAction(formData);
      setMessage(res.message);
      if (res.success) {
        formRef.current?.reset();
        setIsAddModalOpen(false);
        setMessage("");
      }
    });
  };

  // --- ฟังก์ชันคำนวณสถิติรายเดือน (ย้ายมาคำนวณฝั่ง Client ได้เลย) ---
  const calculateMonthlyStats = () => {
    if (snapshots.length < 2) return [];
    // (Logic เดิม - ย่อเพื่อความกระชับ)
    const monthlyGroups = new Map<string, Snapshot[]>();
    snapshots.forEach(s => {
      const k = new Date(s.date).toISOString().slice(0, 7);
      if (!monthlyGroups.has(k)) monthlyGroups.set(k, []);
      monthlyGroups.get(k)!.push(s);
    });
    const stats = [];
    const sortedMonths = Array.from(monthlyGroups.keys()).sort();
    for (let i = 1; i < sortedMonths.length; i++) {
      const currK = sortedMonths[i];
      const prevK = sortedMonths[i-1];
      const currVal = monthlyGroups.get(currK)!.sort((a, b) => b.date.getTime() - a.date.getTime())[0].totalValue;
      const prevVal = monthlyGroups.get(prevK)!.sort((a, b) => b.date.getTime() - a.date.getTime())[0].totalValue;
      const change = currVal - prevVal;
      stats.push({
        month: new Date(currK + "-02").toLocaleString('default', { month: 'short', year: 'numeric' }),
        change,
        percent: (change / prevVal) * 100
      });
    }
    return stats.reverse();
  };
  const monthlyStats = calculateMonthlyStats();


  return (
    <div className={`p-8 space-y-8 pb-32 min-h-[calc(100vh-73px)] ${pageBgClass}`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold text-white">พอร์ตโฟลิโอของฉัน</h1>
      </div>

      {/* --- BOX 1: Dashboard (รวม สรุป + กราฟ + สถิติ) --- */}
      <div className={`bg-black rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} overflow-hidden transition-all`}>
        
        {/* Tabs Header */}
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex-1 p-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'summary' ? 'bg-gray-900 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <List className="w-4 h-4" /> ภาพรวม
          </button>
          <button 
            onClick={() => setActiveTab('chart')}
            className={`flex-1 p-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chart' ? 'bg-gray-900 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <TrendingUp className="w-4 h-4" /> กราฟประวัติ
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 p-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'stats' ? 'bg-gray-900 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <History className="w-4 h-4" /> สถิติรายเดือน
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[300px]">
          
          {/* View 1: Summary */}
          {activeTab === 'summary' && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">มูลค่าพอร์ตปัจจุบัน</p>
                  <h2 className="text-5xl font-bold text-white mt-2">{summary.marketValue.toLocaleString()}</h2>
                </div>
                <button 
                  onClick={handleSaveSnapshot}
                  disabled={isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded border border-gray-600 transition-colors"
                >
                  <Save className="w-3 h-3" /> บันทึกยอดวันนี้
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-800">
                <div>
                  <p className="text-gray-400 text-sm">ต้นทุนรวม</p>
                  <p className="text-2xl text-gray-300">{summary.cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">กำไร / ขาดทุน</p>
                  <p className={`text-2xl font-bold ${textAccentClass}`}>
                    {summary.pl > 0 ? "+" : ""}{summary.pl.toLocaleString()} 
                    <span className="text-lg ml-2 opacity-80">
                      ({summary.plPercent.toFixed(2)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View 2: Chart */}
          {activeTab === 'chart' && (
            <div className="animate-fadeIn h-full">
              {snapshots.length > 0 ? (
                <HistoryChartLoader data={snapshots} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  ยังไม่มีข้อมูลประวัติ (กดบันทึกยอดเพื่อเริ่ม)
                </div>
              )}
            </div>
          )}

          {/* View 3: Stats */}
          {activeTab === 'stats' && (
            <div className="animate-fadeIn">
               <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-sm">
                    <th className="p-2">เดือน</th>
                    <th className="p-2 text-right">P/L (บาท)</th>
                    <th className="p-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((stat, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="p-3 text-gray-300">{stat.month}</td>
                      <td className={`p-3 text-right ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change > 0 ? "+" : ""}{stat.change.toLocaleString()}
                      </td>
                      <td className={`p-3 text-right ${stat.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.percent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {monthlyStats.length === 0 && (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">ต้องมีข้อมูลอย่างน้อย 2 เดือน</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {/* --- BOX 2: Stock List --- */}
      <div className={`bg-black p-6 rounded-xl border-2 ${boxBorderClass} ${boxShadowClass} transition-all`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">หุ้นที่ถืออยู่ ({items.length})</h2>
          
          {/* ปุ่ม Add Stock (+) */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-gray-600 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-3">Symbol</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Shares</th>
                <th className="p-3 text-right">Avg Cost</th>
                <th className="p-3 text-right">Value</th>
                <th className="p-3 text-right">P/L</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors group">
                  <td className="p-3 font-bold text-white">
                    <Link href={`/stock/${item.ticker}?timeframe=1d`} className="hover:text-blue-400">
                      {item.ticker}
                    </Link>
                  </td>
                  <td className="p-3 text-right text-gray-300">{item.currentPrice.toFixed(2)}</td>
                  <td className="p-3 text-right text-gray-300">{item.shares.toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-300">{item.averagePrice.toFixed(2)}</td>
                  <td className="p-3 text-right text-white font-medium">{item.marketValue.toLocaleString()}</td>
                  <td className={`p-3 text-right ${item.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.pl.toLocaleString()}
                    <div className="text-xs opacity-70">{(item.pl / (item.shares * item.averagePrice) * 100).toFixed(2)}%</div>
                  </td>
                  <td className="p-3 text-right">
                    <form action={deletePortfolioItemAction}>
                      <input type="hidden" name="ticker" value={item.ticker} />
                      <button className="text-gray-600 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                 <tr><td colSpan={7} className="p-8 text-center text-gray-500">ยังไม่มีหุ้น กด + เพื่อเพิ่ม</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modal: Add Stock --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-gray-900 w-full max-w-sm rounded-2xl border-2 ${boxBorderClass} ${boxShadowClass} p-6 relative animate-fadeIn`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">เพิ่มหุ้นเข้าพอร์ต</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form ref={formRef} action={handleAddStock} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Ticker</label>
                <input type="text" name="ticker" placeholder="e.g. AAPL" required className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:border-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm text-gray-400 block mb-1">Shares</label>
                   <input type="number" name="shares" placeholder="100" required className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:border-white outline-none" />
                </div>
                <div>
                   <label className="text-sm text-gray-400 block mb-1">Avg Price</label>
                   <input type="number" name="averagePrice" step="0.01" placeholder="150.00" required className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-lg focus:border-white outline-none" />
                </div>
              </div>

              {message && <p className="text-sm text-blue-400 text-center">{message}</p>}

              <button 
                type="submit" 
                disabled={isPending}
                className={`w-full py-3 mt-4 rounded-lg text-white font-bold transition-all ${status === 'profit' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
              >
                {isPending ? "Saving..." : "Save Stock"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}