/*
 * lista-a.js - Compiladores, Lista A.
 * Resolucao comentada de lexico, GLCs, transformacoes de gramatica e LL(1).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var S = EX.Slides;

  function html(parts) { return parts.join(""); }
  function grammar(lines) { return C.codeHtml(lines.join("\n")); }

  function register(spec) {
    EX.registry.add({
      id: spec.id,
      num: spec.num,
      subject: "Compiladores - Lista A",
      section: spec.section,
      title: spec.title,
      type: spec.type || "computacional",
      tags: spec.tags || [],
      hubDesc: spec.hubDesc,
      statement: spec.statement,
      parts: [{ label: "Resolucao", build: spec.build }],
    });
  }

  register({
    id: "a-q01-lexico-saida",
    num: "1",
    section: "Analise Lexica",
    title: "Entrada que produz morango, banana e laranja",
    tags: ["lexico", "flex", "longest-match"],
    hubDesc: "Construir uma entrada sabendo que o analisador escolhe o maior lexema e depois a primeira regra.",
    statement:
      "Dada a especificacao Flex-like, forneca uma entrada cuja saida seja " +
      "<code>(morango^3 banana)^3 (morango laranja)^2</code>.",
    build: function () {
      var spec =
        "(01|10)             { print \"morango\" }\n" +
        "1(01)*0             { print \"banana\" }\n" +
        "(1011*0|0100*1)     { print \"laranja\" }";
      var blocoA = [
        { lexeme: "01", label: "morango" },
        { lexeme: "10", label: "morango" },
        { lexeme: "01", label: "morango" },
        { lexeme: "1010", label: "banana", w: 78 },
      ];
      var blocoB = [
        { lexeme: "01", label: "morango" },
        { lexeme: "101110", label: "laranja", w: 96 },
      ];
      return [
        C.codeStep({
          title: "Regras e criterio do scanner",
          body:
            "<p>Em um analisador Flex-like, a escolha nao e feita apenas pela ordem das regras.</p>" +
            "<ol><li>Primeiro vence o <span class='accent'>maior prefixo</span> da entrada.</li>" +
            "<li>Se houver empate no tamanho, vence a <span class='accent'>regra escrita antes</span>.</li></ol>",
          code: spec,
        }),
        {
          title: "Bloco que gera morango^3 banana",
          body:
            "<p>Para obter <code>morango morango morango banana</code>, usamos tres lexemas curtos " +
            "da regra 1 e terminamos com <code>1010</code>, que casa com <code>1(01)*0</code>.</p>" +
            "<p>Assim, um bloco e <code>01 10 01 1010</code>, isto e, <code>0110011010</code>.</p>",
          visual: {
            type: "svg",
            draw: function (svg) { C.tape(svg, blocoA, { active: 3 }); },
          },
        },
        {
          title: "Bloco que gera morango laranja",
          body:
            "<p>Para <code>morango laranja</code>, comecamos com <code>01</code> e depois usamos " +
            "<code>101110</code>, que e da forma <code>1011*0</code>.</p>",
          visual: {
            type: "svg",
            draw: function (svg) { C.tape(svg, blocoB, { active: 1 }); },
          },
        },
        C.domStep(
          "Resposta compacta",
          "<p>Juntando os blocos com as repeticoes pedidas, a entrada pode ser escrita em notacao compacta.</p>",
          html([
            "<div class='ex-callout tip'><div class='ex-callout-title'>Entrada</div>",
            "<pre class='formula'>(0110011010)^3(01101110)^2</pre>",
            "<p><code>0110011010</code> gera <b>morango morango morango banana</b>.</p>",
            "<p><code>01101110</code> gera <b>morango laranja</b>.</p></div>",
          ])
        ),
      ];
    },
  });

  register({
    id: "a-q02-lexico-trace",
    num: "2",
    section: "Analise Lexica",
    title: "Trace de um analisador lexico Flex-like",
    tags: ["lexico", "trace"],
    hubDesc: "Simular maior prefixo e desempate por ordem de regra na entrada cbaccacacccbbcccbaccac.",
    statement:
      "Para a especificacao <code>c*b -> X</code>, <code>ac -> Y</code>, " +
      "<code>c*ac* -> Z</code>, determine a saida para <code>cbaccacacccbbcccbaccac</code>.",
    build: function () {
      var rows = [
        ["1", "cb", "c*b", "X", "maior prefixo no inicio"],
        ["2", "acc", "c*ac*", "Z", { html: "<code>acc</code> vence <code>ac</code> por tamanho" }],
        ["3", "ac", "ac", "Y", { html: "empate de tamanho com <code>c*ac*</code>; regra 2 vem antes" }],
        ["4", "accc", "c*ac*", "Z", "maior prefixo"],
        ["5", "b", "c*b", "X", { html: "<code>c*</code> pode ser vazio" }],
        ["6", "b", "c*b", "X", "novo lexema independente"],
        ["7", "cccb", "c*b", "X", { html: "prefixo longo ate o <code>b</code>" }],
        ["8", "acc", "c*ac*", "Z", "maior prefixo"],
        ["9", "ac", "ac", "Y", { html: "empate; regra <code>ac</code> vence" }],
      ];
      return [
        C.codeStep({
          title: "Especificacao",
          body:
            "<p>Vamos sempre tentar o maior prefixo da entrada restante. A regra <code>ac</code> so vence " +
            "quando empata em tamanho com <code>c*ac*</code>.</p>",
          code:
            "c*b     { print \"X\" }\n" +
            "ac      { print \"Y\" }\n" +
            "c*ac*   { print \"Z\" }\n\n" +
            "entrada: cbaccacacccbbcccbaccac",
        }),
        C.tableStep({
          title: "Consumo da entrada",
          body:
            "<p>A saida e a concatenacao das acoes disparadas por cada lexema aceito.</p>",
          headers: ["#", "lexema", "regra", "saida", "por que"],
          rows: rows,
        }),
        C.domStep(
          "Saida final",
          "<p>Concatenando as nove acoes do trace:</p>",
          "<div class='ex-callout tip'><div class='ex-callout-title'>Resposta</div>" +
          "<pre class='formula'>XZYZXXXZY</pre></div>"
        ),
      ];
    },
  });

  register({
    id: "a-q03-glcs",
    num: "3",
    section: "Gramaticas Livres de Contexto",
    title: "GLCs para sinais e contagem de bits",
    tags: ["glc", "gramatica"],
    hubDesc: "Duas gramaticas: produtos positivos e cadeias com pelo menos duas vezes mais 1s que 0s.",
    statement:
      "Forneca GLCs para as linguagens pedidas: produtos inteiros positivos e cadeias binarias com " +
      "<code>#1 >= 2 * #0</code>.",
    build: function () {
      return [
        {
          title: "Parte (a): separar sinal positivo e negativo",
          body:
            "<p>A ideia e manter dois nao terminais semanticos: <code>P</code> gera expressoes de valor " +
            "<span class='ok'>positivo</span> e <code>N</code> gera expressoes de valor " +
            "<span class='no'>negativo</span>.</p><p>Multiplicar sinais iguais da positivo; sinais diferentes da negativo.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              svg.view(560, 280);
              C.box(svg, 90, 75, 145, 70, ["P", "positivo"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: false });
              C.box(svg, 325, 75, 145, 70, ["N", "negativo"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: false });
              svg.arrow(235, 110, 325, 110, { color: "var(--ink-mute)", dashed: true });
              svg.arrow(325, 145, 235, 145, { color: "var(--ink-mute)", dashed: true });
              svg.text(280, 89, "multiplica por -", { size: 12, color: "var(--ink-dim)" });
              svg.text(280, 166, "multiplica por -", { size: 12, color: "var(--ink-dim)" });
              svg.text(280, 220, "P*P e N*N -> P    |    P*N e N*P -> N", { size: 14, mono: true, color: "var(--accent)" });
            },
          },
        },
        C.domStep(
          "Uma GLC para produtos positivos",
          "<p>Esta gramatica aceita inteiros com digitos <code>1</code> e <code>2</code>, sinais negativos e produtos.</p>",
          grammar([
            "P -> P * P | N * N | I | - N",
            "N -> N * P | P * N | - P",
            "I -> D I | D",
            "D -> 1 | 2",
          ])
        ),
        C.domStep(
          "Parte (b): cada 0 exige dois 1s",
          "<p>Para garantir <code>#1 >= 2 * #0</code>, cada producao principal introduz um <code>0</code> " +
          "junto com dois <code>1</code>s, em todas as ordens possiveis. A producao <code>1S</code> permite sobras de <code>1</code>.</p>",
          grammar([
            "S -> S 0 S 1 S 1 S",
            "   | S 1 S 0 S 1 S",
            "   | S 1 S 1 S 0 S",
            "   | 1 S",
            "   | lambda",
          ]) +
          "<div class='ex-callout warn'><div class='ex-callout-title'>Observacao</div>" +
          "A imagem do PDF usa a letra <code>P</code> no miolo das producoes; aqui ela foi escrita como " +
          "<code>S</code> para deixar a recursao explicita e evitar um nao terminal indefinido.</div>"
        ),
      ];
    },
  });

  register({
    id: "a-q04-transformacoes-gramatica",
    num: "4",
    section: "Transformacoes de Gramatica",
    title: "Fatoracao a esquerda e remocao de recursao",
    tags: ["fatoracao", "recursao-a-esquerda"],
    hubDesc: "Transformar gramatica para aproximar o formato aceito por analisadores preditivos.",
    statement:
      "Faca a fatoracao a esquerda da primeira gramatica e elimine a recursao a esquerda da segunda.",
    build: function () {
      return [
        C.tableStep({
          title: "Fator comum a esquerda",
          body:
            "<p>Quando duas alternativas comecam igual, isolamos o prefixo comum e empurramos a escolha para um novo nao terminal.</p>",
          headers: ["nao terminal", "antes", "depois"],
          rows: [
            ["S", "S -> S + S | S + P", { html: "S -> S + S'<br>S' -> S | P" }],
            ["P", "P -> P * P | P * I", { html: "P -> P * P'<br>P' -> P | I" }],
            ["I, D, N", "sem prefixo comum util", "permanecem iguais"],
          ],
        }),
        C.domStep(
          "Gramatica fatorada",
          "<p>A fatoracao nao remove a recursao a esquerda; ela so tira a decisao tardia depois do prefixo comum.</p>",
          grammar([
            "S  -> S + S'",
            "P  -> P * P'",
            "I  -> -I | (S) | D",
            "D  -> 0 | 1N",
            "N  -> 0 | 1 | N N | lambda",
            "S' -> S | P",
            "P' -> P | I",
          ])
        ),
        {
          title: "Padrao de remocao de recursao direta",
          body:
            "<p>Para uma regra <code>A -> A alpha | beta</code>, usamos <code>A -> beta A'</code> e " +
            "<code>A' -> alpha A' | lambda</code>. Aplicamos isso em <code>S</code>, <code>U</code> e <code>T</code>.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              svg.view(700, 300);
              C.box(svg, 70, 80, 220, 76, ["A -> A alpha | beta"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
              svg.arrow(300, 118, 395, 118, { color: "var(--accent)", strokeWidth: 3 });
              C.box(svg, 405, 55, 230, 58, ["A -> beta A'"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
              C.box(svg, 405, 140, 230, 58, ["A' -> alpha A' | lambda"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
            },
          },
        },
        C.domStep(
          "Gramatica sem recursao a esquerda",
          "<p>O operador posfixo <code>n</code> vira repeticao em <code>T'</code>; os operadores binarios ficam em <code>S'</code> e <code>U'</code>.</p>",
          grammar([
            "S  -> U S'",
            "U  -> T U'",
            "T  -> t T' | f T' | (S) T'",
            "S' -> a S S' | lambda",
            "U' -> u U U' | lambda",
            "T' -> n T' | lambda",
          ])
        ),
      ];
    },
  });

  register({
    id: "a-q05-ll1-tabela-trace",
    num: "5",
    section: "Analise Sintatica LL(1)",
    title: "FIRST, FOLLOW, tabela LL(1) e parsing",
    tags: ["first", "follow", "ll1", "parsing-table"],
    hubDesc: "Construir conjuntos, tabela preditiva e trace de pilha para a cadeia (();0).",
    statement:
      "Para a GLC dada, construa FIRST, FOLLOW, a parsing table LL(1) e simule o parse de <code>(() ; 0)</code>.",
    build: function () {
      var parseRows = [
        ["S $", "( ( ) ; 0 ) $", "S -> (T"],
        ["( T $", "( ( ) ; 0 ) $", "match ("],
        ["T $", "( ) ; 0 ) $", "T -> C A"],
        ["C A $", "( ) ; 0 ) $", "C -> S"],
        ["S A $", "( ) ; 0 ) $", "S -> (T"],
        ["( T A $", "( ) ; 0 ) $", "match ("],
        ["T A $", ") ; 0 ) $", "T -> )"],
        [") A $", ") ; 0 ) $", "match )"],
        ["A $", "; 0 ) $", "A -> ; B"],
        ["; B $", "; 0 ) $", "match ;"],
        ["B $", "0 ) $", "B -> C A"],
        ["C A $", "0 ) $", "C -> 0"],
        ["0 A $", "0 ) $", "match 0"],
        ["A $", ") $", "A -> )"],
        [") $", ") $", "match )"],
        ["$", "$", "aceita"],
      ];
      return [
        C.domStep(
          "Gramatica",
          "<p>Os terminais sao <code>0</code>, <code>1</code>, <code>(</code>, <code>)</code> e <code>;</code>.</p>",
          grammar([
            "S -> ( T",
            "T -> C A | )",
            "A -> ; B | )",
            "B -> C A | )",
            "C -> 0 | 1 | S",
          ])
        ),
        C.tableStep({
          title: "Conjuntos FIRST e FOLLOW",
          body:
            "<p><code>C</code> comeca com literal ou com <code>S</code>; por isso herda <code>(</code>. " +
            "Os FOLLOWs propagam <code>$</code>, <code>;</code> e <code>)</code> pelas posicoes finais.</p>",
          headers: ["nao terminal", "FIRST", "FOLLOW"],
          rows: [
            ["S", "{ ( }", "{ $, ;, ) }"],
            ["T", "{ (, 0, 1, ) }", "{ $, ;, ) }"],
            ["A", "{ ;, ) }", "{ $, ;, ) }"],
            ["B", "{ (, 0, 1, ) }", "{ $, ;, ) }"],
            ["C", "{ 0, 1, ( }", "{ ;, ) }"],
          ],
        }),
        C.tableStep({
          title: "Parsing table LL(1)",
          body:
            "<p>Cada celula recebe a producao prevista pelo terminal de lookahead.</p>",
          headers: ["", "(", ")", ";", "0", "1", "$"],
          rows: [
            ["S", "S -> (T", "", "", "", "", ""],
            ["T", "T -> CA", "T -> )", "", "T -> CA", "T -> CA", ""],
            ["A", "", "A -> )", "A -> ;B", "", "", ""],
            ["B", "B -> CA", "B -> )", "", "B -> CA", "B -> CA", ""],
            ["C", "C -> S", "", "", "C -> 0", "C -> 1", ""],
          ],
        }),
        C.tableStep({
          title: "Trace do parse",
          body:
            "<p>A pilha comeca com <code>S $</code>. Quando o topo e terminal, fazemos <i>match</i>; " +
            "quando e nao terminal, consultamos a tabela.</p>",
          headers: ["pilha", "entrada", "acao"],
          rows: parseRows,
        }),
      ];
    },
  });

  register({
    id: "a-q06-first-follow",
    num: "6",
    section: "Analise Sintatica LL(1)",
    title: "FIRST e FOLLOW com producao lambda",
    tags: ["first", "follow", "lambda"],
    hubDesc: "Calcular FIRST/FOLLOW quando um nao terminal opcional aparece antes de outro terminal.",
    statement:
      "Para <code>A -> xCBy</code>, <code>B -> z | lambda</code>, <code>C -> y | Bx</code>, construa FIRST e FOLLOW.",
    build: function () {
      return [
        C.domStep(
          "Gramatica",
          "<p>O ponto delicado e <code>B</code>: como ele pode ser <code>lambda</code>, <code>Bx</code> tambem pode comecar por <code>x</code>.</p>",
          grammar([
            "A -> x C B y",
            "B -> z | lambda",
            "C -> y | B x",
          ])
        ),
        C.tableStep({
          title: "FIRST",
          body:
            "<p><code>FIRST(B)</code> contem <code>lambda</code>. Logo, em <code>C -> Bx</code>, entram <code>z</code> e tambem <code>x</code>.</p>",
          headers: ["nao terminal", "FIRST"],
          rows: [
            ["A", "{ x }"],
            ["B", "{ z, lambda }"],
            ["C", "{ y, z, x }"],
          ],
        }),
        C.tableStep({
          title: "FOLLOW",
          body:
            "<p>Em <code>A -> x C B y</code>, depois de <code>B</code> vem <code>y</code>. Depois de <code>C</code> vem <code>B y</code>, entao entram <code>z</code> e <code>y</code>.</p>",
          headers: ["nao terminal", "FOLLOW"],
          rows: [
            ["A", "{ }"],
            ["B", "{ x, y }"],
            ["C", "{ y, z }"],
          ],
        }),
      ];
    },
  });

  register({
    id: "a-q07-ll1-ou-nao",
    num: "7",
    section: "Analise Sintatica LL(1)",
    title: "Diagnostico LL(1) por conflitos",
    tags: ["ll1", "first", "follow"],
    hubDesc: "Verificar quatro gramaticas pequenas procurando intersecoes FIRST/FIRST e FIRST/FOLLOW.",
    statement: "Para cada gramatica, identifique e demonstre se ela e LL(1).",
    build: function () {
      return [
        C.tableStep({
          title: "Resumo dos criterios",
          body:
            "<p>Para alternativas de um mesmo nao terminal, os conjuntos de previsao devem ser disjuntos. " +
            "Se uma alternativa gera <code>lambda</code>, compare tambem com o FOLLOW.</p>",
          headers: ["caso", "decisao", "motivo"],
          rows: [
            ["(a)", { html: "<span class='ok'>LL(1)</span>" }, { html: "<code>FIRST(aY)={a}</code> e <code>FIRST(Z)={b}</code>; sem intersecao." }],
            ["(b)", { html: "<span class='no'>nao LL(1)</span>" }, { html: "Em <code>R -> o | S</code>, <code>FIRST(o)</code> e <code>FIRST(S)</code> contem <code>o</code>." }],
            ["(c)", { html: "<span class='no'>nao LL(1)</span>" }, { html: "<code>K -> c | lambda</code> e <code>FOLLOW(K)={c}</code>; conflito no lookahead <code>c</code>." }],
            ["(d)", { html: "<span class='ok'>LL(1)</span>" }, { html: "<code>FIRST(c)={c}</code> e <code>FOLLOW(K)={b}</code>; disjuntos." }],
          ],
        }),
        C.choiceStep({
          title: "Veredito",
          body:
            "<p>As gramaticas (a) e (d) passam. As gramaticas (b) e (c) falham por conflitos de previsao.</p>",
          choices: [
            { id: "a", html: "LL(1)" },
            { id: "b", html: "nao LL(1)" },
            { id: "c", html: "nao LL(1)" },
            { id: "d", html: "LL(1)" },
          ],
          correct: ["a", "d"],
        }),
      ];
    },
  });

  register({
    id: "a-q08-recursao-indireta",
    num: "8",
    section: "Transformacoes de Gramatica",
    title: "Remocao de recursao indireta a esquerda",
    tags: ["recursao-indireta", "ll1"],
    hubDesc: "Substituir cadeias A -> B -> C -> A antes de remover a recursao direta resultante.",
    statement:
      "Transforme a gramatica <code>A -> B! | x</code>, <code>B -> C</code>, <code>C -> A? | y</code> para uma equivalente LL(1).",
    build: function () {
      return [
        C.domStep(
          "Ciclo indireto",
          "<p>O problema nao aparece como <code>A -> A alpha</code> imediatamente. Ele passa por <code>B</code> e <code>C</code>.</p>",
          grammar([
            "A -> B ! | x",
            "B -> C",
            "C -> A ? | y",
            "",
            "ciclo: A => B! => C! => A?!",
          ])
        ),
        {
          title: "Substituir nao terminais intermediarios",
          body:
            "<p>Como <code>B -> C</code>, podemos reescrever <code>A -> C!</code>. Depois substituimos <code>C -> A? | y</code>.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              svg.view(700, 270);
              C.box(svg, 50, 80, 160, 62, ["A -> B! | x"], {});
              C.box(svg, 270, 80, 140, 62, ["B -> C"], {});
              C.box(svg, 470, 80, 170, 62, ["C -> A? | y"], {});
              svg.arrow(210, 111, 270, 111, { color: "var(--accent)", strokeWidth: 3 });
              svg.arrow(410, 111, 470, 111, { color: "var(--accent)", strokeWidth: 3 });
              svg.text(350, 205, "A -> A ? ! | y ! | x", { mono: true, size: 18, color: "var(--orange)", weight: 700 });
            },
          },
        },
        C.domStep(
          "Remover a recursao direta resultante",
          "<p>Agora sim temos <code>A -> A ? ! | y ! | x</code>. Aplicamos o padrao de recursao direta.</p>",
          grammar([
            "A  -> y ! A' | x A'",
            "A' -> ? ! A' | lambda",
          ]) +
          "<div class='ex-callout tip'><div class='ex-callout-title'>Resultado</div>" +
          "A gramatica final gera as mesmas cadeias, mas a decisao inicial e feita por <code>y</code> ou <code>x</code>, sem recursao a esquerda.</div>"
        ),
      ];
    },
  });
})();
