import React from 'react';
import { Globe } from 'lucide-react';

interface MarketSelectorProps {
  currentCountry: string;
  onSelect: (country: string, market: string) => void;
  disabled: boolean;
}

const MARKETS = [
  { country: 'USA', market: 'NYSE/NASDAQ' },
  { country: 'India', market: 'NSE/BSE' },
  { country: 'UK', market: 'LSE' },
  { country: 'Japan', market: 'TSE' },
  { country: 'Germany', market: 'DAX' },
  { country: 'Brazil', market: 'B3' },
  { country: 'Canada', market: 'TSX' },
  { country: 'Australia', market: 'ASX' },
];

export const MarketSelector: React.FC<MarketSelectorProps> = ({ currentCountry, onSelect, disabled }) => {
  return (
    <div className="flex items-center space-x-3 bg-gray-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 transition-colors">
      <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
      <div className="flex flex-col">
        <select
          value={currentCountry}
          onChange={(e) => {
            const selected = MARKETS.find(m => m.country === e.target.value);
            if (selected) onSelect(selected.country, selected.market);
          }}
          disabled={disabled}
          className="bg-transparent text-xs font-bold text-gray-700 dark:text-slate-200 focus:outline-none cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors disabled:opacity-50 appearance-none pr-2"
          style={{ backgroundImage: 'none' }}
        >
          {MARKETS.map((m) => (
            <option key={m.country} value={m.country} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              {m.country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};