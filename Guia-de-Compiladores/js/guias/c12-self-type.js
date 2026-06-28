/*
 * c12-self-type.js — Guia: SELF_TYPE e subtipos.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      {
        title: "Por que SELF_TYPE existe",
        body:
          "<p>Pense em um método que devolve o próprio objeto, como <code>copy()</code>. Se você chama " +
          "<code>copy()</code> em um <code>Square</code>, o compilador não quer perder essa informação e " +
          "tratar o resultado só como <code>Object</code>.</p>" +
          "<p><code>SELF_TYPE</code> é a forma de escrever na assinatura: “o resultado tem o mesmo " +
          "<b>tipo estático</b> do receptor da chamada”. Então <code>s.copy()</code>, com " +
          "<code>s : Square</code>, também tem tipo estático <code>Square</code>.</p>" +
          "<p>Quando aparece <code>SELF_TYPE_C</code>, o <code>C</code> só indica a classe corrente usada " +
          "na checagem. O compilador verifica isso em tempo de compilação. A <b>classe dinâmica</b> do " +
          "objeto ainda serve para outra coisa: decidir, em runtime, qual implementação do método roda.</p>",
        visual: G.coolTree([]),
      },
      C.domStep(
        "Regras de conformância",
        "Conformância é a pergunta “este tipo pode ser usado onde aquele outro tipo é esperado?”. " +
          "Com <code>SELF_TYPE</code>, leia a notação antes de aplicar a fórmula:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Conformidade</div>" +
          "<p><code>SELF_TYPE_C</code> aparece do lado esquerdo: leia como “o próprio tipo de um " +
          "objeto cuja classe corrente é <code>C</code>”.</p>" +
          "<p>Para saber se ele cabe em <code>P</code>, pergunte: <code>C</code> é um <code>P</code>? " +
          "Se sim, <code>SELF_TYPE_C</code> também cabe em <code>P</code>.</p>" +
          "<ul>" +
          "<li><code>SELF_TYPE_C ≤ P</code> <b>se</b> <code>C ≤ P</code> (herda as relações de C);</li>" +
          "<li>um tipo comum <code>T</code> <b>não</b> conforma a <code>SELF_TYPE_P</code>; " +
          "<code>SELF_TYPE</code> não significa “qualquer subclasse”, e sim “o tipo do próprio " +
          "receptor”;</li>" +
          "<li><code>SELF_TYPE_C</code> não vira subtipo de uma classe <b>irmã</b>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Avaliando relações",
        body: "Com a hierarquia Object … Shape → {Quad, Circle}; Quad → Rect → Square:",
        headers: ["relação", "vale?", "por quê"],
        rows: [
          ["Square ≤ SELF_TYPE_Shape", "não", "tipo comum não conforma a SELF_TYPE"],
          ["SELF_TYPE_Circle ≤ Quad", "não", "Circle e Quad são irmãs (Circle ⊄ Quad)"],
          ["SELF_TYPE_Shape ≤ Shape", "sim", "Shape ≤ Shape"],
          ["SELF_TYPE_Rect ≤ Shape", "sim", "Rect ≤ Quad ≤ Shape"],
        ],
      }),
      C.domStep(
        "Para que serve na prática",
        "Trocar o tipo de retorno de um método para <code>SELF_TYPE</code> faz o <b>tipo estático</b> do " +
          "receptor <b>fluir pela cadeia</b> de chamadas.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Cadeias polimórficas</div>" +
          "Se <code>baz()</code> devolve <code>SELF_TYPE</code>, então <code>c.baz()</code> com " +
          "<code>c : C</code> tem <b>tipo estático C</b> (não a classe-base). Isso garante, na checagem, " +
          "que <code>C</code> tem <code>foo</code>. <b>Qual</b> <code>foo</code> roda em " +
          "<code>c.baz().foo()</code> é decidido depois, pelo <b>despacho dinâmico</b> sobre o objeto " +
          "devolvido — não necessariamente o de C.</div>"
      ),
      {
        title: "SELF_TYPE flui pela cadeia (tipo estático)",
        body:
          "<p>Acompanhe a cadeia <code>c.baz().foo()</code> com <code>c : C</code>: o " +
          "<code>SELF_TYPE</code> devolvido por <code>baz()</code> recebe <b>tipo estático C</b> (a " +
          "classe estática de <code>c</code>). É isso que a <b>checagem</b> usa para garantir que " +
          "<code>foo</code> existe a partir de <code>C</code> — independentemente de onde <code>baz</code> " +
          "esteja declarado. A implementação executada vem depois, do despacho dinâmico.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 600, h: 430,
              nodes: [
                { id: "a", x: 230, y: 24, w: 220, h: 50, lines: ["c : C", "(tipo estático)"] },
                { id: "b", x: 220, y: 120, w: 250, h: 64, lines: ["c.baz() : SELF_TYPE", "→ tipo estático C"] },
                { id: "c", x: 220, y: 230, w: 250, h: 64, lines: ["checagem: C tem foo?", "sim"], active: true },
                { id: "d", x: 215, y: 340, w: 260, h: 64, lines: ["execução: foo do objeto", "real (despacho dinâmico)"] },
              ],
              edges: [
                { from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" },
              ],
            });
          },
        },
      },
      C.tableStep({
        title: "Subclasse D: estático preserva, dinâmico decide",
        body:
          "Seja <code>D ≤ C</code> e, em execução, <code>c</code> guardando um <code>D</code>. Com " +
          "<code>baz()</code> devolvendo <code>SELF_TYPE</code>, separe o que é fixado na compilação do " +
          "que é escolhido na execução:",
        headers: ["expressão", "tipo estático (checagem)", "executa (despacho)"],
        rows: [
          ["c.baz()", "C", "devolve um D (a classe de self)"],
          ["c.baz().foo()", "tipo de retorno de foo em C", "D.foo(), se D redefine foo"],
        ],
      }),
      C.domStep(
        "Resumo",
        "SELF_TYPE dá precisão de tipo sem abrir mão do polimorfismo.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "<code>SELF_TYPE_C</code> = “o tipo de self em subclasses de C”; conforma como C, mas nenhum " +
          "tipo concreto conforma a ele.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c12-self-type",
    num: "SELF",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "SELF_TYPE",
    type: "conceitual",
    hubDesc: "SELF_TYPE_C = tipo de self em subclasses de C; regras de conformância e uso em cadeias.",
    statement:
      "Entenda SELF_TYPE: o que representa, suas regras de conformância de subtipo e por que preserva " +
      "a classe real ao longo de cadeias de chamadas.",
    parts: [{ label: "Guia", build: build }],
  });
})();
