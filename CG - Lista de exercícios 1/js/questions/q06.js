/*
 * q06.js — "O número de iterações é definido pelo maior valor de delta. Explique." (conceitual)
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var A = { x: 0, y: 0 }, Bp = { x: 2, y: 6 }, BOUNDS = [-2, 5, -2, 8];
  var GAPPY = [[0, 0], [1, 3], [2, 6]];               // iterando pelo MENOR Δ (Δx=2)
  var FULL = ALG.ddaLine(A, Bp).pixels;               // iterando pelo MAIOR Δ (Δy=6)

  function ideal(plane) {
    plane.segment(A, Bp, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
    plane.point(A.x, A.y, { color: COL.accent, radius: 4 });
    plane.point(Bp.x, Bp.y, { color: COL.green, radius: 4, label: "(2, 6)", labelColor: COL.green });
  }
  function raster(plane, pts, color) {
    pts.forEach(function (p) { plane.pixel(p[0], p[1], { fill: "rgba(120,140,170,0.10)", stroke: color, lineWidth: 1.4 }); });
    ideal(plane);
  }

  window.GUI.register({
    id: 6,
    num: "6",
    section: "II) Rasterização de Retas",
    title: "Número de iterações = maior delta",
    type: "conceitual",
    hubDesc: "O maior Δ faz o eixo dominante andar 1 pixel/passo → reta contígua, sem buracos.",
    enunciado: "O número de iterações é definido pelo maior valor de delta. Explique o porquê.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "A ideia",
              explicacao:
                "<p>Numa reta, <code>Δx</code> e <code>Δy</code> em geral diferem. Para a reta " +
                "ficar <b>contígua</b> (sem buracos), o eixo que <b>varia mais rápido</b> precisa " +
                "andar <b>1 pixel por passo</b>.</p>" +
                "<div class='formula'>n = max(|Δx|, |Δy|)</div>" +
                "<p>Exemplo: A(0,0) → (2,6), com <code>Δx = 2</code> e <code>Δy = 6</code>.</p>",
              bounds: BOUNDS,
              draw: function (plane) { ideal(plane); },
            },
            {
              titulo: "Iterar pelo MENOR delta → buracos",
              explicacao:
                "<p>Se usássemos <code>n = Δx = 2</code> (o menor), a cada passo x anda 1 mas " +
                "<b>y salta 3</b>. Resultado: pixels <span class='no'>esparsos</span>, com buracos.</p>" +
                "<div class='coordlist'>" + GAPPY.map(function (p) { return "<span class='coord'>(" + p[0] + ", " + p[1] + ")</span>"; }).join("") + "</div>",
              bounds: BOUNDS,
              draw: function (plane) { raster(plane, GAPPY, COL.red); },
            },
            {
              titulo: "Iterar pelo MAIOR delta → contíguo",
              explicacao:
                "<p>Com <code>n = Δy = 6</code> (o maior), o eixo dominante (y) anda <b>1 a 1</b> " +
                "(±1) e x recebe um incremento <b>≤ 1</b>. A reta fica <span class='ok'>contígua</span> " +
                "(8-conexa), sem falhas nem sobreposições.</p>" +
                "<p>Por isso <b>n = max(|Δx|, |Δy|)</b>.</p>",
              bounds: BOUNDS,
              draw: function (plane) { raster(plane, FULL, COL.green); },
            },
          ];
        },
      },
    ],
  });
})();
