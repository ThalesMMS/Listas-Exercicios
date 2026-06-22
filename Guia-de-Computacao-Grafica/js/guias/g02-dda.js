/*
 * g02-dda.js — Guia: DDA (Digital Differential Analyzer) para rasterização de
 * retas. Por que a receita ingênua falha, por que passos = max(|Δx|,|Δy|),
 * incrementos racionais e arredondamento só na hora de escolher o pixel.
 * Custo por pixel, comparação com Bresenham e por que o DDA é a base de toda
 * interpolação ao longo de arestas (cor, z, textura).
 *
 * Reusa window.ALG.ddaLine (traço exato com frações) + EX.Content / EX.Slides.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var P0 = [0, 0],
    P1 = [6, 4];
  var R = ALG.ddaLine(P0, P1); // dx=6, dy=4, passos=6, xinc=1, yinc=2/3
  var BOUNDS = [-1, 7, -1, 5];

  // Reta "ideal" + eventuais pixels já escolhidos.
  function scene(plane, upto) {
    plane.segment(P0, P1, { color: COL.muted, dashed: true });
    plane.point(P0[0], P0[1], { color: COL.muted, radius: 3 });
    plane.point(P1[0], P1[1], { color: COL.muted, radius: 3, label: "(6,4)" });
    for (var k = 0; k < upto; k++) {
      var px = R.pixels[k];
      plane.pixel(px[0], px[1], { fill: COL.accentSoft, stroke: COL.accent });
    }
  }

  function build() {
    var steps = [];

    // 1) Motivação
    steps.push({
      title: "O problema: acender pixels sobre uma reta",
      body:
        "<p>A tela é uma <b>grade inteira</b> de pixels, mas a reta é um objeto <b>contínuo</b>. " +
        "Rasterizar é decidir, para a reta toda, <em>qual</em> conjunto de pixels a representa melhor — " +
        "sem buracos e sem pixels tortos.</p>" +
        "<p>Vamos usar a reta de <code>(0, 0)</code> a <code>(6, 4)</code> como exemplo. O alvo é a " +
        "linha tracejada; precisamos escolher os quadradinhos mais próximos dela.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 2) A receita ingênua e seus dois furos
    steps.push({
      title: "Por que y = m·x + b não basta",
      body:
        "<p>A ideia óbvia: para cada coluna <code>x</code>, calcule <code>y = m·x + b</code> e arredonde. " +
        "Funciona, mas tem dois defeitos:</p>" +
        "<ul>" +
        "<li><b>Custo</b>: uma <b>multiplicação</b> (<code>m·x</code>) e um arredondamento por coluna.</li>" +
        "<li><b>Buracos</b>: quando a reta é <span class='hl'>íngreme</span> (<code>|m| &gt; 1</code>), " +
        "andar de 1 em 1 no <code>x</code> faz o <code>y</code> <b>pular</b> mais de uma linha — e a reta " +
        "fica pontilhada.</li>" +
        "</ul>" +
        "<p>Ao lado, a reta <code>(0,0)→(2,6)</code> (<code>m = 3</code>) avaliada só nas colunas " +
        "<code>x = 0, 1, 2</code>: três pixels isolados, dois <span class='no'>buracos</span>. O eixo " +
        "que “anda menos” não pode ser o que comanda os passos.</p>",
      visual: {
        type: "plane",
        bounds: [-1, 4, -1, 7],
        draw: function (plane) {
          plane.segment([0, 0], [2, 6], { color: COL.muted, dashed: true });
          [[0, 0], [1, 3], [2, 6]].forEach(function (p) {
            plane.pixel(p[0], p[1], { fill: COL.redSoft, stroke: COL.red });
          });
          plane.point(2, 6, { color: COL.muted, radius: 3, label: "(2,6)" });
        },
      },
    });

    // 3) Ideia central: andar pelo eixo dominante
    steps.push({
      title: "Ideia: dar pequenos passos iguais",
      body:
        "<p>O DDA caminha pela reta em <b>passos uniformes</b>, somando um incremento fixo a cada passo " +
        "(é um “analisador diferencial”: troca a fórmula fechada por incrementos). A pergunta é: quantos " +
        "passos dar?</p>" +
        "<p>Escolhemos <span class='hl'>passos = max(|Δx|, |Δy|)</span>. Assim o eixo que anda mais " +
        "(o <b>dominante</b>) avança exatamente <b>1 por passo</b> — nunca pula um inteiro, então " +
        "<b>não há buracos</b>. O outro eixo anda uma fração &lt; 1 por passo. É justamente o " +
        "<code>max</code> que conserta o furo da receita ingênua.</p>" +
        "<div class='formula'>Δx = 6,  Δy = 4\npassos = max(|6|, |4|) = 6</div>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 4) Incrementos
    steps.push({
      title: "Os incrementos",
      body:
        "<p>Dividimos o deslocamento total pelo número de passos: cada passo soma " +
        "<code>xinc = Δx/passos</code> e <code>yinc = Δy/passos</code>. Como há <code>passos</code> " +
        "passos, o acumulado vai exatamente de um extremo ao outro.</p>" +
        "<div class='formula'>xinc = Δx/passos = 6/6 = " +
        R.xinc.str() +
        "\nyinc = Δy/passos = 4/6 = " +
        R.yinc.str() +
        "</div>" +
        "<p>Como o eixo dominante é <code>x</code>, <code>xinc = 1</code> (anda um pixel inteiro por " +
        "passo) e <code>y</code> sobe <code>" +
        R.yinc.str() +
        "</code> de cada vez. <b>Guardamos o valor exato</b> de <code>y</code> e só arredondamos para " +
        "<em>escolher o pixel</em> — nunca reaproveitamos o valor já arredondado.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 5..n) Micro-exemplo passo a passo
    R.rows.forEach(function (rw, i) {
      var px = R.pixels[i];
      var dyAbs = Math.abs(rw.y.num() - px[1]);
      steps.push({
        title: "Passo i = " + i + " → pixel (" + px[0] + ", " + px[1] + ")",
        body:
          "<p>Acumulado exato: <code>x = " +
          rw.x.str() +
          "</code>, <code>y = " +
          rw.y.str() +
          "</code>.</p>" +
          "<p>Arredondando ao pixel mais próximo (<code>round</code>): " +
          "<span class='ok'>(" +
          px[0] +
          ", " +
          px[1] +
          ")</span>" +
          (dyAbs > 0.001
            ? " — o <code>y</code> real está a " + dyAbs.toFixed(2) + " do centro do pixel."
            : " — cai exatamente sobre o pixel.") +
          (i === 0
            ? " Começa no extremo inicial."
            : " O <code>x</code> andou 1; o <code>y</code> subiu " + R.yinc.str() + ".") +
          "</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            scene(plane, i);
            // ponto real (não arredondado) sobre a reta
            plane.point(rw.x.num(), rw.y.num(), { color: COL.yellow, radius: 4 });
            // pixel escolhido em destaque
            plane.pixel(px[0], px[1], { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Tabela completa
    steps.push({
      title: "O traço completo",
      body:
        "<p>Juntando tudo: 7 pontos (passos 0…6), cada um com o acumulado exato e o pixel " +
        "arredondado. Note que o arredondamento acontece <b>só na coluna do pixel</b> — o " +
        "<code>y</code> exato segue intacto na coluna do meio, evitando que pequenos erros se somem " +
        "passo após passo.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["i", "x", "y (exato)", "pixel"],
            rows: R.rows.map(function (rw, i) {
              return [i, rw.x.str(), rw.y.str(), "(" + R.pixels[i][0] + ", " + R.pixels[i][1] + ")"];
            }),
          });
        },
      },
    });

    // n+2) Custo por pixel
    steps.push({
      title: "Quanto custa cada pixel?",
      body:
        "<p>Depois do setup (duas divisões para achar os incrementos), o laço é barato: por passo, " +
        "<b>duas somas</b> (<code>x += xinc</code>, <code>y += yinc</code>) e <b>dois arredondamentos</b>. " +
        "Sem multiplicar a cada coluna, como fazia a receita ingênua.</p>" +
        "<p>O preço escondido: as somas são em <b>ponto flutuante</b> (ou frações). Isso custa mais que " +
        "aritmética inteira pura e, em retas muito longas, o <code>yinc</code> somado milhares de vezes " +
        "pode <span class='hl'>derivar</span> por erro de arredondamento. É exatamente essa fraqueza que " +
        "o Bresenham elimina.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, R.pixels.length);
        },
      },
    });

    // n+3) Comparação com Bresenham
    steps.push(
      EX.Slides.comparison({
        title: "DDA × Bresenham",
        intro:
          "<p>Os dois geram (quase) os mesmos pixels. A diferença é <b>como</b> chegam lá — e isso " +
          "decide qual é mais rápido em hardware.</p>",
        headers: ["", "DDA", "Bresenham"],
        rows: [
          ["Aritmética", "real (frações/float)", "inteira"],
          ["Por passo", "2 somas + arredonda", "1 soma + teste de sinal"],
          ["Erro acumulado", "possível em retas longas", "nenhum (exato)"],
          ["Custo", "maior", "menor (ideal p/ hardware)"],
          ["Clareza", "muito intuitivo", "exige a variável de decisão"],
        ],
      })
    );

    // n+4) Conexão: interpolar qualquer coisa
    steps.push({
      title: "A ideia do DDA vale para muito além de retas",
      body:
        "<p>O coração do DDA — “divida a variação total pelo número de passos e some o incremento” — é " +
        "<b>interpolação linear incremental</b>. Troque “posição” por qualquer atributo e a mesma " +
        "mecânica aparece em todo o pipeline:</p>" +
        "<ul>" +
        "<li><b>Cor</b> ao longo de uma aresta → sombreamento de Gouraud;</li>" +
        "<li><b>Profundidade z</b> → teste de Z-buffer por pixel;</li>" +
        "<li><b>Coordenadas de textura (u, v)</b> → mapeamento de textura na varredura.</li>" +
        "</ul>" +
        "<p>Por isso o DDA é um ótimo primeiro passo: entender o incremento aqui é entender como a " +
        "rasterização interpola tudo o mais.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, R.pixels.length);
        },
      },
    });

    // n+5) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<p>Pontos onde se erra com o DDA:</p>" +
        "<ul>" +
        "<li><b>Esquecer o max</b>: usar <code>passos = Δx</code> sempre quebra em retas íngremes " +
        "(os buracos do começo).</li>" +
        "<li><b>Arredondar cedo</b>: arredondar o acumulado e reusá-lo soma erro. Mantenha o valor " +
        "exato; arredonde só para desenhar.</li>" +
        "<li><b>Retas longas</b>: em float, o acúmulo de <code>yinc</code> pode derivar — motivo " +
        "histórico para preferir Bresenham.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "warn",
            title: "Regra prática",
            html:
              "<code>passos = max(|Δx|, |Δy|)</code>; incremento = deslocamento ÷ passos; " +
              "arredonde apenas o pixel a desenhar.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g02-dda",
    num: "DDA",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "DDA para retas",
    type: "computacional",
    tags: ["rasterização", "reta", "dda"],
    hubDesc: "Por que a receita ingênua falha, passos = max(|Δx|,|Δy|), incrementos racionais e arredondamento só no pixel.",
    statement:
      "Entenda o DDA: por que y = m·x + b deixa buracos, por que o número de passos é max(|Δx|, |Δy|), " +
      "como saem os incrementos em x e y, o custo por pixel e por que o arredondamento ocorre apenas ao " +
      "escolher o pixel. Comparação com Bresenham e conexão com a interpolação de cor/z/textura.",
    parts: [{ label: "Guia", build: build }],
  });
})();
