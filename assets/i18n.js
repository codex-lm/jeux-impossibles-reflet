/*
 * Reflet — interface multilingue (EN par défaut, FR, ES).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RefletI18n = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var dict = {
    en: {
      tagline: "A mirror puzzle of twin lights",
      subtitle: "One command drives two fireflies. The amber one obeys you; her teal twin plays it in mirror — when you step right, she steps left.",
      play: "Play",
      continueGame: "Continue",
      howTo: "How to play",
      rulesTitle: "How to play",
      rule1: "Every move drives both fireflies at once. The amber one follows your command; the teal one moves the opposite way horizontally — your left is her right, and vice versa. Up and down move both in the same direction.",
      rule2: "Walls stop each firefly separately. One can be blocked while her twin slips away — that is how you break the mirror.",
      rule3: "The sisters cannot swap places. If they would swap or land on the same cell, neither moves.",
      rule4: "Guide each firefly to her own portal — amber to amber, teal to teal. Both must be home after the same move. Beat par for three stars; finish within par + 3 for two.",
      goalHint: "Amber → amber portal · Teal → teal portal",
      moves: "moves",
      movesOne: "move",
      par: "par",
      level: "Level",
      undo: "Undo",
      restart: "Restart",
      menu: "Menu",
      next: "Next level",
      replay: "Replay",
      wonTitle: "Both lights are home!",
      finalTitle: "The night is lit",
      finalBody: "You guided every pair of twin lights back to their portals.",
      total: "Total moves",
      replayAll: "Start over",
      keysHint: "Arrows · WASD · ZQSD — U: undo · R: restart",
      touchHint: "Swipe on the board, or use the pad below",
      langLabel: "Language",
      soundOn: "Sound on",
      soundOff: "Sound off",
      close: "Close",
      credit: "A game by Cédric Bernadac, created with AI agents.",
      gotIt: "Got it"
    },
    fr: {
      tagline: "Un puzzle miroir de lumières jumelles",
      subtitle: "Une seule commande déplace deux lucioles. L'ambre vous obéit ; sa jumelle turquoise joue en miroir — votre droite est sa gauche.",
      play: "Jouer",
      continueGame: "Continuer",
      howTo: "Comment jouer",
      rulesTitle: "Comment jouer",
      rule1: "Chaque déplacement mène les deux lucioles à la fois. L'ambre suit votre ordre ; la turquoise suit son miroir — votre droite est sa gauche. Haut et bas sont partagés.",
      rule2: "Les murs arrêtent chaque luciole séparément. L'une peut être bloquée pendant que sa jumelle glisse — c'est ainsi qu'on brise le miroir.",
      rule3: "Les sœurs ne peuvent pas échanger leurs places. Si elles risquent de se croiser ou d'atterrir sur la même case, aucune ne bouge.",
      rule4: "Menez chaque luciole vers son propre portail — l'ambre vers l'ambre, la turquoise vers la turquoise. Les deux doivent être rentrées après le même coup. Battez le par pour trois étoiles ; finissez à par + 3 ou moins pour deux.",
      goalHint: "Ambre → portail ambre · Turquoise → portail turquoise",
      moves: "coups",
      movesOne: "coup",
      par: "par",
      level: "Niveau",
      undo: "Annuler",
      restart: "Recommencer",
      menu: "Menu",
      next: "Niveau suivant",
      replay: "Rejouer",
      wonTitle: "Les deux lumières sont rentrées !",
      finalTitle: "La nuit est illuminée",
      finalBody: "Vous avez ramené chaque paire de lumières jumelles vers ses portails.",
      total: "Total de coups",
      replayAll: "Tout recommencer",
      keysHint: "Flèches · WASD · ZQSD — U : annuler · R : recommencer",
      touchHint: "Glissez sur le plateau, ou utilisez les flèches ci-dessous",
      langLabel: "Langue",
      soundOn: "Son activé",
      soundOff: "Son coupé",
      close: "Fermer",
      credit: "Un jeu de Cédric Bernadac, créé avec des agents IA.",
      gotIt: "Compris"
    },
    es: {
      tagline: "Un puzle de espejos con luces gemelas",
      subtitle: "Una sola orden mueve dos luciérnagas. La ámbar te obedece; su gemela turquesa juega en espejo — tu derecha es su izquierda.",
      play: "Jugar",
      continueGame: "Continuar",
      howTo: "Cómo jugar",
      rulesTitle: "Cómo jugar",
      rule1: "Cada movimiento guía a las dos luciérnagas a la vez. La ámbar sigue tu orden; la turquesa sigue su espejo — tu derecha es su izquierda. Arriba y abajo se comparten.",
      rule2: "Los muros detienen a cada luciérnaga por separado. Una puede quedar bloqueada mientras su gemela se desliza — así se rompe el espejo.",
      rule3: "Las hermanas no pueden intercambiar sus casillas. Si fueran a cruzarse o a caer en la misma casilla, ninguna se mueve.",
      rule4: "Guía a cada luciérnaga hasta su propio portal — la ámbar al ámbar, la turquesa al turquesa. Las dos deben llegar tras el mismo movimiento. Supera el par para tres estrellas; termina en par + 3 o menos para dos.",
      goalHint: "Ámbar → portal ámbar · Turquesa → portal turquesa",
      moves: "movimientos",
      movesOne: "movimiento",
      par: "par",
      level: "Nivel",
      undo: "Deshacer",
      restart: "Reiniciar",
      menu: "Menú",
      next: "Nivel siguiente",
      replay: "Repetir",
      wonTitle: "¡Las dos luces están en casa!",
      finalTitle: "La noche está iluminada",
      finalBody: "Has llevado a cada pareja de luces gemelas hasta sus portales.",
      total: "Total de movimientos",
      replayAll: "Empezar de nuevo",
      keysHint: "Flechas · WASD · ZQSD — U: deshacer · R: reiniciar",
      touchHint: "Desliza sobre el tablero o usa la cruceta",
      langLabel: "Idioma",
      soundOn: "Sonido activado",
      soundOff: "Sonido silenciado",
      close: "Cerrar",
      credit: "Un juego de Cédric Bernadac, creado con agentes de IA.",
      gotIt: "Entendido"
    }
  };
  return {
    langs: ['en', 'fr', 'es'],
    dict: dict,
    get: function (lang, key) {
      var d = dict[lang] || dict.en;
      return d[key] !== undefined ? d[key] : dict.en[key];
    }
  };
});
