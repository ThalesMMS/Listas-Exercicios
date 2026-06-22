/*
 * q22.js — Por que os códigos 3 e 7 não aparecem no mapeamento? (conceitual)
 *
 * Serve de TEMPLATE para as questões conceituais: slides progressivos com
 * um diagrama ilustrativo (mapa de regiões do Cohen-Sutherland).
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;
  var W = window.ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}

  // Mapa das 9 regiões do Cohen-Sutherland com seus códigos.
  var REGIONS = [
    { zx: -1, zy: 1, bits: "1001", dec: 9, name: "T,L" },
    { zx: 0, zy: 1, bits: "1000", dec: 8, name: "T" },
    { zx: 1, zy: 1, bits: "1010", dec: 10, name: "T,R" },
    { zx: -1, zy: 0, bits: "0001", dec: 1, name: "L" },
    { zx: 0, zy: 0, bits: "0000", dec: 0, name: "dentro" },
    { zx: 1, zy: 0, bits: "0010", dec: 2, name: "R" },
    { zx: -1, zy: -1, bits: "0101", dec: 5, name: "B,L" },
    { zx: 0, zy: -1, bits: "0100", dec: 4, name: "B" },
    { zx: 1, zy: -1, bits: "0110", dec: 6, name: "B,R" },
  ];

  function labelXY(zx, zy) {
    var x = zx < 0 ? W.xmin - 2.6 : zx > 0 ? W.xmax + 2.6 : (W.xmin + W.xmax) / 2;
    var y = zy < 0 ? W.ymin - 2.7 : zy > 0 ? W.ymax + 1.9 : (W.ymin + W.ymax) / 2;
    return { x: x, y: y };
  }

  var MAP_BOUNDS = [-7, 10, -4, 11]; // declarado em cada passo via step.bounds

  function drawRegionMap(plane, opts) {
    opts = opts || {};
    // Janela
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.10)",
      stroke: COL.accent,
      lineWidth: 2,
    });
    // Linhas das fronteiras estendidas
    var ctx = plane.ctx;
    ctx.save();
    ctx.strokeStyle = "rgba(120,140,170,0.25)";
    ctx.setLineDash([5, 5]);
    [W.xmin, W.xmax].forEach(function (x) {
      ctx.beginPath();
      ctx.moveTo(plane.cx(x), plane.cy(-3));
      ctx.lineTo(plane.cx(x), plane.cy(11));
      ctx.stroke();
    });
    [W.ymin, W.ymax].forEach(function (y) {
      ctx.beginPath();
      ctx.moveTo(plane.cx(-7), plane.cy(y));
      ctx.lineTo(plane.cx(10), plane.cy(y));
      ctx.stroke();
    });
    ctx.restore();

    REGIONS.forEach(function (r) {
      var c = labelXY(r.zx, r.zy);
      var inside = r.dec === 0;
      plane.text(c.x, c.y - 0.15, r.bits, {
        align: "center",
        color: inside ? COL.green : COL.accent,
        font: "bold 14px " + "ui-monospace, monospace",
      });
      plane.text(c.x, c.y + 0.95, inside ? "(dentro)" : "dec " + r.dec, {
        align: "center",
        color: COL.ink_dim || "#9fb0cc",
        font: "11px ui-sans-serif, system-ui",
      });
    });

    if (opts.showExclusion) {
      // Setas/realce indicando L e R mutuamente exclusivos
      plane.text((W.xmin + W.xmax) / 2, 10.2, "T e B nunca juntos (↕)", {
        align: "center",
        color: COL.orange,
        font: "12px ui-sans-serif, system-ui",
      });
      plane.text((W.xmin + W.xmax) / 2, -2.4, "L e R nunca juntos (↔)", {
        align: "center",
        color: COL.orange,
        font: "12px ui-sans-serif, system-ui",
      });
    }
  }

  window.GUI.register({
    id: 22,
    num: "22",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "Por que os códigos 3 e 7 não aparecem?",
    type: "conceitual",
    hubDesc: "Combinações impossíveis no código de região (L e R juntos).",
    enunciado:
      "Por que os códigos 3 e 7 não são considerados no mapeamento das áreas externas à área de visualização?",
    parts: [
      {
        label: "Explicação",
        build: function (plane) {
          return [
            {
              titulo: "O código de região tem 4 bits",
              explicacao:
                "<p>Cohen-Sutherland classifica cada ponto por um código de 4 bits, um por fronteira:</p>" +
                "<div class='formula'>T  B  R  L\n8  4  2  1   (decimal de cada bit)</div>" +
                "<p>O ponto recebe <b>1</b> no bit da fronteira que ele ultrapassa. Dentro da janela, o código é <span class='ok'>0000</span>.</p>",
              bounds: MAP_BOUNDS,
              draw: function (plane) {
                drawRegionMap(plane, {});
              },
            },
            {
              titulo: "As 9 regiões válidas",
              explicacao:
                "<p>Ao redor da janela existem exatamente <b>9 regiões</b>: a interna (0000) e 8 externas.</p>" +
                "<p>Os códigos externos possíveis são: <span class='coord'>1</span><span class='coord'>2</span>" +
                "<span class='coord'>4</span><span class='coord'>8</span> (uma fronteira) e " +
                "<span class='coord'>5</span><span class='coord'>6</span><span class='coord'>9</span>" +
                "<span class='coord'>10</span> (canto = duas fronteiras adjacentes).</p>",
              bounds: MAP_BOUNDS,
              draw: function (plane) {
                drawRegionMap(plane, {});
              },
            },
            {
              titulo: "Combinações impossíveis",
              explicacao:
                "<p>Um ponto não pode estar <b>à esquerda E à direita</b> ao mesmo tempo (a janela tem largura positiva), nem <b>abaixo E acima</b> ao mesmo tempo.</p>" +
                "<p>Logo, qualquer código que ligue <span class='hl'>L e R juntos</span> ou <span class='hl'>T e B juntos</span> é geometricamente impossível.</p>",
              bounds: MAP_BOUNDS,
              draw: function (plane) {
                drawRegionMap(plane, { showExclusion: true });
              },
            },
            {
              titulo: "Por isso 3 e 7 não existem",
              explicacao:
                "<div class='formula'>3 = 0011 = R + L   ✗ (esquerda E direita)\n7 = 0111 = B + R + L ✗ (inclui L e R)</div>" +
                "<p>Ambos exigem os bits <b>L</b> e <b>R</b> simultaneamente — situação que não ocorre.</p>" +
                "<p class='muted'>Pelo mesmo motivo também não aparecem 11, 12, 13, 14 e 15. O enunciado destaca 3 e 7 por serem os menores códigos impossíveis.</p>",
              bounds: MAP_BOUNDS,
              draw: function (plane) {
                drawRegionMap(plane, { showExclusion: true });
              },
            },
          ];
        },
      },
    ],
  });
})();
