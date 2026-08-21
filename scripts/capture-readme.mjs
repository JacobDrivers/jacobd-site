#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || 'https://jacobd-site.pages.dev').replace(/\/$/, '');
const outputDirectory = 'docs/screenshots';

async function preparePage(browser, path, viewport) {
  const page = await browser.newPage({
    viewport,
    colorScheme: 'dark',
    deviceScaleFactor: 1,
  });

  await page.goto(`${baseUrl}${path}`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });
  await page.evaluate(() => document.fonts.ready);

  return page;
}

const browser = await chromium.launch();

try {
  await mkdir(outputDirectory, { recursive: true });

  const homepage = await preparePage(browser, '/', { width: 1440, height: 1000 });
  await homepage.screenshot({
    path: `${outputDirectory}/homepage.png`,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
  await homepage.close();

  const projects = await preparePage(browser, '/projects/', { width: 1440, height: 1000 });
  await projects.screenshot({
    path: `${outputDirectory}/projects.png`,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
  await projects.close();

  const coinScout = await preparePage(
    browser,
    '/tools/coin-scout/',
    { width: 1440, height: 900 },
  );

  await coinScout.waitForFunction(() => {
    const text = document.body.innerText;
    return text.includes('Prices fetched:')
      && !text.includes('Prices fetched: Not available')
      && !text.includes('Source: fallback');
  }, { timeout: 15_000 });

  const priceResponse = await coinScout.request.get(`${baseUrl}/api/metals.json`);
  if (!priceResponse.ok()) {
    throw new Error(`Metals endpoint returned ${priceResponse.status()}`);
  }

  const prices = await priceResponse.json();
  if (prices.fallback || prices.source === 'fallback' || !prices.fetchedAt) {
    throw new Error('Coin Scout did not receive a live KV-backed price snapshot');
  }

  await coinScout.screenshot({
    path: `${outputDirectory}/coin-scout.png`,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
  await coinScout.close();

  console.log(`Captured README screenshots from ${baseUrl}`);
  console.log(`Coin Scout source: ${prices.source}; fetchedAt: ${prices.fetchedAt}; cached: ${prices.cached}`);
} finally {
  await browser.close();
}
