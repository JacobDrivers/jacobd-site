import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4322/';
const out = process.argv[3] || 'public/screenshot-mobile.png';

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
  const browser = await chromium.launch();
  // iPhone 12 dimensions: 390x844 (physical), renders as 390x844 logical
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const ok = await waitForServer(page, url);
  if (!ok) {
    console.error('Server did not respond in time:', url);
    await browser.close();
    process.exit(2);
  }
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved mobile screenshot to', out);
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
