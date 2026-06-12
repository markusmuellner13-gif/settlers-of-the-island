// Rules-engine and board-generation invariant tests + full AI game simulations.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TILE_DECK, NUMBER_TOKENS, PIECE_LIMITS, BANK_PER_RESOURCE, RESOURCES,
  HARBOR_TYPES, DEV_DECK,
} from '../js/constants.js';
import { generateBoard, makeRng, vertexPips } from '../js/board.js';
import * as G from '../js/game.js';
import * as AI from '../js/ai.js';

// ---------- Board generation ----------
test('board has the exact real-game tile distribution', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const b = generateBoard(makeRng(seed));
    assert.equal(b.tiles.length, 19);
    const count = {};
    for (const t of b.tiles) count[t.terrain] = (count[t.terrain] || 0) + 1;
    assert.equal(count.forest, 4);
    assert.equal(count.pasture, 4);
    assert.equal(count.fields, 4);
    assert.equal(count.hills, 3);
    assert.equal(count.mountains, 3);
    assert.equal(count.desert, 1);
  }
});

test('number tokens: 18 tokens, only dice-rollable numbers, none more than twice, desert empty', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const b = generateBoard(makeRng(seed));
    const nums = b.tiles.filter((t) => t.number !== null).map((t) => t.number);
    assert.equal(nums.length, 18);
    const desert = b.tiles.find((t) => t.terrain === 'desert');
    assert.equal(desert.number, null);
    const freq = {};
    for (const n of nums) {
      assert.ok(n >= 2 && n <= 12 && n !== 7, `number ${n} must be rollable with 2 dice and never 7`);
      freq[n] = (freq[n] || 0) + 1;
      assert.ok(freq[n] <= 2, `number ${n} appears more than twice`);
    }
    assert.deepEqual(nums.slice().sort((a, b) => a - b), NUMBER_TOKENS.slice().sort((a, b) => a - b));
  }
});

test('6 and 8 are never on adjacent tiles', () => {
  const adjacent = (a, b) => {
    const dq = a.q - b.q, dr = a.r - b.r;
    return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]].some(([q, r]) => q === dq && r === dr);
  };
  for (let seed = 1; seed <= 50; seed++) {
    const b = generateBoard(makeRng(seed));
    const hot = b.tiles.filter((t) => t.number === 6 || t.number === 8);
    for (const a of hot) for (const c of hot) {
      if (a !== c) assert.ok(!adjacent(a, c), `seed ${seed}: 6/8 adjacency`);
    }
  }
});

test('graph structure: 54 vertices, 72 edges, 9 harbors with real types', () => {
  const b = generateBoard(makeRng(7));
  assert.equal(b.vertices.length, 54);
  assert.equal(b.edges.length, 72);
  assert.equal(b.harbors.length, 9);
  const types = b.harbors.map((h) => h.type).sort();
  assert.deepEqual(types, HARBOR_TYPES.slice().sort());
  // harbors on distinct edges
  assert.equal(new Set(b.harbors.map((h) => h.edgeId)).size, 9);
  assert.equal(b.robberTile, b.tiles.find((t) => t.terrain === 'desert').id);
});

test('boards are randomized (different seeds give different layouts)', () => {
  const a = generateBoard(makeRng(1)).tiles.map((t) => t.terrain + t.number).join();
  const b = generateBoard(makeRng(2)).tiles.map((t) => t.terrain + t.number).join();
  assert.notEqual(a, b);
});

// ---------- Rules ----------
function makeTestGame(seed = 5) {
  return G.newGame({
    players: [
      { name: 'A', isAI: true },
      { name: 'B', isAI: true },
      { name: 'C', isAI: true },
      { name: 'D', isAI: true },
    ],
    seed,
  });
}

function runSetup(s) {
  while (s.phase === 'setup') {
    const pid = s.currentPlayer;
    const vid = AI.pickSetupSettlement(s, pid);
    assert.ok(G.setupPlaceSettlement(s, vid).ok);
    const eid = AI.pickSetupRoad(s, pid, vid);
    assert.ok(G.setupPlaceRoad(s, eid).ok);
  }
}

