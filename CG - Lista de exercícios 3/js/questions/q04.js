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
          "<p>Para calcular a cor (intensidade) de um ponto, um modelo de iluminação precisa de um " +
          "conjunto de <b>elementos da cena</b> — são as <b>entradas</b> que alimentam a equação de " +
          "sombreamento (como a de Phong, na questão 10).</p>" +
          "<p>No ponto <span class='accent'>P</span> da superfície reunimos quatro <b>vetores</b> " +
          "(N, L, V, R) e as <b>propriedades do material</b> (ao lado). Uma regra de ouro: todos os " +
          "vetores são <b>normalizados</b> (comprimento 1), porque o modelo usa <b>produtos " +
          "escalares como cossenos de ângulos</b> — e só vetores unitários dão N·L = cos θ.</p>" +
          "<p>Vamos revelar cada elemento e seu papel.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Superfície, ponto P e a normal N",
        body:
          "<p>Tudo acontece num <b>ponto P</b> de uma <b>superfície/objeto</b>, que tem um " +
          "<b>material</b>: cor e os coeficientes de reflexão <code>k_a</code> (ambiente), " +
          "<code>k_d</code> (difuso), <code>k_s</code> (especular) e o expoente de brilho " +
          "<code>n</code>. Esse conjunto é uma forma simples de <b>BRDF</b> — a função que diz " +
          "quanta luz a superfície reflete.</p>" +
          "<p>A <span class='accent'>normal N</span> — perpendicular à superfície em P — orienta " +
          "<b>todos</b> os cálculos de ângulo. Como obtê-la: para uma face poligonal, pelo " +
          "<b>produto vetorial</b> de duas arestas; para uma esfera, é <b>(P − centro)</b> " +
          "normalizado; para sombreamento suave, interpola-se a normal dos vértices.</p>",
        visual: svgStep(["surf", "N"]),
      },
      {
        title: "A fonte de luz e o vetor L",
        body:
          "<p>Cada <b>fonte de luz</b> tem posição/direção e cor/intensidade (I_L). Dela vem o vetor " +
          "<span class='hl'>L</span>, que aponta de P <b>para a luz</b> e é normalizado:</p>" +
          "<ul><li><b>Luz pontual</b>: L = (posição_luz − P), normalizado — muda a cada ponto;</li>" +
          "<li><b>Luz direcional</b> (Sol): L é <b>constante</b> em toda a cena.</li></ul>" +
          "<p>O ângulo θ entre <b>N</b> e <b>L</b> controla a componente <b>difusa</b>: " +
          "<b>N·L = cos θ</b>. Vale a luz só quando N·L &gt; 0 (a fonte está acima do horizonte da " +
          "superfície); valores negativos são <b>cortados em 0</b>.</p>",
        visual: svgStep(["surf", "N", "L"]),
      },
      {
        title: "O observador e o vetor V",
        body:
          "<p>O <b>observador/câmera</b> define o vetor <span class='ok'>V</span> = (posição_olho − P), " +
          "normalizado — aponta de P <b>para o olho</b>.</p>" +
          "<p>Ele é necessário para a componente <b>especular</b> (o brilho), que é a única que " +
          "<b>depende de onde se olha</b>: mexa a cabeça e o reflexo \"anda\" pela superfície. A " +
          "componente difusa, por outro lado, ignora V.</p>",
        visual: svgStep(["surf", "N", "L", "V"]),
      },
      {
        title: "Reflexão R e luz ambiente",
        body:
	          "<p>Como <b>L</b> foi definido de <b>P para a luz</b>, o raio incidente que chega em P tem direção <b>−L</b>. " +
	          "Para vetores normalizados, o vetor refletido em direção ao observador é " +
	          "<span style='color:var(--orange);font-weight:600'>R = 2(N·L)N − L</span>.</p>" +
	          "<p>Geometricamente, R é <b>−L espelhado em torno de N</b>. O brilho especular é forte quando <b>R</b> se alinha com <b>V</b> (ângulo pequeno entre eles). <b>Variante Blinn-Phong:</b> em vez de R, usa-se o <b>vetor médio</b> H = normalize(L + V) e mede-se N·H — mais barato e numericamente estável.</p>" +
          "<p>A <b>luz ambiente</b> é uma iluminação de fundo, <b>uniforme e sem direção</b>, que " +
          "aproxima de forma grosseira a luz <b>indireta</b> (rebatida) da cena — é o que evita que " +
          "as regiões na sombra fiquem totalmente pretas.</p>",
        visual: svgStep(["surf", "N", "L", "V", "R", "amb"]),
      },
      {
        title: "Juntando tudo: como os elementos entram na conta",
        body: "<p>Com os vetores e o material em mãos, o modelo combina três contribuições no " +
          "ponto P (ao lado). Repare quem usa o quê.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "note", title: "Difuso usa N e L",
              html: "Proporcional a <b>N·L = cos θ</b>: depende só da geometria luz-superfície, " +
                "<b>não</b> do observador.",
            });
            EX.Content.callout(host, {
              kind: "note", title: "Especular usa R (ou H) e V",
              html: "Depende do alinhamento <b>R·V</b> (ou N·H, no Blinn) — por isso o brilho " +
                "<b>se move</b> quando o observador se move.",
            });
            EX.Content.callout(host, {
              kind: "warn", title: "Armadilha: vetores não normalizados",
              html: "Se N, L, V ou R não tiverem comprimento 1, os produtos escalares <b>deixam de " +
                "ser cossenos</b> e a iluminação sai errada (brilhos deslocados, faces escuras).",
            });
          },
        },
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
