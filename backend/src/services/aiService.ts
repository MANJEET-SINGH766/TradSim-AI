import { GoogleGenAI } from '@google/genai';

export class AIService {
  /**
   * Request stock details summary analysis from Google Gemini
   */
  static async analyzeStock(
    symbol: string,
    price: number,
    change: number,
    changePercent: number,
    open: number,
    high: number,
    low: number
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Smart Student Fallback: Return simulated advice if Gemini is not configured
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
      const isPositive = change >= 0;
      return `[SIMULATED ADVICE] ${symbol} is trading at ₹${price.toLocaleString('en-IN')}, showing a ${
        isPositive ? 'gain' : 'loss'
      } of ${changePercent.toFixed(2)}% today. The price range fluctuated between ₹${low.toLocaleString(
        'en-IN'
      )} and ₹${high.toLocaleString('en-IN')}. ${
        isPositive
          ? 'Bullish momentum suggests strength, but monitor resistance levels before entering long.'
          : 'Short-term selling pressure is visible; look for consolidation support zones before accumulating.'
      } (Configure your GEMINI_API_KEY in the backend env file to unlock live Gemini analysis!)`;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following stock details:
* Stock Symbol: ${symbol}
* Current Price: ₹${price.toLocaleString('en-IN')}
* Today's Price Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
* Today's Session: Open: ₹${open.toLocaleString('en-IN')}, High: ₹${high.toLocaleString('en-IN')}, Low: ₹${low.toLocaleString('en-IN')}

Write a concise, friendly 2-sentence analysis of this stock's current price behavior. Highlight key support/resistance levels or short-term trends based strictly on the session range. Keep the tone professional but easy to understand for beginners.`,
        config: {
          systemInstruction: 'You are a professional educational financial advisor. Write brief, educational stock price reviews in exactly two sentences.',
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      });

      return result.text?.trim() || 'AI Summary could not be parsed.';
    } catch (error: any) {
      console.error('Gemini API request failed:', error);
      const status = error.status || error.statusCode || (error.response && error.response.status) || 'UNKNOWN';
      const message = error.message || 'No error message provided';
      let category = 'configuration';
      
      if (status === 401 || status === 403 || message.toLowerCase().includes('key') || message.toLowerCase().includes('auth') || message.toLowerCase().includes('permission')) {
        category = 'authentication';
      } else if (status === 404 || message.toLowerCase().includes('model')) {
        category = 'model';
      } else if (status === 429 || message.toLowerCase().includes('quota') || message.toLowerCase().includes('limit') || message.toLowerCase().includes('rate')) {
        category = 'quota';
      }
      
      return `Gemini service error [Category: ${category}, Status: ${status}]: ${message}`;
    }
  }

  /**
   * Request portfolio diversification audits from Google Gemini
   */
  static async auditPortfolio(
    cash: number,
    holdings: { symbol: string; quantity: number; currentValue: number; averagePrice: number }[]
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Smart Student Fallback: Return simulated advice if Gemini is not configured
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
      const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      if (holdings.length === 0) {
        return `[SIMULATED AUDIT] Your portfolio is currently 100% cash (₹${cash.toLocaleString('en-IN')}). Having a cash buffer is smart, but inflation will erode its value over time. Consider allocating a small portion (e.g. 5-10%) to large-cap blue-chip equities to start learning market dynamics. (Configure your GEMINI_API_KEY in the backend env file to unlock live Gemini audits!)`;
      }
      return `[SIMULATED AUDIT] You hold ₹${cash.toLocaleString('en-IN')} cash and ₹${holdingsValue.toLocaleString('en-IN')} in stock assets. You have successfully accumulated ${holdings.length} position(s). To keep risk low, make sure your capital is spread out across at least 3-4 distinct industries (like IT, Energy, and Banking) rather than a single stock. (Configure your GEMINI_API_KEY in the backend env file to unlock live Gemini audits!)`;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const holdingsText = holdings
        .map(
          (h) =>
            `- ${h.symbol}: ${h.quantity} shares, Current Value: ₹${h.currentValue.toLocaleString(
              'en-IN'
            )}, Bought Avg Price: ₹${h.averagePrice.toLocaleString('en-IN')}`
        )
        .join('\n');

      const prompt = `Analyze the following user portfolio:
* Virtual Cash: ₹${cash.toLocaleString('en-IN')}
* Current Stock Positions:
${holdingsText || 'None (100% Cash)'}

Write a concise, friendly 3-sentence audit of this portfolio. Check if their investments are safely diversified or too heavily concentrated, and suggest which sector or asset class they should look at next to balance their risk. Keep it beginner-friendly.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional educational portfolio auditor. Write brief, educational portfolio audits in exactly three sentences.',
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      });

      return result.text?.trim() || 'AI Portfolio Audit could not be parsed.';
    } catch (error: any) {
      console.error('Gemini Portfolio Audit failed:', error);
      const status = error.status || error.statusCode || (error.response && error.response.status) || 'UNKNOWN';
      const message = error.message || 'No error message provided';
      let category = 'configuration';
      
      if (status === 401 || status === 403 || message.toLowerCase().includes('key') || message.toLowerCase().includes('auth') || message.toLowerCase().includes('permission')) {
        category = 'authentication';
      } else if (status === 404 || message.toLowerCase().includes('model')) {
        category = 'model';
      } else if (status === 429 || message.toLowerCase().includes('quota') || message.toLowerCase().includes('limit') || message.toLowerCase().includes('rate')) {
        category = 'quota';
      }
      
      return `Gemini audit service error [Category: ${category}, Status: ${status}]: ${message}`;
    }
  }
}
