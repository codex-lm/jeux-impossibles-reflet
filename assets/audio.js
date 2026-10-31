/*
 * Reflet — mini-synthé WebAudio (aucun asset externe).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.RefletAudio = factory(root);
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var ctx = null, enabled = true;

  function ensure() {
    if (!ctx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when, slideTo) {
    if (!enabled) return;
    try {
      var c = ensure();
      if (!c) return;
      var t = c.currentTime + (when || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* audio indisponible : le jeu reste jouable en silence */ }
  }

  return {
    setEnabled: function (v) { enabled = !!v; },
    isEnabled: function () { return enabled; },
    unlock: function () { ensure(); },
    move: function () { tone(430, 0.09, 'sine', 0.08, 0, 620); },
    blocked: function () { tone(120, 0.12, 'square', 0.05, 0, 80); },
    ui: function () { tone(700, 0.05, 'sine', 0.05); },
    star: function (i) { tone(660 + i * 220, 0.12, 'sine', 0.09); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, 'sine', 0.09, i * 0.09); });
      tone(1568, 0.3, 'sine', 0.05, 0.4);
    }
  };
});
