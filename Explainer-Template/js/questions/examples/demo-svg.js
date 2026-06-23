/*
 * demo-svg.js — Demonstra a SUPERFÍCIE DE SVG (diagramas de nós/arestas).
 * Aqui desenhamos uma árvore "na mão" com primitivos; na fase B há um
 * componente EX.Diagram.tree que automatiza o layout.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // nó -> posição (em unidades de view 600x360)
  var POS = {
    A: [300, 50],
    B: [160, 160],
    C: [440, 160],
    D: [90, 280],
    E: [230, 280],
  };
  var EDGES = [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"]];

  function drawTree(svg, shownNodes, activePath) {
    svg.view(600, 360);
    var shown = {};
    shownNodes.forEach(function (n) {
      shown[n] = true;
    });
    var active = {};
    (activePath || []).forEach(function (n) {
      active[n] = true;
    });
    // arestas primeiro
    EDGES.forEach(function (e) {
      if (shown[e[0]] && shown[e[1]]) {
        var a = POS[e[0]],
          b = POS[e[1]];
        var on = active[e[0]] && active[e[1]];
        svg.line(a[0], a[1], b[0], b[1], {
          stroke: on ? "var(--yellow)" : "var(--ink-mute)",
          strokeWidth: on ? 3 : 2,
        });
      }
    });
    // nós
    Object.keys(POS).forEach(function (n) {
      if (!shown[n]) return;
      var p = POS[n];
      svg.circle(p[0], p[1], 24, {
        fill: "var(--bg-soft)",
        stroke: active[n] ? "var(--yellow)" : "var(--accent)",
        strokeWidth: active[n] ? 3 : 2,
      });
      svg.text(p[0], p[1], n, { weight: 700, size: 17 });
    });
  }

  function build() {
    return [
      {
        title: "Raiz",
        body: "<p>SVG usa <code>view(w, h)</code> e primitivos: <code>circle</code>, <code>line</code>, <code>text</code>, <code>arrow</code>.</p>",
        visual: { type: "svg", draw: function (svg) { drawTree(svg, ["A"]); } },
      },
      {
        title: "Primeiro nível",
        body: "<p>As arestas usam <code>var(--ink-mute)</code> — seguem o tema sozinhas.</p>",
        visual: { type: "svg", draw: function (svg) { drawTree(svg, ["A", "B", "C"]); } },
      },
      {
        title: "Árvore completa",
        body: "<p>Os nós são círculos com rótulo; o layout aqui é manual.</p>",
        visual: { type: "svg", draw: function (svg) { drawTree(svg, ["A", "B", "C", "D", "E"]); } },
      },
      {
        title: "Destacar um caminho",
        body: "<p>Caminho A → B → E destacado em amarelo (ótimo para busca/percursos).</p>",
        visual: {
          type: "svg",
          draw: function (svg) { drawTree(svg, ["A", "B", "C", "D", "E"], ["A", "B", "E"]); },
        },
      },
    ];
  }

  EX.registry.add({
    id: "demo-svg",
    num: "⌥",
    subject: "Demonstrações das superfícies",
    section: "SVG",
    title: "Diagrama de nós e arestas (svg)",
    type: "computacional",
    hubDesc: "Árvores, grafos, autômatos, fluxogramas, UML.",
    statement:
      "Demonstra a superfície de <strong>SVG</strong> (EX.SvgSurface). Ideal para árvores (sintática/busca), autômatos, fluxogramas e diagramas.",
    parts: [{ label: "Demo", build: build }],
  });
})();
