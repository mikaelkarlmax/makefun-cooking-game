// Warung Kilat — render.js
// Semua gambar digambar dengan Canvas 2D: dapur warung, tiket pesanan, stasiun,
// bahan, dan piring. Tidak ada aset gambar eksternal — seni game ini orisinal
// dan dibuat dari bentuk-bentuk vektor di bawah.

import { INGREDIENTS, STATIONS, PLATE, itemName, itemColors, dishById } from './state.js';
import { readyDishOnPlate } from './orders.js';

const W = 1280;
const H = 800;

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---- Ikon makanan: tiap bahan/hidangan digambar dari bentuk sederhana ----
export function drawFoodIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = 'rgba(60,30,10,0.55)';
  switch (id) {
    case 'nasi': {
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.ellipse(0, r * 0.15, r, r * 0.62, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff3d6';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.25, r * 0.72, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8d9b0';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-r * 0.4 + i * r * 0.2, -r * 0.3 + (i % 2) * r * 0.2, r * 0.09, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'mie': case 'mieGoreng': {
      ctx.fillStyle = id === 'mie' ? '#ffd94d' : '#e8a83c';
      ctx.beginPath(); ctx.ellipse(0, r * 0.2, r, r * 0.55, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = id === 'mie' ? '#c98a1b' : '#9c6a12';
      ctx.lineWidth = r * 0.14;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.15 + i * r * 0.28);
        ctx.bezierCurveTo(-r * 0.3, -r * 0.45 + i * r * 0.28, r * 0.3, r * 0.15 + i * r * 0.28, r * 0.7, -r * 0.15 + i * r * 0.28);
        ctx.stroke();
      }
      break;
    }
    case 'ayam': case 'ayamPotong': case 'ayamGoreng': case 'ayamBakar': {
      const meat = id === 'ayamBakar' ? '#8a4d2a' : id === 'ayamGoreng' ? '#d98a4b' : id === 'ayamPotong' ? '#ff9d8a' : '#ffb3a0';
      ctx.fillStyle = meat;
      ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6ead6';
      ctx.beginPath(); ctx.arc(r * 0.55, r * 0.45, r * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 0.72, r * 0.28, r * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (id === 'ayamBakar') {
        ctx.strokeStyle = '#3a1c0c'; ctx.lineWidth = r * 0.1;
        ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.4); ctx.lineTo(r * 0.2, r * 0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.6); ctx.lineTo(r * 0.35, r * 0.1); ctx.stroke();
      }
      if (id === 'ayamPotong') {
        ctx.fillStyle = '#ff8a76';
        ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.55, r * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      break;
    }
    case 'telur': {
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.85, r * 0.7, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff9d2e';
      ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.05, r * 0.38, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'telurDadar': {
      ctx.fillStyle = '#ffe066';
      roundRect(ctx, -r * 0.85, -r * 0.4, r * 1.7, r * 0.8, r * 0.35);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0a83c';
      ctx.beginPath(); ctx.arc(-r * 0.3, 0, r * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'sayur': case 'sayurPotong': {
      ctx.fillStyle = '#4a9e4d';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.ellipse(i * r * 0.45, -r * 0.1 + Math.abs(i) * r * 0.15, r * 0.32, r * 0.55, i * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      if (id === 'sayurPotong') {
        ctx.fillStyle = '#8fd694';
        ctx.fillRect(-r * 0.6, r * 0.35, r * 1.2, r * 0.3);
        ctx.strokeRect(-r * 0.6, r * 0.35, r * 1.2, r * 0.3);
      }
      break;
    }
    case 'sambal': {
      ctx.fillStyle = '#e23b2e';
      ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.8, r * 0.45, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c22a1e';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 0.62, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ed957';
      ctx.fillRect(-r * 0.1, -r * 0.75, r * 0.2, r * 0.45);
      break;
    }
    case 'teh': {
      ctx.fillStyle = '#e8f4f8';
      roundRect(ctx, -r * 0.45, -r * 0.8, r * 0.9, r * 1.6, r * 0.15);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c98d4b';
      roundRect(ctx, -r * 0.36, -r * 0.2, r * 0.72, r * 0.9, r * 0.12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.22, r * 0.22);
      ctx.fillRect(r * 0.05, r * 0.25, r * 0.22, r * 0.22);
      ctx.strokeStyle = '#e23b2e'; ctx.lineWidth = r * 0.12;
      ctx.beginPath(); ctx.moveTo(r * 0.3, -r * 0.8); ctx.lineTo(r * 0.55, -r * 1.1); ctx.stroke();
      break;
    }
    case 'nasiGoreng': {
      ctx.fillStyle = '#f2b544';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 0.8, r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.45, r * 0.34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff9d2e';
      ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.45, r * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a9e4d';
      ctx.beginPath(); ctx.arc(-r * 0.5, r * 0.15, r * 0.14, 0, Math.PI * 2); ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = '#cccccc';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---- Wajah pelanggan: senang / cemas / marah mengikuti sisa kesabaran ----
function drawCustomerFace(ctx, customer, mood, x, y, r) {
  ctx.save();
  ctx.fillStyle = customer.skin;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,10,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = customer.shirt;
  ctx.beginPath(); ctx.arc(x, y - r * 0.55, r * 0.95, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#2b1a10';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1a10'; ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  if (mood === 'happy') { ctx.arc(x, y + r * 0.15, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI); }
  else if (mood === 'worried') { ctx.moveTo(x - r * 0.3, y + r * 0.45); ctx.lineTo(x + r * 0.3, y + r * 0.45); }
  else { ctx.arc(x, y + r * 0.65, r * 0.35, 1.15 * Math.PI, 1.85 * Math.PI); }
  ctx.stroke();
  ctx.restore();
}

function moodOf(order) {
  const ratio = order.patience / order.patienceMax;
  if (ratio > 0.55) return 'happy';
  if (ratio > 0.28) return 'worried';
  return 'angry';
}

// ---- Bagian 2: HUD, tiket, stasiun, piring, bahan, overlay ----

function drawBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#3d2b1f');
  grad.addColorStop(0.55, '#5a3d27');
  grad.addColorStop(1, '#2e2015');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // Dinding bata samar
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 8; y < 200; y += 26) {
    for (let x = (y % 52 ? 0 : 40); x < W; x += 80) ctx.fillRect(x, y, 74, 3);
  }
  // Lantai kayu dapur
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 540, W, 260);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 560; y < H; y += 34) ctx.fillRect(0, y, W, 2);
  // Lampu gantung
  for (const lx of [200, 640, 1080]) {
    ctx.strokeStyle = '#1d120a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 26); ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.moveTo(lx - 26, 26); ctx.lineTo(lx + 26, 26); ctx.lineTo(lx + 12, 48); ctx.lineTo(lx - 12, 48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,217,77,0.12)';
    ctx.beginPath(); ctx.moveTo(lx - 90, 48); ctx.lineTo(lx + 90, 48); ctx.lineTo(lx + 40, 210); ctx.lineTo(lx - 40, 210); ctx.closePath(); ctx.fill();
  }
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function drawHUD(ctx, state) {
  ctx.fillStyle = '#241608';
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(0, 62, W, 3);
  text(ctx, 'WARUNG KILAT', 24, 34, 28, '#ffd94d', 'bold');
  text(ctx, 'dapur rush Indonesia', 268, 36, 14, '#e8cfa8', 'normal');
  // Hari + timer shift
  text(ctx, `HARI ${state.day}/3`, 470, 26, 18, '#ffffff');
  const shiftRatio = state.shiftLeft / 150;
  ctx.fillStyle = '#4a3220'; roundRect(ctx, 470, 38, 150, 14, 7); ctx.fill();
  ctx.fillStyle = shiftRatio > 0.3 ? '#8fd694' : '#ff6b5e';
  roundRect(ctx, 470, 38, 150 * shiftRatio, 14, 7); ctx.fill();
  text(ctx, fmtTime(state.shiftLeft), 630, 34, 20, '#ffffff');
  // Skor, koin, kombo, hati
  text(ctx, `SKOR ${state.score.toLocaleString('id-ID')}`, 730, 34, 22, '#ffffff');
  text(ctx, `KOIN ${state.coins}`, 920, 34, 22, '#ffd94d');
  const comboColor = state.combo >= 5 ? '#ff9d2e' : state.combo >= 3 ? '#ffd94d' : '#e8cfa8';
  text(ctx, state.combo > 1 ? `KOMBO x${state.combo}` : 'KOMBO —', 1060, 34, 20, comboColor);
  // Hati: tiga hati kecil di pojok kanan atas.
  for (let i = 0; i < 3; i++) {
    const hx = 1255 - i * 28;
    const hy = 34;
    ctx.fillStyle = i < state.hearts ? '#ff4d6d' : '#5a3d3d';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 7);
    ctx.bezierCurveTo(hx - 11, hy - 3, hx - 7, hy - 12, hx, hy - 5);
    ctx.bezierCurveTo(hx + 7, hy - 12, hx + 11, hy - 3, hx, hy + 7);
    ctx.fill();
  }
}

function drawTickets(ctx, state) {
  text(ctx, 'PESANAN MASUK — klik tiket untuk menyajikan', 24, 74, 13, '#e8cfa8', 'bold');
  for (let i = 0; i < 5; i++) {
    const x = 24 + i * 248;
    const y = 82;
    const w = 240;
    const h = 118;
    const order = state.orders[i];
    ctx.fillStyle = order ? '#fff6e0' : 'rgba(255,246,224,0.16)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = order ? '#d9a441' : 'rgba(255,246,224,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!order) {
      text(ctx, '— kosong —', x + w / 2, y + h / 2, 15, 'rgba(255,246,224,0.55)', 'normal', 'center');
      continue;
    }
    const dish = dishById(order.dishId);
    const ratio = Math.max(0, order.patience / order.patienceMax);
    drawCustomerFace(ctx, order.customer, moodOf(order), x + 34, y + 36, 24);
    text(ctx, order.customer.name, x + 66, y + 20, 14, '#3a2410');
    text(ctx, dish.name, x + 66, y + 42, 17, '#8a2f10');
    // Ikon komponen resep
    dish.needs.forEach((need, ni) => {
      drawFoodIcon(ctx, need, x + 70 + ni * 34, y + 76, 13);
    });
    text(ctx, `${Math.ceil(order.patience)} dtk`, x + w - 12, y + 20, 14, ratio < 0.28 ? '#d21f14' : '#5a3d27', 'bold', 'right');
    // Bar kesabaran
    ctx.fillStyle = '#e0cba8'; roundRect(ctx, x + 14, y + 96, w - 28, 10, 5); ctx.fill();
    ctx.fillStyle = ratio > 0.55 ? '#4a9e4d' : ratio > 0.28 ? '#e0a83c' : '#d21f14';
    roundRect(ctx, x + 14, y + 96, (w - 28) * ratio, 10, 5); ctx.fill();
    if (ratio < 0.28) {
      text(ctx, 'CEPAT!', x + w - 12, y + 76, 13, '#d21f14', 'bold', 'right');
    }
  }
}

function drawStation(ctx, state, def) {
  const slot = state.stations.find((s) => s.id === def.id);
  const { x, y, w, h } = def;
  ctx.fillStyle = def.color;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.fillStyle = def.top;
  roundRect(ctx, x + 8, y + 8, w - 16, 46, 10);
  ctx.fill();
  text(ctx, def.name, x + w / 2, y + 32, 20, '#ffffff', 'bold', 'center');
  text(ctx, `tombol ${def.key} • klik untuk percepat`, x + w / 2, y + 62, 12, '#e8d3b8', 'normal', 'center');
  // Area kerja
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, x + 16, y + 76, w - 32, 104, 10);
  ctx.fill();
  if (slot.item) {
    const colors = itemColors(slot.item);
    void colors;
    drawFoodIcon(ctx, slot.item, x + w / 2, y + 118, 34);
    text(ctx, itemName(slot.item), x + w / 2, y + 158, 14, '#ffffff', 'bold', 'center');
    if (!slot.done) {
      const ratio = slot.progress / slot.total;
      ctx.fillStyle = '#2b1a10'; roundRect(ctx, x + 30, y + 168, w - 60, 12, 6); ctx.fill();
      ctx.fillStyle = '#ffb13d'; roundRect(ctx, x + 30, y + 168, (w - 60) * ratio, 12, 6); ctx.fill();
    } else {
      text(ctx, 'MATANG! Klik untuk ambil', x + w / 2, y + 172, 13, '#8fd694', 'bold', 'center');
    }
  } else {
    text(ctx, def.verb, x + w / 2, y + 118, 26, 'rgba(255,255,255,0.35)', 'bold', 'center');
    text(ctx, 'letakkan bahan di sini', x + w / 2, y + 152, 13, 'rgba(255,255,255,0.5)', 'normal', 'center');
  }
}

function drawPlateArea(ctx, state) {
  const { x, y, w, h } = PLATE;
  const ready = readyDishOnPlate(state);
  ctx.fillStyle = ready ? '#2e5b34' : '#7a5a34';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = ready ? '#8fd694' : '#d9a441';
  ctx.lineWidth = ready ? 4 : 2;
  ctx.stroke();
  text(ctx, 'PIRING SAJI', x + w / 2, y + 30, 20, '#ffffff', 'bold', 'center');
  // Piring
  ctx.fillStyle = '#f6f1e6';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + 112, 108, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 3; ctx.stroke();
  state.plate.forEach((item, i) => {
    drawFoodIcon(ctx, item, x + w / 2 - 56 + i * 56, y + 108, 22);
  });
  if (state.plate.length === 0) {
    text(ctx, 'piring kosong', x + w / 2, y + 112, 14, '#9a8a70', 'normal', 'center');
  }
  if (ready) {
    text(ctx, `${ready.name.toUpperCase()} SIAP!`, x + w / 2, y + 172, 17, '#8fd694', 'bold', 'center');
    text(ctx, 'klik tiket pesanannya', x + w / 2, y + 190, 12, '#e8cfa8', 'normal', 'center');
  } else {
    text(ctx, state.plate.length > 0 ? 'lengkapi resepnya…' : 'klik bahan, olah, letakkan di sini', x + w / 2, y + 176, 13, '#e8cfa8', 'normal', 'center');
  }
}

function drawCounterStrip(ctx, state) {
  // Meja kayu antara dapur dan bahan + koki kecil + item bawaan
  ctx.fillStyle = '#4a2f1c';
  roundRect(ctx, 24, 432, 1232, 96, 12);
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(24, 432, 1232, 10);
  // Koki
  const kx = 90;
  const ky = 480;
  ctx.fillStyle = '#f6f1e6';
  ctx.beginPath(); ctx.ellipse(kx, ky - 18, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(kx, ky + 2, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b1a10';
  ctx.beginPath(); ctx.arc(kx - 7, ky, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(kx + 7, ky, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1a10'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(kx, ky + 6, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  text(ctx, 'KOKI', kx, ky + 34, 12, '#e8cfa8', 'bold', 'center');
  // Item yang dibawa
  text(ctx, 'DIBAWA:', 170, 468, 15, '#e8cfa8', 'bold');
  if (state.carried) {
    drawFoodIcon(ctx, state.carried, 250, 478, 24);
    text(ctx, itemName(state.carried), 285, 478, 17, '#ffffff');
  } else {
    text(ctx, '(tangan kosong — klik bahan di bawah)', 250, 478, 15, 'rgba(232,207,168,0.7)', 'normal');
  }
  text(ctx, 'Ketik 1-7 pilih bahan • Q/W/E stasiun • Spasi sajikan • P jeda • M suara', 170, 508, 14, '#e8cfa8', 'normal');
  // Statistik kanan
  text(ctx, `Disajikan: ${state.served}   Gagal: ${state.failed}   Kombo terbaik: x${state.bestCombo}`, 1232, 478, 15, '#ffffff', 'bold', 'right');
  text(ctx, state.rush ? 'RUSH HOUR! Pesanan berdatangan!' : 'Shift berjalan — layani semua pelanggan!', 1232, 508, 14, state.rush ? '#ff9d2e' : '#e8cfa8', 'bold', 'right');
}

function drawBins(ctx, state) {
  text(ctx, 'BAHAN — klik untuk mengambil (atau tekan 1-7)', 24, 552, 14, '#e8cfa8', 'bold');
  INGREDIENTS.forEach((ing, i) => {
    const x = 22 + i * 178;
    const y = 562;
    const w = 168;
    const h = 176;
    const isCarried = state.carried === ing.id;
    ctx.fillStyle = isCarried ? '#8a5a2b' : '#5a3d27';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = isCarried ? '#ffd94d' : '#a9743a';
    ctx.lineWidth = isCarried ? 4 : 2;
    ctx.stroke();
    drawFoodIcon(ctx, ing.id, x + w / 2, y + 62, 36);
    text(ctx, ing.name, x + w / 2, y + 122, 18, '#ffffff', 'bold', 'center');
    text(ctx, `[${ing.key}]`, x + w / 2, y + 148, 14, '#ffd94d', 'bold', 'center');
    if (isCarried) text(ctx, 'DIBAWA', x + w / 2, y + 168, 12, '#ffd94d', 'bold', 'center');
  });
  text(ctx, 'Tips: potong ayam & sayur di TALENAN • goreng nasi/mie/telur di WAJAN • bakar ayam di PANGGANGAN • sambal & es teh langsung ke piring', 640, 762, 13, '#e8cfa8', 'normal', 'center');
}

function drawFloaters(ctx, state) {
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y, 22, f.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawBanner(ctx, state) {
  if (!state.banner || state.bannerTimer <= 0) return;
  ctx.globalAlpha = Math.min(1, state.bannerTimer);
  text(ctx, state.banner, W / 2, 300, 54, '#ffd94d', 'bold', 'center');
  ctx.globalAlpha = 1;
}

function drawCarriedAtCursor(ctx, state) {
  if (!state.carried || state.screen !== 'play') return;
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, 26, 0, Math.PI * 2); ctx.fill();
  drawFoodIcon(ctx, state.carried, state.mouse.x, state.mouse.y, 20);
  ctx.globalAlpha = 1;
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(20,12,6,0.88)';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  ctx.fillRect(0, 0, W, H);
  panel(ctx, 290, 130, 700, 540);
  text(ctx, 'WARUNG KILAT', 640, 190, 58, '#ffd94d', 'bold', 'center');
  text(ctx, 'Dapur rush Indonesia — masak cepat, sajikan tepat waktu!', 640, 238, 20, '#ffffff', 'normal', 'center');
  const lines = [
    '1. Klik bahan di bawah, olah di TALENAN / WAJAN / PANGGANGAN.',
    '2. Rakit hidangan di PIRING SAJI sesuai resep di tiket.',
    '3. Klik tiket pelanggan untuk menyajikan sebelum waktunya habis.',
    '4. Kombo naik tiap sajian beruntun — pelanggan kabur = hati hilang.',
    '5. Bertahan 3 hari (shift) — hari makin sore, makin ramai!',
  ];
  lines.forEach((l, i) => text(ctx, l, 640, 300 + i * 34, 17, '#e8cfa8', 'normal', 'center'));
  text(ctx, 'KLIK / TEKAN SPASI UNTUK MULAI MASAK', 640, 510, 24, '#8fd694', 'bold', 'center');
  text(ctx, 'Mouse + keyboard  •  suara WebAudio  •  offline penuh', 640, 548, 15, '#e8cfa8', 'normal', 'center');
  text(ctx, 'Menu: Nasi Goreng • Mie Goreng • Ayam Geprek • Sate Bakar • Es Teh', 640, 606, 16, '#ffd94d', 'bold', 'center');
}

function drawEndPanel(ctx, state, title, subtitle, stats, footer) {
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  ctx.fillRect(0, 0, W, H);
  panel(ctx, 340, 160, 600, 480);
  text(ctx, title, 640, 220, 44, '#ffd94d', 'bold', 'center');
  text(ctx, subtitle, 640, 268, 19, '#ffffff', 'normal', 'center');
  stats.forEach((s, i) => text(ctx, s, 640, 330 + i * 36, 20, '#e8cfa8', 'normal', 'center'));
  text(ctx, footer, 640, 580, 20, '#8fd694', 'bold', 'center');
}

export function render(ctx, state) {
  drawBackground(ctx);
  drawHUD(ctx, state);
  drawTickets(ctx, state);
  for (const def of STATIONS) drawStation(ctx, state, def);
  drawPlateArea(ctx, state);
  drawCounterStrip(ctx, state);
  drawBins(ctx, state);
  drawFloaters(ctx, state);
  drawBanner(ctx, state);
  drawCarriedAtCursor(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'dayEnd') {
    const last = state.dayStats[state.dayStats.length - 1];
    drawEndPanel(ctx, state, `HARI ${state.day} SELESAI!`, 'Shift berakhir — warung istirahat sebentar.',
      last ? [`Hidangan disajikan: ${last.served}`, `Koin hari ini: ${last.coins}`, `Skor total: ${state.score.toLocaleString('id-ID')}`] : [],
      'Tekan SPASI untuk hari berikutnya');
  }
  if (state.screen === 'gameOver') {
    drawEndPanel(ctx, state, 'WARUNG TUTUP!', 'Semua hati habis — pelanggan kecewa dan pulang.',
      [`Skor akhir: ${state.score.toLocaleString('id-ID')}`, `Hidangan disajikan: ${state.served}`, `Kombo terbaik: x${state.bestCombo}`],
      'Tekan R untuk main lagi');
  }
  if (state.screen === 'win') {
    drawEndPanel(ctx, state, 'JUARA WARUNG!', 'Tiga hari penuh — warungmu jadi yang paling ramai!',
      [`Skor akhir: ${state.score.toLocaleString('id-ID')}`, `Koin terkumpul: ${state.coins}`, `Hidangan disajikan: ${state.served}  •  Kombo terbaik: x${state.bestCombo}`],
      'Tekan R untuk main lagi');
  }
  if (state.paused && state.screen === 'play') {
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'JEDA — tekan P untuk lanjut', 640, 400, 36, '#ffffff', 'bold', 'center');
  }
}
