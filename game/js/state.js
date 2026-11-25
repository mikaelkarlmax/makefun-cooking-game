// Warung Kilat — state.js
// Satu-satunya tempat definisi data permainan: bahan, resep, pelanggan, dan
// state permainan yang berjalan. Modul lain hanya membaca atau mengubah state
// lewat fungsi-fungsi kecil di sini, jadi alur permainan mudah dilacak.

export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fff3d6', accent: '#d9a441', price: 5 },
  { id: 'mie', name: 'Mie', key: '2', color: '#ffd94d', accent: '#c98a1b', price: 5 },
  { id: 'ayam', name: 'Ayam', key: '3', color: '#ffb3a0', accent: '#c65a3c', price: 8 },
  { id: 'telur', name: 'Telur', key: '4', color: '#fff8e7', accent: '#e0a83c', price: 6 },
  { id: 'sayur', name: 'Sayur', key: '5', color: '#8fd694', accent: '#3d8b4f', price: 4 },
  { id: 'sambal', name: 'Sambal', key: '6', color: '#e23b2e', accent: '#8f1d12', price: 4 },
  { id: 'teh', name: 'Es Teh', key: '7', color: '#c98d4b', accent: '#7a4a1d', price: 4 },
];

// Produk olahan: apa yang keluar dari tiap stasiun.
export const PROCESSED = {
  ayamPotong: { id: 'ayamPotong', name: 'Ayam Potong', color: '#ffb3a0', accent: '#c65a3c' },
  sayurPotong: { id: 'sayurPotong', name: 'Sayur Potong', color: '#a8e6a1', accent: '#3d8b4f' },
  nasiGoreng: { id: 'nasiGoreng', name: 'Nasi Goreng', color: '#f2b544', accent: '#a86f14' },
  mieGoreng: { id: 'mieGoreng', name: 'Mie Goreng', color: '#e8a83c', accent: '#9c6a12' },
  telurDadar: { id: 'telurDadar', name: 'Telur Dadar', color: '#ffe066', accent: '#c98a1b' },
  ayamGoreng: { id: 'ayamGoreng', name: 'Ayam Goreng', color: '#d98a4b', accent: '#8a4d1d' },
  ayamBakar: { id: 'ayamBakar', name: 'Ayam Bakar', color: '#b06a35', accent: '#5e3013' },
};

// Resep: hidangan = kumpulan komponen yang harus ada di piring.
export const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasiGoreng', 'telurDadar', 'sayurPotong'], base: 120, color: '#f2b544' },
  { id: 'mie-goreng', name: 'Mie Goreng', needs: ['mieGoreng', 'telurDadar', 'sayurPotong'], base: 120, color: '#e8a83c' },
  { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['ayamGoreng', 'sambal'], base: 140, color: '#d98a4b' },
  { id: 'sate-bakar', name: 'Sate Bakar', needs: ['ayamBakar', 'sambal'], base: 150, color: '#b06a35' },
  { id: 'es-teh', name: 'Es Teh', needs: ['teh'], base: 60, color: '#c98d4b' },
];

export const CUSTOMERS = [
  { name: 'Bu Ratna', skin: '#f2c89b', shirt: '#c94f6d' },
  { name: 'Pak Budi', skin: '#e8b88a', shirt: '#3f6fb5' },
  { name: 'Mbak Sari', skin: '#f6d3a8', shirt: '#4a9e6d' },
  { name: 'Mas Joko', skin: '#d9a06b', shirt: '#e07b39' },
  { name: 'Kak Dewi', skin: '#f2c89b', shirt: '#7a5fc0' },
  { name: 'Om Agus', skin: '#c98d5f', shirt: '#2e7d6b' },
];

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_TICKETS = 5;

// Stasiun: bahan mentah apa yang diterima, berapa lama, jadi apa.
export const STATIONS = [
  {
    id: 'talenan', name: 'TALENAN', verb: 'POTONG', key: 'Q',
    x: 36, y: 218, w: 268, h: 196, color: '#8a5a2b', top: '#a9743a',
    jobs: [
      { from: 'ayam', to: 'ayamPotong', secs: 2.5 },
      { from: 'sayur', to: 'sayurPotong', secs: 2.0 },
    ],
  },
  {
    id: 'wajan', name: 'WAJAN', verb: 'GORENG', key: 'W',
    x: 322, y: 218, w: 268, h: 196, color: '#3a3f4a', top: '#565d6e',
    jobs: [
      { from: 'nasi', to: 'nasiGoreng', secs: 4.0 },
      { from: 'mie', to: 'mieGoreng', secs: 4.0 },
      { from: 'telur', to: 'telurDadar', secs: 3.0 },
    ],
  },
  {
    id: 'panggangan', name: 'PANGGANGAN', verb: 'BAKAR', key: 'E',
    x: 608, y: 218, w: 268, h: 196, color: '#5b3a2e', top: '#7a4e3c',
    jobs: [
      { from: 'ayam', to: 'ayamGoreng', secs: 5.0 },
      { from: 'ayamPotong', to: 'ayamBakar', secs: 4.0 },
    ],
  },
];

export const PLATE = { x: 896, y: 218, w: 348, h: 196 };

export function itemName(id) {
  const ing = INGREDIENTS.find((i) => i.id === id);
  if (ing) return ing.name;
  const proc = PROCESSED[id];
  if (proc) return proc.name;
  return id;
}

export function itemColors(id) {
  const ing = INGREDIENTS.find((i) => i.id === id);
  if (ing) return { color: ing.color, accent: ing.accent };
  const proc = PROCESSED[id];
  if (proc) return { color: proc.color, accent: proc.accent };
  return { color: '#cccccc', accent: '#888888' };
}

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

export function newGameState() {
  return {
    screen: 'title', // title | play | dayEnd | gameOver | win
    day: 1,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    served: 0,
    failed: 0,
    earnedToday: 0,
    orders: [],
    nextOrderIn: 1.5,
    nextCustomer: 0,
    stations: STATIONS.map((s) => ({ id: s.id, item: null, progress: 0, total: 0, done: false })),
    plate: [],
    carried: null,
    mouse: { x: 640, y: 400 },
    rush: false,
    rushAnnounced: false,
    banner: null,
    bannerTimer: 0,
    muted: false,
    paused: false,
    dayStats: [],
    floaters: [],
    sizzle: { wajan: 0, panggangan: 0 },
  };
}
