// Vercel Serverless Function - Stock Price Proxy
// This avoids CORS issues by proxying requests through your own Vercel server

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        // Try Yahoo Finance first
        const yahooResult = await fetchFromYahoo(symbol);
        if (yahooResult) {
            return res.status(200).json(yahooResult);
        }

        // Fallback to alternative sources
        const altResult = await fetchFromAlternative(symbol);
        if (altResult) {
            return res.status(200).json(altResult);
        }

        return res.status(404).json({ error: 'Could not fetch price for symbol' });
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function fetchFromYahoo(symbol) {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();

        if (data.chart && data.chart.result && data.chart.result[0]) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose || meta.previousClose;

            if (price && price > 0) {
                return {
                    symbol,
                    price,
                    change: previousClose ? price - previousClose : 0,
                    changePercent: previousClose ? ((price - previousClose) / previousClose) * 100 : 0,
                    source: 'yahoo'
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Yahoo fetch error:', error);
        return null;
    }
}

async function fetchFromAlternative(symbol) {
    try {
        // Try Yahoo v7 quote endpoint
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();

        if (data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result[0]) {
            const quote = data.quoteResponse.result[0];
            const price = quote.regularMarketPrice;

            if (price && price > 0) {
                return {
                    symbol,
                    price,
                    change: quote.regularMarketChange || 0,
                    changePercent: quote.regularMarketChangePercent || 0,
                    source: 'yahoo-quote'
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Alternative fetch error:', error);
        return null;
    }
}
