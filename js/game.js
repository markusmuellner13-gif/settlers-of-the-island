// Catan rules engine — pure state machine, no DOM.
// All real base-game rules: setup snake draft, production, robber, discards,
// building (with piece limits + bank limits), dev cards, trading (domestic +
// maritime with harbors), longest road, largest army, 10 VP to win.

import {
  RESOURCES, PIECE_LIMITS, BANK_PER_RESOURCE, DEV_DECK, BUILD_COSTS,
  VICTORY_POINTS_TO_WIN, LONGEST_ROAD_MIN, LARGEST_ARMY_MIN, ROBBER_HAND_LIMIT,
  PLAYER_COLORS,
} from './constants.js';
import { generateBoard, shuffle, makeRng, harborAtVertex } from './board.js';

// ---------- Setup ----------
export function newGame({ players, seed }) {
  // players: [{ name, isAI }]
  const rng = seed != null ? makeRng(seed) : Math.random;
  const board = generateBoard(rng);

  const state = {
    rng,
    board,
    players: players.map((p, i) => ({
      id: i,
      name: p.name,
      isAI: !!p.isAI,
      color: PLAYER_COLORS[i].id,
      colorHex: PLAYER_COLORS[i].hex,
      resources: { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 },
      devCards: [],            // { type, boughtTurn }
      playedKnights: 0,
      settlements: [],         // vertex ids
      cities: [],              // vertex ids
      roads: [],               // edge ids
      hasLongestRoad: false,
      hasLargestArmy: false,
    })),
    bank: { brick: BANK_PER_RESOURCE, lumber: BANK_PER_RESOURCE, wool: BANK_PER_RESOURCE, grain: BANK_PER_RESOURCE, ore: BANK_PER_RESOURCE },
    devDeck: shuffle(DEV_DECK, rng),
    ownership: {
      vertex: {},   // vertexId -> { player, type: 'settlement'|'city' }
      edge: {},     // edgeId -> player
    },
    turn: 0,
    currentPlayer: 0,
    phase: 'setup',           // setup | roll | discard | robber | steal | main | gameOver
    setupQueue: buildSetupQueue(players.length),
    setupIndex: 0,
    setupPlacedVertex: null,  // settlement just placed (road must attach)
    dice: null,
    devPlayedThisTurn: false,
    freeRoads: 0,             // road building card
    pendingDiscards: [],      // player ids that must discard
    pendingSteal: null,       // { candidates: [playerIds] }
    longestRoadLength: 0,
    winner: null,
    log: [],
  };
  log(state, `A new island of Catan has formed. ${state.players[0].name} places first.`);
  return state;
}

function buildSetupQueue(n) {
  // Snake draft: 0..n-1 then n-1..0; each entry places 1 settlement + 1 road.
  const order = [];
  for (let i = 0; i < n; i++) order.push(i);
  for (let i = n - 1; i >= 0; i--) order.push(i);
  return order;
}

export function log(state, msg) {
  state.log.push(msg);
  if (state.log.length > 200) state.log.shift();
}

// ---------- Helpers ----------
export function player(state, id = state.currentPlayer) { return state.players[id]; }

export function handSize(p) { return RESOURCES.reduce((s, r) => s + p.resources[r], 0); }

export function canAfford(p, cost) {
  return Object.entries(cost).every(([r, n]) => p.resources[r] >= n);
}

function pay(state, p, cost) {
  for (const [r, n] of Object.entries(cost)) { p.resources[r] -= n; state.bank[r] += n; }
}

function gain(state, p, res, n) {
  const granted = Math.min(n, state.bank[res]);
  p.resources[res] += granted;
  state.bank[res] -= granted;
  return granted;
}

export function totalVP(state, p, includeHidden = true) {
  let vp = p.settlements.length + p.cities.length * 2;
  if (p.hasLongestRoad) vp += 2;
  if (p.hasLargestArmy) vp += 2;
  if (includeHidden) vp += p.devCards.filter((c) => c.type === 'victoryPoint').length;
  return vp;
}

