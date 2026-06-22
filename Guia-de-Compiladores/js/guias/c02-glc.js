/*
 * c02-glc.js — Guia: Gramáticas livres de contexto (GLC).
 * Produções, derivação/árvore, ambiguidade e projeto de uma GLC (exemplo:
 * multiplicações com sinal). Reusa EX.Compilers (kit) + EX.Diagram.tree.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;
  var G = EX.GuiaC;

  function build() {
    return [
      C.domStep(
        "Por que precisamos de gramáticas",
        "Expressões regulares não contam nem aninham (não reconhecem parênteses balanceados). As " +
          "<b>GLCs</b> sim, graças à <b>recursão</b>. Uma GLC tem: <b>terminais</b> (os símbolos da " +
          "linguagem), <b>não-terminais</b> (variáveis, em maiúsculas), <b>produções</b> e um " +
          "<b>símbolo inicial</b>.",
        C.codeHtml("S → ( S )          -- aninhamento\nS → S S | λ        -- repetição\n(reconhece parênteses balanceados — impossível com regex)")
      ),
      {
        title: "Derivação e árvore",
        body:
          "<p>Derivar = partir do símbolo inicial e <b>substituir</b> não-terminais por produções até " +
          "sobrarem só terminais. A <b>árvore de derivação</b> registra essas escolhas. Para " +
          "<code>S → S + D | D</code>, <code>D → 1</code>, derivando <code>1 + 1</code>:</p>" +
          "<p class='formula'>S ⇒ S + D ⇒ D + D ⇒ 1 + D ⇒ 1 + 1</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            EX.Diagram.tree(svg, {
              id: "s0", label: "S",
              children: [
                { id: "s1", label: "S", children: [{ id: "d1", label: "D", children: [{ id: "t1", label: "1" }] }] },
                { id: "p", label: "+" },
                { id: "d2", label: "D", children: [{ id: "t2", label: "1" }] },
              ],
            }, { nodeShape: "circle", view: [560, 420] });
          },
        },
      },
      C.domStep(
        "Ambiguidade",
        "Uma gramática é <b>ambígua</b> se alguma string tem <b>duas árvores</b> de derivação " +
          "diferentes. Isso é ruim: a árvore define precedência/associatividade, e o compilador " +
          "ficaria sem saber qual valor calcular.",
        "<p>Com <code>S → S + S | 1</code>, a string <code>1 + 1 + 1</code> tem duas árvores:</p>" +
          C.codeHtml("(1 + 1) + 1     e     1 + (1 + 1)") +
          "<p>Soma dá no mesmo, mas para <code>−</code> ou <code>/</code> o resultado mudaria. " +
          "Gramáticas de expressões reescrevem-se (com níveis de precedência) para ficarem " +
          "<b>não-ambíguas</b>.</p>"
      ),
      G.gstep(
        "Projetar uma GLC: multiplicações com sinal",
        "Tarefa (Lista A): gerar produtos de inteiros <code>{1,2}</code> com <code>∗</code> e " +
          "<code>−</code> cujo <b>valor seja positivo</b>. A ideia é separar <b>dois não-terminais</b> " +
          "por sinal e deixar as regras fazerem a “álgebra de sinais”:",
        [
          "P → P ∗ P | N ∗ N | I | − N      (positivo)",
          "N → N ∗ P | P ∗ N | − P          (negativo)",
          "I → D I | D                       (inteiro)",
          "D → 1 | 2",
        ]
      ),
      C.domStep(
        "Por que essas regras funcionam",
        "Cada não-terminal <b>garante o sinal</b> do valor que gera — e as combinações seguem a regra " +
          "dos sinais.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Álgebra de sinais</div>" +
          "<ul>" +
          "<li><b>P</b> (positivo): <code>P∗P</code> (+×+), <code>N∗N</code> (−×−=+), " +
          "<code>−N</code> (−(neg)=+) ou um literal <code>I</code>;</li>" +
          "<li><b>N</b> (negativo): <code>N∗P</code>/<code>P∗N</code> (um fator negativo) ou " +
          "<code>−P</code>;</li>" +
          "<li><b>I</b>/<b>D</b>: literais positivos.</li>" +
          "</ul>" +
          "<p>Assim, tudo que <code>P</code> deriva tem valor positivo — exatamente a linguagem pedida.</p></div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c02-glc",
    num: "GLC",
    subject: "Compiladores",
    section: "Gramáticas",
    title: "Gramáticas livres de contexto",
    type: "conceitual",
    hubDesc: "Produções, derivação/árvore, ambiguidade e como projetar uma GLC (produtos com sinal).",
    statement:
      "Entenda gramáticas livres de contexto: produções e derivações, a árvore de derivação, " +
      "ambiguidade e como projetar uma GLC para uma linguagem dada.",
    parts: [{ label: "Guia", build: build }],
  });
})();
