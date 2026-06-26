(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "inheritance-graph",
    num: "02",
    subject: "TP4 Compiladores",
    section: "Fase 1",
    title: "Grafo de herança: construir, validar e ordenar",
    type: "pratico",
    hubDesc: "Instala classes básicas, detecta pais inválidos, ciclos e ausência de Main.",
    subtitle: "Por que o grafo precisa estar correto antes da checagem de tipos.",
    statement: "Explicar as checagens fatais da hierarquia de classes em Cool e a ordem topológica usada na fase 2.",
    parts: [
      U.part("Grafo", [
        {
          title: "Instalar as classes básicas",
          body:
            "<p>A primeira tarefa da <code>ClassTable</code> é inserir as classes básicas na hierarquia. Elas não vêm do programa do usuário, mas precisam existir para que o lookup semântico funcione.</p>" +
            U.table(["Classe", "Pai", "Exemplos de features"], [
              ["Object", "No_class", "<code>abort()</code>, <code>type_name()</code>, <code>copy(): SELF_TYPE</code>"],
              ["IO", "Object", "<code>out_string</code>, <code>out_int</code>, <code>in_string</code>, <code>in_int</code>"],
              ["Int", "Object", "slot primitivo"],
              ["Bool", "Object", "slot primitivo"],
              ["String", "Object", "<code>length</code>, <code>concat</code>, <code>substr</code>"],
            ]) +
            "<p>Essas classes são nós sintéticos da AST: existem para a semântica, não porque o usuário as escreveu.</p>",
          visual: { type: "svg", draw: function (svg) { D.inheritanceTree(svg, "Object"); } }
        },
        {
          title: "Instalar classes do usuário com rejeições imediatas",
          body:
            "<p>Depois das básicas, o analisador instala as classes do programa. Alguns nomes não podem ser aceitos.</p>" +
            U.table(["Erro", "Motivo"], [
              ["classe chamada <code>SELF_TYPE</code>", "<code>SELF_TYPE</code> é um tipo especial, não uma classe definível."],
              ["redefinir <code>Object</code>, <code>IO</code>, <code>Int</code>, <code>Bool</code> ou <code>String</code>", "Classes básicas são reservadas."],
              ["duas classes com o mesmo nome", "A tabela <code>class_by_name</code> ficaria ambígua."],
            ]) +
            U.callout("danger", "Recuperação aqui", "<p>A classe inválida não deve ser instalada. Se fosse instalada, poderia mascarar o erro ou corromper a hierarquia.</p>"),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Exemplo de rejeição</h4>" +
              U.code("class Int inherits IO { };      -- redefine classe básica\nclass A { };\nclass A { };                     -- duplicada") +
              "<p class='tp4-muted'>Esses erros são tratados na instalação das classes do usuário, antes da validação profunda do grafo.</p></div>"
          }
        },
        {
          title: "Pais inválidos e pais indefinidos",
          body:
            "<p>Em Cool, algumas classes básicas não podem ser herdadas. Também é erro herdar de uma classe que não existe.</p>" +
            U.table(["Caso", "Mensagem conceitual", "Por que é fatal"], [
              ["<code>class A inherits Int</code>", "A não pode herdar de Int", "A hierarquia viola uma regra estrutural da linguagem."],
              ["<code>class A inherits SELF_TYPE</code>", "A não pode herdar de SELF_TYPE", "SELF_TYPE depende da classe corrente; não é nó do grafo."],
              ["<code>class A inherits B</code>, sem B", "pai indefinido", "<code>parent_of[A]</code> aponta para algo inexistente."],
            ]) +
            "<p>Esses erros impedem a fase 2 porque subtipagem e <code>lub</code> caminham pela cadeia de pais.</p>",
          visual: { type: "svg", draw: function (svg) { D.inheritanceTree(svg, "Int"); } }
        },
        {
          title: "Detecção de ciclos",
          body:
            "<p>A checagem de ciclos pode ser feita caminhando para cima pelos ponteiros <code>parent_of</code>. Cada caminhada mantém um conjunto <code>visiting</code>.</p>" +
            U.code("while (cls != No_class) {\n    if (visiting.count(cls))\n        reporta ciclo;\n    visiting.insert(cls);\n    cls = parent_of[cls];\n}") +
            "<p>Se uma classe reaparece durante a mesma caminhada, a hierarquia não é árvore: qualquer consulta que subisse pelos pais poderia nunca terminar.</p>",
          visual: { type: "svg", draw: function (svg) { D.cycle(svg, "A"); } }
        },
        {
          title: "Main precisa existir",
          body:
            "<p>Além da hierarquia ser acíclica, o programa precisa ter uma classe <code>Main</code>. A checagem do método <code>main</code> vem depois, nas tabelas de features; aqui o requisito é apenas a existência da classe.</p>" +
            U.callout("warn", "Separação didática", "<p><code>Class Main is not defined</code> é erro de grafo/estrutura global. <code>No 'main' method in class Main</code> é erro de feature.</p>") +
            "<p>Essa separação ajuda a manter claro <b>quando</b> a informação necessária já está disponível.</p>",
          visual: {
            type: "dom",
            html:
              "<div class='tp4-two-col'>" +
              "<div class='tp4-cardlet'><h4>Fase 1</h4><div class='tp4-formula'>class Main existe?</div><p>Sem a classe, o programa não tem ponto de entrada.</p></div>" +
              "<div class='tp4-cardlet'><h4>Features</h4><div class='tp4-formula'>Main.main() existe e não tem argumentos?</div><p>Requer a tabela de métodos da classe Main.</p></div>" +
              "</div>"
          }
        },
        {
          title: "Ordem topológica para a fase 2",
          body:
            "<p>Com o grafo validado, o analisador pode percorrer as classes em ordem de pai para filho. Uma BFS a partir de <code>Object</code> basta se você construiu uma lista de filhos para cada pai.</p>" +
            U.code("classes_in_order():\n  Object, IO, Int, Bool, String, Animal, Dog, Cat, Poodle, ...") +
            "<p>Essa ordem combina com a regra de escopo de atributos: atributos herdados entram antes dos atributos próprios, e métodos herdados já são consultáveis quando o filho é checado.</p>",
          visual: { type: "svg", draw: function (svg) { D.inheritanceTree(svg, "Poodle"); } }
        }
      ])
    ]
  });
})();
