// Core constants — real Catan (5th edition) base game values.

export const RESOURCES = ['brick', 'lumber', 'wool', 'grain', 'ore'];

export const TILE_TYPES = {
  hills: 'brick',
  forest: 'lumber',
  pasture: 'wool',
  fields: 'grain',
  mountains: 'ore',
  desert: null,
};

// 19 terrain hexes: 4 forest, 4 pasture, 4 fields, 3 hills, 3 mountains, 1 desert
export const TILE_DECK = [
  'forest', 'forest', 'forest', 'forest',
  'pasture', 'pasture', 'pasture', 'pasture',
  'fields', 'fields', 'fields', 'fields',
  'hills', 'hills', 'hills',
  'mountains', 'mountains', 'mountains',
  'desert',
];

// 18 number tokens (desert gets none). 2 and 12 appear once, all others twice.
export const NUMBER_TOKENS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

// Probability pips per number (ways to roll with 2 dice, scaled to the classic dots)
export const PIPS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

// Per-player piece limits (real game)
export const PIECE_LIMITS = { road: 15, settlement: 5, city: 4 };

// Bank: 19 of each resource
export const BANK_PER_RESOURCE = 19;

// Development card deck: 25 cards
export const DEV_DECK = [
  ...Array(14).fill('knight'),
  ...Array(5).fill('victoryPoint'),
  ...Array(2).fill('roadBuilding'),
  ...Array(2).fill('yearOfPlenty'),
  ...Array(2).fill('monopoly'),
];

export const BUILD_COSTS = {
  road: { brick: 1, lumber: 1 },
  settlement: { brick: 1, lumber: 1, wool: 1, grain: 1 },
  city: { grain: 2, ore: 3 },
  devCard: { wool: 1, grain: 1, ore: 1 },
};

export const VICTORY_POINTS_TO_WIN = 10;
export const LONGEST_ROAD_MIN = 5;
export const LARGEST_ARMY_MIN = 3;
export const ROBBER_HAND_LIMIT = 7; // more than 7 cards => discard half on a 7

// 9 harbors: 4 generic 3:1 + one 2:1 per resource (assigned to coastal edges in perimeter order)
export const HARBOR_TYPES = ['3:1', 'grain', 'ore', '3:1', 'wool', '3:1', 'brick', 'lumber', '3:1'];

export const PLAYER_COLORS = [
  { id: 'red', hex: '#d64541', light: '#f2a09e' },
  { id: 'blue', hex: '#3b6fd4', light: '#a9c3f0' },
  { id: 'orange', hex: '#e8842c', light: '#f5c89a' },
  { id: 'white', hex: '#e8e3d8', light: '#ffffff' },
];

export const RESOURCE_INFO = {
  brick: { name: 'Brick', color: '#c4623a', icon: '🧱' },
  lumber: { name: 'Lumber', color: '#3e7a3a', icon: '🪵' },
  wool: { name: 'Wool', color: '#9ccc65', icon: '🐑' },
  grain: { name: 'Grain', color: '#e6b422', icon: '🌾' },
  ore: { name: 'Ore', color: '#5d6a78', icon: '⛏️' },
};

export const DEV_INFO = {
  knight: { name: 'Knight', icon: '⚔️', desc: 'Move the robber and steal 1 card from an adjacent player.' },
  victoryPoint: { name: 'Victory Point', icon: '🏆', desc: '1 hidden victory point. Revealed when you win.' },
  roadBuilding: { name: 'Road Building', icon: '🛤️', desc: 'Place 2 free roads.' },
  yearOfPlenty: { name: 'Year of Plenty', icon: '🌽', desc: 'Take any 2 resources from the bank.' },
  monopoly: { name: 'Monopoly', icon: '💰', desc: 'Name a resource; all players give you every card of it.' },
};
