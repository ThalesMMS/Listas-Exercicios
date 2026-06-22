/*
 * g13-csg.js — Guia: CSG (Constructive Solid Geometry).
 * Sólidos como árvores de operações booleanas (união ∪, interseção ∩,
 * diferença −) sobre primitivas. Por que a ordem importa, como se avalia por
 * classificação de ponto / pertinência ao longo do raio, booleanas
 * REGULARIZADAS (sem faces/arestas soltas), CSG × B-rep e aplicações (CAD).
 * Foco no PORQUÊ a árvore é exata e editável — com mini-exemplos.
 *
 * Visual: SVG (svg.circle/rect/ellipse/line/text) + EX.Diagram.tree.
 */
(function () {
  "use strict";
  var EX = window.EX;

  function build() {
    return [
      {
        title: "Montar sólidos como uma fórmula",
        body:
          "<p>Uma malha lista milhares de triângulos — pesada de editar e sujeita a buracos. CSG troca " +
          "isso por uma <b>receita</b>: descreve o sólido como uma <b>combinação de primitivas</b> " +
          "(esfera, cubo, cilindro, cone…) ligadas por <b>operações de conjunto</b>.</p>" +
          "<p><b>Intuição:</b> pense em marcenaria ou em modelagem com plastilina — você <em>junta</em> " +
          "blocos, <em>recorta</em> com uma broca, fica só com a <em>sobreposição</em> de duas peças. CSG " +
          "é essa linguagem escrita como fórmula.</p>" +
          "<p>O modelo vira uma <b>árvore</b>: compacta (poucos parâmetros), <b>exata</b> (a esfera é uma " +
          "esfera de verdade, não uma aproximação facetada) e fácil de editar — mude um raio e <b>tudo se " +
          "recompõe</b> sozinho, sem remendar geometria.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 200);
            svg.circle(110, 100, 52, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
            svg.text(110, 100, "esfera", { size: 12, color: "var(--accent)", weight: 700 });
            svg.rect(210, 60, 90, 90, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
            svg.text(255, 105, "cubo", { size: 12, color: "var(--green)", weight: 700 });
          },
        },
      },
      {
        title: "As três operações booleanas",
        body:
          "<p>Pense em cada sólido como o <b>conjunto de pontos</b> que ele ocupa. Sobre dois sólidos A e B, " +
          "as três operações são as da teoria de conjuntos:</p>" +
          "<ul>" +
          "<li><b>União A ∪ B</b>: pontos que estão em A <b>ou</b> B (juntar peças);</li>" +
          "<li><b>Interseção A ∩ B</b>: pontos em A <b>e</b> B (só a sobreposição);</li>" +
          "<li><b>Diferença A − B</b>: pontos em A e <b>não</b> em B (furar/cortar — equivale a " +
          "<code>A ∩ B̄</code>, A interseção o complemento de B).</li>" +
          "</ul>" +
          "<p>Essa é a chave de toda a avaliação adiante: saber se um ponto pertence ao resultado é " +
          "combinar “está em A?” e “está em B?” com <b>e/ou/não</b>. Tudo o mais é geometria a serviço " +
          "dessas três perguntas booleanas.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(720, 230);
            function pair(cx, mode, label) {
              var ax = cx - 26, bx = cx + 26, y = 110, r = 52;
              if (mode === "union") {
                svg.circle(ax, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
              } else if (mode === "inter") {
                svg.circle(ax, y, r, { fill: "var(--accent)", opacity: 0.4, stroke: "var(--accent)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--accent)", opacity: 0.4, stroke: "var(--accent)", strokeWidth: 1.5 });
                svg.text(cx, y, "∩", { size: 20, color: "var(--ink)", weight: 800 });
              } else {
                svg.circle(ax, y, r, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
                svg.circle(bx, y, r, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
              }
              svg.text(cx, 200, label, { size: 13, color: "var(--ink-dim)", weight: 700 });
            }
            pair(140, "union", "A ∪ B");
            pair(380, "inter", "A ∩ B");
            pair(600, "diff", "A − B");
          },
        },
      },
      {
        title: "A árvore CSG",
        body:
          "<p>A receita ganha forma de <b>árvore binária</b>. As <b>folhas</b> são primitivas, e cada folha " +
          "carrega suas próprias <b>transformações</b> (posição, rotação, escala) — exatamente as matrizes " +
          "do guia de transformações (g01) que levam a primitiva do seu sistema local para a cena. Os " +
          "<b>nós internos</b> são operações booleanas, sempre combinando <b>duas</b> subárvores.</p>" +
          "<p>Avaliar a árvore é um percurso recursivo: o valor de um nó interno é a sua operação aplicada " +
          "aos valores dos dois filhos. Folhas profundas podem ser árvores inteiras — dá para compor sem " +
          "limite.</p>" +
          "<p>Exemplo mínimo: uma <em>lupa</em> = <code>círculo ∪ cilindro</code> (a lente unida ao cabo).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 280);
            EX.Diagram.tree(
              svg,
              { id: "u", label: "∪", children: [{ id: "c", label: "círculo" }, { id: "y", label: "cilindro" }] },
              { nodeShape: "box", highlight: ["u"], view: [480, 280] }
            );
          },
        },
      },
      {
        title: "Exemplo: diferença (uma lua)",
        body:
          "<p>Um crescente sai de <code>A − B</code>: tome o disco A e <b>remova</b> o disco B (deslocado). " +
          "O contorno tracejado mostra a parte cortada. Sobra a “mordida” complementar — a lua.</p>" +
          "<p>B age como <b>ferramenta de corte</b>: não aparece no resultado, só <em>molda</em> A. " +
          "(É o mesmo papel da broca que fura uma peça: a broca não fica na peça, mas define o furo.)</p>" +
          "<p><b>Conferindo pelos conjuntos:</b> um ponto está no crescente se está <span class='ok'>" +
          "dentro de A</span> <b>e</b> <span class='no'>fora de B</span>. O ponto bem à esquerda de A " +
          "passa (dentro de A, longe de B); um ponto na região sobreposta falha (está dentro de B). " +
          "É a regra <code>A ∩ B̄</code> em ação.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 280);
            svg.circle(190, 150, 86, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(248, 110, 80, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "6 4" });
            svg.text(150, 150, "A", { size: 16, color: "var(--bg)", weight: 800 });
            svg.text(286, 92, "B", { size: 15, color: "var(--ink-dim)", weight: 800 });
            svg.text(220, 258, "A − B = crescente", { size: 13, color: "var(--ink-dim)", weight: 700 });
          },
        },
      },
      {
        title: "A ordem importa",
        body:
          "<p>União e interseção <b>comutam</b> (<code>A ∪ B = B ∪ A</code>, <code>A ∩ B = B ∩ A</code>), " +
          "porque “ou” e “e” não dependem da ordem dos operandos. Mas a <b>diferença não comuta</b>: " +
          "<code>A − B ≠ B − A</code>. “Furar A com B” deixa A mordido; “furar B com A” deixa B mordido — " +
          "resultados diferentes, como mostram os dois desenhos.</p>" +
          "<p><b>Por quê:</b> <code>A − B = A ∩ B̄</code> e <code>B − A = B ∩ Ā</code> — operandos " +
          "trocados, conjuntos diferentes. A diferença também não é associativa, então parênteses " +
          "(a forma da árvore) mudam o sólido.</p>" +
          "<p>E como cada primitiva carrega suas <b>transformações</b>, mover B desloca onde o corte " +
          "acontece sem tocar em mais nada. A árvore captura ordem <em>e</em> posição de forma totalmente " +
          "editável: trocar dois ramos, ou empurrar uma folha, já é um sólido novo.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 230);
            svg.circle(150, 120, 64, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(196, 92, 58, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
            svg.text(120, 200, "A − B", { size: 12, color: "var(--ink-dim)", weight: 700 });
            svg.circle(330, 120, 58, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 2 });
            svg.circle(286, 148, 64, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
            svg.text(330, 200, "B − A", { size: 12, color: "var(--ink-dim)", weight: 700 });
          },
        },
      },
      {
        title: "Avaliar: classificação de ponto e de raio",
        body:
          "<p>Como saber a forma final sem gerar uma malha? <b>Não geramos.</b> Perguntamos, ponto a ponto " +
          "ou raio a raio, e combinamos pela árvore.</p>" +
          "<p><b>Classificação de ponto:</b> para um ponto <code>p</code>, cada folha responde " +
          "<span class='ok'>dentro</span>/<span class='no'>fora</span> testando a primitiva (ex.: " +
          "<code>|p − centro| ≤ r</code> para a esfera). Sobe-se na árvore aplicando ∪ (OU), ∩ (E), " +
          "− (E-NÃO) até a raiz dar o veredito.</p>" +
          "<p><b>Classificação de raio (a que importa para renderizar — ray casting, ver g17):</b> em vez " +
          "de um ponto, considere o raio inteiro. Para cada primitiva, calcule o <b>intervalo</b> " +
          "<code>[t<sub>entra</sub>, t<sub>sai</sub>]</code> em que o raio está dentro dela. Então combine " +
          "os intervalos com as <b>mesmas operações sobre conjuntos</b>, agora em 1D ao longo de t:</p>" +
          "<div class='formula'>A: [t entra A, t sai A]\nB: [t entra B, t sai B]\nA − B: a parte de A que NÃO está em B</div>" +
          "<p><b>Mini-exemplo</b> (figura): o raio entra em A, encontra B no meio. Em <code>A − B</code>, o " +
          "trecho dentro de B é <span class='no'>removido</span> — sobram dois pedaços de A (antes e " +
          "depois de B). A primeira fronteira <em>sólida</em> que o raio toca é a superfície visível. " +
          "Tudo isso são contas de interseção 1D, sem nunca facetar o sólido.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(480, 220);
            var y = 90;
            // raio
            svg.arrow(20, y, 460, y, { color: "var(--ink-mute)", head: 8, strokeWidth: 1.5 });
            svg.text(40, y - 12, "raio (t →)", { size: 11, color: "var(--ink-mute)" });
            // intervalo A
            svg.line(110, y, 380, y, { stroke: "var(--accent)", strokeWidth: 6, opacity: 0.5 });
            svg.text(110, y - 14, "A", { size: 13, color: "var(--accent)", weight: 800 });
            // intervalo B (a ferramenta)
            svg.line(220, y, 300, y, { stroke: "var(--red)", strokeWidth: 6, opacity: 0.55 });
            svg.text(260, y - 14, "B", { size: 13, color: "var(--red)", weight: 800 });
            // resultado A - B (duas barras verdes abaixo)
            var yr = 150;
            svg.line(110, yr, 220, yr, { stroke: "var(--green)", strokeWidth: 8 });
            svg.line(300, yr, 380, yr, { stroke: "var(--green)", strokeWidth: 8 });
            svg.text(245, yr + 22, "A − B (dois trechos)", { size: 12, color: "var(--green)", weight: 700 });
            // marca da fronteira visível
            svg.circle(110, yr, 5, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(110, yr - 14, "1ª fronteira", { size: 10, color: "var(--yellow)", weight: 700 });
          },
        },
      },
      {
        title: "Booleanas regularizadas",
        body:
          "<p>Há uma cilada na teoria de conjuntos crua. Imagine <b>A ∩ B</b> de dois cubos que só se " +
          "<b>encostam numa face</b>: a interseção “de conjuntos” é aquela face — um retalho com " +
          "<b>espessura zero</b>. Pior, certas diferenças deixam <b>faces, arestas ou pontos soltos</b> " +
          "grudados num sólido válido. Esses pedaços de dimensão menor não são um sólido de verdade e " +
          "estragam a renderização e a fabricação.</p>" +
          "<p>A correção são as <b>operações regularizadas</b> (∪*, ∩*, −*): após a operação de conjunto, " +
          "<span class='hl'>descarta-se tudo o que não tem interior</span> — formalmente, toma-se o " +
          "<em>fecho do interior</em> do resultado. Assim só sobram regiões 3D genuínas; faces e arestas " +
          "órfãs somem.</p>" +
          "<p><b>Modelo mental:</b> regularizar é “engordar de volta” o resultado para a parte que tem " +
          "volume e jogar fora as aparas finas. Por isso a literatura sempre fala em booleanas " +
          "<em>regularizadas</em> — é o que garante que a saída ainda seja um sólido bem-formado " +
          "(um <b>r-set</b>).</p>" +
          "<p><b>Caso-limite clássico:</b> A ∩* B de dois cubos que só se tocam numa face = " +
          "<span class='no'>vazio</span> (a face não tem interior), não a face.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(460, 230);
            // esquerda: resultado cru com uma face solta
            svg.rect(40, 70, 90, 90, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
            // face/aresta solta (linha grossa pendurada)
            svg.line(130, 70, 175, 70, { stroke: "var(--red)", strokeWidth: 4 });
            svg.text(155, 58, "aresta solta", { size: 10, color: "var(--red)", weight: 700 });
            svg.text(85, 195, "cru (de conjuntos)", { size: 12, color: "var(--ink-dim)" });
            // seta de regularização
            svg.arrow(215, 115, 270, 115, { color: "var(--ink-mute)", head: 9, strokeWidth: 2 });
            svg.text(242, 100, "∩*", { size: 14, mono: true, color: "var(--ink-dim)", weight: 800 });
            // direita: limpo
            svg.rect(300, 70, 90, 90, { fill: "var(--green)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(345, 195, "regularizado (sólido)", { size: 12, color: "var(--green)", weight: 700 });
          },
        },
      },
      {
        title: "Como se avalia e comparação",
        body:
          "<p>Resumindo a avaliação: para renderizar, lança-se um raio por pixel e classifica-se contra a " +
          "árvore (ray casting através da CSG); para checar um ponto, desce-se a árvore combinando " +
          "dentro/fora. Em ambos, <b>nada de gerar a malha de antemão</b> — a forma “existe” como a " +
          "fórmula.</p>" +
          "<p><b>CSG × B-rep:</b> a alternativa é a <b>representação por fronteira</b> (B-rep), que guarda " +
          "explicitamente faces, arestas e vértices da casca. B-rep é direta de rasterizar e de percorrer " +
          "a superfície, mas editar (um furo, um chanfro) exige recalcular topologia. CSG é o oposto: " +
          "trivial de editar e sempre exata, mas precisa ser <em>avaliada/convertida</em> para virar " +
          "malha. Modeladores de <b>CAD</b> costumam manter as <b>duas</b>: a árvore CSG como histórico " +
          "editável e um B-rep avaliado para exibir.</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Representação compacta e exata (primitivas + operações)",
                "Editável: muda um parâmetro e o sólido se recompõe",
                "Casa bem com ray casting (testa a árvore por raio)",
                "Booleanas regularizadas garantem um sólido bem-formado",
              ],
              cons: [
                "Renderizar como malha exige avaliar/converter (boolean em superfícies)",
                "Árvores profundas ficam caras de avaliar",
                "B-rep é mais direto para percorrer a superfície",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Sólido = <b>árvore de ∪/∩/− sobre primitivas</b>. Compacto, exato e editável; avalia-se " +
                "por classificação de ponto/raio; use as versões <b>regularizadas</b> e lembre que a " +
                "diferença não comuta.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g13-csg",
    num: "∪",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "CSG — Constructive Solid Geometry",
    type: "conceitual",
    tags: ["sólidos", "csg", "booleanas", "ray-casting"],
    hubDesc: "União, interseção e diferença sobre primitivas; a árvore CSG, classificação de ponto/raio, booleanas regularizadas e CSG × B-rep.",
    statement:
      "Entenda a CSG: composição de sólidos por operações de união, interseção e diferença sobre " +
      "primitivas, organizadas numa árvore; como é avaliada por classificação de ponto e de raio; as " +
      "booleanas regularizadas (sem faces/arestas soltas) e a comparação com B-rep (CAD).",
    parts: [{ label: "Guia", build: build }],
  });
})();
