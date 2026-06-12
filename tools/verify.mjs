// E2E verification: serve the app, drive a solo game in Chromium, capture screenshots.
import http from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { chromium } from 'playwright';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json',
};

const TARGET = process.argv[2] || null; // optional: verify a deployed URL instead of local

const server = http.createServer(async (req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  try {
    const data = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise((r) => server.listen(8377, r));
console.log('server on :8377');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish portrait

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

const step = (name, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);

await page.goto(TARGET || 'http://localhost:8377/');
await page.waitForTimeout(600);
await page.screenshot({ path: 'tools/shots/00-loading.png' });
step('loading screen shows', await page.isVisible('#loading'));
await page.waitForTimeout(1800); // loading screen dismisses itself
await page.screenshot({ path: 'tools/shots/01-menu.png' });
step('menu loads', await page.isVisible('#btn-start'));
step('loading screen dismissed', !(await page.isVisible('#loading')));

// configure: seat 4 ON as AI (cycle off->human->ai) to test 4 players? keep default 3 (1 human + 2 AI)
await page.click('#btn-start');
await page.waitForTimeout(1400); // mid-cutscene
await page.screenshot({ path: 'tools/shots/02-cutscene.png' });

await page.waitForTimeout(4200); // cutscene over
const hexCount = await page.locator('#layer-tiles .hex-group').count();
const tokenCount = await page.locator('#layer-tokens .token').count();
step('19 terrain hexes', hexCount === 19, `got ${hexCount}`);
step('18 number tokens', tokenCount === 18, `got ${tokenCount}`);

// token numbers check: 2..12, no 7, max twice
const nums = await page.$$eval('#layer-tokens .token text.num', (els) => els.map((e) => +e.textContent));
const freq = {};
let numbersOk = nums.length === 18;
for (const n of nums) {
  freq[n] = (freq[n] || 0) + 1;
  if (n < 2 || n > 12 || n === 7 || freq[n] > 2) numbersOk = false;
}
step('token numbers valid (2-12, no 7, each ≤2×)', numbersOk, JSON.stringify(freq));

// Setup: spots visible for settlement placement
const spotCount = await page.locator('#layer-spots .spot').count();
step('settlement spots highlighted', spotCount === 54, `got ${spotCount}`);
await page.screenshot({ path: 'tools/shots/03-setup-spots.png' });

// Tap a spot to place settlement
await page.locator('#layer-spots .spot').nth(20).click({ force: true });
await page.waitForTimeout(400);
const roadSpots = await page.locator('#layer-spots .spot').count();
step('road spots after settlement (should be 2-3)', roadSpots >= 2 && roadSpots <= 3, `got ${roadSpots}`);
const buildingCount = await page.locator('#layer-buildings .piece').count();
step('settlement piece rendered', buildingCount === 1, `got ${buildingCount}`);

await page.locator('#layer-spots .spot').first().click({ force: true });
await page.waitForTimeout(300);
const roadCount = await page.locator('#layer-roads .piece').count();
step('road piece rendered', roadCount === 1, `got ${roadCount}`);

// AI players take their setup turns; wait until our second-settlement spots appear.
await page.waitForFunction(
  () => document.querySelectorAll('#layer-spots .spot').length > 0,
  null, { timeout: 20000 }
).catch(() => {});
await page.screenshot({ path: 'tools/shots/04-ai-setup.png' });
const piecesNow = await page.locator('#layer-buildings .piece').count();
step('AI placed setup settlements', piecesNow >= 3, `got ${piecesNow} buildings`);

// Our second settlement + road (snake order returns to us)
const spots2 = await page.locator('#layer-spots .spot').count();
step('second settlement prompt shown', spots2 > 0, `got ${spots2} spots`);
if (spots2 > 0) {
  await page.locator('#layer-spots .spot').first().click({ force: true });
  await page.waitForTimeout(400);
  await page.locator('#layer-spots .spot').first().click({ force: true });
}
// Wait until the human roll phase is reached (AIs finish their second placements).
await page.waitForFunction(
  () => !document.getElementById('btn-roll').disabled,
  null, { timeout: 20000 }
).catch(() => {});
await page.screenshot({ path: 'tools/shots/05-setup-done.png' });

const rollEnabled = await page.locator('#btn-roll').isEnabled();
step('roll phase reached, Roll enabled for human', rollEnabled);

// Probe: End Turn must be disabled before rolling
step('PROBE: End Turn disabled before roll', !(await page.locator('#btn-end').isEnabled()));

if (rollEnabled) {
  await page.click('#btn-roll');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'tools/shots/06-dice.png' });
  await page.waitForTimeout(1700);
  const diceShown = await page.locator('#die1').getAttribute('data-value');
  step('dice rolled (3D cube landed)', /^[1-6]$/.test(diceShown ?? ''), `die1=${diceShown}`);

  // Either main phase (End enabled) or a 7 happened (robber flow)
  await page.waitForTimeout(800);
  const endEnabled = await page.locator('#btn-end').isEnabled();
  const bannerText = await page.locator('#banner').textContent().catch(() => '');
  step('main phase or robber flow active', endEnabled || /robber|discard/i.test(bannerText), `end=${endEnabled} banner="${bannerText}"`);

  if (endEnabled) {
    // Probe: open dev modal & trade modal
    await page.click('#btn-dev');
    await page.waitForTimeout(300);
    step('PROBE: dev modal opens', await page.isVisible('#dev-buy'));
    await page.click('#dev-close');
    await page.click('#btn-trade');
    await page.waitForTimeout(300);
    step('PROBE: trade modal opens', await page.isVisible('#trade-bank'));
    await page.click('#trade-close');
    // End our turn -> AI turns run
    await page.click('#btn-end');
  }
}

// Let AI turns run a while; game should progress without errors
await page.waitForTimeout(12000);
await page.screenshot({ path: 'tools/shots/07-midgame.png' });
const logText = await page.locator('#log-list').textContent();
step('game log accumulating', logText.length > 50, `${logText.length} chars`);

// Probe: rapid clicks on board during AI turn shouldn't break anything
for (let i = 0; i < 5; i++) await page.mouse.click(195 + i * 3, 380 + i * 2);
await page.waitForTimeout(1500);

// PWA: manifest + SW registered?
const swActive = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return !!reg;
});
step('service worker registered (PWA installable)', swActive);

const manifestResp = await page.evaluate(async () => (await fetch('manifest.webmanifest')).status);
step('manifest served', manifestResp === 200);

console.log('\nConsole errors:', consoleErrors.length ? consoleErrors : 'none');

await browser.close();
server.close();
process.exit(consoleErrors.length ? 2 : 0);
