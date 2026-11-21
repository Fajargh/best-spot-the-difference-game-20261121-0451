// scenes.js — the three hand-drawn street scenes of Kopi Senja Lane.
//
// Every scene is drawn twice from one builder: the left panel is the original,
// the right panel applies the scene's differences. A difference is a small,
// deliberate change (a missing cat, a recoloured stripe, a dark window) with a
// fixed centre point the click test uses. All art is SVG built in code here;
// no image, font or sound is ever fetched.

export const VIEW_W = 640;
export const VIEW_H = 420;

// ---- tiny SVG helpers (each returns a string fragment) ----

const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circ = (cx, cy, r, fill, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const ell = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const poly = (points, fill, extra = '') =>
  `<polygon points="${points}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const txt = (x, y, str, size, fill, anchor = 'middle', extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="bold" fill="${fill}" text-anchor="${anchor}" font-family="Trebuchet MS, Verdana, sans-serif" ${extra}>${str}</text>`;
const line = (x1, y1, x2, y2, stroke, w = 2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;

/** A soft cloud made of three overlapping circles. */
function cloud(cx, cy, scale, fill) {
  return `<g fill="${fill}" opacity="0.95">`
    + circ(cx, cy, 18 * scale, fill)
    + circ(cx - 20 * scale, cy + 6 * scale, 13 * scale, fill)
    + circ(cx + 20 * scale, cy + 6 * scale, 14 * scale, fill)
    + rect(cx - 34 * scale, cy, 68 * scale, 12 * scale, fill)
    + `</g>`;
}

/** A little bird: two short arcs. */
function bird(x, y, color) {
  return `<g stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round">`
    + `<path d="M ${x - 10} ${y} Q ${x - 4} ${y - 8} ${x} ${y}"/>`
    + `<path d="M ${x} ${y} Q ${x + 4} ${y - 8} ${x + 10} ${y}"/>`
    + `</g>`;
}

/** A sitting cat silhouette. */
function cat(x, y, s, fill) {
  return `<g fill="${fill}">`
    + ell(x, y + 14 * s, 13 * s, 10 * s, fill)
    + circ(x, y, 9 * s, fill)
    + poly(`${x - 8 * s},${y - 5 * s} ${x - 5 * s},${y - 14 * s} ${x - 1 * s},${y - 7 * s}`, fill)
    + poly(`${x + 1 * s},${y - 7 * s} ${x + 5 * s},${y - 14 * s} ${x + 8 * s},${y - 5 * s}`, fill)
    + `<path d="M ${x + 11 * s} ${y + 12 * s} Q ${x + 20 * s} ${y + 4 * s} ${x + 17 * s} ${y - 4 * s}" stroke="${fill}" stroke-width="${4 * s}" fill="none" stroke-linecap="round"/>`
    + `</g>`;
}

/** A striped shop awning. `stripe` is the colour of the middle stripe. */
function awning(x, y, w, stripe) {
  const n = 6;
  const sw = w / n;
  let out = '';
  for (let i = 0; i < n; i++) {
    out += rect(x + i * sw, y, sw, 26, i % 2 === 0 ? '#f6ead2' : stripe);
  }
  let scallops = '';
  for (let i = 0; i < n; i++) {
    scallops += `<path d="M ${x + i * sw} ${y + 26} a ${sw / 2} ${sw / 2} 0 0 0 ${sw} 0 z" fill="${i % 2 === 0 ? '#f6ead2' : stripe}"/>`;
  }
  return `<g>${out}${scallops}</g>`;
}

/** A simple bicycle. `basket` toggles the front basket. */
function bicycle(x, y, s, frame, basket) {
  const wheel = (cx) => circ(cx, y, 16 * s, 'none', `stroke="#2b2118" stroke-width="${3 * s}"`)
    + circ(cx, y, 2.5 * s, '#2b2118');
  let out = wheel(x) + wheel(x + 52 * s);
  out += line(x, y, x + 24 * s, y - 22 * s, frame, 3.5 * s)
    + line(x + 52 * s, y, x + 24 * s, y - 22 * s, frame, 3.5 * s)
    + line(x + 24 * s, y - 22 * s, x + 36 * s, y - 22 * s, frame, 3.5 * s)
    + line(x + 36 * s, y - 22 * s, x + 52 * s, y, frame, 3.5 * s)
    + line(x + 24 * s, y - 22 * s, x + 20 * s, y - 30 * s, '#2b2118', 3 * s)
    + line(x + 14 * s, y - 30 * s, x + 27 * s, y - 30 * s, '#2b2118', 3 * s)
    + line(x + 36 * s, y - 22 * s, x + 40 * s, y - 30 * s, '#2b2118', 3 * s);
  if (basket) {
    out += rect(x + 44 * s, y - 30 * s, 20 * s, 13 * s, '#b07a3f', 'rx="2"')
      + line(x + 40 * s, y - 30 * s, x + 46 * s, y - 28 * s, '#8a5a28', 2 * s);
  }
  return `<g>${out}</g>`;
}

// ---------------------------------------------------------------- level 1

export const LEVEL_1_DIFFS = [
  { id: 'sun', x: 545, y: 78, label: 'The sun turned into a crescent moon' },
  { id: 'cat', x: 330, y: 178, label: 'The cat on the café roof is gone' },
  { id: 'stripe', x: 320, y: 222, label: 'One awning stripe changed colour' },
  { id: 'cup', x: 322, y: 322, label: 'A coffee cup vanished from the table' },
  { id: 'basket', x: 152, y: 342, label: 'The bicycle lost its basket' },
  { id: 'window', x: 90, y: 250, label: 'A window went dark' },
  { id: 'bird', x: 195, y: 62, label: 'A bird flew away' },
];

/** Level 1: "Café at Dusk" — the Kopi Senja café on a quiet lane. */
function drawLevel1(uid, mods) {
  const has = (id) => mods.has(id);
  let s = `<svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Café at dusk street scene">`;
  s += `<defs><linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#7b5ea7"/><stop offset="0.55" stop-color="#e8836b"/><stop offset="1" stop-color="#f6c453"/>`
    + `</linearGradient></defs>`;
  s += rect(0, 0, 640, 300, `url(#sky${uid})`);
  // sun or crescent moon
  if (has('sun')) {
    s += circ(545, 78, 30, '#fdf6d8');
    s += circ(556, 70, 26, '#e8836b', 'opacity="0.85"');
  } else {
    s += circ(545, 78, 32, '#ffb347');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      s += line(545 + Math.cos(a) * 40, 78 + Math.sin(a) * 40, 545 + Math.cos(a) * 50, 78 + Math.sin(a) * 50, '#ffb347', 3);
    }
  }
  s += cloud(140, 70, 1, '#ffffff') + cloud(420, 48, 0.8, '#ffe9d6');
  s += bird(120, 66, '#4a3560') + (has('bird') ? '' : bird(195, 62, '#4a3560'));
  // left building
  s += rect(0, 140, 190, 190, '#8d6b9e');
  s += rect(0, 140, 190, 14, '#6d4f7d');
  s += rect(24, 170, 56, 64, has('window') ? '#4a3560' : '#ffd97a', 'stroke="#5d4270" stroke-width="3"');
  s += line(52, 170, 52, 234, '#5d4270', 3) + line(24, 202, 80, 202, '#5d4270', 3);
  s += rect(112, 170, 56, 64, '#ffd97a', 'stroke="#5d4270" stroke-width="3"');
  s += line(140, 170, 140, 234, '#5d4270', 3) + line(112, 202, 168, 202, '#5d4270', 3);
  s += rect(70, 260, 50, 70, '#5d4270');
  s += circ(112, 296, 3, '#f6c453');
  s += txt(95, 160, 'TOKO BUKU', 13, '#f6ead2');
  // right building
  s += rect(450, 160, 190, 170, '#a85f4e');
  s += rect(450, 160, 190, 14, '#8a4636');
  s += rect(474, 186, 52, 56, '#ffd97a', 'stroke="#8a4636" stroke-width="3"');
  s += rect(556, 186, 52, 56, '#ffd97a', 'stroke="#8a4636" stroke-width="3"');
  s += rect(522, 268, 46, 62, '#6d3428');
  s += txt(545, 180, 'WARUNG', 13, '#f6ead2');
  // café centre
  s += rect(190, 190, 260, 140, '#f2d8a7');
  s += rect(190, 190, 260, 10, '#c9a06a');
  s += awning(196, 208, 248, has('stripe') ? '#14655a' : '#c2571b');
  s += rect(214, 258, 66, 58, '#ffd97a', 'stroke="#8a5a28" stroke-width="3"');
  s += line(247, 258, 247, 316, '#8a5a28', 3);
  s += rect(360, 258, 66, 58, '#ffd97a', 'stroke="#8a5a28" stroke-width="3"');
  s += line(393, 258, 393, 316, '#8a5a28', 3);
  s += rect(292, 258, 56, 72, '#7a4a21');
  s += circ(340, 296, 3.5, '#f6c453');
  s += txt(320, 206, 'KOPI SENJA', 14, '#5d3413');
  if (!has('cat')) s += cat(330, 178, 1, '#3a2a1c');
  // street
  s += rect(0, 330, 640, 90, '#7d7468');
  s += rect(0, 330, 640, 6, '#6b6257');
  for (let x = 20; x < 640; x += 90) s += rect(x, 372, 46, 5, '#f6ead2', 'opacity="0.7"');
  // café table with cups
  s += ell(320, 352, 46, 7, '#00000033');
  s += line(320, 330, 320, 352, '#6d4a2a', 4);
  s += ell(320, 330, 34, 6, '#8a5a28');
  s += rect(296, 312, 16, 14, '#fff6e8', 'stroke="#c2571b" stroke-width="2"');
  s += path('M 312 316 q 8 2 0 8', 'none', 'stroke="#c2571b" stroke-width="2" fill="none"');
  if (!has('cup')) {
    s += rect(330, 312, 16, 14, '#14655a', 'stroke="#0d453e" stroke-width="2"');
    s += path('M 346 316 q 8 2 0 8', 'none', 'stroke="#0d453e" stroke-width="2" fill="none"');
  }
  s += path('M 300 312 q 3 -8 0 -12 M 308 312 q 3 -8 0 -12', 'none', 'stroke="#ffffff" stroke-width="2" opacity="0.7" fill="none"');
  // bicycle and plant
  s += bicycle(96, 356, 1, '#c2571b', !has('basket'));
  s += rect(560, 330, 34, 26, '#b0562f');
  s += circ(577, 318, 10, '#2e9e7a') + circ(568, 326, 8, '#3cb371') + circ(586, 326, 8, '#2e9e7a');
  // hanging lantern
  s += line(486, 160, 486, 176, '#2b2118', 2);
  s += ell(486, 196, 13, 17, '#ff9d2e', 'stroke="#c2571b" stroke-width="2"');
  s += line(486, 179, 486, 213, '#c2571b', 2);
  s += `</svg>`;
  return s;
}

// ---------------------------------------------------------------- level 2

export const LEVEL_2_DIFFS = [
  { id: 'lantern', x: 96, y: 148, label: 'A paper lantern changed colour' },
  { id: 'oranges', x: 300, y: 300, label: 'An orange went missing from the fruit stall' },
  { id: 'sign', x: 320, y: 236, label: 'The stall sign lost a letter' },
  { id: 'bulb', x: 430, y: 96, label: 'A string-light bulb went out' },
  { id: 'moon', x: 560, y: 66, label: 'The moon changed phase' },
  { id: 'umbrella', x: 480, y: 210, label: 'The stall umbrella changed colour' },
  { id: 'stallcat', x: 160, y: 352, label: 'The stall cat disappeared' },
  { id: 'price', x: 392, y: 300, label: 'The price tag changed' },
];

/** A hanging paper lantern. */
function paperLantern(x, y, color) {
  return `<g>${line(x, y - 22, x, y - 12, '#2b2118', 2)}
    ${ell(x, y, 14, 18, color, 'stroke="#8a2f1d" stroke-width="2"')}
    ${line(x - 14, y, x + 14, y, '#8a2f1d', 1.5)}
    ${line(x, y + 18, x, y + 26, '#c2571b', 2)}</g>`;
}

/** A string of warm bulbs between two points. `out` is the index of a dark bulb, or -1. */
function stringLights(x1, y1, x2, y2, out) {
  const n = 7;
  let s = `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.max(y1, y2) + 26} ${x2} ${y2}" stroke="#2b2118" stroke-width="2" fill="none"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 24;
    const lit = i - 1 !== out;
    s += line(x, y, x, y + 6, '#2b2118', 2)
      + circ(x, y + 12, 5, lit ? '#ffd97a' : '#5d5468', lit ? '' : 'stroke="#3a3348" stroke-width="1.5"');
    if (lit) s += circ(x, y + 12, 9, '#ffd97a', 'opacity="0.25"');
  }
  return s;
}

/** Level 2: "Pasar Malam" — a night market under string lights. */
function drawLevel2(uid, mods) {
  const has = (id) => mods.has(id);
  let s = `<svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Night market street scene">`;
  s += `<defs><linearGradient id="night${uid}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#1b1440"/><stop offset="0.6" stop-color="#3b2a6b"/><stop offset="1" stop-color="#7b4a8a"/>`
    + `</linearGradient></defs>`;
  s += rect(0, 0, 640, 320, `url(#night${uid})`);
  // stars
  const stars = [[40, 40], [120, 26], [210, 52], [300, 30], [380, 44], [470, 28], [610, 40], [90, 90], [260, 84], [520, 90], [610, 110], [30, 130]];
  for (const [x, y] of stars) s += circ(x, y, 2, '#fff6d8', 'opacity="0.9"');
  // moon
  if (has('moon')) {
    s += circ(560, 66, 26, '#fdf6d8');
    s += circ(570, 58, 22, '#3b2a6b', 'opacity="0.9"');
  } else {
    s += circ(560, 66, 26, '#fdf6d8');
    s += circ(552, 60, 4, '#e8d9a0') + circ(568, 72, 3, '#e8d9a0') + circ(562, 78, 2.5, '#e8d9a0');
  }
  s += cloud(180, 60, 0.9, '#4a3a78') + cloud(420, 110, 0.7, '#4a3a78');
  // string lights across the top
  s += stringLights(20, 70, 330, 78, has('bulb') ? 3 : -1);
  s += stringLights(330, 78, 620, 66, -1);
  // back buildings
  s += rect(0, 180, 150, 140, '#2c2150');
  s += rect(490, 170, 150, 150, '#2c2150');
  for (const [x, y] of [[30, 200], [80, 200], [520, 190], [580, 190]]) {
    s += rect(x, y, 30, 34, '#ffd97a', 'opacity="0.85"');
  }
  // paper lanterns
  s += paperLantern(96, 148, has('lantern') ? '#2e9e7a' : '#e84c3d');
  s += paperLantern(600, 140, '#e84c3d');
  // left stall: sate
  s += rect(60, 250, 180, 90, '#7a4a21');
  s += rect(60, 250, 180, 12, '#5d3413');
  s += awning(52, 224, 196, '#c2571b');
  s += txt(150, 216, 'SATE AYAM', 14, '#ffe9c4');
  s += rect(76, 282, 148, 40, '#f2d8a7');
  for (let i = 0; i < 4; i++) {
    s += line(88 + i * 34, 288, 88 + i * 34, 316, '#8a5a28', 3);
    s += circ(88 + i * 34, 292, 5, '#c2571b') + circ(88 + i * 34, 302, 5, '#e8836b') + circ(88 + i * 34, 312, 5, '#c2571b');
  }
  if (!has('stallcat')) s += cat(160, 352, 0.85, '#2b2118');
  // centre stall: fruit
  s += rect(250, 250, 190, 90, '#5d7a3a');
  s += rect(250, 250, 190, 12, '#42592a');
  s += awning(242, 224, 206, '#14655a');
  s += txt(320, 216, has('sign') ? 'BUAH SEGAR' : 'BUAH SEGARR', 14, '#ffe9c4');
  s += rect(262, 282, 166, 40, '#f2d8a7');
  const oranges = has('oranges') ? 2 : 3;
  for (let i = 0; i < oranges; i++) {
    s += circ(288 + i * 26, 300, 11, '#ff8c2e') + circ(288 + i * 26 - 3, 296, 3, '#ffb347');
  }
  for (let i = 0; i < 3; i++) s += circ(352 + i * 20, 306, 9, '#e84c3d');
  s += rect(376, 288, 34, 18, '#fff6e8', 'stroke="#8a5a28" stroke-width="2"');
  s += txt(393, 301, has('price') ? '15K' : '10K', 11, '#2b2118');
  // right stall: drinks, with umbrella
  s += rect(470, 250, 150, 90, '#8a5a28');
  s += rect(470, 250, 150, 12, '#6d4520');
  s += `<path d="M 440 250 L 545 196 L 650 250 Z" fill="${has('umbrella') ? '#14655a' : '#e84c3d'}"/>`;
  s += line(545, 196, 545, 178, '#2b2118', 3) + circ(545, 176, 4, '#2b2118');
  s += txt(545, 216, 'ES TEH', 14, '#ffe9c4');
  s += rect(484, 282, 122, 40, '#f2d8a7');
  for (let i = 0; i < 3; i++) {
    s += rect(494 + i * 38, 290, 16, 26, '#7fb069', 'stroke="#42592a" stroke-width="2"');
    s += line(502 + i * 38, 290, 508 + i * 38, 280, '#c2571b', 3);
  }
  // street
  s += rect(0, 340, 640, 80, '#3a3348');
  s += rect(0, 340, 640, 5, '#2c2740');
  for (let x = 20; x < 640; x += 90) s += rect(x, 376, 46, 5, '#f6ead2', 'opacity="0.5"');
  // vendor figure behind centre stall
  s += circ(345, 238, 12, '#e8b98a');
  s += path('M 345 250 L 330 250 L 326 280 L 364 280 L 360 250 Z', '#f6c453');
  s += `</svg>`;
  return s;
}

// ---------------------------------------------------------------- level 3

export const LEVEL_3_DIFFS = [
  { id: 'umbrella', x: 320, y: 130, label: 'The umbrella changed colour' },
  { id: 'duck', x: 470, y: 372, label: 'A duck appeared in the puddle' },
  { id: 'flower', x: 90, y: 210, label: 'A flower vanished from the window' },
  { id: 'clouds', x: 520, y: 60, label: 'A rain cloud drifted away' },
  { id: 'boots', x: 250, y: 372, label: 'The boots changed colour' },
  { id: 'sign', x: 545, y: 236, label: 'The bakery sign lost a letter' },
  { id: 'windowcat', x: 590, y: 262, label: 'A cat appeared in the window' },
  { id: 'basket', x: 120, y: 330, label: 'The bicycle basket lost its flowers' },
  { id: 'puddle', x: 180, y: 388, label: 'A puddle shrank' },
];

/** Rain streaks across a region. */
function rain(x0, y0, x1, y1, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i * 53) % (x1 - x0));
    const y = y0 + ((i * 37) % (y1 - y0));
    s += line(x, y, x - 4, y + 12, '#9fc3e8', 1.5);
  }
  return `<g opacity="0.7">${s}</g>`;
}

