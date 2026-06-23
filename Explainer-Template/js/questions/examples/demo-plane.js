/*
 * demo-plane.js — Demonstra a SUPERFÍCIE DE CANVAS (plano cartesiano).
 * Referência mínima para autores: bounds + draw(plane).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var B = [-6, 6, -2, 8];

  function build() {
    var steps = [];
    steps.push({
      title: "Grade e eixos",
      body:
        "<p>A superfície <code>plane</code> (CartesianPlane) desenha grade e eixos sozinha. " +
        "Cada passo declara <code>bounds: [xmin, xmax, ymin, ymax]</code> e um <code>draw(plane)</code>.</p>",
      visual: { type: "plane", bounds: B, draw: function () {} },
    });
    steps.push({
      title: "Pontos rotulados",
      body: "<p><code>plane.point(x, y, {color, label})</code> marca pontos.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          [[-4, 1], [0, 3], [3, 5]].forEach(function (p, i) {
            plane.point(p[0], p[1], { color: COL.accent, label: "P" + i });
          });
        },
      },
    });
    steps.push({
      title: "Segmento e vetor",
      body: "<p><code>plane.segment(p0, p1)</code> e <code>plane.arrow(p0, p1)</code>.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          plane.segment([-4, 1], [3, 5], { color: COL.muted, dashed: true });
          plane.arrow([0, 0], [3, 5], { color: COL.green });
          plane.point(-4, 1, { color: COL.accent });
          plane.point(3, 5, { color: COL.accent });
        },
      },
    });
    steps.push({
      title: "Polígono e célula raster",
      body: "<p><code>plane.polygon(pts)</code>, <code>plane.pixel(x, y)</code> (pixel raster).</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          plane.polygon([[-3, 0], [2, 1], [3, 6], [-2, 4]], {
            stroke: COL.accent,
            fill: COL.accentSoft,
          });
          plane.pixel(0, 7, { fill: COL.greenSoft, stroke: COL.green });
        },
      },
    });
    steps.push({
      title: "Curva amostrada (parábola)",
      body: "<p>Amostrando uma função e ligando os pontos com <code>plane.polyline</code>.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          var pts = [];
          for (var x = -5; x <= 5; x += 0.25) pts.push([x, (x * x) / 3 - 1]);
          plane.polyline(pts, { stroke: COL.yellow, lineWidth: 2.5 });
        },
      },
    });
    return steps;
  }

  EX.registry.add({
    id: "demo-plane",
    num: "▦",
    subject: "Demonstrações das superfícies",
    section: "Canvas",
    title: "Plano cartesiano (canvas)",
    type: "computacional",
    hubDesc: "Pontos, segmentos, vetores, polígonos, raster e curvas.",
    statement:
      "Demonstra a superfície de <strong>canvas</strong> (EX.CartesianPlane). Ideal para geometria, rasterização, gráficos de função e campos vetoriais.",
    parts: [{ label: "Demo", build: build }],
  });
})();
