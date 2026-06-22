/*
 * q30.js — Por que u₁=0 e u₂=1 inicialmente? (conceitual)
 *
 * Slides: P(u)=P0+u(P1-P0) dá P0 em u=0 e P1 em u=1; logo o segmento completo
 * corresponde ao intervalo [0,1], que é o ponto de partida antes de qualquer
 * recorte. Texto conferido contra o gabarito (questão 30).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}

  var BOUNDS = [-4, 10, -5, 10];

  // Segmento de exemplo: A(-1,-3) -> B(-2,8) (lado AB da Q31).
  var P0 = ALG.P(-1, -3);
  var P1 = ALG.P(-2, 8);

  function ptAt(uN, uD) {
    var u = ALG.fr(uN, uD == null ? 1 : uD);
    var x = P0.x.add(u.mul(P1.x.sub(P0.x)));
    var y = P0.y.add(u.mul(P1.y.sub(P0.y)));
    return { fx: x, fy: y, x: x.num(), y: y.num() };
  }

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  // Segmento inteiro destacado (verde = intervalo [0,1] completo) com extremos
  // e, opcionalmente, o ponto médio u=1/2 como amostra do parâmetro.
  function drawSegment(plane, showMid) {
    drawWindow(plane);
    var a = ptAt(0),
      b = ptAt(1);
    plane.segment([a.x, a.y], [b.x, b.y], { color: COL.green, lineWidth: 4 });
    plane.point(a.x, a.y, {
      color: COL.green,
      radius: 6,
      ring: "#0f1623",
      label: "P(0) = P₀ = " + ALG.plabel(P0),
      labelColor: COL.ink,
      labelDy: 18,
    });
    plane.point(b.x, b.y, {
      color: COL.green,
      radius: 6,
      ring: "#0f1623",
      label: "P(1) = P₁ = " + ALG.plabel(P1),
      labelColor: COL.ink,
      labelDy: -10,
    });
    if (showMid) {
      var m = ptAt(1, 2);
      plane.point(m.x, m.y, {
        color: COL.yellow,
        radius: 5,
        ring: "#0f1623",
        label: "P(½) = " + ALG.plabel({ x: m.fx, y: m.fy }),
        labelColor: COL.yellow,
        labelDx: 10,
      });
    }
  }

  window.GUI.register({
    id: 30,
    num: "30",
    section: "IV) Recorte — Liang-Barsky",
    title: "Por que u₁=0 e u₂=1 inicialmente?",
    type: "conceitual",
    hubDesc: "P(0)=P₀ e P(1)=P₁: o segmento inteiro é o intervalo [0,1].",
    enunciado:
      "Os valores iniciais de u₁ e u₂ são 0 e 1, respectivamente. Mostre o porquê.",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "A equação paramétrica do segmento",
              explicacao:
                "<p>Liang-Barsky descreve cada ponto do segmento interpolando entre o início e o fim:</p>" +
                "<div class='formula'>P(u) = P₀ + u·(P₁ − P₀)</div>" +
                "<p>O parâmetro <span class='hl'>u</span> é uma porcentagem do caminho de P₀ a P₁. Vamos avaliar os dois extremos.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawSegment(plane, false);
              },
            },
            {
              titulo: "Em u = 0 obtemos P₀",
              explicacao:
                "<p>Substituindo <code>u = 0</code>:</p>" +
                "<div class='formula'>P(0) = P₀ + 0·(P₁ − P₀) = P₀ = " +
                ALG.plabel(P0) +
                "</div>" +
                "<p>Ou seja, <span class='ok'>u = 0</span> corresponde exatamente ao ponto inicial.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawSegment(plane, false);
              },
            },
            {
              titulo: "Em u = 1 obtemos P₁",
              explicacao:
                "<p>Substituindo <code>u = 1</code>:</p>" +
                "<div class='formula'>P(1) = P₀ + 1·(P₁ − P₀) = P₁ = " +
                ALG.plabel(P1) +
                "</div>" +
                "<p>Logo, <span class='ok'>u = 1</span> corresponde ao ponto final. Valores intermediários (ex.: <span class='hl'>u = ½</span>) caem entre os dois.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawSegment(plane, true);
              },
            },
            {
              titulo: "Logo, o segmento inteiro é o intervalo [0,1]",
              explicacao:
                "<p>Antes de qualquer recorte, todo o segmento está disponível. Como ele vai de P(0)=P₀ a P(1)=P₁, o intervalo completo é:</p>" +
                "<div class='formula'>0 ≤ u ≤ 1</div>" +
                "<p>Por isso o algoritmo parte de <span class='ok'>u₁ = 0</span> e <span class='ok'>u₂ = 1</span> e, fronteira a fronteira, vai apenas <b>estreitando</b> esse intervalo (u₁ sobe nas entradas, u₂ desce nas saídas).</p>" +
                "<p class='muted'>Se em algum momento u₁ ultrapassar u₂, o intervalo fica vazio e o segmento é rejeitado.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawSegment(plane, false);
              },
            },
          ];
        },
      },
    ],
  });
})();