export function publicVP(state, p) { return totalVP(state, p, false); }

function checkWin(state) {
  const p = player(state);
  if (totalVP(state, p) >= VICTORY_POINTS_TO_WIN) {
    state.winner = p.id;
    state.phase = 'gameOver';
    log(state, `🏆 ${p.name} wins with ${totalVP(state, p)} victory points!`);
    return true;
  }
  return false;
}

// ---------- Legal placement ----------
export function isVertexFree(state, vid) {
  // Distance rule: vertex empty AND no adjacent vertex occupied.
  if (state.ownership.vertex[vid]) return false;
  return !state.board.vertices[vid].adjacent.some((a) => state.ownership.vertex[a]);
}

export function legalSettlementVertices(state, playerId, isSetup = false) {
  const out = [];
  for (const v of state.board.vertices) {
    if (!isVertexFree(state, v.id)) continue;
    if (isSetup) { out.push(v.id); continue; }
    // Must touch one of the player's roads.
    const touchesRoad = v.edges.some((eid) => state.ownership.edge[eid] === playerId);
    if (touchesRoad) out.push(v.id);
  }
  return out;
}

export function legalRoadEdges(state, playerId, attachVertex = null) {
  const out = [];
  for (const e of state.board.edges) {
    if (state.ownership.edge[e.id] !== undefined) continue;
    if (attachVertex !== null) {
      // Setup: road must touch the just-placed settlement.
      if (e.v1 === attachVertex || e.v2 === attachVertex) out.push(e.id);
      continue;
    }
    // Connected to own road (not blocked through an opponent building) or own building.
    for (const vid of [e.v1, e.v2]) {
      const owner = state.ownership.vertex[vid];
      if (owner && owner.player === playerId) { out.push(e.id); break; }
      if (owner && owner.player !== playerId) continue; // blocked through opponent building
      const v = state.board.vertices[vid];
      if (v.edges.some((eid) => eid !== e.id && state.ownership.edge[eid] === playerId)) {
        out.push(e.id); break;
      }
    }
  }
  return out;
}

export function legalCityVertices(state, playerId) {
  return state.players[playerId].settlements.slice();
}

// ---------- Setup phase ----------
export function setupPlaceSettlement(state, vid) {
  const p = player(state);
  if (state.phase !== 'setup' || state.setupPlacedVertex !== null) return { ok: false };
  if (!isVertexFree(state, vid)) return { ok: false };
  p.settlements.push(vid);
  state.ownership.vertex[vid] = { player: p.id, type: 'settlement' };
  state.setupPlacedVertex = vid;

  // Second settlement: collect starting resources from adjacent tiles.
  const isSecondRound = state.setupIndex >= state.players.length;
  const gained = {};
  if (isSecondRound) {
    for (const tid of state.board.vertices[vid].tiles) {
      const t = state.board.tiles[tid];
      if (t.resource) { gain(state, p, t.resource, 1); gained[t.resource] = (gained[t.resource] || 0) + 1; }
    }
  }
  log(state, `${p.name} founded a settlement.`);
  return { ok: true, gained };
}

export function setupPlaceRoad(state, eid) {
  const p = player(state);
  if (state.phase !== 'setup' || state.setupPlacedVertex === null) return { ok: false };
  const legal = legalRoadEdges(state, p.id, state.setupPlacedVertex);
  if (!legal.includes(eid)) return { ok: false };
  p.roads.push(eid);
  state.ownership.edge[eid] = p.id;
  state.setupPlacedVertex = null;
  state.setupIndex++;
  log(state, `${p.name} built a road.`);

  if (state.setupIndex >= state.setupQueue.length) {
    state.phase = 'roll';
    state.currentPlayer = 0;
    log(state, `Setup complete — ${player(state).name} starts. Roll the dice!`);
  } else {
    state.currentPlayer = state.setupQueue[state.setupIndex];
  }
  return { ok: true };
}

