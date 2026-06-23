/*
 * q34.js — Sutherland-Hodgman para o triângulo ABC (computacional).
 *
 * Anima o recorte de um polígono pela janela de visualização, uma fronteira
 * por vez (esquerda → direita → inferior → superior). A cada passo mostra a
 * RETA da fronteira ativa, o polígono ANTES (esmaecido) e DEPOIS (preenchido),
 * e a lista de vértices resultante.
 *
 * Toda a visualização é dirigida pelo TRAÇO de ALG.sutherlandHodgman — os
 * números nunca são escritos à mão.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2, xmax:5, ymin:1, ymax:6}

  // Triângulo de entrada (sentido horário, igual ao gabarito).
  var TRI = [ALG.P(-1, -3), ALG.P(-2, 8), ALG.P(9, 2)];

  var BOUNDS = [-4, 10, -5, 10];

  // Converte uma lista de pontos-com-frações em pares numéricos para desenhar.
  function toXY(poly) {
    return poly.map(function (p) {
      return [ALG.nx(p), ALG.ny(p)];
    });
  }

  // Lista de coordenadas em HTML (frações exatas via ALG.plabel).
  function coordList(poly, cls) {
    cls = cls || "coord accent";
    return (
      "<div class='coordlist'>" +
      poly
        .map(function (p) {
          return "<span class='" + cls + "'>" + ALG.plabel(p) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  // Desenha a janela de recorte (retângulo de referência).
  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  // Estende a reta de uma fronteira por toda a área visível e a destaca.
  function drawEdgeLine(plane, edge) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.strokeStyle = COL.orange;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    if (edge === "left") {
      ctx.moveTo(plane.cx(W.xmin), plane.cy(BOUNDS[3]));
      ctx.lineTo(plane.cx(W.xmin), plane.cy(BOUNDS[2]));
    } else if (edge === "right") {
      ctx.moveTo(plane.cx(W.xmax), plane.cy(BOUNDS[3]));
      ctx.lineTo(plane.cx(W.xmax), plane.cy(BOUNDS[2]));
    } else if (edge === "bottom") {
      ctx.moveTo(plane.cx(BOUNDS[0]), plane.cy(W.ymin));
      ctx.lineTo(plane.cx(BOUNDS[1]), plane.cy(W.ymin));
    } else {
      ctx.moveTo(plane.cx(BOUNDS[0]), plane.cy(W.ymax));
      ctx.lineTo(plane.cx(BOUNDS[1]), plane.cy(W.ymax));
    }
    ctx.stroke();
    ctx.restore();
  }

  // Equação textual da reta de cada fronteira.
  function edgeEq(edge) {
    if (edge === "left") return "x = " + W.xmin;
    if (edge === "right") return "x = " + W.xmax;
    if (edge === "bottom") return "y = " + W.ymin;
    return "y = " + W.ymax;
  }
  // Critério "manter dentro" de cada fronteira.
  function edgeKeep(edge) {
    if (edge === "left") return "x ≥ " + W.xmin;
    if (edge === "right") return "x ≤ " + W.xmax;
    if (edge === "bottom") return "y ≥ " + W.ymin;
    return "y ≤ " + W.ymax;
  }

  // Um ponto está exatamente sobre a reta da fronteira ativa?
  function onEdgeLine(p, edge) {
    if (edge === "left") return p.x.eqInt(W.xmin);
    if (edge === "right") return p.x.eqInt(W.xmax);
    if (edge === "bottom") return p.y.eqInt(W.ymin);
    return p.y.eqInt(W.ymax);
  }

  // Desenha um polígono (lista de pontos-com-frações).
  function drawPoly(plane, poly, opts) {
    opts = opts || {};
    if (!poly.length) return;
    plane.polygon(toXY(poly), {
      stroke: opts.stroke,
      fill: opts.fill,
      lineWidth: opts.lineWidth || 2,
      dashed: opts.dashed,
    });
    if (opts.dots) {
      poly.forEach(function (p) {
        plane.point(ALG.nx(p), ALG.ny(p), {
          color: opts.dotColor || opts.stroke,
          radius: opts.dotRadius || 3.5,
        });
      });
    }
  }

  window.GUI.register({
    id: 34,
    num: "34",
    section: "IV) Recorte — Sutherland-Hodgman",
    title: "Sutherland-Hodgman para o triângulo ABC",
    type: "computacional",
    hubDesc: "Recorte progressivo do triângulo pelas 4 fronteiras → 5 vértices.",
    enunciado:
      "Aplique o algoritmo de Sutherland-Hodgman para recortar o triângulo A(−1,−3), B(−2,8), C(9,2) contra a janela " +
      "[xmin=−2, xmax=5, ymin=1, ymax=6], usando a ordem esquerda → direita → inferior → superior.",
    parts: [
      {
        label: "Recorte do triângulo",
        build: function () {
          var run = ALG.sutherlandHodgman(TRI, W);
          var trace = run.steps;
          var steps = [];

          // ----- Passo inicial: triângulo + janela -----
          var initStep = trace[0]; // type "init"
          var labelOf = { 0: "A", 1: "B", 2: "C" };
          steps.push({
            titulo: "Triângulo de entrada e janela",
            explicacao:
              "<p>O algoritmo recorta um <b>polígono inteiro</b> (não apenas segmentos isolados) " +
              "contra a janela, produzindo uma nova <b>lista de vértices</b> que descreve só a parte interna.</p>" +
              "<p>Triângulo de entrada (sentido horário):</p>" +
              coordList(initStep.poly, "coord accent") +
              "<p>A janela de recorte é <span class='hl'>[−2, 5] × [1, 6]</span>. Recortaremos por uma " +
              "fronteira de cada vez, na ordem <b>esquerda → direita → inferior → superior</b>; " +
              "a saída de cada etapa é a entrada da seguinte.</p>",
            bounds: BOUNDS,
            draw: function (plane) {
              drawWindow(plane);
              drawPoly(plane, initStep.poly, {
                stroke: COL.accent,
                fill: "rgba(78,161,255,0.10)",
                lineWidth: 2,
              });
              initStep.poly.forEach(function (p, i) {
                plane.point(ALG.nx(p), ALG.ny(p), {
                  color: COL.accent,
                  radius: 4,
                  label: labelOf[i] + ALG.plabel(p),
                  labelColor: COL.ink,
                });
              });
            },
          });

          // ----- Um passo por fronteira (type "clip") -----
          var ordinal = ["1ª", "2ª", "3ª", "4ª"];
          for (var k = 1; k < trace.length; k++) {
            (function (k) {
              var st = trace[k]; // {edge,label,before,poly,text}
              var before = st.before;
              var after = st.poly;
              var idx = k - 1;

              // Vértices novos = os que estão exatamente sobre a fronteira ativa.
              var onEdge = after.filter(function (p) {
                return onEdgeLine(p, st.edge);
              });
              var newHtml = onEdge.length
                ? "<p>Interseções geradas em <b>" +
                  edgeEq(st.edge) +
                  "</b>:</p>" +
                  coordList(onEdge, "coord green")
                : "<p class='muted'>Nenhum cruzamento nesta fronteira: a lista passa inalterada.</p>";

              steps.push({
                titulo:
                  ordinal[idx] +
                  " fronteira — " +
                  st.label.charAt(0).toUpperCase() +
                  st.label.slice(1),
                explicacao:
                  "<p>Mantemos os vértices com <span class='hl'>" +
                  edgeKeep(st.edge) +
                  "</span> e, onde uma aresta cruza a reta <b>" +
                  edgeEq(st.edge) +
                  "</b>, inserimos a interseção.</p>" +
                  "<p>Entrada desta etapa <span class='muted'>(contorno tracejado)</span>:</p>" +
                  coordList(before, "coord") +
                  newHtml +
                  "<p>Lista após este recorte:</p>" +
                  coordList(after, "coord accent"),
                bounds: BOUNDS,
                draw: function (plane) {
                  drawWindow(plane);
                  // Polígono ANTES (esmaecido, tracejado).
                  drawPoly(plane, before, {
                    stroke: "rgba(120,140,170,0.55)",
                    lineWidth: 1.5,
                    dashed: [5, 4],
                  });
                  // Reta da fronteira ativa em destaque.
                  drawEdgeLine(plane, st.edge);
                  // Polígono DEPOIS (preenchido com accentSoft).
                  drawPoly(plane, after, {
                    stroke: COL.accent,
                    fill: COL.accentSoft,
                    lineWidth: 2.5,
                    dots: true,
                    dotColor: COL.accent,
                    dotRadius: 3.5,
                  });
                  // Destaca as interseções novas sobre a fronteira (verde com anel).
                  onEdge.forEach(function (p) {
                    plane.point(ALG.nx(p), ALG.ny(p), {
                      color: COL.green,
                      radius: 5,
                      ring: COL.ink,
                    });
                  });
                },
              });
            })(k);
          }

          // ----- Passo final: polígono recortado -----
          var result = run.result;
          steps.push({
            titulo: "Polígono recortado — resultado",
            explicacao:
              "<p>Após as quatro fronteiras, a lista final de <b>" +
              result.length +
              " vértices</b> descreve exatamente a parte do triângulo dentro da janela:</p>" +
              coordList(result, "coord green") +
              "<p>Os vértices originais que ficaram fora foram substituídos por interseções com as " +
              "fronteiras; nenhum ponto interno foi perdido.</p>",
            bounds: BOUNDS,
            draw: function (plane) {
              drawWindow(plane);
              // Triângulo original esmaecido, para comparação.
              drawPoly(plane, TRI, {
                stroke: "rgba(120,140,170,0.45)",
                lineWidth: 1.5,
                dashed: [5, 4],
              });
              // Resultado preenchido em verde.
              drawPoly(plane, result, {
                stroke: COL.green,
                fill: COL.greenSoft,
                lineWidth: 2.5,
                dots: true,
                dotColor: COL.green,
                dotRadius: 4,
              });
            },
          });

          return steps;
        },
      },
    ],
  });
})();
