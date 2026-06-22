/*
 * q08.js — "Por que arredondar só na visualização?" (conceitual, DDA)
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var A = { x: 1, y: 1 }, B = { x: 6, y: 4 }, BOUNDS = [-1, 8, -1, 6];
  var R = ALG.ddaLine(A, B); // caso1, yinc=3/5; y real = 1, 8/5, 11/5, 14/5, 17/5, 4

  function ideal(plane) {
    plane.segment(A, B, { color: COL.muted, dashed: [5, 4], lineWidth: 1.5 });
    plane.point(A.x, A.y, { color: COL.accent, radius: 4, label: "A", labelColor: COL.accent });
    plane.point(B.x, B.y, { color: COL.green, radius: 4, label: "B", labelColor: COL.green });
  }

  window.GUI.register({
    id: 8,
    num: "8",
    section: "II) Rasterização de Retas — DDA",
    title: "Arredondar só na visualização",
    type: "conceitual",
    hubDesc: "Acumula-se o valor real; arredondar a cada passo propagaria erro e entortaria a reta.",
    enunciado:
      "Por que os valores dos pontos inicial e final são arredondados apenas na visualização desses valores?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "O DDA acumula valores reais",
              explicacao:
                "<p>No DDA, a cada passo somamos <code>x += xinc</code> e <code>y += yinc</code>, " +
                "com incrementos <b>fracionários</b>. A posição é mantida em <b>valor real</b>.</p>" +
                "<p>Para A(1,1)→B(6,4): <code>yinc = 3/5</code>. Os y acumulados (exatos) são:</p>" +
                "<div class='coordlist'>" + R.rows.map(function (r) { return "<span class='coord'>" + r.y.str() + "</span>"; }).join("") + "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                ideal(plane);
                R.rows.forEach(function (r) {
                  plane.point(r.x.num(), r.y.num(), { color: COL.yellow, radius: 3 });
                });
              },
            },
            {
              titulo: "Arredonda-se SÓ para escolher o pixel",
              explicacao:
                "<p>O valor real fica na variável; o <b>arredondamento</b> acontece apenas " +
                "para decidir <b>qual pixel acender</b> (a visualização).</p>" +
                "<div class='formula'>real (8/5, 11/5, 14/5, …)  →  pixel = round(real)</div>" +
                "<p>Pixels: " + R.pixels.map(function (p) { return "(" + p[0] + "," + p[1] + ")"; }).join(" ") + ".</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                R.pixels.forEach(function (p) { plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent, lineWidth: 1.3 }); });
                ideal(plane);
                R.rows.forEach(function (r) { plane.point(r.x.num(), r.y.num(), { color: COL.yellow, radius: 3 }); });
              },
            },
            {
              titulo: "Se arredondasse a cada passo…",
              explicacao:
                "<p>Arredondar o valor <b>antes</b> de acumular faria o <span class='no'>erro " +
                "crescer e se propagar</span>: a reta iria <b>desviando</b> e perderia precisão.</p>" +
                "<p>Mantendo o estado interno <b>exato</b> e arredondando só na hora de plotar, a " +
                "reta permanece <span class='ok'>fiel</span> do início ao fim.</p>",
            },
          ];
        },
      },
    ],
  });
})();
