/*
 * q18.js — "A atualização de x tem que ser feita antes de p? É de y? Explique." (conceitual, círculo)
 * x (independente) incrementa sempre nesta recorrência; y só decrementa quando p ≥ 0.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var R = 6, BOUNDS = [0.5, 5.5, 3.2, 7.2];
  var CUR = { x: 2, y: 6 };    // ponto atual (relativo)
  var RETO = { x: 3, y: 6 };   // candidato "reto" (mesmo y)
  var DIAG = { x: 3, y: 5 };   // candidato "diagonal" (y--)

  function arc(plane) {
    var ctx = plane.ctx;
    ctx.save(); ctx.beginPath();
    ctx.arc(plane.cx(0), plane.cy(0), R * plane.scale, -Math.PI / 2.05, -Math.PI / 3.4);
    ctx.strokeStyle = COL.muted; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke();
    ctx.restore();
    plane.text(4.0, 6.7, "círculo ideal", { color: COL.muted });
  }

  window.GUI.register({
    id: 18,
    num: "18",
    section: "III) Rasterização de Circunferências",
    title: "Atualização de x, p e y",
    type: "conceitual",
    hubDesc: "Nesta recorrência, x incrementa sempre; y só decrementa quando p ≥ 0.",
    enunciado:
      "A atualização de x tem que ser feita antes da atualização da variável de decisão p? É de y? Explique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "x é a variável independente",
              explicacao:
                "<p>No 2º octante, <span class='hl'>x</span> avança em <b>todo</b> passo: " +
                "<code>x++</code> incondicional. Na recorrência mostrada, esse avanço aparece antes " +
                "da atualização de <code>p</code>, pois <code>p</code> mede o erro <b>no novo x</b>.</p>" +
                "<p>Do ponto atual <span class='hl'>" + ALG.plabel(ALG.P(CUR.x, CUR.y)) + "</span>, " +
                "passamos para a coluna <code>x + 1</code>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                arc(plane);
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 6, ring: COL.ink, label: "atual (x, y)", labelColor: COL.accent });
                plane.segment([CUR.x + 0.5, 3.2], [CUR.x + 0.5, 7.2], { color: COL.muted, dashed: [3, 4] });
                plane.point(CUR.x + 1, CUR.y, { color: "rgba(120,140,170,0.5)", radius: 4 });
                plane.text(CUR.x + 1, 4.0, "x + 1", { align: "center", color: COL.muted });
              },
            },
            {
              titulo: "y é a variável dependente (condicional)",
              explicacao:
                "<p>Na coluna <code>x+1</code> há <b>dois candidatos</b>: o <span class='ok'>reto</span> " +
                "(mantém y) e o <span class='hl'>diagonal</span> (y−−).</p>" +
                "<p><span class='hl'>y</span> só muda — <code>y--</code> — <b>quando p ≥ 0</b> " +
                "(o diagonal está mais perto). Essa decisão usa o <code>p</code> corrente, logo a " +
                "atualização de y é <b>condicionada</b> à avaliação de p.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                arc(plane);
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 5, ring: COL.ink });
                plane.point(RETO.x, RETO.y, { color: COL.green, radius: 6, label: "reto (mantém y)", labelColor: COL.green });
                plane.point(DIAG.x, DIAG.y, { color: COL.yellow, radius: 6, label: "diagonal (y−−)", labelColor: COL.yellow, labelDy: 16 });
              },
            },
            {
              titulo: "A atualização de p",
              explicacao:
                "<p>Resumindo a iteração (já com x incrementado):</p>" +
                "<div class='formula'>x++;                       // sempre, primeiro\nif (p &lt; 0)  p += 2x + 1;       // y mantém\nelse        { y--;  p += 2(x − y) + 1; }</div>" +
                "<p>Para esta recorrência, <b>x</b> é avançado antes do novo <code>p</code>. " +
                "<b>y</b> não vem antes da decisão; só muda no ramo <code>p ≥ 0</code>. " +
                "Outras formulações podem reorganizar a ordem algébrica mantendo a mesma escolha de pixels.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                arc(plane);
                plane.point(CUR.x, CUR.y, { color: COL.accent, radius: 5, ring: COL.ink });
                plane.point(RETO.x, RETO.y, { color: COL.green, radius: 4.5 });
                plane.point(DIAG.x, DIAG.y, { color: COL.yellow, radius: 4.5 });
              },
            },
          ];
        },
      },
    ],
  });
})();
