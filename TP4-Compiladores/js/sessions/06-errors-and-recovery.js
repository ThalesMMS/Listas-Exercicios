(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "errors-and-recovery",
    num: "06",
    subject: "TP4 Compiladores",
    section: "Robustez",
    title: "Catálogo de erros e recuperação semântica",
    type: "pratico",
    hubDesc: "Quando abortar, quando usar Object e como testar bons/ruins.",
    subtitle: "Mensagens completas sem cascata excessiva e sem travar a compilação.",
    statement: "Organizar os erros semânticos do TP4 em fatais e recuperáveis e explicar a estratégia de testes.",
    parts: [
      U.part("Recuperação", [
        {
          title: "Máquina de erro: semant_error",
          body:
            "<p>O analisador deve emitir mensagens informativas com arquivo e linha. Na versão C++, isso passa pelos overloads de <code>ClassTable::semant_error</code>.</p>" +
            U.code("ostream& ClassTable::semant_error(Class_ c);\nostream& ClassTable::semant_error(Symbol file, tree_node* t);\nostream& ClassTable::semant_error();") +
            "<p>Cada chamada incrementa o contador de erros. O restante da regra decide se a compilação deve continuar ou abortar.</p>",
          visual: { type: "svg", draw: function (svg) { D.errorFlow(svg, "msg"); } }
        },
        {
          title: "Erros fatais: quebram a hierarquia global",
          body:
            "<p>Erros fatais são aqueles que tornam inseguro usar <code>parent_of</code> e caminhar pelo grafo.</p>" +
            U.chips([
              { text: "redefinir classe básica", kind: "danger" },
              { text: "classe duplicada", kind: "danger" },
              { text: "pai indefinido", kind: "danger" },
              { text: "herdar Int/Bool/String/SELF_TYPE", kind: "danger" },
              { text: "ciclo de herança", kind: "danger" },
              { text: "Main ausente", kind: "danger" }
            ]) +
            U.callout("danger", "Por que abortar", "<p><code>lookup_method</code>, <code>lookup_attr_type</code>, <code>is_subtype</code> e <code>lub</code> dependem de uma cadeia de pais finita e válida.</p>"),
          visual: { type: "svg", draw: function (svg) { D.fatalRecovery(svg, "fatal"); } }
        },
        {
          title: "Erros recuperáveis: reportar e continuar",
          body:
            "<p>Erros locais não precisam encerrar a análise. A regra usada no TP4 é substituir o tipo problemático por <code>Object</code> ou por outro tipo plausível e continuar.</p>" +
            U.prosCons(
              ["Um único teste ruim mostra vários erros ao aluno/avaliador.", "A AST continua anotada o suficiente para depuração."],
              ["Pode haver erros em cascata; a recuperação não promete eliminar todos."],
              ["Use <code>Object</code> como topo seguro quando uma expressão não consegue receber tipo válido."]
            ),
          visual: { type: "svg", draw: function (svg) { D.errorFlow(svg, "obj"); } }
        },
        {
          title: "Catálogo: features",
          body:
            U.table(["Grupo", "Mensagens típicas"], [
              ["atributos", "<code>'self' cannot be the name of an attribute.</code><br><code>Attribute a is multiply defined in class.</code><br><code>Attribute a is an attribute of an inherited class.</code>"],
              ["métodos", "<code>Method m is multiply defined.</code><br><code>Incompatible override of method m in class C.</code>"],
              ["formais", "<code>'self' cannot be the name of a formal parameter.</code><br><code>Formal parameter f is multiply defined.</code><br><code>Formal parameter f cannot have type SELF_TYPE.</code>"],
              ["Main", "<code>No 'main' method in class Main.</code><br><code>'main' method in class Main should have no arguments.</code>"],
            ]) +
            "<p>Esses erros são recuperáveis porque a classe e o grafo podem continuar sendo usados.</p>",
          visual: { type: "svg", draw: function (svg) { D.featurePasses(svg, "pass2"); } }
        },
        {
          title: "Catálogo: expressões",
          body:
            U.table(["Nó/tema", "Erros típicos"], [
              ["identificadores e assign", "identificador não declarado; atribuição a <code>self</code>; RHS não conforma ao tipo declarado."],
              ["dispatch", "método indefinido; classe de dispatch indefinida; aridade errada; argumento não conforma."],
              ["controle", "predicado de <code>if</code>/<code>while</code> não Bool; branch de case com tipo duplicado/indefinido/SELF_TYPE."],
              ["let", "ligar <code>self</code>; tipo indefinido; inicializador não conforma."],
              ["operadores", "argumentos não Int; <code>not</code> não Bool; comparação ilegal com tipo básico."],
              ["new", "classe indefinida em <code>new T</code>."],
            ]) +
            U.callout("tip", "Como implementar sem se perder", "<p>Em cada nó, escreva a mensagem no ponto exato em que a regra falha, defina um tipo de recuperação e finalize com <code>set_type</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.typeCheckTree(svg, "root"); } }
        }
      ]),
      U.part("Testes", [
        {
          title: "good.cl deve provar que o analisador aceita combinações legais",
          body:
            "<p>O teste positivo não precisa cobrir todas as combinações possíveis, mas deve exercitar recursos que costumam quebrar implementações.</p>" +
            U.table(["Recurso", "Exemplo de cobertura"], [
              ["herança em cadeia", "Animal → Dog → Poodle."],
              ["override válido", "mesma aridade, tipos formais e retorno."],
              ["static dispatch", "chamada para método de ancestral."],
              ["SELF_TYPE", "retorno encadeado de métodos."],
              ["controle", "if com lub, while, block, let, case."],
              ["operadores", "aritmética, comparação, igualdade, isvoid."],
            ]) +
            "<p>Um bom <code>good.cl</code> também ajuda a detectar se <code>set_type</code> está preenchendo todos os nós.</p>",
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Exemplo de intenção</h4>" +
              U.code("class Counter {\n  inc(n:Int) : SELF_TYPE { self };\n};\n\nclass Main inherits IO {\n  main() : Object {\n    (new Counter).inc(1).inc(2)\n  };\n};") +
              "</div>"
          }
        },
        {
          title: "bad.cl deve provocar erros recuperáveis variados",
          body:
            "<p>O teste negativo é mais útil quando evita erros fatais no grafo, porque assim a fase 2 roda e revela muitos erros locais.</p>" +
            U.chips([
              { text: "formal self", kind: "danger" },
              { text: "override incompatível", kind: "danger" },
              { text: "dispatch inexistente", kind: "danger" },
              { text: "if não Bool", kind: "danger" },
              { text: "1 + \"x\"", kind: "danger" },
              { text: "let self", kind: "danger" },
              { text: "case duplicado", kind: "danger" }
            ]) +
            U.callout("warn", "Estratégia", "<p>Crie testes fatais separados para ciclos/pais indefinidos. Se misturar tudo em um único <code>bad.cl</code>, a análise aborta antes de mostrar os erros recuperáveis.</p>"),
          visual: { type: "svg", draw: function (svg) { D.errorFlow(svg, "next"); } }
        },
        {
          title: "Depuração com -s",
          body:
            "<p>O flag <code>-s</code> ativa a variável de depuração semântica. Ele não imprime nada sozinho; sua implementação precisa escolher o que despejar quando <code>semant_debug</code> estiver ligado.</p>" +
            U.table(["Dump útil", "Por que ajuda"], [
              ["classes e pais", "confirma se o grafo foi instalado corretamente."],
              ["methods_of / attrs_of", "mostra assinaturas coletadas e herança esperada."],
              ["tipos inferidos", "localiza onde um <code>Object</code> de recuperação entrou."],
              ["ordem topológica", "confirma pai antes de filho."],
            ]) +
            U.code("./mysemant -s bad.cl"),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Formato sugerido de dump</h4>" +
              U.code("[ClassTable]\n  Dog inherits Animal\n  methods Dog: bark():String, set_name(String):SELF_TYPE\n\n[TypeCheck]\n  line 42: dispatch set_name returns Dog") +
              "</div>"
          }
        }
      ])
    ]
  });
})();
