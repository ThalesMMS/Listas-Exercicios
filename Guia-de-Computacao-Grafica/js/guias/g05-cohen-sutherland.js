/*
 * g05-cohen-sutherland.js — Guia: recorte de retas por Cohen-Sutherland.
 * Os códigos de região (4 bits), por que aceitação/rejeição trivial são
 * operações bit a bit, e o recorte iterativo fronteira a fronteira.
 * Comparação com Liang-Barsky.
 *
 * Reusa window.ALG.cohenSutherland / outCode / codeBits / codeNames.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var A = { x: -4, y: 4 },
    B = { x: 7, y: 3 };
  var BOUNDS = [-7, 10, -2, 9];

  function pt(P) {
    return [P.x.num(), P.y.num()];
  }
  function frpair(P) {
    return "(" + P.x.str() + ", " + P.y.str() + ")";
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }

  function build() {
    var steps = [];
    var res = ALG.cohenSutherland(A, B, W);

    // 1) Motivação
    steps.push({
      title: "Para que serve o recorte (clipping)",
      body:
        "<p>Antes de rasterizar, descartamos o que está <b>fora da janela</b> e aparamos o que entra " +
        "e sai. Pintar pixels fora da tela é desperdício — e ainda corrompe o desenho se as " +
        "coordenadas estouram o intervalo do hardware.</p>" +
        "<p>O ingênuo seria calcular a interseção da reta com as <b>quatro</b> fronteiras e ver quais " +
        "caem dentro. Cohen-Sutherland evita esse trabalho: a maioria das retas de uma cena está " +
        "<em>inteiramente</em> dentro ou <em>inteiramente</em> fora, e esses casos merecem uma resposta " +
        "barata. A ideia é <b>decidir rápido</b> os casos óbvios com pouquíssimo cálculo (só operações " +
        "bit a bit) e reservar as interseções para quando forem inevitáveis.</p>" +
        "<p>Vamos recortar a reta <span class='accent'>A(-4, 4)</span> → <span class='accent'>B(7, 3)</span> " +
        "contra a janela <code>x ∈ [-2, 5]</code>, <code>y ∈ [1, 6]</code>. A reta entra pela esquerda e " +
        "sai pela direita — nem trivialmente dentro, nem trivialmente fora — então vai exercitar o " +
        "algoritmo inteiro.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(A, B, { color: COL.yellow, lineWidth: 2 });
          plane.point(A.x, A.y, { color: COL.yellow, radius: 4, label: "A" });
          plane.point(B.x, B.y, { color: COL.yellow, radius: 4, label: "B" });
        },
      },
    });

    // 2) Region codes
    steps.push({
      title: "Códigos de região (4 bits)",
      body:
        "<p>As 4 retas que sustentam as bordas da janela, estendidas ao infinito, dividem o plano em " +
        "<b>9 regiões</b> (um tabuleiro da velha). Cada ponto ganha um código de 4 bits <code>TBRL</code> " +
        "— um bit para cada pergunta independente:</p>" +
        "<div class='formula'>bit T (8) = 1 se  y > ymax   (acima)\n" +
        "bit B (4) = 1 se  y < ymin   (abaixo)\n" +
        "bit R (2) = 1 se  x > xmax   (à direita)\n" +
        "bit L (1) = 1 se  x < xmin   (à esquerda)</div>" +
        "<p>O ponto <b>dentro</b> é o único com código <code>0000</code>. Repare que acima/abaixo e " +
        "esquerda/direita são pares mutuamente exclusivos — daí no máximo 2 bits acendem (os 4 cantos).</p>" +
        "<p>Por que <b>bits</b>, e não quatro booleanos soltos? Porque empacotados num inteiro eles " +
        "tornam dois testes <b>triviais</b> com uma única operação da ULA:</p>" +
        "<ul>" +
        "<li><span class='ok'>Aceita</span> se <code>code₀ OR code₁ = 0000</code> — nenhum dos dois " +
        "extremos viola nenhuma borda, logo a reta inteira está dentro.</li>" +
        "<li><span class='no'>Rejeita</span> se <code>code₀ AND code₁ ≠ 0000</code> — existe uma borda " +
        "que <em>ambos</em> os extremos violam pelo mesmo lado; a reta está toda além daquela borda e não " +
        "pode tocar a janela.</li>" +
        "</ul>" +
        "<p>No nosso exemplo: <span class='accent'>A(-4, 4)</span> tem <code>x = -4 &lt; -2</code> (acende " +
        "L) e <code>y = 4</code> dentro → <code>0001</code>. <span class='accent'>B(7, 3)</span> tem " +
        "<code>x = 7 &gt; 5</code> (acende R) e <code>y = 3</code> dentro → <code>0010</code>.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          // linhas das fronteiras estendidas
          [W.xmin, W.xmax].forEach(function (x) {
            plane.segment([x, BOUNDS[2]], [x, BOUNDS[3]], { color: COL.muted, dashed: true, lineWidth: 1 });
          });
          [W.ymin, W.ymax].forEach(function (y) {
            plane.segment([BOUNDS[0], y], [BOUNDS[1], y], { color: COL.muted, dashed: true, lineWidth: 1 });
          });
          win(plane);
          var cells = [
            [-5, 8, "1001"], [1.5, 8, "1000"], [8, 8, "1010"],
            [-5, 3.5, "0001"], [1.5, 3.5, "0000"], [8, 3.5, "0010"],
            [-5, -1, "0101"], [1.5, -1, "0100"], [8, -1, "0110"],
          ];
          cells.forEach(function (c) {
            plane.text(c[0], c[1], c[2], { color: c[2] === "0000" ? COL.green : COL.ink, align: "center", font: "12px ui-monospace, monospace" });
          });
        },
      },
    });

    // 3) O laço
    steps.push({
      title: "Quando não é trivial: recorta e repete",
      body:
        "<p>Se não aceita nem rejeita de cara, a reta <b>cruza</b> alguma fronteira: tem um pedaço " +
        "dentro e um pedaço fora. A estratégia é aparar o excesso <b>uma borda por vez</b>:</p>" +
        "<ol>" +
        "<li>pegue um extremo que esteja <b>fora</b> (código ≠ 0);</li>" +
        "<li>escolha <b>uma</b> fronteira que seu código acusa e calcule a interseção da reta com ela;</li>" +
        "<li>substitua o extremo de fora pela interseção e <b>recalcule</b> seu código.</li>" +
        "</ol>" +
        "<p>Volte ao teste trivial e repita. A intuição: cada corte <span class='hl'>apaga ao menos um " +
        "bit</span> de “fora” daquele extremo, então o código só caminha em direção a <code>0000</code>. " +
        "Como há 4 bits e dois extremos, o laço termina em <b>no máximo 4 cortes</b> — não fica preso.</p>" +
        "<p>Cuidado com a etapa 2: só faz sentido recortar contra uma borda cujo bit está aceso. Recortar " +
        "contra uma borda que o extremo não viola produziria uma interseção <em>fora</em> do segmento. " +
        "Por isso recalcular o código (etapa 3) é obrigatório — ver as armadilhas no fim.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(A, B, { color: COL.yellow, dashed: true });
          plane.point(A.x, A.y, { color: COL.yellow, radius: 4 });
          plane.point(B.x, B.y, { color: COL.yellow, radius: 4 });
        },
      },
    });

    // 3b) Derivação da interseção (novo passo)
    steps.push({
      title: "A fórmula da interseção",
      body:
        "<p>Recortar contra uma borda é cruzar a reta com uma <b>reta horizontal ou vertical</b>, o que " +
        "deixa a conta simples. Parametrize o segmento como <code>P(t) = A + t·(B − A)</code>, com " +
        "<code>t ∈ [0, 1]</code>, e iguale a coordenada fixa da borda.</p>" +
        "<p>Para uma borda <b>vertical</b> <code>x = xb</code> (esquerda ou direita), resolva " +
        "<code>x</code> e leve <code>t</code> de volta em <code>y</code>:</p>" +
        "<div class='formula'>t = (xb − x₀) / (x₁ − x₀)\ny = y₀ + t·(y₁ − y₀)</div>" +
        "<p>Para uma borda <b>horizontal</b> <code>y = yb</code> (topo ou base), troque os papéis:</p>" +
        "<div class='formula'>t = (yb − y₀) / (y₁ − y₀)\nx = x₀ + t·(x₁ − x₀)</div>" +
        "<p>Equivale a usar a inclinação: na borda vertical, <code>y = y₀ + m·(xb − x₀)</code> com " +
        "<code>m = Δy/Δx</code>; na horizontal, <code>x = x₀ + (yb − y₀)/m</code>. O denominador nunca " +
        "zera no caso que importa — se a reta fosse paralela à borda, o bit correspondente não estaria " +
        "aceso e nós não a escolheríamos.</p>" +
        "<p>Como guardamos tudo em <b>frações exatas</b>, a interseção sai sem erro de arredondamento — " +
        "é por isso que aparecem números como <code>42/11</code> adiante, e não 3,82.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(A, B, { color: COL.yellow, lineWidth: 2 });
          // marca a interseção com a borda esquerda (primeiro corte do exemplo)
          var t = (W.xmin - A.x) / (B.x - A.x);
          var iy = A.y + t * (B.y - A.y);
          plane.segment([W.xmin, BOUNDS[2]], [W.xmin, BOUNDS[3]], { color: COL.accent, dashed: true, lineWidth: 1 });
          plane.point(W.xmin, iy, { color: COL.green, radius: 5, ring: COL.green, label: "I" });
          plane.point(A.x, A.y, { color: COL.yellow, radius: 4, label: "A" });
          plane.point(B.x, B.y, { color: COL.yellow, radius: 4, label: "B" });
        },
      },
    });

    // 4..n) Animação do recorte
    res.steps.forEach(function (st) {
      if (st.type === "codes") {
        steps.push({
          title: "Códigos dos extremos",
          body:
            "<p>Primeiro classificamos cada extremo:</p>" +
            "<p><span class='accent'>A" +
            frpair(st.a) +
            "</span> → <code>" +
            ALG.codeBits(st.ca) +
            "</code> (" +
            ALG.codeNames(st.ca) +
            ")<br>" +
            "<span class='accent'>B" +
            frpair(st.b) +
            "</span> → <code>" +
            ALG.codeBits(st.cb) +
            "</code> (" +
            ALG.codeNames(st.cb) +
            ")</p>" +
            "<p>Agora os dois testes triviais, bit a bit:</p>" +
            "<div class='formula'>OR  = " +
            ALG.codeBits(st.ca) + " | " + ALG.codeBits(st.cb) + " = " +
            ALG.codeBits(st.ca | st.cb) +
            "   (≠ 0000 → não aceita)\n" +
            "AND = " +
            ALG.codeBits(st.ca) + " & " + ALG.codeBits(st.cb) + " = " +
            ALG.codeBits(st.ca & st.cb) +
            "   (= 0000 → não rejeita)</div>" +
            "<p>O OR mistura os dois lados (esquerda <em>e</em> direita acesos), então nenhuma borda " +
            "isolada exila a reta toda: ela <b>cruza</b> a janela. Sem atalho — <b>precisa recortar</b>.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(st.a, st.b, { color: COL.yellow, lineWidth: 2 });
              plane.point(st.a.x.num(), st.a.y.num(), { color: COL.yellow, radius: 4, label: "A" });
              plane.point(st.b.x.num(), st.b.y.num(), { color: COL.yellow, radius: 4, label: "B" });
            },
          },
        });
      } else if (st.type === "clip") {
        steps.push({
          title: "Recorte em " + st.edgeName,
          body:
            "<p>O extremo <span class='no'>" +
            frpair(st.from) +
            "</span> está fora (" +
            ALG.codeNames(st.edge) +
            "), então o cortamos contra a borda <code>" +
            st.edgeName +
            "</code> que seu bit acusa. Usando a fórmula da interseção:</p>" +
            "<p>A interseção é <span class='ok'>" +
            frpair(st.to) +
            "</span> — esse ponto passa a ser o novo extremo, e o pedaço de fora foi descartado. " +
            "Recalculando seu código: <code>" +
            ALG.codeBits(st.which === "a" ? st.ca : st.cb) +
            "</code>" +
            ((st.which === "a" ? st.ca : st.cb) === 0
              ? " (<span class='ok'>0000, já dentro</span>)."
              : " (ainda fora — outro corte virá).") +
            "</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(A, B, { color: COL.muted, dashed: true });
              plane.segment(pt(st.a), pt(st.b), { color: COL.orange, lineWidth: 2.5 });
              plane.point(st.to.x.num(), st.to.y.num(), { color: COL.green, radius: 5, ring: COL.green });
            },
          },
        });
      } else if (st.type === "accept") {
        steps.push({
          title: "Segmento visível",
          body:
            "<p>Agora <code>OR = 0000</code>: ambos os extremos estão <span class='ok'>DENTRO</span> e a " +
            "<b>aceitação trivial</b> dispara. A parte visível vai de " +
            "<span class='ok'>" +
            frpair(st.a) +
            "</span> a <span class='ok'>" +
            frpair(st.b) +
            "</span> — exatamente o trecho da reta original que cabe na janela.</p>" +
            "<p>Repare nas frações exatas (<code>42/11</code>, <code>35/11</code>): o recorte é " +
            "<b>geométrico</b>, não “pixelado”. Arredondar viria só depois, ao rasterizar este segmento " +
            "(como no DDA). Foram <b>2 cortes</b> — um por borda violada — para chegar aqui.</p>",
          visual: {
            type: "plane",
            bounds: BOUNDS,
            draw: function (plane) {
              win(plane);
              plane.segment(A, B, { color: COL.muted, dashed: true });
              plane.segment(pt(st.a), pt(st.b), { color: COL.green, lineWidth: 3.5 });
              plane.point(st.a.x.num(), st.a.y.num(), { color: COL.green, radius: 5 });
              plane.point(st.b.x.num(), st.b.y.num(), { color: COL.green, radius: 5 });
            },
          },
        });
      }
    });

    // n+0a) Contra-exemplo: rejeição trivial
    steps.push({
      title: "O caso fácil: rejeição trivial",
      body:
        "<p>Para sentir o ganho dos códigos, troque a reta por <span class='no'>C(6, 8) → D(9, 7)</span>, " +
        "que passa toda <b>à direita</b> da janela. Os códigos:</p>" +
        "<div class='formula'>C(6, 8): x=6>5 (R), y=8>6 (T) → 1010\n" +
        "D(9, 7): x=9>5 (R), y=7>6 (T) → 1010\n" +
        "AND = 1010 & 1010 = 1010 ≠ 0000  → REJEITA</div>" +
        "<p>O bit <code>R</code> está aceso nos <em>dois</em> extremos: ambos estão além de " +
        "<code>x = xmax</code>, logo a reta inteira está fora daquela borda. Uma única operação " +
        "<code>AND</code> resolveu — <b>zero interseções, zero divisões</b>. É esse atalho, repetido por " +
        "milhares de retas, que faz o algoritmo valer a pena.</p>" +
        "<p><span class='hl'>Pegadinha:</span> se C e D estivessem em cantos <em>opostos</em> (ex.: um " +
        "acima-à-esquerda <code>1001</code>, outro abaixo-à-direita <code>0110</code>), o " +
        "<code>AND</code> daria <code>0000</code> — não rejeita — mesmo que a reta talvez nem toque a " +
        "janela. O teste trivial é <b>conservador</b>: ele só garante o “com certeza fora”; o resto vai " +
        "para o laço de cortes.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment([6, 8], [9, 7], { color: COL.red, lineWidth: 2.5 });
          plane.point(6, 8, { color: COL.red, radius: 4, label: "C" });
          plane.point(9, 7, { color: COL.red, radius: 4, label: "D" });
          // fronteiras estendidas para enxergar "tudo à direita / acima"
          plane.segment([W.xmax, BOUNDS[2]], [W.xmax, BOUNDS[3]], { color: COL.muted, dashed: true, lineWidth: 1 });
          plane.segment([BOUNDS[0], W.ymax], [BOUNDS[1], W.ymax], { color: COL.muted, dashed: true, lineWidth: 1 });
        },
      },
    });

    // n+1) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Cohen-Sutherland × Liang-Barsky",
        intro: "<p>Dois jeitos de recortar uma reta — escolha conforme o cenário.</p>",
        headers: ["", "Cohen-Sutherland", "Liang-Barsky"],
        rows: [
          ["Abordagem", "códigos + interseções", "paramétrica (u)"],
          ["Casos triviais", "muito rápidos (bit a bit)", "também trata, via p,q"],
          ["Interseções", "pode calcular várias", "no máximo o necessário"],
          ["Melhor quando", "maioria fora/dentro", "muitos cruzamentos parciais"],
        ],
      })
    );

    // n+1b) Conexões e custo
    steps.push({
      title: "Custo, variações e onde isto aparece",
      body:
        "<p><b>Custo.</b> O setup é só comparar 4 coordenadas por extremo (os bits). O laço faz no máximo " +
        "4 interseções — na prática quase sempre 0 (trivial dentro/fora) ou 1–2. Por isso brilha quando " +
        "a <b>maioria das primitivas é trivialmente classificável</b>, o caso comum numa cena grande.</p>" +
        "<p><b>3D.</b> A mesma ideia sobe para o espaço com um código de <b>6 bits</b> (acrescenta " +
        "<em>perto</em> e <em>longe</em> do frustum de visão) — é o recorte clássico contra o volume de " +
        "visão antes da projeção. Em coordenadas homogêneas recortamos no espaço de clip " +
        "<code>-w ≤ x, y, z ≤ w</code>; a estrutura bit a bit não muda.</p>" +
        "<p><b>Família.</b> Para recortar <em>polígonos</em> (não só retas) contra a janela, o parente " +
        "direto é o <b>Sutherland-Hodgman</b> (ver guia ao lado), que também apara uma borda por vez. " +
        "Quando a reta tende a ter muitos cruzamentos parciais, o <b>Liang-Barsky</b> paramétrico " +
        "costuma sair na frente — é o próximo guia.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          // a reta original tracejada + o trecho aceito em verde
          plane.segment(A, B, { color: COL.muted, dashed: true });
          plane.segment(pt(res.a), pt(res.b), { color: COL.green, lineWidth: 3.5 });
        },
      },
    });

    // n+2) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Não é uma passada só</b>: pode recortar a mesma reta 1–4 vezes até ficar trivial. Quem " +
        "espera “calculou os códigos, acabou” se perde.</li>" +
        "<li><b>Escolha da fronteira</b>: recorte contra um bit que o código realmente acusa. Cortar " +
        "contra uma borda não-violada dá uma interseção <span class='no'>fora</span> do segmento.</li>" +
        "<li><b>Recalcule o código</b> após cada corte — reaproveitar o código antigo trava o laço num " +
        "extremo que “continua fora” para sempre.</li>" +
        "<li><b>AND = 0 não garante visível</b>: cantos opostos passam no teste trivial e ainda assim " +
        "podem não tocar a janela — só o laço de cortes decide.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html:
              "Codificar a posição em 4 bits transforma “dá para descartar?” em um " +
              "<b>OR/AND</b> instantâneo; interseção só quando inevitável.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g05-cohen-sutherland",
    num: "▭",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Cohen-Sutherland (recorte de retas)",
    type: "computacional",
    tags: ["recorte", "clipping", "retas", "outcode"],
    hubDesc: "Códigos de 4 bits (TBRL), aceitação/rejeição trivial bit a bit, fórmula da interseção e recorte iterativo.",
    statement:
      "Entenda o recorte de retas por Cohen-Sutherland: os códigos de região de 4 bits (TBRL), por que a " +
      "aceitação e a rejeição triviais são operações bit a bit, a fórmula da interseção com cada borda e o " +
      "recorte iterativo (no máximo 4 cortes). Inclui um contra-exemplo de rejeição trivial, o custo e as " +
      "conexões com Liang-Barsky, Sutherland-Hodgman e o recorte 3D de 6 bits.",
    parts: [{ label: "Guia", build: build }],
  });
})();
