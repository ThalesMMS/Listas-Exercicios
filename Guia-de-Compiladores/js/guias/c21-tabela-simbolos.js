/*
 * c21-tabela-simbolos.js — Guia: tabelas de símbolos como estrutura de compilador.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function traversalVisual() {
    return {
      type: "svg",
      draw: function (svg) {
        C.flow(svg, {
          w: 700, h: 430,
          nodes: [
            { id: "pre", x: 230, y: 24, w: 240, h: 58, lines: ["pre", "entra no nó"] },
            { id: "scope", x: 220, y: 130, w: 260, h: 76, lines: ["enter_scope()", "add_symbol(...)"], active: true },
            { id: "children", x: 220, y: 254, w: 260, h: 58, lines: ["visita filhos", "recursivamente"] },
            { id: "post", x: 220, y: 360, w: 260, h: 48, lines: ["exit_scope()", "volta ao pai"] },
          ],
          edges: [
            { from: "pre", to: "scope" },
            { from: "scope", to: "children" },
            { from: "children", to: "post" },
          ],
        });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "A estrutura que acompanha a AST",
        "Escopo não é só uma regra conceitual: o compilador precisa de uma <b>tabela de símbolos</b> " +
          "que muda enquanto a árvore sintática é percorrida.",
        "<p>Ao entrar num nó, o compilador pode abrir escopo e inserir nomes. Ao sair, remove o escopo. " +
          "Essa disciplina faz a tabela espelhar o ponto atual da <b>travessia recursiva</b> da AST.</p>"
      ),
      {
        title: "Travessia recursiva",
        body:
          "<p>Uma passagem sobre a AST costuma ter três momentos: ações ao entrar no nó, visita dos " +
          "filhos e ações ao sair. Para um <code>let</code> ou método, é nesse fluxo que entram " +
          "<code>enter_scope</code> e <code>exit_scope</code>.</p>",
        visual: traversalVisual(),
      },
      C.tableStep({
        title: "Pilha simples de símbolos",
        body: "Para declarações perfeitamente aninhadas, como muitos <code>let</code>, uma pilha simples basta.",
        headers: ["operação", "efeito"],
        rows: [
          ["add_symbol(x, info)", "empilha uma definição nova de x"],
          ["find_symbol(x)", "procura do topo para a base; acha a definição visível"],
          ["remove_symbol()", "desempilha a definição ao sair do escopo"],
        ],
      }),
      C.tableStep({
        title: "Pilha de escopos",
        body: "Métodos e blocos introduzem vários nomes no mesmo nível. A interface robusta empilha escopos inteiros.",
        headers: ["operação", "uso"],
        rows: [
          ["enter_scope()", "abre uma camada nova"],
          ["exit_scope()", "remove todos os símbolos daquela camada"],
          ["add_symbol(x, info)", "insere no escopo atual"],
          ["find_symbol(x)", "procura em todos os escopos visíveis"],
          ["check_scope(x)", "confere duplicata só no escopo atual"],
        ],
      }),
      C.domStep(
        "Por que check_scope existe",
        "<code>find_symbol</code> responde “há algum x visível?”. <code>check_scope</code> responde " +
          "“já existe x <b>neste</b> escopo?”. Essa diferença é o que permite aceitar shadowing e rejeitar " +
          "dois parâmetros com o mesmo nome.",
        C.codeHtml("enter_scope()\nadd_symbol(x, parametro)\ncheck_scope(x)  # duplicata no mesmo método -> erro\nexit_scope()")
      ),
      C.domStep(
        "Múltiplas passagens",
        "Alguns nomes podem ser usados antes de aparecerem textualmente. Classes são o exemplo clássico: " +
          "um corpo pode mencionar uma classe declarada mais abaixo.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Passes simples</div>" +
          "<p>Primeira passagem: coleta nomes de classes. Segunda: checa herança, tipos e corpos. " +
          "Preferir várias passagens simples costuma ser mais claro do que uma passagem única cheia de exceções.</p></div>"
      ),
      C.domStep(
        "Resumo",
        "A tabela de símbolos é o estado da análise semântica durante a travessia.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Use pilha simples para aninhamento básico; use <b>pilha de escopos</b> com " +
          "<code>enter_scope</code>, <code>exit_scope</code>, <code>find_symbol</code> e " +
          "<code>check_scope</code> para uma análise robusta e modular.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c21-tabela-simbolos",
    num: "Sym",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Tabelas de símbolos como estrutura de compilador",
    type: "conceitual",
    hubDesc: "Pilha simples, pilha de escopos, check_scope e passagens múltiplas sobre a AST.",
    statement:
      "Entenda a tabela de símbolos como estrutura de compilador: travessia recursiva da AST, pilha simples, " +
      "pilha de escopos, operações enter_scope/exit_scope/check_scope e a necessidade de múltiplas passagens.",
    parts: [{ label: "Guia", build: build }],
  });
})();
