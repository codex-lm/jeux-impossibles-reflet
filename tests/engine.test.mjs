/* Tests du moteur Reflet — node --test tests/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('../js/engine.js');
const L = require('../js/levels.js');

const rc = (r, c, w) => r * w + c;

test('parseLevel rejette les grilles invalides', () => {
  assert.throws(() => E.parseLevel({ name: 'x', grid: ['..', '.'] }), /rectangulaire/);
  assert.throws(() => E.parseLevel({ name: 'x', grid: ['..'] }), /A, B, a et b/);
  assert.throws(() => E.parseLevel({ name: 'x', grid: ['A.a'] }), /A, B, a et b/);
  assert.throws(() => E.parseLevel({ name: 'x', grid: ['A.BaX'] }), /caractère inconnu/);
});

test('un ordre vertical déplace les deux lucioles dans le même sens', () => {
  const st = E.createState(L.levels[0]); // Éveil : A(3,1) B(3,3)
  const r = E.attemptMove(st, 'U');
  assert.equal(r.moved, true);
  assert.equal(st.posA, rc(2, 1, 5));
  assert.equal(st.posB, rc(2, 3, 5));
  assert.equal(st.moves, 1);
});

test('un ordre horizontal déplace B en miroir (D devient G)', () => {
  const st = E.createState(L.levels[1]); // Miroir : A(3,0) B(3,3)
  E.attemptMove(st, 'R');
  assert.equal(st.posA, rc(3, 1, 5)); // A vers la droite
  assert.equal(st.posB, rc(3, 2, 5)); // B vers la gauche
});

test('un mur bloque une luciole, pas l’autre', () => {
  // La dérive : mur en (4,4) à gauche de B(4,5) → R ne déplace que A.
  const lvl = L.levels.find((l) => l.name === 'La dérive');
  const st = E.createState(lvl);
  const r = E.attemptMove(st, 'R');
  assert.equal(r.aMoved, true);
  assert.equal(r.bMoved, false);
  assert.equal(st.posA, rc(4, 2, 7));
  assert.equal(st.posB, rc(4, 5, 7));
});

test('deux lucioles visant la même case restent sur place (contesté, sans coût)', () => {
  const st = E.createState({ name: 't', grid: ['a...b', '.....', '.A.B.'] }); // 5x3
  const r = E.attemptMove(st, 'R'); // A→(2,2) et B→(2,2)
  assert.equal(r.moved, false);
  assert.equal(r.blocked, 'both');
  assert.equal(st.moves, 0);
  assert.equal(st.posA, rc(2, 1, 5));
  assert.equal(st.posB, rc(2, 3, 5));
});

test('le croisement (échange de cases) est interdit', () => {
  const st = E.createState({ name: 't', grid: ['AB.', 'ba.'] }); // 3x2
  const r = E.attemptMove(st, 'R'); // A→(0,1)=B, B→(0,0)=A
  assert.equal(r.moved, false);
  assert.equal(r.blocked, 'swap');
});

test('suivre dans une case libérée est permis', () => {
  const st = E.createState({ name: 't', grid: ['AB.', 'ba.'] }); // 3x2
  const r = E.attemptMove(st, 'D'); // A→(1,0), B→(1,1)
  assert.equal(r.moved, true);
  assert.equal(st.posA, rc(1, 0, 3));
  assert.equal(st.posB, rc(1, 1, 3));
});

test('une luciole immobile bloque l’autre (case occupée)', () => {
  // Mur sous A : A immobile au D ; B juste au-dessus veut prendre sa place.
  const st = E.createState({ name: 't', grid: ['Bab', 'A..', '#..'] }); // 3x3, mur sous A
  const r = E.attemptMove(st, 'D');
  assert.equal(r.moved, false);
  assert.equal(r.blocked, 'B');
  assert.equal(st.posA, rc(1, 0, 3));
  assert.equal(st.posB, rc(0, 0, 3));
});

test('victoire seulement si les DEUX lucioles sont sur leurs portails', () => {
  const st = E.createState(L.levels[0]); // Éveil, par 2
  E.attemptMove(st, 'U');
  assert.equal(st.won, false); // plus qu'un coup
  const r = E.attemptMove(st, 'U');
  assert.equal(r.won, true);
  assert.equal(st.won, true);
  assert.equal(st.moves, 2);
  // plus de mouvement après victoire
  const r2 = E.attemptMove(st, 'D');
  assert.equal(r2.moved, false);
  assert.equal(r2.blocked, 'won');
});

test('annuler restaure la position et le compte', () => {
  const st = E.createState(L.levels[0]);
  E.attemptMove(st, 'U');
  assert.equal(E.undo(st), true);
  assert.equal(st.moves, 0);
  assert.equal(st.posA, rc(3, 1, 5));
  assert.equal(st.posB, rc(3, 3, 5));
  assert.equal(E.undo(st), false); // rien à annuler
});

test('les 13 niveaux : solvables, par = optimal BFS, géométrie saine', () => {
  assert.equal(L.levels.length, 13);
  const seen = new Set();
  for (const lvl of L.levels) {
    assert.ok(!seen.has(lvl.name), 'nom de niveau unique : ' + lvl.name);
    seen.add(lvl.name);
    const st = E.createState(lvl);
    const g = E.parseLevel(lvl);
    assert.notEqual(g.goalA, g.goalB, lvl.name + ' : portails confondus');
    for (const idx of st.walls) void idx; // itérable
    const dist = E.solve(st);
    assert.notEqual(dist, -1, lvl.name + ' : insoluble');
    assert.equal(dist, lvl.par, lvl.name + ' : par (' + lvl.par + ') != optimal (' + dist + ')');
  }
});

test('progression de difficulté non décroissante', () => {
  const pars = L.levels.map((l) => l.par);
  for (let i = 1; i < pars.length; i++) assert.ok(pars[i] >= pars[i - 1], `par ${i} (${pars[i]}) < par ${i - 1} (${pars[i - 1]})`);
});
