/*
 * lista-b.js - Compiladores, Lista B.
 * Resolucao comentada de analise semantica em COOL.
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
      subject: "Compiladores - Lista B",
      section: spec.section,
      title: spec.title,
      type: spec.type || "computacional",
      tags: spec.tags || [],
      hubDesc: spec.hubDesc,
      statement: spec.statement,
      parts: [{ label: "Resolucao", build: spec.build }],
    });
  }

  function hierarchyVisual(active) {
    return {
      type: "svg",
      draw: function (svg) {
        C.classTree(svg, {
          w: 760,
          h: 430,
          active: active || [],
          nodes: {
            Object: { x: 380, y: 45 },
            Bool: { x: 90, y: 135 },
            Point: { x: 230, y: 135 },
            Line: { x: 360, y: 135 },
            Shape: { x: 520, y: 135 },
            Quad: { x: 450, y: 225 },
            Circle: { x: 610, y: 225 },
            Rect: { x: 450, y: 315 },
            Square: { x: 450, y: 390 },
          },
          edges: [
            ["Object", "Bool"], ["Object", "Point"], ["Object", "Line"], ["Object", "Shape"],
            ["Shape", "Quad"], ["Shape", "Circle"], ["Quad", "Rect"], ["Rect", "Square"],
          ],
        });
      },
    };
  }

  register({
    id: "b-q01-escopo",
    num: "1",
    section: "Analise Semantica",
    title: "Escopo e declaracao aninhada mais proxima",
    tags: ["cool", "escopo"],
    hubDesc: "Identificar qual declaracao de x cada uso encontra em escopos aninhados.",
    statement:
      "No codigo COOL da <code>class Foo</code>, com parametro <code>f(x : Int)</code>, " +
      "<code>let x : Int &lt;- 4</code>, <code>let x : Int &lt;- 7</code> e atributo " +
      "<code>x : Int &lt;- 14</code>, marque quais usos, incluindo a linha 10, estao ligados pela " +
      "regra da declaracao aninhada mais proxima.",
    build: function () {
      var code =
        "class Foo {\n" +
        "  f(x : Int) : Int {\n" +
        "    {\n" +
        "      let x : Int <- 4 in {\n" +
        "        x;\n" +
        "        let x : Int <- 7 in\n" +
        "          x;\n" +
        "        x;\n" +
        "      };\n" +
        "      x;\n" +
        "    };\n" +
        "  };\n" +
        "  x : Int <- 14;\n" +
        "}";
      return [
        C.codeStep({
          title: "Os tres x declarados",
          body:
            "<p>COOL resolve nomes procurando do escopo mais interno para fora. O atributo da classe e o ultimo candidato.</p>",
          code: code,
          lang: "text",
          active: [2, 4, 6, 13],
        }),
        C.tableStep({
          title: "Ligacoes dos usos",
          body:
            "<p>O <code>let</code> da linha 6 so vale para seu corpo imediato, a linha 7. Depois dele, volta a valer o <code>let</code> da linha 4.</p>",
          headers: ["uso", "declaracao encontrada", "motivo"],
          rows: [
            ["linha 5", "linha 4", { html: "o <code>let x <- 4</code> esta mais perto que o parametro" }],
            ["linha 7", "linha 6", { html: "e o corpo do <code>let x <- 7</code>" }],
            ["linha 8", "linha 4", "a linha 6 ja terminou"],
            ["linha 10", "linha 2", { html: "fora do <code>let</code>, resta o parametro do metodo" }],
          ],
        }),
        C.choiceStep({
          title: "Alternativas verdadeiras",
          body:
            "<p>Das alternativas do enunciado, somente a ligacao da linha 10 com a linha 2 e verdadeira.</p>",
          choices: [
            { id: "1", html: "Linha 5 liga-se com a linha 2" },
            { id: "2", html: "Linha 8 liga-se com a linha 6" },
            { id: "3", html: "Linha 10 liga-se com a linha 2" },
            { id: "4", html: "Linha 10 liga-se com a linha 13" },
          ],
          correct: ["3"],
        }),
      ];
    },
  });

  register({
    id: "b-q02-regras-boas",
    num: "2",
    section: "Regras de Inferencia",
    title: "Regras de inferencia boas",
    tags: ["inferencia", "tipos"],
    hubDesc: "Separar regras semanticamente consistentes de regras com conclusao de tipo errada.",
    statement:
      "Escolha quais regras de inferencia sao boas: sequencia, comparacao, divisao e isvoid.",
    build: function () {
      return [
        C.tableStep({
          title: "As regras em julgamento",
          body:
            "<p>Cada regra propoe um tipo para a conclusao a partir das premissas. Uma regra e boa quando o " +
            "tipo prometido bate com a semantica de avaliacao.</p>",
          headers: ["regra", "premissas", "conclusao proposta"],
          rows: [
            ["Sequencia", { html: "<code>e1:T1, ..., en:Tn</code>" }, { html: "<code>{ e1; ...; en; } : Tn</code>" }],
            [{ html: "Comparacao <code>&lt;</code>" }, { html: "<code>e1:Int, e2:Int</code>" }, { html: "<code>e1 &lt; e2 : Int</code>" }],
            ["Divisao", { html: "<code>e1:Int, e2:Int</code>" }, { html: "<code>e1 / e2 : Bool</code>" }],
            ["isvoid", { html: "<code>e : T</code> (qualquer T)" }, { html: "<code>isvoid(e) : Bool</code>" }],
          ],
        }),
        C.tableStep({
          title: "Como julgar uma regra",
          body:
            "<p>Uma regra boa nao deve prometer um tipo que a avaliacao real nao entrega.</p>",
          headers: ["regra", "veredito", "comentario"],
          rows: [
            ["Sequencia", { html: "<span class='ok'>boa</span>" }, "o tipo do bloco e o tipo da ultima expressao"],
            [{ html: "Comparacao <code>&lt;</code>" }, { html: "<span class='no'>ruim</span>" }, { html: "a conclusao deveria ser <code>Bool</code>, nao <code>Int</code>" }],
            ["Divisao", { html: "<span class='no'>ruim</span>" }, { html: "<code>Int / Int</code> deve produzir <code>Int</code>, nao <code>Bool</code>" }],
            [{ html: "<code>isvoid(e)</code>" }, { html: "<span class='ok'>boa</span>" }, { html: "testa vazio e retorna <code>Bool</code> para qualquer tipo de <code>e</code>" }],
          ],
        }),
        C.choiceStep({
          title: "Resposta",
          body:
            "<p>As regras boas sao as que preservam o tipo esperado pela semantica operacional.</p>",
          choices: [
            { id: "Seq", html: "Sequencia" },
            { id: "&lt;", html: "Comparacao como <code>Int</code>" },
            { id: "/", html: "Divisao como <code>Bool</code>" },
            { id: "void", html: "<code>isvoid(e)</code> como <code>Bool</code>" },
          ],
          correct: ["Seq", "void"],
        }),
      ];
    },
  });

  register({
    id: "b-q03-let-init",
    num: "3",
    section: "Regras de Inferencia",
    title: "Ambiente correto na regra Let-Init",
    tags: ["let", "ambiente"],
    hubDesc: "Entender por que o inicializador do let nao enxerga o x que ele esta declarando.",
    statement:
      "Na regra de inferencia para <code>let x : T1 <- e1 in e2</code>, escolha os ambientes <code>O1</code> e <code>O2</code> corretos.",
    build: function () {
      return [
        {
          title: "Dois momentos do let",
          body:
            "<p>O inicializador <code>e1</code> e avaliado antes de <code>x</code> entrar no escopo. O corpo <code>e2</code> ja usa o ambiente estendido.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              svg.view(700, 260);
              C.box(svg, 55, 85, 170, 70, ["O", "ambiente original"], { fill: "var(--bg-soft)", stroke: "var(--border)", mono: false });
              C.box(svg, 280, 40, 170, 70, ["e1", "usa O"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: false });
              C.box(svg, 280, 150, 190, 70, ["e2", "usa O[T1/x]"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: false });
              svg.arrow(225, 120, 280, 75, { color: "var(--yellow)", strokeWidth: 3 });
              svg.arrow(225, 120, 280, 185, { color: "var(--green)", strokeWidth: 3 });
              svg.text(560, 130, "resultado: tipo de e2", { color: "var(--accent)", weight: 700, size: 16 });
            },
          },
        },
        C.choiceStep({
          title: "Escolha correta",
          body:
            "<p>O ambiente de <code>e1</code> e o original; o ambiente de <code>e2</code> adiciona <code>x:T1</code>.</p>",
          choices: [
            { id: "1", html: "<code>O1 = O[T1/x]</code>, <code>O2 = O[T1/x]</code>" },
            { id: "2", html: "<code>O1 = O[T1/x]</code>, <code>O2 = O[T2/x]</code>" },
            { id: "3", html: "<code>O1 = O</code>, <code>O2 = O[T1/x]</code>" },
            { id: "4", html: "<code>O1 = O</code>, <code>O2 = O[T2/x]</code>" },
          ],
          correct: ["3"],
        }),
      ];
    },
  });

  register({
    id: "b-q04-lub",
    num: "4",
    section: "Tipos e Heranca",
    title: "Limite superior minimo (LUB)",
    tags: ["lub", "heranca"],
    hubDesc: "Encontrar o ancestral comum mais especifico em uma hierarquia de classes.",
    statement:
      "Na hierarquia <code>Object</code> com filhos <code>Bool</code>, <code>Point</code>, " +
      "<code>Line</code> e <code>Shape</code>; <code>Shape</code> com filhos <code>Quad</code> " +
      "e <code>Circle</code>; <code>Quad -> Rect -> Square</code>, julgue cada afirmacao de " +
      "<code>lub</code> como verdadeira ou falsa.",
    build: function () {
      return [
        {
          title: "A hierarquia",
          body:
            "<p>O <code>lub(A,B)</code> e o ancestral comum mais baixo (mais especifico) &mdash; o limite " +
            "superior minimo. Suba as duas cadeias ate elas se encontrarem.</p>",
          visual: hierarchyVisual([]),
        },
        C.tableStep({
          title: "Julgando cada afirmacao",
          body:
            "<p>Cada linha traz a <b>igualdade afirmada</b> por completo e seu veredito. Quando falsa, " +
            "indicamos o LUB correto. Lembre: se um tipo e subtipo do outro, o LUB e o mais geral entre eles.</p>",
          headers: ["afirmacao", "veredito"],
          rows: [
            ["lub(Point, Quad) = Object", { html: "<span class='ok'>verdadeira</span>" }],
            ["lub(Square, Rect) = Quad", { html: "<span class='no'>falsa</span> &mdash; o resultado e Rect (Square &le; Rect)" }],
            ["lub(Square, Rect) = Rect", { html: "<span class='ok'>verdadeira</span>" }],
            ["lub(Square, Circle) = Object", { html: "<span class='no'>falsa</span> &mdash; o resultado e Shape" }],
          ],
        }),
      ];
    },
  });

  register({
    id: "b-q05-despacho-metodo",
    num: "5",
    section: "Tipos e Heranca",
    title: "Chamada de metodo e conformidade de tipos",
    tags: ["metodo", "subtipo", "cool"],
    hubDesc: "Verificar receiver, argumento e tipo de retorno em z <- x.setCenter(y).",
    statement:
      "Com <code>setCenter(p: Point): Bool</code> definido em <code>Shape</code>, escolha os tipos validos para <code>x</code>, <code>y</code> e <code>z</code>.",
    build: function () {
      return [
        {
          title: "Onde setCenter existe",
          body:
            "<p>O metodo esta em <code>Shape</code>; portanto <code>x</code> precisa ter tipo estatico <code>Shape</code> ou subtipo. O argumento deve conformar com <code>Point</code>.</p>",
          visual: hierarchyVisual(["Shape", "Circle", "Rect", "Square", "Quad", "Point"]),
        },
        C.choiceStep({
          title: "Alternativas validas",
          body:
            "<p>O retorno e <code>Bool</code>, entao atribuir a <code>z: Bool</code> e valido. As opcoes com <code>y:Object</code> ou <code>x:Object</code> falham.</p>",
          choices: [
            { id: "1", html: "<code>x: Rect; y: Object; z: Bool</code>" },
            { id: "2", html: "<code>x: Circle; y: Point; z: Bool</code>" },
            { id: "3", html: "<code>x: Object; y: Object; z: Object</code>" },
            { id: "4", html: "<code>x: Shape; y: Point; z: Bool</code>" },
          ],
          correct: ["2", "4"],
        }),
      ];
    },
  });

  register({
    id: "b-q06-estatico-dinamico",
    num: "6",
    section: "Tipos e Heranca",
    title: "Tipos estaticos e dinamicos",
    tags: ["tipo-estatico", "tipo-dinamico"],
    hubDesc: "Distinguir o tipo declarado da variavel e a classe real do objeto em tempo de execucao.",
    statement:
      "Na hierarquia <code>Animal</code> com filhos <code>Pet</code> e <code>Lion</code>, " +
      "<code>Pet</code> com filhos <code>Cat</code> e <code>Dog</code>, acompanhe " +
      "<code>w : Animal &lt;- new Animal</code>, <code>x : Animal &lt;- new Pet</code>, " +
      "<code>y : Animal &lt;- new Pet</code>, <code>z : Pet &lt;- new Pet</code> e as atribuicoes finais; " +
      "no fim, escolha os pares tipo estatico/tipo dinamico corretos para <code>w</code>, " +
      "<code>x</code>, <code>y</code> e <code>z</code>.",
    build: function () {
      return [
        {
          title: "A hierarquia de classes",
          body:
            "<p>As classes formam esta hierarquia: <code>Pet</code> e <code>Lion</code> herdam de " +
            "<code>Animal</code>; <code>Cat</code> e <code>Dog</code> herdam de <code>Pet</code>. O tipo " +
            "dinamico de uma variavel e a classe do objeto atribuido; o estatico, o tipo declarado.</p>",
          visual: {
            type: "svg",
            draw: function (svg) {
              C.classTree(svg, {
                w: 560, h: 320,
                nodes: {
                  Animal: { x: 280, y: 50 },
                  Pet: { x: 200, y: 155 },
                  Lion: { x: 400, y: 155 },
                  Cat: { x: 120, y: 260 },
                  Dog: { x: 300, y: 260 },
                },
                edges: [["Animal", "Pet"], ["Animal", "Lion"], ["Pet", "Cat"], ["Pet", "Dog"]],
              });
            },
          },
        },
        C.codeStep({
          title: "Atribuicoes relevantes",
          body:
            "<p>O tipo estatico vem da declaracao. O tipo dinamico muda quando a variavel recebe um novo objeto.</p>",
          code:
            "w : Animal <- new Animal;\n" +
            "x : Animal <- new Pet;\n" +
            "y : Animal <- new Pet;\n" +
            "z : Pet    <- new Pet;\n" +
            "w <- new Lion;\n" +
            "y <- new Dog;\n" +
            "z <- new Cat;",
          active: [5, 6, 7],
        }),
        C.tableStep({
          title: "Estado na linha 14",
          body:
            "<p>O tipo estatico de <code>y</code> nao vira <code>Pet</code>; ele continua sendo <code>Animal</code>.</p>",
          headers: ["variavel", "tipo estatico", "tipo dinamico"],
          rows: [
            ["w", "Animal", "Lion"],
            ["x", "Animal", "Pet"],
            ["y", "Animal", "Dog"],
            ["z", "Pet", "Cat"],
          ],
        }),
        C.choiceStep({
          title: "Alternativas corretas",
          body: "<p>Das opcoes do enunciado, as corretas sao <code>w Animal/Lion</code> e <code>x Animal/Pet</code>.</p>",
          choices: [
            { id: "w", html: "<code>w</code>: estatico <code>Animal</code>, dinamico <code>Lion</code>" },
            { id: "x", html: "<code>x</code>: estatico <code>Animal</code>, dinamico <code>Pet</code>" },
            { id: "y", html: "<code>y</code>: estatico <code>Pet</code>, dinamico <code>Dog</code>" },
            { id: "z", html: "<code>z</code>: estatico <code>Pet</code>, dinamico <code>Pet</code>" },
          ],
          correct: ["w", "x"],
        }),
      ];
    },
  });

  register({
    id: "b-q07-self-type",
    num: "7",
    section: "SELF_TYPE",
    title: "Relacoes de subtipos com SELF_TYPE",
    tags: ["self_type", "subtipo"],
    hubDesc: "Aplicar as regras de conformidade especiais de SELF_TYPE.",
    statement:
      "Na hierarquia dada, escolha as relacoes de subtipos verdadeiras envolvendo <code>SELF_TYPE</code>.",
    build: function () {
      return [
        C.domStep(
          "Regras praticas",
          "<p><code>SELF_TYPE_C</code> e um <b>tipo estatico</b> especial, ancorado na classe corrente " +
            "<code>C</code>: denota o tipo de <code>self</code> (<code>C</code> ou uma subclasse de " +
            "<code>C</code>) e e usado na <b>checagem</b>. A implementacao executada continua escolhida " +
            "pelo <b>despacho dinamico</b> &mdash; nao confunda com a classe dinamica do objeto.</p>",
          html([
            "<div class='ex-callout tip'><div class='ex-callout-title'>Conformidade</div>",
            "<ul>",
            "<li><code>SELF_TYPE_C <= P</code> se <code>C <= P</code>.</li>",
            "<li>Um tipo comum como <code>Square</code> nao conforma com <code>SELF_TYPE_Shape</code>.</li>",
            "<li><code>SELF_TYPE_C</code> nao vira subtipo de uma classe irma.</li>",
            "</ul></div>",
          ])
        ),
        C.tableStep({
          title: "Verificando as opcoes",
          body:
            "<p>Substitua mentalmente <code>SELF_TYPE_C</code> por algo que se comporta como uma instancia de <code>C</code> ou subtipo de <code>C</code>.</p>",
          headers: ["relacao", "veredito", "motivo"],
          rows: [
            ["Square <= SELF_TYPE_Shape", { html: "<span class='no'>falsa</span>" }, "classe comum nao e subtipo de SELF_TYPE"],
            ["SELF_TYPE_Circle <= Quad", { html: "<span class='no'>falsa</span>" }, "Circle e irma de Quad sob Shape"],
            ["SELF_TYPE_Shape <= Shape", { html: "<span class='ok'>verdadeira</span>" }, "Shape <= Shape"],
            ["SELF_TYPE_Rect <= Shape", { html: "<span class='ok'>verdadeira</span>" }, "Rect <= Quad <= Shape"],
          ],
        }),
      ];
    },
  });

  register({
    id: "b-q08-self-type-programas",
    num: "8",
    section: "SELF_TYPE",
    title: "Despacho dinamico, SELF_TYPE e sombra de let",
    tags: ["cool", "self_type", "escopo"],
    hubDesc: "Explicar a saida de um programa COOL e por que um let sombreado nao altera o x externo.",
    statement:
      "Analise dois programas COOL: no primeiro, <code>class A</code> define <code>baz() : A</code>, " +
      "<code>bar() : A</code> e <code>foo()</code>, enquanto <code>B</code> e <code>C</code> redefinem " +
      "<code>foo()</code>; determine a saida atual e a alteracao com <code>SELF_TYPE</code>. No segundo, " +
      "julgue se o <code>let</code> sombreado permite imprimir <code>2021x</code>.",
    build: function () {
      return [
        C.codeStep({
          title: "Primeiro programa: classes A, B, C e Main",
          body:
            "<p><code>B</code> e <code>C</code> herdam de <code>A</code> e <b>redefinem</b> <code>foo()</code>. " +
            "O <code>main</code> imprime tres chamadas (linhas 16-18).</p>",
          code:
            "class A {\n" +
            "  x : A;\n" +
            "  baz() : A {{ x <- new A; x; }};\n" +
            "  bar() : A { new A };\n" +
            "  foo() : String { \" COMPILADORES !\" };\n" +
            "};\n" +
            "class B inherits A {\n" +
            "  foo() : String { \" \" };\n" +
            "};\n" +
            "class C inherits A {\n" +
            "  foo() : String { \" A melhor disciplina : \" };\n" +
            "};\n" +
            "class Main {\n" +
            "  main() : Object {\n" +
            "    let io : IO <- new IO, b : B <- new B, c : C <- new C in {{\n" +
            "      io.out_string( c.baz().foo() );\n" +
            "      io.out_string( b.baz().foo() );\n" +
            "      io.out_string( b.bar().baz().foo() );\n" +
            "    }}\n" +
            "  };\n" +
            "};",
          active: [16, 17, 18],
        }),
        C.domStep(
          "Saida original (a)",
          "<p>Cada <code>baz()</code> faz <code>x &lt;- new A</code> e retorna esse <b>A</b>; entao " +
            "<code>.foo()</code> despacha sobre um <b>A</b> e as redefinicoes de <code>foo</code> em " +
            "<code>B</code>/<code>C</code> <b>nunca</b> sao alcancadas.</p>",
          "<div class='ex-callout tip'><div class='ex-callout-title'>Saida</div>" +
          "<pre class='formula'> COMPILADORES ! COMPILADORES ! COMPILADORES !</pre></div>"
        ),
        C.codeStep({
          title: "Alteracao (b): baz retorna SELF_TYPE",
          body:
            "<p>Troque as linhas 2-4 de <code>A</code> para que <code>baz()</code> devolva " +
            "<code>SELF_TYPE</code> (mantendo <code>bar()</code> em <code>A</code>). Agora " +
            "<code>c.baz()</code> e um <b>C</b> &rarr; <code>C.foo()</code> = ' A melhor disciplina : '; " +
            "<code>b.baz()</code> e um <b>B</b> &rarr; ' '; <code>b.bar().baz()</code> e um <b>A</b> " +
            "&rarr; ' COMPILADORES !'. Saida: <b>A melhor disciplina:  COMPILADORES!</b></p>",
          code:
            "x : SELF_TYPE;\n" +
            "baz() : SELF_TYPE {{ x <- new SELF_TYPE; x; }};\n" +
            "bar() : A { new A };",
          active: [1, 2],
        }),
        C.codeStep({
          title: "Segundo programa: imprimir 2021x?",
          body:
            "<p>Pode-se trocar <code>(* x &lt;- SEU CODIGO; *)</code> da linha 6 por uma atribuicao a " +
            "<code>x</code> que faca o programa imprimir <code>2021x</code>?</p>",
          code:
            "class Main {\n" +
            "  main() : Object {\n" +
            "    let io : IO <- new IO, x : Int <- 20 in {{\n" +
            "      io.out_int( x );\n" +
            "      let x : Int <- 1 in {{\n" +
            "        (* x <- SEU CODIGO; *)\n" +
            "        io.out_int( x );\n" +
            "      }};\n" +
            "      if x == 21 then io.out_string( \"x\" ) else io.out_int( x ) fi;\n" +
            "    }}\n" +
            "  };\n" +
            "};",
          active: [5, 6, 9],
        }),
        C.domStep(
          "Por que e impossivel",
          "<p>O <code>let x : Int <- 1</code> da linha 5 cria outro <code>x</code>, mais interno. A " +
            "atribuicao da linha 6 alcanca esse <code>x</code>, nao o externo inicializado com 20.</p>",
          html([
            "<div class='ex-callout danger'><div class='ex-callout-title'>Sombra de let</div>",
            "<p>Se a linha 6 fizer <code>x <- 21</code>, a linha 7 imprime 21, mas ao sair do <code>let</code> interno o <code>x</code> externo continua 20. O <code>if x == 21</code> (linha 9) sera falso e imprime 20.</p>",
            "<p>Com apenas uma atribuicao para o nome <code>x</code> dentro do escopo sombreado, nao ha como modificar o <code>x</code> externo &mdash; entao <code>2021x</code> e impossivel.</p></div>",
          ])
        ),
      ];
    },
  });
})();
