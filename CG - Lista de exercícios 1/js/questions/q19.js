/*
 * q19.js — "Se o centro não for na origem, onde e como o algoritmo considera isso?" (conceitual)
 * A decisão é calculada na origem (só depende de r); o centro entra ao PLOTAR
 * (translação somada na simetria de 8 vias).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var XC = 3, YC = 4, R = 4, BOUNDS = [-3, 9, -2, 10];
  var OCT = ALG.circleBresenham(0, 0, R).octant;     // relativos
  var THIRD = OCT[2] || OCT[OCT.length - 1];          // 3º ponto relativo
  var ABS_THIRD = { x: XC + THIRD.x, y: YC + THIRD.y };
  var SYM = ALG.symmetricPoints(THIRD.x, THIRD.y, XC, YC);

  function circleOutline(plane, cx, cy) {
    var ctx = plane.ctx;
    ctx.save(); ctx.beginPath();
    ctx.arc(plane.cx(cx), plane.cy(cy), R * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,140,170,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
    ctx.restore();
  }

  window.GUI.register({
    id: 19,
    num: "19",
    section: "III) Rasterização de Circunferências",
    title: "Centro fora da origem",
    type: "conceitual",
    hubDesc: "Calcula-se na origem; o centro (xc, yc) é somado só ao plotar (simetria + translação).",
    enunciado: "Se o centro não for na origem, onde e como no algoritmo essa informação é considerada?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "A decisão é calculada na origem",
              explicacao:
                "<p>O núcleo do algoritmo (variável de decisão e incrementos) só depende do " +
                "<b>raio</b>, não da posição:</p>" +
                "<div class='formula'>p₀ = 1 − r        // independe do centro\nx++;  p += 2x+1  (ou)  p += 2(x−y)+1</div>" +
                "<p>Os pontos saem <b>relativos</b> a um centro na origem (0, 0).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                circleOutline(plane, XC, YC);
                plane.point(XC, YC, { color: COL.purple, radius: 5, label: "C(" + XC + ", " + YC + ")", labelColor: COL.ink });
              },
            },
            {
              titulo: "O centro entra ao plotar (translação)",
              explicacao:
                "<p>A informação do centro <span class='hl'>(xc, yc)</span> é usada <b>na hora de " +
                "plotar</b>: cada ponto relativo (x, y) e seus 8 simétricos são <b>transladados " +
                "somando o centro</b>:</p>" +
                "<div class='formula'>(xc ± x, yc ± y)   e   (xc ± y, yc ± x)</div>" +
                "<p>3º ponto relativo " + ALG.plabel(ALG.P(THIRD.x, THIRD.y)) +
                " → somando o centro (" + XC + ", " + YC + "), o ponto absoluto correspondente é " +
                "<span class='ok'>" + ALG.plabel(ALG.P(ABS_THIRD.x, ABS_THIRD.y)) + "</span>.</p>" +
                "<p>Os 8 simétricos absolutos desse ponto relativo são:</p>" +
                "<div class='coordlist'>" +
                SYM.map(function (s) { return "<span class='coord green'>(" + s.x + ", " + s.y + ")</span>"; }).join("") +
                "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                circleOutline(plane, XC, YC);
                plane.point(XC, YC, { color: COL.purple, radius: 4, label: "C", labelColor: COL.ink });
                SYM.forEach(function (s) { plane.point(s.x, s.y, { color: COL.green, radius: 5 }); });
                plane.point(THIRD.x, THIRD.y, {
                  color: COL.yellow,
                  radius: 5,
                  ring: COL.ink,
                  label: "rel. " + ALG.plabel(ALG.P(THIRD.x, THIRD.y)),
                  labelColor: COL.yellow,
                });
                plane.point(ABS_THIRD.x, ABS_THIRD.y, {
                  color: COL.orange,
                  radius: 7,
                  ring: COL.ink,
                  label: "abs. " + ALG.plabel(ALG.P(ABS_THIRD.x, ABS_THIRD.y)),
                  labelColor: COL.orange,
                  labelDy: 16,
                });
              },
            },
            {
              titulo: "Resumo",
              explicacao:
                "<p>A aritmética de decisão é <b>invariante à translação</b> — calcula-se como se o " +
                "centro fosse a origem. O centro é uma <b>translação aplicada no mapeamento dos " +
                "pixels</b> (na simetria de 8 vias), deixando o laço principal inalterado.</p>" +
                "<p><span class='muted'>É exatamente o que faz a função de simetria: " +
                "<code>simetricos(x, y, xc, yc)</code>.</span></p>",
            },
          ];
        },
      },
    ],
  });
})();