// ---------- Dice & production ----------
export function rollDice(state) {
  if (state.phase !== 'roll') return { ok: false };
  const d1 = 1 + Math.floor(state.rng() * 6);
  const d2 = 1 + Math.floor(state.rng() * 6);
  const total = d1 + d2;
  state.dice = [d1, d2];
  log(state, `${player(state).name} rolled ${d1} + ${d2} = ${total}.`);

  if (total === 7) {
    state.pendingDiscards = state.players
      .filter((p) => handSize(p) > ROBBER_HAND_LIMIT)
      .map((p) => p.id);
    state.phase = state.pendingDiscards.length ? 'discard' : 'robber';
    if (state.pendingDiscards.length) log(state, 'A 7! Players with more than 7 cards must discard half.');
    else log(state, `A 7! ${player(state).name} moves the robber.`);
    return { ok: true, total, robber: true };
  }

  const production = distribute(state, total);
  state.phase = 'main';
  return { ok: true, total, production };
}

function distribute(state, number) {
  // Bank-shortage rule: if the bank can't fully supply a resource needed by
  // MORE than one player, nobody gets that resource; a single player gets the rest.
  const wants = {}; // res -> Map(playerId -> count)
  for (const t of state.board.tiles) {
    if (t.number !== number || t.id === state.board.robberTile || !t.resource) continue;
    for (const vid of t.vertexIds) {
      const own = state.ownership.vertex[vid];
      if (!own) continue;
      const n = own.type === 'city' ? 2 : 1;
      wants[t.resource] = wants[t.resource] || new Map();
      wants[t.resource].set(own.player, (wants[t.resource].get(own.player) || 0) + n);
    }
  }
  const production = {}; // playerId -> {res: n}
  for (const [res, m] of Object.entries(wants)) {
    const totalWanted = [...m.values()].reduce((a, b) => a + b, 0);
    if (totalWanted > state.bank[res] && m.size > 1) {
      log(state, `Bank is out of ${res} — no one receives any.`);
      continue;
    }
    for (const [pid, n] of m) {
      const got = gain(state, state.players[pid], res, n);
      if (got > 0) {
        production[pid] = production[pid] || {};
        production[pid][res] = (production[pid][res] || 0) + got;
      }
    }
  }
  for (const [pid, res] of Object.entries(production)) {
    const txt = Object.entries(res).map(([r, n]) => `${n} ${r}`).join(', ');
    log(state, `${state.players[pid].name} receives ${txt}.`);
  }
  return production;
}

// ---------- Robber ----------
export function discardCards(state, playerId, cards) {
  if (state.phase !== 'discard' || !state.pendingDiscards.includes(playerId)) return { ok: false };
  const p = state.players[playerId];
  const must = Math.floor(handSize(p) / 2);
  const total = RESOURCES.reduce((s, r) => s + (cards[r] || 0), 0);
  if (total !== must) return { ok: false, must };
  if (RESOURCES.some((r) => (cards[r] || 0) > p.resources[r])) return { ok: false };
  for (const r of RESOURCES) {
    const n = cards[r] || 0;
    p.resources[r] -= n; state.bank[r] += n;
  }
  state.pendingDiscards = state.pendingDiscards.filter((id) => id !== playerId);
  log(state, `${p.name} discards ${must} cards.`);
  if (!state.pendingDiscards.length) {
    state.phase = 'robber';
    log(state, `${player(state).name} moves the robber.`);
  }
  return { ok: true };
}

