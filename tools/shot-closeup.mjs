// Quick high-res screenshot of the board + bottom bar for visual review.
import http from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { chromium } from 'playwright';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
const server = http.createServer(async (req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  try {
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(join(ROOT, p)));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(8378, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1200 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:8378/');
await page.click('#btn-start');
await page.waitForTimeout(6000); // after cutscene
// place first settlement+road so a piece is visible
await page.locator('#layer-spots .spot').nth(12).click({ force: true });
await page.waitForTimeout(300);
await page.locator('#layer-spots .spot').first().click({ force: true });
await page.waitForTimeout(2500);
await page.locator('#board').screenshot({ path: 'tools/shots/closeup-board.png' });
await page.locator('#bottombar').screenshot({ path: 'tools/shots/closeup-bar.png' });
await browser.close();
server.close();
console.log('done');
