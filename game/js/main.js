// Warung Kilat — main.js
// Titik masuk game: loop animasi, hitung mundur shift, mode rush, pergantian
// hari, dan mode staging screenshot (?shot=start|play|rush|end) yang membekukan
// satu keadaan permainan agar screenshot selalu sama dan mudah dibaca.

import { newGameState, SHIFT_SECONDS } from './state.js';
import { updateOrders, spawnOrder } from './orders.js';
import { updateStations } from './kitchen.js';
import { render } from './render.js';
import { handleClick, handleKey, canvasPos } from './input.js';
import { ensureAudio, sfx, setMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = newGameState();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function stageShot(name) {
  // Semua shot memakai keadaan beku: loop utama tidak memanggil update()
  // saat ?shot ada, jadi timer tidak berjalan dan angka-angkanya tetap.
  state.screen = 'play';
  state.paused = false;
  if (name === 'start') {
    state.screen = 'title';
    state.orders = [];
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.shiftLeft = 150;
    for (let i = 0; i < 3; i++) spawnOrder(state);
    return;
  }
  if (name === 'play') {
    state.day = 1;
    state.shiftLeft = 94;
    state.score = 1250;
    state.coins = 340;
    state.combo = 5;
    state.comboTimer = 12;
    state.bestCombo = 5;
    state.served = 9;
    state.hearts = 3;
    for (let i = 0; i < 5; i++) spawnOrder(state);
    state.orders[0].patience = state.orders[0].patienceMax * 0.7;
    state.orders[1].patience = state.orders[1].patienceMax * 0.45;
    // Wajan sedang menggoreng nasi, talenan memotong sayur, piring setengah jadi.
    const wajan = state.stations.find((s) => s.id === 'wajan');
    wajan.item = 'nasi'; wajan.total = 4; wajan.progress = 2.6; wajan.result = 'nasiGoreng';
    const talenan = state.stations.find((s) => s.id === 'talenan');
    talenan.item = 'sayur'; talenan.total = 2; talenan.progress = 1.2; talenan.result = 'sayurPotong';
    state.plate = ['telurDadar', 'sayurPotong'];
    state.carried = 'nasiGoreng';
    state.mouse = { x: 1190, y: 245 };
    return;
  }
  if (name === 'rush') {
    state.day = 2;
    state.shiftLeft = 24;
    state.score = 4860;
    state.coins = 920;
    state.combo = 8;
    state.comboTimer = 15;
    state.bestCombo = 8;
    state.served = 27;
    state.hearts = 2;
    state.rush = true;
    for (let i = 0; i < 5; i++) spawnOrder(state);
    state.orders[0].patience = state.orders[0].patienceMax * 0.16;
    state.orders[2].patience = state.orders[2].patienceMax * 0.3;
    const wajan = state.stations.find((s) => s.id === 'wajan');
    wajan.item = 'mie'; wajan.total = 4; wajan.progress = 3.4; wajan.result = 'mieGoreng';
    const panggang = state.stations.find((s) => s.id === 'panggangan');
    panggang.item = 'ayam'; panggang.total = 5; panggang.progress = 4.1; panggang.result = 'ayamGoreng';
    const talenan = state.stations.find((s) => s.id === 'talenan');
    talenan.item = 'ayamPotong'; talenan.total = 2.5; talenan.progress = 2.5; talenan.done = true; talenan.result = 'ayamPotong';
    state.plate = ['ayamGoreng', 'sambal'];
    state.mouse = { x: 200, y: 140 };
    return;
  }
  if (name === 'end') {
    state.day = 1;
    state.screen = 'dayEnd';
    state.score = 3120;
    state.coins = 640;
    state.served = 18;
    state.failed = 2;
    state.bestCombo = 7;
    state.dayStats = [{ served: 18, coins: 640 }];
    for (let i = 0; i < 4; i++) spawnOrder(state);
    return;
  }
}

function setBanner(text) {
  state.banner = text;
  state.bannerTimer = 2.2;
}

function update(dt) {
  if (state.screen !== 'play' || state.paused) return;
  state.shiftLeft -= dt;
  // Rush hour: 30 detik terakhir tiap shift.
  if (state.shiftLeft <= 30 && !state.rush) {
    state.rush = true;
    if (!state.rushAnnounced) {
      state.rushAnnounced = true;
      setBanner('RUSH HOUR!');
      sfx.rush();
    }
  }
  updateOrders(state, dt);
  updateStations(state, dt);
  for (const f of state.floaters) {
    f.life -= dt;
    f.y -= 26 * dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);
  if (state.bannerTimer > 0) state.bannerTimer -= dt;
  if (state.shiftLeft <= 0) {
    state.dayStats.push({ served: state.served, coins: state.earnedToday });
    state.earnedToday = 0;
    if (state.day >= 3) {
      state.screen = 'win';
    } else {
      state.screen = 'dayEnd';
    }
    sfx.dayEnd();
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) update(dt);
  render(ctx, state);
  requestAnimationFrame(loop);
}

canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPos(canvas, e.clientX, e.clientY);
  state.mouse = p;
  handleClick(state, p.x, p.y);
});
canvas.addEventListener('pointermove', (e) => {
  state.mouse = canvasPos(canvas, e.clientX, e.clientY);
});
window.addEventListener('keydown', (e) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  handleKey(state, e.key);
});
document.getElementById('muteBtn').addEventListener('click', () => {
  ensureAudio();
  state.muted = !state.muted;
  setMuted(state.muted);
  document.getElementById('muteBtn').textContent = state.muted ? 'Suara: Mati' : 'Suara: Hidup';
});
document.getElementById('restartBtn').addEventListener('click', () => window.location.reload());

if (shot) stageShot(shot);
requestAnimationFrame(loop);
