// Warung Kilat — main.ts (Node 22, standard library only).
// Program penyerahan entri: menyalin game/ dan screenshots/ dari repo ini ke
// direktori output lalu menulis dossier.json memakai pustaka vendored
// vendor/makefun-game.ts. Di luar grader, MAKEFUN_OUTPUT_DIR menggantikan
// /output. Jalankan: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });

const shotsOut = join(outDir, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(repoRoot, 'screenshots');
if (existsSync(shotsIn)) cpSync(shotsIn, shotsOut, { recursive: true });

// Batas gate (lihat RULES.txt): teks dossier 160 KiB, maks 4 screenshot @256 KiB,
// game/ maks 993 file dan 48 MiB, tiap path maks 1000 byte.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
