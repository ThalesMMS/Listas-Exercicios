/*
 * q09.js — "Qual(is) comando(s) diferenciam o 1º do 2º caso?" (conceitual, DDA)
 * É o cálculo passos = max(|Δx|,|Δy|) e os incrementos Δ/passos.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [-1, 8, -1, 8];
  var C1 = ALG.ddaLine({ x: 0, y: 0 }, { x: 6, y: 2 }); // caso 1
  var C2 = ALG.ddaLine({ x: 0, y: 0 }, { x: 2, y: 6 }); // caso 2

  function raster(plane, r, color, axisLabel, lx, ly) {
    plane.segment(r.p0, r.p1, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
    r.pixels.forEach(function (p) { plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: color, lineWidth: 1.3 }); });
    plane.text(lx, ly, axisLabel, { color: color });
  }

  window.GUI.register({
    id: 9,
    num: "9",
    section: "II) Rasterização de Retas — DDA",
    title: "O comando que diferencia os casos",
    type: "conceitual",
    hubDesc: "passos = max(|Δx|,|Δy|): a comparação decide qual incremento vale ±1.",
    enunciado:
      "No DDA, quais comandos diferenciam o 1º caso do 2º caso? Considere " +
      "<code>passos = max(|Δx|, |Δy|)</code>, <code>xinc = Δx/passos</code> e " +
      "<code>yinc = Δy/passos</code>.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "O comando-chave",
              explicacao:
                "<p>O que diferencia os casos é o cálculo de <b>passos</b> e dos incrementos:</p>" +
                "<div class='formula'>passos = max(|Δx|, |Δy|)\nxinc = Δx / passos\nyinc = Δy / passos</div>" +
                "<p>A <b>comparação |Δx| vs |Δy|</b> (dentro do <code>max</code>) decide qual eixo " +
                "vira o independente. O <b>laço é idêntico</b> nos dois casos.</p>",
            },
            {
              titulo: "Caso 1 — passos = |Δx|",
              explicacao:
                "<p>(0,0)→(6,2): <code>max(6,2)=6</code> → <code>xinc=1</code> (eixo x anda ±1), " +
                "<code>yinc=2/6</code> fracionário.</p>" +
                "<div class='formula'>passos = |Δx| = 6 → xinc = " + C1.xinc.str() + ", yinc = " + C1.yinc.str() + "</div>",
              bounds: BOUNDS,
              draw: function (plane) { raster(plane, C1, COL.accent, "x anda ±1", 6.2, 1); },
            },
            {
              titulo: "Caso 2 — passos = |Δy|",
              explicacao:
                "<p>(0,0)→(2,6): <code>max(2,6)=6</code> → <code>yinc=1</code> (eixo y anda ±1), " +
                "<code>xinc=2/6</code> fracionário.</p>" +
                "<div class='formula'>passos = |Δy| = 6 → xinc = " + C2.xinc.str() + ", yinc = " + C2.yinc.str() + "</div>",
              bounds: BOUNDS,
              draw: function (plane) { raster(plane, C2, COL.green, "y anda ±1", 2.3, 6); },
            },
          ];
        },
      },
    ],
  });
})();
