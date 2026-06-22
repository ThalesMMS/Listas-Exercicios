/*
 * q02.js — Diferença entre os modelos RGB e CMYK.
 * Diagrama SVG: roda aditiva (RGB, sobre preto, blend "screen") e roda
 * subtrativa (CMYK, sobre branco, blend "multiply").
 *
 * Observação: as cores das rodas são PURAS (R/G/B, C/M/Y) e os fundos são
 * fixos (preto p/ aditiva, branco p/ subtrativa) de propósito — fazem parte do
 * conceito (a mistura aditiva parte do preto; a subtrativa, do branco) e por
 * isso não seguem o tema. O texto fora dos painéis usa as cores do tema.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  // Desenha uma roda de 3 círculos com mistura por blend-mode dentro de `parent`.
  function wheel(svg, parent, cx, cy, kind) {
    var g = svg.group({ parent: parent });
    g.style.isolation = "isolate"; // contém o blend dentro do grupo
    var bg = kind === "rgb" ? "#0a0a0f" : "#fbfbfb";
    var blend = kind === "rgb" ? "screen" : "multiply";
    var cols = kind === "rgb"
      ? ["#ff2d2d", "#22e04a", "#2d7bff"]   // R, G, B
      : ["#16e0e0", "#ff3df0", "#ffe11a"];  // C, M, Y
    var labels = kind === "rgb" ? ["R", "G", "B"] : ["C", "M", "Y"];
    var ink = kind === "rgb" ? "#f4f7fa" : "#171717";

    svg.rect(cx - 90, cy - 96, 180, 188, { fill: bg, stroke: "var(--border)", strokeWidth: 1.5, rx: 16, parent: g });
    var r = 54;
    var pos = [[cx, cy - 34], [cx - 30, cy + 20], [cx + 30, cy + 20]];
    for (var i = 0; i < 3; i++) {
      var c = svg.circle(pos[i][0], pos[i][1], r, { fill: cols[i], parent: g });
      c.style.mixBlendMode = blend;
      c.setAttribute("fill-opacity", "0.92");
    }
    // rótulos das primárias
    var lp = [[cx, cy - 60], [cx - 56, cy + 40], [cx + 56, cy + 40]];
    for (i = 0; i < 3; i++) {
      svg.text(lp[i][0], lp[i][1], labels[i], { size: 16, weight: 800, color: ink, parent: g });
    }
    // resultado no centro
    svg.text(cx, cy + 4, kind === "rgb" ? "branco" : "preto (K)", { size: 11.5, weight: 700, color: ink, parent: g });
    return g;
  }

  function scene(svg, stage) {
    svg.view(760, 440);
    function grp(name) {
      var g = svg.group({});
      g.setAttribute("opacity", stage === "all" || stage === name ? 1 : 0.18);
      return g;
    }
    var gL = grp("rgb");
    var gR = grp("cmyk");

    svg.text(210, 70, "RGB — síntese aditiva", { size: 15, weight: 700, color: "var(--ink)", parent: gL });
    svg.text(210, 360, "fundo preto · somar luz → branco", { size: 12, color: "var(--ink-dim)", parent: gL });
    wheel(svg, gL, 210, 200, "rgb");

    svg.text(550, 70, "CMYK — síntese subtrativa", { size: 15, weight: 700, color: "var(--ink)", parent: gR });
    svg.text(550, 360, "fundo branco · somar tinta → preto (K)", { size: 12, color: "var(--ink-dim)", parent: gR });
    wheel(svg, gR, 550, 200, "cmyk");
  }

  function svgStep(stage) {
    return { type: "svg", draw: function (svg) { scene(svg, stage); } };
  }

  function build() {
    return [
      S.concept({
        title: "Dois jeitos de formar cor: somar luz ou somar tinta",
        body:
          "<p>RGB e CMYK são <b>modelos de cor</b>: receitas para <b>reproduzir</b> uma cor a partir " +
          "de algumas <b>primárias</b>. A diferença essencial é a <b>síntese</b> — o que acontece " +
          "quando combinamos as primárias:</p>" +
          "<ul><li><span class='accent'>RGB</span> — <b>aditiva</b>: combina <b>luz</b> emitida " +
          "(Vermelho, Verde, Azul). Mais primárias → <b>mais claro</b>.</li>" +
          "<li><span class='hl'>CMYK</span> — <b>subtrativa</b>: combina <b>pigmentos</b> que " +
          "absorvem luz (Ciano, Magenta, Amarelo + Preto). Mais primárias → <b>mais escuro</b>.</li></ul>" +
          "<p>Ambos são <b>dependentes de dispositivo</b>: o mesmo \"(255, 0, 0)\" varia de monitor " +
          "para monitor (por isso existem espaços padronizados como o <b>sRGB</b>).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "RGB — aditiva (luz)",
        body:
          "<p>No <span class='accent'>RGB</span> partimos do <b>preto</b> (ausência de luz) e " +
          "<b>somamos</b> luz das três primárias. Cada canal costuma variar de <b>0 a 255</b> " +
          "(8 bits → ~16,7 milhões de cores). Quanto mais luz, mais claro:</p>" +
          "<ul><li>R + G = amarelo; G + B = ciano; R + B = magenta (as <b>secundárias</b> aditivas " +
          "são justamente as primárias do CMY!);</li>" +
          "<li>R + G + B no máximo = <span class='ok'>branco</span>; tudo a zero = preto;</li>" +
          "<li>R = G = B (valores iguais) → tons de <b>cinza</b>.</li></ul>" +
          "<p>É o modelo das <b>fontes emissoras</b>: monitores, TVs, projetores, câmeras. O hardware " +
          "tem subpixels R, G e B; o olho os funde à distância (síntese aditiva espacial).</p>",
        visual: svgStep("rgb"),
      },
      {
        title: "CMYK — subtrativa (tinta)",
        body:
          "<p>No <span class='hl'>CMYK</span> partimos do <b>branco</b> (o papel reflete tudo) e cada " +
          "tinta <b>subtrai</b> (absorve) uma faixa da luz: o ciano absorve o vermelho, o magenta " +
          "absorve o verde, o amarelo absorve o azul. Quanto mais tinta, mais escuro:</p>" +
          "<ul><li>C + M = azul; C + Y = verde; M + Y = vermelho (as secundárias subtrativas são as " +
          "primárias do RGB — os modelos são <b>duais</b>);</li>" +
          "<li>C + M + Y deveria dar preto, mas com tintas reais sai um <b>marrom sujo</b>.</li></ul>" +
          "<p>Por isso some-se o <b>K</b> (<i>key</i>, o preto), por quatro motivos práticos: " +
          "<b>preto real</b> e denso, <b>nitidez</b> em textos finos (registro de uma só chapa), " +
          "<b>economia</b> de tinta colorida e <b>secagem</b> mais rápida (menos tinta no papel). " +
          "A conversão CMY→CMYK usa <i>UCR/GCR</i> para trocar parte do CMY por K.</p>" +
          "<p>É o modelo da <b>impressão</b> (pigmentos que refletem a luz ambiente).</p>",
        visual: svgStep("cmyk"),
      },
      S.concept({
        title: "Gamut: por que a tela e a impressão divergem",
        body:
          "<p>O conjunto de cores que um modelo/dispositivo consegue reproduzir é o seu " +
          "<b>gamut</b>. Os gamuts de RGB e CMYK <b>não coincidem</b>:</p>" +
          "<ul><li>verdes e azuis <b>vivos</b> da tela (RGB) muitas vezes <b>não imprimem</b> — caem " +
          "fora do gamut CMYK e saem mais apagados;</li>" +
          "<li>alguns cianos de impressão são difíceis de exibir fielmente na tela.</li></ul>" +
          "<p>Por isso converter <b>RGB → CMYK</b> é uma operação <b>com perdas</b>: cores fora do " +
          "gamut precisam ser <i>mapeadas</i> para a cor reproduzível mais próxima. É o que faz a " +
          "prova de cor (<i>soft proofing</i>) parecer mais sem graça que o original na tela.</p>",
        visual: svgStep("all"),
      }),
      S.comparison({
        title: "Resumo: RGB × CMYK",
        intro: "<p>Mesma cor, lógicas opostas: emitir luz × absorver luz.</p>",
        headers: ["", "RGB", "CMYK"],
        rows: [
          ["Síntese", "Aditiva (luz)", "Subtrativa (pigmento)"],
          ["Primárias", "Vermelho, Verde, Azul", "Ciano, Magenta, Amarelo (+ Preto K)"],
          ["Ponto de partida", "Preto (sem luz)", "Branco (papel)"],
          ["Soma das primárias", "Branco", "Preto (na prática, + K)"],
          ["Secundárias", "C, M, Y", "R, G, B (modelos duais)"],
          ["Origem da cor", "Emissão de luz", "Absorção de luz refletida"],
          ["Gamut", "Maior (azuis/verdes vivos)", "Menor (não cobre tudo de RGB)"],
          ["Uso típico", "Telas, monitores, projetores", "Impressão, gráfica"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q02-rgb-cmyk",
    num: "2",
    subject: "Computação Gráfica — Lista 3",
    section: "I) Cor e Percepção",
    title: "Modelo RGB × CMYK",
    type: "conceitual",
    tags: ["cor", "rgb", "cmyk"],
    hubDesc: "Síntese aditiva (luz) versus subtrativa (pigmento), com as rodas de cor.",
    statement: "Diferencie o modelo <strong>RGB</strong> de <strong>CMYK</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
