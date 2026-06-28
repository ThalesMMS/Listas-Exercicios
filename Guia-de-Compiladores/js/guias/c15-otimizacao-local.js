/*
 * c15-otimizacao-local.js — Guia: Otimização local (bloco básico).
 * Agora com a TRANSFORMAÇÃO ANIMADA do bloco: propaga constantes, faz folding e
 * remove código morto até colapsar em g := 5. Reusa EX.Compilers.codeStep.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.codeStep({
        title: "Otimizar dentro de um bloco básico",
        body: "Um <b>bloco básico</b> é uma sequência reta de instruções (sem desvios no meio). " +
          "Assuma que só <code>g</code> e <code>x</code> são usados fora dele:",
        code:
          "a := 1\n" +
          "b := 3\n" +
          "c := a + x\n" +
          "d := a * 3\n" +
          "e := b * 3\n" +
          "f := a + b\n" +
          "g := e - f",
        lang: "text",
      }),
      C.codeStep({
        title: "1) Propagação de constantes/cópia",
        body: "<code>a = 1</code> e <code>b = 3</code> têm valor <b>conhecido e único</b>: " +
          "substituímos cada uso de <code>a</code>/<code>b</code> pelos valores (linhas destacadas).",
        code:
          "a := 1\n" +
          "b := 3\n" +
          "c := 1 + x\n" +
          "d := 1 * 3\n" +
          "e := 3 * 3\n" +
          "f := 1 + 3\n" +
          "g := e - f",
        active: [3, 4, 5, 6],
        lang: "text",
      }),
      C.codeStep({
        title: "2) Folding (calcula o constante)",
        body: "Operações entre constantes são <b>avaliadas em tempo de compilação</b>: " +
          "<code>d=3</code>, <code>e=9</code>, <code>f=4</code> e então <code>g = 9 − 4 = 5</code>.",
        code:
          "a := 1\n" +
          "b := 3\n" +
          "c := 1 + x\n" +
          "d := 3\n" +
          "e := 9\n" +
          "f := 4\n" +
          "g := 5",
        active: [4, 5, 6, 7],
        lang: "text",
      }),
      C.codeStep({
        title: "3) Elimina código morto",
        body: "Só <code>g</code> e <code>x</code> escapam do bloco. Tudo o que <b>ninguém usa fora</b> " +
          "(a, b, c, d, e, f) é <b>código morto</b> e some — inclusive <code>c := 1 + x</code>, que " +
          "nunca é lido. Sobra:",
        code: "g := 5",
        active: [1],
        lang: "text",
      }),
      C.tableStep({
        title: "Quais otimizações são válidas",
        body: "Cuidado com as inválidas — elas mudam o resultado:",
        headers: ["proposta", "válida?", "por quê"],
        rows: [
          ["linha 3 (c) é removida", "sim", "código morto: c não é usado fora"],
          ["o bloco reduz a g := 5", "sim", "tudo é constante após propagar"],
          ["linha 4 vira d := a * b", "não", "era a * 3, não a * b"],
          ["linha 5 vira e := d", "não", "d = 3 e e = 9 (expressões diferentes)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Encadeando otimizações válidas, o bloco inteiro colapsa em <code>g := 5</code>.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "<b>Propague</b> o que é constante, faça <b>folding</b>, reaproveite cálculos repetidos " +
          "(subexpressões comuns) e <b>apague o que ninguém usa</b> — sempre preservando o efeito " +
          "observável (aqui, o valor de g).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c15-otimizacao-local",
    num: "Opt",
    subject: "Compiladores",
    section: "Otimização",
    title: "Otimização local (bloco básico)",
    type: "computacional",
    hubDesc: "Propagação, folding e eliminação de código morto animados até o bloco colapsar em g:=5.",
    statement:
      "Entenda as otimizações locais de um bloco básico: propagação de constantes e cópia, folding, " +
      "eliminação de subexpressões comuns e de código morto, passo a passo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
