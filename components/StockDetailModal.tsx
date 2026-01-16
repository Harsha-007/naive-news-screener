import React from 'react';
import { X, ExternalLink, Newspaper, MessageCircle, TrendingUp } from 'lucide-react';
import { StockData, NewsItem } from '../types';

interface StockDetailModalProps {
  stock: StockData | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl flex flex-col bg-white dark:bg-[#0f172a] border-x-0 sm:border border-gray-200 dark:border-slate-700/50 sm:rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 bg-white/90 dark:bg-[#0f172a]/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur rounded-t-2xl sticky top-0 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stock.ticker}</h2>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 whitespace-nowrap">
                {stock.marketCapCategory}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">{stock.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8 custom-scrollbar">
          
          {/* Main Sentiment Analysis */}
          <section>
            <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Sentiment & Narrative
            </h3>
            <div className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/40 dark:to-slate-900/40 p-5 rounded-2xl border border-indigo-100/50 dark:border-slate-700/50">
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-base">
                {stock.analysis}
              </p>
            </div>
          </section>

          {/* News & Drivers */}
          <section>
             <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg mr-3">
                <Newspaper className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              Top Headlines & Tweets
            </h3>
            <div className="grid gap-3">
              {stock.news.map((news: NewsItem, idx: number) => (
                <div key={idx} className="group bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:bg-slate-800/60 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 text-sm leading-snug">{news.headline}</h4>
                    <span className={`self-start sm:self-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${news.sentiment === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : news.sentiment === 'negative' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                      {news.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 leading-relaxed">{news.summary}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/30">
                    <div className="flex items-center text-xs font-medium text-gray-500 dark:text-slate-500">
                        {news.source.includes('Twitter') || news.source.includes('X') ? (
                             <MessageCircle className="w-3 h-3 mr-1" />
                        ) : (
                             <Newspaper className="w-3 h-3 mr-1" />
                        )}
                        <span className="truncate max-w-[150px]">{news.source}</span>
                    </div>
                    {news.url && (
                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center text-xs font-bold group-hover:underline">
                            Open <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Grounding Sources */}
          {stock.sources && stock.sources.length > 0 && (
            <section className="pt-2 border-t border-gray-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Source Mentions
              </h4>
              <div className="flex flex-wrap gap-2">
                {stock.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center px-3 py-1.5 rounded-full bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-[11px] text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 transition-colors max-w-full"
                  >
                    <span className="truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};