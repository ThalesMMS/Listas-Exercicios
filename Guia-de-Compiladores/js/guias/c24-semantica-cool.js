/*
 * c24-semantica-cool.js — Guia: regras operacionais concretas de COOL.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "A semântica concreta de COOL",
        "Depois do julgamento geral, cada forma da linguagem ganha uma regra: constantes, identificadores, " +
          "atribuição, blocos, controle de fluxo, <code>let</code>, <code>new T</code> e dispatch dinâmico.",
        C.codeHtml("so, E, S ⊢ e : v, S'\n# cada sintaxe de COOL explica como calcular v e S'")
      ),
      C.tableStep({
        title: "Expressões sem efeito colateral",
        body: "As formas simples leem contexto, mas não mudam a store.",
        headers: ["forma", "valor", "store"],
        rows: [
          ["constantes", "Int(3), Bool(true), String(...)", "inalterada"],
          ["self", "o próprio so", "inalterada"],
          ["identificadores", "S[E(x)]", "inalterada"],
        ],
      }),
      C.tableStep({
        title: "Ordem e efeitos",
        body: "A store força a ordem: cada subexpressão roda na store produzida pela anterior.",
        headers: ["forma", "regra essencial"],
        rows: [
          ["atribuição", "avalia RHS, depois grava no local do identificador"],
          ["blocos", "E1; E2; ...; En encadeiam stores; o valor é En"],
          ["if", "avalia predicado; só o ramo escolhido roda"],
          ["while", "repete predicado/corpo; ao terminar retorna void"],
        ],
      }),
      C.domStep(
        "let cria local fresco",
        "<code>let x : T <- init in body</code> avalia o inicializador, cria um local novo, estende o " +
          "ambiente e avalia o corpo nesse novo escopo.",
        C.codeHtml("init -> v, S1\nLx = newloc(S1)\nE' = E[x -> Lx]\nS2 = S1[Lx -> v]\nbody avalia em E', S2")
      ),
      C.domStep(
        "new T inicializa pela herança",
        "<code>new T</code> não é só reservar bytes. A regra aloca atributos, coloca valores padrão e avalia " +
          "inicializadores em ordem de herança: ancestrais primeiro, subclasse depois.",
        C.codeHtml("Int -> 0\nBool -> false\nString -> \"\"\noutros objetos -> void\n\nordem: Object ... Pai ... T")
      ),
      C.tableStep({
        title: "Dispatch dinâmico",
        body: "A chamada de método usa o tipo dinâmico do receptor para escolher a implementação.",
        headers: ["etapa", "efeito"],
        rows: [
          ["1. avalia argumentos", "em ordem, propagando efeitos"],
          ["2. avalia receptor", "obtém objeto alvo"],
          ["3. lê tag dinâmica", "descobre a classe real"],
          ["4. busca impl(X, f)", "encontra o método no tipo dinâmico"],
          ["5. cria ambiente", "parâmetros e atributos ficam no escopo do corpo"],
        ],
      }),
      C.domStep(
        "Erros dinâmicos",
        "O type checker evita muitos erros, mas não todos. A semântica concreta ainda precisa definir abortos " +
          "para dispatch em <code>void</code>, divisão por zero, substring fora do intervalo e falta de memória.",
        "<div class='ex-callout warn'><div class='ex-callout-title'>Runtime checks</div>" +
          "Esses são erros dinâmicos: aparecem durante a execução, não como falha de tipagem estática.</div>"
      ),
      C.domStep(
        "Resumo",
        "A semântica operacional de COOL é o contrato que o gerador de código deve preservar.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Cada forma da linguagem diz como produzir valor e store final; objetos e métodos acrescentam " +
          "inicialização hierárquica e dispatch dinâmico.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c24-semantica-cool",
    num: "Cool",
    subject: "Compiladores",
    section: "Semântica Operacional",
    title: "Semântica operacional de COOL",
    type: "conceitual",
    hubDesc: "Regras de avaliação de COOL: constantes, store, let, new, dispatch dinâmico e erros de runtime.",
    statement:
      "Entenda a semântica operacional concreta de COOL: constantes, identificadores, atribuição, blocos, if, while, " +
      "let, new T, inicialização hierárquica, dispatch dinâmico e erros dinâmicos.",
    parts: [{ label: "Guia", build: build }],
  });
})();
