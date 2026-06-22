/*
 * g19-sombreamento.js — Guia: sombreamento Flat, Gouraud e Phong.
 * Onde a iluminação é calculada: por face (Flat), por vértice com interpolação
 * de cor (Gouraud) ou por pixel com interpolação de normais (Phong). O eixo
 * comum (em que granularidade?), as bandas de Mach do Gouraud e a distinção
 * entre o SOMBREAMENTO de Phong e o MODELO de iluminação de Phong.
 *
 * Visual: SVG (polígonos + gradientes lineares/radiais).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var svgEl = EX.util.svgEl;

  function lgrad(svg, id, x1, y1, x2, y2, stops) {
    var defs = svgEl("defs");
    var g = svgEl("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2, gradientUnits: "userSpaceOnUse" });
    stops.forEach(function (s) { g.appendChild(svgEl("stop", { offset: s[0], "stop-color": s[1] })); });
    defs.appendChild(g); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }
  function rgrad(svg, id, cx, cy, r, stops) {
    var defs = svgEl("defs");
    var g = svgEl("radialGradient", { id: id, cx: cx, cy: cy, r: r, gradientUnits: "userSpaceOnUse" });
    stops.forEach(function (s) { g.appendChild(svgEl("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] })); });
    defs.appendChild(g); svg.root.appendChild(defs);
    return "url(#" + id + ")";
  }
  function facetSphere(svg, cx, cy, R, n) {
    function w(y) { var t = R * R - (y - cy) * (y - cy); return t > 0 ? Math.sqrt(t) : 0; }
    for (var b = 0; b < n; b++) {
      var y0 = cy - R + b * (2 * R / n), y1 = y0 + 2 * R / n;
      var w0 = w(y0), w1 = w(y1), ym = (y0 + y1) / 2;
      var lit = Math.max(0.16, Math.min(1, 0.34 + 0.6 * (1 - Math.abs(ym - (cy - R * 0.4)) / (R * 1.4))));
      svg.polygon([[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]],
        { fill: "var(--accent)", opacity: lit, stroke: "var(--bg)", strokeWidth: 1 });
    }
  }

  function build() {
    return [
      {
        title: "Onde calcular a luz na malha?",
        body:
          "<p>O modelo de iluminação (ver <em>Phong</em>) diz <b>o que</b> calcular num ponto: " +
          "ambiente + difusa(N·L) + especular(R·V)ⁿ. Mas uma superfície curva, na prática, vira uma " +
          "<b>malha de polígonos</b> — e avaliar a fórmula em <em>todo</em> ponto contínuo é impossível.</p>" +
          "<p>Surge então uma escolha de <b>granularidade</b>: rodar o modelo de iluminação " +
          "<b>uma vez por face</b>, <b>uma vez por vértice</b> ou <b>uma vez por pixel</b>? Entre as " +
          "amostras, <em>interpolamos</em> (a mesma interpolação linear incremental do DDA).</p>" +
          "<p>Essas três respostas têm nome: <b>Flat</b>, <b>Gouraud</b> e <b>Phong</b> — cada uma troca " +
          "<span class='hl'>custo por qualidade</span> de um jeito diferente. A pergunta é sempre a " +
          "mesma: amostrar a luz com que frequência, e interpolar o quê.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            svg.circle(180, 120, 90, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
            svg.text(180, 120, "malha", { size: 13, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Flat: uma cor por face",
        body:
          "<p>Usa <b>uma normal por face</b> (a normal geométrica do polígono) e roda o modelo de " +
          "iluminação <b>uma única vez</b> → a face inteira recebe <b>uma cor</b> chapada.</p>" +
          "<p>É o mais barato (uma avaliação por polígono, nada de interpolar). O preço: as " +
          "<b>facetas ficam visíveis</b> — a curva parece um poliedro, e o salto de cor entre faces " +
          "vizinhas salta aos olhos (o olho ainda exagera esse salto — ver bandas de Mach adiante).</p>" +
          "<p><b>Quando é o certo?</b> Para poliedros de faces <em>realmente</em> planas — cubo, prisma, " +
          "low-poly estilizado — Flat é <b>exato</b>, não uma aproximação. O problema só aparece quando a " +
          "malha <em>finge</em> ser curva.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            facetSphere(svg, 180, 120, 92, 7);
            svg.text(180, 228, "facetas visíveis: 1 cor por face", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Gouraud: interpola a COR dos vértices",
        body:
          "<p>Calcula o modelo de iluminação <b>nos vértices</b> (usando normais <em>de vértice</em> — a " +
          "média das normais das faces ao redor, o que “arredonda” a malha) e <b>interpola a cor</b> " +
          "resultante pelo interior da face, por varredura.</p>" +
          "<p>O resultado é <b>suave</b>: o aspecto facetado some, com custo modesto (a iluminação roda " +
          "só nos vértices; o interior é interpolação barata). Por décadas foi o padrão de hardware.</p>" +
          "<p><b>Falha clássica:</b> se um <b>brilho especular</b> cairia no <em>meio</em> de uma face, " +
          "não há vértice ali para “acendê-lo” — o realce <span class='no'>desaparece</span> ou vira uma " +
          "mancha disforme que estica entre vértices. Interpolar a <em>cor já calculada</em> não " +
          "reconstrói um pico que existia só no interior.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 280);
            var A = [180, 40], B = [70, 240], C = [300, 240];
            var f = lgrad(svg, "g19g", 180, 40, 185, 240, [[0, "var(--yellow)"], [0.5, "var(--accent)"], [1, "#14223a"]]);
            svg.polygon([A, B, C], { fill: f, stroke: "var(--ink-dim)", strokeWidth: 1.5 });
            svg.circle(A[0], A[1], 7, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(B[0], B[1], 7, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(C[0], C[1], 7, { fill: "#14223a", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(180, 268, "cor calculada nos vértices, interpolada", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Bandas de Mach: o olho denuncia o Gouraud",
        body:
          "<p>A cor no Gouraud é interpolada <b>linearmente</b> por triângulo. Onde dois triângulos se " +
          "encontram, a cor é contínua, mas a <b>taxa de variação</b> (a inclinação) muda de repente — há " +
          "um “bico” no gradiente.</p>" +
          "<p>A visão humana realça bordas por <b>inibição lateral</b>: ela <em>amplifica</em> essas " +
          "quebras de inclinação. O resultado são as <b>bandas de Mach</b> — listras claras/escuras " +
          "fantasmas nas junções, que <span class='no'>não existem</span> nos dados, só na percepção.</p>" +
          "<p>É um artefato perceptual, não numérico: aumentar o número de polígonos atenua (as quebras " +
          "ficam menores e mais próximas), mas só o <b>Phong</b> — que interpola normais e recalcula a " +
          "luz por pixel — produz um gradiente curvo, sem os bicos que disparam o efeito.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 230);
            // faixas de brilho crescente: o degrau de inclinação entre elas evoca a banda de Mach
            var ramp = [0.20, 0.36, 0.52, 0.68, 0.84];
            ramp.forEach(function (op, i) {
              svg.rect(30 + i * 60, 50, 60, 90, { fill: "var(--accent)", opacity: op, stroke: "none" });
              svg.line(30 + (i + 1) * 60, 50, 30 + (i + 1) * 60, 140, { stroke: "var(--bg)", strokeWidth: 1 });
            });
            svg.text(180, 168, "nas junções o olho “vê” listras que não estão lá", { size: 11.5, color: "var(--ink-dim)" });
            svg.text(180, 190, "(bandas de Mach — quebra de inclinação da cor)", { size: 11, color: "var(--ink-mute)" });
          },
        },
      },
      {
        title: "Phong: interpola as NORMAIS, ilumina por pixel",
        body:
          "<p>Interpola as <b>normais</b> dos vértices para <b>cada pixel</b> (renormalizando, pois a média " +
          "linear encurta o vetor) e só <b>então</b> roda o modelo de iluminação, pixel a pixel. A ordem " +
          "se inverte em relação ao Gouraud: <em>interpolar primeiro, iluminar depois</em>.</p>" +
          "<p>Como cada fragmento tem sua <b>própria normal</b>, o termo especular <code>(R·V)ⁿ</code> é " +
          "reconstruído onde quer que caia o pico — o brilho fica <b>correto e bem-formado</b> mesmo no " +
          "meio da face, e somem as bandas de Mach.</p>" +
          "<p>Custa mais: uma avaliação completa de iluminação <b>por pixel</b>, não por vértice. É " +
          "exatamente o trabalho de um <em>fragment shader</em> moderno — por isso o sombreamento de " +
          "Phong é hoje o caso comum em GPU, embora nos anos 70–90 fosse caro demais.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 280);
            var A = [180, 40], B = [70, 240], C = [300, 240];
            svg.polygon([A, B, C], { fill: "var(--accent)", opacity: 0.4, stroke: "var(--ink-dim)", strokeWidth: 1.5 });
            [100, 140, 180, 220, 260].forEach(function (x, i) {
              var tilt = (i - 2) * 9;
              svg.arrow(x, 232, x + tilt, 198, { color: "var(--cyan)", strokeWidth: 1.6, head: 6 });
            });
            var hl = rgrad(svg, "g19h", 188, 150, 42, [[0, "var(--yellow)", 0.95], [0.5, "var(--yellow)", 0.4], [1, "var(--yellow)", 0]]);
            svg.circle(188, 150, 42, { fill: hl });
            svg.text(180, 268, "normais interpoladas → brilho por pixel", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "O eixo comum: em que granularidade?",
        body:
          "<p>Vale guardar os três como pontos de uma <b>mesma régua</b> — “com que frequência amostro a " +
          "iluminação, e o que interpolo entre as amostras”:</p>" +
          "<ul>" +
          "<li><b>Flat</b>: amostra <b>1×/face</b>, interpola <b>nada</b> (normal constante por face);</li>" +
          "<li><b>Gouraud</b>: amostra <b>1×/vértice</b>, interpola a <b>cor</b>;</li>" +
          "<li><b>Phong</b>: amostra <b>1×/pixel</b>, interpola a <b>normal</b>.</li>" +
          "</ul>" +
          "<p>Quanto mais fina a amostragem, mais cara e mais fiel — e mais para o fim do pipeline ela " +
          "acontece (face → vértice → fragmento). O que se interpola também importa: <b>cor</b> (Gouraud) " +
          "perde picos do interior; <b>normal</b> (Phong) os preserva, porque a luz só é avaliada depois " +
          "de a normal já estar no lugar certo.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "note",
              title: "Uma régua só",
              html: "Flat → Gouraud → Phong = amostrar a luz por <b>face</b> → por <b>vértice</b> → por " +
                "<b>pixel</b>. Interpolar <b>cor</b> esconde realces; interpolar <b>normais</b> os recupera.",
            });
          },
        },
      },
      {
        title: "Cuidado: dois “Phong” diferentes",
        body:
          "<p>“Phong” nomeia <b>duas coisas distintas</b> — confundi-las é um erro de prova clássico:</p>" +
          "<ul>" +
          "<li><b>Modelo de iluminação de Phong</b> = <em>o que</em> calcular (ambiente + difusa + " +
          "especular) — o tema do guia anterior;</li>" +
          "<li><b>Sombreamento de Phong</b> = <em>onde/com que frequência</em> calcular (por pixel, " +
          "interpolando normais).</li>" +
          "</ul>" +
          "<p>São <b>independentes</b>: dá para usar o <b>modelo</b> de Phong com sombreamento Flat, " +
          "Gouraud ou Phong — e, em tese, outro modelo de iluminação com sombreamento de Phong. Um diz " +
          "a fórmula; o outro, a granularidade em que ela roda.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "warn",
              title: "Modelo ≠ sombreamento",
              html: "“Phong” nomeia tanto <b>o que</b> calcular (o modelo de iluminação) quanto " +
                "<b>onde</b> calcular (o sombreamento por pixel). São coisas independentes.",
            });
          },
        },
      },
      {
        title: "Comparação e resumo",
        body: "<p>Custo sobe, qualidade sobe:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Flat", "Gouraud", "Phong"],
              rows: [
                ["Calcula em", "face", "vértices", "cada pixel"],
                ["Interpola", "nada", "a cor", "as normais"],
                ["Aparência", "facetada", "suave", "suave + brilho certo"],
                ["Highlight", "impossível", "pode sumir", "correto"],
                ["Bandas de Mach", "fortes (degraus)", "visíveis", "ausentes"],
                ["Custo", "baixo", "médio", "alto"],
              ],
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g19-sombreamento",
    num: "◐",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Sombreamento Flat, Gouraud e Phong",
    type: "conceitual",
    tags: ["sombreamento", "gouraud", "phong", "mach"],
    hubDesc: "Iluminação por face, por vértice (interpola cor) ou por pixel (interpola normais); bandas de Mach; modelo ≠ sombreamento.",
    statement:
      "Entenda os sombreamentos Flat, Gouraud e Phong: o cálculo da iluminação por face, por vértice " +
      "(interpolando cores) ou por pixel/fragmento (interpolando normais), o eixo comum de granularidade, " +
      "as bandas de Mach do Gouraud e a diferença entre o sombreamento de Phong e o modelo de iluminação " +
      "de Phong.",
    parts: [{ label: "Guia", build: build }],
  });
})();
