/*
 * c03-fatoracao.js — Guia: Fatoração à esquerda.
 * Por que prefixos comuns quebram o parser preditivo e como fatorá-los.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      C.domStep(
        "O problema do prefixo comum",
        "Um parser preditivo (LL) escolhe a produção olhando <b>um símbolo à frente</b>. Se duas " +
          "alternativas começam igual, ele não consegue decidir só pelo início:",
        C.codeHtml("S → S + S | S + P\n         ^^^^ ^^^^\n      mesmo prefixo \"S +\" → o parser não sabe qual escolher")
      ),
      {
        title: "O ponto de indecisão",
        body:
          "<p>Depois de ler o prefixo comum <code>α</code>, as duas produções ainda são possíveis. " +
          "Com <b>um</b> símbolo de lookahead o parser <b>não consegue escolher</b> — é um conflito.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.flow(svg, {
              w: 740, h: 280,
              nodes: [
                { id: "q", x: 280, y: 26, w: 220, h: 56, lines: ["leu o prefixo α", "e agora?"] },
                { id: "b1", x: 70, y: 180, w: 240, h: 50, lines: ["A → α β₁"], fill: "var(--red-soft)", stroke: "var(--red)" },
                { id: "b2", x: 440, y: 180, w: 240, h: 50, lines: ["A → α β₂"], fill: "var(--red-soft)", stroke: "var(--red)" },
              ],
              edges: [
                { from: "q", to: "b1", label: "?", color: "var(--red)" },
                { from: "q", to: "b2", label: "?", color: "var(--red)" },
              ],
            });
          },
        },
      },
      {
        title: "A transformação",
        body:
          "<p>Fatorar à esquerda <b>adia a decisão</b>: extrai o prefixo comum <code>α</code> e empurra " +
          "a escolha entre <code>β₁</code> e <code>β₂</code> para um novo não-terminal <code>A′</code>, " +
          "decidida só <em>depois</em> de ler <code>α</code>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 200);
            C.box(svg, 40, 70, 250, 58, ["A → α β₁ | α β₂"], { fill: "var(--red-soft)", stroke: "var(--red)" });
            svg.arrow(298, 99, 384, 99, { color: "var(--accent)", strokeWidth: 3, head: 11 });
            C.box(svg, 392, 38, 280, 50, ["A → α A′"], { fill: "var(--green-soft)", stroke: "var(--green)" });
            C.box(svg, 392, 110, 280, 50, ["A′ → β₁ | β₂"], { fill: "var(--green-soft)", stroke: "var(--green)" });
          },
        },
      },
      G.gstep(
        "Exemplo — antes",
        "Gramática da Lista A. Note os prefixos comuns <code>S +</code> e <code>P ∗</code>:",
        [
          "S → S + S | S + P",
          "P → P ∗ P | P ∗ I",
          "I → − I | ( S ) | D",
          "D → 0 | 1 N",
          "N → 0 | 1 | N N | λ",
        ]
      ),
      G.gstep(
        "Exemplo — depois (fatorada)",
        "Extraímos <code>S +</code> e <code>P ∗</code>, criando <code>S′</code> e <code>P′</code>. As " +
          "demais regras já não tinham prefixo comum:",
        [
          "S  → S + S′",
          "S′ → S | P",
          "P  → P ∗ P′",
          "P′ → P | I",
          "I  → − I | ( S ) | D",
          "D  → 0 | 1 N",
          "N  → 0 | 1 | N N | λ",
        ]
      ),
      C.domStep(
        "Armadilhas e resumo",
        "Fatorar deixa cada não-terminal com alternativas de <b>primeiros símbolos distintos</b> — " +
          "condição necessária para LL(1).",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Cuidado</div>" +
          "<ul><li>Pode ser preciso <b>fatorar de novo</b> se um novo prefixo comum surgir;</li>" +
          "<li>fatoração <b>não remove recursão à esquerda</b> (veja o próximo guia) — note que " +
          "<code>S → S + S′</code> ainda é recursiva à esquerda.</li></ul></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c03-fatoracao",
    num: "Fat",
    subject: "Compiladores",
    section: "Gramáticas",
    title: "Fatoração à esquerda",
    type: "computacional",
    hubDesc: "Extrair prefixos comuns (A→αβ₁|αβ₂ ⇒ A→αA′, A′→β₁|β₂) para viabilizar LL(1).",
    statement:
      "Entenda a fatoração à esquerda: por que prefixos comuns impedem o parsing preditivo e como " +
      "transformá-los em A → α A′ com A′ → β₁ | β₂.",
    parts: [{ label: "Guia", build: build }],
  });
})();
