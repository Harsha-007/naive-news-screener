import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ExternalLink } from 'lucide-react';
import { StockData, Signal } from '../types';

interface StockCardProps {
  stock: StockData;
  onClick: (stock: StockData) => void;
}

const getSignalColor = (signal: Signal) => {
  switch (signal) {
    case Signal.StrongBuy:
      return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    case Signal.Buy:
      return 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20';
    case Signal.StrongSell:
      return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
    case Signal.Sell:
      return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20';
    default:
      return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';
  }
};

const getSignalIcon = (signal: Signal) => {
  switch (signal) {
    case Signal.StrongBuy:
    case Signal.Buy:
      return <TrendingUp className="w-3.5 h-3.5 mr-1.5" />;
    case Signal.StrongSell:
    case Signal.Sell:
      return <TrendingDown className="w-3.5 h-3.5 mr-1.5" />;
    default:
      return <Minus className="w-3.5 h-3.5 mr-1.5" />;
  }
};

export const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const signal = stock.signal || Signal.Neutral;
  const signalStyle = getSignalColor(signal);
  const score = stock.sentimentScore || 50;

  return (
    <div 
      onClick={() => onClick(stock)}
      className="group relative bg-white dark:bg-[#1e293b]/50 hover:bg-white dark:hover:bg-[#1e293b] backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 rounded-2xl p-5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:shadow-none hover:-translate-y-1 overflow-hidden"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">{stock.ticker}</h3>
            {score > 80 && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate max-w-[140px] mt-0.5">{stock.name}</p>
        </div>
        <div className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${signalStyle}`}>
          {getSignalIcon(signal)}
          {signal.toUpperCase()}
        </div>
      </div>

      <div className="relative flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">{stock.price}</p>
          <p className={`text-xs font-bold mt-1 ${stock.change && stock.change.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : stock.change && stock.change.includes('-') ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-slate-400'}`}>
            {stock.change}
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center text-gray-400 dark:text-slate-500 mb-1.5 gap-1">
             <Activity className="w-3 h-3" />
             <span className="text-[10px] font-semibold uppercase tracking-wider">Hype Score</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{score}</span>
            <div className="relative w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${score > 50 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-orange-500'}`}
                style={{ width: `${score}%` }}
                />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] text-gray-400 dark:text-slate-500">Click for analysis</span>
        <ExternalLink className="w-3 h-3 text-indigo-500" />
      </div>
    </div>
  );
};