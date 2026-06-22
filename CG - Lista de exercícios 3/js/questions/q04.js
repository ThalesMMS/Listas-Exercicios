/*
 * q04.js — Elementos usados em uma cena para cálculo de iluminação.
 * Diagrama SVG: ponto P numa superfície com a normal N, a fonte de luz (L),
 * o observador (V), o raio refletido (R) e a luz ambiente. Construção cumulativa.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  var P = [366, 306];

  // active: "all" ou lista de grupos acesos (cumulativo).
  function scene(svg, active) {
    svg.view(760, 430);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) {
      var g = svg.group({});
      g.setAttribute("opacity", on(n) ? 1 : 0.12);
      return g;
    }
    var gAmb = grp("amb");
    var gSurf = grp("surf");
    var gN = grp("N");
    var gL = grp("L");
    var gV = grp("V");
    var gR = grp("R");

    // ---- Ambiente (fundo) ----
    svg.text(366, 54, "luz ambiente (envolve toda a cena)", { size: 12, color: "var(--ink-dim)", parent: gAmb });
    [120, 250, 480, 610].forEach(function (xx) {
      svg.circle(xx, 80, 3, { fill: "var(--ink-mute)", parent: gAmb });
    });

    // ---- Superfície / material + ponto P ----
    svg.rect(150, 306, 430, 16, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, parent: gSurf });
    svg.circle(P[0], P[1], 6, { fill: "var(--ink)", parent: gSurf });
    svg.text(P[0] + 4, P[1] + 28, "P (ponto da superfície)", { size: 12, color: "var(--ink)", parent: gSurf, anchor: "middle" });
    svg.text(366, 352, "material: cor, k_a / k_d / k_s, brilho", { size: 11.5, color: "var(--ink-dim)", parent: gSurf });

    // ---- Normal N ----
    svg.arrow(P[0], P[1], P[0], 150, { color: "var(--accent)", strokeWidth: 3, head: 12, parent: gN });
    svg.text(P[0], 138, "N (normal)", { size: 13, weight: 700, color: "var(--accent)", parent: gN });

    // ---- Fonte de luz + L ----
    var i, a;
    for (i = 0; i < 10; i++) {
      a = (i / 10) * Math.PI * 2;
      svg.line(178 + Math.cos(a) * 22, 120 + Math.sin(a) * 22, 178 + Math.cos(a) * 32, 120 + Math.sin(a) * 32,
        { stroke: "var(--yellow)", strokeWidth: 2.5, parent: gL });
    }
    svg.circle(178, 120, 18, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: gL });
    svg.arrow(P[0], P[1], 208, 150, { color: "var(--yellow)", strokeWidth: 3, head: 12, parent: gL });
    svg.text(250, 215, "L (p/ a luz)", { size: 13, weight: 700, color: "var(--yellow)", parent: gL });
    svg.text(150, 150, "fonte de luz", { size: 12, color: "var(--ink-dim)", parent: gL });

    // ---- Observador + V ----
    svg.ellipse(566, 120, 30, 18, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2, parent: gV });
    svg.circle(566, 120, 9, { fill: "var(--green)", parent: gV });
    svg.arrow(P[0], P[1], 536, 150, { color: "var(--green)", strokeWidth: 3, head: 12, parent: gV });
    svg.text(486, 215, "V (p/ o olho)", { size: 13, weight: 700, color: "var(--green)", parent: gV });
    svg.text(566, 158, "observador", { size: 12, color: "var(--ink-dim)", parent: gV });

    // ---- Reflexão R (espelho do raio incidente -L em torno de N) ----
    svg.arrow(P[0], P[1], 524, 150, { color: "var(--orange)", strokeWidth: 3, head: 12, dashed: "7 5", parent: gR });
    svg.text(560, 250, "R = 2(N·L)N − L", { size: 13, weight: 700, color: "var(--orange)", parent: gR });
  }

  function svgStep(active) {
    return { type: "svg", draw: function (svg) { scene(svg, active); } };
  }

  function build() {
    return [
      S.concept({
        title: "Iluminar = combinar luz, geometria, material e observador",
        body:
          "<p>Para calcular a cor (intensidade) de um ponto, um modelo de iluminação precisa de " +
          "um conjunto de <b>elementos da cena</b>. No ponto <span class='accent'>P</span> da " +
          "superfície reunimos vetores e propriedades (ao lado).</p>" +
          "<p>Vamos revelar cada elemento e seu papel.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Superfície, ponto P e a normal N",
        body:
          "<p>Tudo acontece num <b>ponto P</b> de uma <b>superfície/objeto</b>, que tem um " +
          "<b>material</b> (cor e coeficientes <code>k_a</code>, <code>k_d</code>, " +
          "<code>k_s</code>, brilho).</p>" +
          "<p>A <span class='accent'>normal N</span> — perpendicular à superfície em P — orienta " +
          "todos os cálculos de ângulo.</p>",
        visual: svgStep(["surf", "N"]),
      },
      {
        title: "A fonte de luz e o vetor L",
        body:
          "<p>Cada <b>fonte de luz</b> tem posição/direção e cor/intensidade. Dela vem o vetor " +
          "<span class='hl'>L</span>, que aponta de P <b>para a luz</b>.</p>" +
          "<p>O ângulo entre <b>N</b> e <b>L</b> controla a componente <b>difusa</b> (N·L).</p>",
        visual: svgStep(["surf", "N", "L"]),
      },
      {
        title: "O observador e o vetor V",
        body:
          "<p>O <b>observador/câmera</b> define o vetor <span class='ok'>V</span>, de P " +
          "<b>para o olho</b>.</p>" +
          "<p>Ele é necessário para a componente <b>especular</b> (brilho), que depende de onde " +
          "se olha.</p>",
        visual: svgStep(["surf", "N", "L", "V"]),
      },
      {
        title: "Reflexão R e luz ambiente",
        body:
	          "<p>Como <b>L</b> foi definido de <b>P para a luz</b>, o raio incidente que chega em P tem direção <b>−L</b>. " +
	          "Para vetores normalizados, o vetor refletido em direção ao observador é " +
	          "<span style='color:var(--orange);font-weight:600'>R = 2(N·L)N − L</span>.</p>" +
	          "<p>O brilho especular é forte quando <b>R</b> se alinha com <b>V</b>.</p>" +
          "<p>A <b>luz ambiente</b> é uma iluminação de fundo, uniforme, que aproxima a luz " +
          "indireta da cena.</p>",
        visual: svgStep(["surf", "N", "L", "V", "R", "amb"]),
      },
      S.comparison({
        title: "Resumo: elementos da iluminação",
        intro: "<p>O modelo combina todos eles para chegar à intensidade em P.</p>",
        headers: ["Elemento", "Papel no cálculo"],
        rows: [
          ["Fonte de luz", "Origem da luz (posição/direção, cor, intensidade) → vetor L"],
          ["Superfície + normal N", "Geometria local; orienta os ângulos"],
          ["Material (k_a, k_d, k_s, n)", "Como a superfície reflete (ambiente/difuso/especular)"],
          ["Observador V", "Direção de visão; necessária ao especular"],
	          ["Reflexão R", "Com L apontando para a luz: R = 2(N·L)N − L; pico do brilho especular"],
          ["Luz ambiente", "Iluminação de fundo (aproxima a indireta)"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q04-elementos-iluminacao",
    num: "4",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Elementos para o cálculo de iluminação",
    type: "conceitual",
    tags: ["iluminação", "vetores", "normal"],
    hubDesc: "Luz, normal N, observador V, reflexão R, material e ambiente — num ponto P.",
    statement:
      "Quais são os <strong>elementos utilizados em uma cena para cálculo de iluminação</strong>?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
