/*
 * Reflet — moteur de jeu pur (sans DOM).
 * Chargé par index.html (window.RefletEngine) et par les tests Node.
 * Règle centrale : un seul ordre de déplacement déplace les deux lucioles ;
 * la seconde (le reflet) joue le même ordre en miroir horizontal (G<->D).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RefletEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIRS = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
  var MIRROR = { U: 'U', D: 'D', L: 'R', R: 'L' };

  function parseLevel(level) {
    var rows = level.grid;
    var h = rows.length, w = rows[0].length;
    var walls = new Array(h * w).fill(false);
    var posA = null, posB = null, goalA = null, goalB = null;
    for (var r = 0; r < h; r++) {
      if (rows[r].length !== w) throw new Error('grille non rectangulaire niveau ' + level.name);
      for (var c = 0; c < w; c++) {
        var ch = rows[r][c];
        if (ch === '#') walls[r * w + c] = true;
        else if (ch === 'A') posA = r * w + c;
        else if (ch === 'B') posB = r * w + c;
        else if (ch === 'a') goalA = r * w + c;
        else if (ch === 'b') goalB = r * w + c;
        else if (ch !== '.') throw new Error('caractère inconnu « ' + ch + ' » niveau ' + level.name);
      }
    }
    if (posA === null || posB === null || goalA === null || goalB === null)
      throw new Error('niveau ' + level.name + ' : il faut A, B, a et b');
    if (posA === posB) throw new Error('niveau ' + level.name + ' : A et B superposés');
    return { w: w, h: h, walls: walls, posA: posA, posB: posB, goalA: goalA, goalB: goalB,
             name: level.name, par: level.par || null, theme: level.theme || null };
  }

  function createState(level) {
    var g = parseLevel(level);
    return { w: g.w, h: g.h, walls: g.walls,
             posA: g.posA, posB: g.posB, goalA: g.goalA, goalB: g.goalB,
             name: g.name, par: g.par, theme: g.theme,
             moves: 0, won: false, history: [] };
  }

  // Case cible d'un pas depuis idx dans dir, ou null si mur / hors grille.
  function step(state, idx, dir) {
    var r = Math.floor(idx / state.w), c = idx % state.w;
    var d = DIRS[dir];
    var nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= state.h || nc < 0 || nc >= state.w) return null;
    var ni = nr * state.w + nc;
    return state.walls[ni] ? null : ni;
  }

  /*
   * Applique un ordre aux deux lucioles simultanément.
   * Renvoie { moved: bool, aMoved: bool, bMoved: bool, blocked: string|null, won: bool }.
   * Règles de résolution simultanée :
   *  - une luciole face à un mur reste sur place ;
   *  - l'autre ne peut pas entrer sur la case d'une luciole immobile ;
   *  - deux lucioles qui visent la même case vide restent toutes deux sur place ;
   *  - deux lucioles qui se croisent (échange de cases) restent sur place.
   */
  function attemptMove(state, dir) {
    if (state.won) return { moved: false, aMoved: false, bMoved: false, blocked: 'won', won: true };
    if (!DIRS[dir]) throw new Error('direction inconnue ' + dir);
    var ta = step(state, state.posA, dir);
    var tb = step(state, state.posB, MIRROR[dir]);
    var na = ta === null ? state.posA : ta;
    var nb = tb === null ? state.posB : tb;

    var blocked = null;
    if (ta !== null && ta === state.posB && tb === null) { na = state.posA; blocked = 'A'; }
    else if (tb !== null && tb === state.posA && ta === null) { nb = state.posB; blocked = 'B'; }
    else if (ta !== null && tb !== null && ta === tb) { na = state.posA; nb = state.posB; blocked = 'both'; }
    else if (ta === state.posB && tb === state.posA && ta !== null && tb !== null) { na = state.posA; nb = state.posB; blocked = 'swap'; }

    if (na === state.posA && nb === state.posB)
      return { moved: false, aMoved: false, bMoved: false, blocked: blocked || 'walls', won: false };

    state.history.push({ posA: state.posA, posB: state.posB, moves: state.moves });
    state.posA = na; state.posB = nb; state.moves++;
    state.won = state.posA === state.goalA && state.posB === state.goalB;
    return { moved: true, aMoved: na !== state.history[state.history.length - 1].posA,
             bMoved: nb !== state.history[state.history.length - 1].posB,
             blocked: null, won: state.won };
  }

  function undo(state) {
    if (!state.history.length || state.won) return false;
    var prev = state.history.pop();
    state.posA = prev.posA; state.posB = prev.posB; state.moves = prev.moves;
    return true;
  }

  // Solveur BFS (tests) : distance minimale en coups, ou -1 si insoluble.
  function solve(state) {
    var start = state.posA * state.w * state.h + state.posB;
    var target = state.goalA * state.w * state.h + state.goalB;
    if (start === target) return 0;
    var dist = {}; dist[start] = 0;
    var queue = [start];
    var head = 0;
    while (head < queue.length) {
      var cur = queue[head++];
      var posA = Math.floor(cur / (state.w * state.h)), posB = cur % (state.w * state.h);
      for (var dir in DIRS) {
        var probe = { w: state.w, h: state.h, walls: state.walls,
                      posA: posA, posB: posB, goalA: state.goalA, goalB: state.goalB,
                      moves: 0, won: false, history: [] };
        var r = attemptMove(probe, dir);
        if (!r.moved) continue;
        var key = probe.posA * state.w * state.h + probe.posB;
        if (dist[key] === undefined) {
          dist[key] = dist[cur] + 1;
          if (key === target) return dist[key];
          queue.push(key);
        }
      }
    }
    return -1;
  }

  return { DIRS: DIRS, MIRROR: MIRROR, parseLevel: parseLevel, createState: createState,
           attemptMove: attemptMove, undo: undo, solve: solve, step: step };
});
