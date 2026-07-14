import { METALS_FALLBACK } from '../../src/data/metals.js';

const STATE_KEY = 'metals:snapshot:v1';
const LOCK_KEY = 'metals:refresh-lock:v1';
const FRESHNESS_MS = 4 * 60 * 60 * 1000;
const FAILURE_COOLDOWN_MS = 60 * 60 * 1000;
const PROMINENT_STALE_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const LOCK_TTL_SECONDS = 60;

let inFlightRefresh = null;

function messageFrom(error) {
  return error instanceof Error ? error.message : String(error);
}

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
  const url = new URL('https://api.metals.dev/v1/latest');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('unit', 'toz');
  const data = await fetchJson(url);
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

function parseTime(value) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeState(value) {
  if (!value || typeof value !== 'object') {
    return { version: 1, snapshot: null, lastFailedAttemptAt: null, lastProviderError: null };
  }

  const snapshot = value.snapshot;
  const silver = validPrice(snapshot?.silver);
  const gold = validPrice(snapshot?.gold);
  const fetchedAt = parseTime(snapshot?.fetchedAt);

  return {
    version: 1,
    snapshot: silver && gold && fetchedAt
      ? {
          silver,
          gold,
          source: snapshot.source || 'cache',
          fetchedAt: new Date(fetchedAt).toISOString(),
        }
      : null,
    lastFailedAttemptAt: parseTime(value.lastFailedAttemptAt)
      ? new Date(value.lastFailedAttemptAt).toISOString()
      : null,
    lastProviderError: typeof value.lastProviderError === 'string'
      ? value.lastProviderError
      : null,
  };
}

async function readState(kv) {
  return normalizeState(await kv.get(STATE_KEY, 'json'));
}

function getRefreshStatus(state, now) {
  const fetchedAt = parseTime(state.snapshot?.fetchedAt);
  const freshUntil = fetchedAt ? fetchedAt + FRESHNESS_MS : 0;
  const failedAt = parseTime(state.lastFailedAttemptAt);
  const failureCooldownUntil = failedAt ? failedAt + FAILURE_COOLDOWN_MS : 0;
  const nextRefreshAt = Math.max(freshUntil, failureCooldownUntil);

  return {
    refreshEligible: now >= nextRefreshAt,
    nextRefreshAt,
  };
}

