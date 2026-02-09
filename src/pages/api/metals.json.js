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
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=gold,silver&vs_currencies=usd'
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API responded with status ${response.status}`);
  }

  const data = await response.json();
  
  return {
    silver: data.silver?.usd,
    gold: data.gold?.usd,
    source: 'coingecko'
  };
}

export async function GET() {
  // Return cached prices if still fresh
  if (cachedPrices && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedPrices), {
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

  // Only fallback to CoinGecko if metals.dev completely failed and no cache
  if (!priceData && !cachedPrices) {
    try {
      priceData = await fetchFromCoinGecko();
      if (!priceData.silver || !priceData.gold) {
        throw new Error('Missing silver or gold in CoinGecko response');
      }
    } catch (err) {
      error = err.message;
      priceData = null;
    }
  }

  // Return cached prices if available
  if (!priceData && cachedPrices) {
    return new Response(JSON.stringify({ ...cachedPrices, stale: true, source: `${cachedPrices.source} [CACHED]` }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'STALE'
      }
    });
  }

  // Last resort: return hardcoded defaults
  if (!priceData) {
    // Production: suppress verbose logging for fallback
    return new Response(
      JSON.stringify({ 
        silver: 31.5,
        gold: 2750,
        source: 'fallback',
        error: error,
        message: 'Using default prices - API temporarily unavailable'
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

  return new Response(JSON.stringify(priceData), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'X-Cache': 'MISS'
    }
  });
}
