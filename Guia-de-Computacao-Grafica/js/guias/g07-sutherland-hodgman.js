/*
 * g07-sutherland-hodgman.js — Guia: recorte de POLÍGONOS por Sutherland-Hodgman.
 * Recorte borda a borda (pipeline de 4 estágios), a regra entrada/saída dos
 * vértices e a atualização da lista de vértices. Comparação com Weiler-Atherton.
 *
 * Reusa window.ALG.sutherlandHodgman (traço exato com frações).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var POLY = [
    { x: 0, y: 2 },
    { x: 8, y: 4 },
    { x: 3, y: 9 },
  ];
  var BOUNDS = [-3, 10, -1, 11];

  function pts(poly) {
    return poly.map(function (p) {
      return [p.x.num ? p.x.num() : p.x, p.y.num ? p.y.num() : p.y];
    });
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }
  function listStr(poly) {
    return poly
      .map(function (p) {
        return "(" + p.x.str() + ", " + p.y.str() + ")";
      })
      .join(", ");
  }

  function build() {
    var steps = [];
    var res = ALG.sutherlandHodgman(POLY, W);

    // 1) Motivação
    steps.push({
      title: "Recortar um polígono inteiro",
      body:
        "<p>Recortar segmentos soltos (como em Cohen-Sutherland ou Liang-Barsky) é fácil. Recortar um " +
        "<b>polígono</b> é mais sutil: se tratássemos cada aresta como uma reta independente, a saída " +
        "viraria um <em>monte de segmentos soltos</em> — perderíamos o miolo preenchível. Precisamos que " +
        "o resultado continue um <b>contorno fechado</b>, com vértices novos exatamente onde o polígono " +
        "cruza a janela.</p>" +
        "<p>A sacada de Sutherland-Hodgman: não recorte contra a janela toda de uma vez. Recorte contra " +
        "<b>uma borda por vez</b>, em sequência — esquerda, direita, inferior, superior. Cada estágio " +
        "recebe uma lista de vértices e devolve outra, já aparada naquela borda; a saída de um alimenta a " +
        "entrada do seguinte, como uma <span class='hl'>linha de montagem</span> de 4 etapas.</p>" +
        "<p>Por que funciona em cadeia? Porque recortar contra a borda esquerda nunca cria nada que viole " +
        "as outras três; cada etapa só pode <em>encolher</em> o polígono em relação à sua borda. No fim " +
        "das quatro, sobra exatamente a interseção do polígono com a janela.</p>" +
        "<p>Vamos recortar o triângulo <span class='accent'>A(0, 2)</span>, <span class='accent'>B(8, 4)</span>, " +
        "<span class='accent'>C(3, 9)</span> — que estoura a janela pela direita e por cima.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(POLY), { stroke: COL.yellow, fill: "rgba(255,209,102,0.12)", lineWidth: 2 });
          POLY.forEach(function (p, i) {
            plane.point(p.x, p.y, { color: COL.yellow, radius: 4, label: "ABC"[i] });
          });
        },
      },
    });

    // 2) A regra entrada/saída
    steps.push({
      title: "A regra dos vértices (entrada/saída)",
      body:
        "<p>Em cada borda, percorremos as arestas <code>S → P</code> do polígono (<code>S</code> = " +
        "vértice de partida, <code>P</code> = vértice de chegada) e olhamos se cada ponta está " +
        "<b>dentro</b> ou <b>fora</b> daquela borda. Há só 4 combinações, e em cada uma emitimos o que " +
        "<em>deve sobrar</em> do trajeto que de fato fica do lado de dentro:</p>" +
        "<ul>" +
        "<li><b>dentro → dentro</b>: o trecho inteiro vale; emite <code>P</code> (o início <code>S</code> " +
        "já entrou na iteração anterior).</li>" +
        "<li><b>dentro → fora</b>: estamos saindo; emite só a interseção <code>I</code> onde a aresta " +
        "fura a borda.</li>" +
        "<li><b>fora → dentro</b>: estamos entrando; emite <code>I</code> (o ponto de entrada) <b>e " +
        "depois</b> <code>P</code>.</li>" +
        "<li><b>fora → fora</b>: o trecho não toca o lado de dentro; emite nada.</li>" +
        "</ul>" +
        "<p>Repare na assimetria: emitimos sempre o vértice de <b>chegada</b> (nunca o de partida), para " +
        "não duplicar pontos ao encadear as arestas. O segredo dos casos mistos são os " +
        "<b>cruzamentos</b>: cada <code>I</code> é um vértice novo que costura o contorno de volta sobre " +
        "a borda — é isso que mantém o polígono <b>fechado</b>. A interseção <code>I</code> usa a mesma " +
        "fórmula reta×borda de Cohen-Sutherland (parametrize a aresta e iguale a coordenada fixa da " +
        "borda).</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["aresta S → P", "emite"],
            rows: [
              ["dentro → dentro", "P"],
              ["dentro → fora", "I (interseção)"],
              ["fora → dentro", "I e depois P"],
              ["fora → fora", "— (nada)"],
            ],
          });
        },
      },
    });

    // 3..n) Animação por borda
    res.steps.forEach(function (st) {
      if (st.type === "init") {
        steps.push({
          title: "Lista inicial",
          body:
            "<p>Começamos com os vértices do polígono original, na ordem em que formam o contorno:</p>" +
            "<p class='formula'>[" + listStr(st.poly) + "]</p>" +
            "<p>Essa lista vai passar pelos quatro estágios; cada um a reescreve. Acompanhe o número de " +
            "vértices mudar conforme as bordas aparam o que sobra para fora.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.polygon(pts(st.poly), { stroke: COL.yellow, fill: "rgba(255,209,102,0.12)", lineWidth: 2 });
            },
          },
        });
      } else if (st.type === "clip") {
        var after = pts(st.poly);
        steps.push({
          title: "Recorte pela borda " + st.label,
          body:
            "<p>Aplicando a regra entrada/saída a cada aresta contra a fronteira <span class='hl'>" +
            st.label +
            "</span> (entrada = " +
            st.before.length +
            " vértices), a lista passa a ter <b>" +
            st.poly.length +
            " vértices</b>:</p>" +
            "<p class='formula'>[" +
            listStr(st.poly) +
            "]</p>" +
            (st.before.length !== st.poly.length
              ? "<p>Vértices que ficavam fora desta borda foram <b>descartados</b> e substituídos por " +
                "<b>interseções</b> sobre a reta da borda (frações exatas como <code>13/4</code> marcam " +
                "esses cortes). O contorno permanece fechado." +
                (st.poly.length > st.before.length
                  ? " Aqui a contagem até <b>cresceu</b>: uma única aresta pode entrar e sair, gerando " +
                    "dois pontos novos."
                  : "") +
                "</p>"
              : "<p>Todos os vértices já estavam do lado de dentro desta borda (caso " +
                "<em>dentro→dentro</em> em todas as arestas): a lista <b>não mudou</b>. Esse estágio foi " +
                "de graça.</p>"),
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.polygon(pts(st.before), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
              if (after.length)
                plane.polygon(after, { stroke: COL.green, fill: COL.greenSoft, lineWidth: 2.5 });
              after.forEach(function (p) {
                plane.point(p[0], p[1], { color: COL.green, radius: 3 });
              });
            },
          },
        });
      }
    });

    // n+1) Resultado
    steps.push({
      title: "Polígono recortado",
      body:
        "<p>Depois das 4 bordas, sobra o polígono inteiramente <b>dentro</b> da janela:</p>" +
        "<p class='formula'>[" + listStr(res.result) + "]</p>" +
        "<p>O triângulo de 3 lados virou um polígono de <b>" + res.result.length + " vértices</b> — " +
        "alguns são vértices originais que couberam (como <code>A(0, 2)</code>), os outros nasceram nas " +
        "interseções com as bordas direita e superior. As arestas que coincidem com a janela viraram " +
        "lados retos do novo contorno.</p>" +
        "<p>Quatro passadas simples, cada uma com a mesma regrinha de 4 casos, resolveram um recorte que, " +
        "de cara, parecia complicado. Note que o resultado é <b>convexo</b> aqui porque a janela é " +
        "convexa e o triângulo também — voltamos a esse ponto no próximo passo.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(POLY), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
          plane.polygon(pts(res.result), { stroke: COL.green, fill: COL.greenSoft, lineWidth: 3 });
        },
      },
    });

    // n+2) Comparação / limites
    steps.push({
      title: "Quando ele basta (e quando não)",
      body:
        "<p>Sutherland-Hodgman é perfeito para recortar contra uma <b>janela convexa</b> (o caso usual: " +
        "um retângulo). A condição de convexidade é da <em>janela</em>, não do polígono recortado — e é " +
        "ela que faz o encadeamento de bordas funcionar.</p>" +
        "<p>O limite famoso aparece quando o <b>polígono de entrada é côncavo</b>: o resultado pode " +
        "precisar virar duas (ou mais) ilhas separadas, mas o algoritmo só sabe devolver <b>uma</b> lista " +
        "de vértices. Ele “resolve” conectando as ilhas com uma <b>aresta degenerada</b> que corre sobre " +
        "a borda — visualmente um fiapo, que some no preenchimento mas atrapalha quem usa a lista de " +
        "vértices. O próximo passo mostra esse efeito.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.prosCons(host, {
            pros: [
              "Simples: 4 estágios iguais em sequência",
              "Saída sempre é um polígono fechado",
              "Ótimo para janela retangular (convexa)",
            ],
            cons: [
              "Polígono côncavo pode gerar arestas degeneradas ligando partes separadas",
              "Para recorte contra polígono qualquer, usa-se Weiler-Atherton",
            ],
          });
        },
      },
    });

    // n+2b) O artefato côncavo (novo passo)
    var CONCAVE = [
      { x: -1, y: 5 }, { x: 6, y: 5 }, { x: 6, y: -1 }, { x: 4, y: -1 },
      { x: 4, y: 3 }, { x: 1, y: 3 }, { x: 1, y: -1 }, { x: -1, y: -1 },
    ];
    var resC = ALG.sutherlandHodgman(CONCAVE, W);
    steps.push({
      title: "O artefato em polígonos côncavos",
      body:
        "<p>Veja o efeito num <b>U</b> (côncavo) cujas duas pernas afundam abaixo da janela. " +
        "Geometricamente, recortar deveria deixar <b>duas áreas</b> separadas pelo entalhe central. Mas " +
        "Sutherland-Hodgman devolve uma <b>única</b> lista de " + resC.result.length + " vértices:</p>" +
        "<p class='formula'>[" + listStr(resC.result) + "]</p>" +
        "<p>As duas pernas acabam <b>costuradas por uma aresta que corre sobre a borda inferior</b> " +
        "(<code>y = 1</code>) — o tracejado vermelho. No preenchimento ela é invisível (área zero), mas " +
        "se você usar a lista de vértices para outra coisa (calcular perímetro, extrudar em 3D, detectar " +
        "colisão) o fiapo aparece.</p>" +
        "<p>A causa: o algoritmo trata o contorno como uma <b>única sequência</b> e não tem como " +
        "“levantar a caneta” para iniciar um segundo laço. Janela convexa nunca causa isso; o problema é " +
        "exclusivo da <b>concavidade do polígono recortado</b>.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(CONCAVE), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
          plane.polygon(pts(resC.result), { stroke: COL.green, fill: COL.greenSoft, lineWidth: 2.5 });
          // realça a aresta degenerada sobre a borda inferior (y = ymin)
          plane.segment([W.xmin, W.ymin], [W.xmax, W.ymin], { color: COL.red, dashed: true, lineWidth: 2.5 });
        },
      },
    });

    // n+2c) Conexões / aplicações (novo passo)
    steps.push({
      title: "Onde isto vive no pipeline",
      body:
        "<p>Sutherland-Hodgman não é curiosidade de livro: é o recorte de <b>polígonos</b> que toda GPU " +
        "faz contra o <b>frustum de visão</b>, logo após a projeção e antes da rasterização. Cada " +
        "triângulo é recortado contra os planos do volume de visão; como triângulos são convexos, o " +
        "artefato côncavo não acontece — a saída é re-triangulada (um leque de triângulos) e segue.</p>" +
        "<ul>" +
        "<li><b>Janela convexa qualquer</b> (não retângulo): Sutherland-Hodgman <b>já resolve</b> — " +
        "basta recortar o polígono contra o semiplano de <b>cada aresta</b> da janela, uma de cada vez " +
        "(a exigência de convexidade é da <em>janela</em>).</li>" +
        "<li><b>Recorte de segmentos de reta</b> contra uma janela convexa: aí entra o <b>Cyrus-Beck</b> " +
        "— paramétrico, testando o segmento contra a normal de cada aresta; é a generalização do " +
        "Liang-Barsky. Recorta <b>segmentos</b>, não polígonos.</li>" +
        "<li><b>Recorte por polígono arbitrário</b> (côncavo, com buracos): aí entra o " +
        "<b>Weiler-Atherton</b>, que percorre os dois contornos e sabe separar ilhas — resolvendo " +
        "justamente o artefato do passo anterior.</li>" +
        "<li><b>Operações booleanas 2D</b> (união/interseção de polígonos): generalizam essa travessia " +
        "de contornos.</li>" +
        "</ul>" +
        "<p>Em uma frase: este é o caso simples e rápido (polígono × janela convexa); os parentes mais " +
        "caros existem para os casos que ele não cobre.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.polygon(pts(POLY), { stroke: COL.muted, dashed: true, fill: false, lineWidth: 1.5 });
          plane.polygon(pts(res.result), { stroke: COL.green, fill: COL.greenSoft, lineWidth: 3 });
        },
      },
    });

    // n+3) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Aresta de fechamento</b>: o último vértice liga de volta ao primeiro — percorra as " +
        "arestas como <code>S = poly[i]</code>, <code>P = poly[(i+1) mod n]</code> para não esquecer a " +
        "que fecha o contorno.</li>" +
        "<li><b>Emita só o vértice de chegada</b> (<code>P</code>), nunca o de partida — emitir os dois " +
        "duplica vértices ao encadear arestas.</li>" +
        "<li><b>Ordem das bordas</b> não muda o resultado final, mas muda as listas intermediárias (e qual " +
        "estágio sai “de graça”).</li>" +
        "<li><b>Lista vazia</b>: se o polígono fica todo fora de uma borda, o estágio devolve [] e os " +
        "estágios seguintes só repassam o vazio (nada visível).</li>" +
        "<li><b>Polígono côncavo</b>: espere a aresta degenerada sobre a borda — para evitá-la, use " +
        "Weiler-Atherton.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html:
              "Um recorte difícil (polígono × janela) vira <b>quatro recortes fáceis</b> " +
              "(polígono × uma reta), encadeados.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g07-sutherland-hodgman",
    num: "⬠",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Sutherland-Hodgman (recorte de polígonos)",
    type: "computacional",
    tags: ["recorte", "clipping", "polígono", "weiler-atherton"],
    hubDesc: "Recorte borda a borda (pipeline), regra entrada/saída dos 4 casos, lista de saída e o artefato côncavo.",
    statement:
      "Entenda o recorte de polígonos por Sutherland-Hodgman: o pipeline borda a borda, a regra " +
      "entrada/saída dos quatro casos, o cálculo das interseções e a atualização da lista de vértices. " +
      "Inclui o famoso artefato em polígonos côncavos (aresta degenerada) e onde o algoritmo vive no " +
      "pipeline, com as conexões para Cyrus-Beck e Weiler-Atherton.",
    parts: [{ label: "Guia", build: build }],
  });
})();
