/*
 * q08.js — Malhas Poligonais.
 * "Quando usar malhas quadrangulares e quando usar malhas triangulares?"
 */
(function () {
  "use strict";
  var EX = window.EX;

  function quadGrid(svg, ox, oy, cols, rows, cell, loop) {
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      svg.rect(ox + i * cell, oy + j * cell, cell, cell, {
        fill: loop != null && i === loop ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: "var(--ink-dim)", strokeWidth: 1.2,
      });
    }
  }
  function triGrid(svg, ox, oy, cols, rows, cell) {
    quadGrid(svg, ox, oy, cols, rows, cell, null);
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      svg.line(ox + i * cell, oy + j * cell, ox + (i + 1) * cell, oy + (j + 1) * cell, { stroke: "var(--ink-dim)", strokeWidth: 1 });
    }
  }
  function both(svg) {
    svg.view(470, 250);
    quadGrid(svg, 40, 60, 4, 3, 44, null);
    svg.text(128, 48, "quadrangular", { size: 13, color: "var(--accent)", weight: 700 });
    triGrid(svg, 260, 60, 4, 3, 44);
    svg.text(348, 48, "triangular", { size: 13, color: "var(--green)", weight: 700 });
  }
  function quadLoop(svg) {
    svg.view(470, 250);
    quadGrid(svg, 130, 50, 4, 4, 44, 1);
    svg.text(240, 232, "edge loop (anel de arestas)", { size: 12, color: "var(--accent)" });
  }
  function tri(svg) {
    svg.view(470, 250);
    triGrid(svg, 130, 50, 4, 4, 44);
    svg.text(240, 232, "todo polígono é plano e não-ambíguo", { size: 12, color: "var(--green)" });
  }

  function build() {
    return [
      {
        title: "Duas formas de teselar uma superfície",
        body:
          "<p>Uma malha aproxima uma superfície por polígonos. Os mais usados são <b>quadriláteros (quads)</b> " +
          "e <b>triângulos (tris)</b>. A escolha depende da <b>etapa</b> e do <b>uso</b>.</p>" +
          "<p>Ideia central: <span class='hl'>modela-se em quads</span>, <span class='hl'>renderiza-se em triângulos</span>.</p>",
        visual: { type: "svg", draw: both },
      },
      EX.Slides.comparison({
        title: "Quadrangular × Triangular",
        intro: "<p>Critérios lado a lado:</p>",
        headers: ["Critério", "Quadrangular", "Triangular"],
        rows: [
          ["Subdivisão (Catmull-Clark)", "ideal — segue edge loops", "menos natural"],
          ["Deformação / animação", "dobra de forma previsível", "pode \"pinçar\""],
	          ["Rasterização / GPU", "normalmente é triangulado", "primitiva fundamental do pipeline"],
          ["Planaridade", "4 pontos podem não ser coplanares", "sempre plano"],
          ["Topologia arbitrária", "exige cuidado", "qualquer superfície"],
        ],
      }),
      {
        title: "Quando usar QUADRANGULAR",
        body:
          "<ul>" +
          "<li><b>Modelagem base</b> e escultura — topologia limpa;</li>" +
          "<li><b>Superfícies de subdivisão</b> (Catmull-Clark) — os <span class='accent'>edge loops</span> guiam o fluxo;</li>" +
          "<li><b>Animação/deformação</b> de personagens — as dobras seguem os anéis de arestas;</li>" +
          "<li>Quando você quer <b>retopologia</b> previsível.</li>" +
          "</ul>",
        visual: { type: "svg", draw: quadLoop },
      },
      {
        title: "Quando usar TRIANGULAR",
        body:
          "<ul>" +
          "<li><b>Renderização em tempo real</b> (GPU) e exportação para motores/engines;</li>" +
          "<li>Garantia de <b>planaridade</b> — 3 pontos são sempre coplanares (sem ambiguidade de normal);</li>" +
          "<li><b>Superfícies arbitrárias</b>, varreduras de dados (LIDAR), <i>marching cubes</i>;</li>" +
          "<li><b>Simulação</b> e métodos numéricos (FEM) em geometria irregular.</li>" +
          "</ul>",
        visual: { type: "svg", draw: tri },
      },
      EX.Slides.concept({
        title: "Na prática",
        body:
          "<p>O fluxo comum: <b>modelar e animar em quads</b> (topologia limpa, subdivisão e deformação) e, " +
	          "na exportação para a <b>GPU</b>, <b>triangular</b> tudo, porque os pipelines gráficos normalmente rasterizam triângulos como primitiva fundamental.</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q08",
    num: "8",
    subject: "Malhas Poligonais",
    title: "Malhas quadrangulares × triangulares",
    type: "conceitual",
    hubDesc: "Quads para modelar/subdividir/animar; triângulos para a GPU e planaridade.",
    statement: "Quando usar malhas quadrangulares e quando usar malhas triangulares?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
