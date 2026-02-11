// Cache prices for 1 hour (3600000 ms) to save API calls
let cachedPrices = null;
let cacheTime = null;
const CACHE_DURATION = 3600000; // 1 hour

async function fetchFromMetalsDev(apiKey) {
  const response = await fetch(
    `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`
  );
  
  if (!response.ok) {
    throw new Error(`Metals.dev API responded with status ${response.status}`);
  }

  const data = await response.json();
  
  // Check all possible response structures
  let silver = data.metals?.silver || data.silver || null;
  let gold = data.metals?.gold || data.gold || null;
  
  if (!silver || !gold) {
    throw new Error(`Metals.dev missing prices - Silver: ${silver}, Gold: ${gold}`);
  }

  return {
    silver: parseFloat(silver),
    gold: parseFloat(gold),
    source: 'metals.dev'
  };
}

async function fetchFromCoinGecko() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=gold,silver&vs_currencies=usd',
      { signal: controller.signal }
    );
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    const silver = data.silver?.usd;
    const gold = data.gold?.usd;
    
    // Validate we got valid numbers
    if (typeof silver !== 'number' || typeof gold !== 'number' || silver <= 0 || gold <= 0) {
      throw new Error(`CoinGecko returned invalid prices - Silver: ${silver}, Gold: ${gold}`);
    }
    
    return {
      silver,
      gold,
      source: 'coingecko'
    };
  } catch (error) {
    throw new Error(`CoinGecko fetch failed: ${error.message}`);
  }
}

async function fetchFromOpenMetrics() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    // Using metals API with free tier
    const response = await fetch(
      'https://api.metals.live/v1/spot/metals?symbols=AU,AG',
      { signal: controller.signal }
    );
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Metals.live API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // metals.live returns prices in different currencies, use USD
    const silver = data.metals?.AG?.USD || data.metals?.AG || null;
    const gold = data.metals?.AU?.USD || data.metals?.AU || null;
    
    // Validate we got valid numbers
    if (typeof silver !== 'number' || typeof gold !== 'number' || silver <= 0 || gold <= 0) {
      throw new Error(`Metals.live returned invalid prices - Silver: ${silver}, Gold: ${gold}`);
    }
    
    return {
      silver,
      gold,
      source: 'metals.live'
    };
  } catch (error) {
    throw new Error(`Metals.live fetch failed: ${error.message}`);
  }
}

export async function GET({ url }) {
  // Check for 'force' query parameter to bypass cache
  const forceRefresh = url.searchParams.has('force');

  // Return cached prices if still fresh (and not force-refreshing)
  if (!forceRefresh && cachedPrices && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return new Response(JSON.stringify({
      ...cachedPrices,
      cached: true,
      cacheAge: Math.floor((Date.now() - cacheTime) / 1000),
      cacheExpires: Math.floor((CACHE_DURATION - (Date.now() - cacheTime)) / 1000)
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'HIT'
      }
    });
  }

  const apiKey = import.meta.env.METALS_API_KEY;
  let priceData = null;
  let error = null;

  // Note: API key configuration is optional - uses fallback if unavailable

  // Try metals.dev first (premium source, limited calls)
  if (apiKey) {
    try {
      priceData = await fetchFromMetalsDev(apiKey);
      
      if (!priceData.silver || !priceData.gold) {
        throw new Error(`Missing prices from metals.dev: ${JSON.stringify(priceData)}`);
      }
    } catch (err) {
      error = err.message;
      priceData = null;
    }
  }

  // Try CoinGecko as first backup (free, unlimited calls)
  if (!priceData) {
    try {
      priceData = await fetchFromOpenMetrics();
      if (!priceData.silver || !priceData.gold) {
        throw new Error('Missing silver or gold in metals.live response');
      }
    } catch (err) {
      console.error('Metals.live failed:', err.message);
      error = err.message;
      priceData = null;
    }
  }

  // Return cached prices if available (stale but better than nothing)
  if (!priceData && cachedPrices) {
    return new Response(JSON.stringify({ 
      ...cachedPrices, 
      cached: true,
      stale: true, 
      source: `${cachedPrices.source} [STALE CACHE]`,
      cacheAge: Math.floor((Date.now() - cacheTime) / 1000),
      error: error
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'STALE'
      }
    });
  }

  // Last resort: return hardcoded fallback prices
  if (!priceData) {
    // Return reasonable fallback prices (approximate current spot)
    // These serve as local development defaults
    return new Response(
      JSON.stringify({ 
        silver: 32.50,
        gold: 2650,
        source: 'fallback',
        cached: false,
        error: error || 'No API key configured and external APIs unavailable',
        message: 'Using fallback prices. Deploy with METALS_API_KEY for live prices.'
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Validate we got valid numbers
  const silver = parseFloat(priceData.silver);
  const gold = parseFloat(priceData.gold);

  if (isNaN(silver) || isNaN(gold) || silver <= 0 || gold <= 0) {
    return new Response(
      JSON.stringify({ 
        silver: 31.5,
        gold: 2750,
        source: 'fallback',
        cached: false,
        error: 'Invalid price values received'
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Cache successful response
  cachedPrices = priceData;
  cacheTime = Date.now();

  return new Response(JSON.stringify({
    ...priceData,
    cached: false,
    cacheAge: 0,
    cacheExpires: CACHE_DURATION
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'X-Cache': 'MISS'
    }
  });
}
