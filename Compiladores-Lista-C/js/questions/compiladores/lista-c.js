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
            [{ html: "empilha <code>5</code>" }, "guarda operando esquerdo externo"],
            [{ html: "empilha <code>4</code>; carrega <code>3</code>; <code>sub</code>" }, { html: "<code>4 - 3</code>" }],
            [{ html: "carrega <code>5</code>; <code>add</code>" }, { html: "<code>5 + (4 - 3)</code>" }],
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
    hubDesc: "Contar temporarios distintos da traducao ingenua, sem reutilizacao de slots.",
    statement:
      "Para <code>potenciaDeDois</code>, conte temporarios para <code>x % 2 == 0</code>, chamada recursiva, <code>x == 1</code> e total.",
    build: function () {
      return [
        C.codeStep({
          title: "A funcao",
          body:
            "<p>Um <b>temporario</b>, nesta questao, e um nome/slot intermediario produzido por uma " +
            "traducao ingenua de tres enderecos. A contagem <b>depende da estrategia de geracao de codigo</b> " +
            "&mdash; nao e intrinseca a expressao &mdash;, entao a fixamos no proximo passo. " +
            "Para manter o gabarito, nao fazemos analise de vivacidade nem reutilizacao de slots: " +
            "contamos os nomes temporarios distintos emitidos para cada item. Os ramos do <code>if</code> " +
            "continuam nao somando, pois sao alternativas.</p>",
          code:
            "def potenciaDeDois(x) =\n" +
            "  if x % 2 == 0\n" +
            "  then potenciaDeDois(x / 2)\n" +
            "  else x == 1",
          active: [2, 3, 4],
        }),
        C.codeStep({
          title: "Estrategia adotada e o codigo de tres enderecos",
          body:
            "<p>Fixamos esta estrategia: variaveis ficam em <b>registradores</b> e constantes sao " +
            "<b>imediatos</b> (operandos gratis); cada resultado intermediario novo recebe um " +
            "temporario novo, <b>sem reutilizacao de slots</b> nesta contagem; a <b>condicao</b> do " +
            "<code>if</code> e materializada num temporario para o branch testar; o " +
            "<b>valor de cada ramo</b> e calculado direto no " +
            "<b>registrador-resultado <code>r</code></b> (o destino do <code>if</code>), que nao conta " +
            "como temporario. Daqui sai a contagem &mdash; e e isto que resolve a aparente inconsistencia " +
            "entre <code>x % 2 == 0</code> e <code>x == 1</code>.</p>",
          code:
            "t1 = x % 2            ; condicao: subexpressao\n" +
            "t2 = (t1 == 0)        ; booleano materializado p/ o branch\n" +
            "ifFalse t2 goto Lelse\n" +
            "t3 = x / 2            ; then: argumento da chamada\n" +
            "r  = call pot(t3)     ; retorno vai ao registrador-resultado\n" +
            "goto Lend\n" +
            "Lelse:\n" +
            "r  = (x == 1)         ; else: direto no destino r (sem temporario)\n" +
            "Lend: return r",
          active: [1, 2, 4, 8],
        }),
        C.tableStep({
          title: "Contagem por subexpressao (sob essa estrategia)",
          body:
            "<p>A tabela conta <b>nomes temporarios distintos</b> emitidos pelo IR ingenuo. Nao e pico de " +
            "valores vivos: com vivacidade padrao, <code>t1</code> morre depois de materializar " +
            "<code>t2</code>. Os ramos do <code>if</code> continuam nao coexistindo, entao tomamos o " +
            "maior caso do gabarito, nao a soma.</p>",
          headers: ["subexpressao", "temporarios", "por que (pelo IR acima)"],
          rows: [
            [{ html: "<code>x % 2 == 0</code>" }, "2", { html: "<code>t1=x%2</code> e <code>t2=(t1==0)</code> sao dois nomes temporarios distintos emitidos; <code>t1</code> nao precisa estar vivo no branch" }],
            [{ html: "<code>potenciaDeDois(x/2)</code>" }, "1", { html: "<code>t3=x/2</code> (o argumento); o retorno vai para <code>r</code>" }],
            [{ html: "<code>x == 1</code>" }, "0", { html: "valor de ramo escrito direto em <code>r</code> (<code>x</code> em reg., <code>1</code> imediato)" }],
            ["total", "2", { html: "maior contagem entre os itens do gabarito; ramos nao somam" }],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Sob a estrategia acima: <code>2, 1, 0, 2</code>. A contagem e <b>convencional</b>: com " +
            "vivacidade padrao e reutilizacao de registradores, a condicao poderia ter pico 1 " +
            "(<code>t1</code> morre antes de <code>ifFalse t2</code>) e a sequencia seria " +
            "<code>1, 1, 0, 1</code>. O gabarito, porem, conta nomes temporarios distintos emitidos " +
            "pela traducao ingenua, sem reutilizacao de slots.</p>",
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
            "<p>Os campos herdados vem primeiro: <code>x,y</code> antes de <code>z</code>, e <code>z</code> " +
            "antes de <code>u,v</code>. Logo <b>C herda de B</b> (acrescenta <code>z</code>) e <b>A herda " +
            "de C</b> (acrescenta <code>u,v</code>). Em notacao de subtipo: <code>A &le; C &le; B</code>.</p>",
          choices: [
            { id: "a", html: "A herda de B; B herda de C" },
            { id: "b", html: "C herda de B; B herda de A" },
            { id: "c", html: "A herda de C; C herda de B" },
            { id: "d", html: "B herda de C; C herda de A" },
          ],
          correct: ["c"],
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
            ["a", { html: "<span class='no'>nao</span>" }, { html: "trocar <code>3</code> por <code>b</code> nao e propagacao de copia" }],
            ["b", { html: "<span class='no'>nao</span>" }, { html: "<code>a*3</code> e <code>b*3</code> nao sao a mesma expressao" }],
            ["c", { html: "<span class='ok'>sim</span>" }, { html: "<code>c</code> nao e usado e sua expressao nao tem efeito colateral" }],
            ["d", { html: "<span class='ok'>sim</span>" }, { html: "apos simplificacoes validas, o bloco pode virar <code>g := 5</code>" }],
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
    statement:
      "Apos propagacao de constantes, quais valores de X, Y e Z chegam ao ponto destacado? Reticulado: " +
      "<code>⊥</code> = ainda sem valor / inalcancavel; uma constante; <code>⊤</code> = " +
      "alcancavel, mas nao-constante.",
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
            "<p>No bloco de entrada, <code>Z := 5</code>. Nos dois caminhos <code>X</code> termina como 4 e " +
            "<code>Z</code> como 5. Mas <code>Y</code> so e redefinido no caminho da esquerda.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.flow(svg, { w: 720, h: 390, nodes: nodes, edges: [
              { from: "entry", to: "left" },
              { from: "entry", to: "right" },
              { from: "left", to: "join" },
              { from: "right", to: "join" },
            ] });
          } },
        },
        C.tableStep({
          title: "Estado de entrada (condicoes de contorno)",
          body:
            "<p><code>X</code> e <code>Y</code> chegam ao bloco como valores arbitrarios (parametros / " +
            "preexistentes), entao entram como <code>⊤</code>. <code>Z</code> nao tem valor antes do " +
            "bloco (<code>⊥</code>), mas <code>Z := 5</code> o fixa. <code>⊥</code> (sem informacao) e " +
            "<code>⊤</code> (alcancavel, nao-constante) <b>nao sao sinonimos</b>.</p>",
          headers: ["variavel", "entrada", "papel ate a juncao"],
          rows: [
            ["X", "⊤", "redefinida (4) nos dois caminhos"],
            ["Y", "⊤", "redefinida so na esquerda (1)"],
            ["Z", "⊥ → 5", "fixada no bloco de entrada"],
          ],
        }),
        C.tableStep({
          title: "Juncao variavel a variavel",
          body:
            "<p>No encontro aplicamos <code>⊔</code> (juncao): valores iguais mantem a constante; valores " +
            "diferentes, ou algum <code>⊤</code>, sobem para <code>⊤</code>.</p>",
          headers: ["variavel", "caminho esquerdo", "caminho direito", "juncao"],
          rows: [
            ["X", "4", "4", "4 ⊔ 4 = 4"],
            ["Y", "1", "⊤ (entrada, nao redefinida)", "1 ⊔ ⊤ = ⊤"],
            ["Z", "5", "5", "5 ⊔ 5 = 5"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>No encontro: <code>X=4</code>, <code>Y=⊤</code> e <code>Z=5</code>. <code>Y</code> nao e 1 " +
            "porque entra como <code>⊤</code> e a direita nao a redefine; se <code>Y</code> entrasse como " +
            "<code>⊥</code> (local ainda sem valor), seria <code>1 ⊔ ⊥ = 1</code>.</p>",
          choices: [
            { id: "a", html: "<code>4, ⊤, ⊤</code>" },
            { id: "b", html: "<code>4, ⊤, 5</code>" },
            { id: "c", html: "<code>4, 1, 5</code>" },
            { id: "d", html: "<code>⊤, ⊤, ⊤</code>" },
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
    hubDesc: "Entender como back-edges fazem constantes virarem ⊤ em ponto fixo.",
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
            "<p>O caminho vindo do laco mistura valores que eram constantes com valores recalculados a partir de <code>Z</code>. Em ponto fixo, isso perde precisao para <code>⊤</code>.</p>",
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
            "<p>No ponto indicado apos o bloco <code>X := 4</code>, ainda sabemos <code>X=4</code>. Ja <code>Y</code> e <code>Z</code> recebem informacao conflitante pelos ciclos, entao ficam <code>⊤</code>.</p>",
          choices: [
            { id: "a", html: "<code>⊤, 1, ⊤</code>" },
            { id: "b", html: "<code>4, ⊤, 5</code>" },
            { id: "c", html: "<code>4, 1, 5</code>" },
            { id: "d", html: "<code>4, ⊤, ⊤</code>" },
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
        {
          title: "O grafo de fluxo (CFG)",
          body:
            "<p>O ponto indicado (<code>?</code>) e antes do teste <code>X &gt; 0</code>. Assuma todas as " +
            "variaveis mortas na saida. Uma variavel esta <b>viva</b> se algum caminho a <b>le</b> antes " +
            "de redefini-la.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.flow(svg, { w: 720, h: 380, nodes: [
              { id: "p", x: 270, y: 20, w: 190, h: 50, lines: ["?  if X > 0"], active: true },
              { id: "t", x: 95, y: 140, w: 210, h: 70, lines: ["Z := W + 4", "Y := Y + 1"] },
              { id: "e", x: 430, y: 150, w: 160, h: 48, lines: ["Z := 7"] },
              { id: "m", x: 250, y: 290, w: 210, h: 50, lines: ["U := Z"] },
            ], edges: [
              { from: "p", to: "t", label: "X > 0" },
              { from: "p", to: "e", label: "senao" },
              { from: "t", to: "m" },
              { from: "e", to: "m" },
            ] });
          } },
        },
        C.tableStep({
          title: "Usos futuros a partir do ponto",
          body:
            "<p>Lendo o CFG acima, uma variavel esta viva se seu valor atual pode ser lido antes de ser " +
            "redefinido em algum caminho.</p>",
          headers: ["variavel", "viva?", "motivo"],
          rows: [
            ["W", { html: "<span class='ok'>sim</span>" }, { html: "pode ser usada em <code>Z := W + 4</code>" }],
            ["X", { html: "<span class='ok'>sim</span>" }, { html: "e usada imediatamente no teste <code>X > 0</code>" }],
            ["Y", { html: "<span class='ok'>sim</span>" }, { html: "e usada em <code>Y := Y + 1</code>" }],
            ["Z", { html: "<span class='no'>nao</span>" }, { html: "nos ramos, <code>Z</code> e redefinida antes de ser lida" }],
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
            "<p>So e valido remover um no de grau <code>&lt; 3</code> no grafo restante. Veja a sequencia de " +
            "cada opcao e onde as invalidas falham.</p>",
          headers: ["opcao", "sequencia", "valida?", "comentario"],
          rows: [
            ["a", { html: "<code>d, e, c, b, a, f</code>" }, { html: "<span class='ok'>sim</span>" }, "d e e tem grau 2; depois c, b, a e f ficam removiveis"],
            ["b", { html: "<code>e, f, d, c, b, a</code>" }, { html: "<span class='no'>nao</span>" }, { html: "apos remover e, <code>f</code> ainda tem grau 3" }],
            ["c", { html: "<code>d, c, e, b, a, f</code>" }, { html: "<span class='no'>nao</span>" }, { html: "apos remover d, <code>c</code> ainda tem grau 3" }],
            ["d", { html: "<code>d, e, b, c, a, f</code>" }, { html: "<span class='no'>nao</span>" }, { html: "apos remover d e e, <code>b</code> ainda tem grau 3" }],
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
    statement:
      "Com k = 3 registradores, o RIG dado nao pode ser simplificado (todos os nos tem grau >= 3). " +
      "Aplique a regra de custo do exercicio para escolher o no a derramar.",
    build: function () {
      return [
        {
          title: "RIG travado: um K4 com k = 3",
          body:
            "<p>Os quatro nos formam um <b>K4</b>: cada um interfere com os outros tres, entao todos tem " +
            "<b>grau 3 = k</b>. Como nenhum no tem grau &lt; k, <b>simplify nao remove ninguem</b> e a " +
            "pilha fica vazia &mdash; e preciso <b>derramar</b> (um K4 nao e 3-colorivel). " +
            "<code>D</code> esta fora do laco.</p>",
          visual: { type: "svg", draw: function (svg) {
            svg.view(540, 280);
            var nodes = {
              A: { x: 165, y: 75 },
              B: { x: 385, y: 75 },
              C: { x: 385, y: 205 },
              D: { x: 165, y: 205 },
            };
            C.rig(svg, {
              w: 540, h: 280, nodes: nodes,
              edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "C"], ["B", "D"]],
              colors: { D: "var(--green)" },
            });
          } },
        },
        C.tableStep({
          title: "Custos (regra deste exercicio)",
          body:
            "<p>A formula <code>usos - conflitos + (5 se em laco)</code> e a <b>regra deste exercicio</b>, " +
            "nao uma heuristica universal de alocadores reais. Como todos tem o mesmo grau (3), a decisao " +
            "vem da <b>frequencia</b>: <code>C</code> e <code>D</code> tem usos e grau iguais, mas " +
            "<code>D</code> esta fora do laco e fica mais barato.</p>",
          headers: ["no", "usos", "conflitos (grau)", "bonus laco", "custo"],
          rows: [
            ["A", "6", "3", "+5", "8"],
            ["B", "5", "3", "+5", "7"],
            ["C", "4", "3", "+5", "6"],
            ["D", "4", "3", "+0", "1"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Entre os nos <b>genuinamente travados</b> (grau &ge; k), o de menor custo e <code>D</code>. " +
            "Um no de grau &lt; k nunca chegaria a esta decisao &mdash; seria <b>simplificado</b> e " +
            "recolorido depois, nao derramado.</p>",
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
            ["B", { html: "fica <code>free</code>" }],
            ["C", { html: "fica <code>free</code> em cascata" }],
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
