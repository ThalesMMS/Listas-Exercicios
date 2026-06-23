/*
 * q12.js — "Explique o porquê de delta sempre ser positivo." (conceitual, Bresenham)
 * Usa-se |Δx|, |Δy| (magnitudes); o sentido vai para sx, sy.
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [-8, 8, -6, 6];
  var O = { x: 0, y: 0 };
  var ENDS = [
    { p: { x: 6, y: 3 }, sx: "+1", sy: "+1", c: COL.accent },
    { p: { x: -6, y: 3 }, sx: "−1", sy: "+1", c: COL.green },
    { p: { x: 6, y: -3 }, sx: "+1", sy: "−1", c: COL.orange },
    { p: { x: -6, y: -3 }, sx: "−1", sy: "−1", c: COL.purple },
  ];

  window.GUI.register({
    id: 12,
    num: "12",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Por que delta é sempre positivo",
    type: "conceitual",
    hubDesc: "Trabalha-se com |Δx| e |Δy|; o sentido da reta vai para sx, sy.",
    enunciado: "Explique o porquê de delta sempre ser positivo.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "p vem de distâncias (magnitudes)",
              explicacao:
                "<p>O delta bruto <code>x₁ − x₀</code> ou <code>y₁ − y₀</code> pode ser negativo. " +
                "O algoritmo é que separa magnitude e sentido: define <code>dx = |x₁ − x₀|</code>, " +
                "<code>dy = |y₁ − y₀|</code> e guarda a direção em <code>sx</code> e <code>sy</code>.</p>" +
                "<p>A variável de decisão <code>p</code> nasce de uma comparação de " +
                "<b>distâncias</b> (o erro em relação à reta ideal). Distâncias são " +
                "<b>magnitudes</b> — não-negativas.</p>" +
                "<p>Por isso usam-se <span class='hl'>Δx = |x₁ − x₀|</span> e " +
                "<span class='hl'>Δy = |y₁ − y₀|</span>, sempre ≥ 0.</p>",
            },
            {
              titulo: "O sentido vai para sx, sy",
              explicacao:
                "<p>A <b>direção</b> da reta (esquerda/direita, cima/baixo) é tratada " +
                "<b>separadamente</b> pelos sinais do passo <code>sx = ±1</code> e " +
                "<code>sy = ±1</code>.</p>" +
                "<p>As 4 retas abaixo têm o <b>mesmo</b> Δx=6, Δy=3 (positivos); só mudam sx, sy:</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                ENDS.forEach(function (e) {
                  plane.segment(O, e.p, { color: e.c, lineWidth: 2 });
                  plane.point(e.p.x, e.p.y, { color: e.c, radius: 4, label: "sx=" + e.sx + " sy=" + e.sy, labelColor: e.c, labelSize: 10 });
                });
                plane.point(0, 0, { color: COL.ink, radius: 4 });
              },
            },
            {
              titulo: "Uma fórmula para todos os octantes",
              explicacao:
                "<p>Mantendo Δ <b>positivo</b>, a <b>mesma</b> fórmula de decisão serve a todos os " +
                "octantes — só mudam <code>sx, sy</code>. Assim, os sinais ficam concentrados no passo, " +
                "e os incrementos de erro continuam sendo calculados com magnitudes.</p>",
            },
          ];
        },
      },
    ],
  });
})();
