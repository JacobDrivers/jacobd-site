import { chromium } from 'playwright';

const homeUrl = process.argv[2] || 'http://localhost:4321/';
const out = process.argv[3] || 'public/CoinScout-Screenshot-v2.png';

async function waitForServer(page, url, retries = 30, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      return true;
    } catch {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const ok = await waitForServer(page, homeUrl);
  if (!ok) {
    console.error('Server did not respond in time:', homeUrl);
    await browser.close();
    process.exit(2);
  }

  await page.waitForSelector('a[href="/tools/coin-scout"]', { timeout: 5000 });
  await Promise.all([
    page.waitForURL('**/tools/coin-scout', { timeout: 10000 }),
    page.click('a[href="/tools/coin-scout"]')
  ]);

  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Coin & Currency Scout', { timeout: 5000 });

  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved CoinScout screenshot to', out);

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