/** Level 3: "Pagi Hujan" — a rainy morning on the lane. */
function drawLevel3(uid, mods) {
  const has = (id) => mods.has(id);
  let s = `<svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rainy morning street scene">`;
  s += `<defs><linearGradient id="morn${uid}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#a8c8e0"/><stop offset="0.6" stop-color="#d8e6ee"/><stop offset="1" stop-color="#f2e3c2"/>`
    + `</linearGradient></defs>`;
  s += rect(0, 0, 640, 300, `url(#morn${uid})`);
  s += cloud(120, 56, 1.1, '#8fa8bd') + cloud(300, 40, 0.9, '#9db4c6');
  if (!has('clouds')) s += cloud(520, 60, 1, '#8fa8bd');
  s += rain(0, 10, 640, 300, 42);
  // left building with flower window
  s += rect(0, 150, 190, 180, '#7a9e7e');
  s += rect(0, 150, 190, 14, '#5d7d61');
  s += rect(24, 180, 56, 60, '#cfe8f2', 'stroke="#5d7d61" stroke-width="3"');
  s += line(52, 180, 52, 240, '#5d7d61', 3) + line(24, 210, 80, 210, '#5d7d61', 3);
  if (!has('flower')) {
    s += rect(30, 240, 44, 10, '#b0562f');
    s += circ(40, 232, 6, '#e84c3d') + circ(52, 230, 6, '#f6c453') + circ(64, 232, 6, '#e84c3d');
  }
  s += rect(112, 180, 56, 60, '#cfe8f2', 'stroke="#5d7d61" stroke-width="3"');
  s += rect(70, 268, 50, 62, '#4a6b4e');
  s += txt(95, 172, 'RUMAH', 13, '#f6ead2');
  // centre: walker with umbrella
  s += rect(190, 170, 260, 160, '#c9a06a');
  s += rect(190, 170, 260, 14, '#a87f4e');
  s += rect(214, 196, 66, 58, '#cfe8f2', 'stroke="#8a5a28" stroke-width="3"');
  s += rect(360, 196, 66, 58, '#cfe8f2', 'stroke="#8a5a28" stroke-width="3"');
  s += rect(292, 196, 56, 134, '#7a4a21');
  // walker
  s += `<path d="M 250 160 A 70 70 0 0 1 390 160 Z" fill="${has('umbrella') ? '#14655a' : '#e84c3d'}"/>`;
  s += line(320, 160, 320, 148, '#2b2118', 3) + circ(320, 146, 4, '#2b2118');
  s += line(320, 160, 320, 250, '#2b2118', 3);
  s += circ(320, 262, 13, '#e8b98a');
  s += path('M 320 276 L 304 276 L 300 330 L 340 330 L 336 276 Z', '#f6c453');
  s += line(306, 330, 300, 372, '#2b2118', 4) + line(334, 330, 340, 372, '#2b2118', 4);
  s += path('M 292 372 h 18 v 8 h -18 z', has('boots') ? '#14655a' : '#c2571b');
  s += path('M 332 372 h 18 v 8 h -18 z', has('boots') ? '#14655a' : '#c2571b');
  // shop sign on a plaque, drawn last so it sits in front of the umbrella pole
  s += rect(258, 176, 124, 24, '#f2d8a7', 'stroke="#8a5a28" stroke-width="2"');
  s += txt(320, 193, 'TOKO ROTI', 14, '#5d3413');
  // right building: bakery
  s += rect(450, 160, 190, 170, '#b0562f');
  s += rect(450, 160, 190, 14, '#8a3f20');
  s += rect(474, 186, 52, 56, '#ffe9a8', 'stroke="#8a3f20" stroke-width="3"');
  s += rect(556, 186, 52, 56, '#ffe9a8', 'stroke="#8a3f20" stroke-width="3"');
  if (has('windowcat')) s += cat(582, 232, 0.8, '#3a2a1c');
  s += txt(545, 180, has('sign') ? 'ROTI MANIS' : 'ROTI MANI', 13, '#f6ead2');
  s += rect(522, 268, 46, 62, '#6d3428');
  // street with puddles
  s += rect(0, 330, 640, 90, '#6b7a86');
  s += rect(0, 330, 640, 6, '#55636e');
  s += ell(180, 388, has('puddle') ? 26 : 52, 9, '#9fc3e8', 'opacity="0.85"');
  s += ell(470, 372, 46, 8, '#9fc3e8', 'opacity="0.85"');
  if (has('duck')) {
    s += ell(470, 366, 12, 8, '#f6c453') + circ(480, 358, 6, '#f6c453')
      + poly('484,358 490,360 484,362', '#e8836b');
  }
  s += ell(560, 396, 34, 7, '#9fc3e8', 'opacity="0.7"');
  // bicycle with flower basket
  s += bicycle(70, 356, 0.9, '#14655a', true);
  if (!has('basket')) {
    s += circ(118, 322, 5, '#e84c3d') + circ(128, 320, 5, '#f6c453') + circ(124, 328, 5, '#e84c3d');
  }
  s += rain(0, 300, 640, 420, 18);
  s += `</svg>`;
  return s;
}

// ---------------------------------------------------------------- catalogue

export const LEVELS = [
  { name: 'Café at Dusk', sub: 'Level 1 · 7 differences', timeLimit: 150, diffs: LEVEL_1_DIFFS, draw: drawLevel1 },
  { name: 'Pasar Malam', sub: 'Level 2 · 8 differences', timeLimit: 180, diffs: LEVEL_2_DIFFS, draw: drawLevel2 },
  { name: 'Pagi Hujan', sub: 'Level 3 · 9 differences', timeLimit: 210, diffs: LEVEL_3_DIFFS, draw: drawLevel3 },
];

/** Render one level's two panels. `found` is a Set of diff ids already marked. */
export function renderLevel(levelIndex, found) {
  const level = LEVELS[levelIndex];
  const all = new Set(level.diffs.map((d) => d.id));
  return {
    left: level.draw('L', new Set()),
    right: level.draw('R', all),
    level,
    found: new Set(found),
  };
}
