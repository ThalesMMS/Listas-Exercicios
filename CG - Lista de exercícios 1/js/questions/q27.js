/*
 * q27.js — Cohen-Sutherland para o triângulo ABC (computacional).
 *
 * Triângulo A(-1,-3), B(-2,8), C(9,2) contra a janela padrão (-2..5, 1..6).
 * Uma aba por lado (AB, BC, CA) + "Visão geral". Cada aba anima o traço de
 * ALG.cohenSutherland: códigos -> recortes sucessivos -> aceitação/rejeição.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-4, 10, -5, 10];

  // Vértices do triângulo (números puros, para desenho de contexto).
  var TRI = {
    A: { x: -1, y: -3 },
    B: { x: -2, y: 8 },
    C: { x: 9, y: 2 },
  };

  // Desenha a janela de recorte (retângulo destacado).
  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  // Triângulo inteiro esmaecido ao fundo (referência visual).
  function drawTriangle(plane, highlight) {
    plane.polygon([TRI.A, TRI.B, TRI.C], {
      stroke: "rgba(120,140,170,0.35)",
      fill: false,
      lineWidth: 1,
      dashed: [4, 4],
    });
    ["A", "B", "C"].forEach(function (k) {
      var on = highlight && highlight.indexOf(k) !== -1;
      plane.point(TRI[k].x, TRI[k].y, {
        color: on ? COL.purple : "rgba(120,140,170,0.5)",
        radius: on ? 4 : 3,
        label: k,
        labelColor: on ? COL.ink : COL.muted,
      });
    });
  }

  // Marca um extremo (frações do ALG) com rótulo opcional.
  function drawCodedPoint(plane, p, opts) {
    opts = opts || {};
    var x = ALG.nx(p),
      y = ALG.ny(p);
    plane.point(x, y, {
      color: opts.color || COL.accent,
      radius: 5,
      ring: opts.ring,
    });
    if (opts.label) {
      plane.text(x, y, opts.label, {
        align: opts.align || "left",
        color: opts.color || COL.ink,
        font: "bold 12px ui-sans-serif, system-ui",
        dx: opts.dx == null ? 9 : opts.dx,
        dy: opts.dy == null ? -6 : opts.dy,
      });
    }
  }

  // Destaca uma das 4 fronteiras da janela (linha grossa amarela).
  function drawEdge(plane, edge) {
    var B = ALG.BITS;
    var a, b;
    if (edge & B.TOP) {
      a = { x: W.xmin, y: W.ymax };
      b = { x: W.xmax, y: W.ymax };
    } else if (edge & B.BOTTOM) {
      a = { x: W.xmin, y: W.ymin };
      b = { x: W.xmax, y: W.ymin };
    } else if (edge & B.RIGHT) {
      a = { x: W.xmax, y: W.ymin };
      b = { x: W.xmax, y: W.ymax };
    } else {
      a = { x: W.xmin, y: W.ymin };
      b = { x: W.xmin, y: W.ymax };
    }
    plane.segment(a, b, { color: COL.yellow, lineWidth: 3 });
  }

  // Constrói os passos animados para um lado do triângulo.
  function buildSide(label, p0name, p1name) {
    return {
      label: label,
      build: function () {
        var p0 = ALG.P(TRI[p0name].x, TRI[p0name].y);
        var p1 = ALG.P(TRI[p1name].x, TRI[p1name].y);
        var run = ALG.cohenSutherland(p0, p1, W);
        var steps = [];
        var hl = [p0name, p1name];

        var seg0 = { x: TRI[p0name].x, y: TRI[p0name].y };
        var seg1 = { x: TRI[p1name].x, y: TRI[p1name].y };

        function bg(plane) {
          drawWindow(plane);
          drawTriangle(plane, hl);
          plane.segment(seg0, seg1, { color: "rgba(120,140,170,0.45)", lineWidth: 1.5, dashed: [5, 4] });
        }

        run.steps.forEach(function (s) {
          if (s.type === "codes") {
            steps.push({
              titulo: "Códigos dos extremos " + p0name + " e " + p1name,
              explicacao:
                "<p>O lado <b>" + label + "</b> vai de <b>" + p0name + ALG.plabel(s.a) + "</b> a <b>" +
                p1name + ALG.plabel(s.b) + "</b>. Calculamos o código de região (4 bits <span class='muted'>TBRL</span>) de cada extremo:</p>" +
                "<div class='formula'>" + p0name + " " + ALG.plabel(s.a) + " → " + ALG.codeBits(s.ca) +
                "  (" + ALG.codeNames(s.ca) + ")\n" +
                p1name + " " + ALG.plabel(s.b) + " → " + ALG.codeBits(s.cb) +
                "  (" + ALG.codeNames(s.cb) + ")</div>" +
                "<p>Nenhum extremo tem código <span class='ok'>0000</span> e não há rejeição trivial imediata, então o segmento precisa ser recortado fronteira a fronteira.</p>",
              draw: function (plane) {
                bg(plane);
                plane.segment(s.a, s.b, { color: COL.accent, lineWidth: 2 });
                drawCodedPoint(plane, s.a, { color: COL.orange, label: p0name + " " + ALG.codeBits(s.ca) });
                drawCodedPoint(plane, s.b, { color: COL.orange, label: p1name + " " + ALG.codeBits(s.cb), dy: 16 });
              },
            });
          } else if (s.type === "clip") {
            var newCode = s.which === "a" ? s.ca : s.cb;
            steps.push({
              titulo: "Recorte em " + s.edgeName + " (" + ALG.codeNames(s.edge) + ")",
              explicacao:
                "<p>O extremo <span class='no'>" + ALG.plabel(s.from) + "</span> está fora pela fronteira <b>" +
                ALG.codeNames(s.edge) + "</b>. Calculamos a interseção do segmento com <b>" + s.edgeName + "</b>:</p>" +
                "<div class='formula'>" + ALG.plabel(s.from) + "  recorta em  " + s.edgeName +
                "\n→ novo ponto " + ALG.plabel(s.to) + "</div>" +
                "<p>O ponto antigo é descartado e substituído pela interseção <span class='ok'>" + ALG.plabel(s.to) +
                "</span>. Recalculamos seu código: <span class='hl'>" + ALG.codeBits(newCode) +
                "</span> (" + ALG.codeNames(newCode) + ").</p>",
              draw: function (plane) {
                bg(plane);
                plane.segment(s.a, s.b, { color: COL.accent, lineWidth: 2 });
                drawEdge(plane, s.edge);
                drawCodedPoint(plane, s.from, { color: COL.red, ring: COL.red, label: ALG.plabel(s.from) });
                drawCodedPoint(plane, s.to, {
                  color: COL.green,
                  ring: COL.green,
                  label: ALG.plabel(s.to) + " → " + ALG.codeBits(newCode),
                  dy: 16,
                });
              },
            });
          } else if (s.type === "accept") {
            steps.push({
              titulo: "Aceitação trivial — lado visível",
              explicacao:
                "<p>Os dois extremos agora têm código <span class='ok'>0000</span>:</p>" +
                "<div class='formula'>c1 = 0000  e  c2 = 0000  →  aceitação trivial</div>" +
                "<p>O trecho <b>visível</b> de " + label + " vai de <span class='ok'>" + ALG.plabel(s.a) +
                "</span> a <span class='ok'>" + ALG.plabel(s.b) + "</span>.</p>",
              draw: function (plane) {
                bg(plane);
                plane.segment(s.a, s.b, { color: COL.green, lineWidth: 3 });
                drawCodedPoint(plane, s.a, { color: COL.green, ring: COL.green, label: ALG.plabel(s.a) });
                drawCodedPoint(plane, s.b, { color: COL.green, ring: COL.green, label: ALG.plabel(s.b), dy: 16 });
              },
            });
          } else if (s.type === "reject") {
            steps.push({
              titulo: "Rejeição trivial — lado descartado",
              explicacao:
                "<p>Após o recorte, os extremos compartilham um bit externo:</p>" +
                "<div class='formula'>c1 & c2 = " + ALG.codeBits(s.ca & s.cb) + " ≠ 0  →  rejeição trivial</div>" +
                "<p>Ambos ficam <b>" + ALG.codeNames(s.ca & s.cb) + "</b> da janela; o segmento " + label +
                " não cruza a área visível e é <span class='no'>descartado</span>.</p>",
              draw: function (plane) {
                bg(plane);
                plane.segment(s.a, s.b, { color: COL.red, lineWidth: 2, dashed: [6, 5] });
                drawCodedPoint(plane, s.a, { color: COL.red, ring: COL.red, label: ALG.plabel(s.a) + " " + ALG.codeBits(s.ca) });
                drawCodedPoint(plane, s.b, { color: COL.red, ring: COL.red, label: ALG.plabel(s.b) + " " + ALG.codeBits(s.cb), dy: 16 });
              },
            });
          }
        });

        steps.forEach(function (st) {
          st.bounds = BOUNDS;
        });
        return steps;
      },
    };
  }

  // Aba "Visão geral": triângulo + janela + trechos visíveis de cada lado.
  function buildOverview() {
    return {
      label: "Visão geral",
      build: function () {
        var ab = ALG.cohenSutherland(ALG.P(TRI.A.x, TRI.A.y), ALG.P(TRI.B.x, TRI.B.y), W);
        var bc = ALG.cohenSutherland(ALG.P(TRI.B.x, TRI.B.y), ALG.P(TRI.C.x, TRI.C.y), W);

        function drawVisible(plane, run, color) {
          if (run.accepted) {
            plane.segment(run.a, run.b, { color: color, lineWidth: 3 });
            plane.point(ALG.nx(run.a), ALG.ny(run.a), { color: color, radius: 4 });
            plane.point(ALG.nx(run.b), ALG.ny(run.b), { color: color, radius: 4 });
          }
        }

        function base(plane) {
          drawWindow(plane);
          drawTriangle(plane, ["A", "B", "C"]);
        }

        return [
          {
            titulo: "Triângulo ABC e a janela de recorte",
            explicacao:
              "<p>Vértices do triângulo:</p>" +
              "<div class='coordlist'>" +
              "<span class='coord'>A(-1, -3)</span><span class='coord'>B(-2, 8)</span><span class='coord'>C(9, 2)</span>" +
              "</div>" +
              "<p>Janela: <b>-2 ≤ x ≤ 5</b>, <b>1 ≤ y ≤ 6</b>. Nenhum vértice está dentro:</p>" +
              "<div class='formula'>A → 0100 (abaixo)\nB → 1000 (acima)\nC → 0010 (direita)</div>" +
              "<p>Cada lado é recortado de forma independente nas abas <b>AB</b>, <b>BC</b> e <b>CA</b>.</p>",
            bounds: BOUNDS,
            draw: function (plane) {
              base(plane);
              plane.point(TRI.A.x, TRI.A.y, { color: COL.purple, radius: 4, label: "A 0100", labelColor: COL.ink });
              plane.point(TRI.B.x, TRI.B.y, { color: COL.purple, radius: 4, label: "B 1000", labelColor: COL.ink });
              plane.point(TRI.C.x, TRI.C.y, { color: COL.purple, radius: 4, label: "C 0010", labelColor: COL.ink });
            },
          },
          {
            titulo: "Trechos visíveis dos lados aceitos",
            explicacao:
              "<p>Resultado de cada lado:</p>" +
              "<div class='formula'>" +
              "AB visível: (-15/11, 1) → (-20/11, 6)   ✓\n" +
              "BC visível: (5/3, 6)  → (5, 46/11)      ✓\n" +
              "CA rejeitado (C recortado p/ (5,0), ainda abaixo)  ✗</div>" +
              "<p>Em destaque, as partes do contorno do triângulo que efetivamente aparecem dentro da janela. O lado <span class='no'>CA</span> é descartado por inteiro.</p>",
            bounds: BOUNDS,
            draw: function (plane) {
              base(plane);
              drawVisible(plane, ab, COL.green);
              drawVisible(plane, bc, COL.cyan);
              plane.point(5, 0, { color: COL.red, radius: 4, ring: COL.red, label: "(5,0) descartado", labelColor: COL.red, labelDy: 16 });
              plane.text(W.xmin + 0.2, W.ymax - 0.5, "AB", { color: COL.green, font: "bold 12px ui-sans-serif" });
              plane.text(W.xmax - 1.3, W.ymax - 0.5, "BC", { color: COL.cyan, font: "bold 12px ui-sans-serif" });
            },
          },
        ];
      },
    };
  }

  window.GUI.register({
    id: 27,
    num: "27",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "Cohen-Sutherland no triângulo ABC",
    type: "computacional",
    hubDesc: "Recorte lado a lado: AB e BC visíveis, CA rejeitado.",
    enunciado:
      "Aplique o algoritmo de Cohen-Sutherland para recortar o triângulo de vértices A(-1,-3), B(-2,8) e C(9,2) pela janela -2 ≤ x ≤ 5, 1 ≤ y ≤ 6. Para cada lado, determine os códigos, as interseções e o trecho visível (ou a rejeição).",
    parts: [
      buildSide("AB", "A", "B"),
      buildSide("BC", "B", "C"),
      buildSide("CA", "C", "A"),
      buildOverview(),
    ],
  });
})();
