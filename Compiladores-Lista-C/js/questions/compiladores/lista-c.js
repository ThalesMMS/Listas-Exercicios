/*
 * lista-c.js - Compiladores, Lista C.
 * Resolucao comentada de geracao de codigo, otimizacao, registradores e memoria.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function html(parts) { return parts.join(""); }
  function grammar(lines) { return C.codeHtml(lines.join("\n")); }

  function register(spec) {
    EX.registry.add({
      id: spec.id,
      num: spec.num,
      subject: "Compiladores - Lista C",
      section: spec.section,
      title: spec.title,
      type: spec.type || "computacional",
      tags: spec.tags || [],
      hubDesc: spec.hubDesc,
      statement: spec.statement,
      parts: [{ label: "Resolucao", build: spec.build }],
    });
  }

  function rigNodes() {
    return {
      a: { x: 280, y: 55 },
      b: { x: 395, y: 115 },
      c: { x: 395, y: 245 },
      d: { x: 280, y: 310 },
      e: { x: 165, y: 245 },
      f: { x: 165, y: 115 },
    };
  }

  function rigEdgesQ10() {
    return [["a", "f"], ["a", "b"], ["a", "c"], ["f", "b"], ["f", "e"], ["f", "d"], ["b", "c"], ["e", "c"], ["d", "c"]];
  }

  register({
    id: "c-q01-assembly-expressao",
    num: "1",
    section: "Geracao de Codigo",
    title: "Reconhecendo a expressao pelo assembly",
    tags: ["assembly", "pilha"],
    hubDesc: "Ler pushes/pops no codigo MIPS-like para reconstruir a arvore da expressao.",
    statement: "Escolha a expressao para a qual o codigo assembly foi gerado.",
    build: function () {
      return [
        C.codeStep({
          title: "O padrao de avaliacao",
          body:
            "<p>O codigo empilha operandos intermediarios. Primeiro empilha <code>5</code>, depois <code>4</code>, carrega <code>3</code> e executa <code>sub</code>.</p>",
          code:
            "li $a0 5\nsw $a0 0($sp)\naddiu $sp $sp -4\nli $a0 4\nsw $a0 0($sp)\naddiu $sp $sp -4\nli $a0 3\nlw $t1 4($sp)\nsub $a0 $t1 $a0\naddiu $sp $sp 4\nlw $t1 4($sp)\nadd $a0 $t1 $a0\naddiu $sp $sp 4",
          active: [7, 8, 9, 11, 12],
        }),
        C.tableStep({
          title: "Reconstrucao",
          body:
            "<p><code>sub $a0 $t1 $a0</code> calcula valor empilhado menos acumulador: <code>4 - 3</code>. Depois o <code>add</code> soma o <code>5</code> empilhado antes.</p>",
          headers: ["trecho", "resultado"],
          rows: [
            ["empilha <code>5</code>", "guarda operando esquerdo externo"],
            ["empilha <code>4</code>; carrega <code>3</code>; <code>sub</code>", "<code>4 - 3</code>"],
            ["carrega <code>5</code>; <code>add</code>", "<code>5 + (4 - 3)</code>"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body: "<p>A expressao correta e a alternativa <b>a</b>.</p>",
          choices: [
            { id: "a", html: "<code>5 + (4 - 3)</code>" },
            { id: "b", html: "<code>5 - (4 + 3)</code>" },
            { id: "c", html: "<code>(5 + 4) - 3</code>" },
            { id: "d", html: "<code>(5 - 4) + 3</code>" },
          ],
          correct: ["a"],
        }),
      ];
    },
  });

  register({
    id: "c-q02-registro-ativacao",
    num: "2",
    section: "Geracao de Codigo",
    title: "Variaveis no registro de ativacao de f",
    tags: ["activation-record", "stack-frame"],
    hubDesc: "Separar parametros de f, parametros de g e nome de funcao.",
    statement: "Quais variaveis aparecem no registro de ativacao em uma chamada a <code>f()</code>?",
    build: function () {
      return [
        C.codeStep({
          title: "Funcoes",
          body:
            "<p>O frame de <code>f</code> precisa guardar seus parametros e informacoes de controle da chamada. O parametro <code>t</code> pertence ao frame de <code>g</code>.</p>",
          code:
            "def f(x,y,z) =\n  if x\n  then g(y)\n  else g(z)\n\ndef g(t) =\n  t + 1",
          active: [1, 2, 3, 4],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Entre as opcoes, <code>x</code> e <code>z</code> sao variaveis de <code>f</code>. <code>t</code> e de <code>g</code>; <code>g</code> e o nome da funcao.</p>",
          choices: [
            { id: "a", html: "<code>x</code>" },
            { id: "b", html: "<code>t</code>" },
            { id: "c", html: "<code>g</code>" },
            { id: "d", html: "<code>z</code>" },
          ],
          correct: ["a", "d"],
        }),
      ];
    },
  });

  register({
    id: "c-q03-temporarios",
    num: "3",
    section: "Geracao de Codigo",
    title: "Temporarios necessarios em subexpressoes",
    tags: ["temporarios", "codigo"],
    hubDesc: "Contar temporarios pelo pico de avaliacao, nao pela soma de todos os ramos.",
    statement:
      "Para <code>potenciaDeDois</code>, conte temporarios para <code>x % 2 == 0</code>, chamada recursiva, <code>x == 1</code> e total.",
    build: function () {
      return [
        C.tableStep({
          title: "Contagem por subexpressao",
          body:
            "<p>O total e o pico necessario em uma avaliacao; os ramos do <code>if</code> nao executam ao mesmo tempo.</p>",
          headers: ["subexpressao", "temporarios", "por que"],
          rows: [
            ["<code>x % 2 == 0</code>", "2", "um valor para <code>x % 2</code> e outro para a comparacao"],
            ["<code>potenciaDeDois(x/2)</code>", "1", "calcular o argumento <code>x/2</code>"],
            ["<code>x == 1</code>", "0", "pode comparar direto com registrador/imediato"],
            ["total", "2", "maior pico entre condicao e ramos"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body: "<p>A sequencia correta e <code>2, 1, 0, 2</code>.</p>",
          choices: [
            { id: "a", html: "<code>1, 2, 2, 3</code>" },
            { id: "b", html: "<code>1, 1, 1, 1</code>" },
            { id: "c", html: "<code>2, 1, 0, 2</code>" },
            { id: "d", html: "<code>2, 1, 0, 3</code>" },
          ],
          correct: ["c"],
        }),
      ];
    },
  });

  register({
    id: "c-q04-layout-heranca",
    num: "4",
    section: "Geracao de Codigo",
    title: "Layout de objeto e ordem de heranca",
    tags: ["layout", "heranca"],
    hubDesc: "Inferir a ordem de heranca pela ordem dos atributos no objeto.",
    statement: "Dado o layout com atributos <code>x,y,z,u,v</code>, escolha a relacao de heranca correta.",
    build: function () {
      return [
        {
          title: "Atributos herdados aparecem antes",
          body:
            "<p>Em layouts de objetos, campos herdados ocupam as primeiras posicoes; campos da subclasse sao anexados depois.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              svg.view(700, 280);
              EX.Diagram.boxes(svg, {
                title: "layout observado",
                cells: ["ID", "size", "disp", "x", "y", "z", "u", "v"],
                x: 70,
                y: 110,
                cellW: 68,
                cellH: 44,
              }, { highlight: [3, 4, 5, 6, 7], view: [700, 280] });
              svg.text(205, 205, "B define x,y", { color: "var(--accent)", size: 13 });
              svg.text(405, 205, "C define z", { color: "var(--green)", size: 13 });
              svg.text(540, 205, "A define u,v", { color: "var(--orange)", size: 13 });
            },
          },
        },
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Como <code>x,y</code> aparecem antes de <code>z</code>, e <code>z</code> antes de <code>u,v</code>, a cadeia e <code>B < C < A</code>.</p>",
          choices: [
            { id: "a", html: "<code>A &lt; B &lt; C</code>" },
            { id: "b", html: "<code>C &lt; B &lt; A</code>" },
            { id: "c", html: "<code>A &lt; C &lt; B</code>" },
            { id: "d", html: "<code>B &lt; C &lt; A</code>" },
          ],
          correct: ["d"],
        }),
      ];
    },
  });

  register({
    id: "c-q05-otimizacoes-bloco-basico",
    num: "5",
    section: "Otimizacao",
    title: "Otimizacoes validas em bloco basico",
    tags: ["otimizacao", "codigo-morto", "constantes"],
    hubDesc: "Avaliar propagacao, expressoes comuns, codigo morto e simplificacao final.",
    statement: "Quais otimizacoes propostas sao validas no bloco basico exibido?",
    build: function () {
      return [
        C.codeStep({
          title: "Bloco basico",
          body:
            "<p>Somente <code>g</code> e <code>x</code> sao referenciados fora do bloco. Logo, temporarios sem uso externo podem morrer.</p>",
          code:
            "a := 1\nb := 3\nc := a + x\nd := a * 3\ne := b * 3\nf := a + b\ng := e - f",
          active: [3, 7],
        }),
        C.tableStep({
          title: "Analisando as opcoes",
          body:
            "<p>Depois de propagacao de constantes, <code>e = 9</code>, <code>f = 4</code> e <code>g = 5</code>.</p>",
          headers: ["opcao", "valida?", "motivo"],
          rows: [
            ["a", "<span class='no'>nao</span>", "trocar <code>3</code> por <code>b</code> nao e propagacao de copia"],
            ["b", "<span class='no'>nao</span>", "<code>a*3</code> e <code>b*3</code> nao sao a mesma expressao"],
            ["c", "<span class='ok'>sim</span>", "<code>c</code> nao e usado e sua expressao nao tem efeito colateral"],
            ["d", "<span class='ok'>sim</span>", "apos simplificacoes validas, o bloco pode virar <code>g := 5</code>"],
          ],
        }),
      ];
    },
  });

  register({
    id: "c-q06-propagacao-constantes",
    num: "6",
    section: "Otimizacao",
    title: "Propagacao de constantes com juncao simples",
    tags: ["constantes", "fluxo"],
    hubDesc: "Encontrar X, Y e Z no ponto de juncao apos dois caminhos.",
    statement: "Depois de propagacao de constantes, quais valores chegam ao ponto indicado?",
    build: function () {
      var nodes = [
        { id: "entry", x: 300, y: 20, w: 150, h: 70, lines: ["Z := 5", "C > 0"] },
        { id: "left", x: 130, y: 130, w: 170, h: 92, lines: ["Y := 1", "X := 4", "Z := X + Y"] },
        { id: "right", x: 430, y: 150, w: 120, h: 46, lines: ["X := 4"] },
        { id: "join", x: 285, y: 275, w: 190, h: 80, lines: ["A := X * Y", "B := A * Z"], active: true },
      ];
      return [
        {
          title: "Fluxo de controle",
          body:
            "<p>Nos dois caminhos, <code>X</code> termina como 4. <code>Z</code> tambem termina como 5. Mas <code>Y</code> so e definido no caminho da esquerda.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.flow(svg, { w: 720, h: 390, nodes: nodes, edges: [
              { from: "entry", to: "left" },
              { from: "entry", to: "right" },
              { from: "left", to: "join" },
              { from: "right", to: "join" },
            ] });
          } },
        },
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>No encontro dos caminhos: <code>X=4</code>, <code>Y=top</code> e <code>Z=5</code>.</p>",
          choices: [
            { id: "a", html: "<code>4, top, top</code>" },
            { id: "b", html: "<code>4, top, 5</code>" },
            { id: "c", html: "<code>4, 1, 5</code>" },
            { id: "d", html: "<code>top, top, top</code>" },
          ],
          correct: ["b"],
        }),
      ];
    },
  });

  register({
    id: "c-q07-propagacao-lacos",
    num: "7",
    section: "Otimizacao",
    title: "Propagacao de constantes com lacos",
    tags: ["constantes", "laco", "ponto-fixo"],
    hubDesc: "Entender como back-edges fazem constantes virarem top em ponto fixo.",
    statement: "No fluxo com lacos, quais valores de X, Y e Z chegam ao ponto indicado?",
    build: function () {
      var nodes = [
        { id: "top", x: 310, y: 20, w: 140, h: 70, lines: ["Z := 5", "A > 0"] },
        { id: "lz", x: 80, y: 80, w: 130, h: 46, lines: ["Z := X + 6"] },
        { id: "mid", x: 105, y: 160, w: 150, h: 92, lines: ["X := 4", "Y := 1", "B > 0"] },
        { id: "rx", x: 470, y: 170, w: 110, h: 44, lines: ["X := 4"] },
        { id: "bottom", x: 285, y: 295, w: 190, h: 92, lines: ["Y := 1", "X := Z + 3", "C < 10"], active: true },
      ];
      return [
        {
          title: "O efeito do ciclo",
          body:
            "<p>O caminho vindo do laco mistura valores que eram constantes com valores recalculados a partir de <code>Z</code>. Em ponto fixo, isso perde precisao para <code>top</code>.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.flow(svg, { w: 720, h: 430, nodes: nodes, edges: [
              { from: "top", to: "lz" },
              { from: "lz", to: "mid" },
              { from: "top", to: "rx" },
              { from: "mid", to: "bottom" },
              { from: "rx", to: "bottom" },
              { from: "bottom", to: "lz", curve: -170 },
              { from: "bottom", to: "rx", curve: 150 },
            ] });
          } },
        },
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>No ponto indicado apos o bloco <code>X := 4</code>, ainda sabemos <code>X=4</code>. Ja <code>Y</code> e <code>Z</code> recebem informacao conflitante pelos ciclos, entao ficam <code>top</code>.</p>",
          choices: [
            { id: "a", html: "<code>top, 1, top</code>" },
            { id: "b", html: "<code>4, top, 5</code>" },
            { id: "c", html: "<code>4, 1, 5</code>" },
            { id: "d", html: "<code>4, top, top</code>" },
          ],
          correct: ["d"],
        }),
      ];
    },
  });

  register({
    id: "c-q08-vivacidade",
    num: "8",
    section: "Otimizacao",
    title: "Analise de vivacidade no ponto indicado",
    tags: ["vivacidade", "dataflow"],
    hubDesc: "Propagar usos para tras para decidir quais variaveis estao vivas antes do teste X > 0.",
    statement:
      "Depois da analise de vivacidade, quais variaveis entre W, X, Y e Z estao vivas no ponto indicado?",
    build: function () {
      return [
        C.tableStep({
          title: "Usos futuros a partir do ponto",
          body:
            "<p>Uma variavel esta viva se seu valor atual pode ser lido antes de ser redefinido em algum caminho.</p>",
          headers: ["variavel", "viva?", "motivo"],
          rows: [
            ["W", "<span class='ok'>sim</span>", "pode ser usada em <code>Z := W + 4</code>"],
            ["X", "<span class='ok'>sim</span>", "e usada imediatamente no teste <code>X > 0</code>"],
            ["Y", "<span class='ok'>sim</span>", "e usada em <code>Y := Y + 1</code>"],
            ["Z", "<span class='no'>nao</span>", "nos ramos, <code>Z</code> e redefinida antes de ser lida"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body: "<p>As variaveis vivas sao <code>W</code>, <code>X</code> e <code>Y</code>.</p>",
          choices: [
            { id: "a", html: "<code>W</code>" },
            { id: "b", html: "<code>X</code>" },
            { id: "c", html: "<code>Y</code>" },
            { id: "d", html: "<code>Z</code>" },
          ],
          correct: ["a", "b", "c"],
        }),
      ];
    },
  });

  register({
    id: "c-q09-rig-coloracao",
    num: "9",
    section: "Alocacao de Registradores",
    title: "Coloracao minima de um RIG",
    tags: ["rig", "coloracao"],
    hubDesc: "Verificar se uma coloracao e valida e se usa o menor numero de cores.",
    statement: "Qual grafo apresenta uma coloracao minima valida para o RIG?",
    build: function () {
      var edges = [["a", "f"], ["f", "e"], ["e", "d"], ["d", "c"], ["c", "b"], ["b", "a"], ["a", "d"]];
      return [
        {
          title: "O RIG e bipartido",
          body:
            "<p>O grafo pode ser colorido com duas cores: <code>{a,c,e}</code> de uma cor e <code>{b,d,f}</code> de outra. A aresta extra <code>a-d</code> continua valida.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.rig(svg, { w: 560, h: 360, nodes: rigNodes(), edges: edges, colors: {
              a: "var(--red)", c: "var(--red)", e: "var(--red)",
              b: "var(--green)", d: "var(--green)", f: "var(--green)",
            } });
          } },
        },
        C.choiceStep({
          title: "Resposta",
          body: "<p>A alternativa <b>d</b> e a coloracao valida com apenas duas cores.</p>",
          choices: [
            { id: "a", html: "tem vertices adjacentes com mesma cor" },
            { id: "b", html: "tem <code>a</code> e <code>d</code> com mesma cor" },
            { id: "c", html: "valida, mas usa tres cores" },
            { id: "d", html: "valida e minima, com duas cores" },
          ],
          correct: ["d"],
        }),
      ];
    },
  });

  register({
    id: "c-q10-eliminacao-rig",
    num: "10",
    section: "Alocacao de Registradores",
    title: "Sequencia de eliminacao para k = 3",
    tags: ["rig", "simplify", "coloracao"],
    hubDesc: "Checar se cada no removido tem grau menor que k no grafo restante.",
    statement: "Para o RIG e <code>k = 3</code>, quais sequencias de eliminacao sao validas?",
    build: function () {
      return [
        {
          title: "Grafo de interferencia",
          body:
            "<p>No passo de simplificacao, so removemos no com grau <code>&lt; k</code>. Aqui <code>k=3</code>, entao grau 0, 1 ou 2.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.rig(svg, { w: 560, h: 360, nodes: rigNodes(), edges: rigEdgesQ10() });
          } },
        },
        C.tableStep({
          title: "Sequencias",
          body:
            "<p>A sequencia <code>d,e,c,b,a,f</code> sempre escolhe um no de grau menor que 3 no grafo restante.</p>",
          headers: ["opcao", "valida?", "comentario"],
          rows: [
            ["a", "<span class='ok'>sim</span>", "d e e tem grau 2; depois c, b, a e f ficam removiveis"],
            ["b", "<span class='no'>nao</span>", "apos remover e, <code>f</code> ainda tem grau 3"],
            ["c", "<span class='no'>nao</span>", "apos remover d, <code>c</code> ainda tem grau 3"],
            ["d", "<span class='no'>nao</span>", "apos remover d e e, <code>b</code> ainda tem grau 3"],
          ],
        }),
      ];
    },
  });

  register({
    id: "c-q11-spill-custo",
    num: "11",
    section: "Alocacao de Registradores",
    title: "Escolhendo spill de menor custo",
    tags: ["spill", "rig"],
    hubDesc: "Aplicar a formula ocorrencias - conflitos + bonus de loop.",
    statement: "Encontre o derramamento de menor custo para o fragmento e RIG dados.",
    build: function () {
      return [
        {
          title: "RIG pequeno",
          body:
            "<p>O no <code>D</code> nao interfere com nenhum outro e aparece fora do laco. Pela formula dada, ele tem o menor custo.</p>",
          visual: { type: "svg", draw: function (svg) {
            svg.view(520, 260);
            var nodes = {
              A: { x: 155, y: 70 },
              B: { x: 350, y: 70 },
              C: { x: 255, y: 160 },
              D: { x: 105, y: 160 },
            };
            C.rig(svg, { w: 520, h: 260, nodes: nodes, edges: [["A", "C"], ["B", "C"]], colors: { D: "var(--green)" } });
          } },
        },
        C.tableStep({
          title: "Custos",
          body:
            "<p>Mesmo quando ha pequenas variacoes na contagem de uso/definicao, <code>D</code> continua sendo o menor: nao esta no laco e nao conflita.</p>",
          headers: ["no", "ocorrencias", "conflitos", "bonus loop", "custo"],
          rows: [
            ["A", "4", "1", "+5", "8"],
            ["B", "3", "1", "+5", "7"],
            ["C", "3", "2", "+5", "6"],
            ["D", "1", "0", "+0", "1"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body: "<p>O melhor candidato para spill e <code>D</code>.</p>",
          choices: [
            { id: "a", html: "<code>A</code>" },
            { id: "b", html: "<code>B</code>" },
            { id: "c", html: "<code>C</code>" },
            { id: "d", html: "<code>D</code>" },
          ],
          correct: ["d"],
        }),
      ];
    },
  });

  register({
    id: "c-q12-mark-sweep",
    num: "12",
    section: "Gerenciamento de Memoria",
    title: "Coleta marcar-e-varrer",
    tags: ["gc", "mark-sweep"],
    hubDesc: "Marcar objetos alcancaveis pela raiz e colocar os demais na lista livre.",
    statement: "Qual heap final resulta de aplicar marcar-e-varrer ao heap dado?",
    build: function () {
      var livePtrs = [
        { from: 0, to: 1, side: "bottom" },
        { from: 1, to: 2, side: "top" },
        { from: 2, to: 1, side: "bottom" },
        { from: 0, to: 4, side: "bottom" },
      ];
      return [
        {
          title: "Marca a partir da raiz",
          body:
            "<p>A raiz alcanca <code>A</code>. A partir dele chegamos a <code>B</code> e <code>E</code>; <code>B</code> e <code>C</code> formam um ciclo alcancavel. O par <code>D/F</code> nao e alcancavel.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "G", "H"], root: 0, free: [6, 7], pointers: livePtrs.concat([{ from: 3, to: 5, side: "top" }, { from: 5, to: 3, side: "bottom" }]), note: "antes: G/H ja estao livres; D/F ainda ocupam celulas" });
          } },
        },
        {
          title: "Varre e libera nao marcados",
          body:
            "<p>Marcar-e-varrer nao compacta. Ele preserva A, B, C e E nas mesmas posicoes e coloca D, F, G e H na lista livre. Isso corresponde a alternativa <b>a</b>.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "G", "H"], root: 0, free: [3, 5, 6, 7], pointers: livePtrs.concat([{ from: 3, to: 5, side: "top", free: true }, { from: 5, to: 6, side: "bottom", free: true }, { from: 6, to: 7, side: "bottom", free: true }]), note: "final: objetos nao marcados viram free" });
          } },
        },
      ];
    },
  });

  register({
    id: "c-q13-stop-copy",
    num: "13",
    section: "Gerenciamento de Memoria",
    title: "Coleta parar-e-copiar",
    tags: ["gc", "copying"],
    hubDesc: "Copiar apenas objetos alcancaveis para o new space, seguindo a ordem do algoritmo.",
    statement: "Qual heap final resulta de aplicar parar-e-copiar ao heap dado?",
    build: function () {
      return [
        {
          title: "Objetos alcancaveis",
          body:
            "<p>Da raiz, copiamos <code>A</code>. Ao escanear <code>A</code>, descobrimos <code>B</code> e <code>E</code>; ao escanear <code>B</code>, descobrimos <code>C</code>. O ciclo <code>D/F</code> nao e alcancavel.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "new"], root: 0, free: [6], pointers: [
              { from: 0, to: 1, side: "bottom" },
              { from: 1, to: 2, side: "top" },
              { from: 2, to: 1, side: "bottom" },
              { from: 0, to: 4, side: "bottom" },
              { from: 3, to: 5, side: "top" },
              { from: 5, to: 3, side: "bottom" },
            ], note: "antes" });
          } },
        },
        {
          title: "Ordem de copia",
          body:
            "<p>Com a varredura de copia, a ordem fica <code>A, B, E, C</code>. O restante do espaco antigo vira livre. Alternativa <b>b</b>.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["new", "A", "B", "E", "C", "free"], root: 1, free: [0, 5], pointers: [
              { from: 1, to: 2, side: "bottom" },
              { from: 2, to: 4, side: "top" },
              { from: 4, to: 2, side: "bottom" },
              { from: 1, to: 3, side: "bottom" },
            ], note: "final: somente A, B, E e C foram copiados" });
          } },
        },
      ];
    },
  });

  register({
    id: "c-q14-reference-counting",
    num: "14",
    section: "Gerenciamento de Memoria",
    title: "Contagem de referencias apos atribuicoes",
    tags: ["gc", "reference-counting"],
    hubDesc: "Atualizar referencias, liberar cascatas e observar que ciclos nao sao coletados por contagem simples.",
    statement:
      "Atualize a heap apos <code>C.ptrParaB = D</code> e <code>A.ptrParaB = NULL</code>, usando contagem de referencias.",
    build: function () {
      return [
        {
          title: "Duas atualizacoes",
          body:
            "<p>Primeiro <code>C</code> deixa de apontar para <code>B</code> e passa a apontar para <code>D</code>. Depois <code>A</code> tambem deixa de apontar para <code>B</code>.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "free"], root: 0, free: [6], pointers: [
              { from: 0, to: 1, side: "bottom" },
              { from: 1, to: 2, side: "top" },
              { from: 2, to: 1, side: "bottom" },
              { from: 0, to: 4, side: "bottom" },
              { from: 3, to: 5, side: "top" },
              { from: 5, to: 3, side: "bottom" },
            ], note: "antes" });
          } },
        },
        C.tableStep({
          title: "Efeito nas contagens",
          body:
            "<p>Quando <code>B</code> perde as referencias de <code>C</code> e de <code>A</code>, sua contagem zera e ele e liberado. Ao liberar <code>B</code>, sua referencia para <code>C</code> tambem cai; <code>C</code> zera e e liberado.</p>",
          headers: ["objeto", "resultado"],
          rows: [
            ["B", "fica <code>free</code>"],
            ["C", "fica <code>free</code> em cascata"],
            ["D/F", "permanecem porque formam ciclo de referencias"],
            ["A/E", "permanecem alcancaveis pela raiz"],
          ],
        }),
        {
          title: "Heap final",
          body:
            "<p>A resposta e a alternativa <b>c</b>: <code>B</code> e <code>C</code> livres, <code>D/E/F</code> preservados e a ultima celula livre.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "free", "free", "D", "E", "F", "free"], root: 0, free: [1, 2, 6], pointers: [
              { from: 0, to: 4, side: "bottom" },
              { from: 3, to: 5, side: "top" },
              { from: 5, to: 3, side: "bottom" },
            ], note: "final: alternativa c" });
          } },
        },
      ];
    },
  });
})();