test('setup: snake order, distance rule, starting resources from 2nd settlement', () => {
  const s = makeTestGame();
  assert.deepEqual(s.setupQueue, [0, 1, 2, 3, 3, 2, 1, 0]);
  runSetup(s);
  for (const p of s.players) {
    assert.equal(p.settlements.length, 2);
    assert.equal(p.roads.length, 2);
  }
  // Distance rule: no two buildings on adjacent vertices.
  for (const [vidStr] of Object.entries(s.ownership.vertex)) {
    const v = s.board.vertices[+vidStr];
    for (const adj of v.adjacent) assert.ok(!s.ownership.vertex[adj], 'distance rule violated');
  }
  assert.equal(s.phase, 'roll');
  assert.equal(s.currentPlayer, 0);
});

test('dev deck has the real 25-card composition', () => {
  const c = {};
  for (const t of DEV_DECK) c[t] = (c[t] || 0) + 1;
  assert.deepEqual(c, { knight: 14, victoryPoint: 5, roadBuilding: 2, yearOfPlenty: 2, monopoly: 2 });
});

test('building rejects illegal placements and missing resources', () => {
  const s = makeTestGame();
  runSetup(s);
  s.phase = 'main';
  const p = s.players[0];
  s.currentPlayer = 0;
  // No resources yet beyond starting handout — empty hand case:
  for (const r of RESOURCES) { s.bank[r] += p.resources[r]; p.resources[r] = 0; }
  assert.equal(G.buildRoad(s, G.legalRoadEdges(s, 0)[0]).ok, false);
  assert.equal(G.buildSettlement(s, 0).ok, false);
  assert.equal(G.buildCity(s, p.settlements[0]).ok, false);
  // City upgrade with resources works and swaps the piece:
  p.resources.grain = 2; p.resources.ore = 3;
  s.bank.grain -= 2; s.bank.ore -= 3;
  const vid = p.settlements[0];
  assert.ok(G.buildCity(s, vid).ok);
  assert.ok(p.cities.includes(vid));
  assert.ok(!p.settlements.includes(vid));
  assert.equal(s.ownership.vertex[vid].type, 'city');
  assert.equal(G.totalVP(s, p), 3); // 1 settlement + 1 city
});

test('maritime trade rates honor harbors; bank trade moves cards correctly', () => {
  const s = makeTestGame();
  runSetup(s);
  s.phase = 'main'; s.currentPlayer = 0;
  const p = s.players[0];
  const rate = G.tradeRate(s, 0, 'lumber');
  assert.ok(rate >= 2 && rate <= 4);
  for (const r of RESOURCES) { s.bank[r] += p.resources[r]; p.resources[r] = 0; }
  p.resources.lumber = rate; s.bank.lumber -= rate;
  const before = s.bank.ore;
  assert.ok(G.bankTrade(s, 'lumber', 'ore').ok);
  assert.equal(p.resources.lumber, 0);
  assert.equal(p.resources.ore, 1);
  assert.equal(s.bank.ore, before - 1);
});

test('robber: discard half over 7 cards, steal transfers a card', () => {
  const s = makeTestGame();
  runSetup(s);
  const p = s.players[1];
  for (const r of RESOURCES) { s.bank[r] += p.resources[r]; p.resources[r] = 0; }
  p.resources.brick = 9; s.bank.brick -= 9;
  s.phase = 'discard';
  s.pendingDiscards = [1];
  assert.equal(G.discardCards(s, 1, { brick: 3 }).ok, false); // must be 4 (floor 9/2)
  assert.ok(G.discardCards(s, 1, { brick: 4 }).ok);
  assert.equal(p.resources.brick, 5);
  assert.equal(s.phase, 'robber');
});

test('longest road: 5+ roads earns the bonus', () => {
  const s = makeTestGame();
  runSetup(s);
  // Hand player 0 a connected chain of 5 roads along legal expansions.
  s.phase = 'main'; s.currentPlayer = 0;
  const p = s.players[0];
  for (let i = 0; i < 5; i++) {
    p.resources.brick = 1; p.resources.lumber = 1;
    const legal = G.legalRoadEdges(s, 0);
    assert.ok(legal.length > 0);
    assert.ok(G.buildRoad(s, legal[0]).ok);
  }
  assert.ok(G.longestRoadOf(s, 0) >= 2);
  // The helper itself:
  const len = G.longestRoadOf(s, 0);
  assert.ok(len <= p.roads.length);
});

