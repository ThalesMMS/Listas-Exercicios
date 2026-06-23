/*
 * q12.js — Sombreamento Phong × Gouraud.
 * Diagrama SVG: um triângulo em cada modo — Gouraud (interpola COR dos vértices)
 * e Phong (interpola NORMAIS e ilumina por pixel, com brilho localizado).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;
  var U = EX.util;

  function linGrad(svg, id, x1, y1, x2, y2, stops) {
    var defs = U.svgEl("defs");
    var lg = U.svgEl("linearGradient", { id: id, gradientUnits: "userSpaceOnUse", x1: x1, y1: y1, x2: x2, y2: y2 });
    stops.forEach(function (s) { lg.appendChild(U.svgEl("stop", { offset: s[0], "stop-color": s[1] })); });
    defs.appendChild(lg); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }
  function radGrad(svg, id, cx, cy, r, stops) {
    var defs = U.svgEl("defs");
    var rg = U.svgEl("radialGradient", { id: id, gradientUnits: "userSpaceOnUse", cx: cx, cy: cy, r: r });
    stops.forEach(function (s) {
      var st = U.svgEl("stop", { offset: s[0], "stop-color": s[1] });
      if (s[2] != null) st.setAttribute("stop-opacity", s[2]);
      rg.appendChild(st);
    });
    defs.appendChild(rg); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }

  function gouraud(svg, g) {
    var A = [210, 104], B = [108, 298], C = [304, 298];
    var fill = linGrad(svg, "q12g", 210, 104, 206, 298, [[0, "var(--yellow)"], [0.45, "var(--accent)"], [1, "#14223a"]]);
    svg.polygon([A, B, C], { fill: fill, stroke: "var(--ink-dim)", strokeWidth: 1.5, parent: g });
    // iluminação calculada nos vértices
    svg.circle(A[0], A[1], 7, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.circle(B[0], B[1], 7, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.circle(C[0], C[1], 7, { fill: "#14223a", stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.text(A[0], A[1] - 14, "luz nos vértices", { size: 11, color: "var(--ink-dim)", parent: g });
  }

  function phong(svg, g) {
    var A = [560, 104], B = [458, 298], C = [654, 298];
    svg.polygon([A, B, C], { fill: "var(--accent)", opacity: 0.42, stroke: "var(--ink-dim)", strokeWidth: 1.5, parent: g });
    // normais interpoladas (variam ao longo da superfície)
    var base = [[480, 292], [520, 292], [560, 292], [600, 292], [640, 292]];
    base.forEach(function (p, i) {
      var tilt = (i - 2) * 9;
      svg.arrow(p[0], p[1], p[0] + tilt, p[1] - 34, { color: "var(--cyan)", strokeWidth: 1.8, head: 7, parent: g });
    });
    // brilho especular localizado (por pixel)
    var hl = radGrad(svg, "q12h", 556, 212, 40, [[0, "var(--yellow)", 0.95], [0.5, "var(--yellow)", 0.4], [1, "var(--yellow)", 0]]);
    svg.circle(556, 212, 40, { fill: hl, parent: g });
    svg.text(560, 150, "highlight correto", { size: 11, color: "var(--yellow)", parent: g });
    svg.text(560, 312, "normais por pixel", { size: 11, color: "var(--cyan)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 360);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gG = grp("gou"), gP = grp("pho");
    svg.text(206, 56, "Gouraud", { size: 15, weight: 700, color: "var(--ink)", parent: gG });
    gouraud(svg, gG);
    svg.text(206, 332, "interpola a COR dos vértices", { size: 11.5, color: "var(--ink-dim)", parent: gG });
    svg.text(556, 56, "Phong (shading)", { size: 15, weight: 700, color: "var(--ink)", parent: gP });
    phong(svg, gP);
    svg.text(556, 332, "interpola as NORMAIS, ilumina por pixel", { size: 11.5, color: "var(--ink-dim)", parent: gP });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Onde a iluminação é calculada?",
        body:
          "<p>Gouraud e Phong são técnicas de <b>sombreamento suave</b> (esconder facetas). A " +
          "diferença está em <b>o que se interpola</b> pelo interior do polígono — e <b>onde</b> a " +
          "iluminação é calculada. Pense num espectro de custo crescente: <b>Flat</b> (1 cálculo " +
          "por face) → <b>Gouraud</b> (1 por vértice) → <b>Phong</b> (1 por pixel).</p>" +
          "<p><span class='muted'>Atenção: aqui \"Phong\" é a técnica de <i>shading</i>, não o " +
          "<i>modelo</i> de iluminação da questão 10.</span></p>",
        visual: svgStep("all"),
      }),
      {
        title: "Gouraud — interpola a cor",
        body:
          "<p>Calcula a iluminação <b>uma vez por vértice</b> (usando a normal do vértice, média das " +
          "faces vizinhas) e <b>interpola as cores</b> resultantes pelo interior — em geral por " +
          "interpolação bilinear ao longo das <i>scanlines</i>.</p>" +
          "<p><span class='ok'>Barato</span> e suave, mas tem um defeito clássico: o <b>brilho " +
          "especular</b> só aparece se cair <b>sobre um vértice</b>. Se o pico do highlight cai " +
          "<b>no meio</b> da face, ele <b>some</b> (não há cor brilhante nos cantos para interpolar) " +
          "ou, pior, \"vaza\" como um borrão se um vértice o pegar de raspão.</p>",
        visual: svgStep(["gou"]),
      },
      {
        title: "Phong — interpola as normais",
        body:
          "<p>Interpola as <b>normais</b> dos vértices pelo interior (renormalizando cada uma) e " +
          "calcula a iluminação completa <b>em cada pixel</b> (fragmento) — daí o nome " +
          "<i>per-fragment shading</i>.</p>" +
          "<p>Mais <span class='no'>caro</span> (uma avaliação de iluminação por pixel, não por " +
          "vértice), porém os <b>highlights</b> especulares ficam <b>corretos e bem formados</b> " +
          "mesmo no meio da face, e as <b>bandas de Mach</b> praticamente somem. É o padrão hoje, " +
          "rodando no <b>fragment shader</b> da GPU.</p>",
        visual: svgStep(["pho"]),
      },
      S.comparison({
        title: "Resumo: Gouraud × Phong",
        intro: "<p>Gouraud interpola <b>cor</b>; Phong interpola <b>normal</b> e sombreia por pixel.</p>",
        headers: ["", "Gouraud", "Phong (shading)"],
        rows: [
          ["O que interpola", "Cores dos vértices", "Normais dos vértices (renormalizadas)"],
          ["Onde calcula a luz", "Nos vértices", "Em cada pixel/fragmento"],
          ["Avaliações de luz", "1 por vértice", "1 por pixel"],
          ["Custo", "Menor", "Maior"],
          ["Brilho especular", "Pobre (pode sumir entre vértices)", "Preciso e bem formado"],
          ["Bandas de Mach", "Mais visíveis", "Reduzidas"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q12-phong-gouraud",
    num: "12",
    subject: "Computação Gráfica — Lista 3",
    section: "III) Sombreamento",
    title: "Sombreamento Phong × Gouraud",
    type: "conceitual",
    tags: ["sombreamento", "phong", "gouraud", "shading"],
    hubDesc: "Interpolar a cor dos vértices (Gouraud) × interpolar as normais por pixel (Phong).",
    statement: "Diferencie o <strong>sombreamento Phong</strong> de <strong>Gouraud</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
