/*
 * q07.js — "O que diferencia o 1º caso do 2º caso?" (conceitual)
 * Caso 1: |Δx| ≥ |Δy| → anda em x.  Caso 2: |Δy| > |Δx| → anda em y.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [-1, 8, -1, 8];
  var SHALLOW = ALG.ddaLine({ x: 0, y: 0 }, { x: 6, y: 2 }); // caso 1
  var STEEP = ALG.ddaLine({ x: 0, y: 0 }, { x: 2, y: 6 });   // caso 2

  function raster(plane, r, axisColor) {
    plane.segment(r.p0, r.p1, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
    r.pixels.forEach(function (p) { plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: axisColor, lineWidth: 1.3 }); });
  }

  window.GUI.register({
    id: 7,
    num: "7",
    section: "II) Rasterização de Retas",
    title: "1º caso × 2º caso",
    type: "conceitual",
    hubDesc: "Qual eixo é o independente: caso 1 anda em x; caso 2 anda em y.",
    enunciado:
      "No DDA para rasterização de retas, o que diferencia o 1º caso " +
      "(<code>|Δx| >= |Δy|</code>, eixo independente <code>x</code>) do 2º caso " +
      "(<code>|Δy| > |Δx|</code>, eixo independente <code>y</code>)?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Caso 1 — reta mais horizontal (anda em x)",
              explicacao:
                "<p>Quando <span class='hl'>|Δx| ≥ |Δy|</span>, a reta é \"mais horizontal\". " +
                "<b>x</b> é a variável <b>independente</b> (anda 1 a 1) e <b>y</b> é o calculado.</p>" +
                "<p>Exemplo (0,0)→(6,2): Δx=6, Δy=2 → caso 1.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                raster(plane, SHALLOW, COL.accent);
                plane.text(6.2, 1, "x independente", { color: COL.accent });
              },
            },
            {
              titulo: "Caso 2 — reta mais vertical (anda em y)",
              explicacao:
                "<p>Quando <span class='hl'>|Δy| > |Δx|</span>, a reta é \"mais vertical\". " +
                "<b>y</b> é a variável <b>independente</b> e <b>x</b> é o calculado.</p>" +
                "<p>Exemplo (0,0)→(2,6): Δx=2, Δy=6 → caso 2.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                raster(plane, STEEP, COL.green);
                plane.text(2.3, 6, "y independente", { color: COL.green });
              },
            },
            {
              titulo: "A diferença",
              explicacao:
                "<p>É <b>qual eixo é o dominante (independente)</b>: o que recebe o passo fixo ±1 " +
                "e o que recebe o incremento fracionário / a decisão. O algoritmo é o <b>mesmo</b>, " +
                "apenas com os papéis de <b>x</b> e <b>y</b> trocados.</p>" +
                "<div class='formula'>caso 1: |Δx| ≥ |Δy|  → independente = x\ncaso 2: |Δy| > |Δx|  → independente = y</div>",
            },
          ];
        },
      },
    ],
  });
})();