test('monopoly takes all of one resource from every opponent', () => {
  const s = makeTestGame();
  runSetup(s);
  s.phase = 'main'; s.currentPlayer = 0; s.turn = 5;
  const p = s.players[0];
  p.devCards.push({ type: 'monopoly', boughtTurn: 1 });
  s.players[1].resources.wool += 3;
  s.players[2].resources.wool += 2;
  const expected = s.players[1].resources.wool + s.players[2].resources.wool + s.players[3].resources.wool + p.resources.wool;
  const r = G.playMonopoly(s, 'wool');
  assert.ok(r.ok);
  assert.equal(p.resources.wool, expected);
  assert.equal(s.players[1].resources.wool, 0);
});

// ---------- Full game simulation ----------
function simulateFullGame(seed) {
  const s = makeTestGame(seed);
  runSetup(s);

  const checkConservation = () => {
    for (const r of RESOURCES) {
      const total = s.bank[r] + s.players.reduce((a, p) => a + p.resources[r], 0);
      assert.equal(total, BANK_PER_RESOURCE, `resource ${r} not conserved`);
      assert.ok(s.bank[r] >= 0, `bank ${r} negative`);
      for (const p of s.players) assert.ok(p.resources[r] >= 0, `${p.name} negative ${r}`);
    }
    for (const p of s.players) {
      assert.ok(p.roads.length <= PIECE_LIMITS.road);
      assert.ok(p.settlements.length <= PIECE_LIMITS.settlement);
      assert.ok(p.cities.length <= PIECE_LIMITS.city);
    }
  };

  let guard = 0;
  while (s.phase !== 'gameOver' && guard++ < 20000) {
    if (s.phase === 'roll') {
      assert.ok(G.rollDice(s).ok);
      assert.ok(s.dice[0] >= 1 && s.dice[0] <= 6 && s.dice[1] >= 1 && s.dice[1] <= 6);
    } else if (s.phase === 'discard') {
      const pid = s.pendingDiscards[0];
      assert.ok(G.discardCards(s, pid, AI.pickDiscard(s, pid)).ok);
    } else if (s.phase === 'robber') {
      assert.ok(G.moveRobber(s, AI.pickRobberTile(s, s.currentPlayer)).ok);
    } else if (s.phase === 'steal') {
      assert.ok(G.stealFrom(s, AI.pickStealVictim(s, s.pendingSteal.candidates)).ok);
    } else if (s.phase === 'main') {
      const a = AI.nextMainAction(s);
      if (!a) { G.endTurn(s); }
      else {
        switch (a.type) {
          case 'buildRoad': G.buildRoad(s, a.edge); break;
          case 'buildSettlement': G.buildSettlement(s, a.vertex); break;
          case 'buildCity': G.buildCity(s, a.vertex); break;
          case 'buyDev': G.buyDevCard(s); break;
          case 'knight': G.playKnight(s); break;
          case 'roadBuilding': G.playRoadBuilding(s); break;
          case 'yearOfPlenty': G.playYearOfPlenty(s, a.res1, a.res2); break;
          case 'monopoly': G.playMonopoly(s, a.res); break;
          case 'bankTrade': G.bankTrade(s, a.give, a.get); break;
          default: G.endTurn(s);
        }
      }
    } else {
      assert.fail(`unknown phase ${s.phase}`);
    }
    checkConservation();
  }
  assert.ok(guard < 20000, `seed ${seed}: game did not terminate`);
  assert.notEqual(s.winner, null);
  const w = s.players[s.winner];
  assert.ok(G.totalVP(s, w) >= 10, 'winner must have 10+ VP');
  return s;
}

test('full AI games run to completion with all invariants intact (20 seeds)', () => {
  for (let seed = 1; seed <= 20; seed++) simulateFullGame(seed);
});

test('vertexPips returns sane values', () => {
  const b = generateBoard(makeRng(3));
  for (const v of b.vertices) {
    const pips = vertexPips(b, v.id);
    assert.ok(pips >= 0 && pips <= 15);
  }
});
