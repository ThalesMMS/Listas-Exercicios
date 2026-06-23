/*
 * q14.js — Modelagem com polígonos aleatórios nas texturas:
 * como se fazem os cálculos de iluminação e de movimentação.
 * Diagrama SVG: malha irregular de triângulos com normais por face; e uma
 * transformação geométrica movendo a malha (vértices + normais).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  var TRI = [
    [[120, 180], [150, 280], [210, 160]],
    [[210, 160], [150, 280], [240, 300]],
    [[210, 160], [240, 300], [300, 185]],
    [[300, 185], [240, 300], [330, 285]],
    [[300, 185], [330, 285], [390, 165]],
    [[390, 165], [330, 285], [420, 300]],
  ];

  function centroid(t) {
    return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
  }

  function drawMesh(svg, g, dx, dy, opt) {
    opt = opt || {};
    TRI.forEach(function (t, i) {
      var pts = t.map(function (p) { return [p[0] + dx, p[1] + dy]; });
      if (opt.outline) {
        svg.polygon(pts, { fill: "none", stroke: "var(--ink-dim)", strokeWidth: 1.5, dashed: "5 4", parent: g });
      } else {
        svg.polygon(pts, { fill: "var(--green)", opacity: (0.28 + 0.1 * i) * (opt.fade || 1), stroke: "var(--ink)", strokeWidth: 1, parent: g });
      }
      if (opt.normals) {
        var c = centroid(pts), tilt = (i - 2.5) * 6;
        svg.arrow(c[0], c[1], c[0] + tilt, c[1] - 28, { color: "var(--cyan)", strokeWidth: 1.6, head: 7, parent: g });
      }
    });
  }

  function scene(svg, active) {
    svg.view(760, 360);
    if (active === "mov") {
      var gM = svg.group({});
      drawMesh(svg, gM, 0, 0, { fade: 0.6 });
      drawMesh(svg, gM, 150, 56, { outline: true });
      svg.arrow(265, 235, 415, 291, { color: "var(--accent)", strokeWidth: 3, head: 13, parent: gM });
      svg.text(360, 248, "T (matriz)", { size: 13, weight: 700, color: "var(--accent)", parent: gM });
      svg.text(250, 348, "vértices e normais transformados juntos", { size: 12, color: "var(--ink-dim)", parent: gM });
    } else { // ilum (também usado na introdução)
      var gI = svg.group({});
      drawMesh(svg, gI, 0, 0, { normals: true });
      svg.arrow(90, 110, 158, 178, { color: "var(--yellow)", strokeWidth: 2, head: 9, parent: gI });
      svg.text(96, 100, "luz", { size: 11, color: "var(--yellow)", parent: gI });
      svg.text(270, 340, "cada polígono tem sua normal → iluminação por face/vértice", { size: 12, color: "var(--ink-dim)", parent: gI });
    }
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Malhas de polígonos \"aleatórios\"",
        body:
          "<p>Superfícies geradas por <b>polígonos aleatórios/procedurais</b> (terrenos, água, " +
          "rochas) ainda são, no fim, uma <b>malha poligonal</b> comum — só que com os vértices " +
          "posicionados por um processo <b>randômico/fractal</b> (ruído de Perlin, deslocamento do " +
          "ponto médio, subdivisão).</p>" +
          "<p>A ideia-chave da questão: a <b>aleatoriedade está só na geração</b> da geometria. " +
          "Depois de criada, a malha é tratada como qualquer outra — os cálculos de " +
          "<b>iluminação</b> e <b>movimentação</b> seguem o mesmo princípio de sempre.</p>",
        visual: svgStep("ilum"),
      }),
      {
        title: "Iluminação: pela normal de cada polígono",
        body:
          "<p>Mesmo gerados aleatoriamente, cada polígono tem <b>vértices</b> bem definidos. A " +
          "<b>normal</b> da face sai do <b>produto vetorial</b> de duas arestas: " +
          "<b>N = (V₂−V₁) × (V₃−V₁)</b>, normalizada. Para sombreamento suave, a normal de cada " +
          "vértice é a <b>média</b> das normais das faces que o tocam.</p>" +
          "<p>Com a normal em mãos, aplica-se o <b>modelo de iluminação</b> (Phong/Lambert) " +
          "<b>por face</b> (Flat) ou <b>por vértice</b> (Gouraud/Phong) — exatamente como nas " +
          "questões 10–12. A aleatoriedade só definiu <i>onde</i> estão os vértices; o cálculo de " +
          "luz é o de sempre.</p>",
        visual: svgStep("ilum"),
      },
      {
        title: "Movimentação: transformando os vértices",
        body:
          "<p>O objeto se move por <b>transformações geométricas</b> aplicadas aos <b>vértices</b> em " +
          "coordenadas homogêneas — translação, rotação e escala via <b>matrizes</b> (que se compõem " +
          "por multiplicação: M = T·R·S). Movem-se todos os vértices, e a malha inteira acompanha.</p>" +
          "<p>As <b>normais</b> precisam ser transformadas junto, senão a iluminação \"descola\" do " +
          "objeto. <b>Atenção:</b> normal <b>não</b> se transforma com a mesma matriz dos pontos — " +
          "usa-se a <b>transposta da inversa</b> da parte linear de M (com escala não-uniforme, " +
          "aplicar M direto inclinaria a normal errado). Depois, renormaliza-se.</p>" +
          "<p>A <b>textura</b> acompanha de graça: as coordenadas <b>(u, v)</b> ficam \"presas\" aos " +
          "vértices e não mudam com a transformação.</p>",
        visual: svgStep("mov"),
      },
      S.comparison({
        title: "Resumo",
        intro: "<p>Aleatório na <b>geração</b>; convencional no <b>cálculo</b>.</p>",
        headers: ["Cálculo", "Como é feito"],
        rows: [
          ["Iluminação", "Normal (produto vetorial das arestas) + modelo de iluminação por face/vértice"],
          ["Movimentação", "Matrizes (T·R·S) nos vértices; normais via transposta da inversa"],
          ["Textura", "Segue os vértices pelas coordenadas (u, v) — invariantes"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q14-poligonos-aleatorios",
    num: "14",
    subject: "Computação Gráfica — Lista 3",
    section: "IV) Texturas",
    title: "Polígonos aleatórios: iluminação e movimentação",
    type: "conceitual",
    tags: ["textura", "malha", "normais", "transformação"],
    hubDesc: "Normais por polígono para a luz; matrizes nos vértices para o movimento.",
    statement:
      "Na modelagem com <strong>polígonos aleatórios nas texturas</strong>, como são feitos os " +
      "cálculos de <strong>iluminação</strong> e de <strong>movimentação</strong> dos objetos modelados?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
