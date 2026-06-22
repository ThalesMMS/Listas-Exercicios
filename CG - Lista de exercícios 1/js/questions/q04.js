/*
 * q04.js — "Por que multiplicar da última transformação para a primeira?" (conceitual)
 * Convenção coluna v' = M·v: a última aplicada fica mais à esquerda.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var TRI = [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }];
  var T1 = ALG.mTranslate(3, 0), T2 = ALG.mRotateDeg(90);
  var ORDER_A = ALG.applyToPolygon(ALG.matMul(T2, T1), TRI); // T1 e depois T2
  var ORDER_B = ALG.applyToPolygon(ALG.matMul(T1, T2), TRI); // T2 e depois T1
  var BOUNDS = [-5, 8, -3, 6];

  function tri(plane, pts, color, dashed) {
    plane.polygon(pts, { stroke: color, lineWidth: 2, dashed: dashed ? [5, 4] : false });
    pts.forEach(function (p) { plane.point(p.x, p.y, { color: color, radius: 3.5 }); });
  }

  window.GUI.register({
    id: 4,
    num: "4",
    section: "I) Transformações Geométricas",
    title: "Ordem de multiplicação das matrizes",
    type: "conceitual",
    hubDesc: "Com v' = M·v, a última transformação aplicada fica mais à esquerda no produto.",
    enunciado:
      "Ao criar a matriz resultante de várias transformações sequenciais, deve-se multiplicar da última transformação aplicada para a primeira nessa ordem. Justifique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Convenção: ponto-coluna v' = M·v",
              explicacao:
                "<p>Usando o ponto como vetor-<b>coluna</b> <code>[x, y, 1]ᵀ</code>, uma " +
                "transformação é a multiplicação à esquerda: <code>v' = M · v</code>.</p>",
            },
            {
              titulo: "Aplicar em sequência",
              explicacao:
                "<p>Aplicar T1, depois T2, depois T3 ao ponto v:</p>" +
                "<div class='formula'>v' = T3 · ( T2 · ( T1 · v ) ) = ( T3 · T2 · T1 ) · v</div>" +
                "<p>Por <b>associatividade</b>, a matriz composta é <code>M = T3·T2·T1</code> — a " +
                "<b>última</b> aplicada (T3) fica mais à <b>esquerda</b>; a primeira (T1), à direita.</p>",
            },
            {
              titulo: "A ordem importa — não comuta",
              explicacao:
                "<p>Matrizes <b>não comutam</b>: trocar a ordem dá outra transformação. Abaixo, com " +
                "T1 = transladar(3,0) e T2 = girar(90°):</p>" +
                "<div class='coordlist'>" +
                "<span class='coord accent'>T1 depois T2 (T2·T1)</span>" +
                "<span class='coord green'>T2 depois T1 (T1·T2)</span></div>" +
                "<p>Os resultados são <span class='no'>diferentes</span>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                tri(plane, TRI, COL.muted, true);
                tri(plane, ORDER_A, COL.accent, false);
                tri(plane, ORDER_B, COL.green, false);
                plane.point(0, 0, { color: COL.orange, radius: 3 });
              },
            },
          ];
        },
      },
    ],
  });
})();
