// game.js — the spot-the-difference game logic for Kopi Senja Lane.
//
// One scene per level, two panels side by side: the left is the original, the
// right carries every difference. A click on either panel near an unfound
// difference marks it on both panels with a golden ring; a wrong click costs
// 25 points and shakes the panel. Three levels, a countdown per level, hints,
// a score, and a win screen with the full list of what changed.

import { LEVELS, VIEW_W, VIEW_H, renderLevel } from './scenes.js';
import { playFound, playMiss, playHint, playLevelClear, playWin, playTick } from './sound.js';

const $ = (id) => document.getElementById(id);
const CLICK_RADIUS = 30;
const POINTS_FOUND = 100;
const POINTS_MISS = 25;
const POINTS_HINT = 50;
const HINTS_PER_LEVEL = 3;

const state = {
  levelIndex: 0,
  found: new Set(),
  score: 0,
  mistakes: 0,
  hintsLeft: HINTS_PER_LEVEL,
  timeLeft: 0,
  timerId: null,
  playing: false,
  hintTimerId: null,
  best: 0,
};

try {
  state.best = Number(window.localStorage.getItem('kopi-senja-best') || 0) || 0;
} catch (e) {
  state.best = 0;
}

/** Format seconds as M:SS. */
export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function setMessage(text, bad = false) {
  const el = $('message');
  el.textContent = text;
  el.classList.toggle('bad', bad);
}

/** Refresh every HUD number from state. */
export function updateHud() {
  const level = currentLevel();
  $('found-count').textContent = String(state.found.size);
  $('total-count').textContent = String(level.diffs.length);
  $('left-count').textContent = String(level.diffs.length - state.found.size);
  $('score').textContent = String(state.score);
  $('timer').textContent = formatTime(Math.max(0, state.timeLeft));
  const frac = state.timeLeft / level.timeLimit;
  const bar = $('timer-bar');
  bar.style.width = `${Math.max(0, frac * 100)}%`;
  bar.classList.toggle('low', state.timeLeft <= 30);
  $('timer-chip').classList.toggle('low', state.timeLeft <= 30);
  $('hint-btn').textContent = `Hint (${state.hintsLeft})`;
  $('hint-btn').disabled = !state.playing || state.hintsLeft <= 0;
  const dots = $('progress-dots');
  dots.innerHTML = level.diffs.map((d) => `<span class="dot${state.found.has(d.id) ? ' found' : ''}" title="${d.label}"></span>`).join('');
}

/** Build the level tabs (one per level, done ones get a check). */
function renderTabs() {
  const tabs = $('level-tabs');
  tabs.innerHTML = LEVELS.map((lv, i) =>
    `<button type="button" class="level-tab${i === state.levelIndex ? ' active' : ''}${i < state.levelIndex ? ' done' : ''}" data-level="${i}">${i < state.levelIndex ? '✓ ' : ''}${i + 1}. ${lv.name}</button>`).join('');
  tabs.querySelectorAll('.level-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.level);
      if (idx <= state.levelIndex) startLevel(idx);
    });
  });
}

/** Draw both panels for the current level, re-applying found markers. */
function renderPanels() {
  const { left, right } = renderLevel(state.levelIndex, state.found);
  $('scene-left').innerHTML = left;
  $('scene-right').innerHTML = right;
  for (const diff of currentLevel().diffs) {
    if (state.found.has(diff.id)) drawFoundRing(diff);
  }
}

/** Paint a golden ring marker for a found difference on both panels. */
function drawFoundRing(diff) {
  for (const side of ['left', 'right']) {
    const svg = document.querySelector(`#scene-${side} svg`);
    if (!svg) continue;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'found-ring');
    g.innerHTML = `<circle cx="${diff.x}" cy="${diff.y}" r="24" fill="none" stroke="#f6c453" stroke-width="5"/>`
      + `<circle cx="${diff.x}" cy="${diff.y}" r="24" fill="none" stroke="#c2571b" stroke-width="1.5"/>`
      + `<circle cx="${diff.x}" cy="${diff.y}" r="3" fill="#c2571b"/>`;
    svg.appendChild(g);
  }
}

