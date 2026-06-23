/*
 * q21.js — "A ordem dos recortes altera o resultado final?" (conceitual)
 *
 * Resposta (gabarito): para uma janela retangular CONVEXA o resultado
 * geométrico final NÃO muda; só mudam pontos/listas intermediários e eventuais
 * arredondamentos. Demonstramos com um segmento que cruza duas fronteiras
 * (topo e direita): recortar topo→direita ou direita→topo chega ao MESMO ponto.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-4, 10, -1, 12];

  // Segmento de exemplo: de dentro (0,2) até o canto superior-direito (8,10).
  var P0 = ALG.P(0, 2);
  var P1 = ALG.P(8, 10);
  var ITOP = ALG.intersect(P0, P1, ALG.BITS.TOP, W); // (4,6) — interseção final
  var IRIGHT = ALG.intersect(P0, P1, ALG.BITS.RIGHT, W); // (5,7) — intermediária

  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  function drawEdge(plane, edge) {
    var B = ALG.BITS;
    var a, b;
    if (edge & B.TOP) {
      a = { x: W.xmin, y: W.ymax };
      b = { x: W.xmax, y: W.ymax };
    } else {
      a = { x: W.xmax, y: W.ymin };
      b = { x: W.xmax, y: W.ymax };
    }
    plane.segment(a, b, { color: COL.yellow, lineWidth: 3 });
  }

  function bg(plane) {
    drawWindow(plane);
    plane.segment(P0, P1, { color: "rgba(120,140,170,0.45)", lineWidth: 1.5, dashed: [5, 4] });
    plane.point(ALG.nx(P0), ALG.ny(P0), { color: COL.purple, radius: 4, label: "P0(0,2) dentro", labelColor: COL.ink });
    plane.point(ALG.nx(P1), ALG.ny(P1), { color: "rgba(120,140,170,0.7)", radius: 4, label: "P1(8,10) 1010", labelColor: COL.muted });
  }

  window.GUI.register({
    id: 21,
    num: "21",
    section: "IV) Recorte",
    title: "A ordem dos recortes altera o resultado final?",
    type: "conceitual",
    hubDesc: "Janela convexa: a região final é a mesma; só mudam os passos intermediários.",
    enunciado:
      "A ordem dos recortes altera o resultado final? Explique.",
    parts: [
      {
        label: "Explicação + demonstração",
        build: function () {
          return [
            {
              titulo: "Resposta curta: não, para janela convexa",
              explicacao:
                "<p>Para uma <b>janela retangular</b> (convexa), a <span class='ok'>região final visível é sempre a mesma</span>, qualquer que seja a ordem em que as fronteiras são aplicadas.</p>" +
                "<p>O que pode mudar:</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ o resultado geométrico final é idêntico</div>" +
                "<div class='con'>- a sequência de pontos / interseções intermediárias muda</div>" +
                "<div class='con'>- em aritmética de ponto flutuante, pode haver pequenas diferenças de arredondamento</div>" +
                "</div>",
            },
            {
              titulo: "Por quê: cada fronteira é uma restrição independente",
              explicacao:
                "<p>Uma janela retangular é a <b>interseção de 4 semiplanos</b>:</p>" +
                "<div class='formula'>x ≥ xmin   ∧   x ≤ xmax   ∧   y ≥ ymin   ∧   y ≤ ymax</div>" +
                "<p>A interseção de conjuntos <b>não depende da ordem</b> (é comutativa e associativa). Aplicar as 4 restrições, em qualquer ordem, produz exatamente o mesmo conjunto de pontos visíveis.</p>" +
                "<p class='muted'>Isso vale porque a janela é convexa. Para um recortador de polígono côncavo, a ordem pode, sim, afetar artefatos intermediários.</p>",
            },
            {
              titulo: "Exemplo — o segmento cruza topo e direita",
              explicacao:
                "<p>Segmento de <b>P0(0,2)</b> (dentro) até <b>P1(8,10)</b>, cujo código é <span class='hl'>1010</span> (acima e à direita). Ele ultrapassa <b>duas</b> fronteiras: topo (y=6) e direita (x=5).</p>" +
                "<p>As duas interseções possíveis com as fronteiras são:</p>" +
                "<div class='formula'>com y=6 (topo)   → " + ALG.plabel(ITOP) + "\ncom x=5 (direita)→ " + ALG.plabel(IRIGHT) + "</div>" +
                "<p>Vamos recortar nas duas ordens e comparar o ponto final.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                plane.point(ALG.nx(ITOP), ALG.ny(ITOP), { color: COL.green, radius: 4, label: ALG.plabel(ITOP), labelColor: COL.green });
                plane.point(ALG.nx(IRIGHT), ALG.ny(IRIGHT), { color: COL.orange, radius: 4, label: ALG.plabel(IRIGHT), labelColor: COL.orange });
              },
            },
            {
              titulo: "Ordem A — topo primeiro",
              explicacao:
                "<p>Recortando primeiro pela fronteira <b>superior (y=6)</b>:</p>" +
                "<div class='formula'>P1(8,10)  recorta em y=6  → " + ALG.plabel(ITOP) + "\ncódigo de " + ALG.plabel(ITOP) + " = 0000 (dentro)</div>" +
                "<p>O ponto já cai <span class='ok'>dentro</span> da janela em um único passo. O trecho visível vai de <b>P0(0,2)</b> a <span class='ok'>" + ALG.plabel(ITOP) + "</span>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                drawEdge(plane, ALG.BITS.TOP);
                plane.segment(P0, ITOP, { color: COL.green, lineWidth: 3 });
                plane.point(ALG.nx(ITOP), ALG.ny(ITOP), { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(ITOP) + " ✓", labelColor: COL.green });
              },
            },
            {
              titulo: "Ordem B — direita primeiro",
              explicacao:
                "<p>Recortando primeiro pela fronteira <b>direita (x=5)</b>:</p>" +
                "<div class='formula'>passo 1: P1(8,10) recorta em x=5 → " + ALG.plabel(IRIGHT) + "  (código 1000, ainda acima)\n" +
                "passo 2: " + ALG.plabel(IRIGHT) + " recorta em y=6 → " + ALG.plabel(ITOP) + "  (0000, dentro)</div>" +
                "<p>Aqui foram <b>dois</b> passos e surgiu um ponto intermediário <span class='hl'>" + ALG.plabel(IRIGHT) + "</span> que não apareceu na ordem A. Mas o ponto final é <span class='ok'>" + ALG.plabel(ITOP) + "</span> — o <b>mesmo de antes</b>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                drawEdge(plane, ALG.BITS.RIGHT);
                // passo intermediário
                plane.point(ALG.nx(IRIGHT), ALG.ny(IRIGHT), { color: COL.orange, radius: 5, ring: COL.orange, label: ALG.plabel(IRIGHT) + " (intermediário)", labelColor: COL.orange });
                plane.segment(P0, ITOP, { color: COL.green, lineWidth: 3 });
                plane.point(ALG.nx(ITOP), ALG.ny(ITOP), { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(ITOP) + " ✓", labelColor: COL.green, labelDy: 16 });
              },
            },
            {
              titulo: "Conclusão — mesmo resultado final",
              explicacao:
                "<p>As duas ordens chegaram ao mesmo trecho visível:</p>" +
                "<div class='formula'>P0(0,2) → " + ALG.plabel(ITOP) + "   (idêntico nas duas ordens)</div>" +
                "<p>Mudou apenas o <span class='muted'>caminho</span>: a ordem B passou pelo ponto intermediário " + ALG.plabel(IRIGHT) +
                ", a ordem A não. Como a janela é convexa, o <span class='ok'>resultado geométrico final independe da ordem dos recortes</span>.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                bg(plane);
                plane.segment(P0, ITOP, { color: COL.green, lineWidth: 3 });
                plane.point(ALG.nx(ITOP), ALG.ny(ITOP), { color: COL.green, radius: 5, ring: COL.green, label: ALG.plabel(ITOP), labelColor: COL.green });
                plane.point(ALG.nx(IRIGHT), ALG.ny(IRIGHT), { color: "rgba(255,159,67,0.5)", radius: 4, label: "(só na ordem B)", labelColor: COL.muted });
              },
            },
          ];
        },
      },
    ],
  });
})();
