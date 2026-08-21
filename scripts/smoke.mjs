#!/usr/bin/env node

const baseUrl = (process.argv[2] || 'http://127.0.0.1:8788').replace(/\/$/, '');
const routes = [
  '/',
  '/about/',
  '/projects/',
  '/tools/',
  '/tools/coin-scout/',
  '/tools/monster-game/',
  '/tools/tornado-3d/',
  '/robots.txt',
  '/sitemap.xml',
];

async function checkRoute(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  return response;
}

for (const route of routes) {
  await checkRoute(route);
  console.log(`OK ${route}`);
}

for (const query of ['', '?refresh=1']) {
  const response = await checkRoute(`/api/metals.json${query}`);
  const payload = await response.json();
  const silver = Number(payload.silver);
  const gold = Number(payload.gold);

  if (!Number.isFinite(silver) || silver <= 0 || !Number.isFinite(gold) || gold <= 0) {
    throw new Error(`/api/metals.json${query} returned invalid metal prices`);
  }

  if (typeof payload.stale !== 'boolean' || typeof payload.fallback !== 'boolean') {
    throw new Error(`/api/metals.json${query} returned an incomplete status payload`);
  }

  console.log(`OK /api/metals.json${query} source=${payload.source} stale=${payload.stale} fallback=${payload.fallback}`);
}

console.log(`Smoke checks passed for ${baseUrl}`);
