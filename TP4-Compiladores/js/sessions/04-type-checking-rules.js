(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "type-checking-rules",
    num: "04",
    subject: "TP4 Compiladores",
    section: "Fase 2",
    title: "Regras de tipagem: do nó AST ao set_type",
    type: "pratico",
    hubDesc: "Percurso recursivo das expressões, dispatch, let/case, operadores e criação de objetos.",
    subtitle: "O miolo do TP4: cada expressão retorna um Symbol e anota o próprio nó.",
    statement: "Estudar o padrão comum de implementação dos métodos type_check e as regras específicas dos principais nós da AST de Cool.",
    parts: [
      U.part("Padrão geral", [
        {
          title: "O padrão de todo type_check",
          body:
            "<p>Quase toda regra de tipagem segue a mesma sequência: checar filhos, validar restrições, escolher tipo de recuperação se necessário, anotar o nó e retornar.</p>" +
            U.code("Symbol node_class::type_check(TypeEnv *env) {\n    Symbol t1 = child1->type_check(env);\n    Symbol t2 = child2->type_check(env);\n\n    if (!regra_vale(t1, t2)) {\n        env->ct->semant_error(... ) << \"mensagem\";\n        result = Object;\n    } else {\n        result = tipo_da_regra;\n    }\n    set_type(result);\n    return result;\n}") +
            "<p>O retorno permite compor regras; o <code>set_type</code> é a interface obrigatória com o gerador de código.</p>",
          visual: { type: "svg", draw: function (svg) { D.typeCheckTree(svg, "set"); } }
        },
        {
          title: "Features dirigem a checagem das expressões",
          body:
            U.table(["Feature", "Regra principal"], [
              ["atributo", "Tipo do inicializador deve conformar ao tipo declarado. Sem inicializador, <code>no_expr</code> recebe <code>No_type</code>."],
              ["método", "Formais entram em novo escopo; corpo é checado; tipo do corpo deve conformar ao retorno declarado."],
            ]) +
            U.code("attr x : T <- init;\n  init_t = init->type_check(env)\n  exige init_t <= T\n\nmethod f(a:A) : R { body };\n  entra escopo dos formals\n  body_t = body->type_check(env)\n  exige body_t <= R"),
          visual: { type: "svg", draw: function (svg) { D.typeEnv(svg, "o"); } }
        },
        {
          title: "Constantes, identificadores e atribuição",
          body:
            U.table(["Nó", "Tipo resultante", "Erro típico"], [
              ["<code>int_const</code>", "<code>Int</code>", "—"],
              ["<code>bool_const</code>", "<code>Bool</code>", "—"],
              ["<code>string_const</code>", "<code>String</code>", "—"],
              ["<code>object</code>", "tipo em <code>ObjectEnv</code>; <code>self</code> vira <code>SELF_TYPE</code>", "identificador não declarado"],
              ["<code>assign</code>", "tipo do lado direito", "atribuir a <code>self</code> ou RHS não conformar"],
            ]) +
            U.callout("warn", "Pegadinha", "<p>O tipo de <code>x <- 5</code> é <code>Int</code>, o tipo da expressão atribuída, não necessariamente o tipo declarado de <code>x</code>.</p>"),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Exemplo</h4>" +
              U.code("let x : Object <- 0 in {\n  x <- 5;     -- expressão tem tipo Int\n};") +
              "<p class='tp4-muted'>A variável aceita <code>Int</code> porque <code>Int <= Object</code>, mas a expressão de atribuição ainda retorna o tipo do RHS.</p></div>"
          }
        }
      ]),
      U.part("Dispatch", [
        {
          title: "Dispatch dinâmico: e.m(args)",
          body:
            "<p>No dispatch comum, primeiro se tipa o receptor <code>e</code>. Depois o método é procurado no tipo do receptor, subindo a cadeia de herança se necessário.</p>" +
            U.code("recv_t = e->type_check(env)\nlookup_in = concretize(recv_t, env->cur_class)\nsig = lookup_method(lookup_in, m)") +
            "<p>Os argumentos são checados contra os tipos formais da assinatura. Se o retorno declarado for <code>SELF_TYPE</code>, o tipo da chamada é o tipo do receptor.</p>",
          visual: { type: "svg", draw: function (svg) { D.dispatch(svg, "dyn"); } }
        },
        {
          title: "Static dispatch: e@T.m(args)",
          body:
            "<p>No static dispatch, o programador força a busca do método em uma classe anotada <code>T</code>. Isso exige três verificações extras.</p>" +
            U.table(["Verificação", "Erro se falhar"], [
              ["<code>T</code> não pode ser <code>SELF_TYPE</code>", "static dispatch para SELF_TYPE é proibido."],
              ["<code>T</code> precisa existir", "static dispatch para classe indefinida."],
              ["tipo do receptor deve conformar a <code>T</code>", "expressão não conforma ao tipo anotado."],
            ]) +
            "<p>A busca do método acontece em <code>T</code>, não no tipo concreto inferido do receptor.</p>",
          visual: { type: "svg", draw: function (svg) { D.dispatch(svg, "static"); } }
        },
        {
          title: "Checklist de dispatch",
          body:
            U.table(["Etapa", "Checagem"], [
              ["1", "Tipar o receptor e concretizar <code>SELF_TYPE</code> apenas para lookup."],
              ["2", "Verificar se a classe de lookup existe."],
              ["3", "Encontrar <code>MethodSig</code>; se não existe, erro e retorno <code>Object</code>."],
              ["4", "Comparar aridade."],
              ["5", "Checar cada argumento: <code>actual_i <= formal_i</code>."],
              ["6", "Calcular retorno: <code>SELF_TYPE</code> declarado vira tipo do receptor; senão retorna tipo declarado."],
            ]) +
            U.callout("tip", "Implementação limpa", "<p>Use um helper comum para dispatch dinâmico e estático. Eles diferem só em como escolhem a classe de lookup e nas checagens extras do <code>@T</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.dispatch(svg, "lookup"); } }
        }
      ]),
      U.part("Controle e escopo", [
        {
          title: "if, while e block",
          body:
            U.table(["Nó", "Regra"], [
              ["<code>if pred then a else b fi</code>", "<code>pred</code> deve ser <code>Bool</code>; resultado é <code>lub(type(a), type(b))</code>."],
              ["<code>while pred loop body pool</code>", "<code>pred</code> deve ser <code>Bool</code>; corpo é checado; resultado sempre <code>Object</code>."],
              ["<code>{ e1; e2; ...; en; }</code>", "checa todas as expressões; resultado é o tipo da última."],
            ]) +
            U.code("if b then new Dog else new Cat fi  ⇒ Animal\n{ 1; \"texto\"; true; }             ⇒ Bool\nwhile b loop e pool                 ⇒ Object"),
          visual: { type: "svg", draw: function (svg) { D.lubTree(svg, "Animal"); } }
        },
        {
          title: "case: um escopo por ramo e lub dos corpos",
          body:
            "<p>O <code>case</code> tipa a expressão analisada e depois cada ramo separadamente. O identificador do ramo só existe dentro do corpo daquele ramo.</p>" +
            U.table(["Checagem", "Regra"], [
              ["tipo declarado do ramo", "não pode ser <code>SELF_TYPE</code> e precisa existir."],
              ["tipos de ramos", "não podem repetir o mesmo tipo."],
              ["escopo", "entra escopo, vincula <code>x:T</code>, checa corpo, sai escopo."],
              ["resultado", "<code>lub</code> de todos os corpos."],
            ]) +
            U.code("case e of\n  i : Int    => 1;\n  s : String => 2;\nesac\n-- resultado: lub(Int, Int) = Int"),
          visual: { type: "svg", draw: function (svg) { D.scopeStack(svg, "case"); } }
        },
        {
          title: "let: inicializador antes do novo binding",
          body:
            "<p>No <code>let</code>, o inicializador é checado antes de inserir o identificador no escopo. Isso evita que o inicializador enxergue a variável que ainda está sendo definida.</p>" +
            U.code("let x : T <- init in body\n  init_t = init->type_check(env)\n  exige init_t <= T\n  enterscope(); addid(x,T);\n  body_t = body->type_check(env);\n  exitscope();\n  resultado = body_t") +
            U.callout("danger", "Restrição", "<p><code>self</code> não pode ser ligado em um <code>let</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.scopeStack(svg, "let"); } }
        }
      ]),
      U.part("Operadores e criação", [
        {
          title: "Aritmética e comparações",
          body:
            U.table(["Expressão", "Exigência", "Tipo resultante"], [
              ["<code>e1 + e2</code>, <code>-</code>, <code>*</code>, <code>/</code>", "ambos <code>Int</code>", "<code>Int</code>"],
              ["<code>~e</code>", "<code>e : Int</code>", "<code>Int</code>"],
              ["<code>e1 < e2</code>, <code>e1 <= e2</code>", "ambos <code>Int</code>", "<code>Bool</code>"],
              ["<code>not e</code>", "<code>e : Bool</code>", "<code>Bool</code>"],
            ]) +
            U.code("1 + 2      ⇒ Int\n1 < 2      ⇒ Bool\nnot true   ⇒ Bool\n1 + \"x\"   ⇒ erro: non-Int arguments"),
          visual: {
            type: "dom",
            html:
              U.table(["Operador", "Erro de prova comum"], [
                ["+ - * /", "esquecer que ambos os lados precisam ser Int."],
                ["< <=", "retornar Int por reaproveitar helper aritmético; o certo é Bool."],
                ["not", "aceitar Int; o certo é exigir Bool."],
              ])
          }
        },
        {
          title: "Igualdade tem regra especial para tipos básicos",
          body:
            "<p>A comparação <code>=</code> é mais permissiva para objetos não básicos, mas é rígida para <code>Int</code>, <code>Bool</code> e <code>String</code>.</p>" +
            U.table(["Comparação", "Resultado"], [
              ["<code>1 = 2</code>", "OK: ambos <code>Int</code>."],
              ["<code>\"a\" = \"b\"</code>", "OK: ambos <code>String</code>."],
              ["<code>1 = \"1\"</code>", "erro: comparação ilegal com tipo básico."],
              ["<code>new A = new B</code>", "OK semanticamente se A/B não são básicos; comparação por identidade em runtime."],
            ]) +
            "<p>O tipo resultante da igualdade, com ou sem erro recuperável, é <code>Bool</code>.</p>",
          visual: {
            type: "dom",
            html:
              "<div class='tp4-cardlet'><h4>Regra condensada</h4>" +
              U.code("if (left in {Int,Bool,String} || right in {Int,Bool,String})\n    exige left == right;\nresult = Bool;") +
              "</div>"
          }
        },
        {
          title: "new, isvoid e no_expr",
          body:
            U.table(["Nó", "Regra"], [
              ["<code>new T</code>", "se <code>T</code> existe, resultado <code>T</code>."],
              ["<code>new SELF_TYPE</code>", "resultado <code>SELF_TYPE</code>."],
              ["<code>isvoid e</code>", "checa <code>e</code>; resultado <code>Bool</code>."],
              ["<code>no_expr</code>", "tipo especial <code>No_type</code>, usado em inicializadores ausentes."],
            ]) +
            U.callout("tip", "Por que No_type", "<p><code>no_expr</code> não é uma expressão real do programa; é um placeholder da AST. Ele não deve forçar erro de conformidade quando não há inicializador.</p>"),
          visual: { type: "svg", draw: function (svg) { D.selfType(svg, "new"); } }
        }
      ])
    ]
  });
})();
