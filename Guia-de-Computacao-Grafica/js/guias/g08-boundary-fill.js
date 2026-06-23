/*
 * g08-boundary-fill.js — Guia: Boundary Fill (preenchimento por fronteira).
 * Espalha a partir de uma semente até encontrar a COR DE BORDA. Conectividade
 * 4 vs 8, o teste interior/borda, o vazamento por diagonais, da recursão à
 * pilha explícita, e a diferença para o Flood Fill.
 *
 * Reusa EX.Raster.flood (BFS) para gerar a ordem de visita.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var BNDS = { xmin: 0, xmax: 13, ymin: 0, ymax: 9 };
  var B = [BNDS.xmin, BNDS.xmax, BNDS.ymin, BNDS.ymax];
  var SEED = { x: 6, y: 4 };

  // Borda retangular (perímetro de [2..11]x[2..7]).
  var border = [];
  (function () {
    for (var x = 2; x <= 11; x++) {
      border.push([x, 2]);
      border.push([x, 7]);
    }
    for (var y = 3; y <= 6; y++) {
      border.push([2, y]);
      border.push([11, y]);
    }
  })();
  var blocked = {};
  border.forEach(function (c) {
    blocked[c[0] + "," + c[1]] = true;
  });
  var order = EX.Raster.flood(SEED, blocked, BNDS, 4);

  // Cor roxa-suave (a paleta não define purpleSoft) para os vizinhos diagonais.
  var PURPLE_SOFT = COL.purpleSoft || "rgba(183,148,246,0.18)";

  // --- Cena do "vazamento por diagonal" (passo dedicado) ---------------------
  // Borda em V com um furo de canto: as duas pontas só se tocam pela quina.
  // Com 4-conex a tinta fica presa; com 8-conex escapa pela diagonal.
  var LEAK = { xmin: 0, xmax: 9, ymin: 0, ymax: 7 };
  var LEAKB = [LEAK.xmin, LEAK.xmax, LEAK.ymin, LEAK.ymax];
  var leakSeed = { x: 4, y: 4 };
  // Caixa [1..8]x[2..6] com a borda quebrada no canto (4,1)-(5,2): falta a
  // ligação ortogonal, sobra só o contato diagonal.
  var leakBorder = [];
  (function () {
    for (var x = 1; x <= 8; x++) {
      if (x !== 4) leakBorder.push([x, 2]); // base com um furo em x=4
      leakBorder.push([x, 6]);
    }
    for (var y = 2; y <= 6; y++) {
      leakBorder.push([1, y]);
      leakBorder.push([8, y]);
    }
    leakBorder.push([4, 1]); // "tampa" deslocada: toca (3,2)/(5,2) só na diagonal
  })();
  var leakBlocked = {};
  leakBorder.forEach(function (c) {
    leakBlocked[c[0] + "," + c[1]] = true;
  });
  var leak4 = EX.Raster.flood(leakSeed, leakBlocked, LEAK, 4);
  var leak8 = EX.Raster.flood(leakSeed, leakBlocked, LEAK, 8);

  function drawBorder(plane) {
    border.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: COL.redSoft, stroke: COL.red });
    });
  }
  function frame(plane, count) {
    drawBorder(plane);
    for (var k = 0; k < count && k < order.length; k++) {
      plane.pixel(order[k].x, order[k].y, { fill: COL.accentSoft, stroke: COL.accent });
    }
    plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green });
  }
  // Cena do vazamento: borda + preenchimento (4- ou 8-conex) a partir do seed.
  function leakFrame(plane, cells) {
    leakBorder.forEach(function (c) {
      plane.pixel(c[0], c[1], { fill: COL.redSoft, stroke: COL.red });
    });
    cells.forEach(function (c) {
      plane.pixel(c.x, c.y, { fill: COL.accentSoft, stroke: COL.accent });
    });
    plane.pixel(leakSeed.x, leakSeed.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Pintar uma região já desenhada",
      body:
        "<p>Imagine um contorno fechado já na tela (a <span class='no'>borda</span>, em vermelho) e " +
        "queremos pintar o <b>interior</b>. Diferente do Scan-Line, aqui <b>não temos a lista de " +
        "vértices</b> nem a equação das arestas — só pixels já acesos e um ponto de partida, a " +
        "<span class='ok'>semente</span>.</p>" +
        "<p>É o cenário típico das ferramentas “pote de tinta” sobre uma imagem <em>raster</em>: o " +
        "desenho já existe como pixels, e o que sabemos da forma é apenas a <b>cor</b> de cada um.</p>" +
        "<p>Boundary Fill resolve “de dentro para fora”: a partir da semente, espalha a cor para os " +
        "vizinhos e continua, parando só quando <b>esbarra na cor de borda</b>. A borda funciona como " +
        "uma cerca — enquanto for fechada, a tinta não escapa.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          drawBorder(plane);
          plane.pixel(SEED.x, SEED.y, { fill: COL.greenSoft, stroke: COL.green, label: "•" });
        },
      },
    });

    steps.push({
      title: "A regra: espalhe até a cor de borda",
      body:
        "<p>Visite a semente, pinte-a e empilhe/enfileire os <b>vizinhos</b>. Para cada pixel <code>p</code> " +
        "retirado da estrutura, o teste é simples:</p>" +
        "<ul><li>se a cor de <code>p</code> já é a <span class='no'>cor de borda</span> → <b>pare</b> ali " +
        "(é a parede);</li>" +
        "<li>se <code>p</code> já tem a <b>cor de preenchimento</b> → ignore (já visitado);</li>" +
        "<li>senão → pinte <code>p</code> e empilhe seus vizinhos.</li></ul>" +
        "<div class='formula'>se cor(p) ≠ corBorda e cor(p) ≠ corPreenche:\n" +
        "    pinta(p, corPreenche)\n" +
        "    empilha vizinhos(p)</div>" +
        "<p>O critério de parada é a <b>cor da borda</b>, não “qualquer pixel diferente”. Por isso o " +
        "interior <span class='hl'>pode ter cores variadas</span> — texto, sombras, ruído — desde que " +
        "<em>nenhuma</em> delas seja a cor da borda. Essa é a diferença essencial para o Flood Fill, " +
        "que para em qualquer cor diferente da semente.</p>" +
        "<p>Repare como o segundo teste (“já tem a cor de preenchimento”) é o que <b>encerra</b> o " +
        "processo: cada pixel é pintado uma vez e, ao reaparecer pela vizinhança, é descartado — sem " +
        "isso o algoritmo daria voltas infinitas.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          frame(plane, 0);
        },
      },
    });

    steps.push({
      title: "Conectividade 4 ou 8",
      body:
        "<p>“Vizinho” pode significar duas coisas, e a escolha muda o resultado:</p>" +
        "<ul><li><b>4-conex</b>: só os 4 ortogonais (↑ ↓ ← →) — em <span class='accent'>azul</span>.</li>" +
        "<li><b>8-conex</b>: os 4 ortogonais <em>mais</em> as 4 diagonais — em <span class='hl'>roxo</span>.</li></ul>" +
        "<p>A diferença não é cosmética. A diagonal cruza o <b>encontro de quatro pixels</b>: com " +
        "8-conex a tinta consegue “passar pela quina”, atravessando uma fenda diagonal de 1 pixel que " +
        "uma borda 4-conexa deixaria aberta. Resultado: <b>8-conex vaza com mais facilidade</b>.</p>" +
        "<p>Daí a regra prática, que vale também no Scan-Line e no Flood Fill: a conectividade do " +
        "<em>preenchimento</em> e a da <em>borda</em> são complementares. Se você preenche com 4-conex, " +
        "a borda precisa ser <b>8-conexa</b> (sem furos diagonais); se preenche com 8-conex, a borda tem " +
        "de ser <b>4-conexa</b> (espessa o bastante para não ter passagens em diagonal). O próximo passo " +
        "mostra esse vazamento acontecendo.</p>",
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

    // NOVO: o vazamento por diagonal acontecendo (8-conex inunda a tela).
    steps.push({
      title: "Quando 8-conex vaza pela diagonal",
      body:
        "<p>Aqui a borda tem um <b>defeito de 1 pixel</b>: a base está aberta em <code>x = 4</code> e a " +
        "“tampa” foi posta em <code>(4, 1)</code>, encostando nas pontas só <b>pela quina</b>. A " +
        "<span class='ok'>semente</span> está dentro da caixa.</p>" +
        "<p>Com <b>4-conex</b> a tinta <span class='ok'>ficaria presa</span>: para sair precisaria de " +
        "um passo ortogonal pelo furo, mas a tampa em <code>(4, 1)</code> só toca o interior <em>na " +
        "diagonal</em> — e o 4-conex nem considera diagonais. A caixa, para o 4-conex, continua " +
        "fechada.</p>" +
        "<p>O desenho mostra o caso <b>8-conex</b>: a frente <span class='no'>escorre pela diagonal</span> " +
        "do furo (" + leak8.length + " pixels visitados contra apenas " + leak4.length +
        " no 4-conex) e <b>inunda a tela inteira</b>. Mesma figura, mesma semente: só a definição de " +
        "“vizinho” mudou. É a razão de furos diagonais serem o bug nº 1 de quem implementa " +
        "preenchimento.</p>",
      visual: {
        type: "plane",
        bounds: LEAKB,
        draw: function (plane) {
          leakFrame(plane, leak8);
        },
      },
    });

    var FRAMES = 6;
    for (var f = 1; f <= FRAMES; f++) {
      (function (count, idx) {
        steps.push({
          title: "Preenchendo… (" + Math.min(count, order.length) + "/" + order.length + ")",
          body:
            "<p>A frente de preenchimento avança a partir da semente (BFS, 4-conex), " +
            (idx === FRAMES
              ? "até <b>todo o interior</b> estar pintado: " +
                order.length +
                " pixels no total, e a borda <span class='ok'>conteve a tinta</span> — nada vazou."
              : "parando sempre que um vizinho cai sobre a cor de borda.") +
            "</p>" +
            (idx === 1
              ? "<p>Como usamos uma <b>fila</b> (BFS), a região cresce em “anéis” quase concêntricos a " +
                "partir da semente. Com uma <b>pilha</b> (DFS) o conjunto final seria o mesmo, mas a " +
                "ordem de visita formaria um caminho serpenteante — a cor pintada não depende dessa " +
                "escolha, só o trajeto.</p>"
              : ""),
          visual: {
            type: "plane",
            bounds: B,
            draw: function (plane) {
              frame(plane, count);
            },
          },
        });
      })(Math.round((order.length * f) / FRAMES), f);
    }

    // NOVO: da recursão ingênua à pilha explícita (por que e como).
    steps.push({
      title: "Da recursão à pilha explícita",
      body:
        "<p>A formulação de livro é recursiva: pinte o pixel e <em>chame a si mesma</em> nos quatro " +
        "vizinhos. Elegante, mas cada chamada empilha um quadro na <b>pilha de chamadas</b> — e uma " +
        "região de centenas de milhares de pixels gera essa mesma profundidade de recursão, " +
        "estourando a pilha (<code>stack overflow</code>).</p>" +
        "<p>A correção é guardar os pixels pendentes numa <b>pilha (ou fila) explícita</b> no heap e " +
        "trocar a recursão por um laço. Mesma lógica, sem o limite da pilha de chamadas — é o que o " +
        "nosso traço faz:</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.code(host, {
            lang: "py",
            code:
              "def boundary_fill(x, y, corPreenche, corBorda):\n" +
              "    pilha = [(x, y)]\n" +
              "    while pilha:\n" +
              "        px, py = pilha.pop()\n" +
              "        c = get_pixel(px, py)\n" +
              "        if c == corBorda or c == corPreenche:\n" +
              "            continue          # parede ou ja pintado\n" +
              "        set_pixel(px, py, corPreenche)\n" +
              "        pilha.append((px + 1, py))\n" +
              "        pilha.append((px - 1, py))\n" +
              "        pilha.append((px, py + 1))\n" +
              "        pilha.append((px, py - 1))",
            active: [2, 4, 8],
          });
        },
      },
    });

    steps.push(
      EX.Slides.comparison({
        title: "Boundary Fill × Flood Fill",
        intro:
          "<p>Parecidos no mecanismo (espalhar por vizinhos, com pilha ou fila), diferentes no " +
          "<b>critério de parada</b>. Resuma assim: Boundary olha para <em>uma</em> cor especial (a " +
          "borda) e ignora o resto; Flood olha para a cor da própria semente e para em qualquer " +
          "outra.</p>",
        headers: ["", "Boundary Fill", "Flood Fill"],
        rows: [
          ["Para quando…", "acha a cor de BORDA", "acha cor ≠ cor antiga"],
          ["Interior", "pode ter cores variadas", "deve ser uma cor só"],
          ["Precisa saber", "a cor da borda", "a cor a substituir"],
          ["Uso típico", "contorno desenhado", "balde de tinta"],
        ],
      })
    );

    // NOVO: onde isso aparece de verdade + conexões.
    steps.push({
      title: "Onde isso aparece",
      body:
        "<p>Boundary Fill é o motor do <b>pote de tinta com contorno</b>: você desenha uma silhueta " +
        "fechada e pinta o miolo sem se importar com o que já existe lá dentro — útil quando o " +
        "interior tem rascunho, hachura ou outra cor que o Flood Fill cancelaria.</p>" +
        "<ul>" +
        "<li><b>Editores de pixel art</b>: preencher uma forma lineart preservando detalhes internos.</li>" +
        "<li><b>Seleção por região</b>: a “varinha mágica” é o mesmo passeio, só que marcando em vez " +
        "de pintar.</li>" +
        "<li><b>Rotulagem de regiões</b> (<em>connected-component labeling</em>): a 4/8-conexidade que " +
        "vimos aqui é exatamente a que decide quais pixels formam um mesmo “objeto”.</li>" +
        "</ul>" +
        "<p>E o contraste vale a pena fixar: para preencher um polígono dado por <b>vértices</b> " +
        "(sem pixels prontos), o caminho é o <b>Scan-Line</b> — ele não precisa de semente nem de cor " +
        "de borda, trabalha direto da geometria.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          frame(plane, order.length);
        },
      },
    });

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Borda com furo</b>: se o contorno não é fechado <em>na conectividade usada</em>, a " +
        "tinta <b>vaza</b> — inclusive por uma única fenda diagonal no caso 8-conex.</li>" +
        "<li><b>Conectividades casadas</b>: preenchimento 4-conex pede borda 8-conexa; preenchimento " +
        "8-conex pede borda 4-conexa (mais espessa).</li>" +
        "<li><b>Recursão</b>: a versão recursiva ingênua estoura a pilha em áreas grandes — prefira " +
        "uma fila/pilha explícita (como aqui).</li>" +
        "<li><b>Semente fora</b> da região pinta o lugar errado: o resultado depende inteiramente de " +
        "onde se clica.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html: "Espalhe a partir da semente; a <b>cor da borda</b> é a cerca que segura a tinta — e a " +
              "cerca precisa ser fechada na conectividade que você escolheu.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g08-boundary-fill",
    num: "▣",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Boundary Fill",
    type: "computacional",
    tags: ["preenchimento", "fill", "semente", "conectividade"],
    hubDesc: "Espalha da semente até a cor de borda; 4/8-conex e o vazamento diagonal; pilha explícita; vs Flood Fill.",
    statement:
      "Entenda o Boundary Fill: preenchimento a partir de uma semente até encontrar a cor de borda, o " +
      "teste interior/borda, a conectividade 4 ou 8 e o vazamento por fendas diagonais, a passagem da " +
      "recursão para uma pilha explícita, onde o algoritmo é usado e a diferença para o Flood Fill.",
    parts: [{ label: "Guia", build: build }],
  });
})();
