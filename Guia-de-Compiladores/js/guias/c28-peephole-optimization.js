/*
 * c28-peephole-optimization.js — Guia: otimização peephole.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Uma janela sobre o assembly",
        "Peephole optimization olha para uma sequência curta de instruções, como uma <b>janela deslizante</b>, " +
          "e troca padrões locais por sequências melhores.",
        C.codeHtml("janela de 4 instruções:\n  i\n  i+1\n  i+2\n  i+3\n# depois desliza para a próxima posição")
      ),
      C.tableStep({
        title: "Regras LHS/RHS",
        body: "Cada transformação é uma regra de substituição.",
        headers: ["parte", "significado"],
        rows: [
          ["LHS", "padrão original encontrado na janela"],
          ["RHS", "sequência que substitui o padrão"],
          ["condição", "restrição para preservar o significado"],
        ],
      }),
      C.codeStep({
        title: "Exemplo: movimentos redundantes",
        body: "Se ninguém pode saltar para a segunda instrução, ela desfaz a primeira e pode sair.",
        code:
          "move B -> A\n" +
          "move A -> B\n" +
          "\n" +
          "# RHS\n" +
          "move B -> A",
        active: [1, 2, 5],
        lang: "text",
      }),
      C.tableStep({
        title: "Aplicação repetida",
        body: "Uma regra pode criar oportunidade para outra, então a aplicação repetida é parte do algoritmo.",
        headers: ["antes", "depois"],
        rows: [
          ["add 0 -> A", "move A -> A"],
          ["move A -> A", "remover"],
          ["add I -> A ; add J -> A", "add (I+J) -> A"],
        ],
      }),
      C.domStep(
        "Otimização ou melhoria",
        "O nome “otimização” é tradicional, mas o objetivo real é <b>melhoria</b>: aplicar transformações " +
          "conhecidas que melhoram código sem prometer o melhor programa possível.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Critério</div>" +
          "A transformação precisa preservar significado; desempenho e tamanho são efeitos desejados, não uma prova de otimalidade.</div>"
      ),
      C.domStep(
        "Resumo",
        "Peephole é otimização local no nível de instruções.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Deslize uma janela sobre o assembly, case LHS, substitua por RHS, respeite condições e repita até estabilizar.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c28-peephole-optimization",
    num: "PH",
    subject: "Compiladores",
    section: "Otimização",
    title: "Peephole optimization",
    type: "computacional",
    hubDesc: "Janela deslizante em assembly, regras LHS/RHS e melhoria local aplicada repetidamente.",
    statement:
      "Entenda peephole optimization: janela deslizante sobre assembly, regras LHS/RHS, substituições locais, " +
      "aplicação repetida e a diferença entre otimização e melhoria de programa.",
    parts: [{ label: "Guia", build: build }],
  });
})();
