// UI layer: SVG board, cutscene, drag-and-drop building, modals, AI driver.

import { RESOURCES, RESOURCE_INFO, DEV_INFO, PIECE_LIMITS, BUILD_COSTS, PIPS } from './constants.js';
import { HEX_SIZE } from './board.js';
import * as G from './game.js';
import * as AI from './ai.js';
import { sfx } from './sfx.js';
import { ICON_INNER, PIECE_INNER, TERRAIN_ART, resIcon, pieceIcon } from './icons.js';

const TERRAIN_STYLE = {
  hills: { fill: '#b5562e', name: 'Hills' },
  forest: { fill: '#2e6b30', name: 'Forest' },
  pasture: { fill: '#8fc15c', name: 'Pasture' },
  fields: { fill: '#e2b33b', name: 'Fields' },
  mountains: { fill: '#8a8f99', name: 'Mountains' },
  desert: { fill: '#d9c789', name: 'Desert' },
};

let S = null;            // game state
let gen = 0;             // generation counter (cancels stale AI timers on restart)
let layers = {};
let placingPiece = null; // 'road' | 'settlement' | 'city' during tap-to-place
let dragging = null;     // { piece, ghostEl, spots }
let lastHumanShown = -1; // pass-and-play privacy
let onExitToMenu = null;

