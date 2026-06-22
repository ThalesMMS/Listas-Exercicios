/*
 * g12-bsp.js — Guia: BSP Tree (Binary Space Partitioning).
 * Escolha de planos, classificação frente(+)/trás(−) pela normal (com o sinal de
 * n·(p−p₀)), construção recursiva da árvore, travessia trás-para-frente
 * (algoritmo do pintor — Doom!), o custo de um split e o compromisso entre número
 * de cortes e balanceamento. Foco no PORQUÊ a ordem de travessia dá a visibilidade.
 *
 * Visual: SVG (svg.line/arrow/circle/text/polygon) + EX.Diagram.tree (edgeLabel +/−).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Cena top-down: 3 objetos.
  var A = [120, 150], Bp = [330, 110], C = [350, 220];

  function obj(svg, p, n, color) {
    svg.circle(p[0], p[1], 15, { fill: color || "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.text(p[0], p[1], n, { size: 14, color: "var(--bg)", weight: 800 });
  }
  function plane(svg, p, q, mid, nrm, name) {
    svg.line(p[0], p[1], q[0], q[1], { stroke: "var(--accent)", strokeWidth: 2.5 });
    svg.arrow(mid[0], mid[1], mid[0] + nrm[0], mid[1] + nrm[1], { color: "var(--orange)", head: 9, strokeWidth: 2 });
    svg.text(p[0], p[1] - 10, name, { size: 14, weight: 700, color: "var(--accent)" });
  }

  function tree() {
    return {
      id: "p1", label: "p₁",
      children: [
        { id: "A", label: "A", edgeLabel: "−" },
        {
          id: "p2", label: "p₂", edgeLabel: "+",
          children: [
            { id: "B", label: "B", edgeLabel: "+" },
            { id: "C", label: "C", edgeLabel: "−" },
          ],
        },
      ],
    };
  }

  function build() {
    return [
      {
        title: "Ordenar profundidade de uma vez por todas",
        body:
          "<p>Para desenhar superfícies na ordem certa (de trás para frente, para que as da frente cubram " +
          "as de trás) precisamos saber <b>quem está atrás de quem</b> a partir do olho. Recalcular essa " +
          "ordem a cada quadro, comparando todos os objetos par a par, é caro — e a ordem muda quando a " +
          "câmera se move.</p>" +
          "<p>A <b>BSP</b> (Binary Space Partitioning) faz esse trabalho <span class='hl'>uma vez</span>: " +
          "particiona o espaço com <b>planos</b> e guarda o resultado numa <b>árvore binária</b>. " +
          "<b>Intuição:</b> é como dividir um país em estados, cada estado em municípios… Depois, dado " +
          "onde você está, a hierarquia já diz o que fica perto e o que fica longe.</p>" +
          "<p>O ponto central: montada a árvore, ela serve para <b>qualquer</b> ponto de vista — só muda a " +
          "<em>ordem</em> em que a percorremos, não a árvore. Vamos usar uma cena top-down com três " +
          "objetos A, B, C.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            obj(svg, A, "A"); obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "Um plano + a normal classificam tudo",
        body:
          "<p>Escolhemos um plano <code>p₁</code> e damos a ele uma <b>normal</b> <code>n</code> (a seta " +
          "laranja). A normal define qual lado é <b>frente (+)</b>; o oposto é <b>trás (−)</b>. A conta que " +
          "decide o lado de um ponto <code>p</code> é o sinal do <b>produto escalar</b> com um ponto " +
          "<code>p₀</code> do plano:</p>" +
          "<div class='formula'>f(p) = n · (p − p₀)\nf &gt; 0 → frente (+)\nf &lt; 0 → trás (−)\nf = 0 → sobre o plano</div>" +
          "<p><b>Por que funciona:</b> <code>n·(p−p₀)</code> é a projeção do vetor “do plano até p” na " +
          "direção da normal — ou seja, a <b>distância com sinal</b> de p ao plano. Positiva do lado para " +
          "onde n aponta, negativa do outro. É a mesma classificação por semiplano usada no recorte " +
          "(Cohen–Sutherland, Liang–Barsky) e nos octantes da octree (g11).</p>" +
          "<p>Cada objeto cai de um lado: <span class='no'>A</span> fica <b>atrás</b> (−); " +
          "<span class='ok'>B</span> e <span class='ok'>C</span> ficam <b>à frente</b> (+). É só avaliar o " +
          "sinal de <code>f</code> em cada um.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            obj(svg, A, "A", "var(--red)");
            obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "Recursão em cada lado",
        body:
          "<p>A construção é <b>recursiva</b>, igual à octree e à quadtree (g11), só que dividindo em " +
          "<b>2</b> por um plano em vez de 8 por três planos. O lado de trás de <code>p₁</code> só tem A → " +
          "vira <b>folha</b>, nada a subdividir. O lado da frente ainda mistura B e C, então escolhemos " +
          "<em>outro</em> plano <code>p₂</code> <b>só dentro daquele subespaço</b> e repetimos:</p>" +
          "<ul><li><span class='ok'>B</span> à frente de p₂ (+);</li>" +
          "<li><span class='no'>C</span> atrás de p₂ (−).</li></ul>" +
          "<p>Agora nenhum subespaço tem mais de um objeto → todos viram folhas e a recursão termina. " +
          "<b>Observe:</b> p₂ não precisa ter nada a ver com p₁ — cada nó parte apenas a fatia de espaço " +
          "que herdou do pai. É isso que deixa a partição se adaptar à cena.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            plane(svg, [250, 165], [470, 165], [360, 165], [0, -24], "p₂");
            obj(svg, A, "A", "var(--red)");
            obj(svg, Bp, "B"); obj(svg, C, "C");
          },
        },
      },
      {
        title: "A árvore BSP",
        body:
          "<p>Planos viram <b>nós internos</b>; objetos (ou fragmentos de superfície) viram <b>folhas</b>. " +
          "As arestas marcam o lado: <code>+</code> (frente, lado da normal) e <code>−</code> (trás). " +
          "Cada nó interno guarda também a <b>equação do seu plano</b> (n e p₀), porque é dela que sai a " +
          "classificação na hora de percorrer.</p>" +
          "<p>Aqui: raiz <code>p₁</code> → (− : A) e (+ : <code>p₂</code> → (+ : B), (− : C)). Repare que a " +
          "estrutura espelha exatamente a sequência de decisões dos dois passos anteriores.</p>" +
          "<p><b>Leitura útil:</b> a profundidade de uma folha conta quantos planos você atravessa para " +
          "chegar à célula daquele objeto — uma medida do quanto a cena foi “fatiada” ali.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(560, 300);
            EX.Diagram.tree(svg, tree(), { nodeShape: "box", highlight: ["p1", "p2"], view: [560, 300] });
          },
        },
      },
      {
        title: "Para que serve: o algoritmo do pintor",
        body:
          "<p>Agora a recompensa. Dado o observador, percorra a árvore <b>trás-para-frente</b> com uma " +
          "regra simples em cada nó: descubra de que lado do plano está o <b>olho</b> e desenhe primeiro o " +
          "lado <b>oposto</b> a ele, depois o próprio plano, depois o lado do olho.</p>" +
          "<div class='formula'>se olho está em + :  desenhe(−), depois plano, depois desenhe(+)\nse olho está em − :  desenhe(+), depois plano, depois desenhe(−)</div>" +
          "<p><b>Por que isso ordena certo:</b> o que está do lado oposto ao olho está, por definição, mais " +
          "<em>longe</em> através daquele plano — então deve ser pintado <b>antes</b> (como o pintor que " +
          "começa pelo fundo da tela). Aplicando a regra recursivamente em cada nó, as superfícies saem na " +
          "ordem de profundidade <b>exata</b>, <span class='hl'>sem z-buffer</span> e sem nenhuma " +
          "comparação de distância — só testes de lado.</p>" +
          "<p><b>Mini-exemplo:</b> com o olho à direita (lado + de p₁), a travessia dá " +
          "<code>A</code> (lado −, mais longe), depois entra em p₂; lá o olho está no lado − de p₂, então " +
          "<code>B</code> (lado +) antes de <code>C</code>. Ordem final de pintura: <b>A, B, C</b> — do " +
          "fundo para a frente.</p>" +
          "<p>Como a árvore é fixa, isso funciona para qualquer ângulo — só o <em>sentido</em> da travessia " +
          "muda. Foi exatamente assim que o <b>Doom</b> (1993) desenhou seus níveis em tempo real numa " +
          "máquina sem GPU: a BSP do mapa era pré-compilada e percorrida por quadro.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 300);
            plane(svg, [240, 30], [240, 270], [240, 150], [26, 0], "p₁");
            obj(svg, A, "A", "var(--red)"); obj(svg, Bp, "B"); obj(svg, C, "C");
            svg.circle(440, 150, 10, { fill: "var(--ink)", stroke: "var(--yellow)", strokeWidth: 2 });
            svg.text(440, 178, "olho", { size: 12, color: "var(--yellow)", weight: 700 });
            // ordem de pintura
            svg.text(120, 185, "1º", { size: 13, color: "var(--yellow)", weight: 800 });
            svg.text(330, 92, "2º", { size: 13, color: "var(--yellow)", weight: 800 });
            svg.text(350, 248, "3º", { size: 13, color: "var(--yellow)", weight: 800 });
          },
        },
      },
      {
        title: "O custo de um corte: splits e balanceamento",
        body:
          "<p>Há uma sutileza que o exemplo escondeu: e se um plano <b>atravessar</b> um objeto em vez de " +
          "deixá-lo inteiro de um lado? Aí o algoritmo precisa <b>cortar (split)</b> a superfície em dois " +
          "fragmentos — um para cada lado — e cada fragmento desce por um ramo diferente.</p>" +
          "<p><b>Consequência:</b> splits <span class='no'>aumentam o número de folhas</span> (a árvore " +
          "guarda mais polígonos do que a cena tinha) e custam tempo de construção. Por isso a escolha do " +
          "plano de corte é um <b>compromisso</b>:</p>" +
          "<ul>" +
          "<li>preferir planos que <b>cortem poucos</b> objetos → menos fragmentos, árvore menor;</li>" +
          "<li>preferir planos que <b>dividam a cena ao meio</b> → árvore mais <b>balanceada</b> e rasa " +
          "(travessia mais barata).</li>" +
          "</ul>" +
          "<p>Esses dois objetivos brigam, e achar o plano ótimo é caro — então usa-se heurística (ex.: " +
          "testar alguns candidatos e pontuar por <code>splits + |frente − trás|</code>). Uma escolha " +
          "comum é usar o próprio plano de uma das faces da cena como candidato.</p>" +
          "<p><b>Caso-limite:</b> a BSP <span class='hl'>não é única</span> — planos diferentes geram " +
          "árvores diferentes para a <em>mesma</em> cena. Todas dão a visibilidade correta; só variam em " +
          "tamanho e profundidade.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 260);
            // Um objeto (polígono) cortado por um plano em dois fragmentos.
            svg.line(240, 20, 240, 240, { stroke: "var(--accent)", strokeWidth: 2.5 });
            svg.text(248, 34, "p", { size: 14, weight: 700, color: "var(--accent)" });
            // fragmento da frente (+)
            svg.polygon([[240, 90], [360, 70], [360, 190], [240, 170]], { fill: "var(--green)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(310, 130, "+", { size: 18, weight: 800, color: "var(--ink)" });
            // fragmento de trás (−)
            svg.polygon([[120, 110], [240, 90], [240, 170], [120, 150]], { fill: "var(--red)", opacity: 0.45, stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(175, 130, "−", { size: 18, weight: 800, color: "var(--ink)" });
            svg.text(240, 256, "1 objeto vira 2 fragmentos (split)", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Comparação e armadilhas",
        body: "<p>Características importantes da BSP — quando ela vale a pena e onde dói:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Pré-computada uma vez, serve para qualquer câmera",
                "Ordem de profundidade correta sem z-buffer (só testes de lado)",
                "Boa para cenas estáticas (níveis de jogos clássicos: Doom, Quake)",
              ],
              cons: [
                "A árvore NÃO é única: depende dos planos escolhidos",
                "Um plano pode cortar um objeto em dois (split) e crescer a árvore",
                "Cenas dinâmicas exigem reconstrução — caro",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Cada plano parte o espaço em <b>frente/trás</b> pelo sinal de <code>n·(p−p₀)</code>; " +
                "percorrer a árvore desenhando sempre o lado oposto ao olho primeiro dá a visibilidade " +
                "correta, sem z-buffer.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g12-bsp",
    num: "⋔",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "BSP Tree",
    type: "conceitual",
    tags: ["sólidos", "bsp", "particionamento", "pintor"],
    hubDesc: "Planos, classificação frente(+)/trás(−) por n·(p−p₀), travessia trás-para-frente (algoritmo do pintor / Doom) e o custo dos splits.",
    statement:
      "Entenda a BSP Tree: a escolha de planos, a classificação dos objetos frente/trás pelo sinal de " +
      "n·(p−p₀), a construção recursiva da árvore, seu uso para ordenação por profundidade (algoritmo do " +
      "pintor, como no Doom) e o compromisso entre número de cortes (splits) e balanceamento.",
    parts: [{ label: "Guia", build: build }],
  });
})();
