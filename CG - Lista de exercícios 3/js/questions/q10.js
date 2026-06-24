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
          "I_T = Σ_{i=1}^{N} [ f_att,i · (I_es,i + k_d · I_d,i) ] + k_em · I_em + I_A");
        host.appendChild(f);
        EX.Content.callout(host, {
          kind: "note", title: "Somatório — Σ de 1 até N",
          html: "<b>N</b> é o número de fontes de luz. Para cada fonte <b>i</b>, somamos sua " +
            "contribuição especular e difusa no ponto.",
        });
        EX.Content.callout(host, {
          kind: highlight === "att" ? "tip" : "note", title: "Atenuação — f_att,i",
          html: "<b>Coeficiente de atenuação</b>: reduz a luz da fonte <b>i</b> conforme a distância " +
            "(em luz direcional, normalmente vale 1).",
        });
        EX.Content.callout(host, {
          kind: highlight === "esp" ? "tip" : "note", title: "Especular — I_es,i",
          html: "<b>Reflexão especular</b>: brilho concentrado. Na forma vetorial, depende do " +
            "alinhamento entre <b>R</b> e <b>V</b> e do expoente <b>n</b>.",
        });
        EX.Content.callout(host, {
          kind: highlight === "dif" ? "tip" : "note", title: "Difuso — k_d · I_d,i",
          html: "<b>Reflexão difusa</b>: <b>k_d</b> controla quanto o material espalha luz; " +
            "<b>I_d,i</b> cresce com <b>N·L</b> pela lei de Lambert e independe do observador.",
        });
        EX.Content.callout(host, {
          kind: highlight === "em" ? "tip" : "note", title: "Emissão — k_em · I_em",
          html: "Termo de <b>objeto emissor</b>: adiciona a luz que o próprio objeto emite, sem " +
            "depender de outra fonte iluminando a superfície.",
        });
        EX.Content.callout(host, {
          kind: highlight === "amb" ? "warn" : "note", title: "Ambiente — I_A",
          html: "<b>Reflexão ambiente</b>: luz de fundo constante. É a aproximação barata da " +
            "iluminação global/indireta no modelo.",
        });
        host.appendChild(EX.util.el("p", "muted",
          "Equivalência com a notação vetorial: I_d,i inclui I_i·max(0, N·L_i); " +
          "I_es,i inclui o termo especular k_s·I_i·max(0, R_i·V)^n."));
      },
    };
  }

  function build() {
    return [
      S.concept({
        title: "Phong: fontes + emissão + ambiente",
        body:
          "<p>O modelo de <b>Phong</b> calcula a intensidade total em um ponto somando as " +
          "contribuições das <b>N fontes de luz</b> e acrescentando os termos de " +
          "<b>objeto emissor</b> e <b>reflexão ambiente</b>.</p>" +
          "<p>Para cada fonte, entram duas reflexões locais: " +
          "<span class='hl'>difusa</span> e <span style='color:var(--orange)'>especular</span>, " +
          "ambas multiplicadas pelo <b>coeficiente de atenuação</b>.</p>" +
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
          "<p>A fórmula usada na disciplina escreve a intensidade total como:</p>" +
          "<p><b>luzes atenuadas</b> = soma, para cada fonte, da reflexão <b>especular</b> e " +
          "<b>difusa</b>; depois entram <b>emissão</b> e <b>ambiente</b>.</p>" +
          "<p>Tudo é calculado por <b>canal de cor</b> (R, G, B separadamente), então uma luz colorida " +
          "ou um objeto emissor colorido altera cada canal de forma independente.</p>",
        visual: formulaDom(null),
      },
      {
        title: "Componente difusa — k_d · I_d,i",
        body:
          "<p>Modela a reflexão <b>fosca</b> (lei de Lambert). O termo <b>I_d,i</b> é a contribuição " +
          "difusa da fonte <b>i</b>: é máxima quando a luz incide " +
          "<b>perpendicular</b> à superfície (θ = 0 → N·L = 1) e cai a <b>zero</b> na incidência " +
          "rasante (θ = 90° → N·L = 0).</p>" +
          "<p>O coeficiente <b>k_d</b> é propriedade do material: quanto maior, mais a superfície " +
          "espalha luz de modo difuso. Como depende de <b>N·L</b>, mas não de <b>V</b>, independe " +
          "do observador.</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "diffuse"); } },
      },
      {
        title: "Componente especular — I_es,i",
        body:
          "<p>Modela o <b>brilho</b> (highlight) produzido pela fonte <b>i</b>. A notação da fórmula " +
          "agrupa essa contribuição em <b>I_es,i</b>.</p>" +
          "<p>Na forma vetorial, ela é forte quando o vetor <b>R</b> se alinha ao vetor " +
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
          "<p>Seja uma única fonte com <b>f_att=0,8</b>, <b>I_es=0,10</b>, <b>k_d=0,7</b>, " +
          "<b>I_d=0,50</b>, <b>k_em=0</b>, <b>I_em=0</b> e <b>I_A=0,20</b>:</p>" +
          "<div class='formula'>fonte    = 0,8 · (0,10 + 0,7 · 0,50) = 0,36\n" +
          "emissão  = 0 · 0 = 0,00\n" +
          "ambiente = 0,20\n" +
          "I_T      = 0,36 + 0,00 + 0,20 = 0,56</div>" +
          "<p>Se o ponto estivesse mais longe da fonte, <b>f_att</b> diminuiria a primeira parcela. " +
          "Se o objeto fosse emissor, <b>k_em·I_em</b> somaria luz própria mesmo sem receber luz direta.</p>",
        visual: { type: "svg", draw: function (svg) { drawPhong(svg, "specular"); } },
      },
      {
        title: "E a iluminação global?",
        body:
          "<p>Phong é um modelo de <b>iluminação local (direta)</b>: calcula a luz que vem " +
          "<b>direto da fonte</b>, sem simular as inter-reflexões reais entre superfícies.</p>" +
          "<p>A iluminação global entra <b>apenas pelo termo ambiente</b> <code>I_A</code>: uma " +
          "reflexão ambiente constante que evita sombras totalmente pretas. É uma aproximação, não " +
          "um cálculo real da luz indireta.</p>",
        visual: formulaDom("amb"),
      },
      S.comparison({
        title: "Resumo: termos da fórmula",
        headers: ["Termo", "Significado", "Papel"],
        rows: [
          ["Σ de 1 até N", "Número de fontes de luz", "Soma a contribuição de cada fonte"],
          ["f_att,i", "Coeficiente de atenuação", "Reduz a fonte com a distância"],
          ["I_es,i", "Reflexão especular", "Brilho dependente de R, V e n"],
          ["k_d·I_d,i", "Reflexão difusa", "Luz espalhada pelo material (Lambert)"],
          ["k_em·I_em", "Objeto emissor", "Luz própria do objeto"],
          ["I_A", "Reflexão ambiente", "Aproxima a luz global/indireta"],
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
    hubDesc: "Fórmula da professora: atenuação, reflexão especular/difusa, emissão e ambiente.",
    statement:
      "Qual é a <strong>equação geral do modelo de iluminação de Phong</strong>? Como a " +
      "<strong>iluminação global</strong> é considerada nesse modelo?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
