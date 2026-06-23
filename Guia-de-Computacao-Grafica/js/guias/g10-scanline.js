/*
 * g10-scanline.js — Guia: preenchimento de polígonos por Scan-Line (varredura).
 * Para cada linha, interseções com as arestas, ordenação e preenchimento dos
 * intervalos internos pela regra par-ímpar. Comparação com os fills por semente.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  // Polígono côncavo (entalhe no topo) — alguns y cruzam 4 arestas.
  var POLY = [[2, 1], [10, 1], [10, 8], [7, 4], [4, 8]];
  var B = [0, 12, 0, 10];
  var LINES = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5];

  // Interseções (x ordenados) da reta horizontal y com as arestas do polígono.
  function scanX(poly, y) {
    var xs = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i],
        b = poly[(i + 1) % poly.length];
      var y0 = a[1],
        y1 = b[1];
      // meia-aberta: conta a aresta se y0<=y<y1 (ou o inverso) — evita vértices.
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        var t = (y - y0) / (y1 - y0);
        xs.push(a[0] + t * (b[0] - a[0]));
      }
    }
    return xs.sort(function (p, q) {
      return p - q;
    });
  }
  function outline(plane) {
    plane.polygon(POLY, { stroke: COL.muted, fill: false, lineWidth: 2 });
    POLY.forEach(function (p) {
      plane.point(p[0], p[1], { color: COL.muted, radius: 2.5 });
    });
  }
  function bars(plane, yList) {
    yList.forEach(function (y) {
      var xs = scanX(POLY, y);
      for (var i = 0; i + 1 < xs.length; i += 2) {
        plane.polygon(
          [[xs[i], y - 0.45], [xs[i + 1], y - 0.45], [xs[i + 1], y + 0.45], [xs[i] + 0, y + 0.45]],
          { fill: COL.accentSoft, stroke: false }
        );
      }
    });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Preencher um polígono sem semente",
      body:
        "<p>Os fills por semente (Boundary e Flood) precisam de um <b>ponto interno</b> e de um " +
        "<b>contorno já desenhado</b> na tela. O <b>Scan-Line</b> dispensa os dois: preenche direto " +
        "da <b>definição geométrica</b> — a lista de vértices —, varrendo a tela linha por linha.</p>" +
        "<p>É o método clássico de <em>rasterização</em> de polígonos: dada a forma matemática, ele " +
        "decide quais pixels acender, sem semente e sem “cor de borda”. É também o que a GPU faz, em " +
        "essência, ao rasterizar cada triângulo de uma malha.</p>" +
        "<p>Vamos usar este polígono <b>côncavo</b> (com um entalhe em V no topo) o tempo todo: a " +
        "concavidade é justamente o que torna o problema interessante, porque uma mesma linha pode " +
        "entrar e sair da figura mais de uma vez.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { outline(plane); } },
    });

    steps.push({
      title: "A regra par-ímpar",
      body:
        "<p>Pegue uma linha horizontal <code>y</code> e marque onde ela <b>cruza as arestas</b>. " +
        "Ordenando esses x da esquerda para a direita, a linha <b>entra e sai</b> do polígono " +
        "alternadamente — cada cruzamento inverte o estado dentro/fora.</p>" +
        "<p>A intuição: vindo do infinito à esquerda você começa <b>fora</b>. O 1º cruzamento te põe " +
        "<b>dentro</b>, o 2º te tira, o 3º te coloca de novo… Logo, basta pintar <b>entre pares</b>: " +
        "trecho 1→2 (dentro), pula 2→3 (fora), pinta 3→4 (dentro)… Em código, conta-se um contador de " +
        "paridade: pinta-se onde ele está <em>ímpar</em>.</p>" +
        "<p>Por isso polígonos <b>côncavos</b> simplesmente funcionam: a linha pode ter 2, 4, 6… " +
        "cruzamentos, e a regra não muda. Na linha em destaque, <code>y = 4,5</code>, os x ordenados " +
        "são <span class='ok'>3 · 6,625 · 7,375 · 10</span>: pinta-se <span class='hl'>[3 ; 6,625]</span> " +
        "e <span class='hl'>[7,375 ; 10]</span>, e o miolo <span class='no'>[6,625 ; 7,375]</span> — o " +
        "entalhe em V — fica de fora, exatamente como deve.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          outline(plane);
          var y = 4.5;
          var xs = scanX(POLY, y);
          plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
          bars(plane, [y]);
          xs.forEach(function (x, i) {
            plane.point(x, y, { color: COL.green, radius: 4, label: String(i + 1), labelColor: COL.green });
          });
          plane.text(B[0] + 0.2, y, "y=" + y, { color: COL.yellow, dy: -6 });
        },
      },
    });

    steps.push({
      title: "Como montar, linha a linha",
      body:
        "<p>Para cada linha de varredura <code>y</code>, de baixo para cima:</p>" +
        "<ol>" +
        "<li>encontre os <b>x de interseção</b> com cada aresta que a linha cruza;</li>" +
        "<li><b>ordene</b> os x em ordem crescente;</li>" +
        "<li>preencha os <b>spans</b> entre pares consecutivos (1–2, 3–4, …).</li>" +
        "</ol>" +
        "<p>O x de uma interseção sai de uma interpolação linear ao longo da aresta. Para a aresta de " +
        "<code>(x₀, y₀)</code> a <code>(x₁, y₁)</code>:</p>" +
        "<div class='formula'>t = (y − y₀) / (y₁ − y₀)\nx = x₀ + t·(x₁ − x₀)</div>" +
        "<p>Recalcular isso do zero a cada linha funciona, mas é trabalho repetido. Os dois próximos " +
        "passos mostram como evitá-lo: atualizar os x <b>incrementalmente</b> (a ideia do DDA volta " +
        "aqui) e manter só as arestas <b>relevantes</b> para a linha atual (a Tabela de Arestas Ativas).</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          outline(plane);
          // Destaca uma interseção e a interpolação que a produz.
          var y = 4.5;
          var xs = scanX(POLY, y);
          plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
          xs.forEach(function (x, i) {
            plane.point(x, y, { color: COL.green, radius: 3.5, label: String(i + 1), labelColor: COL.green });
          });
        },
      },
    });

    // NOVO: atualização incremental x += 1/m — o DDA de novo.
    steps.push({
      title: "Atualização incremental: x += 1/m (é o DDA!)",
      body:
        "<p>Olhe para uma única aresta enquanto subimos a varredura de uma linha para a seguinte: " +
        "<code>y</code> aumenta exatamente <b>1</b>. O x da interseção com essa aresta também avança " +
        "uma quantidade <b>fixa</b> — a recíproca da inclinação:</p>" +
        "<div class='formula'>m = (y₁ − y₀) / (x₁ − x₀)   (inclinação da aresta)\n" +
        "Δx por linha = 1 / m = (x₁ − x₀) / (y₁ − y₀)\n" +
        "x(y + 1) = x(y) + 1/m</div>" +
        "<p>Em vez de refazer a multiplicação <code>x₀ + t·(x₁−x₀)</code> a cada linha, guardamos o " +
        "<code>x</code> corrente da aresta e <b>somamos <code>1/m</code></b> ao passar para a próxima. " +
        "Uma soma por aresta por linha — sem multiplicação no laço interno.</p>" +
        "<p>Isso é <b>exatamente</b> a ideia do <em>DDA</em> de retas: dividir a variação total pelo " +
        "número de passos e ir somando o incremento, guardando o valor exato e arredondando só na " +
        "hora de escolher o pixel. Aqui o “eixo dominante” do passo é o <code>y</code> (anda 1 por " +
        "linha) e o atributo interpolado é o <code>x</code> da borda. Mesma mecânica que move cor, " +
        "z e textura ao longo das arestas.</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          outline(plane);
          // Mostra a mesma aresta cruzada por duas linhas consecutivas e o passo 1/m.
          // Aresta direita-superior: (10,8) -> (7,4), inclinação m = (4-8)/(7-10).
          var a = [10, 8], b = [7, 4];
          function xat(y) {
            var t = (y - a[1]) / (b[1] - a[1]);
            return a[0] + t * (b[0] - a[0]);
          }
          plane.segment(a, b, { color: COL.purple, lineWidth: 2 });
          [4.5, 5.5].forEach(function (y) {
            plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
            plane.point(xat(y), y, { color: COL.green, radius: 4 });
          });
          var dx = xat(5.5) - xat(4.5);
          plane.text(xat(5) - 0.2, 5, "+1/m", { color: COL.green, dx: 6, dy: 0 });
          plane.text(B[0] + 0.2, 6.6, "Δx=" + dx.toFixed(2) + "/linha", { color: COL.purple, dy: 0 });
        },
      },
    });

    // NOVO: Tabela de Arestas (ET) + Tabela de Arestas Ativas (AET).
    steps.push({
      title: "Tabela de Arestas e a AET",
      body:
        "<p>Testar <em>todas</em> as arestas em <em>toda</em> linha é desperdício: numa dada altura, a " +
        "maioria nem está lá. Duas estruturas organizam isso:</p>" +
        "<ul>" +
        "<li><b>Tabela de Arestas (ET)</b>: pré-calculada uma vez. Cada aresta é indexada pelo seu " +
        "<code>y</code> <b>mínimo</b>, guardando o <code>x</code> nesse ponto, o <code>y</code> " +
        "<b>máximo</b> e o incremento <code>1/m</code>.</li>" +
        "<li><b>Tabela de Arestas Ativas (AET)</b>: as arestas que <em>cruzam a linha atual</em>. Ao " +
        "subir para <code>y</code>: <b>insira</b> as arestas que começam nessa altura (vindas da ET), " +
        "<b>remova</b> as que já terminaram (<code>y ≥ y<sub>máx</sub></code>) e <b>some <code>1/m</code></b> " +
        "ao x das que continuam.</li>" +
        "</ul>" +
        "<p>Então é só ordenar os x da AET e preencher os pares. Como a maioria das arestas persiste " +
        "de uma linha para a próxima, a AET muda pouco a cada passo — o algoritmo trabalha por " +
        "<b>incrementos</b>, tanto no x (via <code>1/m</code>) quanto na própria lista de arestas.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          var y = 4.5;
          var rows = [];
          for (var i = 0; i < POLY.length; i++) {
            var a = POLY[i], b = POLY[(i + 1) % POLY.length];
            var ylo = Math.min(a[1], b[1]), yhi = Math.max(a[1], b[1]);
            if (ylo === yhi) continue; // horizontal: não entra na ET
            var xAtYlo = a[1] < b[1] ? a[0] : b[0];
            var invm = (b[0] - a[0]) / (b[1] - a[1]);
            var active = ylo <= y && yhi > y;
            rows.push([
              "(" + a[0] + "," + a[1] + ")→(" + b[0] + "," + b[1] + ")",
              String(ylo),
              String(yhi),
              xAtYlo.toFixed(1),
              (invm >= 0 ? "+" : "") + invm.toFixed(2),
              active ? "✔ na AET" : "—",
            ]);
          }
          EX.Content.table(host, {
            headers: ["aresta", "y mín", "y máx", "x em y mín", "1/m", "em y=4,5"],
            rows: rows,
          });
        },
      },
    });

    // Animação acumulando linhas
    LINES.forEach(function (y, idx) {
      var shown = LINES.slice(0, idx + 1);
      var xs = scanX(POLY, y);
      var spans = [];
      for (var i = 0; i + 1 < xs.length; i += 2)
        spans.push("[" + xs[i].toFixed(1) + ", " + xs[i + 1].toFixed(1) + "]");
      steps.push({
        title: "Varrendo y = " + y,
        body:
          "<p>Interseções ordenadas: <span class='ok'>" +
          xs.map(function (x) { return x.toFixed(2); }).join(", ") +
          "</span> — " + xs.length + " cruzamento" + (xs.length === 1 ? "" : "s") + ".</p>" +
          "<p>Spans preenchidos (pares 1–2, 3–4, …): <span class='hl'>" +
          (spans.length ? spans.join("  ") : "—") +
          "</span>." +
          (xs.length === 2
            ? " Dois cruzamentos: um único span — a linha está abaixo do entalhe, onde o polígono é cheio."
            : "") +
          (xs.length === 4
            ? " Quatro cruzamentos: dois spans, e o trecho do meio (o entalhe em V) <b>fica de fora</b> " +
              "porque cai entre o 2º e o 3º cruzamento."
            : "") +
          "</p>" +
          (idx === 0
            ? "<p>Os x não são inteiros: são onde a linha <em>realmente</em> corta a aresta. Como no " +
              "DDA, guarda-se o valor exato e só se arredonda ao acender cada pixel do span.</p>"
            : ""),
        visual: {
          type: "plane",
          bounds: B,
          draw: function (plane) {
            bars(plane, shown);
            outline(plane);
            plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
            xs.forEach(function (x) {
              plane.point(x, y, { color: COL.green, radius: 3.5 });
            });
          },
        },
      });
    });

    steps.push({
      title: "Casos especiais (vértices e horizontais)",
      body:
        "<p>A regra par-ímpar só funciona se cada cruzamento for contado <b>uma vez</b>. Dois casos " +
        "ameaçam isso:</p>" +
        "<ul>" +
        "<li><b>Arestas horizontais</b>: a linha de varredura coincide com a aresta inteira — seriam " +
        "“infinitos cruzamentos”. Solução: <b>ignore</b> as arestas horizontais (elas não definem " +
        "entra/sai); as arestas vizinhas, não-horizontais, já cuidam dos limites do span.</li>" +
        "<li><b>Vértices</b>: a linha passa <em>exatamente</em> na altura de um vértice, onde duas " +
        "arestas se encontram. Contar as duas seria contar 2 num ponto só (paridade errada → buraco ou " +
        "linha vazando).</li>" +
        "</ul>" +
        "<p>A convenção que resolve é o intervalo <b>meia-aberto em y</b>: uma aresta conta na linha " +
        "<code>y</code> apenas se <code>y<sub>mín</sub> ≤ y &lt; y<sub>máx</sub></code> (inclui a ponta " +
        "de baixo, exclui a de cima). Com isso:</p>" +
        "<ul>" +
        "<li>um vértice em <b>pico/vale</b> (duas arestas sobem, ou duas descem) conta <b>2</b> — entra " +
        "e sai, como deve;</li>" +
        "<li>um vértice de <b>passagem</b> (uma sobe, a outra desce) conta <b>1</b> — a linha apenas " +
        "atravessa.</li>" +
        "</ul>" +
        "<p>É a mesma ideia do <code>ymax</code> exclusivo da Tabela de Arestas: cada aresta “vive” em " +
        "<code>[y<sub>mín</sub>, y<sub>máx</sub>)</code>, então vértices compartilhados nunca são " +
        "contados em dobro. (E o nosso <code>scanX</code> usa exatamente esse teste meia-aberto.)</p>",
      visual: {
        type: "plane",
        bounds: B,
        draw: function (plane) {
          outline(plane);
          // Vértice de pico (topo direito do entalhe externo) vs vértice do entalhe.
          // Pico em (10,8) e (4,8): conta 2 na sua linha; o fundo do V (7,4) é vale.
          plane.point(7, 4, { color: COL.orange, radius: 5, ring: COL.orange, label: "vale: conta 2" });
          plane.point(10, 1, { color: COL.cyan, radius: 5, ring: COL.cyan, label: "base" });
          // linha logo abaixo do vértice do vale mostra a paridade
          var y = 3.5;
          var xs = scanX(POLY, y);
          plane.segment([B[0], y], [B[1], y], { color: COL.yellow, dashed: true });
          xs.forEach(function (x, i) {
            plane.point(x, y, { color: COL.green, radius: 3.5, label: String(i + 1), labelColor: COL.green });
          });
        },
      },
    });

    // NOVO: par-ímpar × non-zero winding (regras de preenchimento).
    steps.push({
      title: "Par-ímpar × regra do não-zero",
      body:
        "<p>“Pintar entre pares” é a <b>regra par-ímpar</b> (<em>even-odd</em>). Existe uma alternativa " +
        "muito usada (SVG, PostScript, fontes): a <b>regra do não-zero</b> (<em>nonzero winding</em>).</p>" +
        "<p>Em vez de só contar cruzamentos, a regra do não-zero leva em conta a <b>direção</b> de " +
        "cada aresta: some <code>+1</code> quando a borda cruza a linha subindo e <code>−1</code> " +
        "quando cruza descendo. Um ponto é <b>interno</b> se esse total (o <em>winding number</em>) é " +
        "<span class='hl'>diferente de zero</span>.</p>" +
        "<p>Onde elas divergem: figuras com <b>buracos</b> ou auto-interseção. Num anel desenhado com " +
        "os dois contornos no <b>mesmo</b> sentido, o furo tem winding ±2 — <b>não-zero o pinta</b> " +
        "(preenchido), enquanto <b>par-ímpar o deixa vazado</b>. Para furar, a regra do não-zero exige " +
        "desenhar o contorno interno no <b>sentido oposto</b> (winding 0 no furo).</p>" +
        "<p>Para o nosso polígono simples (sem buracos nem cruzamentos) as duas regras dão o " +
        "<b>mesmo</b> resultado — a distinção só importa em formas mais complexas.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "note",
            title: "Qual usar?",
            html: "<b>Par-ímpar</b>: conta cruzamentos (mais simples). <b>Não-zero</b>: soma direções " +
              "(o padrão de SVG/fontes; lida melhor com furos e sobreposições).",
          });
        },
      },
    });

    steps.push(
      EX.Slides.comparison({
        title: "Scan-Line × fills por semente",
        intro:
          "<p>Duas filosofias de preenchimento. O Scan-Line trabalha em <b>ordem de imagem</b> a partir " +
          "da geometria (é o que a GPU rasteriza); os fills por semente trabalham sobre pixels que " +
          "<b>já existem</b>, a partir de um clique. Um parte da <em>forma</em>, o outro da <em>cor</em>.</p>",
        headers: ["", "Scan-Line", "Boundary/Flood"],
        rows: [
          ["Entrada", "vértices do polígono", "semente + raster pronto"],
          ["Precisa de", "as arestas", "um ponto interno"],
          ["Côncavos", "trata por paridade", "trata naturalmente"],
          ["Custo-chave", "ordenar x / manter a AET", "varrer vizinhos (4/8-conex)"],
          ["Uso", "rasterizar polígonos", "pintar regiões já na tela"],
        ],
      })
    );

    steps.push({
      title: "Resumo",
      body:
        "<ul>" +
        "<li><b>Por linha</b>: ache os x de interseção, <b>ordene</b>, pinte entre <b>pares</b> " +
        "(regra par-ímpar).</li>" +
        "<li><b>Incremental</b>: ao subir uma linha, <code>x += 1/m</code> em cada aresta — o DDA de " +
        "novo; nada de multiplicar no laço.</li>" +
        "<li><b>ET + AET</b>: pré-indexe as arestas por <code>y<sub>mín</sub></code>; mantenha ativas " +
        "só as que cruzam a linha atual.</li>" +
        "<li><b>Vértices/horizontais</b>: intervalo <b>meia-aberto</b> em y (<code>ymax</code> " +
        "exclusivo); ignore arestas horizontais.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html: "Varra linha por linha, ordene os cruzamentos e pinte entre pares — atualizando os x " +
              "por <code>+1/m</code>, como no DDA.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g10-scanline",
    num: "≣",
    subject: "Computação Gráfica",
    section: "Preenchimento",
    title: "Scan-Line (preenchimento de polígonos)",
    type: "computacional",
    tags: ["preenchimento", "varredura", "polígono", "aet"],
    hubDesc: "Interseções por linha, ordenação e regra par-ímpar; x+=1/m incremental, Tabela de Arestas Ativas, vértices.",
    statement:
      "Entenda o preenchimento por Scan-Line: a varredura por linhas, o cálculo e a ordenação das " +
      "interseções com as arestas, o preenchimento dos intervalos internos pela regra par-ímpar, a " +
      "atualização incremental x += 1/m (a ideia do DDA), a Tabela de Arestas e a AET, a convenção " +
      "meia-aberta para vértices e a comparação com a regra do não-zero.",
    parts: [{ label: "Guia", build: build }],
  });
})();