export function moveRobber(state, tileId) {
  if (state.phase !== 'robber') return { ok: false };
  if (tileId === state.board.robberTile) return { ok: false };
  state.board.robberTile = tileId;
  const t = state.board.tiles[tileId];
  log(state, `${player(state).name} moved the robber to ${t.terrain}${t.number ? ' (' + t.number + ')' : ''}.`);

  // Victims: players (not self) with buildings adjacent + at least 1 card.
  const candidates = [...new Set(
    t.vertexIds
      .map((vid) => state.ownership.vertex[vid])
      .filter((o) => o && o.player !== state.currentPlayer)
      .map((o) => o.player)
  )].filter((pid) => handSize(state.players[pid]) > 0);

  if (candidates.length === 0) {
    finishRobber(state);
    return { ok: true, candidates: [] };
  }
  state.pendingSteal = { candidates };
  state.phase = 'steal';
  return { ok: true, candidates };
}

export function stealFrom(state, victimId) {
  if (state.phase !== 'steal' || !state.pendingSteal.candidates.includes(victimId)) return { ok: false };
  const victim = state.players[victimId];
  const pool = RESOURCES.flatMap((r) => Array(victim.resources[r]).fill(r));
  const res = pool[Math.floor(state.rng() * pool.length)];
  victim.resources[res]--;
  player(state).resources[res]++;
  state.pendingSteal = null;
  log(state, `${player(state).name} stole a card from ${victim.name}.`);
  finishRobber(state);
  return { ok: true, res };
}

// Robber resolved — return to 'main', or back to 'roll' if a knight was played pre-roll.
function finishRobber(state) {
  if (state.phaseBeforeKnight === 'roll' && state.dice === null) state.phase = 'roll';
  else state.phase = 'main';
  state.phaseBeforeKnight = null;
}

// ---------- Building ----------
export function buildRoad(state, eid, free = false) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (p.roads.length >= PIECE_LIMITS.road) return { ok: false, reason: 'No road pieces left' };
  if (!free && state.freeRoads === 0 && !canAfford(p, BUILD_COSTS.road)) return { ok: false, reason: 'Not enough resources' };
  if (!legalRoadEdges(state, p.id).includes(eid)) return { ok: false, reason: 'Illegal spot' };

  if (state.freeRoads > 0) state.freeRoads--;
  else if (!free) pay(state, p, BUILD_COSTS.road);

  p.roads.push(eid);
  state.ownership.edge[eid] = p.id;
  log(state, `${p.name} built a road.`);
  updateLongestRoad(state);
  checkWin(state);
  return { ok: true };
}

export function buildSettlement(state, vid) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (p.settlements.length >= PIECE_LIMITS.settlement) return { ok: false, reason: 'No settlement pieces left' };
  if (!canAfford(p, BUILD_COSTS.settlement)) return { ok: false, reason: 'Not enough resources' };
  if (!legalSettlementVertices(state, p.id).includes(vid)) return { ok: false, reason: 'Illegal spot' };

  pay(state, p, BUILD_COSTS.settlement);
  p.settlements.push(vid);
  state.ownership.vertex[vid] = { player: p.id, type: 'settlement' };
  log(state, `${p.name} founded a settlement.`);
  updateLongestRoad(state); // a new settlement can break an opponent's road
  checkWin(state);
  return { ok: true };
}

export function buildCity(state, vid) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (p.cities.length >= PIECE_LIMITS.city) return { ok: false, reason: 'No city pieces left' };
  if (!canAfford(p, BUILD_COSTS.city)) return { ok: false, reason: 'Not enough resources' };
  if (!p.settlements.includes(vid)) return { ok: false, reason: 'Must upgrade your own settlement' };

  pay(state, p, BUILD_COSTS.city);
  p.settlements = p.settlements.filter((v) => v !== vid);
  p.cities.push(vid);
  state.ownership.vertex[vid] = { player: p.id, type: 'city' };
  log(state, `${p.name} upgraded to a city!`);
  checkWin(state);
  return { ok: true };
}

