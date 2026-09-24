import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const flyers = [
  { html: 'flyer-post.html', jpg: 'flyer-post.jpg', width: 1280, height: 1280, scale: 2 },
  { html: 'flyer-reddit.html', jpg: 'flyer-reddit.jpg', width: 1280, height: 1280, scale: 2 },
  { html: 'flyer-sale.html', jpg: 'flyer-sale.jpg', width: 1280, height: 1280, scale: 2 },
  { html: 'flyer-banner.html', jpg: 'flyer-banner.jpg', width: 900, height: 400, scale: 1, brightJpeg: true },
];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--force-color-profile=srgb'],
});
const page = await browser.newPage();

for (const flyer of flyers) {
  await page.setViewport({
    width: flyer.width,
    height: flyer.height,
    deviceScaleFactor: flyer.scale,
  });
  const filePath = path.join(__dirname, flyer.html);
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(resolve => setTimeout(resolve, 500));
  const element = await page.$('.flyer');
  if (!element) throw new Error(`Missing .flyer in ${flyer.html}`);
  const jpgPath = path.join(__dirname, flyer.jpg);
  if (flyer.brightJpeg) {
    const pngPath = path.join(os.tmpdir(), 'flyer-banner.png');
    await element.screenshot({ path: pngPath, type: 'png' });
    execFileSync('ffmpeg', [
      '-y', '-i', pngPath,
      '-vf', 'eq=gamma=1.12:contrast=1.04:saturation=1.05',
      '-q:v', '2',
      jpgPath,
    ]);
    fs.rmSync(pngPath, { force: true });
  } else {
    await element.screenshot({
      path: jpgPath,
      type: 'jpeg',
      quality: 95,
    });
  }
  console.log(`Created ${flyer.jpg}`);
}

await browser.close();
