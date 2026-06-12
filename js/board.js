// Board generation and hex-grid geometry (pointy-top axial coordinates).
// Pure module — no DOM. Usable both in the browser and in Node tests.

import { TILE_DECK, TILE_TYPES, NUMBER_TOKENS, HARBOR_TYPES, PIPS } from './constants.js';

export const HEX_SIZE = 58; // px radius of a hex (center to corner)

// ---------- RNG (seedable for reproducible boards/tests) ----------
export function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    // mulberry32
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Geometry ----------
// Axial coords for the standard 19-hex board (hexagon of radius 2).
export function hexCoords() {
  const coords = [];
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      if (Math.abs(q + r) <= 2) coords.push({ q, r });
    }
  }
  return coords;
}

export function hexCenter({ q, r }) {
  return {
    x: HEX_SIZE * Math.sqrt(3) * (q + r / 2),
    y: HEX_SIZE * 1.5 * r,
  };
}

// 6 corners of a pointy-top hex
export function hexCorners(center) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90); // start at top
    pts.push({
      x: center.x + HEX_SIZE * Math.cos(angle),
      y: center.y + HEX_SIZE * Math.sin(angle),
    });
  }
  return pts;
}

const keyOf = (p) => `${Math.round(p.x)},${Math.round(p.y)}`;

// Build the full graph: tiles, unique vertices, unique edges, adjacency.
export function buildGraph() {
  const coords = hexCoords();
  const tiles = coords.map((c, i) => ({ id: i, ...c, center: hexCenter(c) }));

  const vertexMap = new Map(); // key -> vertex
  const vertices = [];
  const edgeMap = new Map(); // "vA|vB" sorted -> edge
  const edges = [];

  for (const tile of tiles) {
    const corners = hexCorners(tile.center);
    tile.vertexIds = [];
    const cornerIds = corners.map((p) => {
      const k = keyOf(p);
      if (!vertexMap.has(k)) {
        const v = { id: vertices.length, x: p.x, y: p.y, tiles: [], edges: [], adjacent: [] };
        vertexMap.set(k, v);
        vertices.push(v);
      }
      const v = vertexMap.get(k);
      if (!v.tiles.includes(tile.id)) v.tiles.push(tile.id);
      tile.vertexIds.push(v.id);
      return v.id;
    });
    tile.edgeIds = [];
    for (let i = 0; i < 6; i++) {
      const a = cornerIds[i], b = cornerIds[(i + 1) % 6];
      const ek = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (!edgeMap.has(ek)) {
        const e = { id: edges.length, v1: Math.min(a, b), v2: Math.max(a, b), tiles: [] };
        edgeMap.set(ek, e);
        edges.push(e);
      }
      const e = edgeMap.get(ek);
      if (!e.tiles.includes(tile.id)) e.tiles.push(tile.id);
      if (!tile.edgeIds.includes(e.id)) tile.edgeIds.push(e.id);
    }
  }

  for (const e of edges) {
    vertices[e.v1].edges.push(e.id);
    vertices[e.v2].edges.push(e.id);
    vertices[e.v1].adjacent.push(e.v2);
    vertices[e.v2].adjacent.push(e.v1);
  }

  return { tiles, vertices, edges };
}

// Coastal edges (touch only one tile), ordered around the perimeter.
function coastalEdgesInOrder(graph) {
  const coastal = graph.edges.filter((e) => e.tiles.length === 1);
  // Order them by walking the perimeter: sort by angle of edge midpoint around board center.
  const mid = (e) => ({
    x: (graph.vertices[e.v1].x + graph.vertices[e.v2].x) / 2,
    y: (graph.vertices[e.v1].y + graph.vertices[e.v2].y) / 2,
  });
  return coastal
    .map((e) => ({ e, ang: Math.atan2(mid(e).y, mid(e).x) }))
    .sort((a, b) => a.ang - b.ang)
    .map((o) => o.e);
}

// Are two tiles neighbors on the hex grid?
function tilesAdjacent(a, b) {
  const dq = a.q - b.q, dr = a.r - b.r;
  return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]]
    .some(([q, r]) => q === dq && r === dr);
}

// ---------- Board generation ----------
// Random terrain + random number tokens, re-rolling token layouts until no
// 6 or 8 are on adjacent tiles (standard "red numbers apart" setup rule).
export function generateBoard(rng = Math.random) {
  const graph = buildGraph();
  const terrains = shuffle(TILE_DECK, rng);

  graph.tiles.forEach((t, i) => {
    t.terrain = terrains[i];
    t.resource = TILE_TYPES[terrains[i]];
    t.number = null;
  });

  const nonDesert = graph.tiles.filter((t) => t.terrain !== 'desert');
  let ok = false;
  for (let attempt = 0; attempt < 500 && !ok; attempt++) {
    const tokens = shuffle(NUMBER_TOKENS, rng);
    nonDesert.forEach((t, i) => { t.number = tokens[i]; });
    ok = !nonDesert.some((t) =>
      (t.number === 6 || t.number === 8) &&
      nonDesert.some((o) => o !== t && (o.number === 6 || o.number === 8) && tilesAdjacent(t, o))
    );
  }

  // Robber starts on the desert.
  const desert = graph.tiles.find((t) => t.terrain === 'desert');
  graph.robberTile = desert.id;

  // Harbors: 9 of them spread around the 30 coastal edges (real spacing pattern).
  const coast = coastalEdgesInOrder(graph);
  const spacing = [0, 3, 7, 10, 13, 17, 20, 23, 27]; // indices into the 30 coastal edges
  const types = shuffle(HARBOR_TYPES, rng);
  graph.harbors = spacing.map((idx, i) => ({
    edgeId: coast[idx].id,
    type: types[i],
    vertices: [coast[idx].v1, coast[idx].v2],
  }));

  return graph;
}

// Total production pips for a vertex (sum over adjacent numbered tiles).
export function vertexPips(graph, vertexId) {
  return graph.vertices[vertexId].tiles
    .map((tid) => graph.tiles[tid])
    .filter((t) => t.number)
    .reduce((s, t) => s + PIPS[t.number], 0);
}

export function harborAtVertex(graph, vertexId) {
  const h = graph.harbors.find((h) => h.vertices.includes(vertexId));
  return h ? h.type : null;
}
