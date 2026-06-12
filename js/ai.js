// Heuristic AI opponent. Plays a full legal turn: dev cards, trades, builds.
// Pure module — returns a list of action descriptors the UI applies with delays
// so the human can watch the computer "think".

import { RESOURCES, BUILD_COSTS, PIECE_LIMITS, PIPS } from './constants.js';
import { vertexPips } from './board.js';
import * as G from './game.js';

// --- Evaluation helpers ---
function vertexScore(state, vid) {
  // Production pips + diversity bonus + harbor bonus.
  const v = state.board.vertices[vid];
  const resSeen = new Set();
  let pips = 0;
  for (const tid of v.tiles) {
    const t = state.board.tiles[tid];
    if (t.number && t.resource) { pips += PIPS[t.number]; resSeen.add(t.resource); }
  }
  let score = pips * 3 + resSeen.size * 2;
  const harbor = state.board.harbors.find((h) => h.vertices.includes(vid));
  if (harbor) score += harbor.type === '3:1' ? 2 : 3;
  return score;
}

export function pickSetupSettlement(state, playerId) {
  const legal = G.legalSettlementVertices(state, playerId, true);
  // Second placement: also weigh resources we don't have yet.
  const owned = new Set();
  for (const vid of state.players[playerId].settlements) {
    for (const tid of state.board.vertices[vid].tiles) {
      const t = state.board.tiles[tid];
      if (t.resource) owned.add(t.resource);
    }
  }
  let best = legal[0], bestScore = -1;
  for (const vid of legal) {
    let s = vertexScore(state, vid);
    for (const tid of state.board.vertices[vid].tiles) {
      const t = state.board.tiles[tid];
      if (t.resource && !owned.has(t.resource)) s += 2;
    }
    if (s > bestScore) { bestScore = s; best = vid; }
  }
  return best;
}

export function pickSetupRoad(state, playerId, settlementVid) {
  const legal = G.legalRoadEdges(state, playerId, settlementVid);
  // Point the road toward the best nearby expansion vertex.
  let best = legal[0], bestScore = -1;
  for (const eid of legal) {
    const e = state.board.edges[eid];
    const other = e.v1 === settlementVid ? e.v2 : e.v1;
    const s = vertexScore(state, other);
    if (s > bestScore) { bestScore = s; best = eid; }
  }
  return best;
}

export function pickDiscard(state, playerId) {
  // Discard the resources we hold the most of (keep a balanced hand).
  const p = state.players[playerId];
  const must = Math.floor(G.handSize(p) / 2);
  const hand = { ...p.resources };
  const out = {};
  for (let i = 0; i < must; i++) {
    const r = RESOURCES.reduce((a, b) => (hand[a] >= hand[b] ? a : b));
    hand[r]--;
    out[r] = (out[r] || 0) + 1;
  }
  return out;
}

export function pickRobberTile(state, playerId) {
  // Highest-pip tile adjacent to opponents but not to us.
  let best = null, bestScore = -1;
  for (const t of state.board.tiles) {
    if (t.id === state.board.robberTile || !t.number) continue;
    let oppPips = 0, mine = false;
    for (const vid of t.vertexIds) {
      const o = state.ownership.vertex[vid];
      if (!o) continue;
      if (o.player === playerId) mine = true;
      else oppPips += PIPS[t.number] * (o.type === 'city' ? 2 : 1);
    }
    if (mine) continue;
    if (oppPips > bestScore) { bestScore = oppPips; best = t.id; }
  }
  if (best === null) {
    // Fallback: any tile not adjacent to us (or any tile at all).
    best = state.board.tiles.find((t) =>
      t.id !== state.board.robberTile &&
      !t.vertexIds.some((vid) => state.ownership.vertex[vid]?.player === playerId)
    )?.id ?? state.board.tiles.find((t) => t.id !== state.board.robberTile).id;
  }
  return best;
}

export function pickStealVictim(state, candidates) {
  // Steal from the player with the most public victory points.
  return candidates.reduce((a, b) =>
    G.publicVP(state, state.players[a]) >= G.publicVP(state, state.players[b]) ? a : b
  );
}

// Should this AI accept a trade offer from another player?
export function evaluateTradeOffer(state, playerId, give, get) {
  // `playerId` receives `give` and pays `get`.
  const p = state.players[playerId];
  if (RESOURCES.some((r) => (get[r] || 0) > p.resources[r])) return false;
  const value = (o, sign) => RESOURCES.reduce((s, r) => {
    const n = o[r] || 0;
    // Cards of a resource we're short on are worth more.
    const scarcity = p.resources[r] <= 1 ? 1.5 : p.resources[r] >= 4 ? 0.7 : 1;
    return s + sign * n * scarcity;
  }, 0);
  const net = value(give, 1) + value(get, -1);
  // Don't help the leader.
  const leader = state.players.reduce((a, b) => (G.publicVP(state, a) >= G.publicVP(state, b) ? a : b));
  if (leader.id === state.currentPlayer && G.publicVP(state, leader) >= 7) return false;
  return net > 0;
}

// --- Main turn planner ---
// Returns an array of actions: { type, ...args }. The UI executes them in order.
export function planTurn(state) {
  const actions = [];
  const pid = state.currentPlayer;
  const p = state.players[pid];

  // Play a knight before rolling if the robber blocks one of our tiles.
  const robberHurtsUs = state.board.tiles[state.board.robberTile].vertexIds
    .some((vid) => state.ownership.vertex[vid]?.player === pid);
  const hasPlayableKnight = p.devCards.some((c) => c.type === 'knight' && c.boughtTurn < state.turn);
  if (robberHurtsUs && hasPlayableKnight && !state.devPlayedThisTurn) {
    actions.push({ type: 'knight' });
  }

  actions.push({ type: 'roll' });
  actions.push({ type: 'mainPhase' }); // marker: planner re-evaluates after roll
  return actions;
}

