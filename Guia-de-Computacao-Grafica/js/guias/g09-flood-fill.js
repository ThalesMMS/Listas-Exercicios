/*
 * g09-flood-fill.js — Guia: Flood Fill (balde de tinta).
 * Recolore uma região conectada de UMA cor a partir de uma semente; o critério
 * de parada é a COR ANTIGA (não a cor de borda). Conectividade 4/8, ordem
 * BFS/DFS, otimização por spans, tolerância em bordas suavizadas e comparação
 * com Boundary Fill.
 *
 * Reusa EX.Raster.flood (BFS).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var PURPLE_SOFT = COL.purpleSoft || "rgba(183,148,246,0.18)";

  var BNDS = { xmin: 0, xmax: 13, ymin: 0, ymax: 9 };
  var B = [BNDS.xmin, BNDS.xmax, BNDS.ymin, BNDS.ymax];
  var SEED = { x: 6, y: 4 };

  // Região de "cor antiga" = interior [3..10]x[3..6]; tudo o mais bloqueia.
  var region = [];
  for (var x = 3; x <= 10; x++) for (var y = 3; y <= 6; y++) region.push([x, y]);
  var inRegion = {};
  region.forEach(function (c) { inRegion[c[0] + "," + c[1]] = true; });
  var blocked = {};
  for (var bx = BNDS.xmin; bx <= BNDS.xmax; bx++)
    for (var by = BNDS.ymin; by <= BNDS.ymax; by++)
      if (!inRegion[bx + "," + by]) blocked[bx + "," + by] = true;
  var order = EX.Raster.flood(SEED, blocked, BNDS, 4);

  // Runs (trechos contíguos por linha) da região final — base do passo "spans".
  var runs = EX.Raster.runsByRow(order);

  // --- Cena "duas manchas tocando pela quina" (4-conex separa, 8-conex une) ---
  var TWO = { xmin: 0, xmax: 11, ymin: 0, ymax: 9 };
  var TWOB = [TWO.xmin, TWO.xmax, TWO.ymin, TWO.ymax];
  var twoSeed = { x: 3, y: 6 };
  // Bloco A (alto-esquerda) e bloco B (baixo-direita) compartilham só o vértice
  // entre (4,4) e (5,3): contato puramente diagonal.
  var twoRegion = [];
  (function () {
    var x, y;
    for (x = 2; x <= 4; x++) for (y = 4; y <= 6; y++) twoRegion.push([x, y]); // A
    for (x = 5; x <= 7; x++) for (y = 1; y <= 3; y++) twoRegion.push([x, y]); // B
  })();
  var twoIn = {};
  twoRegion.forEach(function (c) { twoIn[c[0] + "," + c[1]] = true; });
  var twoBlocked = {};
  for (var tx = TWO.xmin; tx <= TWO.xmax; tx++)
    for (var ty = TWO.ymin; ty <= TWO.ymax; ty++)
      if (!twoIn[tx + "," + ty]) twoBlocked[tx + "," + ty] = true;
  var two4 = EX.Raster.flood(twoSeed, twoBlocked, TWO, 4);
  var two8 = EX.Raster.flood(twoSeed, twoBlocked, TWO, 8);

  function frame(plane, count) {
    // contorno do interior (referência da "cor antiga")
    region.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: "rgba(120,130,150,0.20)", stroke: COL.muted });
    });
    for (var k = 0; k < count && k < order.length; k++) {
      plane.pixel(order[k].x, order[k].y, { fill: COL.greenSoft, stroke: COL.green });
    }
    plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
  }
  // Cena das duas manchas: cinza = "cor antiga" das duas; pintado = o que o
  // flood alcançou a partir da semente (em A).
  function twoFrame(plane, cells) {
    twoRegion.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: "rgba(120,130,150,0.20)", stroke: COL.muted });
    });
    cells.forEach(function (c) {
      plane.pixel(c.x, c.y, { fill: COL.greenSoft, stroke: COL.green });
    });
    plane.pixel(twoSeed.x, twoSeed.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "O balde de tinta",
      body:
        "<p>Você clica numa área de cor uniforme e ela toda muda de cor — é o Flood Fill, o " +
        "“balde de tinta” (<em>paint bucket</em>) que existe em todo editor de imagem.</p>" +
        "<p>A região (em cinza) tem <b>uma cor só</b>; a <span class='ok'>semente</span> marca onde " +
        "clicamos. A tinta nova se espalha por toda a mancha conectada que compartilha aquela cor, e " +
        "para sozinha ao chegar na primeira cor diferente.</p>" +
        "<p>O contraste com o Boundary Fill (guia anterior) está no que faz parar: lá era uma " +
        "<em>cor de borda</em> combinada de antemão; aqui é a <b>própria cor da semente</b> que define " +
        "o que ainda faz parte da mancha. Ninguém precisa avisar onde está a borda — ela é, por " +
        "definição, “onde a cor antiga acaba”.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, 0); } },
    });

    steps.push({
      title: "A regra: troque a cor antiga pela nova",
      body:
        "<p>Primeiro leia e guarde a <b>cor antiga</b> = cor do pixel onde se clicou (a semente). " +
        "Então, espalhando por vizinhos, o teste de cada pixel <code>p</code> é:</p>" +
        "<ul><li>se <code>cor(p)</code> é a <span class='hl'>cor antiga</span> → repinte com a cor nova " +
        "e continue por seus vizinhos;</li>" +
        "<li>se é <b>qualquer outra cor</b> → pare (é fronteira da mancha).</li></ul>" +
        "<div class='formula'>antiga = cor(semente)\nse cor(p) == antiga:\n    pinta(p, nova); empilha vizinhos(p)</div>" +
        "<p><b>Cuidado clássico:</b> se a cor nova for <span class='no'>igual</span> à antiga, o pixel " +
        "repintado continua “parecendo” a cor antiga e o algoritmo o revisita para sempre — laço " +
        "infinito. A guarda é trivial (se <code>nova == antiga</code>, não faça nada), mas é o erro " +
        "número um de quem implementa pela primeira vez.</p>" +
        "<p>E note: o limite não é uma cor de borda específica, é <b>tudo que não seja a cor antiga</b>. " +
        "Por isso a região a recolorir precisa ser de uma cor homogênea — qualquer pixel “estranho” no " +
        "meio vira uma ilha que a tinta contorna.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, 0); } },
    });

    steps.push({
      title: "Conectividade 4 ou 8",
      body:
        "<p>Como no Boundary Fill, “vizinho” pode ser <b>4-conex</b> (só os ortogonais, em " +
        "<span class='accent'>azul</span>) ou <b>8-conex</b> (incluindo as diagonais, em " +
        "<span class='hl'>roxo</span>).</p>" +
        "<p>A consequência é a definição do que conta como “a mesma mancha”: com 8-conex, duas áreas " +
        "que se encostam <b>só pela quina</b> são percorridas como <b>uma só</b>; com 4-conex, ficam " +
        "<b>separadas</b>, porque o passo diagonal não existe. É o mesmo fenômeno do vazamento " +
        "diagonal do Boundary Fill, visto pelo outro lado: lá a diagonal deixava a tinta <em>escapar</em> " +
        "de dentro; aqui ela <em>une</em> regiões que pareciam distintas.</p>" +
        "<p>O próximo passo mostra exatamente esse caso de borda.</p>",
      visual: {
        type: "plane",
        bounds: [-4, 4, -4, 4],
        draw: function (plane) {
          plane.pixel(0, 0, { fill: COL.greenSoft, stroke: COL.green, label: "c" });
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: COL.accentSoft, stroke: COL.accent, label: "4" });
          });
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) {
            plane.pixel(d[0], d[1], { fill: PURPLE_SOFT, stroke: COL.purple, label: "8" });
          });
        },
      },
    });

    // NOVO: duas manchas que se tocam pela quina — 8-conex as funde.
    steps.push({
      title: "Quina diagonal: uma mancha ou duas?",
      body:
        "<p>Duas áreas de cor antiga (cinza) se tocam <b>apenas pelo vértice</b> entre <code>(4, 4)</code> " +
        "e <code>(5, 3)</code>. A semente está na de cima.</p>" +
        "<p>Com <b>4-conex</b> o flood pinta só o bloco da semente (" + two4.length + " pixels): não há " +
        "passo ortogonal ligando os dois, então a mancha de baixo <span class='ok'>fica intacta</span>. " +
        "O desenho mostra o caso <b>8-conex</b>, em que a frente cruza a quina e pinta <b>os dois " +
        "blocos</b> (" + two8.length + " pixels) como uma região única.</p>" +
        "<p>Qual está “certo”? Depende da intenção. É por isso que editores expõem a opção — e por que " +
        "a conectividade tem de ser uma decisão consciente, não um detalhe esquecido do laço de " +
        "vizinhos.</p>",
      visual: {
        type: "plane",
        bounds: TWOB,
        draw: function (plane) {
          twoFrame(plane, two8);
        },
      },
    });

    var FRAMES = 6;
    for (var f = 1; f <= FRAMES; f++) {
      (function (count, idx) {
        steps.push({
          title: "Recolorindo… (" + Math.min(count, order.length) + "/" + order.length + ")",
          body:
            "<p>A nova cor toma a mancha a partir da semente (BFS, 4-conex), " +
            (idx === FRAMES
              ? "até <b>toda a região de cor antiga</b> ter sido trocada (" +
                order.length +
                " pixels)."
              : "sempre só onde encontra a <b>cor antiga</b>.") +
            "</p>" +
            (idx === 1
              ? "<p>Usamos uma <b>fila</b> (BFS), então a mancha cresce em frentes concêntricas. " +
                "Uma <b>pilha</b> (DFS) chegaria ao mesmo conjunto final, percorrendo-o em outra " +
                "ordem — a recoloração não depende disso, só a sequência de visita.</p>"
              : ""),
          visual: { type: "plane", bounds: B, draw: function (plane) { frame(plane, count); } },
        });
      })(Math.round((order.length * f) / FRAMES), f);
    }

    // NOVO: otimização por spans (linhas inteiras em vez de pixel a pixel).
    steps.push({
      title: "Otimização: preencher por spans",
      body:
        "<p>Empilhar <em>cada</em> pixel funciona, mas gasta muita memória e tempo. A versão clássica " +
        "eficiente (o <em>scanline flood fill</em>) trabalha por <b>spans</b>: a partir da semente, " +
        "estende para a <b>esquerda e direita</b> na linha enquanto a cor for a antiga, pinta o " +
        "trecho inteiro de uma vez e só então examina as linhas <b>de cima e de baixo</b>, empilhando " +
        "<em>um</em> ponto por novo span encontrado.</p>" +
        "<p>Na nossa região isso reduz a fila de " + order.length + " pixels para apenas " +
        runs.length + " spans (um por linha aqui). É a mesma economia do Scan-Line de polígonos: " +
        "pensar em <b>trechos horizontais</b>, não em pixels soltos.</p>" +
        "<p>O resultado pintado é idêntico — muda só o custo. Cada barra abaixo é um span tratado em " +
        "um passo só.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          region.forEach(function (c) {
            plane.pixel(c[0], c[1], { fill: "rgba(120,130,150,0.20)", stroke: COL.muted });
          });
          runs.forEach(function (r) {
            r.runs.forEach(function (seg) {
              plane.polygon(
                [
                  [seg[0] - 0.5, r.y - 0.45],
                  [seg[1] + 0.5, r.y - 0.45],
                  [seg[1] + 0.5, r.y + 0.45],
                  [seg[0] - 0.5, r.y + 0.45],
                ],
                { fill: COL.greenSoft, stroke: COL.green }
              );
            });
          });
          plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
        },
      },
    });

    steps.push(
      EX.Slides.comparison({
        title: "Flood Fill × Boundary Fill",
        intro:
          "<p>Mesmo motor (BFS/DFS por vizinhos, com a opção 4/8-conex); muda <b>o que faz parar</b>. " +
          "Flood compara com a cor da <em>semente</em>; Boundary compara com uma cor de <em>borda</em> " +
          "fixada.</p>",
        headers: ["", "Flood Fill", "Boundary Fill"],
        rows: [
          ["Para quando…", "cor ≠ cor antiga", "acha a cor de BORDA"],
          ["Região", "precisa ser uma cor só", "interior pode variar"],
          ["Conhece", "a cor a substituir", "a cor da borda"],
          ["Metáfora", "balde de tinta", "cerca em volta da tinta"],
        ],
      })
    );

    steps.push({
      title: "Tolerância: a franja do antialiasing",
      body:
        "<p>Em imagens reais a borda raramente é um degrau perfeito: o <b>antialiasing</b> deixa um anel " +
        "de pixels de cor <em>intermediária</em> entre a mancha e o fundo. Para o teste de igualdade " +
        "estrita, esses pixels já “não são a cor antiga” — e o flood para antes, deixando uma " +
        "<span class='no'>franja</span> não pintada de 1–2 pixels em volta.</p>" +
        "<p>A correção dos editores é trocar igualdade por <b>tolerância</b>: aceita-se <code>p</code> " +
        "se a distância entre <code>cor(p)</code> e a cor antiga for menor que um limiar:</p>" +
        "<div class='formula'>|R−R₀| + |G−G₀| + |B−B₀| ≤ tolerância</div>" +
        "<p>Tolerância baixa respeita detalhes finos mas deixa franja; alta come a borda e pode " +
        "“vazar” para o fundo. É o mesmo trade-off da conectividade: mais permissivo preenche mais, " +
        "porém com menos controle.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "note",
            title: "Igualdade exata × tolerância",
            html: "Borda dura (sem AA) → igualdade exata basta. Borda suave (com AA) → use tolerância, " +
              "senão sobra franja.",
          });
        },
      },
    });

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Cor nova = cor antiga</b>: sem a guarda, repintar não muda nada e o pixel é revisitado " +
        "para sempre (laço infinito).</li>" +
        "<li><b>Bordas suavizadas</b> (antialiasing): pixels intermediários deixam franja — use " +
        "tolerância.</li>" +
        "<li><b>Recursão</b>: use fila/pilha explícita (ou spans) para não estourar a pilha em áreas " +
        "grandes.</li>" +
        "<li><b>Conectividade</b>: 8-conex pode fundir manchas que tocam só pela quina — decida de " +
        "propósito.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html: "Espalhe a partir da semente trocando <b>a cor antiga</b> pela nova; pare em qualquer outra cor.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g09-flood-fill",
    num: "▦",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Flood Fill",
    type: "computacional",
    tags: ["preenchimento", "fill", "semente", "conectividade"],
    hubDesc: "Recolore uma região de uma cor a partir da semente; 4/8-conex, spans e tolerância; vs Boundary Fill.",
    statement:
      "Entenda o Flood Fill: recoloração de uma região conectada de mesma cor a partir de uma semente, a " +
      "conectividade 4 ou 8 (que pode fundir manchas), a otimização por spans, a tolerância para bordas " +
      "suavizadas e a diferença para o Boundary Fill.",
    parts: [{ label: "Guia", build: build }],
  });
})();
