/*
 * Reflet — contrôleur d'interface (écrans, plateau, entrées clavier/tactile).
 */
(function () {
  'use strict';
  var E = window.RefletEngine, LV = window.RefletLevels.levels, I18N = window.RefletI18n, AU = window.RefletAudio;

  var SAVE_KEY = 'reflet.save.v1';
  var save = { unlocked: 1, stars: {}, best: {}, lang: 'en', sound: true };
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      save = { unlocked: parsed.unlocked || 1, stars: parsed.stars || {},
               best: parsed.best || {}, lang: parsed.lang || 'en', sound: parsed.sound !== false };
    }
  } catch (e) { /* stockage indisponible : partie sans sauvegarde */ }

  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
  function t(key) { return I18N.get(save.lang, key); }

  var state = null;        // état moteur du niveau courant
  var levelIndex = 0;
  var busy = false;        // évite les entrées pendant l'animation de victoire

  // ---------------------------------------------------------------- utilitaires
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function show(node, on) { node.classList.toggle('hidden', !on); }

  function starsFor(moves, par) {
    if (moves <= par) return 3;
    if (moves <= par + 3) return 2;
    return 1;
  }

  // ---------------------------------------------------------------- i18n rendu
  function renderTexts() {
    document.documentElement.lang = save.lang;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    $('tagline').textContent = t('tagline');
    $('btn-play').textContent = save.unlocked > 1 && LV.length ? t('continueGame') : t('play');
    $('btn-howto').textContent = t('howTo');
    $('btn-sound').textContent = save.sound ? '♪ ' + t('soundOn') : '✕ ' + t('soundOff');
    $('btn-sound').setAttribute('aria-label', t('soundOn'));
    $('btn-menu').textContent = t('menu');
    $('btn-undo').textContent = '⟲ ' + t('undo');
    $('btn-restart').textContent = t('restart');
    $('btn-rules-game').textContent = '?';
    $('btn-rules-game').setAttribute('aria-label', t('howTo'));
    $('goal-hint').textContent = t('goalHint');
    renderLangPills();
    renderLevelGrid();
    if (state) renderHud();
  }

  function renderLangPills() {
    var box = $('langs');
    box.textContent = '';
    I18N.langs.forEach(function (code) {
      var b = el('button', 'pill' + (save.lang === code ? ' active' : ''), code.toUpperCase());
      b.addEventListener('click', function () {
        save.lang = code; persist(); AU.ui(); renderTexts();
      });
      box.appendChild(b);
    });
  }

  // ---------------------------------------------------------------- écran niveaux
  function renderLevelGrid() {
    var grid = $('levelgrid');
    grid.textContent = '';
    LV.forEach(function (lvl, i) {
      var locked = i + 1 > save.unlocked;
      var chip = el('button', 'chip' + (locked ? ' locked' : ''));
      chip.textContent = locked ? '🔒' : String(i + 1);
      if (!locked) {
        var stars = save.stars[i] || 0;
        var row = el('span', 'chip-stars', '★'.repeat(stars) || '');
        chip.appendChild(row);
        chip.addEventListener('click', function () { AU.ui(); openLevel(i); });
      }
      grid.appendChild(chip);
    });
  }

  // ---------------------------------------------------------------- plateau
  function cellSize() {
    var w = state.w, h = state.h;
    var availW = Math.min(window.innerWidth - 28, 560);
    var availH = window.innerHeight - 340;
    var s = Math.floor(Math.min(availW / w, availH / h, 64));
    return Math.max(30, s);
  }

  function buildBoard() {
    var board = $('board');
    board.textContent = '';
    var s = cellSize(), w = state.w, h = state.h;
    board.style.width = w * s + 'px';
    board.style.height = h * s + 'px';

    for (var r = 0; r < h; r++) {
      for (var c = 0; c < w; c++) {
        var cell = el('div', 'cell');
        cell.style.left = c * s + 'px';
        cell.style.top = r * s + 'px';
        cell.style.width = s + 'px';
        cell.style.height = s + 'px';
        if ((r + c) % 2 === 0) cell.classList.add('alt');
        var idx = r * w + c;
        if (state.walls[idx]) cell.classList.add('wall');
        else if (idx === state.goalA) cell.classList.add('goal-a');
        else if (idx === state.goalB) cell.classList.add('goal-b');
        board.appendChild(cell);
      }
    }
    ['a', 'b'].forEach(function (which) {
      var fly = el('div', 'fly ' + which);
      fly.style.width = s + 'px';
      fly.style.height = s + 'px';
      board.appendChild(fly);
    });
    placeFlies(true);
  }

  window.addEventListener('resize', function () {
    if (state && !busy) buildBoard();
  });

  function placeFlies(instant) {
    var s = cellSize();
    var board = $('board');
    var flies = board.querySelectorAll('.fly');
    if (flies.length < 2) return;
    if (instant) {
      flies[0].style.transition = 'none';
      flies[1].style.transition = 'none';
    }
    flies[0].style.transform = 'translate(' + (state.posA % state.w) * s + 'px,' + Math.floor(state.posA / state.w) * s + 'px)';
    flies[1].style.transform = 'translate(' + (state.posB % state.w) * s + 'px,' + Math.floor(state.posB / state.w) * s + 'px)';
    if (instant) {
      void board.offsetWidth; // reflow avant de réactiver les transitions
      flies[0].style.transition = '';
      flies[1].style.transition = '';
    }
  }

  // ---------------------------------------------------------------- HUD
  function renderHud() {
    var lvl = LV[levelIndex];
    $('hud-level').textContent = t('level') + ' ' + (levelIndex + 1) + ' — ' + lvl.name;
    $('hud-moves').textContent = state.moves + ' ' + t(state.moves === 1 ? 'movesOne' : 'moves') + ' · ' + t('par') + ' ' + lvl.par;
  }

  function openLevel(i) {
    levelIndex = i;
    state = E.createState(LV[i]);
    busy = false;
    show($('home'), false);
    show($('game'), true);
    renderHud();
    buildBoard();
  }

  function goMenu() {
    state = null; busy = false;
    show($('game'), false);
    show($('home'), true);
    renderTexts();
  }

  // ---------------------------------------------------------------- interactions
  function doMove(dir) {
    if (!state || busy) return;
    var r = E.attemptMove(state, dir);
    if (!r.moved) {
      AU.blocked();
      var board = $('board');
      board.classList.remove('shake');
      void board.offsetWidth;
      board.classList.add('shake');
      return;
    }
    AU.move();
    placeFlies(false);
    renderHud();
    if (r.won) {
      busy = true;
      var stars = starsFor(state.moves, LV[levelIndex].par);
      save.stars[levelIndex] = Math.max(save.stars[levelIndex] || 0, stars);
      save.best[levelIndex] = Math.min(save.best[levelIndex] || Infinity, state.moves);
      if (levelIndex + 2 > save.unlocked) save.unlocked = Math.min(LV.length, levelIndex + 2);
      persist();
      $('board').querySelectorAll('.fly').forEach(function (f) { f.classList.add('home'); });
      setTimeout(function () { AU.win(); showWin(stars); }, 480);
    }
  }

  function doUndo() {
    if (!state || busy) return;
    if (E.undo(state)) { AU.ui(); placeFlies(false); renderHud(); }
  }

  function doRestart() {
    if (!state || busy) return;
    AU.ui();
    openLevel(levelIndex);
  }

  // ---------------------------------------------------------------- superpositions
  function overlay(content) {
    var card = $('overlay-card');
    card.textContent = '';
    card.appendChild(content);
    show($('overlay'), true);
  }
  function closeOverlay() { show($('overlay'), false); }

  function showRules() {
    var box = el('div', 'rules');
    box.appendChild(el('h2', null, t('rulesTitle')));
    [1, 2, 3, 4].forEach(function (n) {
      box.appendChild(el('p', null, t('rule' + n)));
    });
    var demo = el('div', 'rules-demo');
    demo.appendChild(el('span', 'demo-note', 'you →'));
    demo.appendChild(el('span', 'demo-fly a', '●'));
    demo.appendChild(el('span', 'demo-note', '·'));
    demo.appendChild(el('span', 'demo-fly b', '●'));
    demo.appendChild(el('span', 'demo-note', '← twin'));
    box.appendChild(demo);
    var btn = el('button', 'primary', t('gotIt'));
    btn.addEventListener('click', function () { AU.ui(); closeOverlay(); });
    box.appendChild(btn);
    overlay(box);
  }

  function showWin(stars) {
    for (var i = 0; i < stars; i++) setTimeout(AU.star.bind(null, i), 250 + i * 180);
    var box = el('div', 'modal');
    var isLast = levelIndex === LV.length - 1;
    if (isLast) {
      var total = 0;
      LV.forEach(function (_, i) { total += save.best[i] || 0; });
      box.appendChild(el('h2', null, t('finalTitle')));
      box.appendChild(el('p', null, t('finalBody')));
      box.appendChild(el('p', 'big', t('total') + ' : ' + total));
      var again = el('button', 'primary', t('replayAll'));
      again.addEventListener('click', function () {
        AU.ui(); closeOverlay();
        save.unlocked = 1; save.stars = {}; save.best = {}; persist();
        openLevel(0);
      });
      box.appendChild(again);
    } else {
      box.appendChild(el('h2', null, t('wonTitle')));
      var row = el('div', 'star-row');
      for (var s = 0; s < 3; s++) row.appendChild(el('span', 'star' + (s < stars ? ' on' : ''), '★'));
      box.appendChild(row);
      box.appendChild(el('p', null, state.moves + ' ' + t(state.moves === 1 ? 'movesOne' : 'moves') + ' · ' + t('par') + ' ' + LV[levelIndex].par));
      var next = el('button', 'primary', t('next'));
      next.addEventListener('click', function () { AU.ui(); closeOverlay(); openLevel(levelIndex + 1); });
      box.appendChild(next);
    }
    var replay = el('button', null, t('replay'));
    replay.addEventListener('click', function () { AU.ui(); closeOverlay(); openLevel(levelIndex); });
    var menu = el('button', null, t('menu'));
    menu.addEventListener('click', function () { AU.ui(); closeOverlay(); goMenu(); });
    var row2 = el('div', 'btn-row');
    row2.appendChild(replay); row2.appendChild(menu);
    box.appendChild(row2);
    overlay(box);
  }

  // ---------------------------------------------------------------- entrées
  var KEYMAP = {
    ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R',
    w: 'U', s: 'D', a: 'L', d: 'R',          // WASD
    z: 'U', q: 'L'                            // ZQSD (clavier FR)
  };
  document.addEventListener('keydown', function (ev) {
    if (!state) return;
    var k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (KEYMAP[k]) { ev.preventDefault(); doMove(KEYMAP[k]); AU.unlock(); return; }
    if (k === 'u') { ev.preventDefault(); doUndo(); }
    if (k === 'r') { ev.preventDefault(); doRestart(); }
    if (k === 'Escape') { closeOverlay(); }
  });

  // glisser tactile sur le plateau
  var touchStart = null;
  $('board').addEventListener('touchstart', function (ev) {
    if (ev.touches.length === 1) {
      touchStart = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      AU.unlock();
    }
  }, { passive: true });
  $('board').addEventListener('touchend', function (ev) {
    if (!touchStart) return;
    var dx = ev.changedTouches[0].clientX - touchStart.x;
    var dy = ev.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'R' : 'L');
    else doMove(dy > 0 ? 'D' : 'U');
  }, { passive: true });

  $('board').addEventListener('pointerdown', function () { AU.unlock(); });

  // croix directionnelle
  [['dpad-u', 'U'], ['dpad-d', 'D'], ['dpad-l', 'L'], ['dpad-r', 'R']].forEach(function (pair) {
    $(pair[0]).addEventListener('click', function () { AU.unlock(); doMove(pair[1]); });
  });

  // afficher la croix sur écran tactile
  window.addEventListener('touchstart', function () {
    document.body.classList.add('touch');
  }, { once: true, passive: true });
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    document.body.classList.add('touch');
  }

  // ---------------------------------------------------------------- boutons
  $('btn-play').addEventListener('click', function () {
    AU.ui(); AU.unlock();
    var next = Math.min(save.unlocked, LV.length) - 1;
    openLevel(next);
  });
  $('btn-howto').addEventListener('click', function () { AU.ui(); showRules(); });
  $('btn-rules-game').addEventListener('click', function () { AU.ui(); showRules(); });
  $('btn-sound').addEventListener('click', function () {
    save.sound = !save.sound; persist();
    AU.setEnabled(save.sound);
    renderTexts();
    if (save.sound) AU.ui();
  });
  $('btn-menu').addEventListener('click', function () { AU.ui(); goMenu(); });
  $('btn-undo').addEventListener('click', function () { AU.unlock(); doUndo(); });
  $('btn-restart').addEventListener('click', function () { AU.unlock(); doRestart(); });
  $('overlay').addEventListener('click', function (ev) {
    if (ev.target === $('overlay')) closeOverlay();
  });

  // ---------------------------------------------------------------- démarrage
  AU.setEnabled(save.sound);
  renderTexts();
  show($('home'), true);
})();
