export enum MarketCap {
  Large = 'Large Cap',
  Mid = 'Mid Cap',
  Small = 'Small Cap',
}

export enum Signal {
  StrongBuy = 'Strong Buy',
  Buy = 'Buy',
  Neutral = 'Neutral',
  Sell = 'Sell',
  StrongSell = 'Strong Sell',
}

export interface NewsItem {
  headline: string;
  source: string;
  url?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface StockData {
  ticker: string;
  name: string;
  price: string;
  change: string; // e.g. "+2.5%"
  marketCapCategory: MarketCap;
  signal: Signal;
  sentimentScore: number; // 0 to 100
  analysis: string;
  news: NewsItem[];
  sources?: { title: string; uri: string }[];
}

export interface MarketState {
  market: string;
  country: string;
}

export interface MarketResponse {
  stocks: StockData[];
  marketSummary: string;
  timestamp: string;
}
