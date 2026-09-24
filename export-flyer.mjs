import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const flyers = [
  { html: 'flyer-post.html', jpg: 'flyer-post.jpg', width: 1280, height: 1280 },
  { html: 'flyer-reddit.html', jpg: 'flyer-reddit.jpg', width: 1280, height: 1280 },
  { html: 'flyer-sale.html', jpg: 'flyer-sale.jpg', width: 1280, height: 1280 },
  { html: 'flyer-banner.html', jpg: 'flyer-banner.jpg', width: 1400, height: 900 },
];

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

for (const flyer of flyers) {
  await page.setViewport({
    width: flyer.width,
    height: flyer.height,
    deviceScaleFactor: 2,
  });
  const filePath = path.join(__dirname, flyer.html);
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(resolve => setTimeout(resolve, 500));
  const element = await page.$('.flyer');
  if (!element) throw new Error(`Missing .flyer in ${flyer.html}`);
  await element.screenshot({
    path: path.join(__dirname, flyer.jpg),
    type: 'jpeg',
    quality: 95,
  });
  console.log(`Created ${flyer.jpg}`);
}

await browser.close();