function jsonResponse(payload) {
  return Response.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function responseFromState(state, now, options = {}) {
  const snapshot = options.snapshot ?? state.snapshot;
  const fetchedAtMs = parseTime(snapshot?.fetchedAt);
  const ageMs = fetchedAtMs ? Math.max(0, now - fetchedAtMs) : null;
  const calculatedRefreshStatus = getRefreshStatus(
    snapshot === state.snapshot ? state : { ...state, snapshot },
    now
  );
  const refreshEligible = options.refreshEligible ?? calculatedRefreshStatus.refreshEligible;
  const nextRefreshAt = options.nextRefreshAt ?? calculatedRefreshStatus.nextRefreshAt;
  const failedAtMs = parseTime(state.lastFailedAttemptAt);
  const failureCooldownActive = failedAtMs
    && now < failedAtMs + FAILURE_COOLDOWN_MS;
  const warnings = [];

  if (ageMs !== null && ageMs >= PROMINENT_STALE_MS) {
    warnings.push('Warning: cached metal prices are more than 24 hours old. Verify prices before making a purchase or bid.');
  }

  if (options.warning) {
    warnings.push(options.warning);
  } else if (failureCooldownActive) {
    warnings.push('A recent provider refresh failed. The current snapshot will remain in use until the retry cooldown ends.');
  }

  if (!snapshot) {
    warnings.push('No provider snapshot is available. Showing built-in fallback values.');
  }

  return jsonResponse({
    ...(snapshot ?? { ...METALS_FALLBACK, source: 'fallback', fetchedAt: null }),
    age: ageMs === null ? null : Math.floor(ageMs / 1000),
    cached: Boolean(snapshot) && options.cached !== false,
    stale: ageMs === null || ageMs >= FRESHNESS_MS,
    fallback: !snapshot,
    refreshEligible,
    nextRefreshAllowedAt: new Date(nextRefreshAt || now).toISOString(),
    warning: warnings.length ? warnings.join(' ') : null,
  });
}

async function fetchProviderSnapshot(env, now) {
  const errors = [];
  let priceData = null;

  if (env.METALS_API_KEY) {
    try {
      priceData = await fetchFromMetalsDev(env.METALS_API_KEY);
    } catch (error) {
      errors.push(`metals.dev: ${messageFrom(error)}`);
    }
  } else {
    errors.push('metals.dev: METALS_API_KEY is not configured');
  }

  if (!priceData) {
    try {
      priceData = await fetchFromMetalsLive();
    } catch (error) {
      errors.push(`metals.live: ${messageFrom(error)}`);
    }
  }

  if (!priceData) {
    throw new Error(errors.join(' | '));
  }

  return {
    ...priceData,
    fetchedAt: new Date(now).toISOString(),
  };
}

async function performRefresh(env, state, now) {
  try {
    const snapshot = await fetchProviderSnapshot(env, now);
    const nextState = {
      version: 1,
      snapshot,
      lastFailedAttemptAt: null,
      lastProviderError: null,
    };

    await env.METALS_CACHE.put(STATE_KEY, JSON.stringify(nextState));
    return { state: nextState, cached: false, warning: null };
  } catch (error) {
    const providerError = messageFrom(error);
    const nextState = {
      ...state,
      version: 1,
      lastFailedAttemptAt: new Date(now).toISOString(),
      lastProviderError: providerError,
    };

    await env.METALS_CACHE.put(STATE_KEY, JSON.stringify(nextState));
    return {
      state: nextState,
      cached: Boolean(nextState.snapshot),
      warning: nextState.snapshot
        ? 'Price providers could not be reached. Showing the last cached snapshot; another provider attempt will be allowed after the retry cooldown.'
        : 'Price providers could not be reached. Another initialization attempt will be allowed after the retry cooldown.',
    };
  }
}

async function refreshWithLock(env, state, now) {
  if (inFlightRefresh) {
    return await inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    const lock = await env.METALS_CACHE.get(LOCK_KEY, 'json');
    const lockExpiresAt = parseTime(lock?.expiresAt);

    if (lockExpiresAt && lockExpiresAt > now) {
      return {
        state,
        cached: Boolean(state.snapshot),
        warning: 'A price refresh is already in progress. Showing the current snapshot.',
        refreshEligible: false,
        nextRefreshAt: lockExpiresAt,
      };
    }

    await env.METALS_CACHE.put(
      LOCK_KEY,
      JSON.stringify({ expiresAt: new Date(now + LOCK_TTL_SECONDS * 1000).toISOString() }),
      { expirationTtl: LOCK_TTL_SECONDS }
    );

    const latestState = await readState(env.METALS_CACHE);
    const latestStatus = getRefreshStatus(latestState, Date.now());

    if (!latestStatus.refreshEligible) {
      return { state: latestState, cached: Boolean(latestState.snapshot), warning: null };
    }

    return await performRefresh(env, latestState, Date.now());
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}

export async function onRequestGet(context) {
  const env = context.env ?? {};
  const now = Date.now();

  if (!env.METALS_CACHE) {
    return responseFromState(normalizeState(null), now, {
      warning: 'The server-side metals cache is not configured.',
      refreshEligible: false,
      nextRefreshAt: now + FAILURE_COOLDOWN_MS,
    });
  }

  let state;
  try {
    state = await readState(env.METALS_CACHE);
  } catch (error) {
    return responseFromState(normalizeState(null), now, {
      warning: 'The server-side metals cache could not be read.',
      refreshEligible: false,
      nextRefreshAt: now + FAILURE_COOLDOWN_MS,
    });
  }

  const url = new URL(context.request.url);
  const refreshRequested = url.searchParams.get('refresh') === '1';

  if (state.snapshot && !refreshRequested) {
    return responseFromState(state, now, { cached: true });
  }

  const refreshStatus = getRefreshStatus(state, now);
  if (!refreshStatus.refreshEligible) {
    return responseFromState(state, now, { cached: Boolean(state.snapshot) });
  }

  try {
    const result = await refreshWithLock(env, state, now);
    return responseFromState(result.state, Date.now(), {
      cached: result.cached,
      warning: result.warning,
      refreshEligible: result.refreshEligible,
      nextRefreshAt: result.nextRefreshAt,
    });
  } catch (error) {
    return responseFromState(state, Date.now(), {
      cached: Boolean(state.snapshot),
      warning: `The server-side refresh could not be completed: ${messageFrom(error)}`,
    });
  }
}
