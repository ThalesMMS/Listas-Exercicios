/*
 * q26.js — "A atualização das coordenadas é feita a cada iteração. O que ocorre
 * com os valores originais da cena?" (conceitual)
 *
 * Resposta (gabarito): o algoritmo trabalha sobre CÓPIAS; a geometria original
 * permanece preservada no modelo/cena. Diagrama: cena original (segmento que
 * cruza a janela) vs cópia recortada (trecho visível).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-6, 10, -1, 9];

  // Cena original: segmento que atravessa a janela da esquerda para a direita.
  var S0 = { x: -4, y: 3 };
  var S1 = { x: 8, y: 4 };
  var run = ALG.cohenSutherland(ALG.P(S0.x, S0.y), ALG.P(S1.x, S1.y), W);
  var VA = run.a; // (-2, 19/6)
  var VB = run.b; // (5, 15/4)

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  window.GUI.register({
    id: 26,
    num: "26",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "O que ocorre com os valores originais da cena?",
    type: "conceitual",
    hubDesc: "O algoritmo recorta sobre cópias; a cena original fica intacta.",
    enunciado:
      "A atualização dos valores das coordenadas inicial e final é feita a cada iteração. O que ocorre com os valores originais da cena?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Os valores originais NÃO são alterados",
              explicacao:
                "<p>Durante o recorte, as coordenadas dos extremos são atualizadas a cada iteração. Em uma implementação de visualização, normalmente fazemos isso sobre <b>cópias</b> de trabalho, não sobre os dados da cena.</p>" +
                "<p>A geometria original permanece <span class='ok'>preservada no modelo/cena</span>. Essa é uma boa decisão de projeto para renderização; não é uma obrigação matemática do Cohen-Sutherland, pois uma implementação poderia sobrescrever os extremos recebidos.</p>",
            },
            {
              titulo: "Por que separar original e cópia",
              explicacao:
                "<p>Manter a cena intacta é essencial para reaproveitá-la:</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ a mesma cena pode ser redesenhada com outra janela</div>" +
                "<div class='pro'>+ permite mudar zoom/pan sem recriar a geometria</div>" +
                "<div class='pro'>+ evita perda irreversível de informação ao recortar</div>" +
                "<div class='con'>- se sobrescrevêssemos o original, o trecho fora da janela seria perdido para sempre</div>" +
                "</div>",
            },
            {
              titulo: "Cena original — segmento completo",
              explicacao:
                "<p>Cena: um segmento de <b>" + ALG.plabel(ALG.P(S0.x, S0.y)) + "</b> a <b>" + ALG.plabel(ALG.P(S1.x, S1.y)) +
                "</b> que atravessa a janela. Esses valores ficam guardados no modelo:</p>" +
                "<div class='coordlist'>" +
                "<span class='coord'>" + ALG.plabel(ALG.P(S0.x, S0.y)) + "</span>" +
                "<span class='coord'>" + ALG.plabel(ALG.P(S1.x, S1.y)) + "</span>" +
                "</div>" +
                "<p>O algoritmo lê esses pontos, mas trabalha em variáveis separadas.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                plane.segment(S0, S1, { color: COL.accent, lineWidth: 2 });
                plane.point(S0.x, S0.y, { color: COL.purple, radius: 5, label: ALG.plabel(ALG.P(S0.x, S0.y)), labelColor: COL.ink });
                plane.point(S1.x, S1.y, { color: COL.purple, radius: 5, label: ALG.plabel(ALG.P(S1.x, S1.y)), labelColor: COL.ink, labelDy: 16 });
                plane.text((W.xmin + W.xmax) / 2, W.ymax + 1.6, "cena original (preservada)", { align: "center", color: COL.muted, font: "12px ui-sans-serif" });
              },
            },
            {
              titulo: "Cópia recortada — trecho visível",
              explicacao:
                "<p>O recorte produz uma <b>cópia</b> com os extremos atualizados para o trecho visível:</p>" +
                "<div class='formula'>" + ALG.plabel(ALG.P(S0.x, S0.y)) + " → " + ALG.plabel(VA) + "\n" +
                ALG.plabel(ALG.P(S1.x, S1.y)) + " → " + ALG.plabel(VB) + "</div>" +
                "<p>Em <span class='ok'>verde</span>, a cópia recortada usada para desenhar. Em <span class='muted'>cinza</span>, a cena original — <b>intacta</b>: seus valores não foram tocados.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawWindow(plane);
                // original esmaecido
                plane.segment(S0, S1, { color: "rgba(120,140,170,0.45)", lineWidth: 1.5, dashed: [5, 4] });
                plane.point(S0.x, S0.y, { color: "rgba(120,140,170,0.7)", radius: 4, label: "original", labelColor: COL.muted });
                plane.point(S1.x, S1.y, { color: "rgba(120,140,170,0.7)", radius: 4 });
                // cópia recortada
                plane.segment(VA, VB, { color: COL.green, lineWidth: 3 });
                plane.point(ALG.nx(VA), ALG.ny(VA), { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(VA), labelColor: COL.green });
                plane.point(ALG.nx(VB), ALG.ny(VB), { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(VB), labelColor: COL.green, labelDy: 16 });
                plane.text((W.xmin + W.xmax) / 2, W.ymin - 1.6, "cópia recortada (o que é desenhado)", { align: "center", color: COL.green, font: "12px ui-sans-serif" });
              },
            },
          ];
        },
      },
    ],
  });
})();
