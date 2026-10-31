/* Solveur de contrôle : solvabilité BFS + solution optimale affichée. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('../js/engine.js');
const L = require('../js/levels.js');

for (const lvl of L.levels) {
  const st = E.createState(lvl);
  // BFS avec parents pour restitution d'une solution optimale
  const key = (s) => s.posA * st.w * st.h + s.posB;
  const start = key(st), target = st.goalA * st.w * st.h + st.goalB;
  const prev = new Map([[start, null]]);
  const q = [start];
  let head = 0, found = start === target;
  while (head < q.length && !found) {
    const cur = q[head++];
    for (const dir of ['U', 'D', 'L', 'R']) {
      const probe = { w: st.w, h: st.h, walls: st.walls,
        posA: Math.floor(cur / (st.w * st.h)), posB: cur % (st.w * st.h),
        goalA: st.goalA, goalB: st.goalB, moves: 0, won: false, history: [] };
      const r = E.attemptMove(probe, dir);
      if (!r.moved) continue;
      const k = probe.posA * st.w * st.h + probe.posB;
      if (prev.has(k)) continue;
      prev.set(k, [cur, dir]);
      if (k === target) { found = true; break; }
      q.push(k);
    }
  }
  if (!prev.has(target)) {
    console.log(`${lvl.name.padEnd(18)} INSOLUBLE (par stocké: ${lvl.par})`);
    continue;
  }
  let path = '', cur = target;
  while (prev.get(cur)) { const [p, d] = prev.get(cur); path = d + path; cur = p; }
  const optimal = path.length;
  const tag = lvl.par === null ? '' : (lvl.par === optimal ? ' par=OK' : ` PAR!=${lvl.par}`);
  console.log(`${lvl.name.padEnd(18)} optimal=${String(optimal).padStart(2)}${tag}  solution: ${path}`);
}
