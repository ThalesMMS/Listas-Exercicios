/*
 * q01.js — "Qual é a vantagem de usar coordenadas homogêneas?" (conceitual)
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var TRI = [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 2, y: 4 }];
  var TR = ALG.applyToPolygon(ALG.mTranslate(3, 2), TRI);
  var BOUNDS = [-1, 9, -1, 8];

  function tri(plane, pts, color, dashed) {
    plane.polygon(pts, { stroke: color, lineWidth: 2, dashed: dashed ? [5, 4] : false });
    pts.forEach(function (p) { plane.point(p.x, p.y, { color: color, radius: 3.5 }); });
  }

  window.GUI.register({
    id: 1,
    num: "1",
    section: "I) Transformações Geométricas",
    title: "Vantagem das coordenadas homogêneas",
    type: "conceitual",
    hubDesc: "Translação vira multiplicação de matriz; tudo se unifica e se compõe num único produto.",
    enunciado: "Qual é a vantagem de usar coordenadas homogêneas?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "O problema: translação não é linear",
              explicacao:
                "<p>Rotação e escala são <b>lineares</b> (matriz 2×2). Mas a <b>translação</b> " +
                "<code>(x, y) → (x + tx, y + ty)</code> <span class='no'>não</span> se escreve como " +
                "<code>2×2 · [x, y]ᵀ</code> — ela é uma <b>soma</b>, não um produto.</p>" +
                "<p>Isso quebra a uniformidade: parte é multiplicação, parte é soma.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                tri(plane, TRI, COL.muted, true);
                tri(plane, TR, COL.accent, false);
                plane.segment(TRI[0], TR[0], { color: COL.yellow, dashed: [4, 4], lineWidth: 1.5 });
                plane.text(5, 3, "+ (3, 2)", { color: COL.yellow });
              },
            },
            {
              titulo: "A solução: coordenada w = 1",
              explicacao:
                "<p>Adiciona-se uma 3ª coordenada: <code>(x, y) → (x, y, 1)</code>. Agora a " +
                "translação <b>vira multiplicação</b> de matriz 3×3:</p>" +
                "<div class='formula'>[ 1  0  tx ]   [ x ]   [ x + tx ]\n[ 0  1  ty ] · [ y ] = [ y + ty ]\n[ 0  0   1 ]   [ 1 ]   [   1    ]</div>",
            },
            {
              titulo: "Vantagem 1 — uniformidade",
              explicacao:
                "<p>Translação, rotação, escala e cisalhamento passam a ter a <b>mesma forma</b> " +
                "(matriz 3×3) e o <b>mesmo</b> tipo de operação (multiplicação):</p>" +
                "<div class='formula'>T = [1 0 tx; 0 1 ty; 0 0 1]\nR = [c −s 0; s c 0; 0 0 1]\nS = [sx 0 0; 0 sy 0; 0 0 1]</div>",
            },
            {
              titulo: "Vantagem 2 — composição",
              explicacao:
                "<p>Uma <b>sequência</b> de transformações vira um <b>único produto de matrizes</b>, " +
                "aplicado de uma só vez a todos os vértices.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>Eficiência: 1 matriz por vértice, não N operações.</div>" +
                "<div class='pro'>Permite transformações em torno de um ponto fixo (compor com translações).</div>" +
                "<div class='pro'>Base para projeções/perspectiva (w ≠ 1).</div>" +
                "</div>",
            },
          ];
        },
      },
    ],
  });
})();