/** Flash a red X where a wrong click landed. */
function drawMissMark(side, x, y) {
  const svg = document.querySelector(`#scene-${side} svg`);
  if (!svg) return;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'miss-mark');
  g.innerHTML = `<g stroke="#c0392b" stroke-width="4" stroke-linecap="round">`
    + `<line x1="${x - 9}" y1="${y - 9}" x2="${x + 9}" y2="${y + 9}"/>`
    + `<line x1="${x + 9}" y1="${y - 9}" x2="${x - 9}" y2="${y + 9}"/>`
    + `</g>`;
  svg.appendChild(g);
  window.setTimeout(() => g.remove(), 700);
}

/** Convert a click event on a panel into scene coordinates (640 x 420 space). */
function eventToSceneCoords(event, panelEl) {
  const svg = panelEl.querySelector('svg');
  const rect = svg.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

/** Handle a click on either panel. */
function onPanelClick(event) {
  if (!state.playing) return;
  const panelEl = event.currentTarget;
  const side = panelEl.id === 'panel-left' ? 'left' : 'right';
  const { x, y } = eventToSceneCoords(event, panelEl);
  const level = currentLevel();
  let nearest = null;
  let nearestDist = Infinity;
  for (const diff of level.diffs) {
    if (state.found.has(diff.id)) continue;
    const d = Math.hypot(diff.x - x, diff.y - y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = diff;
    }
  }
  if (nearest !== null && nearestDist <= CLICK_RADIUS) {
    state.found.add(nearest.id);
    state.score += POINTS_FOUND;
    playFound();
    drawFoundRing(nearest);
    setMessage(`Found it — ${nearest.label}!`);
    updateHud();
    if (state.found.size === level.diffs.length) levelCleared();
  } else {
    state.score = Math.max(0, state.score - POINTS_MISS);
    state.mistakes += 1;
    playMiss();
    drawMissMark(side, x, y);
    panelEl.classList.remove('shake');
    void panelEl.offsetWidth;
    panelEl.classList.add('shake');
    setMessage('Not a difference — minus 25 points.', true);
    updateHud();
  }
}

// ---- timer, hints, level flow, overlays ----

function stopTimer() {
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function tickTimer() {
  state.timeLeft -= 1;
  if (state.timeLeft <= 10 && state.timeLeft > 0) playTick();
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateHud();
    timeUp();
    return;
  }
  updateHud();
}

/** Start (or restart) a level: fresh found set, fresh timer, clean panels. */
export function startLevel(idx) {
  stopTimer();
  if (state.hintTimerId !== null) {
    window.clearTimeout(state.hintTimerId);
    state.hintTimerId = null;
  }
  state.levelIndex = idx;
  state.found = new Set();
  state.hintsLeft = HINTS_PER_LEVEL;
  state.timeLeft = LEVELS[idx].timeLimit;
  state.playing = true;
  hideOverlay();
  renderTabs();
  renderPanels();
  setMessage(`Level ${idx + 1}: ${LEVELS[idx].name} — find ${LEVELS[idx].diffs.length} differences!`);
  updateHud();
  state.timerId = window.setInterval(tickTimer, 1000);
}

/** All differences found: time bonus, then the next level or the win screen. */
function levelCleared() {
  stopTimer();
  state.playing = false;
  const bonus = state.timeLeft * 5;
  state.score += bonus;
  playLevelClear();
  updateHud();
  const level = currentLevel();
  const isLast = state.levelIndex === LEVELS.length - 1;
  const list = level.diffs.map((d) => `<li>${d.label}</li>`).join('');
  showOverlay(`
    <h2>${isLast ? 'You found them all!' : `Level ${state.levelIndex + 1} clear!`}</h2>
    <p>Every difference in <b>${level.name}</b>, found.<br>Time bonus: <b>+${bonus}</b> points.</p>
    <p>What changed:</p>
    <ul class="diff-list">${list}</ul>
    <br><button type="button" id="overlay-next">${isLast ? 'See your final score' : `Next level: ${LEVELS[state.levelIndex + 1].name}`}</button>
  `);
  $('overlay-next').addEventListener('click', () => {
    if (isLast) showWin();
    else startLevel(state.levelIndex + 1);
  });
}

/** The countdown hit zero before every difference was found. */
function timeUp() {
  stopTimer();
  state.playing = false;
  setMessage("Time's up!", true);
  showOverlay(`
    <h2>Time's up!</h2>
    <p>You found <b>${state.found.size}</b> of <b>${currentLevel().diffs.length}</b> differences in ${currentLevel().name}.</p>
    <p>Take another look — the differences are still there.</p>
    <button type="button" id="overlay-retry">Try this level again</button>
  `);
  $('overlay-retry').addEventListener('click', () => startLevel(state.levelIndex));
}

/** All three levels done: final score, best score, restart. */
function showWin() {
  state.playing = false;
  playWin();
  const isBest = state.score > state.best;
  if (isBest) {
    state.best = state.score;
    try {
      window.localStorage.setItem('kopi-senja-best', String(state.best));
    } catch (e) { /* private mode: best score just is not saved */ }
  }
  const total = LEVELS.reduce((n, lv) => n + lv.diffs.length, 0);
  showOverlay(`
    <h2>You finished Kopi Senja Lane!</h2>
    <p>All <b>${total} differences</b> across 3 street scenes, found with <b>${state.mistakes}</b> wrong clicks.</p>
    <div class="big-score">${state.score} points</div>
    <p>${isBest ? 'A new best score!' : `Best score: ${state.best} points.`}</p>
    <button type="button" id="overlay-again">Play again from Level 1</button>
  `);
  $('overlay-again').addEventListener('click', () => startLevel(0));
}

/** Show a hint: pulse a ring around one unfound difference for 3 seconds. */
export function useHint() {
  if (!state.playing || state.hintsLeft <= 0) return;
  const remaining = currentLevel().diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - POINTS_HINT);
  playHint();
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  for (const side of ['left', 'right']) {
    const svg = document.querySelector(`#scene-${side} svg`);
    if (!svg) continue;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'hint-ring');
    g.innerHTML = `<circle cx="${pick.x}" cy="${pick.y}" r="30" fill="none" stroke="#14655a" stroke-width="4" stroke-dasharray="8 6"/>`;
    svg.appendChild(g);
    window.setTimeout(() => g.remove(), 3000);
  }
  setMessage('Hint: look inside the pulsing circle. (−50 points)');
  updateHud();
}

