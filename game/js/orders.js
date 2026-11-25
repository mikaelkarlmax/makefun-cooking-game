// Warung Kilat — orders.js
// Pesanan pelanggan: kapan muncul, berapa sabarnya, dan apa yang terjadi saat
// disajikan tepat waktu, salah hidangan, atau keburu hangus.

import { CUSTOMERS, DISHES, MAX_TICKETS } from './state.js';
import { sfx } from './audio.js';

let orderSeq = 0;

function pickDish(day) {
  // Hari pertama hanya tiga hidangan termudah; menu lengkap terbuka hari 2.
  const pool = day === 1 ? DISHES.slice(0, 3) : DISHES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_TICKETS) return;
  const dish = pickDish(state.day);
  const customer = CUSTOMERS[state.nextCustomer % CUSTOMERS.length];
  state.nextCustomer += 1;
  orderSeq += 1;
  const patience = Math.max(34, 62 - state.day * 5 - Math.random() * 12);
  state.orders.push({
    id: orderSeq,
    dishId: dish.id,
    customer,
    patience,
    patienceMax: patience,
    state: 'waiting', // waiting | served | angry
    servedAt: 0,
  });
}

export function ticketForDish(state, dishId) {
  return state.orders.find((o) => o.dishId === dishId && o.state === 'waiting');
}

export function plateMatchesDish(plate, dishId) {
  const dish = DISHES.find((d) => d.id === dishId);
  if (!dish) return false;
  if (plate.length !== dish.needs.length) return false;
  const have = [...plate].sort();
  const want = [...dish.needs].sort();
  return have.every((item, i) => item === want[i]);
}

export function readyDishOnPlate(state) {
  for (const dish of DISHES) {
    if (plateMatchesDish(state.plate, dish.id)) return dish;
  }
  return null;
}

export function serveTicket(state, ticket) {
  const dish = DISHES.find((d) => d.id === ticket.dishId);
  const timeBonus = Math.round(80 * (ticket.patience / ticket.patienceMax));
  state.combo += 1;
  state.comboTimer = 20;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  const comboBonus = (state.combo - 1) * 20;
  const gained = dish.base + timeBonus + comboBonus;
  const coins = Math.round(gained / 10);
  state.score += gained;
  state.coins += coins;
  state.earnedToday += gained;
  state.served += 1;
  ticket.state = 'served';
  ticket.servedAt = 0;
  state.orders = state.orders.filter((o) => o !== ticket);
  state.floaters.push({ text: `+${gained}  •  +${coins} koin`, x: 1072, y: 300, life: 1.4, color: '#ffd94d' });
  sfx.serve();
  sfx.coin();
}

export function wrongServe(state) {
  state.combo = 0;
  state.comboTimer = 0;
  state.floaters.push({ text: 'SALAH HIDANGAN!', x: 1072, y: 300, life: 1.2, color: '#ff6b5e' });
  sfx.error();
}

export function expireOrder(state, order) {
  order.state = 'angry';
  state.hearts -= 1;
  state.failed += 1;
  state.combo = 0;
  state.comboTimer = 0;
  state.floaters.push({ text: 'PELANGGAN KABUR!', x: 640, y: 120, life: 1.6, color: '#ff6b5e' });
  sfx.angry();
  state.orders = state.orders.filter((o) => o !== order);
  if (state.hearts <= 0) {
    state.screen = 'gameOver';
    sfx.dayEnd();
  }
}

export function updateOrders(state, dt) {
  // Spawn bertahap; saat rush, pesanan datang dua kali lebih cepat.
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.orders.length < MAX_TICKETS) {
    spawnOrder(state);
    const base = state.rush ? 5.5 : 11;
    state.nextOrderIn = base - state.day + Math.random() * 4;
  }
  for (const order of [...state.orders]) {
    if (order.state !== 'waiting') continue;
    order.patience -= dt;
    if (order.patience <= 0) expireOrder(state, order);
  }
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
}
