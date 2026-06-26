(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "selftype-conforms-lub",
    num: "05",
    subject: "TP4 Compiladores",
    section: "Tipos e herança",
    title: "SELF_TYPE, conformidade e lub",
    type: "conceitual",
    hubDesc: "A parte mais cobrada: subtipagem, SELF_TYPE simbólico e menor ancestral comum.",
    subtitle: "Como responder se S ≤ T e como combinar tipos de ramos.",
    statement: "Fixar as regras de subtipagem de Cool, o tratamento especial de SELF_TYPE e o algoritmo de least upper bound.",
    parts: [
      U.part("Subtipagem", [
        {
          title: "is_subtype: subir pela cadeia de pais",
          body:
            "<p><code>is_subtype(sub, sup)</code> é a versão simples da subtipagem, sem <code>SELF_TYPE</code>. Ela sobe de <code>sub</code> até <code>Object</code> procurando <code>sup</code>.</p>" +
            U.code("bool is_subtype(Symbol sub, Symbol sup) {\n    while (sub != No_class) {\n        if (sub == sup) return true;\n        sub = parent_of[sub];\n    }\n    return false;\n}") +
            "<p>Exemplo: <code>Poodle ≤ Dog ≤ Animal ≤ Object</code>. Logo, <code>Poodle ≤ Animal</code> é verdadeiro.</p>",
          visual: { type: "svg", draw: function (svg) { D.inheritanceTree(svg, "Poodle"); } }
        },
        {
          title: "conforms: subtipagem que entende SELF_TYPE",
          body:
            "<p>As regras de conformidade usadas no type checker precisam tratar <code>SELF_TYPE</code> de forma simbólica.</p>" +
            U.table(["sub", "sup", "Resultado"], [
              ["<code>SELF_TYPE</code>", "<code>SELF_TYPE</code>", "verdadeiro"],
              ["qualquer coisa", "<code>SELF_TYPE</code>", "falso, exceto o caso acima"],
              ["<code>SELF_TYPE</code>", "<code>T</code>", "verdadeiro se a classe corrente <code>C ≤ T</code>"],
              ["<code>S</code>", "<code>T</code>", "usa <code>is_subtype(S,T)</code>"],
            ]) +
            U.callout("warn", "Regra que cai em prova", "<p>Nada conforma a <code>SELF_TYPE</code>, exceto o próprio <code>SELF_TYPE</code>. Um <code>Dog</code> concreto não conforma a <code>SELF_TYPE</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.selfType(svg, "self"); } }
        },
        {
          title: "Por que não substituir SELF_TYPE cedo",
          body:
            "<p><code>SELF_TYPE</code> é um tipo estático especial, ancorado na classe corrente e preservado pelo tipo estático do receptor. Se você o substitui cedo pela classe atual, perde a precisão em chamadas encadeadas; a implementação executada continua sendo escolhida por despacho dinâmico.</p>" +
            U.code("class Counter {\n  inc(n:Int) : SELF_TYPE { self };\n};\n\n(new Counter).inc(1).inc(2)  -- continua sendo Counter") +
            "<p>O retorno declarado é <code>SELF_TYPE</code>, mas o tipo da chamada vira o tipo do receptor. Isso preserva a fluência de métodos.</p>",
          visual: { type: "svg", draw: function (svg) { D.selfType(svg, "call1"); } }
        }
      ]),
      U.part("lub", [
        {
          title: "lub é o menor ancestral comum",
          body:
            "<p><code>lub(a,b)</code> é o tipo mais específico que ainda é supertipo dos dois. Em uma árvore de herança, isso é o <b>menor ancestral comum</b>.</p>" +
            U.code("lub(Dog, Cat) = Animal\nlub(Poodle, Dog) = Dog\nlub(Counter, String) = Object") +
            "<p>O <code>lub</code> é usado principalmente em <code>if</code> e <code>case</code>, onde o tipo final precisa cobrir todas as alternativas.</p>",
          visual: { type: "svg", draw: function (svg) { D.lubTree(svg, "Animal"); } }
        },
        {
          title: "Algoritmo do lub",
          body:
            U.table(["Passo", "Ação"], [
              ["1", "Se ambos são <code>SELF_TYPE</code>, o resultado é <code>SELF_TYPE</code>."],
              ["2", "Concretize qualquer <code>SELF_TYPE</code> para a classe corrente apenas para o cálculo."],
              ["3", "Colete todos os ancestrais de <code>a</code> em um conjunto."],
              ["4", "Suba de <code>b</code> até encontrar o primeiro ancestral presente nesse conjunto."],
              ["5", "Se algo der errado, <code>Object</code> é fallback seguro."],
            ]) +
            U.code("anc = ancestors(a)\nwhile (b != No_class) {\n    if (anc.count(b)) return b;\n    b = parent_of[b];\n}\nreturn Object;") ,
          visual: { type: "svg", draw: function (svg) { D.lubTree(svg, "Object"); } }
        },
        {
          title: "Exemplos de rastreio de tipo",
          body:
            U.table(["Expressão", "Tipo"], [
              ["<code>if b then new Dog else new Cat fi</code>", "<code>Animal</code>"],
              ["<code>if b then new Counter else \"s\" fi</code>", "<code>Object</code>"],
              ["<code>case o of i:Int => 1; s:String => 2; esac</code>", "<code>Int</code>"],
              ["<code>{ 1; \"two\"; true; }</code>", "<code>Bool</code>"],
              ["<code>let y : Int <- 3 in y + 1</code>", "<code>Int</code>"],
            ]) +
            U.callout("tip", "Como resolver rapidamente", "<p>Para <code>if</code> e <code>case</code>, desenhe mentalmente a árvore de herança e suba dos tipos dos ramos até encontrar o primeiro ancestral comum.</p>"),
          visual: { type: "svg", draw: function (svg) { D.lubTree(svg, "Animal"); } }
        }
      ]),
      U.part("Onde SELF_TYPE aparece", [
        {
          title: "Cinco pontos que precisam tratar SELF_TYPE",
          body:
            U.table(["Local", "Regra"], [
              ["<code>object_class</code>", "o identificador <code>self</code> tem tipo <code>SELF_TYPE</code>."],
              ["<code>new SELF_TYPE</code>", "resultado é <code>SELF_TYPE</code>."],
              ["retorno de dispatch", "se a assinatura retorna <code>SELF_TYPE</code>, a chamada retorna o tipo do receptor."],
              ["static dispatch", "<code>@SELF_TYPE</code> é proibido."],
              ["<code>conforms</code> e <code>lub</code>", "resolvem simbolicamente quando precisam comparar ou juntar tipos."],
            ]) +
            "<p>Esses cinco pontos cobrem a maior parte das pegadinhas semânticas envolvendo <code>SELF_TYPE</code>.</p>",
          visual: { type: "svg", draw: function (svg) { D.selfType(svg, "class"); } }
        },
        {
          title: "valid_decl e concretize",
          body:
            "<p>Duas funções auxiliares deixam o código mais legível.</p>" +
            U.table(["Helper", "Função"], [
              ["<code>valid_decl(env,t,node)</code>", "mantém <code>SELF_TYPE</code>, aceita classes existentes e emite erro + retorna <code>Object</code> para tipo indefinido."],
              ["<code>concretize(t,cur)</code>", "quando uma classe concreta é necessária, troca <code>SELF_TYPE</code> pela classe atual."],
            ]) +
            U.code("valid_decl(SELF_TYPE) = SELF_TYPE\nvalid_decl(ClasseInexistente) = Object + erro\nconcretize(SELF_TYPE, C) = C"),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Regra mental</h4>" +
              "<p><code>SELF_TYPE</code> fica simbólico enquanto você consegue. Só concretize para caminhar no grafo ou procurar método.</p>" +
              U.chips([{text:"guardar simbólico", kind:"ok"},{text:"comparar com conforms", kind:"accent"},{text:"concretizar para lookup", kind:"warn"}]) +
              "</div>"
          }
        }
      ])
    ]
  });
})();
