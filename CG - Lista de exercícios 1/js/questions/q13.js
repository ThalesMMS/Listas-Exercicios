/*
 * q13.js — "x antes de p? É de y? Explique." (conceitual, Bresenham retas)
 * Caso 1: x++ sempre, ANTES de p; y só muda quando p ≥ 0.
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;
  var BOUNDS = [0.5, 5.5, 1.5, 5.5];
  var CUR = { x: 2, y: 3 }, E = { x: 3, y: 3 }, NE = { x: 3, y: 4 };

  function idealArrow(plane) {
    plane.segment({ x: 1.2, y: 2.4 }, { x: 4.2, y: 4.6 }, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
    plane.text(4.0, 4.8, "reta ideal", { color: COL.muted });
  }

  window.GUI.register({
    id: 13,
    num: "13",
    section: "II) Rasterização de Retas — Bresenham",
    title: "Atualização de x, p e y",
    type: "conceitual",
    hubDesc: "Nesta recorrência, x é a variável independente; y só muda quando p ≥ 0.",
    enunciado:
      "A atualização de x tem que ser feita antes da atualização da variável de decisão p no 1º caso? É de y? Explique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Nesta recorrência, x é independente",
              explicacao:
                "<p>No 1º caso (anda em x), <span class='hl'>x</span> é a variável " +
                "<b>independente</b>: <code>x += sx</code> em <b>todo</b> passo, " +
                "<b>incondicionalmente</b>. Na organização de pseudocódigo abaixo, ele aparece " +
                "antes de atualizar <code>p</code>, porque <code>p</code> mede o erro <b>no novo x</b>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                idealArrow(plane);
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 6, ring: COL.ink, label: "atual (x, y)", labelColor: COL.accent });
                plane.segment({ x: 3, y: 1.5 }, { x: 3, y: 5.5 }, { color: COL.muted, dashed: [3, 4] });
                plane.text(3, 1.9, "x + 1", { align: "center", color: COL.muted });
              },
            },
            {
              titulo: "y é dependente — condicional a p",
              explicacao:
                "<p>Na coluna <code>x+1</code> há dois candidatos: <span class='ok'>E</span> (reto, " +
                "mantém y) e <span class='hl'>NE</span> (diagonal, y += sy).</p>" +
                "<p><span class='hl'>y</span> só muda <b>quando p ≥ 0</b>. Logo a atualização de y é " +
                "<b>condicionada</b> à avaliação de p — não vem antes dele.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                idealArrow(plane);
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 5, ring: COL.ink });
                plane.point(E.x, E.y, { color: COL.green, radius: 6, label: "E (reto)", labelColor: COL.green });
                plane.point(NE.x, NE.y, { color: COL.yellow, radius: 6, label: "NE (diagonal)", labelColor: COL.yellow, labelDy: 16 });
              },
            },
            {
              titulo: "A ordem na iteração",
              explicacao:
                "<div class='formula'>x += sx;                  // sempre, primeiro\nif (p &lt; 0)  p += 2Δy;        // y mantém (E)\nelse        { y += sy;  p += 2Δy − 2Δx; }   // diagonal (NE)</div>" +
                "<p>Para esta recorrência: atualizamos <b>x antes de recalcular p</b>. " +
                "<b>y</b> não vem antes da decisão; só muda no ramo <code>p ≥ 0</code>. " +
                "Formulações equivalentes podem reorganizar operações algébricas sem mudar os pixels escolhidos.</p>",
            },
          ];
        },
      },
    ],
  });
})();
