/*
 * demo-mixed.js — Mostra que UMA questão pode misturar superfícies por aba,
 * inclusive um passo só de texto (sem visual ocupa a largura toda).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var U = EX.util;

  function planePart() {
    return [
      {
        title: "Canvas nesta aba",
        body: "<p>Esta aba usa a superfície de canvas.</p>",
        visual: {
          type: "plane",
          bounds: [-5, 5, -5, 5],
          draw: function (plane) {
            plane.arrow([0, 0], [3, 2], { color: COL.accent });
            plane.arrow([0, 0], [-2, 3], { color: COL.green });
          },
        },
      },
    ];
  }
  function svgPart() {
    return [
      {
        title: "SVG nesta aba",
        body: "<p>Esta aba usa a superfície de SVG.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(400, 240);
            svg.rect(60, 90, 110, 60, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 2, rx: 8 });
            svg.text(115, 120, "início", {});
            svg.rect(240, 90, 110, 60, { fill: "var(--bg-soft)", stroke: "var(--green)", strokeWidth: 2, rx: 8 });
            svg.text(295, 120, "fim", {});
            svg.arrow(170, 120, 240, 120, { color: "var(--ink-mute)" });
          },
        },
      },
    ];
  }
  function domPart() {
    return [
      {
        title: "DOM nesta aba",
        body: "<p>Esta aba usa a superfície de DOM (HTML).</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            host.innerHTML =
              "<div class='ex-callout tip'><div class='ex-callout-title'>Dica</div>" +
              "Cada aba escolhe livremente sua superfície.</div>" +
              "<div class='ex-coordlist'><span class='ex-coord accent'>(1, 2)</span>" +
              "<span class='ex-coord green'>(3, 4)</span><span class='ex-coord'>(5, 6)</span></div>";
          },
        },
      },
    ];
  }
  function textPart() {
    return [
      {
        title: "Passo só de texto",
        body:
          "<p>Quando um passo não tem <code>visual</code> (ou usa <code>type:'none'</code>), a explicação ocupa a <b>largura toda</b> — ótimo para questões conceituais.</p>" +
          "<div class='formula'>sem visual  =>  coluna do visual recolhida</div>",
      },
    ];
  }

  EX.registry.add({
    id: "demo-mixed",
    num: "✶",
    subject: "Demonstrações das superfícies",
    section: "Misto",
    title: "Misturando superfícies por aba",
    type: "conceitual",
    hubDesc: "Canvas, SVG, DOM e texto na mesma questão.",
    statement: "Uma questão com várias partes, cada uma usando uma superfície diferente.",
    parts: [
      { label: "Canvas", build: planePart },
      { label: "SVG", build: svgPart },
      { label: "DOM", build: domPart },
      { label: "Só texto", build: textPart },
    ],
  });
})();
