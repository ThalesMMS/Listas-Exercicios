/*
 * q25.js — "Por que c1 & c2 != 0 estabelece que o segmento está fora?"
 * (conceitual)
 *
 * O AND bit a bit isola os bits externos COMUNS aos dois extremos. Se o
 * resultado é != 0, há ao menos uma fronteira pela qual AMBOS estão fora —
 * logo todo o segmento fica desse mesmo lado e não cruza a janela.
 * Diagrama: segmento com os dois extremos acima (bit T em ambos).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-5, 8, -1, 11];

  // Os dois extremos ACIMA da janela (bit T = 1 em ambos).
  var Q0 = { x: -1, y: 8 };
  var Q1 = { x: 4, y: 9 };
  var c0 = ALG.outCode(ALG.P(Q0.x, Q0.y), W);
  var c1 = ALG.outCode(ALG.P(Q1.x, Q1.y), W);

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

  // Faixa "acima de y=ymax" levemente sombreada para reforçar a ideia de semiplano.
  function drawAboveBand(plane) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(255,107,107,0.10)";
    var px = plane.cx(BOUNDS[0]);
    var py = plane.cy(BOUNDS[3]);
    var w = (BOUNDS[1] - BOUNDS[0]) * plane.scale;
    var h = (BOUNDS[3] - W.ymax) * plane.scale;
    ctx.fillRect(px, py, w, h);
    ctx.restore();
  }

  window.GUI.register({
    id: 25,
    num: "25",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "Por que c1 & c2 ≠ 0 indica segmento fora?",
    type: "conceitual",
    hubDesc: "O AND isola bits externos comuns: ambos do mesmo lado ⇒ fora.",
    enunciado:
      "Por que a condição c1 & c2 ≠ 0 estabelece que o segmento de reta está fora da área de visualização?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "O AND isola os bits externos COMUNS",
              explicacao:
                "<p>Cada bit do código indica que o ponto está fora por uma fronteira (T, B, R, L). O operador <code>&</code> só deixa ligado um bit que está <b>ligado nos dois</b> extremos ao mesmo tempo:</p>" +
                "<div class='formula'>c1 & c2  →  bits externos COMUNS aos dois pontos</div>" +
                "<p>Se o resultado é <span class='hl'>≠ 0</span>, existe pelo menos uma fronteira pela qual <b>ambos</b> os extremos estão do lado de fora.</p>",
            },
            {
              titulo: "Mesmo lado externo ⇒ segmento inteiro fora",
              explicacao:
                "<p>Cada fronteira define um <b>semiplano</b>. Se os dois extremos estão no mesmo semiplano externo (por exemplo, ambos <b>acima</b> de y = ymax), então <b>todo</b> o segmento entre eles também está nesse semiplano.</p>" +
                "<p>Como a janela está do outro lado dessa fronteira, o segmento <span class='no'>não cruza</span> a área visível e pode ser rejeitado de imediato — sem calcular nenhuma interseção.</p>",
            },
            {
              titulo: "Exemplo — os dois extremos acima",
              explicacao:
                "<p>Segmento de <b>" + ALG.plabel(ALG.P(Q0.x, Q0.y)) + "</b> a <b>" + ALG.plabel(ALG.P(Q1.x, Q1.y)) + "</b>, ambos acima da janela (y &gt; 6):</p>" +
                "<div class='formula'>" +
                ALG.plabel(ALG.P(Q0.x, Q0.y)) + " → c1 = " + ALG.codeBits(c0) + "\n" +
                ALG.plabel(ALG.P(Q1.x, Q1.y)) + " → c2 = " + ALG.codeBits(c1) + "</div>" +
                "<p>Os dois têm o bit <span class='hl'>T</span> (acima) ligado. Na faixa avermelhada, o semiplano externo da fronteira superior — todo o segmento cai nele.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawAboveBand(plane);
                drawWindow(plane);
                drawTopEdge(plane);
                plane.segment(Q0, Q1, { color: COL.red, lineWidth: 3 });
                plane.point(Q0.x, Q0.y, { color: COL.red, radius: 5, ring: COL.red, label: ALG.plabel(ALG.P(Q0.x, Q0.y)) + " " + ALG.codeBits(c0), labelColor: COL.red });
                plane.point(Q1.x, Q1.y, { color: COL.red, radius: 5, ring: COL.red, label: ALG.plabel(ALG.P(Q1.x, Q1.y)) + " " + ALG.codeBits(c1), labelColor: COL.red, labelDy: 16 });
                plane.text((W.xmin + W.xmax) / 2, W.ymax + 2.6, "semiplano acima de y = 6", { align: "center", color: COL.red, font: "12px ui-sans-serif" });
              },
            },
            {
              titulo: "O AND mantém o bit T",
              explicacao:
                "<div class='formula'>  " + ALG.codeBits(c0) + "   (c1)\n& " + ALG.codeBits(c1) + "   (c2)\n= " + ALG.codeBits(c0 & c1) + "   ≠ 0  →  rejeição</div>" +
                "<p>O bit <b>T</b> sobreviveu ao AND, confirmando que os dois pontos compartilham a fronteira <b>superior</b>. Por isso <code>c1 & c2 ≠ 0</code> garante que o segmento está totalmente fora por aquele lado.</p>" +
                "<p class='muted'>Cuidado com o caso oposto: se os extremos estão fora por fronteiras <b>diferentes</b> (ex.: um acima, outro à esquerda), o AND dá 0000 e o segmento <b>pode</b> cruzar a janela — aí não se rejeita trivialmente.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawAboveBand(plane);
                drawWindow(plane);
                drawTopEdge(plane);
                plane.segment(Q0, Q1, { color: COL.red, lineWidth: 2, dashed: [6, 5] });
                plane.point(Q0.x, Q0.y, { color: COL.red, radius: 4 });
                plane.point(Q1.x, Q1.y, { color: COL.red, radius: 4 });
                plane.text((W.xmin + W.xmax) / 2, W.ymax + 2.6, "c1 & c2 = " + ALG.codeBits(c0 & c1) + " ≠ 0", { align: "center", color: COL.red, font: "bold 13px ui-monospace, monospace" });
              },
            },
          ];
        },
      },
    ],
  });
})();
