import { GoogleGenAI } from "@google/genai";
import { StockData, MarketResponse } from "../types";

/**
 * Aggressively extracts a JSON object from a string that might contain
 * Markdown, conversational filler, or code blocks.
 */
const extractJson = (text: string): any => {
  if (!text) return null;

  try {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonString = text.substring(startIndex, endIndex + 1);
      
      const cleanedString = jsonString
        .replace(/,\s*}/g, '}') 
        .replace(/,\s*]/g, ']'); 

      return JSON.parse(cleanedString);
    }
  } catch (e) {
    console.warn("JSON Extraction failed. Raw text:", text);
  }
  return null;
};

export const fetchMarketAnalysis = async (
  country: string,
  market: string
): Promise<MarketResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const systemInstruction = `
    You are a Real-Time Sentiment & News Tracker.
    
    CRITICAL TIME CONSTRAINT:
    The current time is ${dateString} at ${timeString}.
    You must ONLY use data from the LAST 24 HOURS.
    
    STRICT RULES:
    1. BROAD SCAN: Do not limit yourself to a few tech stocks. Scan the ENTIRE ${country} equity market for movers.
    2. IGNORE any news older than 24 hours. The user only cares about "Trending NOW".
    3. IGNORE fundamental metrics (P/E, Balance Sheets).
    4. FOCUS on "Just In", "Breaking", "Trending Now" on Twitter/X and Reddit.
    5. If a stock was trending yesterday but is quiet today, DO NOT include it.
    6. Output must be strictly valid JSON.
  `;

  const prompt = `
    Perform a BROAD and LIVE scan of the ${country} stock market (${market}) right now (${timeString}).
    
    Step 1: BROAD MARKET SWEEP
    - Search for "Top gaining stocks ${country} last 24 hours news"
    - Search for "Most active stocks by volume ${country} today news"
    - Search for "Trending stocks Twitter ${country} today"
    - Search for "Reddit investing ${country} top discussions today"
    
    Step 2: FILTER & SELECT
    - From the broad list found in Step 1, select 9 DISTINCT stocks that have the STRONGEST NARRATIVE right now.
    - Ensure a mix of 3 Large Cap, 3 Mid Cap, and 3 Small Cap stocks.
    - The stocks must be moving due to FRESH news (earnings released TODAY, merger announced TODAY, scandal TODAY, viral tweet TODAY).

    Step 3: Generate JSON response:
    {
      "marketSummary": "2-3 sentences on what is driving the market RIGHT NOW (e.g. 'Small caps are rallying due to the interest rate news an hour ago').",
      "timestamp": "${now.toISOString()}",
      "stocks": [
        {
          "ticker": "Symbol",
          "name": "Company",
          "price": "Current Price",
          "change": "% Change (e.g. +5.4%)",
          "marketCapCategory": "Large Cap",
          "signal": "Strong Buy" (or Buy/Neutral/Sell/Strong Sell) based on MOMENTUM intensity,
          "sentimentScore": 95 (0-100),
          "analysis": "Specific explanation of the news from TODAY.",
          "news": [
            { 
              "headline": "Headline of the article", 
              "source": "Source Name (e.g. 'Bloomberg - 2h ago' or 'Twitter Trending')", 
              "sentiment": "positive", 
              "summary": "One sentence summary." 
            }
          ]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "";
    const data = extractJson(text);

    if (!data || !data.stocks || !Array.isArray(data.stocks)) {
        console.error("Gemini returned invalid structure:", text);
        return {
          stocks: [],
          marketSummary: "Unable to analyze real-time sentiment. Please retry.",
          timestamp: new Date().toISOString()
        };
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = chunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((s: any) => s !== null);

    const uniqueSources = Array.from(new Set(webSources.map((s: any) => s.uri)))
        .map(uri => webSources.find((s: any) => s.uri === uri));

    const stocks: StockData[] = data.stocks.map((s: any) => ({
        ticker: s.ticker || "UNKNOWN",
        name: s.name || "Unknown Company",
        price: s.price || "N/A",
        change: s.change || "0%",
        marketCapCategory: s.marketCapCategory || "Large Cap",
        signal: s.signal || "Neutral",
        sentimentScore: typeof s.sentimentScore === 'number' ? s.sentimentScore : 50,
        analysis: s.analysis || "No recent news found.",
        news: Array.isArray(s.news) ? s.news : [],
        sources: uniqueSources
    }));

    return {
      stocks: stocks,
      marketSummary: data.marketSummary || "Market data updated.",
      timestamp: data.timestamp || new Date().toISOString()
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to AI service.");
  }
};