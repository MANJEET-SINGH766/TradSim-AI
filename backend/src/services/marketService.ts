import YahooFinance from 'yahoo-finance2';

// Instantiate the YahooFinance client with notice suppression configs
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
});

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface HistoricalPricePoint {
  date: string;
  close: number;
}

/**
 * Service to manage external market data communications via Yahoo Finance.
 */
export class MarketService {
  
  /**
   * Search for Indian stock tickers matching a user query string
   */
  static async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      const searchResult = await yahooFinance.search(query, {
        newsCount: 0,
        quotesCount: 20,
      });

      if (!searchResult || !searchResult.quotes || !Array.isArray(searchResult.quotes)) {
        const error = new Error('Yahoo Finance search result parsing failed.');
        (error as any).code = 'PARSING_FAILURE';
        throw error;
      }

      return searchResult.quotes
        .filter((quote: any) => {
          if (quote.quoteType !== 'EQUITY') return false;
          const exchange = quote.exchange;
          const symbol = quote.symbol || '';
          return (
            exchange === 'NSI' ||
            exchange === 'BSE' ||
            symbol.endsWith('.NS') ||
            symbol.endsWith('.BO')
          );
        })
        .map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname || quote.symbol,
          exchange: quote.symbol.endsWith('.NS') ? 'NSE' : 'BSE',
        }));
    } catch (error: any) {
      console.error('[Yahoo API] Search query failed:', error.message);
      return [];
    }
  }

  /**
   * Retrieve real-time quote snapshot details for a specific stock ticker
   */
  static async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const quote = await yahooFinance.quote(symbol);
      if (!quote) {
        const error = new Error(`Stock with symbol ${symbol} was not found (Invalid Symbol).`);
        (error as any).code = 'INVALID_SYMBOL';
        throw error;
      }

      if (
        quote.symbol === undefined ||
        quote.regularMarketPrice === undefined ||
        quote.regularMarketChangePercent === undefined
      ) {
        const error = new Error(`Yahoo Finance response formatting failed for ${symbol}.`);
        (error as any).code = 'PARSING_FAILURE';
        throw error;
      }

      return {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent,
        open: quote.regularMarketOpen || 0,
        high: quote.regularMarketDayHigh || 0,
        low: quote.regularMarketDayLow || 0,
        volume: quote.regularMarketVolume || 0,
      };
    } catch (error: any) {
      console.error(`[Yahoo API] Quote lookup failed for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch historical price close data points for charts over a selected range
   * @param range Choices: "1W" (7 days), "1M" (30 days), "1Y" (365 days)
   */
  static async getStockHistory(
    symbol: string,
    range: '1W' | '1M' | '1Y' = '1M'
  ): Promise<HistoricalPricePoint[]> {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    try {
      const results = await yahooFinance.chart(symbol, {
        period1: startStr,
        period2: endStr,
        interval: '1d',
      });

      if (!results || !results.quotes || !Array.isArray(results.quotes)) {
        const error = new Error(`Yahoo Finance chart data formatting failed for ${symbol}.`);
        (error as any).code = 'PARSING_FAILURE';
        throw error;
      }

      return results.quotes
        .filter((item: any) => item.date !== undefined && item.close !== undefined)
        .map((item: any) => ({
          date: new Date(item.date).toISOString().split('T')[0],
          close: item.close,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error: any) {
      console.error(`[Yahoo API] Chart history lookup failed for ${symbol}:`, error.message);
      return [];
    }
  }
}

