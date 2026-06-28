/*
 * _helpers.js — Utilitários compartilhados pelos guias de Compiladores
 * (window.EX.GuiaC). Complementa o kit.js (EX.Compilers.*) com:
 *   grammar(lines)   -> bloco de produções (pre.formula).
 *   gstep(t,b,lines) -> passo DOM mostrando uma gramática.
 *   COOL             -> hierarquia de classes padrão das listas (p/ classTree).
 *
 * IIFE + namespace global, sem build (file://). Carrega depois de kit.js.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var C = (EX.Compilers = EX.Compilers || {});
  EX.GuiaC = EX.GuiaC || {};

  // Renderiza um bloco de produções de gramática.
  EX.GuiaC.grammar = function (lines) {
    return C.codeHtml([].concat(lines).join("\n"));
  };
  // Passo DOM com uma gramática (título, corpo, produções).
  EX.GuiaC.gstep = function (title, body, lines) {
    return C.domStep(title, body, EX.GuiaC.grammar(lines));
  };

  // Hierarquia de classes COOL usada nas questões de semântica.
  // Object → Bool/Point/Line/Shape ; Shape → Quad/Circle ; Quad → Rect → Square.
  EX.GuiaC.COOL = {
    w: 760,
    h: 480,
    nodes: {
      Object: { x: 360, y: 42 },
      Bool: { x: 110, y: 140 },
      Point: { x: 245, y: 140 },
      Line: { x: 380, y: 140 },
      Shape: { x: 560, y: 140 },
      Quad: { x: 490, y: 250 },
      Circle: { x: 645, y: 250 },
      Rect: { x: 490, y: 345 },
      Square: { x: 490, y: 440 },
    },
    edges: [
      ["Object", "Bool"], ["Object", "Point"], ["Object", "Line"], ["Object", "Shape"],
      ["Shape", "Quad"], ["Shape", "Circle"], ["Quad", "Rect"], ["Rect", "Square"],
    ],
  };
  // Atalho: desenha a hierarquia COOL com `active` realçado.
  EX.GuiaC.coolTree = function (active) {
    return {
      type: "svg",
      draw: function (svg) {
        C.classTree(svg, {
          w: EX.GuiaC.COOL.w, h: EX.GuiaC.COOL.h,
          nodes: EX.GuiaC.COOL.nodes, edges: EX.GuiaC.COOL.edges,
          active: active || [],
        });
      },
    };
  };
})();
