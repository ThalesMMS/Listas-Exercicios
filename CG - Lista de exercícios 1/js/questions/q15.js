/*
 * q15.js — "Aplique o algoritmo de Bresenham para os seguintes segmentos." (computacional)
 * 5 partes (a–e). Por iteração: tabela (i | (x,y) | p) + rasterização acumulada.
 * Usa ALG.bresenhamLine (inteiro; empate p≥0 → diagonal).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;

  function tableHtml(r, upto) {
    var head = "<tr><th>i</th><th>(x, y)</th><th>p</th></tr>";
    var body = "";
    for (var i = 0; i <= upto; i++) {
      var row = r.rows[i];
      body += "<tr class='" + (i === upto ? "active" : "") + "'><td>" + row.i + "</td><td>(" +
        row.x + ", " + row.y + ")</td><td>" + row.p + "</td></tr>";
    }
    return "<table class='q-table'>" + head + body + "</table>";
  }

  function makePart(label, an, a, bn, b) {
    return {
      label: label,
      build: function () {
        var r = ALG.bresenhamLine(a, b);
        var caso1 = r.caso === 1;
        var xs = [a.x, b.x], ys = [a.y, b.y];
        var B = [Math.min.apply(null, xs) - 2, Math.max.apply(null, xs) + 2,
                 Math.min.apply(null, ys) - 2, Math.max.apply(null, ys) + 2];
        var caseTxt = caso1 ? "Δx ≥ Δy → caso 1 (anda em x)" : "Δy > Δx → caso 2 / steep (anda em y)";

        function ideal(plane) {
          plane.segment(a, b, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
          plane.point(a.x, a.y, { color: COL.accent, radius: 5, label: an + "(" + a.x + "," + a.y + ")", labelColor: COL.accent });
          plane.point(b.x, b.y, { color: COL.green, radius: 5, label: bn + "(" + b.x + "," + b.y + ")", labelColor: COL.green });
        }
        function raster(plane, upto) {
          for (var i = 0; i <= upto; i++) {
            var px = r.pixels[i], cur = i === upto;
            plane.pixel(px[0], px[1], {
              fill: cur ? "rgba(255,209,102,0.30)" : COL.accentSoft,
              stroke: cur ? COL.yellow : COL.accent, lineWidth: cur ? 2 : 1.2,
            });
          }
          ideal(plane);
        }

        var steps = [];
        steps.push({
          titulo: "Configuração",
          explicacao:
            "<p>Segmento <b>" + an + "(" + a.x + ", " + a.y + ")</b> → <b>" + bn + "(" + b.x + ", " + b.y + ")</b>.</p>" +
            "<div class='formula'>Δx = |" + (b.x - a.x) + "| = " + r.dx + "    Δy = |" + (b.y - a.y) + "| = " + r.dy + "\nsx = " + r.sx + "    sy = " + r.sy + "    " + caseTxt + "\np₀ = " + (caso1 ? "2Δy − Δx" : "2Δx − Δy") + " = " + r.p0val + "\nincr (p<0) = " + r.incNeg + "    incr (p≥0) = " + r.incPos + "</div>" +
            "<p>Só aritmética inteira; empate <code>p ≥ 0</code> toma a diagonal.</p>",
          bounds: B,
          draw: function (plane) { ideal(plane); },
        });
        r.rows.forEach(function (row, i) {
          var dec = row.branch === "fim"
            ? "<p>Fim do segmento.</p>"
            : (row.branch === "p<0"
                ? "<p>p = <span class='hl'>" + row.p + "</span> &lt; 0 → " + (caso1 ? "x += sx" : "y += sy") + " (reto), p += " + r.incNeg + ".</p>"
                : "<p>p = <span class='hl'>" + row.p + "</span> ≥ 0 → diagonal (" + (caso1 ? "x += sx, y += sy" : "y += sy, x += sx") + "), p += " + r.incPos + ".</p>");
          steps.push({
            titulo: "i = " + i + (i === 0 ? " (início)" : ""),
            explicacao:
              "<p>Pixel <span class='ok'>(" + row.x + ", " + row.y + ")</span>.</p>" + dec + tableHtml(r, i),
            bounds: B,
            draw: function (plane) { raster(plane, i); },
          });
        });
        return steps;
      },
    };
  }

  window.GUI.register({
    id: 15,
    num: "15",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Aplicação do algoritmo de Bresenham",
    type: "computacional",
    hubDesc: "Bresenham passo a passo (p₀, decisão por iteração e pixels) para 5 retas.",
    enunciado:
      "Aplique o algoritmo de <b>Bresenham</b> para os seguintes segmentos de reta: " +
      "(a) AB — A(−1,4), B(5,7); (b) BA — B(5,7), A(−1,4); (c) CD — C(−1,−4), D(3,8); " +
      "(d) EF — E(2,0), F(6,0); (e) GH — G(1,3), H(1,6).",
    parts: [
      makePart("a) A(−1,4) → B(5,7)", "A", { x: -1, y: 4 }, "B", { x: 5, y: 7 }),
      makePart("b) B(5,7) → A(−1,4)", "B", { x: 5, y: 7 }, "A", { x: -1, y: 4 }),
      makePart("c) C(−1,−4) → D(3,8)", "C", { x: -1, y: -4 }, "D", { x: 3, y: 8 }),
      makePart("d) E(2,0) → F(6,0)", "E", { x: 2, y: 0 }, "F", { x: 6, y: 0 }),
      makePart("e) G(1,3) → H(1,6)", "G", { x: 1, y: 3 }, "H", { x: 1, y: 6 }),
    ],
  });
})();
