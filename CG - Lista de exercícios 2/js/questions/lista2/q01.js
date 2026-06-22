/*
 * q01.js — Visualização 3D e Projeções.
 * "O que é projeção?" — conceito de projeção geométrica (3D → 2D) com um
 * diagrama SVG de projeção central revelado em etapas (objeto, projetores, imagem).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // --- Cena de projeção central (perspectiva) em coordenadas da view 470×300 ---
  var COP = [52, 168];          // centro de projeção (o "olho")
  var T = 0.46;                 // fração COP→objeto onde fica o plano/imagem
  // Cubo (objeto 3D) desenhado como wireframe: frente (4) + fundo deslocado (4).
  var FRONT = [[330, 122], [410, 122], [410, 202], [330, 202]];
  var BACK = [[362, 96], [442, 96], [442, 176], [362, 176]];
  var ALL = FRONT.concat(BACK);

  function lerp(a, p, t) { return [a[0] + t * (p[0] - a[0]), a[1] + t * (p[1] - a[1])]; }
  function imgOf(p) { return lerp(COP, p, T); }

  // Desenha um cubo wireframe a partir de [f0..f3, b0..b3].
  function cube(svg, v, opts) {
    var f = v.slice(0, 4), b = v.slice(4, 8), i;
    for (i = 0; i < 4; i++) svg.line(f[i][0], f[i][1], b[i][0], b[i][1], { stroke: opts.stroke, strokeWidth: opts.w || 2 });
    if (opts.fill) svg.polygon(f, { fill: opts.fill, stroke: opts.stroke, strokeWidth: opts.w || 2 });
    else svg.polygon(f, { fill: "none", stroke: opts.stroke, strokeWidth: opts.w || 2 });
    svg.polygon(b, { fill: "none", stroke: opts.stroke, strokeWidth: opts.w || 2, dashed: opts.dashed });
  }

  function scene(svg, o) {
    o = o || {};
    svg.view(470, 300);
    var IMG = ALL.map(imgOf);

    // Plano de projeção (paralelogramo translúcido) em torno da imagem.
    svg.polygon([[160, 120], [252, 104], [252, 214], [160, 230]], {
      fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 1.5,
    });
    svg.text(206, 96, "plano de projeção", { size: 12, color: "var(--accent)" });

    // Projetores: retas do COP a cada vértice do objeto (passam pela imagem).
    if (o.rays) {
      ALL.forEach(function (P) {
        svg.line(COP[0], COP[1], P[0], P[1], { stroke: "var(--ink-mute)", strokeWidth: 1, dashed: true });
      });
    }

    // Imagem 2D (no plano).
    if (o.image) cube(svg, IMG, { stroke: "var(--green)", fill: "var(--green-soft)", w: 2 });

    // Objeto 3D (wireframe à direita).
    cube(svg, ALL, { stroke: "var(--ink)", w: 2, dashed: true });
    svg.text(386, 226, "objeto (3D)", { size: 12, color: "var(--ink-dim)" });
    if (o.image) svg.text(206, 250, "imagem (2D)", { size: 12, color: "var(--green)" });

    // Centro de projeção.
    svg.circle(COP[0], COP[1], 5, { fill: "var(--orange)" });
    svg.text(COP[0], COP[1] + 22, "COP", { size: 12, color: "var(--orange)", weight: 700 });
  }

  function build() {
    return [
      {
        title: "O cenário: objeto, observador e plano",
        body:
          "<p><b>Projeção</b> é o processo que leva os pontos de um objeto de um espaço de " +
          "<span class='accent'>dimensão maior</span> (3D) para um de <span class='accent'>dimensão menor</span> (2D). " +
          "É a etapa que permite <b>exibir uma cena tridimensional numa tela plana</b>.</p>" +
          "<p>Para isso precisamos de três ingredientes: um <span class='hl'>objeto</span>, um " +
          "<span class='accent'>plano de projeção</span> e um <span style='color:var(--orange)'>centro de projeção (COP)</span> " +
          "— o ponto de onde \"olhamos\".</p>",
        visual: { type: "svg", draw: function (s) { scene(s, {}); } },
      },
      {
        title: "Os projetores",
        body:
          "<p>De cada ponto do objeto traçamos uma reta até o <span style='color:var(--orange)'>COP</span>. " +
          "Essas retas são os <b>projetores</b> (raios projetantes).</p>" +
          "<p>Quando o COP é um ponto <b>finito</b>, os projetores <i>convergem</i> → projeção " +
          "<span class='hl'>perspectiva</span>. Se o COP está no <b>infinito</b>, os projetores ficam " +
          "<i>paralelos</i> → projeção <span class='hl'>paralela</span>.</p>",
        visual: { type: "svg", draw: function (s) { scene(s, { rays: true }); } },
      },
      {
        title: "A imagem: interseção com o plano",
        body:
          "<p>A <span class='ok'>imagem</span> é formada onde cada projetor <b>cruza o plano de projeção</b>. " +
          "O conjunto dessas interseções é a projeção 2D do objeto.</p>" +
          "<p>Repare que a imagem é <b>menor</b> que o objeto: na perspectiva, o que está mais longe " +
          "do COP projeta-se menor (escorço/foreshortening).</p>",
        visual: { type: "svg", draw: function (s) { scene(s, { rays: true, image: true }); } },
      },
      EX.Slides.definition({
        title: "Definição",
        term: "Projeção geométrica",
        body:
          "<p>Transformação que mapeia pontos de um objeto sobre uma <b>superfície de projeção</b> " +
          "(em geral um plano) por meio de <b>projetores</b> que partem de um <b>centro de projeção</b>.</p>" +
          "<p>Reduz a dimensão (3D→2D) preservando a informação visual necessária para representar a cena. " +
          "Os <i>elementos</i> que a caracterizam estão na Q2 e os <i>tipos</i> na Q3.</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q01",
    num: "1",
    subject: "Visualização 3D e Projeções",
    title: "O que é projeção?",
    type: "conceitual",
    hubDesc: "Mapear 3D→2D por projetores a partir de um centro de projeção.",
    statement: "O que é projeção?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
