/*
 * q11.js — "Qual a vantagem do Bresenham em relação ao DDA?" (conceitual)
 * Só aritmética inteira: sem divisão, sem ponto flutuante.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var A = { x: 0, y: 0 }, B = { x: 7, y: 3 }, BOUNDS = [-1, 9, -2, 5];
  var R = ALG.bresenhamLine(A, B);

  window.GUI.register({
    id: 11,
    num: "11",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Vantagem do Bresenham sobre o DDA",
    type: "conceitual",
    hubDesc: "Só inteiros: sem divisão nem ponto flutuante → mais rápido e exato.",
    enunciado: "Qual é a vantagem desse algoritmo em relação ao DDA?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "DDA × Bresenham",
              explicacao:
                "<p>O <b>DDA</b> usa <b>divisão</b> (<code>Δ/passos</code>) e acumula em " +
                "<b>ponto flutuante</b> — tem custo e erro de arredondamento.</p>" +
                "<p>O <b>Bresenham</b> usa <b>apenas aritmética inteira</b>: somas, comparações e a " +
                "variável de decisão <code>p</code> (inteira). Sem divisão, sem float.</p>",
            },
            {
              titulo: "Vantagens",
              explicacao:
                "<div class='proscons'>" +
                "<div class='pro'>Mais rápido — operações inteiras (somas/comparações).</div>" +
                "<div class='pro'>Sem erro de ponto flutuante (exato).</div>" +
                "<div class='pro'>Ideal para implementação em hardware.</div>" +
                "<div class='con'>Configuração inicial um pouco mais elaborada (p₀, incrementos) — custo desprezível.</div>" +
                "</div>",
            },
            {
              titulo: "Tudo inteiro",
              explicacao:
                "<p>Veja a reta (0,0)→(7,3) por Bresenham: a decisão <code>p</code> é sempre " +
                "<b>inteira</b> a cada pixel.</p>" +
                "<div class='formula'>p: " + R.rows.map(function (r) { return r.p; }).join(", ") + "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                plane.segment(A, B, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
                R.pixels.forEach(function (p) { plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent, lineWidth: 1.3 }); });
                plane.point(A.x, A.y, { color: COL.accent, radius: 4 });
                plane.point(B.x, B.y, { color: COL.green, radius: 4, label: "(7,3)", labelColor: COL.green });
              },
            },
          ];
        },
      },
    ],
  });
})();
