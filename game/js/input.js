// Warung Kilat — input.js
// Semua input pemain: klik mouse/touch di kanvas dan tombol keyboard.
// Hit-test memakai kotak-kotak layout yang sama dengan yang digambar render.js.

import { INGREDIENTS, STATIONS, PLATE } from './state.js';
import { clickStation, clickPlate, clickIngredientBin, clickTicket } from './kitchen.js';
import { readyDishOnPlate, serveTicket, wrongServe } from './orders.js';
import { sfx, ensureAudio } from './audio.js';

const TICKET_Y = 82;
const TICKET_H = 118;
const BIN_Y = 562;
const BIN_H = 176;

export function ticketRect(i) {
  return { x: 24 + i * 248, y: TICKET_Y, w: 240, h: TICKET_H };
}

export function binRect(i) {
  return { x: 22 + i * 178, y: BIN_Y, w: 168, h: BIN_H };
}

function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function canvasPos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 1280,
    y: ((clientY - rect.top) / rect.height) * 800,
  };
}

export function handleClick(state, px, py) {
  ensureAudio();
  if (state.screen === 'title') {
    state.screen = 'play';
    sfx.rush();
    return;
  }
  if (state.screen === 'dayEnd') {
    startNextDay(state);
    return;
  }
  if (state.screen === 'gameOver' || state.screen === 'win') return;
  if (state.paused) return;

  // Tiket pesanan
  for (let i = 0; i < 5; i++) {
    if (inside(px, py, ticketRect(i))) {
      clickTicket(state, state.orders[i], readyDishOnPlate, serveTicket, wrongServe);
      return;
    }
  }
  // Stasiun
  for (const def of STATIONS) {
    if (inside(px, py, def)) {
      clickStation(state, def.id);
      return;
    }
  }
  // Piring saji
  if (inside(px, py, PLATE)) {
    clickPlate(state);
    return;
  }
  // Tempat bahan
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(px, py, binRect(i))) {
      clickIngredientBin(state, INGREDIENTS[i].id);
      return;
    }
  }
}

export function startNextDay(state) {
  state.day += 1;
  state.shiftLeft = 150;
  state.orders = [];
  state.nextOrderIn = 1.5;
  state.plate = [];
  state.carried = null;
  state.hearts = 3;
  state.rush = false;
  state.rushAnnounced = false;
  state.stations.forEach((s) => { s.item = null; s.progress = 0; s.total = 0; s.done = false; });
  state.screen = 'play';
  state.banner = `HARI ${state.day} — SEMANGAT!`;
  state.bannerTimer = 2;
  sfx.rush();
}

export function handleKey(state, key) {
  ensureAudio();
  const k = key.toLowerCase();
  if (k === 'm') {
    state.muted = !state.muted;
    return;
  }
  if (k === 'r' && (state.screen === 'gameOver' || state.screen === 'win')) {
    window.location.reload();
    return;
  }
  if (state.screen === 'title' && (k === ' ' || k === 'enter')) {
    state.screen = 'play';
    sfx.rush();
    return;
  }
  if (state.screen === 'dayEnd' && (k === ' ' || k === 'enter')) {
    startNextDay(state);
    return;
  }
  if (state.screen !== 'play') return;
  if (k === 'p') {
    state.paused = !state.paused;
    sfx.click();
    return;
  }
  if (state.paused) return;
  // 1-7: ambil bahan
  const ing = INGREDIENTS.find((i) => i.key === k);
  if (ing) {
    clickIngredientBin(state, ing.id);
    return;
  }
  // Q/W/E: pakai stasiun (taruh bahan bawaan / ambil hasil / percepat)
  const stationKey = { q: 'talenan', w: 'wajan', e: 'panggangan' }[k];
  if (stationKey) {
    clickStation(state, stationKey);
    return;
  }
  // Spasi: sajikan hidangan siap ke tiket yang cocok
  if (k === ' ') {
    const dish = readyDishOnPlate(state);
    if (dish) {
      const ticket = state.orders.find((o) => o.dishId === dish.id && o.state === 'waiting');
      if (ticket) {
        state.plate = [];
        serveTicket(state, ticket);
      } else {
        wrongServe(state);
      }
    }
  }
}
