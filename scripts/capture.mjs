#!/usr/bin/env node

/**
 * Generic screenshot capture utility for Astro site
 * Usage: node scripts/capture.mjs <url> <output-file> [options]
 * Examples:
 *   node scripts/capture.mjs http://localhost:4321/ public/screenshot.png
 *   node scripts/capture.mjs http://localhost:4321/tools/tornado-3d public/tornado-3d.png --wait=3000
 */

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321/';
const output = process.argv[3] || 'public/screenshot.png';
const args = Object.fromEntries(process.argv.slice(4).map(arg => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  return [key, value || true];
}));

const waitTime = parseInt(args.wait || 1000);
const viewportWidth = parseInt(args.width || 1200);
const viewportHeight = parseInt(args.height || 640);
const fullPage = !(args.fullPage === 'false');

async function waitForServer(page, url, retries = 30, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
}

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight } });
    
    const ok = await waitForServer(page, url);
    if (!ok) {
      console.error('✗ Server did not respond:', url);
      await browser.close();
      process.exit(2);
    }
    
    if (waitTime > 0) {
      await page.waitForTimeout(waitTime);
    }
    
    await page.screenshot({ path: output, fullPage });
    console.log(`✓ Screenshot saved to ${output}`);
    
    await browser.close();
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
})();
