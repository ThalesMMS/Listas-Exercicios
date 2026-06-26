(function () {
  "use strict";
  var TP4 = window.TP4;
  var U = TP4.util;
  var D = TP4.D;

  TP4.registry.add({
    id: "overview",
    num: "00",
    subject: "TP4 Compiladores",
    section: "Visão Geral",
    title: "Visão geral do TP4: analisador semântico",
    type: "conceitual",
    hubDesc: "O que a fase semântica recebe, valida, anota e entrega ao gerador de código.",
    subtitle: "Da AST produzida pelo parser até a AST anotada com tipos.",
    statement: "Entender a arquitetura global do TP4: duas fases, ambiente de tipos, anotação da AST e política de recuperação de erros.",
    parts: [
      U.part("Panorama", [
        {
          title: "O papel do PA4/TP4",
          body:
            "<p>O TP4 implementa a <b>análise semântica estática</b> da linguagem Cool. A entrada é a AST criada pelo parser; a saída, para programas corretos, é a <b>mesma AST anotada com tipos</b>.</p>" +
            "<p>Isso significa que cada nó de expressão precisa receber um tipo inferido por <code>set_type()</code>. Se o programa viola a linguagem, o analisador emite mensagens de erro; se a hierarquia de classes for válida, ele tenta continuar para mostrar o máximo possível de problemas.</p>" +
            U.callout("tip", "Ideia de prova", "<p>Não basta responder “verifica tipos”. O núcleo do TP4 é: <b>construir tabelas globais</b>, <b>gerenciar escopos</b>, <b>checar regras de tipagem</b> e <b>decorar a AST</b>.</p>"),
          visual: { type: "svg", draw: function (svg) { D.pipeline(svg, "semant"); } }
        },
        {
          title: "As duas fases do analisador",
          body:
            "<p>A solução fica mais robusta quando separa o trabalho em duas fases.</p>" +
            U.table(["Fase", "O que faz", "Por que vem nessa ordem"], [
              ["1", "Instala classes básicas, instala classes do usuário, valida o grafo e constrói tabelas de features.", "Sem grafo correto, consultas como <code>lookup_method</code>, <code>conforms</code> e <code>lub</code> podem entrar em loop ou consultar pais inexistentes."],
              ["2", "Percorre classes em ordem topológica, entra escopos, checa features e expressões com <code>type_check</code>.", "Agora a hierarquia e as assinaturas já estão disponíveis para as regras de tipo."],
            ]) +
            U.code("program_class::semant()\n ├─ initialize_constants()\n ├─ new ClassTable(classes)      // fase 1\n └─ se grafo OK: type_check      // fase 2"),
          visual: { type: "svg", draw: function (svg) { D.semantPhases(svg, "gate"); } }
        },
        {
          title: "A ideia mais importante: type_check em cada nó",
          body:
            "<p>Cada subclasse de <code>Expression</code> implementa uma função com o mesmo padrão:</p>" +
            U.code("Symbol expr_class::type_check(TypeEnv *env) {\n    // 1. checa filhos recursivamente\n    // 2. aplica a regra semântica do nó\n    // 3. escolhe o tipo resultante\n    set_type(result);\n    return result;\n}") +
            "<p>O <code>TypeEnv</code> desce pela árvore carregando o contexto; os tipos inferidos sobem como resultado das chamadas recursivas.</p>",
          visual: { type: "svg", draw: function (svg) { D.typeCheckTree(svg, "env"); } }
        },
        {
          title: "Por que alguns erros abortam e outros não",
          body:
            "<p>O TP4 diferencia erros que quebram a estrutura global daqueles que são locais.</p>" +
            U.prosCons(
              ["Erros locais recebem um tipo de recuperação, geralmente <code>Object</code>, e a checagem continua."],
              ["Erros no grafo de herança abortam após a fase 1, porque qualquer caminhada por pais deixa de ser confiável."],
              ["Regra prática: se o erro compromete <code>parent_of</code>, é fatal; se compromete só uma expressão ou declaração, recupere e continue."]
            ),
          visual: { type: "svg", draw: function (svg) { D.fatalRecovery(svg, "recover"); } }
        },
        {
          title: "Arquivos e comandos que importam",
          body:
            "<p>Na versão C++ do TP4, a implementação se concentra em poucos arquivos.</p>" +
            U.table(["Arquivo", "Papel no TP4"], [
              ["<code>semant.cc</code>", "Implementação principal: <code>ClassTable</code>, checagens de grafo, tabelas de features e todos os <code>type_check</code>."],
              ["<code>semant.h</code>", "Declarações auxiliares: <code>ClassTable</code>, <code>MethodSig</code>, <code>ObjectEnv</code>, tipos de ambiente."],
              ["<code>cool-tree.h</code>", "Declarações extras adicionadas aos nós AST, como <code>type_check(TypeEnv*)</code> e getters."],
              ["<code>good.cl</code> / <code>bad.cl</code>", "Casos positivos e negativos para demonstrar cobertura semântica."],
              ["<code>README</code>", "Justificativa de design, estrutura do código e estratégia de testes."],
            ]) +
            U.code("make semant\n./mysemant good.cl\n./mysemant bad.cl\n./mysemant -s bad.cl   # ativa semant_debug"),
          visual: {
            type: "dom",
            html:
              "<div class='tp4-two-col'>" +
              "<div class='tp4-cardlet'><h4>Entrada</h4><p>AST sem tipos, classes, features e expressões.</p><div class='tp4-formula'>parser → program_class</div></div>" +
              "<div class='tp4-cardlet'><h4>Saída</h4><p>AST com <code>Expression.type</code> preenchido.</p><div class='tp4-formula'>semant → dump_with_types</div></div>" +
              "<div class='tp4-cardlet'><h4>Testes bons</h4><p>Devem compilar semanticamente e exercitar combinações legais.</p></div>" +
              "<div class='tp4-cardlet'><h4>Testes ruins</h4><p>Devem produzir mensagens informativas sem quebrar a recuperação.</p></div>" +
              "</div>"
          }
        }
      ])
    ]
  });
})();
