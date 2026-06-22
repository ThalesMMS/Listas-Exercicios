/*
 * q24.js — "O ponto inicial pode ser atualizado mais de uma vez. Exemplifique."
 * (conceitual)
 *
 * Exemplo pedagógico: o segmento (0,2)→(8,10) é orientado como
 * A=(8,10), B=(0,2) para mostrar o ponto inicial sendo atualizado duas vezes.
 * Usamos uma ordem local direita→topo só nesta questão, sem alterar
 * ALG.cohenSutherland.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}
  var BOUNDS = [-4, 11, -5, 9];

  var OUT = { x: 8, y: 10 };
  var IN = { x: 0, y: 2 };

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

  function rightFirstTrace(pa, pb) {
    var B = ALG.BITS;
    var a = ALG.P(pa.x, pa.y);
    var b = ALG.P(pb.x, pb.y);
    var ca = ALG.outCode(a, W);
    var cb = ALG.outCode(b, W);
    var steps = [{ type: "codes", a: a, b: b, ca: ca, cb: cb }];
    var guard = 0;

    while (guard++ < 8) {
      if ((ca | cb) === 0) {
        steps.push({ type: "accept", a: a, b: b, ca: ca, cb: cb });
        return steps;
      }
      if ((ca & cb) !== 0) {
        steps.push({ type: "reject", a: a, b: b, ca: ca, cb: cb });
        return steps;
      }

      var edge = ca & B.RIGHT ? B.RIGHT : ca & B.TOP ? B.TOP : ca & B.BOTTOM ? B.BOTTOM : B.LEFT;
      var old = a;
      a = ALG.intersect(a, b, edge, W);
      ca = ALG.outCode(a, W);
      steps.push({ type: "clip", edge: edge, from: old, to: a, a: a, b: b, ca: ca, cb: cb });
    }

    return steps;
  }

  // Segmento original esmaecido + extremo fixo.
  function bg(plane) {
    drawWindow(plane);
    plane.segment(IN, OUT, { color: "rgba(120,140,170,0.45)", lineWidth: 1.5, dashed: [5, 4] });
    plane.point(IN.x, IN.y, { color: COL.purple, radius: 4, label: "(0,2) 0000", labelColor: COL.ink, labelDy: 16 });
  }

  var steps = rightFirstTrace(OUT, IN);
  var codesStep = steps[0];
  var firstClip = steps[1];  // direita: (8,10) -> (5,7)
  var secondClip = steps[2]; // topo: (5,7) -> (4,6)
  var acceptStep = steps[3];

  window.GUI.register({
    id: 24,
    num: "24",
    section: "IV) Recorte — Cohen-Sutherland",
    title: "O ponto inicial pode ser atualizado mais de uma vez",
    type: "conceitual",
    hubDesc: "Um extremo fora por 2 fronteiras é recortado em etapas: (8,10)→(5,7)→(4,6).",
    enunciado:
      "O ponto inicial pode ser atualizado mais de uma vez. Exemplifique.",
    parts: [
      {
        label: "Explicação + exemplo",
        build: function () {
          return [
            {
              titulo: "Sim: um ponto pode estar fora por mais de uma fronteira",
              explicacao:
                "<p>O código de região tem <b>até dois bits ligados</b> ao mesmo tempo (um canto). Por exemplo, um ponto pode estar <b>acima E à direita</b> da janela.</p>" +
                "<p>Cada iteração do Cohen-Sutherland corrige <span class='hl'>apenas uma fronteira</span>: move o extremo para a interseção com aquela aresta e <b>recalcula o código</b>. Se o novo ponto continuar fora por outro lado, ele será <span class='hl'>atualizado de novo</span>.</p>" +
                "<p class='muted'>Por isso o mesmo ponto inicial pode ser substituído várias vezes antes de o algoritmo aceitar ou rejeitar o segmento.</p>",
            },
            {
	              titulo: "Exemplo — códigos iniciais",
	              explicacao:
	                "<p>Tomamos o segmento pedido <b>(0,2) → (8,10)</b>, contra a janela <b>-2 ≤ x ≤ 5</b>, <b>1 ≤ y ≤ 6</b>.</p>" +
	                "<p>Para mostrar o <b>ponto inicial</b> sendo atualizado, orientamos o cálculo como <b>A=(8,10)</b> e <b>B=(0,2)</b>:</p>" +
	                "<div class='formula'>A(8,10) → " + ALG.codeBits(codesStep.ca) + "  (" + ALG.codeNames(codesStep.ca) + ")\n" +
	                "B(0,2)  → " + ALG.codeBits(codesStep.cb) + "  (" + ALG.codeNames(codesStep.cb) + ")</div>" +
	                "<p>A está fora pela <span class='hl'>direita</span> e <span class='hl'>acima</span>. O exemplo recorta primeiro pela direita.</p>",
	              bounds: BOUNDS,
	              draw: function (plane) {
	                bg(plane);
	                plane.point(OUT.x, OUT.y, { color: COL.orange, radius: 5, ring: COL.orange, label: "(8,10) " + ALG.codeBits(codesStep.ca), labelColor: COL.orange });
	              },
	            },
	            {
	              titulo: "1ª atualização — recorte na direita",
	              explicacao:
	                "<p>A está fora pela <b>direita</b>, então recortamos na fronteira <b>x = 5</b>:</p>" +
	                "<div class='formula'>(8,10) recorta em x=5\n→ novo ponto " + ALG.plabel(firstClip.to) + "</div>" +
	                "<p>O ponto antigo (8,10) é descartado. Recalculamos o código do novo ponto:</p>" +
	                "<div class='formula'>" + ALG.plabel(firstClip.to) + " → " + ALG.codeBits(firstClip.ca) + "  (" + ALG.codeNames(firstClip.ca) + ")</div>" +
	                "<p>Atenção: o novo ponto <span class='no'>ainda não está dentro</span> — ele continua <b>acima</b> da janela.</p>",
	              bounds: BOUNDS,
	              draw: function (plane) {
	                bg(plane);
	                drawEdge(plane, firstClip.edge);
	                // ponto antigo descartado
	                plane.point(OUT.x, OUT.y, { color: COL.red, radius: 5, ring: COL.red, label: "(8,10) descartado", labelColor: COL.red });
	                // novo ponto inicial
	                plane.point(ALG.nx(firstClip.to), ALG.ny(firstClip.to), {
	                  color: COL.green, radius: 5, ring: COL.green,
	                  label: ALG.plabel(firstClip.to) + " → " + ALG.codeBits(firstClip.ca), labelColor: COL.green, labelDy: 16,
	                });
	              },
	            },
	            {
	              titulo: "2ª atualização — recorte no topo",
	              explicacao:
	                "<p>Como " + ALG.plabel(firstClip.to) + " ainda está <b>acima</b>, o mesmo ponto inicial é atualizado de novo, agora na fronteira <b>y = 6</b>:</p>" +
	                "<div class='formula'>" + ALG.plabel(firstClip.to) + " recorta em y=6\n→ novo ponto " + ALG.plabel(secondClip.to) + "</div>" +
	                "<p>Recalculando o código:</p>" +
	                "<div class='formula'>" + ALG.plabel(secondClip.to) + " → " + ALG.codeBits(secondClip.ca) + "  (" + ALG.codeNames(secondClip.ca) + ")</div>" +
	                "<p>Agora os dois extremos estão dentro:</p>" +
	                "<div class='formula'>" + ALG.codeBits(acceptStep.ca) + " | " + ALG.codeBits(acceptStep.cb) + " = 0000  →  aceitação</div>",
	              bounds: BOUNDS,
	              draw: function (plane) {
	                bg(plane);
	                drawEdge(plane, secondClip.edge);
	                plane.segment(secondClip.to, IN, { color: COL.green, lineWidth: 3 });
	                plane.point(ALG.nx(firstClip.to), ALG.ny(firstClip.to), {
	                  color: COL.red, radius: 4.5, ring: COL.red,
	                  label: ALG.plabel(firstClip.to) + " descartado", labelColor: COL.red, labelDy: 16,
	                });
	                plane.point(ALG.nx(secondClip.to), ALG.ny(secondClip.to), {
	                  color: COL.green, radius: 6, ring: COL.green,
	                  label: ALG.plabel(secondClip.to) + " " + ALG.codeBits(secondClip.ca), labelColor: COL.green,
	                });
	                plane.point(IN.x, IN.y, { color: COL.green, radius: 5, ring: COL.green });
	              },
	            },
          ];
        },
      },
    ],
  });
})();
