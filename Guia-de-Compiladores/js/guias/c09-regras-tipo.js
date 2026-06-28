/*
 * c09-regras-tipo.js — Guia: Regras de inferência de tipos (boas regras + ambiente do Let).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Árvore de derivação (prova) de ⊢ (1 + 2) < 3 : Bool — conclusão embaixo,
  // premissas acima de cada barra de inferência. `level` revela de baixo p/ cima.
  function jdg(svg, x, y, txt, on) {
    svg.text(x, y, txt, { mono: true, size: 14, weight: on ? 700 : 600, color: on ? "var(--ink)" : "var(--ink-dim)" });
  }
  function bar(svg, x1, x2, y, rule, on) {
    var col = on ? "var(--accent)" : "var(--ink-mute)";
    svg.line(x1, y, x2, y, { stroke: col, strokeWidth: on ? 3 : 2 });
    svg.text(x2 + 8, y, rule, { anchor: "start", size: 12, weight: 700, color: col });
  }
  function proofVisual(level) {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(760, 360);
        // nível 3: axiomas (barras curtas [Int] sobre as folhas)
        if (level >= 3) {
          bar(svg, 95, 185, 64, "Int", true); bar(svg, 285, 375, 64, "Int", true); bar(svg, 535, 625, 64, "Int", true);
        }
        // nível 2: regra [Soma] e suas premissas (1 e 2)
        if (level >= 2) {
          jdg(svg, 140, 84, "⊢ 1 : Int", level >= 3); jdg(svg, 330, 84, "⊢ 2 : Int", level >= 3);
          bar(svg, 100, 368, 178, "Soma", true);
        }
        // nível 1: regra [<] e suas premissas (1+2:Int e 3:Int)
        if (level >= 1) {
          jdg(svg, 235, 199, "⊢ 1 + 2 : Int", level >= 2); jdg(svg, 580, 84, "⊢ 3 : Int", level >= 3);
          bar(svg, 185, 618, 288, "<", true);
        }
        // nível 0: a meta (conclusão)
        jdg(svg, 401, 309, "O,M,C ⊢ (1 + 2) < 3 : Bool", true);
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "Provar o tipo de uma expressão",
        "O type checker prova julgamentos da forma <code>O, M, C ⊢ e : T</code> — “no ambiente de " +
          "variáveis O, com métodos M, na classe C, a expressão <b>e</b> tem tipo <b>T</b>”. As " +
          "<b>regras de inferência</b> têm premissas em cima e a conclusão embaixo:",
        C.codeHtml("   O,M,C ⊢ e1 : Int    O,M,C ⊢ e2 : Int\n   ----------------------------------------   [Soma]\n          O,M,C ⊢ e1 + e2 : Int")
      ),
      {
        title: "Derivação: a meta",
        body: "<p>Tipar uma expressão é <b>construir uma árvore de derivação</b>: a <b>conclusão</b> fica " +
          "embaixo; subimos justificando cada passo com uma regra (a barra), até chegar a <b>axiomas</b> " +
          "(literais). Vamos provar <code>(1 + 2) &lt; 3 : Bool</code>, de baixo para cima.</p>",
        visual: proofVisual(0),
      },
      {
        title: "Aplica a regra [<]",
        body: "<p>A regra de <code>&lt;</code> exige <b>dois Int</b> e conclui <b>Bool</b>. Então a meta " +
          "abre duas premissas: <code>⊢ 1 + 2 : Int</code> e <code>⊢ 3 : Int</code>.</p>",
        visual: proofVisual(1),
      },
      {
        title: "Aplica a regra [Soma]",
        body: "<p>Para provar <code>1 + 2 : Int</code> usamos a regra [Soma]: ela pede " +
          "<code>⊢ 1 : Int</code> e <code>⊢ 2 : Int</code>. O outro ramo (<code>3 : Int</code>) já é " +
          "quase um axioma.</p>",
        visual: proofVisual(2),
      },
      {
        title: "Fecha nos axiomas",
        body: "<p>Cada literal inteiro é um <b>axioma</b> [Int] (não precisa de premissas). Todas as " +
          "folhas fecham → a árvore está completa e <b>prova</b> que <code>(1 + 2) &lt; 3 : Bool</code>. " +
          "É exatamente isso que o type checker faz, recursivamente.</p>",
        visual: proofVisual(3),
      },
      C.domStep(
        "Regras 'boas' (corretas)",
        "Uma regra é <b>boa</b> se for <em>sólida</em>: sempre que ela conclui <code>e : T</code>, a " +
          "execução de <code>e</code> realmente produz um valor de tipo <code>T</code>. Senão, o " +
          "compilador “mente” sobre o tipo e o programa pode quebrar em runtime.",
        ""
      ),
      C.tableStep({
        title: "Avaliando quatro regras",
        body: "Confira se o tipo concluído bate com o que a operação realmente devolve:",
        headers: ["regra", "conclui", "veredito"],
        rows: [
          ["Sequência { e₁;…;eₙ }", "tipo de eₙ", "boa — o bloco vale a última expressão"],
          ["Comparação  e₁ < e₂", "Int", "ruim — < devolve Bool, não Int"],
          ["Divisão  e₁ / e₂", "Bool", "ruim — / devolve Int, não Bool"],
          ["isvoid(e)", "Bool", "boa — testa qualquer valor e devolve Bool"],
        ],
      }),
      {
        title: "Ambientes: a regra do Let",
        body:
          "<p>Em <code>let x : T₁ &lt;- e₁ in e₂</code>, <b>quando</b> a variável <code>x</code> existe? " +
          "O inicializador <code>e₁</code> roda <b>antes</b> de <code>x</code> entrar em escopo — então " +
          "<code>e₁</code> usa o ambiente <b>O</b> (sem x). Já <code>e₂</code> usa <b>O[T₁/x]</b> " +
          "(com x). O inicializador não pode enxergar a variável que está declarando.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(680, 200);
            C.box(svg, 40, 70, 150, 56, ["O", "(sem x)"], { fill: "var(--bg-soft)", stroke: "var(--border)", mono: false });
            svg.arrow(192, 98, 250, 98, { color: "var(--yellow)", strokeWidth: 3, head: 10 });
            C.box(svg, 256, 70, 170, 56, ["e₁ usa O"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)" });
            svg.arrow(428, 98, 486, 98, { color: "var(--green)", strokeWidth: 3, head: 10 });
            C.box(svg, 492, 70, 170, 56, ["e₂ usa O[T₁/x]"], { fill: "var(--green-soft)", stroke: "var(--green)" });
          },
        },
      },
      C.domStep(
        "A regra Let completa",
        "Juntando: o tipo do inicializador deve <b>conformar</b> ao declarado (<code>T₁' ≤ T₁</code>), " +
          "e o corpo é tipado no ambiente estendido. O resultado é o tipo do corpo.",
        C.codeHtml("O,M,C ⊢ e1 : T1'     T1' ≤ T1     O[T1/x],M,C ⊢ e2 : T2\n-----------------------------------------------------------  [Let-Init]\n        O,M,C ⊢ (let x : T1 <- e1 in e2) : T2")
      ),
      C.domStep(
        "Resumo",
        "Regras de inferência são o “contrato” do type checker.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Uma regra boa é <b>sólida</b> (o tipo concluído é o tipo real). E <b>ambientes</b> controlam " +
          "o escopo: no Let, <code>e₁</code> usa O; <code>e₂</code> usa O[T₁/x].</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c09-regras-tipo",
    num: "⊢",
    subject: "Compiladores",
    section: "Análise Semântica",
    title: "Regras de inferência de tipos",
    type: "conceitual",
    hubDesc: "Julgamentos O,M,C ⊢ e:T; regras sólidas (boas); ambientes e a regra do Let.",
    statement:
      "Entenda as regras de inferência de tipos: a notação de julgamentos, o que torna uma regra " +
      "'boa' (sólida) e o papel dos ambientes na regra do Let.",
    parts: [{ label: "Guia", build: build }],
  });
})();