// Called repeatedly during the main phase; returns the next single action or null (=> end turn).
export function nextMainAction(state) {
  const pid = state.currentPlayer;
  const p = state.players[pid];

  // 1. Free roads from Road Building must be placed.
  if (state.freeRoads > 0) {
    const spot = bestRoadSpot(state, pid);
    if (spot !== null) return { type: 'buildRoad', edge: spot };
    state.freeRoads = 0; // nowhere to build
  }

  // 2. City upgrade (best VP per resource).
  if (p.cities.length < PIECE_LIMITS.city && p.settlements.length > 0 && G.canAfford(p, BUILD_COSTS.city)) {
    const vid = p.settlements.reduce((a, b) => (vertexPips(state.board, a) >= vertexPips(state.board, b) ? a : b));
    return { type: 'buildCity', vertex: vid };
  }

  // 3. New settlement.
  if (p.settlements.length < PIECE_LIMITS.settlement && G.canAfford(p, BUILD_COSTS.settlement)) {
    const spots = G.legalSettlementVertices(state, pid);
    if (spots.length) {
      const vid = spots.reduce((a, b) => (vertexScore(state, a) >= vertexScore(state, b) ? a : b));
      return { type: 'buildSettlement', vertex: vid };
    }
  }

  // 4. Play useful dev cards.
  if (!state.devPlayedThisTurn) {
    const playable = (t) => p.devCards.some((c) => c.type === t && c.boughtTurn < state.turn);
    if (playable('yearOfPlenty')) {
      const needs = settlementNeeds(p);
      return { type: 'yearOfPlenty', res1: needs[0], res2: needs[1] };
    }
    if (playable('monopoly')) {
      // Take the resource most held by opponents.
      let bestRes = 'grain', bestCount = -1;
      for (const r of RESOURCES) {
        const cnt = state.players.filter((o) => o.id !== pid).reduce((s, o) => s + o.resources[r], 0);
        if (cnt > bestCount) { bestCount = cnt; bestRes = r; }
      }
      if (bestCount >= 3) return { type: 'monopoly', res: bestRes };
    }
    if (playable('roadBuilding') && p.roads.length <= PIECE_LIMITS.road - 2) {
      return { type: 'roadBuilding' };
    }
    if (playable('knight') && p.playedKnights < 5) {
      const robberHurtsUs = state.board.tiles[state.board.robberTile].vertexIds
        .some((vid) => state.ownership.vertex[vid]?.player === pid);
      const holder = state.players.find((o) => o.hasLargestArmy);
      const chasing = !holder || holder.id === pid || p.playedKnights + 1 > holder.playedKnights;
      if (robberHurtsUs || chasing) return { type: 'knight' };
    }
  }

  // 5. Buy a dev card if rich.
  if (state.devDeck.length && G.canAfford(p, BUILD_COSTS.devCard) && G.handSize(p) >= 5) {
    return { type: 'buyDev' };
  }

  // 6. Road toward expansion.
  if (p.roads.length < PIECE_LIMITS.road && G.canAfford(p, BUILD_COSTS.road) &&
      p.settlements.length < PIECE_LIMITS.settlement && G.handSize(p) >= 4) {
    const spot = bestRoadSpot(state, pid);
    if (spot !== null) return { type: 'buildRoad', edge: spot };
  }

  // 7. Bank trade surplus toward what we need next.
  const trade = planBankTrade(state, pid);
  if (trade) return trade;

  return null; // end turn
}

function settlementNeeds(p) {
  // Two resources we're shortest on, biased toward settlement/city costs.
  const wanted = ['grain', 'ore', 'brick', 'lumber', 'wool'];
  const sorted = wanted.slice().sort((a, b) => p.resources[a] - p.resources[b]);
  return [sorted[0], sorted[1]];
}

function bestRoadSpot(state, pid) {
  const legal = G.legalRoadEdges(state, pid);
  if (!legal.length) return null;
  // Prefer edges whose far vertex could host a future settlement (free + high score).
  let best = legal[0], bestScore = -1;
  for (const eid of legal) {
    const e = state.board.edges[eid];
    for (const vid of [e.v1, e.v2]) {
      let s = vertexScore(state, vid);
      if (G.isVertexFree(state, vid)) s += 5;
      if (s > bestScore) { bestScore = s; best = eid; }
    }
  }
  return best;
}

function planBankTrade(state, pid) {
  const p = state.players[pid];
  // What are we saving for? Pick the cheapest goal we're closest to.
  const goals = [];
  if (p.settlements.length > 0 && p.cities.length < PIECE_LIMITS.city) goals.push(BUILD_COSTS.city);
  if (p.settlements.length < PIECE_LIMITS.settlement) goals.push(BUILD_COSTS.settlement);
  goals.push(BUILD_COSTS.devCard);

  for (const goal of goals) {
    const missing = RESOURCES.filter((r) => (goal[r] || 0) > p.resources[r]);
    if (!missing.length) continue;
    for (const need of missing) {
      if (state.bank[need] < 1) continue;
      for (const r of RESOURCES) {
        if (goal[r]) continue; // don't trade away what the goal needs
        const rate = G.tradeRate(state, pid, r);
        if (p.resources[r] >= rate + 1 || (p.resources[r] >= rate && !goal[r])) {
          if (p.resources[r] >= rate) return { type: 'bankTrade', give: r, get: need };
        }
      }
    }
  }
  return null;
}
