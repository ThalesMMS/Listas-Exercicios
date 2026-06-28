/*
 * c25-runtime-organization.js — Guia: organização geral do runtime.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function memoryVisual() {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(560, 420);
        var x = 170, w = 220;
        var rows = [
          ["código", 40, 58, "var(--accent-soft)"],
          ["dados estáticos / globais", 98, 58, "var(--yellow-soft)"],
          ["heap cresce ↓", 156, 86, "var(--green-soft)"],
          ["espaço livre", 242, 78, "var(--bg-soft)"],
          ["stack cresce ↑", 320, 66, "var(--red-soft)"],
        ];
        rows.forEach(function (r) {
          svg.rect(x, r[1], w, r[2], { fill: r[3], stroke: "var(--ink)", strokeWidth: 2, rx: 6 });
          svg.text(x + w / 2, r[1] + r[2] / 2, r[0], { size: 14, weight: 700 });
        });
        svg.arrow(410, 186, 410, 230, { color: "var(--green)", head: 9, strokeWidth: 2 });
        svg.arrow(410, 350, 410, 310, { color: "var(--red)", head: 9, strokeWidth: 2 });
        svg.text(280, 410, "colisão heap/stack => falta de memória", { size: 13, weight: 700, color: "var(--ink-dim)" });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "Do front-end para o back-end",
        "O front-end valida o programa; o back-end precisa gerar código e organizar os dados que esse código " +
          "vai manipular. Essa passagem exige entender o <b>runtime</b>.",
        C.codeHtml("front-end: léxico -> parsing -> tipos\nback-end: runtime -> código -> otimização")
      ),
      C.tableStep({
        title: "Estático vs dinâmico",
        body: "A primeira separação mental é entre o que existe em tempo de compilação e o que existe em execução.",
        headers: ["categoria", "exemplos"],
        rows: [
          ["estático", "layout de classes, endereços globais, offsets conhecidos"],
          ["dinâmico", "frames, chamadas, objetos alocados, crescimento do heap"],
        ],
      }),
      {
        title: "Layout de memória",
        body:
          "<p>Um processo típico separa <b>código</b>, <b>dados estáticos</b>, <b>heap</b> e " +
          "<b>stack</b>. Globais ficam em endereços fixos; frames ficam na stack; objetos que sobrevivem " +
          "ao frame ficam no heap.</p>",
        visual: memoryVisual(),
      },
      C.tableStep({
        title: "Onde cada coisa mora",
        body: "A localização depende do tempo de vida do dado.",
        headers: ["dado", "região"],
        rows: [
          ["instruções geradas", "código"],
          ["variáveis globais", "dados estáticos"],
          ["locais e temporários de chamada", "stack"],
          ["objetos retornados ou compartilhados", "heap"],
        ],
      }),
      C.domStep(
        "Globais não cabem em frames",
        "Uma global deve ser a mesma em todas as referências durante toda a execução. Se ela morasse no frame " +
          "de uma função, desapareceria quando a função retornasse.",
        "<p>Por isso globais e constantes estáticas recebem endereços fixos na área de <b>dados estáticos</b>.</p>"
      ),
      C.domStep(
        "Heap e stack compartilham espaço",
        "Uma organização comum deixa heap e stack crescerem em direções opostas. O programa só fica sem memória " +
          "quando os ponteiros se encontram ou cruzam: é a <b>colisão</b> heap/stack.",
        C.codeHtml("heap_ptr  -> cresce para endereços maiores\nstack_ptr -> cresce para endereços menores\nif heap_ptr >= stack_ptr: out of memory")
      ),
      C.domStep(
        "Resumo",
        "Gerar código também é orquestrar dados.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Código, dados estáticos, stack e heap são decisões de runtime que o back-end precisa conhecer " +
          "para emitir acessos corretos.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c25-runtime-organization",
    num: "Run",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Organização geral do runtime",
    type: "conceitual",
    hubDesc: "Front-end/back-end, código, dados estáticos, stack, heap, globais e colisão de memória.",
    statement:
      "Entenda a organização geral do runtime: transição front-end/back-end, estruturas estáticas e dinâmicas, " +
      "código, dados estáticos, stack, heap, globais e colisão heap/stack.",
    parts: [{ label: "Guia", build: build }],
  });
})();
