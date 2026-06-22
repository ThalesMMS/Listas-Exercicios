/*
 * q03.js — "Rotação/escala movem o objeto. Como impedir essa movimentação?" (conceitual)
 * Transladar o ponto-fixo à origem, transformar e voltar: T(p)·M·T(−p).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var TRI = [{ x: 5, y: 4 }, { x: 8, y: 4 }, { x: 6, y: 7 }];
  var C = { x: (5 + 8 + 6) / 3, y: (4 + 4 + 7) / 3 }; // centroide ≈ (6.33, 5)
  var ROT_O = ALG.applyToPolygon(ALG.mRotateDeg(45), TRI);
  var ROT_C = ALG.applyToPolygon(ALG.matCompose([ALG.mTranslate(-C.x, -C.y), ALG.mRotateDeg(45), ALG.mTranslate(C.x, C.y)]), TRI);
  var BOUNDS = [-3, 11, -2, 11];

  function tri(plane, pts, color, dashed) {
    plane.polygon(pts, { stroke: color, lineWidth: 2, dashed: dashed ? [5, 4] : false });
    pts.forEach(function (p) { plane.point(p.x, p.y, { color: color, radius: 3.5 }); });
  }

  window.GUI.register({
    id: 3,
    num: "3",
    section: "I) Transformações Geométricas",
    title: "Impedir o deslocamento de R e S",
    type: "conceitual",
    hubDesc: "Transladar o ponto-fixo à origem, transformar e voltar: T(p)·M·T(−p).",
    enunciado:
      "A rotação e a escala podem produzir uma movimentação do objeto se aplicadas diretamente. Como impedir essa movimentação?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Por que o objeto \"se move\"",
              explicacao:
                "<p>Rotação e escala são definidas <b>em torno da origem</b>. Um objeto " +
                "<b>longe</b> da origem é girado/escalado em relação a (0,0) — o que o " +
                "<span class='no'>desloca</span> (e, na escala, o afasta/aproxima da origem).</p>" +
                "<p>Abaixo: girar 45° em torno da origem leva o triângulo para longe.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                tri(plane, TRI, COL.muted, true);
                tri(plane, ROT_O, COL.red, false);
                plane.point(0, 0, { color: COL.orange, radius: 4, label: "origem", labelColor: COL.orange });
              },
            },
            {
              titulo: "A solução: ponto fixo na origem",
              explicacao:
                "<p>Escolha o ponto que deve ficar <b>parado</b> (centro do objeto, ou um vértice). " +
                "Translade-o para a origem, aplique a transformação e devolva-o:</p>" +
                "<div class='formula'>M_final = T(+p) · M · T(−p)</div>" +
                "<p>1) <code>T(−p)</code> leva p à origem; 2) <code>M</code> gira/escala; " +
                "3) <code>T(+p)</code> devolve. O ponto <b>p</b> fica fixo.</p>",
            },
            {
              titulo: "Resultado: gira \"no lugar\"",
              explicacao:
                "<p>Com <b>p = centro</b> do triângulo, o giro de 45° acontece <b>no lugar</b> — o " +
                "objeto roda sem se deslocar.</p>" +
                "<p><span class='muted'>É a mesma técnica usada na questão 5(c), com B fixo.</span></p>",
              bounds: BOUNDS,
              draw: function (plane) {
                tri(plane, TRI, COL.muted, true);
                tri(plane, ROT_C, COL.green, false);
                plane.point(C.x, C.y, { color: COL.orange, radius: 5, ring: COL.ink, label: "p (fixo)", labelColor: COL.orange });
              },
            },
          ];
        },
      },
    ],
  });
})();
