/*
 * q15.js — Mapeamento procedural × bump mapping.
 * Diagrama SVG: padrão procedural (função → cor) e bump (normais perturbadas →
 * relevo aparente, com a silhueta/geometria continuando lisa).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function procedural(svg, g) {
    var x = 110, y = 96, n = 6, cw = 26;
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        svg.rect(x + c * cw, y + r * cw, cw, cw, {
          fill: ((c + r) % 2 === 0) ? "var(--accent)" : "var(--purple)",
          opacity: 0.75, parent: g,
        });
      }
    }
    svg.rect(x, y, n * cw, n * cw, { fill: "none", stroke: "var(--ink-dim)", strokeWidth: 1.5, parent: g });
    svg.text(x + n * cw / 2, 80, "f(u, v, w) → atributos", { size: 12, weight: 700, color: "var(--ink-dim)", parent: g });
  }

  function bump(svg, g) {
    var x0 = 470, x1 = 660, ybar = 232, A = 15, base = 196;
    function wave(x) { return base - A * Math.sin((x - x0) / 21); }
    // relevo PERCEBIDO (ilusão)
    var pts = [];
    for (var x = x0; x <= x1; x += 6) pts.push([x, wave(x)]);
    svg.polyline(pts, { stroke: "var(--accent)", strokeWidth: 2, dashed: "6 4", parent: g });
    svg.text((x0 + x1) / 2, base - A - 16, "relevo percebido", { size: 11, color: "var(--accent)", parent: g });
    // geometria REAL (lisa)
    svg.rect(x0, ybar, x1 - x0, 14, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, parent: g });
    svg.text((x0 + x1) / 2, ybar + 34, "geometria real: lisa (silhueta não muda)", { size: 11, color: "var(--ink-dim)", parent: g });
    // normais perturbadas (acompanham o relevo falso)
    for (x = x0 + 18; x <= x1 - 10; x += 36) {
      var slope = -A * Math.cos((x - x0) / 21) / 21;        // dy/dx do relevo
      var nx = slope, ny = -1, m = Math.sqrt(nx * nx + 1);   // normal ~ (-slope? ) apontando p/ cima
      svg.arrow(x, ybar, x + (slope / m) * 30, ybar - (1 / m) * 30, { color: "var(--cyan)", strokeWidth: 1.8, head: 7, parent: g });
    }
  }

  function scene(svg, active) {
    svg.view(760, 340);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gP = grp("proc"), gB = grp("bump");
    svg.text(188, 54, "Mapeamento procedural", { size: 14, weight: 700, color: "var(--ink)", parent: gP });
    procedural(svg, gP);
	    svg.text(188, 286, "atributos gerados por função", { size: 11.5, color: "var(--ink-dim)", parent: gP });
    svg.text(565, 54, "Bump mapping", { size: 14, weight: 700, color: "var(--ink)", parent: gB });
    bump(svg, gB);
    svg.text(565, 286, "perturba NORMAIS → relevo aparente", { size: 11.5, color: "var(--ink-dim)", parent: gB });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Padrão por função × relevo por normais",
        body:
          "<p>Ambos adicionam <b>detalhe de superfície</b> de forma barata — sem desenhar uma " +
          "imagem de textura à mão nem acrescentar geometria. Mas atuam em " +
          "coisas <b>diferentes</b>:</p>" +
	          "<ul><li><span class='accent'>Procedural</span> gera atributos por função: cor, normal, rugosidade, deslocamento;</li>" +
	          "<li><span class='hl'>Bump</span> muda a <b>iluminação</b> (finge relevo).</li></ul>",
        visual: svgStep("all"),
      }),
      {
        title: "Mapeamento procedural",
        body:
          "<p>A textura é definida por uma <b>função/algoritmo</b> avaliado nas coordenadas " +
          "(frequentemente 3D — <i>solid texturing</i>, ruído de Perlin): madeira, mármore, " +
          "xadrez. Como a função é avaliada na <b>posição 3D</b> do ponto, é como se o objeto fosse " +
          "<b>esculpido num bloco maciço</b> do material.</p>" +
	          "<p>Pode controlar <b>cor</b>, <b>normal, rugosidade</b>, deslocamento e outros atributos <b>sem armazenar imagem</b>: não tem resolução fixa. " +
	          "A ausência de costuras vale especialmente para texturas procedurais tridimensionais.</p>",
        visual: svgStep(["proc"]),
      },
      {
        title: "Bump mapping",
        body:
          "<p>Não muda a cor base nem a geometria: a partir de um <b>mapa de alturas</b>, usa o seu " +
          "<b>gradiente</b> para <b>perturbar as normais</b> da superfície durante a iluminação. " +
          "Como o sombreamento (q10) depende da normal, a luz passa a reagir como se houvesse " +
          "relevo — criando a <b>ilusão de saliências, sombras e brilhos</b>.</p>" +
          "<p>Mas a geometria continua lisa, então a <b>silhueta não muda</b>: de perfil, ou olhando " +
          "a borda, percebe-se que é plano. As \"saliências\" também não projetam sombra umas nas " +
          "outras nem se ocluem.</p>",
        visual: svgStep(["bump"]),
      },
      S.concept({
        title: "A família do relevo: bump, normal, displacement",
        body:
          "<p>O bump tem parentes que trocam custo por realismo:</p>" +
          "<ul><li><b>Normal mapping</b> — em vez de alturas, o mapa guarda a <b>normal já pronta</b> " +
          "(em RGB); mesmo efeito do bump, mais usado em jogos;</li>" +
          "<li><b>Parallax mapping</b> — desloca as coordenadas de textura para dar " +
          "<b>profundidade aparente</b> (paralaxe ao mover a câmera), ainda sem mexer na geometria;</li>" +
          "<li><b>Displacement mapping</b> — este <b>realmente move os vértices</b> pela altura: o " +
          "relevo é de verdade, <b>a silhueta muda</b> e há auto-oclusão — porém exige muita " +
          "geometria (tesselação).</li></ul>" +
          "<p>Regra prática: se a <b>silhueta</b> precisa mostrar o relevo, é displacement; se basta " +
          "<b>enganar a luz</b>, bump/normal mapping bastam e são muito mais baratos.</p>",
        visual: svgStep(["bump"]),
      }),
      S.comparison({
        title: "Resumo: procedural × bump",
        headers: ["", "Procedural", "Bump mapping"],
        rows: [
	          ["O que define", "Função/algoritmo → atributos", "Perturbação das normais"],
	          ["Altera", "Cor, normal, rugosidade, deslocamento etc.", "A iluminação (relevo aparente)"],
          ["Geometria", "Não muda", "Não muda (só parece)"],
          ["Silhueta", "Lisa", "Lisa (não acompanha o relevo)"],
          ["Exemplos", "Madeira, mármore, xadrez", "Rugosidade, casca de laranja, tijolos"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q15-procedural-bump",
    num: "15",
    subject: "Computação Gráfica — Lista 3",
    section: "IV) Texturas",
    title: "Mapeamento procedural × bump mapping",
    type: "conceitual",
    tags: ["textura", "procedural", "bump", "normais"],
    hubDesc: "Função que gera cor (procedural) × normais perturbadas que fingem relevo (bump).",
    statement: "Diferencie <strong>mapeamento procedural</strong> de <strong>bump mapping</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
