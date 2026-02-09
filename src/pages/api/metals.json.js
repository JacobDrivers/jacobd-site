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
  console.log('CoinGecko raw response:', data);
  
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

  // Debug: Check if API key is available
  console.log('=== METALS API ENDPOINT ===');
  console.log('API Key available:', apiKey ? 'YES' : 'NO');
  if (!apiKey) {
    console.log('Checked: import.meta.env.METALS_API_KEY =', import.meta.env.METALS_API_KEY);
  }

  // Try metals.dev first (premium source, limited calls)
  if (apiKey) {
    try {
      console.log('Attempting metals.dev fetch...');
      priceData = await fetchFromMetalsDev(apiKey);
      
      if (!priceData.silver || !priceData.gold) {
        throw new Error(`Missing prices from metals.dev: ${JSON.stringify(priceData)}`);
      }
      
      console.log('Successfully fetched from metals.dev:', priceData);
    } catch (err) {
      error = err.message;
      console.error('Metals.dev fetch failed:', error);
      priceData = null;
    }
  } else {
    console.warn('No METALS_API_KEY configured');
  }

  // Only fallback to CoinGecko if metals.dev completely failed and no cache
  // Skip CoinGecko on initial failures to avoid rate limiting
  if (!priceData && !cachedPrices && false) {
    try {
      console.log('Attempting CoinGecko fallback...');
      priceData = await fetchFromCoinGecko();
      if (!priceData.silver || !priceData.gold) {
        throw new Error('Missing silver or gold in CoinGecko response');
      }
      console.log('Successfully fetched from CoinGecko:', priceData);
    } catch (err) {
      error = err.message;
      console.error('CoinGecko fetch failed:', error);
      priceData = null;
    }
  }

  // Return cached prices if available
  if (!priceData && cachedPrices) {
    console.log('Returning cached prices');
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
    console.log('Using fallback prices due to API failure:', error);
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
    console.error('Invalid price values:', { silver, gold, raw: priceData });
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
