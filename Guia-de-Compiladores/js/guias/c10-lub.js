/*
 * c10-lub.js — Guia: Hierarquia de classes e LUB (limite superior mínimo).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      {
        title: "Quando os ramos têm tipos diferentes",
        body:
          "<p>Qual o tipo de um <code>if … then a else b</code> quando <code>a</code> e <code>b</code> " +
          "têm tipos distintos? O menor tipo que serve para <b>ambos</b>: o <b>LUB</b> (limite superior " +
          "mínimo), o ancestral comum mais baixo na hierarquia de herança.</p>" +
          "<p>Hierarquia de trabalho (Lista B):</p>",
        visual: G.coolTree([]),
      },
      C.domStep(
        "Como achar LUB(A, B)",
        "É achar o <b>encontro</b> (meet) dos dois caminhos até a raiz.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Receita</div>" +
          "<ol>" +
          "<li>liste os <b>ancestrais</b> de A (subindo até Object);</li>" +
          "<li>liste os ancestrais de B;</li>" +
          "<li>o LUB é o ancestral comum <b>mais baixo</b>.</li>" +
          "</ol>" +
          "<p>Caso especial: se <code>A ≤ B</code> (A é subtipo de B), então <code>LUB(A,B) = B</code>.</p></div>"
      ),
      {
        title: "lub(Square, Circle) — sobe de Square",
        body:
          "<p>Primeiro, liste os <b>ancestrais de Square</b> subindo até a raiz: " +
          "<code>Square → Rect → Quad → Shape → Object</code> (destacados).</p>",
        visual: G.coolTree(["Square", "Rect", "Quad", "Shape", "Object"]),
      },
      {
        title: "lub(Square, Circle) — sobe de Circle",
        body:
          "<p>Agora os <b>ancestrais de Circle</b>: <code>Circle → Shape → Object</code>. " +
          "Procuramos o ancestral comum <b>mais baixo</b> entre as duas listas.</p>",
        visual: G.coolTree(["Circle", "Shape", "Object"]),
      },
      {
        title: "O encontro: Shape",
        body:
          "<p>Os dois caminhos compartilham <b>Shape</b> e <b>Object</b>; o <b>mais baixo</b> é " +
          "<b>Shape</b>. Logo <code>lub(Square, Circle) = Shape</code> — o tipo mais específico que " +
          "serve para os dois ramos.</p>",
        visual: G.coolTree(["Square", "Circle", "Shape"]),
      },
      C.tableStep({
        title: "Mais casos",
        body: "Aplicando a receita:",
        headers: ["expressão", "resultado", "por quê"],
        rows: [
          ["lub(Point, Quad)", "Object", "ramos só se encontram na raiz"],
          ["lub(Square, Rect)", "Rect", "Square ≤ Rect → o LUB é Rect (não Quad)"],
          ["lub(Square, Circle)", "Shape", "encontro de Quad-side e Circle-side"],
        ],
      }),
      C.domStep(
        "Resumo",
        "O LUB garante um tipo único e seguro para construções com vários ramos.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "LUB(A,B) = ancestral comum <b>mais baixo</b>. Se um é subtipo do outro, o LUB é o " +
          "<b>mais geral</b> dos dois.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c10-lub",
    num: "lub",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Hierarquia de classes e LUB",
    type: "computacional",
    hubDesc: "Limite superior mínimo: ancestral comum mais baixo; se A≤B então lub=B.",
    statement:
      "Entenda o LUB (limite superior mínimo) na hierarquia de classes: como encontrá-lo subindo aos " +
      "ancestrais comuns, usado para tipar construções com vários ramos.",
    parts: [{ label: "Guia", build: build }],
  });
})();
