/*
 * q05.js — Transformações de um triângulo A(−1,−3), B(−2,8), C(9,2). (computacional)
 * 5 partes (a–e): T, R(−30°), R(60°) em B, S(0.5,3), reflexão no eixo x.
 * Usa as matrizes homogêneas de ALG (rotações em decimais, arredondadas a 2 casas).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var TRI = [{ x: -1, y: -3 }, { x: -2, y: 8 }, { x: 9, y: 2 }];
  var NAMES = ["A", "B", "C"];

  function fmt(p) { return "(" + ALG.round2(p.x) + ", " + ALG.round2(p.y) + ")"; }
  function drawTri(plane, pts, color, dashed, suffix) {
    plane.polygon(pts, { stroke: color, lineWidth: 2, dashed: dashed ? [5, 4] : false });
    pts.forEach(function (p, i) {
      plane.point(p.x, p.y, { color: color, radius: 4, label: NAMES[i] + suffix, labelColor: color });
    });
  }

  function makePart(label, opts) {
    return {
      label: label,
      build: function () {
        var out = ALG.applyToPolygon(opts.M, TRI);
        var all = TRI.concat(out);
        if (opts.pivot) all = all.concat([opts.pivot]);
        var xs = all.map(function (p) { return p.x; }), ys = all.map(function (p) { return p.y; });
        var B = [Math.floor(Math.min.apply(null, xs)) - 2, Math.ceil(Math.max.apply(null, xs)) + 2,
                 Math.floor(Math.min.apply(null, ys)) - 2, Math.ceil(Math.max.apply(null, ys)) + 2];

        function pivot(plane) {
          if (!opts.pivot) return;
          plane.point(opts.pivot.x, opts.pivot.y, { color: COL.orange, radius: 5, ring: COL.ink, label: opts.pivotLabel || "pivô", labelColor: COL.orange });
        }

        return [
          {
            titulo: "Matriz da transformação",
            explicacao:
              "<p>" + opts.intro + "</p><div class='formula'>" + opts.matrixHtml + "</div>",
            bounds: B,
            draw: function (plane) {
              if (opts.mirrorAxis) plane.segment([B[0], 0], [B[1], 0], { color: COL.orange, lineWidth: 2 });
              drawTri(plane, TRI, COL.muted, true, "");
              pivot(plane);
            },
          },
          {
            titulo: "Aplicando aos vértices",
            explicacao:
              "<div class='formula'>" + opts.ruleHtml + "</div>" +
              "<div class='coordlist'>" + out.map(function (p, i) {
                return "<span class='coord accent'>" + NAMES[i] + "' = " + fmt(p) + "</span>";
              }).join("") + "</div>",
            bounds: B,
            draw: function (plane) {
              if (opts.mirrorAxis) plane.segment([B[0], 0], [B[1], 0], { color: COL.orange, lineWidth: 2 });
              drawTri(plane, TRI, COL.muted, true, "");
              drawTri(plane, out, COL.accent, false, "'");
              pivot(plane);
            },
          },
          {
            titulo: "Resultado",
            explicacao:
              "<p>Triângulo transformado:</p><div class='coordlist'>" +
              out.map(function (p, i) { return "<span class='coord green'>" + NAMES[i] + "' = " + fmt(p) + "</span>"; }).join("") +
              "</div>" + (opts.note ? "<p class='muted'>" + opts.note + "</p>" : ""),
            bounds: B,
            draw: function (plane) {
              if (opts.mirrorAxis) plane.segment([B[0], 0], [B[1], 0], { color: COL.orange, lineWidth: 2 });
              drawTri(plane, TRI, COL.muted, true, "");
              drawTri(plane, out, COL.green, false, "'");
              pivot(plane);
            },
          },
        ];
      },
    };
  }

  window.GUI.register({
    id: 5,
    num: "5",
    section: "I) Transformações Geométricas",
    title: "Transformações de um triângulo",
    type: "computacional",
    hubDesc: "T, R(−30°), R(60°) em B, S(0.5,3) e reflexão em x aplicadas ao triângulo ABC.",
    enunciado:
      "Suponha um triângulo com as coordenadas A(−1,−3), B(−2,8) e C(9,2). Calcule cada uma das " +
      "seguintes transformações a partir da posição original: (a) T(−1,5); (b) R(−30°); " +
      "(c) R(60°) com o ponto B fixo; (d) S(0.5, 3); (e) reflexão em relação ao eixo x.",
    parts: [
      makePart("a) T(−1, 5)", {
        intro: "Translação por (−1, 5): soma direta às coordenadas.",
        matrixHtml: "T(−1, 5) =\n[ 1  0  −1 ]\n[ 0  1   5 ]\n[ 0  0   1 ]",
        ruleHtml: "(x, y) → (x − 1, y + 5)",
        M: ALG.mTranslate(-1, 5),
      }),
      makePart("b) R(−30°)", {
        intro: "Rotação de −30° em torno da origem.",
        matrixHtml: "R(−30°) =\n[ cos(−30°)  −sin(−30°)  0 ]   [  0.87  0.50  0 ]\n[ sin(−30°)   cos(−30°)  0 ] = [ −0.50  0.87  0 ]\n[    0           0       1 ]   [  0     0     1 ]",
        ruleHtml: "x' = x·cos(−30°) − y·sin(−30°)\ny' = x·sin(−30°) + y·cos(−30°)",
        M: ALG.mRotateDeg(-30),
        pivot: { x: 0, y: 0 }, pivotLabel: "origem",
      }),
      makePart("c) R(60°) em B", {
        intro: "Rotação de 60° com o ponto B(−2, 8) fixo: leva B à origem, gira e volta.",
        matrixHtml: "M = T(B) · R(60°) · T(−B)\nB = (−2, 8),  cos60° = 0.5,  sin60° = 0.87",
        ruleHtml: "1) T(−B): subtrai B\n2) R(60°): gira\n3) T(B): soma B de volta",
        M: ALG.matCompose([ALG.mTranslate(2, -8), ALG.mRotateDeg(60), ALG.mTranslate(-2, 8)]),
        pivot: { x: -2, y: 8 }, pivotLabel: "B (fixo)",
        note: "B permanece em (−2, 8): é o ponto fixo da rotação.",
      }),
      makePart("d) S(0.5, 3)", {
        intro: "Escala (0.5, 3) em torno da origem.",
        matrixHtml: "S(0.5, 3) =\n[ 0.5  0  0 ]\n[ 0    3  0 ]\n[ 0    0  1 ]",
        ruleHtml: "(x, y) → (0.5·x, 3·y)",
        M: ALG.mScale(0.5, 3),
        note: "A escala em torno da origem também afasta o triângulo da origem (ver questão 3).",
      }),
      makePart("e) Reflexão no eixo x", {
        intro: "Reflexão em relação ao eixo x: espelha o sinal de y.",
        matrixHtml: "Refl_x =\n[ 1   0  0 ]\n[ 0  −1  0 ]\n[ 0   0  1 ]",
        ruleHtml: "(x, y) → (x, −y)",
        M: ALG.mReflectX(),
        mirrorAxis: true,
        note: "O eixo x (laranja) é a reta-espelho.",
      }),
    ],
  });
})();
