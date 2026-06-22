/*
 * q23.js — "Quais são as condições de parada do algoritmo?" (conceitual)
 *
 * Aceitação trivial: c1 == 0 e c2 == 0 (ambos dentro).
 * Rejeição trivial: (c1 & c2) != 0 (ambos do mesmo lado externo).
 * Diagrama: janela + um segmento totalmente dentro e um totalmente acima.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-4, 8, -1, 11];

  // Segmento totalmente DENTRO (aceitação trivial).
  var IN0 = { x: 0, y: 3 };
  var IN1 = { x: 3, y: 4 };
  // Segmento totalmente ACIMA (rejeição trivial).
  var UP0 = { x: -1, y: 8 };
  var UP1 = { x: 4, y: 9 };

  var cIn0 = ALG.outCode(ALG.P(IN0.x, IN0.y), W);
  var cIn1 = ALG.outCode(ALG.P(IN1.x, IN1.y), W);
  var cUp0 = ALG.outCode(ALG.P(UP0.x, UP0.y), W);
  var cUp1 = ALG.outCode(ALG.P(UP1.x, UP1.y), W);

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  function drawTopEdge(plane) {
    plane.segment({ x: W.xmin, y: W.ymax }, { x: W.xmax, y: W.ymax }, { color: COL.yellow, lineWidth: 3 });
  }

  window.GUI.register({
    id: 23,
    num: "23",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "Condições de parada do algoritmo",
    type: "conceitual",
    hubDesc: "Aceitação trivial (c1=c2=0) e rejeição trivial (c1 & c2 ≠ 0).",
    enunciado:
      "Quais são as condições de parada do algoritmo de Cohen-Sutherland?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Duas condições de parada",
              explicacao:
                "<p>A cada iteração o algoritmo testa os códigos <code>c1</code> e <code>c2</code> dos dois extremos. Ele <b>para</b> em dois casos:</p>" +
                "<div class='formula'>1) Aceitação trivial:  c1 == 0  e  c2 == 0\n2) Rejeição trivial:   (c1 & c2) != 0</div>" +
                "<p>Se nenhuma das duas ocorre, ele recorta um extremo, recalcula o código e <b>repete</b>.</p>",
            },
            {
              titulo: "Aceitação trivial — ambos dentro",
              explicacao:
                "<p>Quando os dois extremos têm código <span class='ok'>0000</span>, ambos estão <b>dentro</b> da janela. Como a janela é convexa, todo o segmento está dentro e é aceito por completo.</p>" +
                "<div class='formula'>" + ALG.plabel(ALG.P(IN0.x, IN0.y)) + " → " + ALG.codeBits(cIn0) + "\n" +
                ALG.plabel(ALG.P(IN1.x, IN1.y)) + " → " + ALG.codeBits(cIn1) + "\n" +
                "c1 | c2 = 0000  →  aceita</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                plane.segment(IN0, IN1, { color: COL.green, lineWidth: 3 });
                plane.point(IN0.x, IN0.y, { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(ALG.P(IN0.x, IN0.y)) + " 0000", labelColor: COL.green });
                plane.point(IN1.x, IN1.y, { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(ALG.P(IN1.x, IN1.y)) + " 0000", labelColor: COL.green, labelDy: 16 });
                plane.text((W.xmin + W.xmax) / 2, (W.ymin + W.ymax) / 2 + 1.4, "aceitação trivial", { align: "center", color: COL.green, font: "bold 12px ui-sans-serif" });
              },
            },
            {
              titulo: "Rejeição trivial — ambos do mesmo lado",
              explicacao:
                "<p>Quando <code>c1 & c2 ≠ 0</code>, há um bit ligado nos <b>dois</b> extremos — ou seja, ambos estão fora pela <b>mesma</b> fronteira. O segmento inteiro fica desse lado e é rejeitado sem recorte.</p>" +
                "<div class='formula'>" + ALG.plabel(ALG.P(UP0.x, UP0.y)) + " → " + ALG.codeBits(cUp0) + "  (" + ALG.codeNames(cUp0) + ")\n" +
                ALG.plabel(ALG.P(UP1.x, UP1.y)) + " → " + ALG.codeBits(cUp1) + "  (" + ALG.codeNames(cUp1) + ")\n" +
                "c1 & c2 = " + ALG.codeBits(cUp0 & cUp1) + "  ≠ 0  →  rejeita</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                drawTopEdge(plane);
                plane.segment(UP0, UP1, { color: COL.red, lineWidth: 2, dashed: [6, 5] });
                plane.point(UP0.x, UP0.y, { color: COL.red, radius: 5, ring: COL.red, label: ALG.plabel(ALG.P(UP0.x, UP0.y)) + " 1000", labelColor: COL.red });
                plane.point(UP1.x, UP1.y, { color: COL.red, radius: 5, ring: COL.red, label: ALG.plabel(ALG.P(UP1.x, UP1.y)) + " 1000", labelColor: COL.red, labelDy: 16 });
                plane.text((W.xmin + W.xmax) / 2, W.ymax + 2.4, "ambos acima → rejeição trivial", { align: "center", color: COL.red, font: "bold 12px ui-sans-serif" });
              },
            },
            {
              titulo: "Caso restante — recortar e repetir",
              explicacao:
                "<p>Se <span class='hl'>nenhuma</span> condição de parada vale (algum extremo fora, mas sem bit externo comum), o segmento <b>cruza</b> a fronteira da janela. O algoritmo:</p>" +
                "<div class='formula'>1) escolhe um extremo fora\n2) recorta na fronteira → novo ponto\n3) recalcula o código\n4) volta a testar as duas condições</div>" +
                "<p>Esse laço termina sempre, pois cada recorte aproxima um extremo da janela até cair em uma das duas paradas.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                plane.segment(IN0, IN1, { color: COL.green, lineWidth: 2 });
                plane.point(IN0.x, IN0.y, { color: COL.green, radius: 4 });
                plane.point(IN1.x, IN1.y, { color: COL.green, radius: 4, label: "aceito", labelColor: COL.green });
                plane.segment(UP0, UP1, { color: COL.red, lineWidth: 2, dashed: [6, 5] });
                plane.point(UP0.x, UP0.y, { color: COL.red, radius: 4 });
                plane.point(UP1.x, UP1.y, { color: COL.red, radius: 4, label: "rejeitado", labelColor: COL.red });
              },
            },
          ];
        },
      },
    ],
  });
})();