function showOverlay(html) {
  $('overlay-card').innerHTML = html;
  $('overlay').classList.remove('hidden');
}

function hideOverlay() {
  $('overlay').classList.add('hidden');
  $('overlay-card').innerHTML = '';
}

/** The start screen: how to play, then Level 1. */
function showStart() {
  state.playing = false;
  renderTabs();
  renderPanels();
  updateHud();
  showOverlay(`
    <h2>Kopi Senja Lane</h2>
    <p>Two pictures of the same street, side by side — but <b>7 things changed</b> between them.
    Click a difference on either picture to mark it.</p>
    <p>Three levels, three streets: a café at dusk, a night market, a rainy morning.
    Beat the clock, use hints sparingly, and mind the wrong clicks.</p>
    <button type="button" id="overlay-start">Start playing</button>
  `);
  $('overlay-start').addEventListener('click', () => startLevel(0));
}

// ---- boot ----

/** Wire up buttons, keys and panels, then show the start screen. */
export function initGame() {
  $('panel-left').addEventListener('click', onPanelClick);
  $('panel-right').addEventListener('click', onPanelClick);
  $('hint-btn').addEventListener('click', useHint);
  $('restart-btn').addEventListener('click', () => startLevel(state.levelIndex));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') useHint();
    if (event.key === 'r' || event.key === 'R') startLevel(state.levelIndex);
  });
  showStart();
}

// ---- screenshot mode ----
// ?shot=N&level=L starts level L immediately with the first N differences
// already marked, so a real browser render shows the game mid-play: markers
// on found differences, several still unfound, and the counter. Used only to
// take the entry's screenshots; normal play never passes these parameters.

/** Read the screenshot-mode parameters, if the page was opened with them. */
export function screenshotMode() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const level = params.get('level');
  if (shot === null) return null;
  return {
    foundCount: Math.max(0, Number(shot) || 0),
    levelIndex: Math.min(LEVELS.length - 1, Math.max(0, (Number(level) || 1) - 1)),
  };
}

/** Enter screenshot mode: start the level and pre-mark N differences. */
export function enterScreenshotMode(mode) {
  startLevel(mode.levelIndex);
  const level = currentLevel();
  const n = Math.min(mode.foundCount, level.diffs.length);
  for (let i = 0; i < n; i++) {
    const diff = level.diffs[i];
    state.found.add(diff.id);
    drawFoundRing(diff);
  }
  state.score = n * POINTS_FOUND;
  stopTimer();
  state.playing = true;
  setMessage(`${n} found — ${level.diffs.length - n} differences still hiding. Can you spot them?`);
  updateHud();
}
