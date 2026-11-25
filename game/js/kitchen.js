// Warung Kilat — kitchen.js
// Logika dapur: stasiun mengolah bahan mentah jadi komponen hidangan, piring
// merakit komponen, dan tangan koki membawa satu item dalam satu waktu.

import { STATIONS, PROCESSED } from './state.js';
import { sfx } from './audio.js';

export function stationDef(id) {
  return STATIONS.find((s) => s.id === id);
}

export function stationState(state, id) {
  return state.stations.find((s) => s.id === id);
}

export function findJob(stationId, itemId) {
  const def = stationDef(stationId);
  if (!def) return null;
  return def.jobs.find((j) => j.from === itemId) || null;
}

// Klik sebuah stasiun: taruh bahan (mulai olah), ambil hasil (kalau matang),
// atau percepat olahan yang sedang berjalan.
export function clickStation(state, stationId) {
  const slot = stationState(state, stationId);
  if (!slot) return;
  if (slot.item && slot.done) {
    if (!state.carried) {
      state.carried = slot.item;
      slot.item = null;
      slot.progress = 0;
      slot.total = 0;
      slot.done = false;
      sfx.pickup();
    }
    return;
  }
  if (slot.item && !slot.done) {
    // Ketuk wajan/talenan saat memasak = percepat sedikit (rasa responsif).
    slot.progress = Math.min(slot.total, slot.progress + 0.45);
    if (stationId === 'talenan') sfx.chop();
    else sfx.sizzleStart();
    return;
  }
  if (!slot.item && state.carried) {
    const job = findJob(stationId, state.carried);
    if (job) {
      slot.item = state.carried;
      slot.total = job.secs;
      slot.progress = 0;
      slot.done = false;
      slot.result = job.to;
      state.carried = null;
      if (stationId === 'talenan') sfx.chop();
      else sfx.sizzleStart();
    } else {
      state.floaters.push({ text: 'Tidak bisa diolah di sini!', x: 640, y: 470, life: 1.1, color: '#ff6b5e' });
      sfx.error();
    }
  }
}

export function updateStations(state, dt) {
  for (const slot of state.stations) {
    if (slot.item && !slot.done) {
      slot.progress += dt;
      if (slot.progress >= slot.total) {
        slot.progress = slot.total;
        slot.done = true;
        slot.item = slot.result;
        sfx.ding();
        state.floaters.push({ text: `${PROCESSED[slot.item].name} matang!`, x: 640, y: 250, life: 1.1, color: '#8fd694' });
      }
    }
  }
}

// Klik piring: letakkan item bawaan ke piring (maks 3), atau ambil kembali
// komponen terakhir kalau tangan kosong.
export function clickPlate(state) {
  if (state.carried) {
    if (state.plate.length >= 3) {
      state.floaters.push({ text: 'Piring penuh!', x: 1072, y: 300, life: 1.0, color: '#ff6b5e' });
      sfx.error();
      return;
    }
    state.plate.push(state.carried);
    state.carried = null;
    sfx.drop();
  } else if (state.plate.length > 0) {
    state.carried = state.plate.pop();
    sfx.pickup();
  }
}

// Klik tempat bahan: ambil satu bahan mentah (tangan harus kosong).
export function clickIngredientBin(state, ingredientId) {
  if (state.carried) {
    state.floaters.push({ text: 'Tangan penuh — letakkan dulu!', x: 640, y: 540, life: 1.0, color: '#ffd94d' });
    return;
  }
  state.carried = ingredientId;
  sfx.pickup();
}

// Klik tiket pesanan: sajikan kalau piring berisi hidangan yang cocok.
export function clickTicket(state, ticket, readyDish, serve, wrong) {
  if (!ticket || ticket.state !== 'waiting') return;
  const dish = readyDish(state);
  if (dish && dish.id === ticket.dishId) {
    state.plate = [];
    serve(state, ticket);
  } else if (dish) {
    wrong(state);
  } else {
    state.floaters.push({ text: 'Piring belum berisi hidangan ini', x: 640, y: 200, life: 1.0, color: '#ffd94d' });
    sfx.click();
  }
}