const $ = (id) => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, parent = null) {
  const n = document.createElementNS(svgNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

const humanCount = () => S.players.filter((p) => !p.isAI).length;
const cur = () => S.players[S.currentPlayer];

// ============================================================
// Board rendering
// ============================================================
export function startGame(state, exitToMenu) {
  S = state;
  gen++;
  onExitToMenu = exitToMenu;
  placingPiece = null;
  lastHumanShown = -1;
  $('menu').classList.add('hidden');
  $('game').classList.remove('hidden');
  buildBoardSvg();
  runCutscene(() => advance());
}

function buildBoardSvg() {
  const svg = $('board');
  svg.innerHTML = '';

  // viewBox from board extents (+ margin for harbors)
  const xs = [], ys = [];
  for (const v of S.board.vertices) { xs.push(v.x); ys.push(v.y); }
  const m = HEX_SIZE * 1.15;
  const minX = Math.min(...xs) - m, maxX = Math.max(...xs) + m;
  const minY = Math.min(...ys) - m, maxY = Math.max(...ys) + m;
  svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

  layers = {};
  for (const name of ['sea', 'tiles', 'harbors', 'tokens', 'roads', 'spots', 'buildings', 'robber']) {
    layers[name] = el('g', { id: 'layer-' + name }, svg);
  }

  // island base (sand ring behind tiles)
  for (const t of S.board.tiles) {
    el('polygon', {
      points: hexPointsStr(t, 1.13),
      fill: '#e8d5a3', stroke: 'none', opacity: 0.95,
    }, layers.sea);
  }

  // terrain hexes
  for (const t of S.board.tiles) {
    const g = el('g', { class: 'hex-group', 'data-tile': t.id }, layers.tiles);
    const st = TERRAIN_STYLE[t.terrain];
    el('polygon', { points: hexPointsStr(t, 1), class: 'hex', fill: st.fill }, g);
    // subtle top highlight
    el('polygon', { points: hexPointsStr(t, 0.86), fill: 'rgba(255,255,255,.07)', stroke: 'none' }, g);
    // terrain scenery (trees, peaks, dunes, …)
    const art = el('g', {
      transform: `translate(${t.center.x} ${t.center.y})`,
      style: 'pointer-events:none',
    }, g);
    art.innerHTML = TERRAIN_ART[t.terrain];
    // small badge showing which resource this tile produces
    if (t.resource) {
      const badge = el('g', {
        transform: `translate(${t.center.x} ${t.center.y + 38})`,
        style: 'pointer-events:none',
      }, g);
      el('circle', { cx: 0, cy: 0, r: 9.5, fill: '#f6efdd', stroke: '#8a6a3a', 'stroke-width': 1.4 }, badge);
      const bi = el('g', { transform: 'translate(-7 -7) scale(.35)' }, badge);
      bi.innerHTML = ICON_INNER[t.resource];
    }
    g.addEventListener('click', () => onTileTap(t.id));
  }

  // harbors
  for (const h of S.board.harbors) {
    const v1 = S.board.vertices[h.vertices[0]];
    const v2 = S.board.vertices[h.vertices[1]];
    const mx = (v1.x + v2.x) / 2, my = (v1.y + v2.y) / 2;
    const len = Math.hypot(mx, my) || 1;
    const ox = mx + (mx / len) * 30, oy = my + (my / len) * 30;
    const g = el('g', { class: 'harbor' }, layers.harbors);
    el('line', { x1: ox, y1: oy, x2: v1.x, y2: v1.y }, g);
    el('line', { x1: ox, y1: oy, x2: v2.x, y2: v2.y }, g);
    el('rect', { x: ox - 23, y: oy - 13, width: 46, height: 26, rx: 7, class: 'pad' }, g);
    const ic = el('g', { transform: `translate(${ox - 21} ${oy - 11}) scale(.55)` }, g);
    ic.innerHTML = h.type === '3:1' ? ICON_INNER.anchor : ICON_INNER[h.type];
    const label = el('text', { x: ox + 11, y: oy + 4 }, g);
    label.textContent = h.type === '3:1' ? '3:1' : '2:1';
  }

  // number tokens
  for (const t of S.board.tiles) {
    if (!t.number) continue;
    const g = el('g', { class: 'token' + (t.number === 6 || t.number === 8 ? ' hot' : ''), 'data-token': t.id }, layers.tokens);
    el('circle', { cx: t.center.x, cy: t.center.y + 8, r: 17 }, g);
    const num = el('text', { x: t.center.x, y: t.center.y + 13, class: 'num', 'font-size': 16 }, g);
    num.textContent = t.number;
    const pips = el('text', { x: t.center.x, y: t.center.y + 22, class: 'pips' }, g);
    pips.textContent = '•'.repeat(PIPS[t.number]);
    g.style.pointerEvents = 'none';
  }

  renderDynamic();
}

function hexPointsStr(tile, scale) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${tile.center.x + HEX_SIZE * scale * Math.cos(a)},${tile.center.y + HEX_SIZE * scale * Math.sin(a)}`);
  }
  return pts.join(' ');
}

function renderDynamic() {
  // roads
  layers.roads.innerHTML = '';
  for (const [eidStr, pid] of Object.entries(S.ownership.edge)) {
    drawRoad(+eidStr, S.players[pid].colorHex, layers.roads);
  }
  // buildings
  layers.buildings.innerHTML = '';
  for (const [vidStr, own] of Object.entries(S.ownership.vertex)) {
    drawBuilding(+vidStr, own.type, S.players[own.player].colorHex, layers.buildings);
  }
  // robber
  layers.robber.innerHTML = '';
  const rt = S.board.tiles[S.board.robberTile];
  const rg = el('g', { class: 'robber', style: 'pointer-events:none' }, layers.robber);
  el('path', {
    d: `M ${rt.center.x - 9} ${rt.center.y + 26} q 0 -12 5 -16 a 7 7 0 1 1 8 0 q 5 4 5 16 z`,
    fill: '#26211c', stroke: '#000', 'stroke-width': 1,
  }, rg);
}

function drawRoad(eid, color, parent, ghost = false) {
  const e = S.board.edges[eid];
  const v1 = S.board.vertices[e.v1], v2 = S.board.vertices[e.v2];
  const mx = (v1.x + v2.x) / 2, my = (v1.y + v2.y) / 2;
  const ang = (Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180) / Math.PI;
  const len = Math.hypot(v2.x - v1.x, v2.y - v1.y) * 0.62;
  const g = el('g', {
    class: 'piece' + (ghost ? ' ghost' : ' pop'),
    transform: `translate(${mx},${my}) rotate(${ang})`,
  }, parent);
  el('rect', { x: -len / 2, y: -4.5, width: len, height: 9, rx: 3, fill: color }, g);
  el('rect', { x: -len / 2 + 1.6, y: -3.2, width: len - 3.2, height: 2.6, rx: 1.3, fill: '#fff', opacity: 0.3, stroke: 'none' }, g);
  return g;
}

function drawBuilding(vid, type, color, parent, ghost = false) {
  const v = S.board.vertices[vid];
  const g = el('g', {
    class: 'piece' + (ghost ? ' ghost' : ' pop'),
    transform: `translate(${v.x},${v.y})`,
  }, parent);
  if (type === 'settlement') {
    el('path', { d: 'M 0 -13 L 10 -4 L 10 10 L -10 10 L -10 -4 Z', fill: color }, g);
    el('path', { d: 'M 0 -13 L 10 -4 L -10 -4 Z', fill: '#000', opacity: 0.22, stroke: 'none' }, g);
    el('rect', { x: -2.6, y: 3, width: 5.2, height: 7, rx: 1, fill: '#000', opacity: 0.32, stroke: 'none' }, g);
    el('rect', { x: -8.7, y: -2.8, width: 2, height: 11.5, fill: '#fff', opacity: 0.18, stroke: 'none' }, g);
  } else {
    el('path', { d: 'M -13 12 L -13 -2 L -4 -2 L -4 -10 L 3 -16 L 10 -10 L 10 -2 L 13 -2 L 13 12 Z', fill: color }, g);
    el('path', { d: 'M -4 -10 L 3 -16 L 10 -10 Z', fill: '#000', opacity: 0.26, stroke: 'none' }, g);
    el('rect', { x: 0.6, y: -8, width: 4.8, height: 4.8, rx: 0.8, fill: '#000', opacity: 0.3, stroke: 'none' }, g);
    el('rect', { x: -9.8, y: 3.5, width: 4.4, height: 4.6, rx: 0.8, fill: '#000', opacity: 0.3, stroke: 'none' }, g);
    el('rect', { x: 5.4, y: 3.5, width: 4.4, height: 4.6, rx: 0.8, fill: '#000', opacity: 0.3, stroke: 'none' }, g);
    el('rect', { x: -11.9, y: -0.8, width: 1.8, height: 11.6, fill: '#fff', opacity: 0.16, stroke: 'none' }, g);
  }
  return g;
}

// ============================================================
// Cutscene: tiles fly in, then number tokens drop
// ============================================================
function runCutscene(done) {
  const myGen = gen;
  const tileGroups = [...layers.tiles.children];
  const tokens = [...layers.tokens.children];
  const harbors = layers.harbors;
  const roads = layers.roads, buildings = layers.buildings, robber = layers.robber, spots = layers.spots;

  for (const lyr of [layers.tokens, harbors, roads, buildings, robber, spots]) lyr.style.opacity = '0';
  tileGroups.forEach((g) => { g.style.opacity = '0'; });

  banner('🏝️ The island of Catan takes shape…', 2200);

  // shuffle the visual order of appearance too
  const order = tileGroups.slice().sort(() => Math.random() - 0.5);
  order.forEach((g, i) => {
    setTimeout(() => {
      if (myGen !== gen) return;
      g.style.opacity = '1';
      g.classList.add('flyin');
      sfx.tile();
    }, 250 + i * 110);
  });

  const tilesDone = 250 + order.length * 110 + 350;
  setTimeout(() => {
    if (myGen !== gen) return;
    layers.tokens.style.opacity = '1';
    tokens.forEach((tk, i) => {
      tk.style.opacity = '0';
      setTimeout(() => {
        if (myGen !== gen) return;
        tk.style.opacity = '1';
        tk.classList.add('drop');
        if (i % 3 === 0) sfx.tap();
      }, i * 85);
    });
    banner('🎲 Placing the number tokens…', 1800);
  }, tilesDone);

  const tokensDone = tilesDone + tokens.length * 85 + 400;
  setTimeout(() => {
    if (myGen !== gen) return;
    for (const lyr of [harbors, roads, buildings, robber, spots]) lyr.style.opacity = '1';
    banner('⚔️ Found your first settlement!', 2000);
    done();
  }, tokensDone);
}

// ============================================================
// Rendering: chips, hand, tray, buttons
// ============================================================
function render() {
  renderDynamic();
  renderChips();
  renderHand();
  renderTray();
  renderButtons();
  renderLog();
}

function renderChips() {
  const wrap = $('player-chips');
  wrap.innerHTML = '';
  for (const p of S.players) {
    const chip = document.createElement('div');
    chip.className = 'chip' + (p.id === S.currentPlayer ? ' active' : '');
    const badges = [
      p.hasLongestRoad ? '🛣️' : '',
      p.hasLargestArmy ? '⚔️' : '',
      p.isAI ? '🤖' : '',
    ].join('');
    chip.innerHTML = `
      <span class="dot" style="background:${p.colorHex}"></span>
      <span>${escapeHtml(p.name)}</span>
      <span class="vp">${G.publicVP(S, p)}★</span>
      <span class="badges">${badges}</span>`;
    wrap.appendChild(chip);
  }
}

function renderHand() {
  const hand = $('hand');
  const p = cur();
  hand.innerHTML = '';
  // In hotseat, only show the hand of a human current player (AI hands stay hidden).
  const showFull = !p.isAI;
  for (const r of RESOURCES) {
    const n = p.resources[r];
    const card = document.createElement('div');
    card.className = 'rescard';
    card.style.background = RESOURCE_INFO[r].color;
    card.style.opacity = n === 0 ? '0.35' : '1';
    card.innerHTML = `<span class="ic">${resIcon(r, 28)}</span><span class="ct">${showFull ? n : '?'}</span>`;
    hand.appendChild(card);
  }
  const dev = document.createElement('div');
  dev.className = 'rescard';
  dev.style.background = '#5e35b1';
  dev.innerHTML = `<span class="ic">${resIcon('dev', 28)}</span><span class="ct">${showFull ? p.devCards.length : '?'}</span>`;
  hand.appendChild(dev);
}

function renderTray() {
  const p = cur();
  const isHumanTurn = !p.isAI && (S.phase === 'main' || S.phase === 'setup');
  const conf = {
    road: {
      left: PIECE_LIMITS.road - p.roads.length,
      can: S.phase === 'main' && (S.freeRoads > 0 || G.canAfford(p, BUILD_COSTS.road)) && G.legalRoadEdges(S, p.id).length > 0,
      setupActive: S.phase === 'setup' && S.setupPlacedVertex !== null,
    },
    settlement: {
      left: PIECE_LIMITS.settlement - p.settlements.length,
      can: S.phase === 'main' && G.canAfford(p, BUILD_COSTS.settlement) && G.legalSettlementVertices(S, p.id).length > 0,
      setupActive: S.phase === 'setup' && S.setupPlacedVertex === null,
    },
    city: {
      left: PIECE_LIMITS.city - p.cities.length,
      can: S.phase === 'main' && G.canAfford(p, BUILD_COSTS.city) && p.settlements.length > 0,
      setupActive: false,
    },
  };
  for (const [piece, c] of Object.entries(conf)) {
    const elT = $('tray-' + piece);
    elT.querySelector('.left').textContent = c.left;
    const usable = isHumanTurn && c.left > 0 && (c.can || c.setupActive);
    elT.classList.toggle('disabled', !usable);
    elT.classList.toggle('affordable', usable);
    elT.querySelector('svg').style.color = p.isAI ? '#999' : p.colorHex;
  }
}

function renderButtons() {
  const p = cur();
  const human = !p.isAI;
  $('btn-roll').disabled = !(human && S.phase === 'roll');
  $('btn-end').disabled = !(human && S.phase === 'main' && S.freeRoads === 0);
  $('btn-dev').disabled = !(human && (S.phase === 'main' || S.phase === 'roll'));
  $('btn-trade').disabled = !(human && S.phase === 'main');
}

function renderLog() {
  const list = $('log-list');
  list.innerHTML = S.log.slice(-60).map((l) => `<div>${escapeHtml(l)}</div>`).reverse().join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============================================================
// Banner / toast helpers
// ============================================================
let bannerTimer = null;
function banner(text, ms = 2400) {
  const b = $('banner');
  b.textContent = text;
  b.classList.remove('hidden');
  clearTimeout(bannerTimer);
  if (ms > 0) bannerTimer = setTimeout(() => b.classList.add('hidden'), ms);
}
function stickyBanner(text) { banner(text, 0); }
function hideBanner() { clearTimeout(bannerTimer); $('banner').classList.add('hidden'); }

function toast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  $('toast-area').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ============================================================
// Game flow driver
// ============================================================
function advance() {
  if (!S) return;
  render();

  if (S.phase === 'gameOver') { showWinner(); return; }

  if (S.phase === 'discard') {
    // AI players discard instantly; humans get a modal one at a time.
    for (const pid of [...S.pendingDiscards]) {
      if (S.players[pid].isAI) G.discardCards(S, pid, AI.pickDiscard(S, pid));
    }
    render();
    const humanPending = S.pendingDiscards.find((pid) => !S.players[pid].isAI);
    if (humanPending !== undefined) { showDiscardModal(humanPending); return; }
    if (S.phase === 'discard') return; // shouldn't happen
    advance(); return;
  }

  const p = cur();
  if (p.isAI) { scheduleAI(); return; }

  // Human turn
  if (S.phase === 'setup') {
    if (S.setupPlacedVertex === null) {
      stickyBanner(`${p.name}: place a settlement (drag 🏠 or tap a glowing spot)`);
      showSpots('settlement');
    } else {
      stickyBanner(`${p.name}: place a road next to your settlement`);
      showSpots('road');
    }
  } else if (S.phase === 'roll') {
    maybePassDevice(() => {
      stickyBanner(`${p.name}: roll the dice! 🎲`);
      render();
    });
  } else if (S.phase === 'robber') {
    stickyBanner(`${p.name}: tap a tile to move the robber 🥷`);
  } else if (S.phase === 'steal') {
    showStealModal();
  } else if (S.phase === 'main') {
    if (S.freeRoads > 0) {
      stickyBanner(`${p.name}: place ${S.freeRoads} free road${S.freeRoads > 1 ? 's' : ''}`);
      showSpots('road');
    } else {
      hideBanner();
      clearSpots();
    }
  }
}

function maybePassDevice(then) {
  if (humanCount() <= 1 || cur().id === lastHumanShown) { then(); return; }
  const p = cur();
  showModal(`
    <div class="pass-card">
      <h2>Pass the device</h2>
      <div class="big-dot" style="background:${p.colorHex}"></div>
      <p>It's <b>${escapeHtml(p.name)}</b>'s turn.<br/>Hand over the phone, then tap below.</p>
      <div class="modal-actions"><button class="btn primary big" id="pass-go">I'm ${escapeHtml(p.name)} — let's go</button></div>
    </div>`);
  $('pass-go').onclick = () => { lastHumanShown = p.id; closeModal(); then(); };
}

// ---------- AI ----------
function scheduleAI() {
  const myGen = gen;
  const delay = S.phase === 'setup' ? 700 : 600;
  setTimeout(() => { if (myGen === gen) aiStep(); }, delay);
}

function aiStep() {
  if (!S || S.phase === 'gameOver') { advance(); return; }
  const p = cur();
  if (!p.isAI) { advance(); return; }

  if (S.phase === 'setup') {
    if (S.setupPlacedVertex === null) {
      const vid = AI.pickSetupSettlement(S, p.id);
      G.setupPlaceSettlement(S, vid);
      sfx.place();
    } else {
      const eid = AI.pickSetupRoad(S, p.id, S.setupPlacedVertex);
      G.setupPlaceRoad(S, eid);
      sfx.place();
    }
    advance(); return;
  }

  if (S.phase === 'roll') {
    // Knight before roll if it helps
    const robberHurts = S.board.tiles[S.board.robberTile].vertexIds
      .some((vid) => S.ownership.vertex[vid]?.player === p.id);
    if (robberHurts && !S.devPlayedThisTurn &&
        p.devCards.some((c) => c.type === 'knight' && c.boughtTurn < S.turn)) {
      G.playKnight(S);
      toast(`🤖 ${p.name} plays a Knight`);
      advance(); return;
    }
    doRoll(); return;
  }

  if (S.phase === 'robber') {
    const tid = AI.pickRobberTile(S, p.id);
    G.moveRobber(S, tid);
    sfx.rob();
    advance(); return;
  }

  if (S.phase === 'steal') {
    const victim = AI.pickStealVictim(S, S.pendingSteal.candidates);
    const r = G.stealFrom(S, victim);
    if (r.ok) toast(`🥷 ${p.name} stole from ${S.players[victim].name}`);
    advance(); return;
  }

  if (S.phase === 'main') {
    const action = AI.nextMainAction(S);
    if (!action) { G.endTurn(S); advance(); return; }
    applyAIAction(p, action);
    if (S.phase === 'gameOver') { advance(); return; }
    render();
    scheduleAI(); // next micro-action with a small delay
    return;
  }

  advance();
}

function applyAIAction(p, a) {
  switch (a.type) {
    case 'buildRoad': if (G.buildRoad(S, a.edge).ok) sfx.place(); break;
    case 'buildSettlement': if (G.buildSettlement(S, a.vertex).ok) { sfx.place(); toast(`🤖 ${p.name} founded a settlement`); } break;
    case 'buildCity': if (G.buildCity(S, a.vertex).ok) { sfx.place(); toast(`🤖 ${p.name} built a city!`); } break;
    case 'buyDev': if (G.buyDevCard(S).ok) sfx.card(); break;
    case 'knight': G.playKnight(S); toast(`🤖 ${p.name} plays a Knight`); break;
    case 'roadBuilding': G.playRoadBuilding(S); toast(`🤖 ${p.name} plays Road Building`); break;
    case 'yearOfPlenty': G.playYearOfPlenty(S, a.res1, a.res2); toast(`🤖 ${p.name} plays Year of Plenty`); break;
    case 'monopoly': G.playMonopoly(S, a.res); sfx.bad(); toast(`🤖 ${p.name} plays Monopoly!`); break;
    case 'bankTrade': G.bankTrade(S, a.give, a.get); break;
  }
}

// ---------- Dice ----------
function doRoll() {
  const overlay = $('dice-overlay');
  const d1 = $('die1'), d2 = $('die2');
  overlay.classList.remove('hidden');
  d1.textContent = '?'; d2.textContent = '?';
  d1.classList.add('rolling'); d2.classList.add('rolling');
  sfx.dice();
  const res = G.rollDice(S);
  setTimeout(() => {
    d1.textContent = S.dice[0];
    d2.textContent = S.dice[1];
    flashTokens(S.dice[0] + S.dice[1]);
  }, 480);
  setTimeout(() => {
    overlay.classList.add('hidden');
    d1.classList.remove('rolling'); d2.classList.remove('rolling');
    if (res.production) {
      const mine = res.production[S.currentPlayer];
      if (mine) bumpHand();
    }
    if (res.robber) sfx.bad();
    advance();
  }, 1500);
}

function flashTokens(number) {
  for (const t of S.board.tiles) {
    if (t.number !== number) continue;
    const tk = layers.tokens.querySelector(`[data-token="${t.id}"]`);
    if (tk) { tk.classList.remove('flash'); void tk.getBoundingClientRect(); tk.classList.add('flash'); }
  }
}

function bumpHand() {
  for (const c of $('hand').children) {
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
}

// ============================================================
// Placement: highlight spots + tap + drag-and-drop
// ============================================================
function legalSpotsFor(piece) {
  const pid = S.currentPlayer;
  if (S.phase === 'setup') {
    if (piece === 'settlement' && S.setupPlacedVertex === null) {
      return { kind: 'vertex', ids: G.legalSettlementVertices(S, pid, true) };
    }
    if (piece === 'road' && S.setupPlacedVertex !== null) {
      return { kind: 'edge', ids: G.legalRoadEdges(S, pid, S.setupPlacedVertex) };
    }
    return { kind: piece === 'road' ? 'edge' : 'vertex', ids: [] };
  }
  if (S.phase !== 'main') return { kind: 'vertex', ids: [] };
  const p = cur();
  if (piece === 'road') {
    const ok = S.freeRoads > 0 || G.canAfford(p, BUILD_COSTS.road);
    return { kind: 'edge', ids: ok && p.roads.length < PIECE_LIMITS.road ? G.legalRoadEdges(S, pid) : [] };
  }
  if (piece === 'settlement') {
    const ok = G.canAfford(p, BUILD_COSTS.settlement) && p.settlements.length < PIECE_LIMITS.settlement;
    return { kind: 'vertex', ids: ok ? G.legalSettlementVertices(S, pid) : [] };
  }
  const ok = G.canAfford(p, BUILD_COSTS.city) && p.cities.length < PIECE_LIMITS.city;
  return { kind: 'vertex', ids: ok ? G.legalCityVertices(S, pid) : [] };
}

function showSpots(piece) {
  clearSpots();
  placingPiece = piece;
  const { kind, ids } = legalSpotsFor(piece);
  for (const id of ids) {
    let cx, cy;
    if (kind === 'vertex') {
      const v = S.board.vertices[id];
      cx = v.x; cy = v.y;
    } else {
      const e = S.board.edges[id];
      cx = (S.board.vertices[e.v1].x + S.board.vertices[e.v2].x) / 2;
      cy = (S.board.vertices[e.v1].y + S.board.vertices[e.v2].y) / 2;
    }
    const c = el('circle', {
      cx, cy, r: 12,
      class: 'spot' + (kind === 'edge' ? ' edge-spot' : ''),
      'data-id': id, 'data-kind': kind,
    }, layers.spots);
    c.addEventListener('click', (ev) => { ev.stopPropagation(); placeAt(piece, kind, id); });
  }
}

function clearSpots() {
  placingPiece = null;
  if (layers.spots) layers.spots.innerHTML = '';
}

function placeAt(piece, kind, id) {
  const pid = S.currentPlayer;
  let r = { ok: false };
  if (S.phase === 'setup') {
    r = piece === 'settlement' ? G.setupPlaceSettlement(S, id) : G.setupPlaceRoad(S, id);
    if (r.ok && r.gained && Object.keys(r.gained).length) {
      toast('🎁 Starting resources: ' + Object.entries(r.gained).map(([k, n]) => `${n} ${RESOURCE_INFO[k].icon}`).join(' '));
    }
  } else if (piece === 'road') r = G.buildRoad(S, id);
  else if (piece === 'settlement') r = G.buildSettlement(S, id);
  else if (piece === 'city') r = G.buildCity(S, id);

  if (r.ok) { sfx.place(); clearSpots(); advance(); }
  else if (r.reason) { toast('❌ ' + r.reason); sfx.bad(); }
  void pid;
}

// ---------- Drag and drop ----------
function initDrag() {
  for (const piece of ['road', 'settlement', 'city']) {
    const tray = $('tray-' + piece);
    tray.addEventListener('pointerdown', (ev) => {
      if (tray.classList.contains('disabled')) return;
      ev.preventDefault();
      startDrag(piece, ev);
    });
  }
  window.addEventListener('pointermove', moveDrag, { passive: false });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', cancelDrag);
}

function startDrag(piece, ev) {
  const { kind, ids } = legalSpotsFor(piece);
  if (!ids.length) { toast('❌ No legal spot for that right now'); sfx.bad(); return; }
  showSpots(piece);
  const color = cur().colorHex;
  const ghost = document.createElement('div');
  ghost.id = 'drag-ghost';
  ghost.innerHTML = pieceIcon(piece, 44, color);
  document.body.appendChild(ghost);
  ghost.style.left = ev.clientX + 'px';
  ghost.style.top = ev.clientY + 'px';
  dragging = { piece, kind, ids, ghost, snapped: null, ghostPieceEl: null };
  sfx.tap();
}

function svgPointFromClient(x, y) {
  const svg = $('board');
  const pt = svg.createSVGPoint();
  pt.x = x; pt.y = y;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function nearestSpot(clientX, clientY) {
  if (!dragging) return null;
  const p = svgPointFromClient(clientX, clientY);
  let best = null, bestD = HEX_SIZE * 0.75; // snap radius in board units
  for (const id of dragging.ids) {
    let cx, cy;
    if (dragging.kind === 'vertex') {
      const v = S.board.vertices[id]; cx = v.x; cy = v.y;
    } else {
      const e = S.board.edges[id];
      cx = (S.board.vertices[e.v1].x + S.board.vertices[e.v2].x) / 2;
      cy = (S.board.vertices[e.v1].y + S.board.vertices[e.v2].y) / 2;
    }
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

function moveDrag(ev) {
  if (!dragging) return;
  ev.preventDefault();
  dragging.ghost.style.left = ev.clientX + 'px';
  dragging.ghost.style.top = ev.clientY + 'px';
  const snap = nearestSpot(ev.clientX, ev.clientY);
  if (snap !== dragging.snapped) {
    dragging.snapped = snap;
    if (dragging.ghostPieceEl) { dragging.ghostPieceEl.remove(); dragging.ghostPieceEl = null; }
    if (snap !== null) {
      const color = cur().colorHex;
      dragging.ghostPieceEl = dragging.kind === 'edge'
        ? drawRoad(snap, color, layers.spots, true)
        : drawBuilding(snap, dragging.piece === 'city' ? 'city' : 'settlement', color, layers.spots, true);
      dragging.ghost.style.opacity = '0.25';
    } else {
      dragging.ghost.style.opacity = '1';
    }
  }
}

function endDrag(ev) {
  if (!dragging) return;
  const { piece, kind } = dragging;
  const snap = nearestSpot(ev.clientX, ev.clientY);
  cancelDrag();
  if (snap !== null) placeAt(piece, kind, snap);
  else if (S.phase !== 'setup') clearSpots();
}

function cancelDrag() {
  if (!dragging) return;
  dragging.ghost.remove();
  if (dragging.ghostPieceEl) dragging.ghostPieceEl.remove();
  dragging = null;
}

// ---------- Tile tap (robber) ----------
function onTileTap(tileId) {
  if (!S || cur().isAI) return;
  if (S.phase !== 'robber') return;
  const r = G.moveRobber(S, tileId);
  if (!r.ok) { toast('❌ Place the robber on a different tile'); return; }
  sfx.rob();
  advance();
}

// ============================================================
// Modals
// ============================================================
function showModal(html) {
  $('modal-card').innerHTML = html;
  $('modal').classList.remove('hidden');
}
function closeModal() { $('modal').classList.add('hidden'); }

// ---------- Discard ----------
function showDiscardModal(playerId) {
  const p = S.players[playerId];
  const must = Math.floor(G.handSize(p) / 2);
  const sel = {};
  const rows = RESOURCES.filter((r) => p.resources[r] > 0).map((r) => `
    <div class="counter-row" data-res="${r}">
      <span class="label">${resIcon(r, 20)} ${RESOURCE_INFO[r].name} <small>(have ${p.resources[r]})</small></span>
      <button data-d="-1">−</button><span class="val">0</span><button data-d="1">+</button>
    </div>`).join('');
  showModal(`
    <h2>🥷 ${escapeHtml(p.name)} must discard ${must} card${must > 1 ? 's' : ''}</h2>
    <p>A 7 was rolled and you hold more than 7 cards. Choose which to give up.</p>
    ${rows}
    <div class="modal-actions"><button class="btn primary" id="discard-ok" disabled>Discard (0/${must})</button></div>`);

  const update = () => {
    const total = Object.values(sel).reduce((a, b) => a + b, 0);
    const ok = $('discard-ok');
    ok.disabled = total !== must;
    ok.textContent = `Discard (${total}/${must})`;
  };
  for (const row of $('modal-card').querySelectorAll('.counter-row')) {
    const res = row.dataset.res;
    sel[res] = 0;
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const d = +b.dataset.d;
      sel[res] = Math.max(0, Math.min(p.resources[res], (sel[res] || 0) + d));
      row.querySelector('.val').textContent = sel[res];
      update();
    }));
  }
  $('discard-ok').onclick = () => {
    const r = G.discardCards(S, playerId, sel);
    if (r.ok) { closeModal(); sfx.bad(); advance(); }
  };
}

// ---------- Steal victim ----------
function showStealModal() {
  const cands = S.pendingSteal.candidates;
  if (cands.length === 1) {
    const r = G.stealFrom(S, cands[0]);
    if (r.ok) toast(`🥷 You stole 1 ${RESOURCE_INFO[r.res].icon} from ${S.players[cands[0]].name}`);
    advance(); return;
  }
  const btns = cands.map((pid) => {
    const v = S.players[pid];
    return `<button class="victim-btn" data-pid="${pid}">
      <span class="dot" style="background:${v.colorHex}"></span>
      ${escapeHtml(v.name)} — ${G.handSize(v)} cards</button>`;
  }).join('');
  showModal(`<h2>🥷 Steal from whom?</h2><p>Pick a player adjacent to the robber.</p>${btns}`);
  $('modal-card').querySelectorAll('.victim-btn').forEach((b) => b.addEventListener('click', () => {
    const r = G.stealFrom(S, +b.dataset.pid);
    closeModal();
    if (r.ok) toast(`🥷 You stole 1 ${RESOURCE_INFO[r.res].icon}`);
    sfx.rob();
    advance();
  }));
}

// ---------- Dev cards ----------
function showDevModal() {
  const p = cur();
  const counts = {};
  for (const c of p.devCards) counts[c.type] = counts[c.type] || { total: 0, playable: 0 };
  for (const c of p.devCards) {
    counts[c.type].total++;
    if (c.boughtTurn < S.turn) counts[c.type].playable++;
  }
  const canPlay = (t) => !S.devPlayedThisTurn && counts[t]?.playable > 0 &&
    (t === 'knight' ? (S.phase === 'main' || S.phase === 'roll') : S.phase === 'main');
  const rows = Object.entries(counts).map(([t, c]) => `
    <div class="devcard-row">
      <span class="ic">${DEV_INFO[t].icon}</span>
      <span class="info"><b>${DEV_INFO[t].name} ×${c.total}</b><span>${DEV_INFO[t].desc}</span></span>
      ${t === 'victoryPoint' ? '' : `<button class="btn" data-play="${t}" ${canPlay(t) ? '' : 'disabled'}>Play</button>`}
    </div>`).join('') || '<p>You have no development cards yet.</p>';

  const affordable = S.phase === 'main' && G.canAfford(p, BUILD_COSTS.devCard) && S.devDeck.length > 0;
  showModal(`
    <h2>🃏 Development cards</h2>
    <p>Your total score (incl. hidden VP): <b>${G.totalVP(S, p)} ★</b> &nbsp;•&nbsp; Deck: ${S.devDeck.length} left</p>
    ${rows}
    <div class="modal-actions">
      <button class="btn" id="dev-close">Close</button>
      <button class="btn primary" id="dev-buy" ${affordable ? '' : 'disabled'}>Buy ${resIcon('wool', 15)}${resIcon('grain', 15)}${resIcon('ore', 15)}</button>
    </div>`);
  $('dev-close').onclick = closeModal;
  $('dev-buy').onclick = () => {
    const r = G.buyDevCard(S);
    if (r.ok) {
      sfx.card();
      toast(`🃏 You drew: ${DEV_INFO[r.type].icon} ${DEV_INFO[r.type].name}`);
      closeModal();
      advance();
    }
  };
  $('modal-card').querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
    playDev(b.dataset.play);
  }));
}

function playDev(type) {
  closeModal();
  if (type === 'knight') {
    const r = G.playKnight(S);
    if (r.ok) { sfx.card(); advance(); }
  } else if (type === 'roadBuilding') {
    const r = G.playRoadBuilding(S);
    if (r.ok) { sfx.card(); advance(); }
  } else if (type === 'yearOfPlenty') {
    pickResources('🌽 Year of Plenty — take 2 resources', 2, (picks) => {
      const r = G.playYearOfPlenty(S, picks[0], picks[1]);
      if (r.ok) { sfx.card(); bumpHand(); advance(); }
    });
  } else if (type === 'monopoly') {
    pickResources('💰 Monopoly — name one resource', 1, (picks) => {
      const r = G.playMonopoly(S, picks[0]);
      if (r.ok) { sfx.card(); toast(`💰 You took ${r.taken} ${RESOURCE_INFO[picks[0]].name}!`); bumpHand(); advance(); }
    });
  }
}

function pickResources(title, count, done) {
  const picks = [];
  const renderPicker = () => {
    const btns = RESOURCES.map((r) => `
      <button class="res-pick" data-res="${r}" style="background:${RESOURCE_INFO[r].color}">
        <span class="ic">${resIcon(r, 26)}</span>${RESOURCE_INFO[r].name}</button>`).join('');
    showModal(`<h2>${title}</h2>
      <p>${count - picks.length} pick${count - picks.length > 1 ? 's' : ''} remaining${picks.length ? ' — chosen: ' + picks.map((r) => resIcon(r, 16)).join(' ') : ''}</p>
      <div class="res-picker">${btns}</div>
      <div class="modal-actions"><button class="btn" id="rp-cancel">Cancel</button></div>`);
    $('rp-cancel').onclick = closeModal;
    $('modal-card').querySelectorAll('.res-pick').forEach((b) => b.addEventListener('click', () => {
      picks.push(b.dataset.res);
      if (picks.length >= count) { closeModal(); done(picks); }
      else renderPicker();
    }));
  };
  renderPicker();
}

// ---------- Trade ----------
function showTradeModal() {
  const p = cur();
  const rateInfo = RESOURCES.map((r) => `<span class="rate">${resIcon(r, 16)}${G.tradeRate(S, p.id, r)}:1</span>`).join(' ');
  showModal(`
    <h2>⚖️ Trade</h2>
    <p>Your maritime rates: ${rateInfo}</p>
    <div class="modal-actions" style="justify-content:center">
      <button class="btn primary" id="trade-bank">🏦 Bank / Harbor</button>
      <button class="btn primary" id="trade-players">👥 Players</button>
      <button class="btn" id="trade-close">Close</button>
    </div>`);
  $('trade-close').onclick = closeModal;
  $('trade-bank').onclick = showBankTrade;
  $('trade-players').onclick = showPlayerTrade;
}

function showBankTrade() {
  const p = cur();
  const giveBtns = RESOURCES.map((r) => {
    const rate = G.tradeRate(S, p.id, r);
    const ok = p.resources[r] >= rate;
    return `<button class="res-pick" data-res="${r}" style="background:${RESOURCE_INFO[r].color}" ${ok ? '' : 'disabled'}>
      <span class="ic">${resIcon(r, 26)}</span>${rate}:1</button>`;
  }).join('');
  showModal(`<h2>🏦 Bank trade</h2><p>Give which resource? (your harbor rates shown)</p>
    <div class="res-picker">${giveBtns}</div>
    <div class="modal-actions"><button class="btn" id="bt-cancel">Cancel</button></div>`);
  $('bt-cancel').onclick = closeModal;
  $('modal-card').querySelectorAll('.res-pick:not([disabled])').forEach((b) => b.addEventListener('click', () => {
    const give = b.dataset.res;
    const getBtns = RESOURCES.filter((r) => r !== give).map((r) => `
      <button class="res-pick" data-res="${r}" style="background:${RESOURCE_INFO[r].color}" ${S.bank[r] > 0 ? '' : 'disabled'}>
        <span class="ic">${resIcon(r, 26)}</span>${RESOURCE_INFO[r].name}</button>`).join('');
    showModal(`<h2>🏦 Receive what?</h2><p>Trading ${G.tradeRate(S, p.id, give)} ${resIcon(give, 16)} for 1…</p>
      <div class="res-picker">${getBtns}</div>
      <div class="modal-actions"><button class="btn" id="bt-cancel2">Cancel</button></div>`);
    $('bt-cancel2').onclick = closeModal;
    $('modal-card').querySelectorAll('.res-pick:not([disabled])').forEach((b2) => b2.addEventListener('click', () => {
      const r = G.bankTrade(S, give, b2.dataset.res);
      closeModal();
      if (r.ok) { sfx.card(); bumpHand(); }
      else if (r.reason) toast('❌ ' + r.reason);
      advance();
    }));
  }));
}

function showPlayerTrade() {
  const p = cur();
  const give = {}, get = {};
  const counterRows = (obj, label) => `
    <p style="margin:8px 0 2px"><b>${label}</b></p>` +
    RESOURCES.map((r) => `
      <div class="counter-row" data-res="${r}" data-side="${label}">
        <span class="label">${resIcon(r, 20)} ${RESOURCE_INFO[r].name}</span>
        <button data-d="-1">−</button><span class="val">0</span><button data-d="1">+</button>
      </div>`).join('');
  showModal(`
    <h2>👥 Trade with a player</h2>
    ${counterRows(give, 'You give')}
    ${counterRows(get, 'You receive')}
    <div class="modal-actions">
      <button class="btn" id="pt-cancel">Cancel</button>
      <button class="btn primary" id="pt-next" disabled>Choose partner →</button>
    </div>`);

  const update = () => {
    const g = Object.values(give).reduce((a, b) => a + b, 0);
    const w = Object.values(get).reduce((a, b) => a + b, 0);
    $('pt-next').disabled = !(g > 0 && w > 0);
  };
  $('modal-card').querySelectorAll('.counter-row').forEach((row) => {
    const res = row.dataset.res;
    const obj = row.dataset.side === 'You give' ? give : get;
    const max = row.dataset.side === 'You give' ? p.resources[res] : 19;
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      obj[res] = Math.max(0, Math.min(max, (obj[res] || 0) + (+b.dataset.d)));
      row.querySelector('.val').textContent = obj[res];
      update();
    }));
  });
  $('pt-cancel').onclick = closeModal;
  $('pt-next').onclick = () => choosePartner(give, get);
}

function choosePartner(give, get) {
  const partners = S.players.filter((o) => o.id !== S.currentPlayer);
  const fmt = (o) => Object.entries(o).filter(([, n]) => n > 0).map(([r, n]) => `${n}${resIcon(r, 15)}`).join(' ') || '–';
  const btns = partners.map((o) => `
    <button class="partner-btn" data-pid="${o.id}">
      <span class="dot" style="background:${o.colorHex}"></span>
      ${escapeHtml(o.name)} ${o.isAI ? '🤖' : ''} — ${G.handSize(o)} cards</button>`).join('');
  showModal(`<h2>Offer: ${fmt(give)} → ${fmt(get)}</h2><p>Who do you want to trade with?</p>${btns}
    <div class="modal-actions"><button class="btn" id="cp-cancel">Cancel</button></div>`);
  $('cp-cancel').onclick = closeModal;
  $('modal-card').querySelectorAll('.partner-btn').forEach((b) => b.addEventListener('click', () => {
    const pid = +b.dataset.pid;
    const partner = S.players[pid];
    closeModal();
    if (partner.isAI) {
      const accepted = AI.evaluateTradeOffer(S, pid, give, get);
      if (accepted) {
        const r = G.executeTrade(S, S.currentPlayer, pid, give, get);
        if (r.ok) { toast(`🤝 ${partner.name} accepted the trade!`); sfx.card(); bumpHand(); }
        else toast('❌ Trade failed — check the cards on both sides.');
      } else {
        toast(`🙅 ${partner.name} declined your offer.`);
        sfx.bad();
      }
      advance();
    } else {
      // Hotseat: let the human partner decide.
      showModal(`
        <div class="pass-card">
          <h2>🤝 Trade offer for ${escapeHtml(partner.name)}</h2>
          <div class="big-dot" style="background:${partner.colorHex}"></div>
          <p><b>${escapeHtml(cur().name)}</b> offers <b>${fmt(give)}</b> in exchange for your <b>${fmt(get)}</b>.</p>
          <div class="modal-actions" style="justify-content:center">
            <button class="btn warn" id="ht-no">Decline</button>
            <button class="btn primary" id="ht-yes">Accept</button>
          </div>
        </div>`);
      $('ht-yes').onclick = () => {
        const r = G.executeTrade(S, S.currentPlayer, pid, give, get);
        closeModal();
        if (r.ok) { toast('🤝 Trade completed!'); sfx.card(); bumpHand(); }
        else toast('❌ Trade failed — not enough cards.');
        advance();
      };
      $('ht-no').onclick = () => { closeModal(); toast(`🙅 ${partner.name} declined.`); advance(); };
    }
  }));
}

// ---------- Winner ----------
function showWinner() {
  const w = S.players[S.winner];
  sfx.win();
  const rows = S.players
    .map((p) => ({ p, vp: G.totalVP(S, p) }))
    .sort((a, b) => b.vp - a.vp)
    .map(({ p, vp }) => `
      <div class="score-row">
        <span><span class="dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p.colorHex}"></span>
        ${escapeHtml(p.name)} ${p.hasLongestRoad ? '🛣️' : ''}${p.hasLargestArmy ? '⚔️' : ''}</span>
        <span>${vp} ★</span>
      </div>`).join('');
  showModal(`
    <div class="winner-card">
      <span class="trophy">🏆</span>
      <h2>${escapeHtml(w.name)} rules Catan!</h2>
      <p>All hidden victory points revealed:</p>
      ${rows}
      <div class="modal-actions" style="justify-content:center">
        <button class="btn primary big" id="win-again">Play again</button>
      </div>
    </div>`);
  $('win-again').onclick = () => { closeModal(); exitGame(); };
}

function exitGame() {
  gen++;
  S = null;
  $('game').classList.add('hidden');
  $('menu').classList.remove('hidden');
  if (onExitToMenu) onExitToMenu();
}

// ============================================================
// Static event wiring (called once)
// ============================================================
export function initUI() {
  // Fill the build tray with piece artwork and cost icons.
  for (const piece of ['road', 'settlement', 'city']) {
    const tray = $('tray-' + piece);
    tray.querySelector('svg').innerHTML = PIECE_INNER[piece];
    const costEl = tray.querySelector('.cost');
    costEl.innerHTML = costEl.dataset.cost.split(',').map((r) => resIcon(r, 11)).join('');
  }

  initDrag();

  $('btn-roll').addEventListener('click', () => {
    if (!S || cur().isAI || S.phase !== 'roll') return;
    hideBanner();
    doRoll();
  });

  $('btn-end').addEventListener('click', () => {
    if (!S || cur().isAI || S.phase !== 'main') return;
    clearSpots();
    G.endTurn(S);
    sfx.tap();
    advance();
  });

  $('btn-dev').addEventListener('click', () => {
    if (!S || cur().isAI) return;
    showDevModal();
  });

  $('btn-trade').addEventListener('click', () => {
    if (!S || cur().isAI || S.phase !== 'main') return;
    showTradeModal();
  });

  $('btn-log').addEventListener('click', () => $('log-panel').classList.toggle('hidden'));

  $('btn-menu').addEventListener('click', () => {
    if (!S) return;
    showModal(`
      <h2>☰ Menu</h2>
      <div class="modal-actions" style="justify-content:center">
        <button class="btn" id="m-sound">${sfx.isMuted() ? '🔇 Sound off' : '🔊 Sound on'}</button>
        <button class="btn" id="m-resume">Resume</button>
        <button class="btn warn" id="m-quit">Quit to menu</button>
      </div>`);
    $('m-resume').onclick = closeModal;
    $('m-sound').onclick = (ev) => {
      sfx.setMuted(!sfx.isMuted());
      ev.target.textContent = sfx.isMuted() ? '🔇 Sound off' : '🔊 Sound on';
    };
    $('m-quit').onclick = () => { closeModal(); exitGame(); };
  });

  // Tapping empty board area cancels tap-to-place mode (outside setup/free roads).
  $('board').addEventListener('click', () => {
    if (S && placingPiece && S.phase === 'main' && S.freeRoads === 0) clearSpots();
  });
}
