/*
 * q10.js — Equação geral do modelo de iluminação de Phong + iluminação global.
 * Diagrama SVG: os vetores N, L, R, V em um ponto P, com ênfase difusa/especular.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;
  var P = [380, 298];

  function unit(dx, dy) { var m = Math.sqrt(dx * dx + dy * dy); return [dx / m, dy / m]; }

  function drawPhong(svg, mode) {
    svg.view(760, 410);
    function opc(active) { return mode === "all" || active ? 1 : 0.16; }
    var diff = mode === "diffuse", spec = mode === "specular";

    // superfície + P
    svg.rect(250, 298, 260, 12, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5 });
    svg.circle(P[0], P[1], 6, { fill: "var(--ink)" });
    svg.text(P[0] + 2, P[1] + 30, "P", { size: 13, weight: 700, color: "var(--ink)" });

    var Lend = [232, 156], Rend = [528, 156], Nend = [P[0], 150], Vend = [566, 206];

    // N (normal)
    var gN = svg.group({}); gN.setAttribute("opacity", 1);
    svg.arrow(P[0], P[1], Nend[0], Nend[1], { color: "var(--accent)", strokeWidth: 3, head: 12, parent: gN });
    svg.text(Nend[0], Nend[1] - 14, "N", { size: 14, weight: 800, color: "var(--accent)", parent: gN });

    // L (para a luz)
    var gL = svg.group({}); gL.setAttribute("opacity", opc(diff));
    svg.circle(208, 132, 13, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: gL });
    svg.arrow(P[0], P[1], Lend[0], Lend[1], { color: "var(--yellow)", strokeWidth: 3, head: 12, parent: gL });
    svg.text(Lend[0] - 16, Lend[1], "L", { size: 14, weight: 800, color: "var(--yellow)", parent: gL });

    // R (reflexão de L em torno de N)
    var gR = svg.group({}); gR.setAttribute("opacity", opc(spec));
    svg.arrow(P[0], P[1], Rend[0], Rend[1], { color: "var(--orange)", strokeWidth: 3, head: 12, dashed: "7 5", parent: gR });
    svg.text(Rend[0] + 12, Rend[1], "R", { size: 14, weight: 800, color: "var(--orange)", parent: gR });

    // V (para o olho)
    var gV = svg.group({}); gV.setAttribute("opacity", opc(spec));
    svg.ellipse(590, 222, 26, 16, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2, parent: gV });
    svg.circle(590, 222, 8, { fill: "var(--green)", parent: gV });
    svg.arrow(P[0], P[1], Vend[0], Vend[1], { color: "var(--green)", strokeWidth: 3, head: 12, parent: gV });
    svg.text(Vend[0] - 4, Vend[1] + 18, "V", { size: 14, weight: 800, color: "var(--green)", parent: gV });

    // ângulo θ (N,L) — destacado no difuso
    var Ld = unit(Lend[0] - P[0], Lend[1] - P[1]), Nd = unit(0, -1);
    var gTh = svg.group({}); gTh.setAttribute("opacity", opc(diff));
    svg.path("M " + (P[0] + 42 * Ld[0]) + " " + (P[1] + 42 * Ld[1]) + " A 42 42 0 0 1 " + (P[0] + 42 * Nd[0]) + " " + (P[1] + 42 * Nd[1]),
      { stroke: "var(--yellow)", strokeWidth: 2, fill: "none", parent: gTh });
    svg.text(P[0] - 30, P[1] - 40, "θ", { size: 13, weight: 700, color: "var(--yellow)", parent: gTh });

    // ângulo α (R,V) — destacado no especular
    var Rd = unit(Rend[0] - P[0], Rend[1] - P[1]), Vd = unit(Vend[0] - P[0], Vend[1] - P[1]);
    var gAl = svg.group({}); gAl.setAttribute("opacity", opc(spec));
    svg.path("M " + (P[0] + 64 * Rd[0]) + " " + (P[1] + 64 * Rd[1]) + " A 64 64 0 0 1 " + (P[0] + 64 * Vd[0]) + " " + (P[1] + 64 * Vd[1]),
      { stroke: "var(--green)", strokeWidth: 2, fill: "none", parent: gAl });
    svg.text(P[0] + 86, P[1] - 36, "α", { size: 13, weight: 700, color: "var(--green)", parent: gAl });
  }

  function formulaDom(highlight) {
    return {
      type: "dom",
      draw: function (host) {
        var f = EX.util.el("div", "formula",
          "I = k_a·I_a  +  Σ_luzes [ k_d·I_L·(N·L)  +  k_s·I_L·(R·V)^n ]");
        host.appendChild(f);
        EX.Content.callout(host, {
          kind: highlight === "amb" ? "warn" : "note", title: "Ambiente — k_a · I_a",
          html: "Luz de fundo <b>constante</b>. É a única forma como a <b>iluminação global</b> " +
            "(indireta) entra no modelo — uma aproximação grosseira.",
        });
        EX.Content.callout(host, {
          kind: highlight === "dif" ? "tip" : "note", title: "Difuso — k_d · I_L · (N·L)",
          html: "Lei de <b>Lambert</b>: cresce com o ângulo luz-normal (<b>N·L</b>). " +
            "<b>Independe</b> do observador.",
        });
        EX.Content.callout(host, {
          kind: highlight === "esp" ? "tip" : "note", title: "Especular — k_s · I_L · (R·V)^n",
          html: "Brilho: forte quando <b>R</b> se alinha a <b>V</b>. O expoente <b>n</b> " +
            "(shininess) <b>concentra</b> o brilho.",
        });
        host.appendChild(EX.util.el("p", "muted",
          "Somatório sobre todas as fontes; (N·L) e (R·V) são limitados a ≥ 0."));
      },
    };
  }

  function build() {
    return [
      S.concept({
        title: "Phong: ambiente + difuso + especular",
        body:
          "<p>O modelo de <b>Phong</b> calcula a intensidade em um ponto somando <b>três " +
          "componentes</b>: <span class='accent'>ambiente</span>, " +
          "<span class='hl'>difusa</span> e <span style='color:var(--orange)'>especular</span>.</p>" +
          "<p>Primeiro, os vetores que ele usa (ao lado).</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "all"); } },
      }),
      {
        title: "Os vetores: N, L, R, V",
        body:
          "<p><span class='accent'>N</span> = normal; <span class='hl'>L</span> = direção da luz; " +
          "<span style='color:var(--orange)'>R</span> = reflexão de L em torno de N; " +
          "<span class='ok'>V</span> = direção do observador.</p>" +
          "<p>Dois ângulos importam: <b>θ</b> (entre N e L) e <b>α</b> (entre R e V).</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "all"); } },
      },
      {
        title: "A equação geral de Phong",
        body:
          "<p>A intensidade total é a <b>soma de três componentes</b>: um termo <b>ambiente</b> " +
          "(uma vez) mais, <b>para cada fonte de luz</b>, um termo <b>difuso</b> e um " +
          "<b>especular</b> (a equação completa está ao lado, com cada termo destacado).</p>" +
          "<p>Lê-se assim: o brilho <b>ambiente</b> ilumina tudo por igual; o <b>difuso</b> cresce " +
          "com N·L; o <b>especular</b> acende quando R·V se aproxima de 1. Tudo é calculado por " +
          "<b>canal de cor</b> (R, G, B separadamente) — por isso uma luz colorida tinge o objeto.</p>",
        visual: formulaDom(null),
      },
      {
        title: "Componente difusa — k_d·I_L·(N·L)",
        body:
          "<p>Modela a reflexão <b>fosca</b> (lei de Lambert). É máxima quando a luz incide " +
          "<b>perpendicular</b> à superfície (θ = 0 → N·L = 1) e cai a <b>zero</b> na incidência " +
          "rasante (θ = 90° → N·L = 0).</p>" +
          "<p>Depende do ângulo <b>θ</b> entre <b>N</b> e <b>L</b> — e <b>não</b> do observador. Por " +
          "isso uma esfera fosca tem o mesmo gradiente de quem quer que a olhe. O termo é " +
          "<b>cortado em 0</b> (max(0, N·L)) para a face que dá as costas à luz não \"brilhar " +
          "negativo\".</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "diffuse"); } },
      },
      {
        title: "Componente especular — k_s·I_L·(R·V)ⁿ",
        body:
          "<p>Modela o <b>brilho</b> (highlight). É forte quando o vetor <b>R</b> se alinha ao vetor " +
          "<b>V</b> (ângulo <b>α</b> pequeno → R·V ≈ 1). Como R depende de L e N, e V de onde se " +
          "olha, o brilho <b>se move</b> pela superfície conforme câmera e luz.</p>" +
          "<p>O expoente <b>n</b> (<i>shininess</i>) controla o <b>tamanho</b> do brilho: " +
          "<b>n pequeno</b> (~5) → brilho amplo e suave (plástico fosco); <b>n grande</b> (~100–500) " +
          "→ brilho pequeno e intenso (metal polido). Na <b>variante Blinn-Phong</b>, troca-se R·V " +
          "por <b>N·H</b> (H = vetor médio entre L e V), mais barato e estável.</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "specular"); } },
      },
      {
        title: "Exemplo numérico (um canal, uma luz)",
        body:
          "<p>Seja k_a=0,2 · I_a=1 ; k_d=0,7 ; k_s=0,8 · I_L=1 ; n=20. Num ponto com " +
          "<b>N·L = 0,5</b> (θ = 60°) e <b>R·V = 0,9</b> (α ≈ 26°):</p>" +
          "<div class='formula'>ambiente  = 0,2·1          = 0,20\n" +
          "difuso    = 0,7·1·0,5      = 0,35\n" +
          "especular = 0,8·1·0,9²⁰    ≈ 0,10\n" +
          "soma I    = 0,20+0,35+0,10 = 0,65</div>" +
          "<p>Repare o efeito do expoente: 0,9²⁰ ≈ 0,12 já derruba bastante o brilho (0,8 · 0,12 ≈ " +
          "0,10). Se o ponto " +
          "estivesse <b>exatamente</b> no reflexo (R·V = 1), o especular daria o máximo 0,8; a " +
          "poucos graus de distância, ele desaba — é isso que cria o ponto de luz concentrado.</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "specular"); } },
      },
      {
        title: "E a iluminação global?",
        body:
          "<p>Phong é um modelo de <b>iluminação local (direta)</b>: calcula a luz que vem " +
          "<b>direto da fonte</b>, sem simular as inter-reflexões reais entre superfícies.</p>" +
          "<p>A iluminação global entra <b>apenas pelo termo ambiente</b> <code>k_a·I_a</code> — " +
          "constante — que evita que as sombras fiquem totalmente pretas. É uma aproximação, não " +
          "um cálculo real da luz indireta.</p>",
        visual: formulaDom("amb"),
      },
      S.comparison({
        title: "Resumo: as componentes de Phong",
        headers: ["Componente", "Fórmula", "Depende de", "Papel"],
        rows: [
          ["Ambiente", "k_a·I_a", "Nada (constante)", "Aproxima a luz global/indireta"],
          ["Difusa", "k_d·I_L·(N·L)", "θ (N e L)", "Reflexão fosca (Lambert)"],
          ["Especular", "k_s·I_L·(R·V)^n", "α (R e V), n", "Brilho / highlight"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q10-phong",
    num: "10",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Equação do modelo de Phong",
    type: "conceitual",
    tags: ["phong", "iluminação", "especular", "difuso"],
    hubDesc: "Ambiente + difuso + especular, os vetores N/L/R/V e a global via termo ambiente.",
    statement:
      "Qual é a <strong>equação geral do modelo de iluminação de Phong</strong>? Como a " +
      "<strong>iluminação global</strong> é considerada nesse modelo?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
