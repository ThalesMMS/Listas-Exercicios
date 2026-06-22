/*
 * demo-progressive-svg.js — Exemplo neutro de diagrama SVG revelado por etapas.
 *
 * Mantem um unico desenho estavel e altera a opacidade de grupos para mostrar
 * uma sequencia: entrada -> validacao -> preparo -> saida.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  var NODES = [
    { key: "input", label: "Entrada", x: 100, y: 120 },
    { key: "check", label: "Validacao", x: 270, y: 120 },
    { key: "work", label: "Preparo", x: 440, y: 120 },
    { key: "output", label: "Saida", x: 610, y: 120 },
  ];

  function isOn(active, key) {
    return active === "all" || active.indexOf(key) >= 0;
  }

  function group(svg, active, key) {
    var g = svg.group({});
    g.setAttribute("opacity", isOn(active, key) ? "1" : "0.16");
    return g;
  }

  function drawNode(svg, parent, node, opts) {
    opts = opts || {};
    svg.rect(node.x - 64, node.y - 34, 128, 68, {
      parent: parent,
      fill: opts.fill || "var(--bg-soft)",
      stroke: opts.stroke || "var(--border)",
      strokeWidth: opts.strokeWidth || 2,
      rx: 10,
    });
    svg.text(node.x, node.y, node.label, {
      parent: parent,
      size: 14,
      weight: 700,
      color: opts.color || "var(--ink)",
    });
  }

  function drawPipeline(svg, active) {
    svg.view(720, 300);
    svg.text(360, 42, "Fluxo com grupos SVG revelados por passo", {
      size: 14,
      color: "var(--ink-dim)",
    });

    for (var i = 0; i < NODES.length - 1; i++) {
      var from = NODES[i];
      var to = NODES[i + 1];
      var key = from.key + "-" + to.key;
      var gEdge = group(svg, active, key);
      svg.arrow(from.x + 72, from.y, to.x - 72, to.y, {
        parent: gEdge,
        color: isOn(active, key) ? "var(--accent)" : "var(--ink-mute)",
        strokeWidth: 2.5,
        head: 11,
      });
    }

    NODES.forEach(function (node) {
      var gNode = group(svg, active, node.key);
      var hot = isOn(active, node.key);
      drawNode(svg, gNode, node, {
        fill: hot ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: hot ? "var(--accent)" : "var(--border)",
        color: hot ? "var(--accent)" : "var(--ink)",
      });
    });

    var gResult = group(svg, active, "result");
    svg.rect(226, 210, 268, 46, {
      parent: gResult,
      fill: "var(--green-soft)",
      stroke: "var(--green)",
      strokeWidth: 2,
      rx: 8,
    });
    svg.text(360, 233, "O layout nao muda; so a enfase muda.", {
      parent: gResult,
      size: 13,
      color: "var(--green)",
      weight: 700,
    });
  }

  function visual(active) {
    return { type: "svg", draw: function (svg) { drawPipeline(svg, active); } };
  }

  function build() {
    return [
      S.concept({
        title: "Um unico diagrama, varias leituras",
        body:
          "<p>Este exemplo usa um <b>SVG estavel</b>: todos os grupos existem em todos os passos, " +
          "mas alguns ficam com baixa opacidade.</p>" +
          "<p>Use este padrao quando a posicao dos elementos deve permanecer fixa enquanto a explicacao avanca.</p>",
        visual: visual(["input"]),
      }),
      {
        title: "Entrada",
        body: "<p>O primeiro passo destaca somente o ponto inicial do fluxo.</p>",
        visual: visual(["input"]),
      },
      {
        title: "Validacao",
        body:
          "<p>Revele o proximo bloco e a aresta que o conecta ao anterior. O aluno percebe continuidade sem redesenho brusco.</p>",
        visual: visual(["input", "input-check", "check"]),
      },
      {
        title: "Preparo",
        body:
          "<p>O terceiro bloco entra com a mesma estrutura visual, mantendo o alinhamento geral do diagrama.</p>",
        visual: visual(["input", "input-check", "check", "check-work", "work"]),
      },
      {
        title: "Saida",
        body:
          "<p>Com todos os blocos visiveis, o diagrama mostra o fluxo completo e preserva o contexto acumulado.</p>",
        visual: visual(["input", "input-check", "check", "check-work", "work", "work-output", "output"]),
      },
      {
        title: "Resumo",
        body:
          "<p>Para criar uma revelacao progressiva, separe o desenho em grupos e controle quais chaves ficam em destaque por passo.</p>",
        visual: visual("all"),
      },
    ];
  }

  EX.registry.add({
    id: "demo-progressive-svg",
    num: "SVG+",
    subject: "Demonstrações das superfícies",
    section: "SVG",
    title: "Diagrama SVG progressivo",
    type: "conceitual",
    hubDesc: "Um diagrama neutro com grupos revelados sem mudar o layout.",
    statement: "Demonstra como revelar partes de um SVG por etapas mantendo a composicao estavel.",
    parts: [{ label: "Demonstração", build: build }],
  });
})();
