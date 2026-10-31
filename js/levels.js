/*
 * Reflet — niveaux, ordre de difficulté croissant.
 * Grille : '.' sol, '#' mur, 'A' luciole de lumière, 'B' son reflet,
 *          'a' portail de A, 'b' portail de B.
 * Un ordre horizontal déplace A à l'horizontale et B en miroir (G<->D) ;
 * un ordre vertical déplace les deux dans le même sens.
 * `par` = nombre de coups optimal, prouvé par BFS (tests/engine.test.mjs).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RefletLevels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return {
    series: 'Jeux impossibles',
    levels: [
      { name: 'Éveil', theme: 'Éveil', par: 2, grid: [
        '.....',
        '.a.b.',
        '.....',
        '.A.B.',
        '.....'
      ]},
      { name: 'Miroir', theme: 'Miroir', par: 3, grid: [
        '.....',
        '.ab..',
        '.....',
        'A..B.',
        '.....'
      ]},
      { name: 'La rive', theme: 'La rive', par: 4, grid: [
        '.....',
        'b...a',
        '.....',
        '.BA..',
        '.....'
      ]},
      { name: 'La dérive', theme: 'La dérive', par: 4, grid: [
        '.......',
        '..a..b.',
        '.......',
        '.......',
        '.A..#B.',
        '..#.#..',
        '.......'
      ]},
      { name: 'Le confluent', theme: 'Le confluent', par: 5, grid: [
        '.....',
        '.a.b.',
        '.###.',
        '.....',
        '.A.B.',
        '.....'
      ]},
      { name: 'Le col', theme: 'Le col', par: 5, grid: [
        '.......',
        '.a...b.',
        '##.#.##',
        '.......',
        '.A...B.',
        '##.#.##',
        '.......'
      ]},
      { name: 'Le phare', theme: 'Le phare', par: 7, grid: [
        '.......',
        '...a...',
        '.......',
        '.......',
        '.A...B.',
        '.#.#...',
        '...b...'
      ]},
      { name: 'Le guet', theme: 'Le guet', par: 7, grid: [
        '.....',
        'b..a.',
        '.....',
        '.A...',
        '.B...',
        '.....'
      ]},
      { name: 'La bergerie', theme: 'La bergerie', par: 10, grid: [
        '......',
        '.b..a.',
        '..##..',
        '......',
        '.A.#B.',
        '#....#'
      ]},
      { name: 'La niche', theme: 'La niche', par: 11, grid: [
        '..#..',
        '..b..',
        '..#..',
        '.A.B.',
        '.....',
        '.a..#'
      ]},
      { name: 'La faille', theme: 'La faille', par: 11, grid: [
        '.......',
        '.a...b.',
        '.#.##..',
        '.......',
        '..##.#.',
        '.B...A.',
        '.......'
      ]},
      { name: 'L’envers', theme: 'L’envers', par: 11, grid: [
        '#.....#',
        '.a...b.',
        '..#.#..',
        '...#...',
        '..#.#..',
        '.B..A..',
        '#.....#'
      ]},
      { name: 'Le sillage', theme: 'Le sillage', par: 13, grid: [
        '.......',
        '..a.b..',
        '.#.###.',
        '.......',
        '.###.#.',
        '..B.A..',
        '.......'
      ]}
    ]
  };
});
