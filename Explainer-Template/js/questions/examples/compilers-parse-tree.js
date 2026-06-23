/*
 * compilers-parse-tree.js — Árvore de derivação de "2 + 3 * 4".
 *
 * Gramática (com precedência de * sobre +):
 *   E -> E + T | T
 *   T -> T * F | F
 *   F -> num
 *
 * Derivação mais à esquerda:
 *   E => E + T => T + T => F + T => num(2) + T
 *     => num(2) + T * F => num(2) + F * F => num(2) + num(3) * num(4)
 *
 * A árvore é montada com EX.Diagram.tree (nós em caixa) e revelada do topo
 * para a base usando opts.shown.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Árvore completa. id único por nó; label = símbolo da gramática.
  // Estrutura: E( E(T(F(num:2)))  +  T( T(F(num:3))  *  F(num:4) ) )
  var ROOT = {
    id: "E0", label: "E",
    children: [
      {
        id: "E1", label: "E",
        children: [
          { id: "T1", label: "T", children: [
            { id: "F1", label: "F", children: [
              { id: "n2", label: "num:2" },
            ] },
          ] },
        ],
      },
      { id: "plus", label: "+" },
      {
        id: "T0", label: "T",
        children: [
          { id: "T2", label: "T", children: [
            { id: "F2", label: "F", children: [
              { id: "n3", label: "num:3" },
            ] },
          ] },
          { id: "mul", label: "*" },
          { id: "F3", label: "F", children: [
            { id: "n4", label: "num:4" },
          ] },
        ],
      },
    ],
  };

  // Conjuntos de ids revelados em cada passo (do topo p/ a base).
  var REVEAL = [
    { ids: ["E0"], title: "Raiz: E",
      body: "<p>Toda a expressão é uma <code>E</code>. Aplicamos as produções de cima para baixo.</p>" },
    { ids: ["E0", "E1", "plus", "T0"], title: "E -> E + T",
      body: "<p>Como a soma tem menor precedência, ela fica no topo: " +
            "<code>E -> E + T</code>. A subárvore <code>E</code> à esquerda dará o <code>2</code>; " +
            "a <code>T</code> à direita dará <code>3 * 4</code>.</p>" },
    { ids: ["E0", "E1", "plus", "T0", "T1", "T2", "mul", "F3"], title: "Expande as duas T",
      body: "<p>À esquerda, <code>E -> T</code> (só um termo). À direita, " +
            "<code>T -> T * F</code>: o <code>*</code> agrupa <code>3</code> e <code>4</code> " +
            "<b>antes</b> da soma — é assim que a precedência aparece na árvore.</p>" },
    { ids: ["E0", "E1", "plus", "T0", "T1", "T2", "mul", "F3", "F1", "F2"], title: "Desce até os fatores F",
      body: "<p><code>T -> F</code> nos três ramos, isolando cada fator atômico.</p>" },
    { ids: null, title: "Folhas: num",
      body: "<p><code>F -> num</code> em cada folha: <code>2</code>, <code>3</code> e <code>4</code>. " +
            "Lendo as folhas da esquerda p/ a direita recuperamos <code>2 + 3 * 4</code>, " +
            "e a estrutura calcula <span class='ok'>3*4 = 12</span> antes de somar <span class='ok'>2 + 12 = 14</span>.</p>" },
  ];

  function build() {
    return REVEAL.map(function (r) {
      return {
        title: r.title,
        body: r.body,
        visual: {
          type: "svg",
          draw: function (svg) {
            EX.Diagram.tree(svg, ROOT, {
              nodeShape: "box",
              shown: r.ids,        // null => todos
              view: [620, 560],
            });
          },
        },
      };
    });
  }

  EX.registry.add({
    id: "compilers-parse-tree",
    num: "⊢",
    subject: "Compiladores",
    section: "Análise Sintática",
    title: "Árvore de derivação de 2 + 3 * 4",
    type: "computacional",
    tags: ["gramática", "parsing", "precedência"],
    hubDesc: "Como a precedência de * sobre + aparece na árvore sintática.",
    statement:
      "Pela gramática <code>E->E+T|T</code>, <code>T->T*F|F</code>, <code>F->num</code>, " +
      "construa a árvore de derivação de <code>2 + 3 * 4</code>.",
    parts: [{ label: "Construção", build: build }],
  });
})();
