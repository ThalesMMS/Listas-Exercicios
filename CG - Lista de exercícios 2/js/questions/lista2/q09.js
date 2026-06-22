/*
 * q09.js — Malhas Poligonais.
 * "Quando usar maior nível de granularidade na subdivisão de superfícies (High Poly)?"
 */
(function () {
  "use strict";
  var EX = window.EX;

  function ngon(svg, cx, cy, r, n, opts) {
    var pts = [];
    for (var k = 0; k < n; k++) {
      var a = -Math.PI / 2 + k * 2 * Math.PI / n;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    svg.polygon(pts, opts);
  }
  function lod(svg) {
    svg.view(470, 270);
    svg.circle(135, 135, 82, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1, dashed: true });
    ngon(svg, 135, 135, 82, 6, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 2 });
    svg.text(135, 240, "low poly (n=6) — facetado", { size: 12, color: "var(--ink-dim)" });
    svg.circle(335, 135, 82, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1, dashed: true });
    ngon(svg, 335, 135, 82, 28, { fill: "var(--bg-soft)", stroke: "var(--green)", strokeWidth: 2 });
    svg.text(335, 240, "high poly (n=28) — suave", { size: 12, color: "var(--ink-dim)" });
  }

  function build() {
    return [
      {
        title: "Granularidade = densidade de polígonos",
        body:
          "<p>Subdividir mais uma superfície (High Poly) aproxima melhor a forma ideal: a " +
          "<span class='hl'>silhueta</span> fica suave e cabem mais detalhes. O custo é mais " +
          "<b>memória</b> e <b>processamento</b>.</p>" +
          "<p>Compare a mesma esfera com poucos e com muitos lados (contorno tracejado = forma ideal):</p>",
        visual: { type: "svg", draw: lod },
      },
      {
        title: "Quando usar HIGH POLY",
        body:
          "<ul>" +
          "<li><b>Close-ups</b> e objetos \"herói\" — aparecem grandes na tela;</li>" +
          "<li><b>Superfícies orgânicas/curvas</b> — pele, rostos, panos (a silhueta denuncia facetas);</li>" +
          "<li><b>Baking</b> de mapas de <span class='accent'>normal/displacement</span>: esculpe-se em high poly e " +
          "assa-se o detalhe para uma versão low poly;</li>" +
          "<li><b>Renderização offline</b> (cinema/arquitetura), sem restrição de tempo real;</li>" +
          "<li>Quando há <b>deformação/subdivisão</b> futura que exige malha densa.</li>" +
          "</ul>",
        visual: { type: "svg", draw: lod },
      },
      EX.Slides.prosCons({
        title: "High poly × Low poly",
        intro: "<p>O trade-off central:</p>",
        items: [
          { name: "High poly", pros: ["silhueta e detalhe suaves", "fonte para baking de normal maps", "ideal para offline/close-up"], cons: ["mais memória e VRAM", "mais lento em tempo real", "arquivos maiores"] },
          { name: "Low poly", pros: ["leve e rápido (jogos/AR/VR)", "bom para objetos distantes"], cons: ["facetamento na silhueta", "depende de normal map para detalhe"] },
        ],
      }),
      EX.Slides.concept({
        title: "Na prática: LOD + normal maps",
        body:
          "<p>Em tempo real combina-se tudo: várias versões em <b>níveis de detalhe (LOD)</b> trocadas conforme a " +
          "distância, e um <b>normal map</b> assado do high poly que dá a <i>aparência</i> de detalhe sobre uma " +
          "malha low poly. Assim só se gasta granularidade <b>onde o olho percebe</b>.</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q09",
    num: "9",
    subject: "Malhas Poligonais",
    title: "Quando usar High Poly",
    type: "conceitual",
    hubDesc: "Close-ups, formas orgânicas, baking de normal maps e render offline.",
    statement: "Quando usar maior nível de granularidade na subdivisão de superfícies (High Poly)?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
