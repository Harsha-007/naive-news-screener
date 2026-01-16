import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, AlertCircle, Clock, Zap, BarChart3, Moon, Sun, Share2, Send, Mail } from 'lucide-react';
import { fetchMarketAnalysis } from './services/geminiService';
import { MarketCap, StockData, MarketResponse } from './types';
import { MarketSelector } from './components/MarketSelector';
import { StockCard } from './components/StockCard';
import { StockDetailModal } from './components/StockDetailModal';

// Reduced refresh time to 7.5 minutes (450,000 ms)
const REFRESH_INTERVAL = 7.5 * 60 * 1000;

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marketResponse, setMarketResponse] = useState<MarketResponse | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const [currentCountry, setCurrentCountry] = useState('USA');
  const [currentMarket, setCurrentMarket] = useState('NYSE/NASDAQ');
  
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(REFRESH_INTERVAL);
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const loadData = useCallback(async (country: string, market: string) => {
    setLoading(true);
    setError(null);
    setMarketResponse(null);
    
    try {
      const data = await fetchMarketAnalysis(country, market);
      setMarketResponse(data);
      setLastUpdated(new Date());
      setNextUpdateIn(REFRESH_INTERVAL);
      
      if (data.stocks.length === 0) {
        setError("AI found no trending stocks. The market might be quiet.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to fetch market sentiment. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentCountry, currentMarket);

    timerRef.current = window.setInterval(() => {
      loadData(currentCountry, currentMarket);
    }, REFRESH_INTERVAL);

    countdownRef.current = window.setInterval(() => {
      setNextUpdateIn(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, [currentCountry, currentMarket, loadData]);

  const handleRefresh = () => {
    loadData(currentCountry, currentMarket);
  };

  const generateReport = () => {
    if (!marketResponse) return "";
    let report = `🚀 *SentimenTrade AI Report* - ${new Date().toLocaleDateString()}\n`;
    report += `🌍 Market: ${currentCountry} (${currentMarket})\n`;
    report += `📢 Mood: ${marketResponse.marketSummary}\n\n`;

    const cats = categorizeStocks(marketResponse.stocks);
    
    const addSection = (title: string, stocks: StockData[]) => {
      if (stocks.length === 0) return;
      report += `🔹 *${title.toUpperCase()}*\n`;
      stocks.forEach(s => {
        report += `${s.ticker} (${s.change}): ${s.signal} - Sentiment: ${s.sentimentScore}/100\n`;
      });
      report += `\n`;
    };

    addSection("Large Cap", cats.large);
    addSection("Mid Cap", cats.mid);
    addSection("Small Cap", cats.small);
    
    report += `Check full details on SentimenTrade AI!`;
    return encodeURIComponent(report);
  };

  const shareToTelegram = () => {
    const text = generateReport();
    window.open(`https://t.me/share/url?url=${window.location.href}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToEmail = () => {
    const text = generateReport();
    window.location.href = `mailto:?subject=Daily Stock Sentiment Report&body=${text}`;
    setShowShareMenu(false);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const categorizeStocks = (stocks: StockData[]) => {
    return {
      large: stocks.filter(s => s.marketCapCategory === MarketCap.Large),
      mid: stocks.filter(s => s.marketCapCategory === MarketCap.Mid),
      small: stocks.filter(s => s.marketCapCategory === MarketCap.Small),
    };
  };

  const categorizedStocks = marketResponse ? categorizeStocks(marketResponse.stocks) : { large: [], mid: [], small: [] };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] text-gray-900 dark:text-slate-100 font-sans pb-20 transition-colors duration-500">
      
      {/* Premium Navbar */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-slate-900 p-2 rounded-lg ring-1 ring-gray-900/5 dark:ring-white/10">
                  <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  SentimenTrade<span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </h1>
                <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 tracking-wider uppercase">
                  News & Social Screener
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden lg:flex items-center text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                Refresh in: {formatTime(nextUpdateIn)}
              </div>
              
              <MarketSelector 
                currentCountry={currentCountry}
                onSelect={(c, m) => {
                    if (c !== currentCountry) {
                      setCurrentCountry(c);
                      setCurrentMarket(m);
                    }
                }}
                disabled={loading}
              />
              
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-200/50 dark:bg-slate-800/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-all border border-transparent hover:border-gray-300 dark:hover:border-slate-600"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className={`p-2.5 rounded-xl transition-all border border-transparent flex items-center gap-2 ${showShareMenu ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'bg-gray-200/50 dark:bg-slate-800/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-1">
                      <button onClick={shareToTelegram} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                        <Send className="w-4 h-4" /> Telegram
                      </button>
                      <button onClick={shareToEmail} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                        <Mail className="w-4 h-4" /> Email
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Market Summary */}
        <div className="mb-10 group">
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="relative p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sentiment Pulse: {currentCountry}</h2>
                </div>
                {loading && !marketResponse ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center animate-pulse">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Scanning Social Media & News...
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Analyzing {currentCountry} market trends
                    </p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
                      {marketResponse?.marketSummary || "Analysis pending..."}
                    </p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-rose-900/10 border border-red-200 dark:border-rose-800/30 rounded-xl flex items-center text-red-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Screener Columns */}
        {loading && !marketResponse ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="space-y-4">
                 <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
                 {[1, 2, 3].map(j => (
                   <div key={j} className="h-44 bg-gray-100 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
                 ))}
               </div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Columns */}
            {[
              { title: "Large Cap", data: categorizedStocks.large, color: "indigo" },
              { title: "Mid Cap", data: categorizedStocks.mid, color: "violet" },
              { title: "Small Cap", data: categorizedStocks.small, color: "emerald" }
            ].map((col) => (
              <div key={col.title} className="flex flex-col space-y-5">
                <div className={`flex items-center justify-between pb-3 border-b border-${col.color}-200 dark:border-${col.color}-500/30`}>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100 tracking-tight">{col.title}</h3>
                  <span className={`text-xs font-bold font-mono px-2 py-1 bg-${col.color}-100 dark:bg-${col.color}-500/10 text-${col.color}-700 dark:text-${col.color}-300 rounded-md`}>
                      {col.data.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {col.data.map(stock => (
                    <StockCard key={stock.ticker} stock={stock} onClick={setSelectedStock} />
                  ))}
                  {col.data.length === 0 && !loading && (
                      <div className="py-8 text-center border border-dashed border-gray-300 dark:border-slate-800 rounded-2xl">
                          <p className="text-gray-500 dark:text-slate-600 text-sm font-medium">No trending stocks</p>
                      </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedStock && (
        <StockDetailModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}
    </div>
  );
}

export default App;