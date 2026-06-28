/*
 * lista-c.js - Compiladores, Lista C.
 * Resolução comentada de geração de código, otimização, registradores e memória.
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
      parts: [{ label: "Resolução", build: spec.build }],
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
    section: "Geração de Código",
    title: "Reconhecendo a expressão pelo assembly",
    tags: ["assembly", "pilha"],
    hubDesc: "Ler pushes/pops no código MIPS-like para reconstruir a árvore da expressão.",
    statement:
      "Escolha a expressão gerada pelo assembly MIPS-like que empilha 5, empilha 4, " +
      "carrega 3, calcula <code>sub</code> e depois combina o resultado com <code>add</code>.",
    build: function () {
      return [
        C.codeStep({
          title: "O padrão de avaliação",
          body:
            "<p>O código empilha operandos intermediários. Primeiro empilha <code>5</code>, depois <code>4</code>, carrega <code>3</code> e executa <code>sub</code>.</p>",
          code:
            "li $a0 5\nsw $a0 0($sp)\naddiu $sp $sp -4\nli $a0 4\nsw $a0 0($sp)\naddiu $sp $sp -4\nli $a0 3\nlw $t1 4($sp)\nsub $a0 $t1 $a0\naddiu $sp $sp 4\nlw $t1 4($sp)\nadd $a0 $t1 $a0\naddiu $sp $sp 4",
          active: [7, 8, 9, 11, 12],
        }),
        C.tableStep({
          title: "Reconstrução",
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
          body: "<p>A expressão correta é a alternativa <b>a</b>.</p>",
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
    section: "Geração de Código",
    title: "Variáveis no registro de ativação de f",
    tags: ["activation-record", "stack-frame"],
    hubDesc: "Separar parâmetros de f, parâmetros de g e nome de função.",
    statement:
      "Para <code>def f(x,y,z) = if x then g(y) else g(z)</code> e " +
      "<code>def g(t) = t + 1</code>, quais variáveis aparecem no registro de ativação " +
      "de uma chamada a <code>f()</code>?",
    build: function () {
      return [
        C.codeStep({
          title: "O conceito antes da alternativa",
          body:
            "<p>Um <b>registro de ativação (ou frame)</b> é o bloco de memória criado para uma chamada de função em execução.</p>" +
            "<p>Há um frame por chamada ativa. Ele guarda parâmetros, variáveis locais, temporários e dados de controle, como retorno e link dinâmico.</p>" +
            "<p>A pergunta não pede nomes que aparecem no texto do programa; pede quais nomes precisam de lugar no frame da chamada a <code>f</code>.</p>",
          code:
            "def f(x,y,z) =\n  if x\n  then g(y)\n  else g(z)\n\ndef g(t) =\n  t + 1",
          active: [1, 2, 3, 4],
        }),
        C.tableStep({
          title: "Separando chamada de f e chamada de g",
          body:
            "<p>Ao chamar <code>f</code>, entram os parâmetros formais de <code>f</code>: <code>x</code>, <code>y</code> e <code>z</code>.</p>" +
            "<p>Quando <code>f</code> chama <code>g(y)</code>, a chamada de <code>g</code> cria outro registro de ativação.</p>" +
            "<p>Nesse registro, o parâmetro de <code>g</code> se chama <code>t</code>, e <code>t</code> recebe o valor atual de <code>y</code>.</p>" +
            "<p>Se a chamada for <code>g(z)</code>, <code>t</code> recebe o valor atual de <code>z</code>.</p>",
          headers: ["momento", "frame em questão", "nomes guardados"],
          rows: [
            [{ html: "entrada em <code>f()</code>" }, { html: "frame de <code>f</code>" }, { html: "<code>x</code>, <code>y</code>, <code>z</code> + controle da chamada" }],
            [{ html: "<code>then g(y)</code>" }, { html: "frame de <code>f</code> continua; novo frame de g" }, { html: "em <code>g</code>: <code>t</code> recebe <code>y</code>" }],
            [{ html: "<code>else g(z)</code>" }, { html: "frame de <code>f</code> continua; novo frame de g" }, { html: "em <code>g</code>: <code>t</code> recebe <code>z</code>" }],
          ],
        }),
        C.tableStep({
          title: "Eliminando as alternativas",
          body:
            "<p>Agora avaliamos cada opção pelo dono do nome: frame da chamada de <code>f</code>, frame de <code>g</code> ou código global.</p>",
          headers: ["opção", "entra no frame de f?", "motivo"],
          rows: [
            [{ html: "<code>x</code>" }, "sim", { html: "parâmetro formal de <code>f</code>" }],
            [{ html: "<code>t</code>" }, "não", { html: "parâmetro formal de <code>g</code>; só existe no novo frame de g" }],
            [{ html: "<code>g</code>" }, "não", { html: "nome/rótulo da função; não é variável armazenada no frame de f" }],
            [{ html: "<code>z</code>" }, "sim", { html: "parâmetro formal de <code>f</code>" }],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Entre as opções dadas, aparecem no frame de <code>f</code> as variáveis <code>x</code> e <code>z</code>.</p>" +
            "<p><code>y</code> também pertence a <code>f</code>, mas não foi oferecida como alternativa.</p>",
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
    section: "Geração de Código",
    title: "Temporários necessários em subexpressões",
    tags: ["temporarios", "codigo"],
    hubDesc: "Aprender a contar temporários por região de avaliação na tradução ingênua.",
    statement:
      "Para <code>potenciaDeDois</code>, conte temporários para <code>x % 2 == 0</code>, chamada recursiva, <code>x == 1</code> e total.",
    build: function () {
      return [
        C.codeStep({
          title: "Antes da conta: o que é geração de código",
          body:
            "<p>Geração de código é a fase que transforma uma expressão em instruções menores, parecidas com passos de máquina.</p>" +
            "<p>Um temporário não é uma variável escrita pelo programador. É um nome/slot intermediário usado para guardar um resultado parcial.</p>" +
            "<p>A contagem depende da estratégia de geração de código. Por isso, primeiro fixamos a convenção da lista.</p>",
          code:
            "def potenciaDeDois(x) =\n" +
            "  if x % 2 == 0\n" +
            "  then potenciaDeDois(x / 2)\n" +
            "  else x == 1",
          active: [2, 3, 4],
        }),
        C.tableStep({
          title: "O que conta como temporário",
          body:
            "<p>Neste exercício, conte nomes novos usados para guardar resultados intermediários, como <code>t1</code>, <code>t2</code> e <code>t3</code>.</p>" +
            "<p>Não conte constantes imediatas, variáveis já existentes e não conte o registrador-resultado <code>r</code>.</p>" +
            "<p>Dentro de cada região, contamos nomes temporários distintos; entre regiões, o espaço reservado pode ser reaproveitado.</p>",
          headers: ["caso", "conta?", "motivo"],
          rows: [
            [{ html: "<code>t1 = x % 2</code>" }, "sim", "guarda um resultado intermediário"],
            [{ html: "<code>x</code>, <code>1</code>, <code>2</code>" }, "não", "variável do programa ou constante imediata"],
            [{ html: "<code>r = ...</code>" }, "não", "é o destino final da expressão, não um temporário"],
            ["total do if", "maior região", "condição, then e else não precisam manter temporários ao mesmo tempo"],
          ],
        }),
        C.codeStep({
          title: "Tradução didática em código de três endereços",
          body:
            "<p>O código abaixo não é uma linguagem real do curso. Ele só deixa visível onde a tradução ingênua cria temporários.</p>" +
            "<p>As linhas com <code>t...</code> são temporários. O <code>r</code> é o registrador-resultado, isto é, o destino final.</p>",
          code:
            "t1 = x % 2            ; condição: subexpressão\n" +
            "t2 = (t1 == 0)        ; booleano materializado p/ o branch\n" +
            "ifFalse t2 goto Lelse\n" +
            "t3 = x / 2            ; then: argumento da chamada\n" +
            "r  = call pot(t3)     ; retorno vai ao registrador-resultado\n" +
            "goto Lend\n" +
            "Lelse:\n" +
            "r  = (x == 1)         ; else: direto no destino r (sem temporário)\n" +
            "Lend: return r",
          active: [1, 2, 4, 8],
        }),
        C.tableStep({
          title: "Primeiro resolvemos a condição",
          body:
            "<p>Primeiro resolvemos a condição <code>x % 2 == 0</code>, porque o <code>if</code> precisa dela para escolher o ramo.</p>" +
            "<p>O resto <code>x % 2</code> precisa ser lembrado para a comparação. Depois a comparação gera o booleano testado pelo branch.</p>" +
            "<p>Depois que <code>t2</code> existe, <code>t1</code> não precisa estar vivo no branch.</p>",
          headers: ["passo", "código didático", "temporários novos"],
          rows: [
            [{ html: "calcular o resto" }, { html: "<code>t1 = x % 2</code>" }, "+1"],
            [{ html: "comparar com zero" }, { html: "<code>t2 = (t1 == 0)</code>" }, "+1"],
            [{ html: "testar o branch" }, { html: "<code>ifFalse t2 goto Lelse</code>" }, "+0"],
            [{ html: "total da condição" }, { html: "<code>x % 2 == 0</code>" }, "2"],
          ],
        }),
        C.tableStep({
          title: "Depois resolvemos os ramos",
          body:
            "<p>Depois resolvemos os ramos. Eles são alternativas: em uma execução entra no then ou no else, não nos dois.</p>" +
            "<p>No then, a chamada precisa do argumento <code>x / 2</code>. No else, o resultado de <code>x == 1</code> vai direto para <code>r</code>.</p>",
          headers: ["região", "código didático", "temporários"],
          rows: [
            [{ html: "then: preparar argumento" }, { html: "<code>t3 = x / 2</code>" }, "1"],
            [{ html: "then: chamar função" }, { html: "<code>r = call pot(t3)</code>" }, "0 novo"],
            [{ html: "else: comparar" }, { html: "<code>r = (x == 1)</code>" }, "0"],
          ],
        }),
        C.tableStep({
          title: "Juntando a resposta",
          body:
            "<p>O total do gabarito é o maior número necessário em uma região: condição precisa de 2, chamada precisa de 1 e else precisa de 0.</p>" +
            "<p>Por isso o total é 2, não <code>2 + 1 + 0</code>. Somar tudo contaria regiões que não mantêm temporários ao mesmo tempo.</p>",
          headers: ["item pedido", "temporários", "leitura"],
          rows: [
            [{ html: "<code>x % 2 == 0</code>" }, "2", { html: "<code>t1</code> para o resto e <code>t2</code> para o booleano" }],
            [{ html: "<code>potenciaDeDois(x/2)</code>" }, "1", { html: "<code>t3</code> para o argumento <code>x / 2</code>" }],
            [{ html: "<code>x == 1</code>" }, "0", { html: "resultado escrito direto em <code>r</code>" }],
            ["total", "2", "maior necessidade entre as regiões"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>Sob a convenção da lista, a sequência é <code>2, 1, 0, 2</code>.</p>" +
            "<p>Se a pergunta fosse pico de valores vivos com reutilização agressiva, poderia aparecer <code>1, 1, 0, 1</code>. Esta questão não usa essa convenção.</p>",
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
    section: "Geração de Código",
    title: "Layout de objeto e ordem de herança",
    tags: ["layout", "heranca"],
    hubDesc: "Inferir a ordem de herança pela ordem dos atributos no objeto.",
    statement:
      "Dado o layout observado <code>ID, size, disp, x, y, z, u, v</code>, em que campos " +
      "herdados aparecem antes dos campos definidos pela subclasse, escolha a relação de herança correta.",
    build: function () {
      return [
        {
          title: "Atributos herdados aparecem antes",
          body:
            "<p>Em layouts de objetos, campos herdados ocupam as primeiras posições; campos da subclasse são anexados depois.</p>",
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
            "<p>Os campos herdados vêm primeiro: <code>x,y</code> antes de <code>z</code>, e <code>z</code> " +
            "antes de <code>u,v</code>. Logo <b>C herda de B</b> (acrescenta <code>z</code>) e <b>A herda " +
            "de C</b> (acrescenta <code>u,v</code>). Em notação de subtipo: <code>A &le; C &le; B</code>.</p>",
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
    section: "Otimização",
    title: "Otimizações válidas em bloco básico",
    tags: ["otimizacao", "codigo-morto", "constantes"],
    hubDesc: "Avaliar propagação, expressões comuns, código morto e simplificação final.",
    statement:
      "No bloco básico <code>a := 1; b := 3; c := a + x; d := a * 3; e := b * 3; " +
      "f := a + b; g := e - f</code>, sabendo que somente <code>g</code> e <code>x</code> " +
      "são referenciados fora, quais otimizações propostas são válidas?",
    build: function () {
      return [
        C.codeStep({
          title: "Bloco básico",
          body:
            "<p>Somente <code>g</code> e <code>x</code> são referenciados fora do bloco. Logo, temporários sem uso externo podem morrer.</p>",
          code:
            "a := 1\nb := 3\nc := a + x\nd := a * 3\ne := b * 3\nf := a + b\ng := e - f",
          active: [3, 7],
        }),
        C.tableStep({
          title: "Analisando as opções",
          body:
            "<p>Depois de propagação de constantes, <code>e = 9</code>, <code>f = 4</code> e <code>g = 5</code>.</p>",
          headers: ["opção", "válida?", "motivo"],
          rows: [
            ["a", { html: "<span class='no'>não</span>" }, { html: "trocar <code>3</code> por <code>b</code> não é propagação de cópia" }],
            ["b", { html: "<span class='no'>não</span>" }, { html: "<code>a*3</code> e <code>b*3</code> não são a mesma expressão" }],
            ["c", { html: "<span class='ok'>sim</span>" }, { html: "<code>c</code> não é usado e sua expressão não tem efeito colateral" }],
            ["d", { html: "<span class='ok'>sim</span>" }, { html: "após simplificações válidas, o bloco pode virar <code>g := 5</code>" }],
          ],
        }),
      ];
    },
  });

  register({
    id: "c-q06-propagacao-constantes",
    num: "6",
    section: "Otimização",
    title: "Propagação de constantes com junção simples",
    tags: ["constantes", "fluxo"],
    hubDesc: "Encontrar X, Y e Z no ponto de junção após dois caminhos.",
    statement:
      "Após propagação de constantes, quais valores de X, Y e Z chegam ao ponto destacado? Reticulado: " +
      "<code>⊥</code> = ainda sem valor / inalcançável; uma constante; <code>⊤</code> = " +
      "alcançável, mas não constante.",
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
            "<p>O ponto importante é a junção: dois caminhos chegam ao mesmo bloco.</p>" +
            "<p>No bloco de entrada, <code>Z := 5</code>. Nos dois caminhos <code>X</code> termina como " +
            "4 e <code>Z</code> como 5. Mas <code>Y</code> só é redefinido no caminho da esquerda.</p>",
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
          title: "Estado de entrada (condições de contorno)",
          body:
            "<p>Antes de juntar os caminhos, precisamos saber o que entra no bloco.</p>" +
            "<p><code>X</code> e <code>Y</code> entram como <code>⊤</code>, porque chegam como valores " +
            "arbitrários. <code>Z</code> ainda não tinha valor (<code>⊥</code>), mas " +
            "<code>Z := 5</code> o fixa.</p>" +
            "<p><code>⊥</code> quer dizer sem informação; <code>⊤</code> quer dizer alcançável, mas " +
            "não constante. Eles <b>não são sinônimos</b>.</p>",
          headers: ["variável", "entrada", "papel até a junção"],
          rows: [
            ["X", "⊤", "redefinida (4) nos dois caminhos"],
            ["Y", "⊤", "redefinida só na esquerda (1)"],
            ["Z", "⊥ → 5", "fixada no bloco de entrada"],
          ],
        }),
        C.tableStep({
          title: "Junção variável a variável",
          body:
            "<p>Na junção, combine a informação que vem da esquerda com a que vem da direita.</p>" +
            "<p>Valores iguais mantêm a constante. Valores diferentes, ou algum <code>⊤</code>, sobem " +
            "para <code>⊤</code>.</p>",
          headers: ["variável", "caminho esquerdo", "caminho direito", "junção"],
          rows: [
            ["X", "4", "4", "4 ⊔ 4 = 4"],
            ["Y", "1", "⊤ (entrada, não redefinida)", "1 ⊔ ⊤ = ⊤"],
            ["Z", "5", "5", "5 ⊔ 5 = 5"],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>No encontro: <code>X=4</code>, <code>Y=⊤</code> e <code>Z=5</code>. <code>Y</code> não é 1 " +
            "porque entra como <code>⊤</code> e a direita não a redefine; se <code>Y</code> entrasse como " +
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
    section: "Otimização",
    title: "Propagação de constantes com laços",
    tags: ["constantes", "laco", "ponto-fixo"],
    hubDesc: "Entender como back-edges fazem constantes virarem ⊤ em ponto fixo.",
    statement:
      "No fluxo com laços que inicia em <code>Z := 5</code>, passa por ramos com " +
      "<code>Z := X + 6</code>, <code>X := 4</code>, <code>Y := 1</code> e chega ao " +
      "ponto indicado em <code>Y := 1; X := Z + 3</code>, quais valores de X, Y e Z chegam ali?",
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
            "<p>Um laço manda informação de volta para um ponto já analisado. Por isso uma constante " +
            "inicial pode se misturar com valores recalculados depois.</p>" +
            "<p>Quando repetir a análise não muda mais nada, chegamos ao <b>ponto fixo</b>. Aqui, essa " +
            "mistura faz alguns valores perderem precisão e virarem <code>⊤</code>.</p>",
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
            "<p>No ponto indicado, ainda sabemos <code>X=4</code>.</p>" +
            "<p>Já <code>Y</code> e <code>Z</code> recebem informação conflitante pelos ciclos. No ponto " +
            "fixo, ficam <code>⊤</code>.</p>",
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
    section: "Otimização",
    title: "Análise de vivacidade no ponto indicado",
    tags: ["vivacidade", "dataflow"],
    hubDesc: "Propagar usos para trás para decidir quais variáveis estão vivas antes do teste X > 0.",
    statement:
      "Depois da análise de vivacidade, quais variáveis entre W, X, Y e Z estão vivas no ponto indicado?",
    build: function () {
      return [
        {
          title: "O grafo de fluxo (CFG)",
          body:
            "<p>Vivacidade pergunta: “o valor atual ainda pode ser usado no futuro?”. Se sim, ele precisa " +
            "continuar guardado.</p>" +
            "<p>O ponto indicado (<code>?</code>) é antes do teste <code>X &gt; 0</code>. Assuma todas as " +
            "variáveis mortas na saída. Uma variável está viva se algum caminho a lê antes de redefini-la.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.flow(svg, { w: 720, h: 380, nodes: [
              { id: "p", x: 270, y: 20, w: 190, h: 50, lines: ["?  if X > 0"], active: true },
              { id: "t", x: 95, y: 140, w: 210, h: 70, lines: ["Z := W + 4", "Y := Y + 1"] },
              { id: "e", x: 430, y: 150, w: 160, h: 48, lines: ["Z := 7"] },
              { id: "m", x: 250, y: 290, w: 210, h: 50, lines: ["U := Z"] },
            ], edges: [
              { from: "p", to: "t", label: "X > 0" },
              { from: "p", to: "e", label: "senão" },
              { from: "t", to: "m" },
              { from: "e", to: "m" },
            ] });
          } },
        },
        C.tableStep({
          title: "Usos futuros a partir do ponto",
          body:
            "<p>Lendo o CFG acima, uma variável está viva se seu valor atual pode ser lido antes de ser " +
            "redefinido em algum caminho.</p>",
          headers: ["variável", "viva?", "motivo"],
          rows: [
            ["W", { html: "<span class='ok'>sim</span>" }, { html: "pode ser usada em <code>Z := W + 4</code>" }],
            ["X", { html: "<span class='ok'>sim</span>" }, { html: "é usada imediatamente no teste <code>X > 0</code>" }],
            ["Y", { html: "<span class='ok'>sim</span>" }, { html: "é usada em <code>Y := Y + 1</code>" }],
            ["Z", { html: "<span class='no'>não</span>" }, { html: "nos ramos, <code>Z</code> é redefinida antes de ser lida" }],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body: "<p>As variáveis vivas são <code>W</code>, <code>X</code> e <code>Y</code>.</p>",
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
    section: "Alocação de Registradores",
    title: "Coloração mínima de um RIG",
    tags: ["rig", "coloracao"],
    hubDesc: "Verificar se uma coloração é válida e se usa o menor número de cores.",
    statement:
      "Para o RIG com vértices <code>a</code>..<code>f</code> e arestas " +
      "<code>(a,f)</code>, <code>(f,e)</code>, <code>(e,d)</code>, <code>(d,c)</code>, " +
      "<code>(c,b)</code>, <code>(b,a)</code> e <code>(a,d)</code>, qual grafo apresenta " +
      "uma coloração mínima válida?",
    build: function () {
      var edges = [["a", "f"], ["f", "e"], ["e", "d"], ["d", "c"], ["c", "b"], ["b", "a"], ["a", "d"]];
      return [
        {
          title: "O RIG é bipartido",
          body:
            "<p>No RIG, uma aresta significa “não podem usar o mesmo registrador”. Então uma coloração " +
            "valida nunca coloca a mesma cor nas duas pontas de uma aresta.</p>" +
            "<p>Este grafo pode ser colorido com duas cores: <code>{a,c,e}</code> de uma cor e " +
            "<code>{b,d,f}</code> de outra. A aresta extra <code>a-d</code> continua válida.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.rig(svg, { w: 560, h: 360, nodes: rigNodes(), edges: edges, colors: {
              a: "var(--red)", c: "var(--red)", e: "var(--red)",
              b: "var(--green)", d: "var(--green)", f: "var(--green)",
            } });
          } },
        },
        C.choiceStep({
          title: "Resposta",
          body: "<p>A alternativa <b>d</b> é a coloração válida com apenas duas cores.</p>",
          choices: [
            { id: "a", html: "tem vértices adjacentes com mesma cor" },
            { id: "b", html: "tem <code>a</code> e <code>d</code> com mesma cor" },
            { id: "c", html: "válida, mas usa três cores" },
            { id: "d", html: "válida e mínima, com duas cores" },
          ],
          correct: ["d"],
        }),
      ];
    },
  });

  register({
    id: "c-q10-eliminacao-rig",
    num: "10",
    section: "Alocação de Registradores",
    title: "Sequência de eliminação para k = 3",
    tags: ["rig", "simplify", "coloracao"],
    hubDesc: "Checar se cada nó removido tem grau menor que k no grafo restante.",
    statement:
      "Para o RIG com vértices <code>a</code>..<code>f</code>, arestas " +
      "<code>(a,f)</code>, <code>(a,b)</code>, <code>(a,c)</code>, <code>(f,b)</code>, " +
      "<code>(f,e)</code>, <code>(f,d)</code>, <code>(b,c)</code>, <code>(e,c)</code>, " +
      "<code>(d,c)</code> e <code>k = 3</code>, quais sequências de eliminação são válidas?",
    build: function () {
      return [
        {
          title: "Grafo de interferência",
          body:
            "<p>Simplify remove os nós que ainda são fáceis de colorir depois.</p>" +
            "<p>A regra é: só remova nó com grau <code>&lt; k</code>. Aqui <code>k=3</code>, então " +
            "grau 0, 1 ou 2 pode sair.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.rig(svg, { w: 560, h: 360, nodes: rigNodes(), edges: rigEdgesQ10() });
          } },
        },
        C.tableStep({
          title: "Sequências",
          body:
            "<p>Só é válido remover um nó de grau <code>&lt; 3</code> no grafo restante. Veja a sequência de " +
            "cada opção e onde as inválidas falham.</p>",
          headers: ["opção", "sequência", "válida?", "comentário"],
          rows: [
            ["a", { html: "<code>d, e, c, b, a, f</code>" }, { html: "<span class='ok'>sim</span>" }, "d e e têm grau 2; depois c, b, a e f ficam removíveis"],
            ["b", { html: "<code>e, f, d, c, b, a</code>" }, { html: "<span class='no'>não</span>" }, { html: "após remover e, <code>f</code> ainda tem grau 3" }],
            ["c", { html: "<code>d, c, e, b, a, f</code>" }, { html: "<span class='no'>não</span>" }, { html: "após remover d, <code>c</code> ainda tem grau 3" }],
            ["d", { html: "<code>d, e, b, c, a, f</code>" }, { html: "<span class='no'>não</span>" }, { html: "após remover d e e, <code>b</code> ainda tem grau 3" }],
          ],
        }),
      ];
    },
  });

  register({
    id: "c-q11-spill-custo",
    num: "11",
    section: "Alocação de Registradores",
    title: "Escolhendo spill de menor custo",
    tags: ["spill", "rig"],
    hubDesc: "Aplicar a fórmula ocorrências - conflitos + bônus de laço.",
    statement:
      "Com k = 3 registradores, o RIG dado não pode ser simplificado (todos os nós têm grau >= 3). " +
      "Aplique a regra de custo do exercício para escolher o nó a derramar.",
    build: function () {
      return [
        {
          title: "RIG travado: um K4 com k = 3",
          body:
            "<p>Antes de escolher spill, tente simplificar. Aqui isso trava.</p>" +
            "<p>Os quatro nós formam um <b>K4</b>: cada um interfere com os outros três, então todos têm " +
            "<b>grau 3 = k</b>. Nenhum nó tem grau &lt; k; portanto <b>simplify não remove ninguém</b>.</p>" +
            "<p>Quando trava, escolhemos um valor para <b>spill</b>: guardar em memória em vez de manter " +
            "em registrador. <code>D</code> está fora do laço.</p>",
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
          title: "Custos (regra deste exercício)",
          body:
            "<p>A fórmula <code>usos - conflitos + (5 se em laço)</code> é a <b>regra deste exercício</b>, " +
            "não uma heurística universal de alocadores reais. Como todos têm o mesmo grau (3), a decisão " +
            "vem da <b>frequência</b>: <code>C</code> e <code>D</code> têm usos e grau iguais, mas " +
            "<code>D</code> está fora do laço e fica mais barato.</p>",
          headers: ["nó", "usos", "conflitos (grau)", "bônus laço", "custo"],
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
            "<p>Entre os nós <b>genuinamente travados</b> (grau &ge; k), o de menor custo é <code>D</code>. " +
            "Um nó de grau &lt; k nunca chegaria a esta decisão &mdash; seria <b>simplificado</b> e " +
            "recolorido depois, não derramado.</p>",
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
    section: "Gerenciamento de Memória",
    title: "Coleta marcar-e-varrer",
    tags: ["gc", "mark-sweep"],
    hubDesc: "Marcar objetos alcançáveis pela raiz e colocar os demais na lista livre.",
    statement:
      "Qual heap final resulta de aplicar marcar-e-varrer ao heap com <code>root -> A</code>, " +
      "<code>A -> B</code>, <code>A -> E</code>, ciclo <code>B &lt;-&gt; C</code>, " +
      "ciclo <code>D &lt;-&gt; F</code> e células <code>G/H</code> já livres?",
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
            "<p>Mark-sweep começa pelas raízes: tudo que dá para alcançar delas fica vivo.</p>" +
            "<p>A raiz alcança <code>A</code>. De <code>A</code> chegamos a <code>B</code> e " +
            "<code>E</code>; de <code>B</code> chegamos a <code>C</code>. O par <code>D/F</code> não é " +
            "alcançável, mesmo formando ciclo.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "G", "H"], root: 0, free: [6, 7], pointers: livePtrs.concat([{ from: 3, to: 5, side: "top" }, { from: 5, to: 3, side: "bottom" }]), note: "antes: G/H já estão livres; D/F ainda ocupam células" });
          } },
        },
        {
          title: "Varre e libera não marcados",
          body:
            "<p>Depois de marcar, a varredura passa pelo heap inteiro. O que não foi marcado vira livre.</p>" +
            "<p>Mark-sweep não compacta: preserva A, B, C e E nas mesmas posições e coloca D, F, G e H " +
            "na lista livre. Isso corresponde a alternativa <b>a</b>.</p>",
          visual: { type: "svg", draw: function (svg) {
            C.heap(svg, { cells: ["A", "B", "C", "D", "E", "F", "G", "H"], root: 0, free: [3, 5, 6, 7], pointers: livePtrs.concat([{ from: 3, to: 5, side: "top", free: true }, { from: 5, to: 6, side: "bottom", free: true }, { from: 6, to: 7, side: "bottom", free: true }]), note: "final: objetos não marcados viram free" });
          } },
        },
      ];
    },
  });

  register({
    id: "c-q13-stop-copy",
    num: "13",
    section: "Gerenciamento de Memória",
    title: "Coleta parar-e-copiar",
    tags: ["gc", "copying"],
    hubDesc: "Copiar apenas objetos alcançáveis para o new space, seguindo a ordem do algoritmo.",
    statement:
      "Qual heap final resulta de aplicar parar-e-copiar ao heap com <code>root -> A</code>, " +
      "<code>A -> B</code>, <code>A -> E</code>, ciclo <code>B &lt;-&gt; C</code> e " +
      "ciclo inalcançável <code>D &lt;-&gt; F</code>?",
    build: function () {
      return [
        {
          title: "Objetos alcançáveis",
          body:
            "<p>Stop-copy também parte das raízes, mas em vez de marcar no lugar, copia os vivos para " +
            "um espaço novo.</p>" +
            "<p>Da raiz, copiamos <code>A</code>. Ao escanear <code>A</code>, descobrimos <code>B</code> " +
            "e <code>E</code>; ao escanear <code>B</code>, descobrimos <code>C</code>. O ciclo " +
            "<code>D/F</code> não é alcançável.</p>",
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
          title: "Ordem de cópia",
          body:
            "<p>Com a varredura de cópia, a ordem fica <code>A, B, E, C</code>. O restante do espaço antigo vira livre. Alternativa <b>b</b>.</p>",
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
    section: "Gerenciamento de Memória",
    title: "Contagem de referências após atribuições",
    tags: ["gc", "reference-counting"],
    hubDesc: "Atualizar referências, liberar cascatas e observar que ciclos não são coletados por contagem simples.",
    statement:
      "Atualize a heap inicial com <code>root -> A</code>, <code>A -> B</code>, " +
      "<code>A -> E</code>, <code>B -> C</code>, <code>C -> B</code>, " +
      "<code>D -> E</code>, <code>D -> F</code> e <code>F -> D</code> após " +
      "<code>C.ptrParaB = D</code> e <code>A.ptrParaB = NULL</code>, usando contagem de referências.",
    build: function () {
      return [
        {
          title: "Duas atualizações",
          body:
            "<p>Na contagem de referências, olhe para as setas que chegam em cada objeto.</p>" +
            "<p>Primeiro <code>C</code> deixa de apontar para <code>B</code> e passa a apontar para " +
            "<code>D</code>. Depois <code>A</code> também deixa de apontar para <code>B</code>.</p>",
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
            "<p>Regra: perdeu seta, decrementa; chegou a zero, libera. Ao liberar um objeto, suas setas " +
            "de saída também somem, o que pode liberar outros objetos em cascata.</p>" +
            "<p><code>B</code> perde as referências de <code>C</code> e de <code>A</code>, zera e é " +
            "liberado. Ao liberar <code>B</code>, sua referência para <code>C</code> cai; " +
            "<code>C</code> também zera.</p>",
          headers: ["objeto", "resultado"],
          rows: [
            ["B", { html: "fica <code>free</code>" }],
            ["C", { html: "fica <code>free</code> em cascata" }],
            ["D/F", "permanecem porque formam ciclo de referências"],
            ["A/E", "permanecem alcançáveis pela raiz"],
          ],
        }),
        {
          title: "Heap final",
          body:
            "<p>A resposta é a alternativa <b>c</b>: <code>B</code> e <code>C</code> livres, <code>D/E/F</code> preservados e a última célula livre.</p>",
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
