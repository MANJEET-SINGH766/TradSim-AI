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
 * Service to manage all external communications with Yahoo Finance API
 */
export class MarketService {
  /**
   * Search for Indian stock tickers matching a user query string
   */
  static async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      // Execute the search on Yahoo Finance with a larger quotesCount to fetch lower-ranked equities
      const searchResult = await yahooFinance.search(query, {
        newsCount: 0,
        quotesCount: 20,
      });

      if (!searchResult || !searchResult.quotes || !Array.isArray(searchResult.quotes)) {
        const error = new Error('Yahoo Finance search result parsing failed.');
        (error as any).code = 'PARSING_FAILURE';
        throw error;
      }

      // Filter and map matching stocks (prioritizing NSE and BSE exchanges, strictly filtering to equities)
      return searchResult.quotes
        .filter((quote: any) => {
          // Reject non-equity listings (mutual funds, ETFs, indexes) to prevent noise
          if (quote.quoteType !== 'EQUITY') return false;

          const exchange = quote.exchange;
          const symbol = quote.symbol || '';

          // Filter to match Indian equity tickers
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
      if (error.code === 'PARSING_FAILURE') {
        console.error(`[PARSING_FAILURE] Search parse mismatch: ${error.message}`);
      } else {
        console.error(`[API_NETWORK_FAILURE] Search query failed: ${error.message}`);
      }
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
        // Distinguish: Invalid Symbol
        const error = new Error(`Stock with symbol ${symbol} was not found (Invalid Symbol).`);
        (error as any).code = 'INVALID_SYMBOL';
        throw error;
      }

      // Check for parsing/response-format failure (missing essential quote fields)
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
      if (error.code === 'INVALID_SYMBOL') {
        console.error(`[INVALID_SYMBOL] Stock ${symbol} is invalid.`);
      } else if (error.code === 'PARSING_FAILURE') {
        console.error(`[PARSING_FAILURE] Parse mismatch on ${symbol}: ${error.message}`);
      } else {
        // All other errors (timeouts, blockages, crumb errors) are API/Network failures
        console.error(`[API_NETWORK_FAILURE] Yahoo Finance request failed for ${symbol}: ${error.message}`);
      }
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
    try {
      const endDate = new Date();
      let startDate = new Date();

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

      // Format dates to ISO strings (YYYY-MM-DD)
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Query historical data from Yahoo Finance using modern chart() endpoint to avoid deprecated ripHistorical warnings
      const results = await yahooFinance.chart(symbol, {
        period1: startStr,
        period2: endStr,
        interval: '1d', // daily close interval
      });

      if (!results || !results.quotes || !Array.isArray(results.quotes)) {
        const error = new Error(`Yahoo Finance chart data formatting failed for ${symbol}.`);
        (error as any).code = 'PARSING_FAILURE';
        throw error;
      }

      // Map response to simplified price point array
      return results.quotes
        .filter((item: any) => item.date !== undefined && item.close !== undefined)
        .map((item: any) => ({
          date: new Date(item.date).toISOString().split('T')[0],
          close: item.close,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error: any) {
      if (error.code === 'PARSING_FAILURE') {
        console.error(`[PARSING_FAILURE] History parse mismatch on ${symbol}: ${error.message}`);
      } else {
        console.error(`[API_NETWORK_FAILURE] History query failed for ${symbol}: ${error.message}`);
      }
      return [];
    }
  }
}
