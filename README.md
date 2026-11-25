# Warung Kilat — Dapur Rush Indonesia

[![Make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/mikaelkarlmax/makefun-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/mikaelkarlmax/makefun-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

Game masak cepat saji bertema warung Indonesia, dibuat untuk kompetisi
[Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
di make.fun. Semua seni, nama, dan suara orisinal — digambar dan disintesis
dari nol, tanpa aset berhak cipta dan tanpa network.

## Cara main

1. **Ambil bahan** — klik tempat bahan di bawah (atau tekan `1`–`7`).
2. **Olah** — letakkan bahan di **Talenan** (`Q`, potong), **Wajan** (`W`, goreng),
   atau **Panggangan** (`E`, bakar). Klik stasiun saat memasak untuk mempercepat.
3. **Rakit** — letakkan komponen matang di **Piring Saji** sesuai resep tiket.
4. **Sajikan** — klik tiket pelanggan (atau tekan `Spasi`) sebelum kesabarannya habis.

Menu: **Nasi Goreng** (nasi goreng + telur dadar + sayur potong),
**Mie Goreng**, **Ayam Geprek** (ayam goreng + sambal),
**Sate Bakar** (ayam bakar + sambal), dan **Es Teh**.

Sajian beruntun menaikkan **kombo** (+20 poin per tingkat), sajian cepat dapat
bonus waktu, pelanggan yang kabur menghilangkan satu hati. Bertahan **3 hari**
(shift); 30 detik terakhir tiap shift adalah **Rush Hour** — pesanan datang
dua kali lebih cepat. `P` jeda, `M` suara, `R` mulai ulang.

## Jalankan lokal

```sh
node serve.ts
# buka http://localhost:8080
```

Game berupa file statis di `game/` — cukup sajikan dengan server HTTP apa pun.
Tidak ada build step, tidak ada request jaringan.

## Struktur source

- `game/js/state.js` — bahan, resep, pelanggan, stasiun, state permainan
- `game/js/orders.js` — pesanan, kesabaran pelanggan, skor & kombo
- `game/js/kitchen.js` — logika stasiun, piring, dan tangan koki
- `game/js/render.js` — semua gambar Canvas 2D (dapur, tiket, makanan)
- `game/js/input.js` — klik mouse dan keyboard
- `game/js/audio.js` — bunyi WebAudio yang disintesis (tanpa file suara)
- `game/js/main.js` — loop permainan, shift, dan staging screenshot
- `main.ts` — program penyerahan entri (menulis `dossier.json`)

## Lisensi

MIT — lihat [LICENSE](LICENSE).
