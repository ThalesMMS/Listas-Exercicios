/*
 * q17.js — "Qual comando identifica e restringe os cálculos ao 2º octante?" (conceitual)
 * Resposta: a guarda do laço  while (x <= y).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var R = 6, BOUNDS = [-2, 8, -2, 8];
  var OCT = ALG.circleBresenham(0, 0, R).octant; // {x,y,p} relativos

  function circleOutline(plane) {
    var ctx = plane.ctx;
    ctx.save(); ctx.beginPath();
    ctx.arc(plane.cx(0), plane.cy(0), R * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,140,170,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
    ctx.restore();
  }
  function diagonal(plane) {
    plane.segment([0, 0], [R + 1, R + 1], { color: COL.muted, dashed: [4, 4] });
    plane.text(R - 1.4, R - 0.6, "x = y", { color: COL.muted });
  }
  function drawOct(plane, upto) {
    circleOutline(plane); diagonal(plane);
    plane.point(0, 0, { color: COL.purple, radius: 4, label: "C", labelColor: COL.ink });
    OCT.forEach(function (o, i) {
      if (i > upto) return;
      var last = i === upto;
      plane.point(o.x, o.y, { color: last ? COL.yellow : COL.accent, radius: last ? 6 : 4.5, ring: last ? COL.ink : undefined });
    });
  }

  window.GUI.register({
    id: 17,
    num: "17",
    section: "III) Rasterização de Circunferências",
    title: "O comando que restringe ao 2º octante",
    type: "conceitual",
    hubDesc: "A condição do laço while (x ≤ y); a diagonal x = y encerra o octante.",
    enunciado: "Qual comando identifica e restringe os cálculos ao 2º octante?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Começa em (0, r) e avança x",
              explicacao:
                "<p>O octante é percorrido a partir do topo <span class='hl'>(0, r)</span>, " +
                "incrementando <code>x</code> a cada passo (e decrementando <code>y</code> quando " +
                "necessário).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawOct(plane, 0);
                plane.point(0, R, { color: COL.accent, radius: 6, ring: COL.ink, label: "(0, r)", labelColor: COL.accent });
              },
            },
            {
              titulo: "A guarda do laço: while (x ≤ y)",
              explicacao:
                "<p>O <b>comando que restringe</b> ao 2º octante é a <b>condição do laço</b>:</p>" +
                "<div class='formula'>x = 0;  y = r;  p = 1 − r;\nwhile (x &lt;= y) {\n    plotar(x, y) + 8 simétricos\n    x++;  // ... decide y e p\n}</div>" +
                "<p>Enquanto <span class='hl'>x ≤ y</span>, ainda estamos no 2º octante.</p>",
              bounds: BOUNDS,
              draw: function (plane) { drawOct(plane, OCT.length - 1); },
            },
            {
              titulo: "x = y encerra; x > y sai do octante",
              explicacao:
                "<p>A reta <b>x = y</b> é a fronteira do 2º octante. Quando <code>x</code> passa de " +
                "<code>y</code> (<span class='no'>x &gt; y</span>), a condição <code>x ≤ y</code> " +
                "fica falsa e o laço <b>termina</b> — os demais pontos vêm da simetria.</p>" +
                "<p>Ou seja: uma única comparação <span class='ok'>x ≤ y</span> identifica e " +
                "limita todo o cálculo ao octante.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawOct(plane, OCT.length - 1);
                var lastO = OCT[OCT.length - 1];
                plane.point(lastO.x, lastO.y, { color: COL.yellow, radius: 6, ring: COL.ink, label: "último (x ≤ y)", labelColor: COL.yellow });
              },
            },
          ];
        },
      },
    ],
  });
})();
