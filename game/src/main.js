// main.js — bootstrap for Kopi Senja Lane.
//
// Wires the game up when the page loads. With no query parameters the player
// gets the start screen; with ?shot=N&level=L the game opens mid-play with N
// differences already marked (screenshot mode, used to take the entry's
// screenshots of a real render).

import { initGame, screenshotMode, enterScreenshotMode } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  initGame();
  const mode = screenshotMode();
  if (mode !== null) enterScreenshotMode(mode);
});