export function buyDevCard(state) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (!state.devDeck.length) return { ok: false, reason: 'No development cards left' };
  if (!canAfford(p, BUILD_COSTS.devCard)) return { ok: false, reason: 'Not enough resources' };
  pay(state, p, BUILD_COSTS.devCard);
  const type = state.devDeck.pop();
  p.devCards.push({ type, boughtTurn: state.turn });
  log(state, `${p.name} bought a development card.`);
  checkWin(state); // VP card could win immediately
  return { ok: true, type };
}

// ---------- Dev cards ----------
function takeDevCard(state, p, type) {
  // Can't play a card bought this turn; only one dev card per turn (VP cards excluded).
  if (state.devPlayedThisTurn) return null;
  const idx = p.devCards.findIndex((c) => c.type === type && c.boughtTurn < state.turn);
  if (idx === -1) return null;
  const [card] = p.devCards.splice(idx, 1);
  state.devPlayedThisTurn = true;
  return card;
}

export function playKnight(state) {
  const p = player(state);
  if (state.phase !== 'main' && state.phase !== 'roll') return { ok: false };
  if (!takeDevCard(state, p, 'knight')) return { ok: false };
  p.playedKnights++;
  log(state, `${p.name} plays a Knight! (${p.playedKnights} total)`);
  updateLargestArmy(state);
  state.phaseBeforeKnight = state.phase; // resume here after robber resolves
  state.phase = 'robber';
  checkWin(state);
  return { ok: true };
}

export function playRoadBuilding(state) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (!takeDevCard(state, p, 'roadBuilding')) return { ok: false };
  state.freeRoads = Math.min(2, PIECE_LIMITS.road - p.roads.length);
  log(state, `${p.name} plays Road Building — ${state.freeRoads} free roads.`);
  return { ok: true, roads: state.freeRoads };
}

export function playYearOfPlenty(state, res1, res2) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (!takeDevCard(state, p, 'yearOfPlenty')) return { ok: false };
  gain(state, p, res1, 1);
  gain(state, p, res2, 1);
  log(state, `${p.name} plays Year of Plenty: ${res1} + ${res2}.`);
  return { ok: true };
}

export function playMonopoly(state, res) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  if (!takeDevCard(state, p, 'monopoly')) return { ok: false };
  let taken = 0;
  for (const other of state.players) {
    if (other.id === p.id) continue;
    taken += other.resources[res];
    p.resources[res] += other.resources[res];
    other.resources[res] = 0;
  }
  log(state, `${p.name} plays Monopoly on ${res} and takes ${taken} cards!`);
  return { ok: true, taken };
}

// ---------- Trading ----------
export function tradeRate(state, playerId, res) {
  // Best maritime rate for this resource: 4, 3 (generic harbor), or 2 (resource harbor).
  const p = state.players[playerId];
  let rate = 4;
  const spots = [...p.settlements, ...p.cities];
  for (const vid of spots) {
    const h = harborAtVertex(state.board, vid);
    if (h === '3:1') rate = Math.min(rate, 3);
    if (h === res) rate = Math.min(rate, 2);
  }
  return rate;
}

export function bankTrade(state, giveRes, getRes) {
  const p = player(state);
  if (state.phase !== 'main') return { ok: false };
  const rate = tradeRate(state, p.id, giveRes);
  if (p.resources[giveRes] < rate) return { ok: false, reason: `Need ${rate} ${giveRes}` };
  if (state.bank[getRes] < 1) return { ok: false, reason: 'Bank is out of that resource' };
  p.resources[giveRes] -= rate; state.bank[giveRes] += rate;
  gain(state, p, getRes, 1);
  log(state, `${p.name} trades ${rate} ${giveRes} → 1 ${getRes} with the bank.`);
  return { ok: true, rate };
}

