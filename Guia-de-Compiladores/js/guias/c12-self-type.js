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
        title: "O tipo 'a minha própria classe'",
        body:
          "<p><code>SELF_TYPE_C</code> significa “a classe <b>real</b> de <code>self</code>, em " +
          "qualquer subclasse de C”. Serve para métodos que devolvem <em>o próprio tipo</em> — como " +
          "<code>copy()</code>: chamado num Square, deve devolver Square, não Object.</p>" +
          "<p>É mais preciso que devolver a classe declarada, e preserva o tipo ao longo de cadeias de " +
          "chamadas.</p>",
        visual: G.coolTree([]),
      },
      C.domStep(
        "Regras de conformância",
        "SELF_TYPE não é uma classe fixa, então tem regras próprias de subtipo:",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Conformidade</div>" +
          "<ul>" +
          "<li><code>SELF_TYPE_C ≤ P</code> <b>se</b> <code>C ≤ P</code> (herda as relações de C);</li>" +
          "<li>um tipo comum <code>T</code> <b>não</b> conforma a <code>SELF_TYPE_P</code> (uma classe " +
          "concreta não pode prometer ser “o self de quem chamou”);</li>" +
          "<li><code>SELF_TYPE_C</code> não vira subtipo de uma classe <b>irmã</b>.</li>" +
          "</ul></div>"
      ),
      C.tableStep({
        title: "Avaliando relações (Lista B, Q7)",
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
        "Trocar o tipo de retorno de um método para <code>SELF_TYPE</code> faz a classe real " +
          "<b>fluir pela cadeia</b> de chamadas.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Cadeias polimórficas</div>" +
          "Se <code>baz()</code> devolve <code>SELF_TYPE</code>, então <code>c.baz()</code> com " +
          "<code>c : C</code> tem tipo <b>C</b> (não a classe-base). Assim <code>c.baz().foo()</code> " +
          "chama o <code>foo</code> de C — cada objeto usa a sua versão do método.</div>"
      ),
      {
        title: "SELF_TYPE flui pela cadeia",
        body:
          "<p>Acompanhe a cadeia <code>c.baz().foo()</code> com <code>c : C</code>: o " +
          "<code>SELF_TYPE</code> devolvido por <code>baz()</code> é <b>resolvido para C</b> (a classe " +
          "de <code>c</code>), e por isso <code>foo()</code> é procurado em <b>C</b> — e não na " +
          "classe-base onde <code>baz</code> talvez esteja declarado.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 600, h: 430,
              nodes: [
                { id: "a", x: 230, y: 24, w: 220, h: 50, lines: ["c : C"] },
                { id: "b", x: 220, y: 120, w: 250, h: 64, lines: ["c.baz() : SELF_TYPE", "(avaliado em c)"] },
                { id: "c", x: 220, y: 230, w: 250, h: 64, lines: ["SELF_TYPE = C", "(a classe de c)"], active: true },
                { id: "d", x: 215, y: 340, w: 260, h: 64, lines: ["c.baz().foo()", "usa o foo de C"] },
              ],
              edges: [
                { from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" },
              ],
            });
          },
        },
      },
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
