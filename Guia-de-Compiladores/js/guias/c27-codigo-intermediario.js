/*
 * c27-codigo-intermediario.js — Guia: IR e three-address code.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "IR é a ponte",
        "Código intermediário, ou <b>IR</b>, fica entre a linguagem fonte e o assembly alvo. Ele torna o " +
          "compilador mais modular e facilita <b>retargeting</b>.",
        C.codeHtml("Cool -> IR -> MIPS\n          -> outro alvo")
      ),
      C.tableStep({
        title: "Mais e menos detalhes",
        body: "A IR fica no meio do caminho.",
        headers: ["comparação", "efeito"],
        rows: [
          ["mais detalhada que a fonte", "expõe temporários, saltos e operações primitivas"],
          ["menos detalhada que o alvo", "não fixa registradores físicos nem instruções específicas"],
          ["boa para otimização", "transformações operam numa forma uniforme"],
        ],
      }),
      C.codeStep({
        title: "Three-address code",
        body: "No <b>three-address code</b>, cada instrução faz uma operação simples com até dois operandos e um destino.",
        code:
          "t1 = y * z\n" +
          "t2 = x + t1\n" +
          "return t2",
        active: [1, 2],
        lang: "text",
      }),
      C.domStep(
        "Subexpressões ganham nome",
        "A expressão <code>x + y * z</code> não fica anônima. A subexpressão <code>y * z</code> vira " +
          "um temporário; o resultado final vira outro.",
        C.codeHtml("fonte: x + y * z\nIR:    t1 = y * z\n       t2 = x + t1")
      ),
      C.tableStep({
        title: "Registradores ilimitados",
        body: "A IR finge ter registradores ilimitados. Isso simplifica a geração inicial; a alocação de registradores resolve depois.",
        headers: ["fase", "responsabilidade"],
        rows: [
          ["geração de IR", "cria temporários sem se preocupar com hardware físico"],
          ["otimizações", "transformam temporários e fluxo de controle"],
          ["alocação", "mapeia temporários para registradores reais ou spill"],
        ],
      }),
      C.domStep(
        "Resumo",
        "IR desacopla front-end e back-end.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Three-address code nomeia subexpressões com temporários, assume registradores ilimitados e facilita retargeting.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c27-codigo-intermediario",
    num: "IR",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Código intermediário / three-address code",
    type: "computacional",
    hubDesc: "IR como ponte fonte-alvo: three-address code, temporários, registradores ilimitados e retargeting.",
    statement:
      "Entenda código intermediário: IR, three-address code, registradores ilimitados, temporários, nomeação de subexpressão " +
      "e retargeting para múltiplas arquiteturas.",
    parts: [{ label: "Guia", build: build }],
  });
})();
