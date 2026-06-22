/*
 * g11-octree.js — Guia: Octree (subdivisão espacial recursiva).
 * Intuição via quadtree (2D), critério de homogeneidade (cheio/vazio/parcial) e
 * a árvore de octantes em 3D. O índice de octante x'+2y'+4z', a ordem de Morton
 * (Z-order) para guardar a árvore num vetor, travessia/aplicações e a comparação
 * com a grade uniforme de voxels. Foco no PORQUÊ da subdivisão e na conta de
 * memória — com mini-exemplos trabalhados.
 *
 * Visual: SVG (svg.rect/polygon/text/line) + EX.Diagram.tree.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Quadrado com estado: "full" | "empty" | "partial".
  function quad(svg, x, y, s, state) {
    if (state === "partial") {
      var h = s / 2;
      var sub = [["full", 0, 0], ["empty", 1, 0], ["empty", 0, 1], ["full", 1, 1]];
      sub.forEach(function (q) {
        quad(svg, x + q[1] * h, y + q[2] * h, h, q[0]);
      });
      return;
    }
    svg.rect(x, y, s, s, {
      fill: state === "full" ? "var(--accent)" : "var(--bg-soft)",
      stroke: "var(--ink)",
      strokeWidth: 1.5,
    });
  }

  // Cubo isométrico simples (3 faces).
  function cube(svg, cx, cy) {
    var top = [[cx, cy - 56], [cx + 58, cy - 22], [cx, cy + 12], [cx - 58, cy - 22]];
    var left = [[cx - 58, cy - 22], [cx, cy + 12], [cx, cy + 80], [cx - 58, cy + 46]];
    var right = [[cx + 58, cy - 22], [cx, cy + 12], [cx, cy + 80], [cx + 58, cy + 46]];
    svg.polygon(top, { fill: "var(--accent)", opacity: 0.95, stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.polygon(left, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
    svg.polygon(right, { fill: "var(--accent)", opacity: 0.32, stroke: "var(--ink)", strokeWidth: 1.5 });
  }

  // Árvore de octantes do exemplo 4³ (0,1,2,3,4,6 cheios; 5,7 vazios).
  function octantTree() {
    var empty = { 5: 1, 7: 1 };
    var ch = [];
    for (var n = 0; n <= 7; n++) ch.push({ id: "o" + n, label: n + (empty[n] ? " □" : " ■") });
    return { id: "r", label: "4³", children: ch };
  }

  function build() {
    return [
      {
        title: "Guardar só onde há detalhe",
        body:
          "<p>Representar um sólido por uma grade cheia de <b>voxels</b> (os “pixels” do 3D) gasta " +
          "memória <code>O(n³)</code>: dobrar a resolução de cada eixo multiplica o consumo por <b>8</b>. " +
          "Pior: você paga por <em>todo</em> o volume, mesmo em regiões enormes e uniformes — todas cheias " +
          "ou todas vazias — onde não há informação nenhuma a guardar.</p>" +
          "<p><b>Intuição:</b> é como descrever uma parede branca pixel a pixel em vez de dizer “este " +
          "retângulo todo é branco”. A <b>octree</b> faz a segunda coisa: subdivide o espaço <b>só onde " +
          "ele não é uniforme</b>. Uma região homogênea vira uma única <b>folha</b>; uma região mista " +
          "continua sendo dividida até esclarecer o detalhe.</p>" +
          "<p>Ao lado, uma região 6×6 inteiramente preenchida: a grade gasta 36 células; a octree resolve " +
          "com <b>1</b> folha. O ganho vem de não repetir o óbvio.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 200);
            svg.rect(40, 40, 120, 120, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(100, 175, "1 folha", { size: 12, color: "var(--ink-dim)" });
            for (var i = 0; i < 6; i++)
              for (var j = 0; j < 6; j++)
                svg.rect(210 + i * 20, 40 + j * 20, 20, 20, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1 });
            svg.text(270, 175, "36 voxels", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Intuição em 2D: a quadtree",
        body:
          "<p>Antes de ir ao 3D, vale ver a ideia em 2D, onde dá para desenhar tudo. Cada quadrado se " +
          "divide em <b>4</b> filhos iguais — é a <b>quadtree</b> (a octree é a versão 3D dela). A regra é " +
          "recursiva e tem só dois casos:</p>" +
          "<ul>" +
          "<li><b>homogêneo</b> (todo cheio ou todo vazio) → vira <b>folha</b> e <span class='ok'>para de " +
          "dividir</span>;</li>" +
          "<li><b>parcial</b> (mistura) → <span class='hl'>subdivide</span> em 4 e repete a regra em cada " +
          "filho.</li>" +
          "</ul>" +
          "<p>Ao lado, o quadrante superior-esquerdo é <b>parcial</b>, então foi subdividido (e dois dos " +
          "seus netos ainda são preenchidos); os outros três quadrantes já eram homogêneos e pararam. " +
          "Repare que <b>nós vizinhos podem ter profundidades diferentes</b>: a árvore é mais funda só " +
          "onde a figura é mais detalhada — exatamente onde gastar bits compensa.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(320, 320);
            quad(svg, 20, 20, 140, "partial");
            quad(svg, 160, 20, 140, "full");
            quad(svg, 20, 160, 140, "empty");
            quad(svg, 160, 160, 140, "full");
          },
        },
      },
      {
        title: "Os três estados",
        body:
          "<p>O segredo é a classificação de cada nó por <b>homogeneidade</b>. Há exatamente três rótulos:</p>" +
          "<ul>" +
          "<li><span class='accent'>■ cheio</span> — o cubo está todo dentro do sólido → <b>folha</b>;</li>" +
          "<li><span class='muted'>□ vazio</span> — o cubo está todo fora do sólido → <b>folha</b>;</li>" +
          "<li><b>◧ parcial</b> — a fronteira do sólido cruza o cubo → <b>nó interno</b>: subdivide.</li>" +
          "</ul>" +
          "<p><b>Por que só o parcial cresce?</b> Cheio e vazio já estão totalmente decididos — não há nada " +
          "a refinar dentro deles. Só quando a superfície <em>atravessa</em> o cubo é que ainda falta " +
          "informação, e aí dividir vale a pena. Por isso os nós internos de uma octree representam, na " +
          "prática, a <b>casca</b> do objeto: a árvore concentra esforço na fronteira.</p>" +
          "<p>A recursão para quando tudo virou folha — ou quando se atinge a <b>resolução máxima</b> (o " +
          "tamanho de um voxel), e aí até um cubo parcial é forçado a virar folha. Logo a <b>profundidade " +
          "da árvore = nível de detalhe</b>: cada nível extra divide a aresta por 2.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 140);
            svg.rect(30, 30, 80, 80, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(70, 125, "■ cheio", { size: 12, color: "var(--ink-dim)" });
            svg.rect(140, 30, 80, 80, { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(180, 125, "□ vazio", { size: 12, color: "var(--ink-dim)" });
            quad(svg, 250, 30, 80, "partial");
            svg.text(290, 125, "◧ parcial", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Octree = a mesma ideia em 3D",
        body:
          "<p>Em 3D, cada cubo se divide em <b>8 octantes</b> — corte ao meio em x, em y e em z. Oito, e não " +
          "quatro, porque ganhamos uma dimensão: <code>2 × 2 × 2 = 8</code> (a quadtree fazia " +
          "<code>2 × 2 = 4</code>). Esse fator 8 por nível é o mesmo 8 do <code>O(n³)</code> do começo — só " +
          "que agora pagamos por ele <em>seletivamente</em>.</p>" +
          "<p>Para nomear cada octante, olhamos de que <b>metade</b> ele ocupa em cada eixo. Chame de " +
          "<code>x′, y′, z′ ∈ {0, 1}</code> esse bit (0 = metade baixa, 1 = metade alta) e empacote os três " +
          "bits num único número:</p>" +
          "<div class='formula'>índice = x′ + 2·y′ + 4·z′    (x′, y′, z′ ∈ {0, 1})</div>" +
          "<p>Os pesos <code>1, 2, 4</code> são as potências de 2 — é literalmente ler <code>z′y′x′</code> " +
          "como um número binário de 3 bits. (A derivação completa, com a tabela dos 8 octantes, vem no " +
          "próximo passo.)</p>" +
          "<p>Para o exemplo, tome um bloco <b>4³</b> cheio com um <b>entalhe</b> de 2 voxels num canto " +
          "superior. Esse pedaço removido torna o cubo <b>heterogêneo</b>, então a raiz não pode ser folha.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(300, 220);
            cube(svg, 150, 110);
            svg.text(150, 205, "bloco 4³ com entalhe", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Derivando o índice de octante",
        body:
          "<p>De onde vem <code>x′ + 2·y′ + 4·z′</code>? Cada octante é escolhido por <b>três decisões " +
          "binárias independentes</b>: metade baixa (0) ou alta (1) em x, depois em y, depois em z. Três " +
          "bits → <code>2³ = 8</code> combinações, uma por octante. Para virar um número, damos um " +
          "<b>peso posicional</b> a cada bit — exatamente como no sistema binário:</p>" +
          "<div class='formula'>x′ → peso 1   (2⁰)\ny′ → peso 2   (2¹)\nz′ → peso 4   (2²)\níndice = 4·z′ + 2·y′ + 1·x′</div>" +
          "<p><b>Mini-conta:</b> o octante na metade <em>alta</em> de x, <em>baixa</em> de y, <em>alta</em> " +
          "de z tem <code>(x′,y′,z′) = (1,0,1)</code>, logo <code>índice = 1 + 0 + 4 = 5</code>. No nosso " +
          "bloco 4³, o entalhe fica justamente nos octantes <span class='no'>5</span> e " +
          "<span class='no'>7</span> — os dois com <code>z′=1, x′=1</code> (a “coluna” superior-direita ao " +
          "fundo).</p>" +
          "<p>A vantagem desse mapeamento é que ele é <span class='hl'>reversível e barato</span>: dado um " +
          "ponto, os bits saem de comparações com o centro do cubo (<code>x ≥ cx?</code> etc.), e juntar os " +
          "bits dá o filho a visitar — sem busca, em <code>O(1)</code> por nível. É o mesmo raciocínio de " +
          "“qual lado do plano?” que você verá na BSP (ver g12), só que três planos de uma vez.</p>" +
          "<p><b>Convenção:</b> a ordem dos pesos é só uma escolha; trocar x↔z renumera os octantes mas não " +
          "muda a árvore. O importante é fixar uma convenção e segui-la.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 248);
            // Tabela dos 8 octantes: índice = x'+2y'+4z'.
            var rows = [
              ["idx", "z′", "y′", "x′"],
              ["0", "0", "0", "0"], ["1", "0", "0", "1"],
              ["2", "0", "1", "0"], ["3", "0", "1", "1"],
              ["4", "1", "0", "0"], ["5", "1", "0", "1"],
              ["6", "1", "1", "0"], ["7", "1", "1", "1"],
            ];
            var x0 = 96, y0 = 18, cw = 42, rh = 26;
            rows.forEach(function (r, i) {
              var isHead = i === 0;
              var isMark = r[0] === "5" || r[0] === "7";
              if (!isHead) {
                svg.rect(x0, y0 + i * rh - 18, cw * 4, rh, {
                  fill: isMark ? "var(--red)" : (i % 2 ? "var(--bg-soft)" : "none"),
                  opacity: isMark ? 0.22 : 1,
                  stroke: "none",
                });
              }
              r.forEach(function (cell, c) {
                svg.text(x0 + c * cw + cw / 2, y0 + i * rh, cell, {
                  size: 13,
                  mono: true,
                  weight: isHead ? 800 : (c === 0 ? 700 : 400),
                  color: isHead ? "var(--ink)" : (c === 0 ? "var(--accent)" : "var(--ink-dim)"),
                });
              });
            });
            svg.text(180, 242, "índice = x′ + 2·y′ + 4·z′", { size: 12, color: "var(--ink-mute)", mono: true });
          },
        },
      },
      {
        title: "A árvore do exemplo",
        body:
          "<p>A raiz <code>4³</code> é heterogênea (por causa do entalhe) → divide em 8. Classificando cada " +
          "octante pelo critério dos três estados:</p>" +
          "<ul>" +
          "<li>octantes <b>0, 1, 2, 3, 4, 6</b> → <span class='accent'>cheios ■</span> (folhas);</li>" +
          "<li>octantes <b>5, 7</b> → <span class='no'>vazios □</span> — o entalhe (folhas).</li>" +
          "</ul>" +
          "<p>Todos os 8 ficaram homogêneos → a árvore tem <b>profundidade 1</b> e o sólido inteiro cabe em " +
          "<b>9 nós</b> (1 raiz + 8 folhas), contra os <code>4³ = 64</code> voxels da grade. " +
          "<b>E se um octante fosse parcial?</b> Aí ele <em>não</em> seria folha: viraria um nó interno e " +
          "subdividiria em mais 8, descendo para a profundidade 2 — exatamente o que acontece quando a " +
          "fronteira do objeto não se alinha às metades do cubo.</p>" +
          "<p>Na figura, os nós <code>5</code> e <code>7</code> aparecem destacados; cada folha guarda só o " +
          "rótulo cheio/vazio, sem filhos.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(760, 320);
            EX.Diagram.tree(svg, octantTree(), { nodeShape: "circle", highlight: ["o5", "o7"], view: [760, 320] });
          },
        },
      },
      {
        title: "Da árvore de ponteiros à ordem de Morton",
        body:
          "<p>A árvore que desenhamos é uma estrutura de <b>ponteiros</b>: cada nó interno aponta para 8 " +
          "filhos. É flexível, mas cada salto de ponteiro é um acesso de memória disperso — ruim para o " +
          "cache e para a GPU. Uma alternativa é a <b>octree linear</b>: guardar os nós num vetor, sem " +
          "ponteiros, usando a <b>ordem de Morton</b> (também chamada <em>código Z</em> ou Z-order).</p>" +
          "<p><b>Ideia:</b> o caminho da raiz até um nó é uma sequência de índices de octante (cada um com " +
          "3 bits, pelo passo anterior). Concatene esses grupos de 3 bits e você tem um <b>código de " +
          "Morton</b> — um único inteiro que <span class='hl'>endereça o nó e codifica sua posição</span> " +
          "ao mesmo tempo. Ordenar os nós por esse código equivale a intercalar (interleave) os bits de " +
          "<code>x, y, z</code>.</p>" +
          "<div class='formula'>x = x₂x₁x₀,  y = y₂y₁y₀,  z = z₂z₁z₀\nMorton = z₂y₂x₂ z₁y₁x₁ z₀y₀x₀</div>" +
          "<p>A linha em zigue-zague ao lado é a curva de Morton percorrendo uma grade 4×4 (em 2D, para " +
          "caber no papel): pontos próximos na curva tendem a ser próximos no espaço — é essa " +
          "<b>localidade</b> que faz a octree linear voar no cache. Em 3D a mesma curva visita os 8 " +
          "octantes na ordem 0,1,2,…,7.</p>" +
          "<p><b>Caso-limite:</b> a curva tem “saltos” longos ao trocar de bloco grande (as pernas " +
          "compridas do Z) — a localidade é boa, mas não perfeita. Ainda assim é barata de computar (só " +
          "operações de bit) e por isso é onipresente em octrees de GPU e em índices espaciais.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(300, 300);
            // Curva de Morton (Z-order) numa grade 4x4. Ordem dos bits intercalados.
            var step = 64, off = 30;
            function cell(m) {
              // decodifica Morton 2D (4 bits) -> (x,y)
              var x = 0, y = 0;
              for (var b = 0; b < 2; b++) {
                x |= ((m >> (2 * b)) & 1) << b;
                y |= ((m >> (2 * b + 1)) & 1) << b;
              }
              return [off + x * step + step / 2, off + y * step + step / 2];
            }
            // grade
            for (var i = 0; i < 4; i++)
              for (var j = 0; j < 4; j++)
                svg.rect(off + i * step, off + j * step, step, step, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1 });
            // curva
            var pts = [];
            for (var m = 0; m < 16; m++) pts.push(cell(m));
            for (var k = 0; k + 1 < pts.length; k++)
              svg.line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], { stroke: "var(--accent)", strokeWidth: 2 });
            pts.forEach(function (p, idx) {
              svg.circle(p[0], p[1], 9, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 1.5 });
              svg.text(p[0], p[1], String(idx), { size: 10, mono: true, color: "var(--ink-dim)" });
            });
            svg.text(150, 292, "curva de Morton (Z-order), grade 4×4", { size: 11, color: "var(--ink-mute)" });
          },
        },
      },
      {
        title: "Travessia e aplicações",
        body:
          "<p>Onde a octree paga seu preço: ela permite <b>descartar volume inteiro de uma vez</b>. Em vez " +
          "de testar célula a célula, você testa o cubo de um nó; se ele não interessa, <span class='ok'>" +
          "poda toda a subárvore</span> num só passo.</p>" +
          "<ul>" +
          "<li><b>Colisão / consulta de ponto:</b> para saber se um ponto está no sólido, desça pela árvore " +
          "escolhendo o octante (via índice <code>x′+2y′+4z′</code>) até cair numa folha — <code>O(prof)</code>, " +
          "não <code>O(n³)</code>.</li>" +
          "<li><b>Travessia de raio (ray casting, ver g17):</b> um raio só visita os octantes que ele " +
          "realmente atravessa; cubos vazios são pulados em bloco. É o que torna voxels gigantes " +
          "renderizáveis.</li>" +
          "<li><b>SVO (Sparse Voxel Octree):</b> octrees lineares (Morton) guardadas na GPU para cenas com " +
          "bilhões de voxels — o “esparso” é justamente não armazenar os ramos homogêneos.</li>" +
          "<li><b>Nível de detalhe (LOD):</b> pare a descida mais cedo e use um nó interno como aproximação " +
          "grosseira do que está abaixo — barato e automático, pois a profundidade já é o detalhe.</li>" +
          "</ul>" +
          "<p>O fio condutor é o mesmo da BSP (g12): uma estrutura espacial construída uma vez que troca " +
          "varredura cega por <b>poda</b>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 220);
            // Raio cruzando um cubo subdividido: cubos cheios destacados, vazios pulados.
            svg.rect(40, 30, 160, 160, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5 });
            // quadrantes
            svg.rect(40, 30, 80, 80, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1 });
            svg.rect(120, 30, 80, 80, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1 });
            svg.rect(40, 110, 80, 80, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1 });
            svg.rect(120, 110, 80, 80, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1 });
            // raio
            svg.arrow(20, 60, 215, 175, { color: "var(--yellow)", head: 9, strokeWidth: 2.5 });
            svg.text(120, 210, "o raio pula os octantes vazios", { size: 12, color: "var(--ink-dim)" });
            // legenda
            svg.rect(245, 50, 16, 16, { fill: "var(--accent)", opacity: 0.5, stroke: "var(--ink)", strokeWidth: 1 });
            svg.text(305, 58, "cheio", { size: 12, color: "var(--ink-dim)" });
            svg.rect(245, 80, 16, 16, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1 });
            svg.text(305, 88, "vazio", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Comparação e resumo",
        body:
          "<p>Octree × grade de voxels — a troca de fundo é <b>memória/poda</b> contra <b>simplicidade de " +
          "acesso</b>:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.prosCons(host, {
              pros: [
                "Memória adaptativa: gasta só onde há detalhe (não O(n³))",
                "Consultas espaciais rápidas (descarta ramos homogêneos)",
                "Níveis de detalhe naturais (profundidade variável)",
                "Versão linear (Morton) é amiga do cache e da GPU",
              ],
              cons: [
                "Travessia/atualização mais complexas que um array",
                "Cenas muito irregulares se aproximam do custo dos voxels",
                "Acesso aleatório indireto: precisa descer a árvore",
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Subdivida <b>só o heterogêneo</b>; o homogêneo vira uma folha. Em 3D, 8 filhos por " +
                "nó, indexados por <code>x′+2y′+4z′</code>; concatenar esses índices dá a ordem de Morton.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g11-octree",
    num: "⊞",
    subject: "Computação Gráfica",
    section: "Sólidos",
    title: "Octree",
    type: "conceitual",
    tags: ["sólidos", "octree", "subdivisão", "morton"],
    hubDesc: "Subdivisão recursiva: homogêneo vira folha, parcial subdivide; 8 octantes (x′+2y′+4z′), ordem de Morton e travessia.",
    statement:
      "Entenda a Octree: subdivisão espacial recursiva e montagem da árvore conforme a homogeneidade " +
      "(cheio/vazio/parcial) dos voxels, a derivação do índice de octante x′+2y′+4z′, a ordem de Morton " +
      "(Z-order) para guardar a árvore num vetor, travessia/aplicações (colisão, raio, SVO) e a comparação " +
      "com a grade uniforme.",
    parts: [{ label: "Guia", build: build }],
  });
})();
