/*
 * q16.js — "Apenas o 2º octante é calculado. Explique." (conceitual)
 * Simetria de 8 vias: calcula-se 1 octante e obtêm-se os outros 7 por reflexão.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var R = 5, BOUNDS = [-7, 7, -7, 7];
  var PT = { x: 3, y: 4 };                 // ponto exato sobre a circunferência r=5
  var SYM = ALG.symmetricPoints(PT.x, PT.y, 0, 0);

  function circleOutline(plane) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(plane.cx(0), plane.cy(0), R * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,140,170,0.35)";
    ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
    ctx.restore();
  }
  // 8 setores (eixos + diagonais) bem suaves.
  function sectors(plane) {
    var d = R + 1.4;
    [[d, 0], [0, d], [d, d], [d, -d]].forEach(function (v) {
      plane.segment([-v[0], -v[1]], [v[0], v[1]], { color: "rgba(120,140,170,0.22)", lineWidth: 1, dashed: [3, 4] });
    });
  }
  function octantWedge(plane) {
    // 2º octante: de (0,r) até a diagonal x=y. Realça o setor.
    var ctx = plane.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(plane.cx(0), plane.cy(0));
    ctx.lineTo(plane.cx(0), plane.cy(R));
    ctx.arc(plane.cx(0), plane.cy(0), R * plane.scale, -Math.PI / 2, -Math.PI / 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,209,102,0.14)";
    ctx.fill();
    ctx.restore();
  }

  window.GUI.register({
    id: 16,
    num: "16",
    section: "III) Rasterização de Circunferências",
    title: "Por que só o 2º octante é calculado",
    type: "conceitual",
    hubDesc: "Simetria de 8 vias: 1 octante gera os outros 7 por reflexão (≈8× mais barato).",
    enunciado: "Apenas o 2º octante é calculado. Explique.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "A circunferência tem simetria de 8 vias",
              explicacao:
                "<p>Uma circunferência é <b>simétrica</b> em relação aos eixos e às diagonais. " +
                "Por isso, um único ponto calculado <span class='hl'>(x, y)</span> gera outros " +
                "<b>7 pontos</b> automaticamente, trocando sinais e invertendo x↔y.</p>" +
                "<p>Logo, basta calcular <b>um octante</b> e <b>espelhar</b> o resto.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                circleOutline(plane); sectors(plane); octantWedge(plane);
                plane.point(0, 0, { color: COL.purple, radius: 4, label: "C", labelColor: COL.ink });
                SYM.forEach(function (s) { plane.point(s.x, s.y, { color: COL.green, radius: 5 }); });
                plane.point(PT.x, PT.y, { color: COL.yellow, radius: 6, ring: COL.ink, label: "(x, y)", labelColor: COL.yellow });
              },
            },
            {
              titulo: "Os 8 simétricos de (x, y)",
              explicacao:
                "<p>Dado <span class='hl'>(x, y)</span> no 2º octante, os 8 pontos da curva são:</p>" +
                "<div class='formula'>( x, y) (−x, y) ( x,−y) (−x,−y)\n( y, x) (−y, x) ( y,−x) (−y,−x)</div>" +
                "<p>Com o ponto <span class='hl'>" + ALG.plabel(ALG.P(PT.x, PT.y)) + "</span>:</p>" +
                "<div class='coordlist'>" +
                SYM.map(function (s) { return "<span class='coord green'>(" + s.x + ", " + s.y + ")</span>"; }).join("") +
                "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                circleOutline(plane);
                plane.point(0, 0, { color: COL.purple, radius: 4 });
                SYM.forEach(function (s) {
                  plane.point(s.x, s.y, { color: COL.green, radius: 5, label: "(" + s.x + "," + s.y + ")", labelColor: COL.green, labelSize: 10 });
                });
                plane.point(PT.x, PT.y, { color: COL.yellow, radius: 6, ring: COL.ink });
              },
            },
            {
              titulo: "Calcular 1, espelhar 7 — economia",
              explicacao:
                "<p>Se calculássemos a circunferência inteira, seria <b>~8× mais trabalho</b>. " +
                "Calculando só o 2º octante e refletindo, fazemos <span class='ok'>1/8</span> das " +
                "contas — sem perder nenhum pixel.</p>" +
                "<p>O 2º octante vai de <span class='hl'>(0, r)</span> até a <b>diagonal x = y</b> " +
                "(o setor destacado).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                circleOutline(plane); octantWedge(plane);
                plane.point(0, 0, { color: COL.purple, radius: 4 });
                plane.point(0, R, { color: COL.accent, radius: 5, label: "(0, r)", labelColor: COL.accent });
                plane.segment([0, 0], [R / Math.SQRT2, R / Math.SQRT2], { color: COL.muted, dashed: [4, 4] });
                plane.text(R / Math.SQRT2 + 0.2, R / Math.SQRT2, "x = y", { color: COL.muted });
              },
            },
            {
              titulo: "Por que justamente o 2º octante",
              explicacao:
                "<p>No 2º octante a inclinação tem módulo <b>≤ 1</b>: <b>x cresce mais rápido</b> " +
                "que y decresce. Assim x pode ser a variável independente (passo unitário, " +
                "<code>x++</code>) e y é decidido — mantendo a decisão simples e inteira.</p>" +
                "<p>Resumo: <span class='ok'>simetria de 8 vias</span> + escolha do octante de " +
                "inclinação suave = algoritmo barato e exato.</p>",
            },
          ];
        },
      },
    ],
  });
})();
