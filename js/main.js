// Entry point: start menu (player configuration) + game launch.

import { PLAYER_COLORS } from './constants.js';
import { newGame } from './game.js';
import { startGame, initUI } from './ui.js';

const $ = (id) => document.getElementById(id);

// Seat states cycle: human -> ai -> off (seats 1-2 can't be off; min 3 players is enforced at start)
const seats = [
  { mode: 'human', name: 'You' },
  { mode: 'ai', name: 'Captain Bot' },
  { mode: 'ai', name: 'Lady Lumber' },
  { mode: 'off', name: 'Sir Ore' },
];

function renderMenu() {
  const wrap = $('player-config');
  wrap.innerHTML = '';
  seats.forEach((seat, i) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.style.opacity = seat.mode === 'off' ? '0.55' : '1';
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = PLAYER_COLORS[i].hex;
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 14;
    input.value = seat.name;
    input.disabled = seat.mode === 'off';
    input.addEventListener('input', () => { seat.name = input.value; });
    const toggle = document.createElement('button');
    toggle.className = 'seat-toggle ' + (seat.mode === 'ai' ? 'ai' : seat.mode === 'off' ? 'off' : '');
    toggle.textContent = seat.mode === 'human' ? '🙂 Human' : seat.mode === 'ai' ? '🤖 Computer' : '✖ Empty';
    toggle.addEventListener('click', () => {
      const cycle = i < 3 ? ['human', 'ai'] : ['human', 'ai', 'off'];
      const idx = cycle.indexOf(seat.mode);
      seat.mode = cycle[(idx + 1) % cycle.length];
      renderMenu();
    });
    row.append(dot, input, toggle);
    wrap.appendChild(row);
  });
}

function start() {
  const active = seats.filter((s) => s.mode !== 'off');
  const players = active.map((s, i) => ({
    name: s.name.trim() || `Player ${i + 1}`,
    isAI: s.mode === 'ai',
  }));
  if (players.length < 3) {
    alert('Catan needs at least 3 players. Add a human or computer seat.');
    return;
  }
  const state = newGame({ players });
  startGame(state, renderMenu);
}

function dismissLoading() {
  const loader = $('loading');
  if (!loader) return;
  // Keep the loading vignette up long enough for its little board to assemble.
  setTimeout(() => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 650);
  }, 1400);
}

initUI();
renderMenu();
dismissLoading();
$('btn-start').addEventListener('click', start);
