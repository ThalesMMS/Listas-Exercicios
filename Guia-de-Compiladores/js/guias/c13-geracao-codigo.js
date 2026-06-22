/*
 * c13-geracao-codigo.js — Guia: Geração de código (máquina de pilha).
 * Agora com a ANIMAÇÃO do acumulador ($a0) + pilha ($sp) avaliando 5 + (4 − 3),
 * instrução a instrução. Reusa EX.Compilers.box + EX.Diagram.boxes.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // o: { a0, stack:[...], hot:bool }
  function machineVisual(o) {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(720, 300);
        // acumulador $a0
        svg.text(135, 70, "acumulador", { size: 13, weight: 700, color: "var(--ink-dim)" });
        C.box(svg, 60, 90, 150, 64, ["$a0", o.a0 == null ? "—" : String(o.a0)], {
          fill: o.hot ? "var(--yellow-soft)" : "var(--accent-soft)",
          stroke: o.hot ? "var(--yellow)" : "var(--accent)",
          mono: true, size: 18,
        });
        // pilha ($sp → topo)
        svg.text(470, 70, "pilha ($sp → topo)", { size: 13, weight: 700, color: "var(--ink-dim)" });
        if (o.stack && o.stack.length) {
          EX.Diagram.boxes(svg, {
            cells: o.stack.slice().reverse(), x: 430, y: 90, cellW: 76, cellH: 40, orientation: "v",
          }, { pointers: [{ index: 0, label: "$sp", color: "var(--yellow)" }] });
        } else {
          svg.rect(430, 90, 76, 40, { fill: "var(--bg)", stroke: "var(--border)", strokeWidth: 1.5, dashed: true, rx: 6 });
          svg.text(468, 110, "vazia", { size: 12, color: "var(--ink-mute)" });
        }
      },
    };
  }

  var ANIM = [
    { a0: "5", stack: [], asm: "li $a0 5", note: "avalia 5 → fica no acumulador", hot: true },
    { a0: "5", stack: ["5"], asm: "sw $a0 0($sp)\naddiu $sp $sp -4", note: "empilha 5 — libera o acumulador para o outro operando" },
    { a0: "4", stack: ["5"], asm: "li $a0 4", note: "começa (4 − 3): avalia 4", hot: true },
    { a0: "4", stack: ["5", "4"], asm: "sw $a0 0($sp)\naddiu $sp $sp -4", note: "empilha 4" },
    { a0: "3", stack: ["5", "4"], asm: "li $a0 3", note: "avalia 3", hot: true },
    { a0: "1", stack: ["5"], asm: "lw $t1 4($sp)\nsub $a0 $t1 $a0\naddiu $sp $sp 4", note: "desempilha 4 → $t1; $a0 = 4 − 3 = 1", hot: true },
    { a0: "6", stack: [], asm: "lw $t1 4($sp)\nadd $a0 $t1 $a0\naddiu $sp $sp 4", note: "desempilha 5 → $t1; $a0 = 5 + 1 = 6 ✓", hot: true },
  ];

  function build() {
    var steps = [
      C.domStep(
        "Gerar código para expressões",
        "Um gerador simples trata a CPU como uma <b>máquina de pilha</b> com um acumulador " +
          "(<code>$a0</code>). Avalia-se cada subexpressão deixando o resultado no acumulador e, quando " +
          "preciso, <b>empilha-se</b> na pilha (<code>$sp</code>) para liberar o acumulador.",
        C.codeHtml("cgen(e1 op e2):\n   cgen(e1)            # resultado em $a0\n   push $a0            # guarda na pilha\n   cgen(e2)            # resultado em $a0\n   $t1 <- pop         # recupera e1\n   $a0 <- $t1 op $a0  # aplica a operação")
      ),
      C.domStep(
        "Por que uma pilha",
        "Com <b>um</b> acumulador não dá para segurar dois resultados ao mesmo tempo. A pilha guarda os " +
          "valores intermediários enquanto a outra metade da expressão é avaliada — e isso compõe " +
          "recursivamente para <b>qualquer</b> aninhamento. Vamos ver <code>5 + (4 − 3)</code> rodar:",
        C.codeHtml("para 5 + (4 - 3):\n  avalia 5, empilha\n  avalia (4 - 3): avalia 4 empilha, avalia 3, subtrai → 1\n  desempilha 5, soma → 6")
      ),
    ];

    ANIM.forEach(function (s, i) {
      steps.push({
        title: "Máquina de pilha — passo " + (i + 1) + "/" + ANIM.length,
        body: "<p>" + s.note + "</p>" + C.codeHtml(s.asm),
        visual: machineVisual(s),
      });
    });

    steps.push(
      C.codeStep({
        title: "Lendo o assembly (Lista C, Q1)",
        body: "A ordem das operações na pilha revela a expressão. As linhas em destaque consomem da " +
          "pilha: <code>sub</code> faz 4−3, depois <code>add</code> faz 5+(4−3).",
        code:
          "li $a0 5\n" +
          "sw $a0 0($sp)\n" +
          "addiu $sp $sp -4\n" +
          "li $a0 4\n" +
          "sw $a0 0($sp)\n" +
          "addiu $sp $sp -4\n" +
          "li $a0 3\n" +
          "lw $t1 4($sp)\n" +
          "sub $a0 $t1 $a0   # 4 - 3\n" +
          "addiu $sp $sp 4\n" +
          "lw $t1 4($sp)\n" +
          "add $a0 $t1 $a0   # 5 + (4 - 3)\n" +
          "addiu $sp $sp 4",
        active: [9, 12],
        lang: "text",
      }),
      C.tableStep({
        title: "Quantos temporários? (Lista C, Q3)",
        body: "O número de temporários é o <b>pico</b> simultâneo, não a soma — e os ramos de um " +
          "<code>if</code> não coexistem. Para potenciaDeDois (x%2==0 ? pot(x/2) : x==1):",
        headers: ["subexpressão", "temporários", "por quê"],
        rows: [
          ["x % 2 == 0", "2", "um para x%2, outro para a comparação"],
          ["potenciaDeDois(x/2)", "1", "um para o argumento x/2"],
          ["x == 1", "0", "comparação direta"],
          ["total da função", "2", "pico, não soma (then/else não coexistem)"],
        ],
      }),
      C.domStep(
        "Resumo",
        "A máquina de pilha gera código correto para qualquer expressão aninhada.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Avalie no acumulador, <b>empilhe</b> o que precisa esperar; a profundidade da pilha segue o " +
          "aninhamento e o nº de temporários é o <b>pico</b> de valores vivos ao mesmo tempo.</div>"
      )
    );
    return steps;
  }

  EX.registry.add({
    id: "c13-geracao-codigo",
    num: "cgen",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Geração de código (máquina de pilha)",
    type: "computacional",
    hubDesc: "cgen com acumulador + pilha animados (5+(4−3)); ler o assembly; pico de temporários.",
    statement:
      "Entenda a geração de código por máquina de pilha: o padrão cgen com acumulador e pilha animado " +
      "passo a passo, como ler o assembly gerado e como contar os temporários necessários.",
    parts: [{ label: "Guia", build: build }],
  });
})();
