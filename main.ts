// main.ts — the hand-in program for Kopi Senja Lane (Node 22, stdlib only).
//
// The game is plain static files under game/ (game/index.html plus its ES
// modules and stylesheet, no library, no network request) and the screenshots
// are real browser renders under screenshots/. This program copies both into
// the output directory and writes dossier.json with the vendored make.fun
// library, exactly as the bounty requires.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the playable game and the screenshots into the output directory.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Write the dossier the judge reads, using the same caps the gate applies:
// at most 160 KiB of source text, at most 4 screenshots of at most 256 KiB
// each, at most 993 game entries totalling at most 48 MiB, every game path at
// most 1000 bytes. Passing the caps here makes this program fail exactly
// where the scorer would refuse the entry, instead of handing in bad output.
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
