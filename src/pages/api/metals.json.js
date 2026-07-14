import { METALS_FALLBACK } from '../../data/metals.js';

const REQUEST_TIMEOUT_MS = 8000;

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Provider responded with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function validPrice(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function fetchFromMetalsDev(apiKey) {
  const data = await fetchJson(
    `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`
  );
  const silver = validPrice(data.metals?.silver ?? data.silver);
  const gold = validPrice(data.metals?.gold ?? data.gold);

  if (!silver || !gold) {
    throw new Error('Metals.dev response did not contain valid silver and gold prices');
  }

  return { silver, gold, source: 'metals.dev' };
}

async function fetchFromMetalsLive() {
  const data = await fetchJson(
    'https://api.metals.live/v1/spot/metals?symbols=AU,AG'
  );
  const silver = validPrice(data.metals?.AG?.USD ?? data.metals?.AG);
  const gold = validPrice(data.metals?.AU?.USD ?? data.metals?.AU);

  if (!silver || !gold) {
    throw new Error('Metals.live response did not contain valid silver and gold prices');
  }

  return { silver, gold, source: 'metals.live' };
}

export async function GET() {
  const generatedAt = new Date().toISOString();
  const commitSha = import.meta.env.CF_PAGES_COMMIT_SHA;
  const apiKey = import.meta.env.METALS_API_KEY;
  let priceData = null;
  const providerErrors = [];

  if (apiKey) {
    try {
      priceData = await fetchFromMetalsDev(apiKey);
    } catch (error) {
      providerErrors.push(`metals.dev: ${error.message}`);
    }
  } else {
    providerErrors.push('metals.dev: METALS_API_KEY was not available at build time');
  }

  if (!priceData) {
    try {
      priceData = await fetchFromMetalsLive();
    } catch (error) {
      providerErrors.push(`metals.live: ${error.message}`);
    }
  }

  const usingFallback = !priceData;
  const payload = {
    ...(priceData ?? { ...METALS_FALLBACK, source: 'fallback' }),
    generatedAt,
    ...(commitSha ? { commitSha } : {}),
    fallback: usingFallback,
    ...(usingFallback
      ? { warning: `Provider prices were unavailable during the build. ${providerErrors.join(' | ')}` }
      : {}),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
