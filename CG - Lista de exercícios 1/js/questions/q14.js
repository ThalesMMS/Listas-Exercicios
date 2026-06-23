/*
 * q14.js — "Quando p for positivo, o que ocorre com y? Explique." (conceitual, Bresenham)
 * p ≥ 0 → o candidato diagonal está mais perto → y avança (sy).
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [0.5, 5.5, 1.5, 5.5];
  var CUR = { x: 2, y: 3 }, E = { x: 3, y: 3 }, NE = { x: 3, y: 4 }, M = { x: 3, y: 3.5 };

  function ideal(plane, above) {
    // reta ideal passando ACIMA (p≥0) ou ABAIXO (p<0) do ponto médio M
    var y3 = above ? 3.75 : 3.25;
    plane.segment({ x: 1.5, y: 3.5 - (3 - 1.5) * (y3 - 3) / 1 }, { x: 4.5, y: y3 + (4.5 - 3) * (y3 - 3) / 1 }, { color: COL.cyan, lineWidth: 2 });
  }

  window.GUI.register({
    id: 14,
    num: "14",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Quando p ≥ 0, o que ocorre com y",
    type: "conceitual",
    hubDesc: "p ≥ 0 → o pixel diagonal está mais próximo: y avança (sy).",
    enunciado: "Quando p for positivo, o que ocorre com y? Explique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "p compara os dois candidatos",
              explicacao:
                "<p>Na coluna seguinte, <code>p</code> compara a distância da reta ideal aos dois " +
                "candidatos: <span class='ok'>E</span> (mesmo y) e <span class='hl'>NE</span> " +
                "(y avança). O <b>ponto médio M</b> entre eles é a referência.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 5, ring: COL.ink, label: "atual", labelColor: COL.accent });
                plane.point(E.x, E.y, { color: COL.green, radius: 5, label: "E", labelColor: COL.green });
                plane.point(NE.x, NE.y, { color: COL.yellow, radius: 5, label: "NE", labelColor: COL.yellow });
                plane.point(M.x, M.y, { color: COL.muted, radius: 3, label: "M", labelColor: COL.muted, labelDx: 8, labelDy: 4 });
              },
            },
            {
              titulo: "p ≥ 0 → diagonal (y avança)",
              explicacao:
                "<p>Quando <span class='hl'>p ≥ 0</span>, a reta ideal passa <b>acima</b> do ponto " +
                "médio: o candidato <b>NE (diagonal)</b> está mais perto. Então:</p>" +
                "<div class='formula'>p ≥ 0  →  y += sy   e   p += 2Δy − 2Δx</div>" +
                "<p>Ou seja, <span class='ok'>y é incrementado</span> (no octante padrão, sobe).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                ideal(plane, true);
                plane.point(M.x, M.y, { color: COL.muted, radius: 3 });
                plane.point(E.x, E.y, { color: "rgba(120,140,170,0.5)", radius: 4 });
                plane.point(NE.x, NE.y, { color: COL.yellow, radius: 7, ring: COL.ink, label: "escolhido", labelColor: COL.yellow });
              },
            },
            {
              titulo: "p < 0 → reto (y mantém)",
              explicacao:
                "<p>Por contraste, quando <span class='no'>p &lt; 0</span> a reta passa <b>abaixo</b> " +
                "de M: vence o candidato <b>E (reto)</b>, <span class='no'>y permanece</span>, e " +
                "<code>p += 2Δy</code>.</p>" +
                "<p>(No 2º caso / steep, troque y↔x: é x que fica condicional.)</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                ideal(plane, false);
                plane.point(M.x, M.y, { color: COL.muted, radius: 3 });
                plane.point(NE.x, NE.y, { color: "rgba(120,140,170,0.5)", radius: 4 });
                plane.point(E.x, E.y, { color: COL.green, radius: 7, ring: COL.ink, label: "escolhido", labelColor: COL.green });
              },
            },
          ];
        },
      },
    ],
  });
})();