export function executeTrade(state, fromId, toId, give, get) {
  // give/get: {res: n} — `from` gives `give`, receives `get`.
  const a = state.players[fromId], b = state.players[toId];
  if (RESOURCES.some((r) => (give[r] || 0) > a.resources[r])) return { ok: false };
  if (RESOURCES.some((r) => (get[r] || 0) > b.resources[r])) return { ok: false };
  for (const r of RESOURCES) {
    a.resources[r] += (get[r] || 0) - (give[r] || 0);
    b.resources[r] += (give[r] || 0) - (get[r] || 0);
  }
  const fmt = (o) => Object.entries(o).filter(([, n]) => n > 0).map(([r, n]) => `${n} ${r}`).join(', ') || 'nothing';
  log(state, `${a.name} trades ${fmt(give)} → ${fmt(get)} with ${b.name}.`);
  return { ok: true };
}

// ---------- Longest road / largest army ----------
export function longestRoadOf(state, playerId) {
  // Longest simple path in the player's road subgraph.
  // Opponent buildings break continuity at that vertex.
  const myEdges = new Set(
    Object.entries(state.ownership.edge)
      .filter(([, pid]) => pid === playerId)
      .map(([eid]) => +eid)
  );
  let best = 0;
  const blocked = (vid) => {
    const o = state.ownership.vertex[vid];
    return o && o.player !== playerId;
  };
  const walk = (vid, used, len) => {
    best = Math.max(best, len);
    if (blocked(vid)) return; // can't continue through opponent's building
    for (const eid of state.board.vertices[vid].edges) {
      if (!myEdges.has(eid) || used.has(eid)) continue;
      const e = state.board.edges[eid];
      used.add(eid);
      walk(e.v1 === vid ? e.v2 : e.v1, used, len + 1);
      used.delete(eid);
    }
  };
  for (const eid of myEdges) {
    const e = state.board.edges[eid];
    for (const start of [e.v1, e.v2]) {
      const used = new Set([eid]);
      walk(e.v1 === start ? e.v2 : e.v1, used, 1);
    }
  }
  return best;
}

export function updateLongestRoad(state) {
  const lengths = state.players.map((p) => longestRoadOf(state, p.id));
  const holder = state.players.find((p) => p.hasLongestRoad);
  let best = holder ? lengths[holder.id] : 0;
  let bestPlayer = holder || null;
  for (const p of state.players) {
    if (lengths[p.id] >= LONGEST_ROAD_MIN && lengths[p.id] > best) {
      best = lengths[p.id];
      bestPlayer = p;
    }
  }
  // Holder loses the card if they dropped below 5 (road broken by a settlement).
  if (holder && lengths[holder.id] < LONGEST_ROAD_MIN) {
    holder.hasLongestRoad = false;
    bestPlayer = null;
    let max = 0;
    for (const p of state.players) {
      if (lengths[p.id] >= LONGEST_ROAD_MIN && lengths[p.id] > max) { max = lengths[p.id]; bestPlayer = p; }
    }
  }
  if (bestPlayer && !bestPlayer.hasLongestRoad) {
    for (const p of state.players) p.hasLongestRoad = false;
    bestPlayer.hasLongestRoad = true;
    log(state, `🛣️ ${bestPlayer.name} now holds the Longest Road (${lengths[bestPlayer.id]})!`);
  }
  state.longestRoadLength = Math.max(...lengths);
}

export function updateLargestArmy(state) {
  const holder = state.players.find((p) => p.hasLargestArmy);
  const threshold = holder ? holder.playedKnights : LARGEST_ARMY_MIN - 1;
  for (const p of state.players) {
    if (p.playedKnights >= LARGEST_ARMY_MIN && p.playedKnights > threshold) {
      for (const o of state.players) o.hasLargestArmy = false;
      p.hasLargestArmy = true;
      log(state, `⚔️ ${p.name} now holds the Largest Army (${p.playedKnights} knights)!`);
    }
  }
}

// ---------- Turn flow ----------
export function endTurn(state) {
  if (state.phase !== 'main') return { ok: false };
  state.freeRoads = 0;
  state.devPlayedThisTurn = false;
  state.dice = null;
  state.turn++;
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  state.phase = 'roll';
  log(state, `— ${player(state).name}'s turn —`);
  return { ok: true };
}
