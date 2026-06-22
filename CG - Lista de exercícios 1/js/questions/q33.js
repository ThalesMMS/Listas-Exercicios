/*
 * q33.js — Critérios de atualização da lista de vértices (conceitual).
 *
 * Para cada aresta S→P, o que entra na nova lista depende de S e P estarem
 * dentro ou fora em relação à fronteira ativa. Diagrama dos 4 casos contra
 * uma fronteira vertical (x = xlim), com o lado "dentro" sombreado.
 */
(function () {
  "use strict";
  var COL = window.CartesianPlane.COLORS;

  var BOUNDS = [-1, 9, -1, 9];
  var XLIM = 5; // reta da fronteira (dentro = x ≤ XLIM, à esquerda)

  // Cada caso é desenhado num "quadrante" do diagrama (deslocamento vertical).
  // S e P em coordenadas locais; xIn/xOut definem se cada ponto está dentro.
  var XIN = 3.0; // x de um ponto dentro
  var XOUT = 7.0; // x de um ponto fora

  // Interseção de S→P com a reta vertical x = XLIM (linear simples p/ desenho).
  function interX(s, p) {
    var t = (XLIM - s[0]) / (p[0] - s[0]);
    return [XLIM, s[1] + t * (p[1] - s[1])];
  }

  function drawBoundary(plane) {
    var ctx = plane.ctx;
    // Lado "dentro" (x ≤ XLIM) levemente sombreado.
    plane.regionFill(BOUNDS[0], XLIM, BOUNDS[2], BOUNDS[3], "rgba(78,161,255,0.06)");
    ctx.save();
    ctx.strokeStyle = COL.accent;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(plane.cx(XLIM), plane.cy(BOUNDS[2]));
    ctx.lineTo(plane.cx(XLIM), plane.cy(BOUNDS[3]));
    ctx.stroke();
    ctx.restore();
    plane.text(XLIM - 0.15, BOUNDS[3] - 0.2, "dentro", {
      align: "right",
      color: COL.accent,
      font: "12px ui-sans-serif, system-ui",
    });
    plane.text(XLIM + 0.15, BOUNDS[3] - 0.2, "fora", {
      align: "left",
      color: COL.muted,
      font: "12px ui-sans-serif, system-ui",
    });
  }

  // Desenha um caso S→P; `added` lista os pontos que entram na lista.
  function drawCase(plane, s, p, kind) {
    // Aresta S→P.
    plane.segment(s, p, { color: "rgba(120,140,170,0.7)", lineWidth: 2 });
    var sIn = s[0] <= XLIM;
    var pIn = p[0] <= XLIM;
    // S (origem da aresta).
    plane.point(s[0], s[1], {
      color: sIn ? COL.green : COL.red,
      radius: 5,
      label: "S",
      labelColor: COL.ink,
      labelDx: -14,
      labelDy: 4,
    });
    // P (ponto atual): destaca se entra na lista.
    var pEnters = kind === "in-in" || kind === "out-in";
    plane.point(p[0], p[1], {
      color: pIn ? COL.green : COL.red,
      radius: 5,
      ring: pEnters ? COL.yellow : null,
      label: "P",
      labelColor: COL.ink,
      labelDx: 8,
      labelDy: 4,
    });
    // Interseção, quando a aresta cruza a fronteira.
    if (kind === "in-out" || kind === "out-in") {
      var I = interX(s, p);
      plane.point(I[0], I[1], { color: COL.yellow, radius: 5, ring: COL.ink });
      plane.text(I[0] + 0.2, I[1] - 0.25, "I", {
        color: COL.yellow,
        font: "bold 12px ui-sans-serif, system-ui",
      });
    }
  }

  window.GUI.register({
    id: 33,
    num: "33",
    section: "IV) Recorte — Sutherland-Hodgman",
    title: "Critérios de atualização da lista de vértices",
    type: "conceitual",
    hubDesc: "Os 4 casos S→P: dentro/fora decidem o que entra na nova lista.",
    enunciado:
      "Explique os critérios de atualização da lista de vértices no algoritmo de Sutherland-Hodgman.",
    parts: [
      {
        label: "Os 4 casos",
        build: function () {
          return [
            {
              titulo: "Percorrer arestas como pares S → P",
              explicacao:
                "<p>Para cada fronteira da janela, o algoritmo percorre as arestas do polígono. " +
                "Cada aresta é um par <b>S → P</b>: <b>S</b> é o vértice anterior e <b>P</b> é o vértice atual.</p>" +
                "<p>O que entra na nova lista depende apenas de <span class='hl'>cada um deles estar " +
                "dentro ou fora</span> em relação à reta da fronteira. São <b>4 casos</b>.</p>" +
                "<p class='muted'>No diagrama, o lado esquerdo (x ≤ " +
                XLIM +
                ") é o lado <i>dentro</i>; verde = dentro, vermelho = fora, " +
                "amarelo = interseção (I).</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawBoundary(plane);
              },
            },
            {
              titulo: "Caso 1 — S dentro, P dentro → adiciona P",
              explicacao:
                "<p>A aresta inteira está do lado de dentro. O contorno continua interno, então basta " +
                "<b>adicionar P</b> à lista (S já entrou na aresta anterior).</p>" +
                "<table class='q-table'>" +
                "<tr><th>S</th><th>P</th><th>Entra na lista</th></tr>" +
                "<tr class='active'><td>dentro</td><td>dentro</td><td><span class='ok'>P</span></td></tr>" +
                "</table>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawBoundary(plane);
                drawCase(plane, [XIN, 2], [XIN - 0.6, 7], "in-in");
              },
            },
            {
              titulo: "Caso 2 — S dentro, P fora → adiciona a interseção",
              explicacao:
                "<p>A aresta <b>sai</b> da janela. O trecho visível vai de S até onde a aresta cruza a " +
                "fronteira, então adiciona-se <b>apenas a interseção I</b> (P é descartado).</p>" +
                "<table class='q-table'>" +
                "<tr><th>S</th><th>P</th><th>Entra na lista</th></tr>" +
                "<tr class='active'><td>dentro</td><td>fora</td><td><span class='hl'>I</span></td></tr>" +
                "</table>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawBoundary(plane);
                drawCase(plane, [XIN, 2], [XOUT, 7], "in-out");
              },
            },
            {
              titulo: "Caso 3 — S fora, P dentro → adiciona interseção e P",
              explicacao:
                "<p>A aresta <b>entra</b> na janela. O contorno visível reaparece na interseção e segue " +
                "até P, então adicionam-se <b>a interseção I e depois P</b> (nesta ordem).</p>" +
                "<table class='q-table'>" +
                "<tr><th>S</th><th>P</th><th>Entra na lista</th></tr>" +
                "<tr class='active'><td>fora</td><td>dentro</td><td><span class='hl'>I</span>, <span class='ok'>P</span></td></tr>" +
                "</table>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawBoundary(plane);
                drawCase(plane, [XOUT, 2], [XIN, 7], "out-in");
              },
            },
            {
              titulo: "Caso 4 — S fora, P fora → não adiciona nada",
              explicacao:
                "<p>A aresta inteira está fora da janela. Nada do trecho é visível por esta fronteira, " +
                "então <b>nenhum vértice é adicionado</b>.</p>" +
                "<table class='q-table'>" +
                "<tr><th>S</th><th>P</th><th>Entra na lista</th></tr>" +
                "<tr class='active'><td>fora</td><td>fora</td><td><span class='no'>—</span></td></tr>" +
                "</table>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawBoundary(plane);
                drawCase(plane, [XOUT, 2], [XOUT + 0.6, 7], "out-out");
              },
            },
            {
              titulo: "Resumo dos critérios",
              explicacao:
                "<p>Para cada aresta S → P, considerando se S e P estão dentro ou fora da fronteira:</p>" +
                "<div class='formula'>S dentro,  P dentro  →  adiciona P\n" +
                "S dentro,  P fora    →  adiciona a interseção\n" +
                "S fora,    P dentro  →  adiciona a interseção e P\n" +
                "S fora,    P fora    →  não adiciona nada</div>" +
                "<p>Esse processo é <b>repetido para cada fronteira</b> da janela: a lista de saída de " +
                "uma fronteira vira a lista de entrada da próxima.</p>",
              // sem draw: passo textual ocupa a largura toda
            },
          ];
        },
      },
    ],
  });
})();
