(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "exam-qa",
    num: "07",
    subject: "TP4 Compiladores",
    section: "Revisão",
    title: "Revisão de prova: perguntas e rastreios rápidos",
    type: "revisao",
    hubDesc: "Perguntas conceituais, rastreio de tipos, spot-the-error e prompts de implementação.",
    subtitle: "Checklist final para defender o design e resolver exercícios curtos.",
    statement: "Consolidar os pontos mais prováveis de cobrança sobre a análise semântica de Cool.",
    parts: [
      U.part("Perguntas conceituais", [
        {
          title: "Mapa mental do TP4",
          body:
            "<p>Quase toda pergunta sobre o TP4 cai em um destes seis blocos: grafo, features, escopo, regras de tipo, <code>SELF_TYPE</code> e recuperação de erros.</p>" +
            U.callout("tip", "Estratégia de resposta", "<p>Comece pelo lugar onde a informação está disponível: grafo na fase 1, features após coleta, identificadores no <code>ObjectEnv</code>, tipos no retorno de <code>type_check</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.examMap(svg); } }
        },
        {
          title: "Perguntas curtas prováveis",
          body:
            "<div class='tp4-qa-list'>" +
            "<div class='tp4-qa'><b>Quais são as duas fases?</b><p>Construir/validar grafo e tabelas; depois percorrer classes em ordem topológica e chamar <code>type_check</code>.</p></div>" +
            "<div class='tp4-qa'><b>O que <code>type_check</code> retorna?</b><p>Retorna o tipo inferido (<code>Symbol</code>) e faz o efeito colateral <code>set_type(result)</code>.</p></div>" +
            "<div class='tp4-qa'><b>Por que erros de grafo abortam?</b><p>Porque consultas por cadeia de pais podem entrar em loop ou acessar classe inexistente.</p></div>" +
            "<div class='tp4-qa'><b>Por que build_feature_tables tem duas passagens?</b><p>Override exige comparar com ancestrais; portanto todas as features precisam estar coletadas antes.</p></div>" +
            "<div class='tp4-qa'><b>Qual é a regra de override?</b><p>Assinatura idêntica: mesma aridade, mesmos tipos formais e mesmo retorno. Atributos nunca podem ser redefinidos.</p></div>" +
            "</div>",
          visual: { type: "svg", draw: function (svg) { D.semantPhases(svg, "phase2"); } }
        },
        {
          title: "SELF_TYPE em uma frase",
          body:
            "<p><code>SELF_TYPE</code> significa “o tipo do receptor atual”, não “a classe textual onde o método foi escrito”. Por isso ele fica simbólico e só é concretizado quando uma comparação ou lookup exige um nome de classe.</p>" +
            U.table(["Pergunta", "Resposta curta"], [
              ["<code>self</code> tem qual tipo?", "<code>SELF_TYPE</code>."],
              ["<code>new SELF_TYPE</code> retorna o quê?", "<code>SELF_TYPE</code>."],
              ["Quem conforma a <code>SELF_TYPE</code>?", "apenas <code>SELF_TYPE</code>."],
              ["<code>@SELF_TYPE</code> pode?", "não, static dispatch para SELF_TYPE é proibido."],
            ]),
          visual: { type: "svg", draw: function (svg) { D.selfType(svg, "call1"); } }
        }
      ]),
      U.part("Trace the type", [
        {
          title: "Rastreios clássicos",
          body:
            U.table(["Expressão", "Raciocínio", "Tipo"], [
              ["<code>if x then new Dog else new Cat fi</code>", "<code>lub(Dog, Cat)</code> em Animal", "<code>Animal</code>"],
              ["<code>if b then new Counter else \"s\" fi</code>", "Counter e String só encontram Object", "<code>Object</code>"],
              ["<code>(new Dog).set_name(\"r\")</code>", "retorno declarado SELF_TYPE acompanha receptor", "<code>Dog</code>"],
              ["<code>{ 1; \"two\"; true; }</code>", "block retorna a última expressão", "<code>Bool</code>"],
              ["<code>x <- 5</code>", "assign retorna o RHS", "<code>Int</code>"],
            ]) +
            "<p>Treine sempre separando <b>tipo declarado</b>, <b>tipo inferido</b> e <b>tipo resultante da expressão</b>.</p>",
          visual: { type: "svg", draw: function (svg) { D.lubTree(svg, "Animal"); } }
        },
        {
          title: "Spot the error",
          body:
            U.table(["Snippet", "Erro"], [
              ["<code>class A inherits B {}; class B inherits A {}</code>", "ciclo de herança; fatal."],
              ["atributo <code>x:Int</code> no pai e no filho", "atributo de classe herdada redefinido."],
              ["pai <code>foo(a:Int):Int</code>, filho <code>foo():Int</code>", "override incompatível."],
              ["<code>self <- 5</code>", "não se pode atribuir a <code>self</code>."],
              ["<code>1 + \"two\"</code>", "argumentos não Int."],
              ["<code>if 5 then ...</code>", "predicado de if não Bool."],
              ["<code>5 = \"five\"</code>", "comparação ilegal com tipo básico."],
              ["<code>e@SELF_TYPE.m()</code>", "static dispatch para SELF_TYPE proibido."],
              ["<code>let self : Int in ...</code>", "self não pode ser ligado em let."],
              ["formal <code>x : SELF_TYPE</code>", "formal não pode ter tipo SELF_TYPE."],
            ]),
          visual: { type: "svg", draw: function (svg) { D.fatalRecovery(svg, "recover"); } }
        }
      ]),
      U.part("Implementação", [
        {
          title: "Prompt: adicionar uma nova regra de expressão",
          body:
            "<p>Se a prova pedir para implementar ou modificar uma regra, use este esqueleto mental.</p>" +
            U.code("Symbol nova_expr_class::type_check(TypeEnv *env) {\n    Symbol a = filho1->type_check(env);\n    Symbol b = filho2->type_check(env);\n\n    Symbol result = Object;\n    if (condicao_da_regra(a, b))\n        result = tipo_correto;\n    else\n        env->ct->semant_error(env->cur_class) << \"mensagem\";\n\n    set_type(result);\n    return result;\n}") +
            U.callout("tip", "Três obrigações", "<p>Checar filhos, emitir erro no ponto da falha e sempre chamar <code>set_type</code>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.typeCheckTree(svg, "root"); } }
        },
        {
          title: "Prompt: explicar o ObjectEnv trick",
          body:
            "<p>Resposta curta: <code>ObjectEnv</code> é uma <code>SymbolTable&lt;Symbol, Entry&gt;</code>. Como <code>Symbol</code> já é <code>Entry*</code>, o valor armazenado pode ser diretamente o tipo.</p>" +
            U.code("objs.addid(name, (Entry*) type);\nSymbol declared = (Symbol) objs.lookup(name);") +
            "<p>Isso evita alocação extra e combina com a representação internada de símbolos usada pelo compilador Cool.</p>",
          visual: { type: "svg", draw: function (svg) { D.scopeStack(svg, "method"); } }
        },
        {
          title: "Prompt: onde colocar overloading ou herança múltipla?",
          body:
            U.table(["Mudança hipotética", "Onde mexer", "Consequência"], [
              ["overloading", "<code>methods_of</code> não poderia ser indexado só por nome; teria que incluir aridade/tipos formais.", "Regras de dispatch e override mudariam."],
              ["herança múltipla", "<code>parent_of</code> deixaria de ser um único pai; grafo viraria DAG.", "<code>is_subtype</code>, <code>lub</code>, ciclo e ordem topológica mudariam."],
              ["covariância de retorno", "regra de override", "precisaria permitir retorno mais específico e ajustar segurança de chamadas."],
            ]) +
            "<p>Essas respostas mostram domínio de design, não só memorização do código.</p>",
          visual: { type: "svg", draw: function (svg) { D.examMap(svg, "Features"); } }
        },
        {
          title: "Checklist final antes de entregar",
          body:
            U.table(["Item", "Verificação"], [
              ["grafo", "classes básicas, pais ilegais/indefinidos, ciclos, Main."],
              ["features", "duplicatas, self proibido, SELF_TYPE em formal, override, Main.main."],
              ["escopo", "atributos herdados, formals, let e case com enterscope/exitscope."],
              ["tipos", "todas as expressões chamam <code>set_type</code>."],
              ["SELF_TYPE", "conforms, lub, dispatch e new."],
              ["erros", "fatais abortam; recuperáveis continuam com Object."],
              ["testes", "good.cl cobre casos legais; bad.cl cobre erros recuperáveis; README explica design."],
            ]) +
            "<p>Essa lista corresponde ao que o avaliador geralmente consegue observar pelo comportamento do <code>mysemant</code> e pela AST anotada.</p>",
          visual: { type: "svg", draw: function (svg) { D.examMap(svg, "Erros"); } }
        }
      ])
    ]
  });
})();
