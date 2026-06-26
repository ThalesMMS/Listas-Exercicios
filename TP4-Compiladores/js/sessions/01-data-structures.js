(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "data-structures",
    num: "01",
    subject: "TP4 Compiladores",
    section: "Projeto da implementação",
    title: "Estruturas centrais: ClassTable, MethodSig, TypeEnv e ObjectEnv",
    type: "pratico",
    hubDesc: "As tabelas e ambientes que carregam toda a informação semântica.",
    subtitle: "Quem preenche, quem consulta e por que cada estrutura existe.",
    statement: "Mapear a arquitetura de dados usada pelo analisador semântico e relacioná-la com o julgamento formal O, M, C ⊢ e : T.",
    parts: [
      U.part("Estruturas", [
        {
          title: "ClassTable é a fonte de verdade global",
          body:
            "<p>A <code>ClassTable</code> é construída uma vez na fase 1 e responde às perguntas globais da fase 2: quais classes existem, quem é pai de quem, onde está um método, qual atributo é herdado, se um tipo conforma a outro e qual é o <code>lub</code>.</p>" +
            U.code("std::map<Symbol, Class_> class_by_name;\nstd::map<Symbol, Symbol> parent_of;\nstd::map<Symbol, std::map<Symbol, MethodSig> > methods_of;\nstd::map<Symbol, std::map<Symbol, Symbol> > attrs_of;") +
            "<p>O ponto didático: <code>type_check</code> não deveria percorrer o programa inteiro de novo procurando declarações. Ele consulta a <code>ClassTable</code>.</p>",
          visual: { type: "svg", draw: function (svg) { D.classTable(svg, "queries"); } }
        },
        {
          title: "O que fica em cada mapa",
          body:
            U.table(["Mapa", "Chave", "Valor", "Usado para"], [
              ["<code>class_by_name</code>", "nome da classe", "nó AST <code>Class_</code>", "verificar declaração, localizar arquivo/linha e iterar classes."],
              ["<code>parent_of</code>", "classe", "classe pai", "subtipagem, ciclos, <code>lub</code> e lookup herdado."],
              ["<code>methods_of</code>", "classe + método", "<code>MethodSig</code>", "override e dispatch."],
              ["<code>attrs_of</code>", "classe + atributo", "tipo declarado", "escopo de atributos e lookup herdado."],
            ]) +
            U.callout("tip", "Detalhe de implementação", "<p><code>Symbol</code> é um ponteiro internado (<code>Entry*</code>). Quando dois símbolos vieram de <code>idtable.add_string</code>, igualdade por ponteiro é suficiente.</p>"),
          visual: { type: "svg", draw: function (svg) { D.classTable(svg, "classes"); } }
        },
        {
          title: "MethodSig: assinatura compacta de um método",
          body:
            "<p><code>MethodSig</code> concentra as informações que duas partes do analisador precisam comparar: a regra de override e a regra de dispatch.</p>" +
            U.code("struct MethodSig {\n  std::vector<Symbol> formal_types;\n  Symbol return_type;\n  Class_ defining_class;\n};") +
            U.table(["Campo", "Por que existe"], [
              ["<code>formal_types</code>", "Permite checar aridade e conformidade de cada argumento."],
              ["<code>return_type</code>", "Define o tipo da chamada; se for <code>SELF_TYPE</code>, o retorno acompanha o receptor."],
              ["<code>defining_class</code>", "Ajuda em mensagens e em decisões de projeto sobre onde a assinatura foi declarada."],
            ]),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Exemplo de assinatura</h4>" +
              "<div class='tp4-formula'>IO.out_string(x : String) : SELF_TYPE</div>" +
              U.table(["formal_types", "return_type", "defining_class"], [["[String]", "SELF_TYPE", "IO"]]) +
              "<p class='tp4-muted'>No dispatch, o argumento precisa conformar a <code>String</code>. O retorno vira o tipo do receptor.</p></div>"
          }
        },
        {
          title: "TypeEnv é o O, M, C do manual",
          body:
            "<p>As regras formais de Cool costumam aparecer como <code>O, M, C ⊢ e : T</code>. A implementação junta isso em um ponteiro <code>TypeEnv*</code> passado para todo <code>type_check</code>.</p>" +
            U.code("struct TypeEnv {\n  ClassTable *ct;     // M + consultas globais\n  Class_ cur_class;   // C, classe corrente\n  ObjectEnv objs;     // O, escopos de identificadores\n};") +
            "<p><code>ct</code> funciona como o ambiente de métodos e classes; <code>objs</code> é o ambiente de objetos; <code>cur_class</code> resolve <code>SELF_TYPE</code>.</p>",
          visual: { type: "svg", draw: function (svg) { D.typeEnv(svg, "flow"); } }
        },
        {
          title: "ObjectEnv: tabela de símbolos com escopos",
          body:
            "<p><code>ObjectEnv</code> guarda nomes de objetos e seus tipos declarados. Ele é uma pilha de escopos: classe, método, <code>let</code> e ramo de <code>case</code>.</p>" +
            U.code("typedef SymbolTable<Symbol, Entry> ObjectEnv;\n\nobjs.enterscope();\nobjs.addid(name, (Entry*) type);\nSymbol t = (Symbol) objs.lookup(name);\nobjs.exitscope();") +
            U.callout("tip", "Truque do SymbolTable", "<p>Como <code>Symbol</code> já é <code>Entry*</code>, o payload da tabela pode ser diretamente o símbolo do tipo. Não precisa criar uma struct para o valor.</p>"),
          visual: { type: "svg", draw: function (svg) { D.scopeStack(svg, "let"); } }
        },
        {
          title: "Atributos entram no escopo de pai para filho",
          body:
            "<p>Ao checar uma classe, os atributos herdados precisam estar visíveis antes dos atributos próprios. A função típica usa recursão no pai primeiro.</p>" +
            U.code("enter_attribute_scope(env, parent);\nfor each attr of current_class:\n    env->objs.addid(attr.name, attr.type);") +
            "<p>Mesmo que a linguagem proíba redefinir atributo herdado, inserir na ordem pai→filho reproduz corretamente a visibilidade e facilita a explicação do ambiente.</p>",
          visual: { type: "svg", draw: function (svg) { D.scopeStack(svg, "class"); } }
        }
      ])
    ]
  });
})();
