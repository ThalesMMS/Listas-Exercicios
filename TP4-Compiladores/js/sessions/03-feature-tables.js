(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "feature-tables",
    num: "03",
    subject: "TP4 Compiladores",
    section: "Fase 1",
    title: "Tabelas de features e regras de override",
    type: "pratico",
    hubDesc: "Como coletar atributos/métodos e validar regras locais e herdadas.",
    subtitle: "Por que build_feature_tables() usa duas passagens.",
    statement: "Mostrar como a implementação coleta atributos e métodos, depois compara com ancestrais para aplicar as restrições de Cool.",
    parts: [
      U.part("Coleta e validação", [
        {
          title: "Por que duas passagens",
          body:
            "<p>Não dá para validar override de forma confiável antes de coletar as features de todas as classes. Um pai pode aparecer depois do filho no arquivo de entrada.</p>" +
            U.table(["Passagem", "O que faz", "Exemplos de erro"], [
              ["1 — local", "Coleta features declaradas em cada classe.", "método duplicado na mesma classe, formal duplicado, atributo duplicado local."],
              ["2 — herança", "Caminha pelos ancestrais e compara nomes/assinaturas.", "atributo herdado redefinido, override incompatível, Main.main inválido."],
            ]) +
            "<p>O resultado é uma <code>methods_of</code> e uma <code>attrs_of</code> coerentes para a fase de tipos.</p>",
          visual: { type: "svg", draw: function (svg) { D.featurePasses(svg, "pass1"); } }
        },
        {
          title: "Passagem 1: métodos",
          body:
            "<p>Ao encontrar um método, o analisador monta um <code>MethodSig</code> e faz checagens locais.</p>" +
            U.table(["Checagem", "Regra"], [
              ["nome duplicado na classe", "não pode haver dois métodos com o mesmo nome na mesma classe."],
              ["formal chamado <code>self</code>", "<code>self</code> é reservado."],
              ["formal duplicado", "um método não pode ter dois parâmetros com o mesmo nome."],
              ["formal com <code>SELF_TYPE</code>", "formal não pode ter tipo <code>SELF_TYPE</code>."],
              ["tipo de formal/retorno indefinido", "todo tipo declarado deve existir; retorno pode ser <code>SELF_TYPE</code>."],
            ]) +
            U.code("methods_of[C][m] = MethodSig {\n  formal_types = [T1, T2, ...],\n  return_type = R,\n  defining_class = C\n};"),
          visual: { type: "svg", draw: function (svg) { D.featurePasses(svg, "pass1"); } }
        },
        {
          title: "Passagem 1: atributos",
          body:
            "<p>Atributos também têm regras locais antes de comparar com ancestrais.</p>" +
            U.table(["Checagem", "Regra"], [
              ["atributo chamado <code>self</code>", "proibido: <code>self</code> não é um nome de atributo."],
              ["atributo duplicado na classe", "não pode haver dois atributos com o mesmo nome na mesma classe."],
              ["tipo indefinido", "a declaração precisa apontar para classe existente ou <code>SELF_TYPE</code>, conforme permitido pela linguagem."],
            ]) +
            "<p>Na segunda fase de features, a mesma tabela será usada para verificar se algum atributo foi redefinido por uma subclasse.</p>",
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Exemplo local</h4>" +
              U.code("class A {\n  x : Int;\n  x : String;  -- erro: atributo duplicado na classe\n};") +
              "<p class='tp4-muted'>A checagem é local: não precisa olhar ancestrais para encontrar esse erro.</p></div>"
          }
        },
        {
          title: "Atributos herdados não podem ser redefinidos",
          body:
            "<p>Cool proíbe redefinir atributo herdado, mesmo se o tipo for idêntico.</p>" +
            U.code("class A { x : Int; };\nclass B inherits A { x : Int; };  -- erro") +
            U.callout("warn", "Diferença importante", "<p>Métodos podem ser sobrescritos com assinatura idêntica. Atributos não podem ser sobrescritos de forma alguma.</p>"),
          visual: { type: "svg", draw: function (svg) { D.override(svg, "parent"); } }
        },
        {
          title: "Override de método exige assinatura idêntica",
          body:
            "<p>Uma subclasse pode redefinir um método, mas só com a <b>mesma aridade</b>, os <b>mesmos tipos formais</b> na mesma ordem e o <b>mesmo tipo de retorno</b>.</p>" +
            U.table(["Pai", "Filho", "Resultado"], [
              ["<code>foo(x:Int): String</code>", "<code>foo(x:Int): String</code>", "OK"],
              ["<code>foo(x:Int): String</code>", "<code>foo(): String</code>", "erro: aridade diferente"],
              ["<code>foo(x:Int): String</code>", "<code>foo(x:Object): String</code>", "erro: tipo formal diferente"],
              ["<code>foo(x:Int): String</code>", "<code>foo(x:Int): Object</code>", "erro: retorno diferente"],
            ]) +
            "<p>Não há sobrecarga por assinatura em Cool. Mesmo nome em subclasse é tentativa de override.</p>",
          visual: { type: "svg", draw: function (svg) { D.override(svg, "type"); } }
        },
        {
          title: "Checagem de Main.main",
          body:
            "<p>No final da construção das tabelas de features, o analisador já sabe quais métodos existem em <code>Main</code>. Então aplica a regra do ponto de entrada:</p>" +
            U.code("class Main {\n  main() : Object { ... };\n};") +
            U.table(["Erro", "Condição"], [
              ["<code>No 'main' method in class Main.</code>", "classe Main existe, mas método <code>main</code> não."],
              ["<code>'main' method in class Main should have no arguments.</code>", "<code>main</code> existe, mas tem parâmetros formais."],
            ]),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-two-col'>" +
              "<div class='tp4-cardlet'><h4>OK</h4>" + U.code("class Main {\n  main() : Object { 0 };\n};") + "</div>" +
              "<div class='tp4-cardlet'><h4>Erro</h4>" + U.code("class Main {\n  main(x : Int) : Object { x };\n};") + "</div>" +
              "</div>"
          }
        },
        {
          title: "Lookup dinâmico em vez de tabelas achatadas",
          body:
            "<p>Uma decisão de projeto possível é não copiar todos os métodos/atributos herdados para cada filho. Em vez disso, <code>lookup_method</code> e <code>lookup_attr_type</code> caminham pela cadeia de pais em tempo de consulta.</p>" +
            U.prosCons(
              ["Implementação mais simples.", "Mensagens de erro continuam associadas à classe onde a feature foi definida.", "Evita duplicar informação nas tabelas."],
              ["Cada lookup pode caminhar por ancestrais; em Cool isso é aceitável para o TP4."],
              ["O importante é o grafo estar validado antes. Sem isso, o lookup herdado não é seguro."]
            ),
          visual: { type: "svg", draw: function (svg) { D.classTable(svg, "methods"); } }
        }
      ])
    ]
  });
})();
