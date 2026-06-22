/*
 * q02.js — "A reflexão pode ser considerada rotação. Prove algebricamente em qual situação." (computacional)
 * (A) Reflexão pela origem = R(180°).  (B) Duas reflexões = rotação por 2× o ângulo.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var TRI = [{ x: 2, y: 1 }, { x: 6, y: 2 }, { x: 3, y: 5 }];
  var BOUNDS = [-7, 7, -6, 6];

  // Reflexão numa reta pela origem que faz ângulo φ (graus) com o eixo x.
  function refLine(phiDeg) {
    var a = 2 * phiDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [[c, s, 0], [s, -c, 0], [0, 0, 1]];
  }
  function tri(plane, pts, color, dashed) {
    plane.polygon(pts, { stroke: color, lineWidth: 2, dashed: dashed ? [5, 4] : false });
    pts.forEach(function (p) { plane.point(p.x, p.y, { color: color, radius: 3.5 }); });
  }

  function partA() {
    var refl = ALG.applyToPolygon(ALG.mScale(-1, -1), TRI);   // (x,y)->(-x,-y)
    return [
      {
        titulo: "Reflexão em relação à origem",
        explicacao:
          "<p>Refletir um ponto pela <b>origem</b> é <code>(x, y) → (−x, −y)</code>:</p>" +
          "<div class='formula'>Refl_origem =\n[ −1   0  0 ]\n[  0  −1  0 ]\n[  0   0  1 ]</div>",
        bounds: BOUNDS,
        draw: function (plane) {
          tri(plane, TRI, COL.muted, true);
          tri(plane, refl, COL.accent, false);
          plane.point(0, 0, { color: COL.orange, radius: 4, label: "origem", labelColor: COL.orange });
        },
      },
      {
        titulo: "Rotação de 180°",
        explicacao:
          "<p>Agora a rotação de 180°: <code>cos180° = −1</code>, <code>sin180° = 0</code>:</p>" +
          "<div class='formula'>R(180°) =\n[ cos180°  −sin180°  0 ]   [ −1   0  0 ]\n[ sin180°   cos180°  0 ] = [  0  −1  0 ]\n[   0         0      1 ]   [  0   0  1 ]</div>" +
          "<p>É a <span class='ok'>mesma matriz</span> da reflexão pela origem.</p>",
        bounds: BOUNDS,
        draw: function (plane) {
          tri(plane, TRI, COL.muted, true);
          tri(plane, refl, COL.green, false);
          plane.point(0, 0, { color: COL.orange, radius: 4 });
        },
      },
      {
        titulo: "Conclusão",
        explicacao:
          "<div class='formula'>Refl_origem = [−1 0; 0 −1] = R(180°)</div>" +
          "<p>Logo, a <b>reflexão em relação à origem</b> é exatamente uma <b>rotação de 180°</b> " +
          "(em 2D, em torno da origem). Provado algebricamente pela igualdade das matrizes.</p>",
      },
    ];
  }

  function partB() {
    var r0 = ALG.mReflectX();              // reflexão no eixo x (φ=0)
    var r30 = refLine(30);                 // reflexão na reta a 30°
    var afterFirst = ALG.applyToPolygon(r0, TRI);
    var afterSecond = ALG.applyToPolygon(ALG.matMul(r30, r0), TRI); // = R(60°)
    return [
      {
        titulo: "Reflexão numa reta pela origem",
        explicacao:
          "<p>A reflexão numa reta pela origem que faz ângulo <b>φ</b> com o eixo x é:</p>" +
          "<div class='formula'>Refl(φ) =\n[ cos2φ   sin2φ   0 ]\n[ sin2φ  −cos2φ   0 ]\n[   0       0     1 ]</div>" +
          "<p>Uma reflexão isolada inverte a orientação (<code>det = −1</code>), então sozinha " +
          "<b>não</b> é rotação.</p>",
      },
      {
        titulo: "Compor duas reflexões",
        explicacao:
          "<p>Multiplicando duas reflexões (eixos a α e β, pela origem):</p>" +
          "<div class='formula'>Refl(β) · Refl(α) =\n[ cos2(β−α)  −sin2(β−α)  0 ]\n[ sin2(β−α)   cos2(β−α)  0 ]  =  R(2(β−α))\n[    0           0       1 ]</div>" +
          "<p>O produto é uma <span class='ok'>rotação</span> de ângulo <b>2(β − α)</b>.</p>",
      },
      {
        titulo: "Exemplo: refletir em 0° e em 30° = R(60°)",
        explicacao:
          "<p>Refletindo o triângulo no eixo x (α = 0°) e depois na reta a β = 30°, o resultado é " +
          "uma rotação de <b>2·(30° − 0°) = 60°</b>.</p>" +
          "<p><b>Conclusão:</b> a composição de <b>duas reflexões</b> em eixos concorrentes é uma " +
          "<b>rotação</b> por o dobro do ângulo entre os eixos.</p>",
        bounds: BOUNDS,
        draw: function (plane) {
          plane.segment([-7, 0], [7, 0], { color: COL.orange, lineWidth: 1.5 });
          plane.segment([-6.06, -3.5], [6.06, 3.5], { color: COL.purple, lineWidth: 1.5 }); // reta a 30°
          tri(plane, TRI, COL.muted, true);
          tri(plane, afterFirst, COL.accentSoft ? COL.accent : COL.accent, false);
          tri(plane, afterSecond, COL.green, false);
        },
      },
    ];
  }

  window.GUI.register({
    id: 2,
    num: "2",
    section: "I) Transformações Geométricas",
    title: "Reflexão como rotação",
    type: "computacional",
    hubDesc: "Reflexão pela origem = R(180°); duas reflexões = rotação por o dobro do ângulo.",
    enunciado: "A reflexão pode ser considerada rotação. Prove algebricamente em qual situação.",
    parts: [
      { label: "A) Reflexão pela origem = R(180°)", build: partA },
      { label: "B) Duas reflexões = rotação", build: partB },
    ],
  });
})();
