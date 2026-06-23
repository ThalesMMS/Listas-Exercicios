/*
 * c19-coleta-lixo.js — Guia: Coleta de lixo (Mark-and-Sweep e Stop-and-Copy).
 * Agora com a ANIMAÇÃO da fase de marcação (onda DFS a partir da raiz) antes da
 * varredura. Reusa EX.Compilers.heap (com o novo realce `marked`).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Grafo do heap (A=0,B=1,C=2,D=3,E=4,F=5): raiz→A; A→B, B→C, A→E; ciclo D↔F.
  var CELLS = ["A", "B", "C", "D", "E", "F"];
  var PTRS = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 4 },
    { from: 3, to: 5, side: "top" }, { from: 5, to: 3, side: "bottom" },
  ];

  function markHeap(marked, note) {
    return {
      type: "svg",
      draw: function (svg) {
        C.heap(svg, { cells: CELLS, root: 0, free: [], marked: marked, pointers: PTRS, note: note });
      },
    };
  }

  function build() {
    return [
      {
        title: "O que é lixo",
        body:
          "<p>Um objeto é <b>lixo</b> quando não há mais como o programa alcançá-lo a partir das " +
          "<b>raízes</b> (variáveis na pilha, registradores, globais). O coletor encontra os " +
          "alcançáveis e libera o resto.</p>" +
          "<p>Aqui, A→B→C e A→E são alcançáveis; <b>D e F</b> formam um ciclo que ninguém alcança.</p>",
        visual: markHeap([], "raiz → A. D e F só se apontam (ciclo). Vamos descobrir o que é alcançável."),
      },
      {
        title: "Marcar — parte das raízes",
        body:
          "<p>A fase <b>marcar</b> faz uma busca (DFS/BFS) a partir de cada raiz. Começamos marcando o " +
          "que a raiz aponta diretamente: <b>A</b>.</p>",
        visual: markHeap([0], "marcado: A (alcançável pela raiz)."),
      },
      {
        title: "Marcar — segue os ponteiros (DFS)",
        body:
          "<p>De <b>A</b>, visitamos seus vizinhos e os marcamos: <b>B</b> e <b>E</b>. A onda de " +
          "marcação avança pelos ponteiros.</p>",
        visual: markHeap([0, 1, 4], "marcado: A, B, E (a partir de A)."),
      },
      {
        title: "Marcar — até esgotar",
        body:
          "<p>De <b>B</b> chega-se a <b>C</b>. Não há mais alcançáveis novos. <b>D</b> e <b>F</b> " +
          "<b>nunca foram marcados</b> — ninguém os alcança (o ciclo entre eles não conta).</p>",
        visual: markHeap([0, 1, 2, 4], "marcado: A, B, C, E. D e F ficaram sem marca → são lixo."),
      },
      {
        title: "Varrer — libera os não-marcados",
        body:
          "<p>A fase <b>varrer</b> passa linearmente pelo heap e manda os <b>não marcados</b> (D, F) " +
          "para a lista de livres. Os objetos <b>não se movem</b> → simples, mas o heap fica " +
          "<b>fragmentado</b> (livres espalhados).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: CELLS, root: 0, free: [3, 5], marked: [0, 1, 2, 4],
              pointers: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 4 }],
              note: "D e F (não marcados) viram livres; A, B, C, E ficam no lugar.",
            });
          },
        },
      },
      {
        title: "Alternativa: Stop-and-Copy",
        body:
          "<p>O heap é dividido em <b>dois espaços</b>. O coletor <b>copia</b> os objetos alcançáveis " +
          "(em ordem de varredura) para o espaço novo, <b>atualizando os ponteiros</b>, e depois troca " +
          "os espaços.</p>" +
          "<p>Efeito colateral ótimo: os vivos ficam <b>contíguos</b> (compactação, sem fragmentação). " +
          "Custo: usa só metade da memória por vez.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["A", "B", "E", "C", "·", "·"], root: 0, free: [4, 5], marked: [0, 1, 2, 3],
              pointers: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }],
              note: "copiado e compactado no novo espaço; D e F simplesmente não vêm.",
            });
          },
        },
      },
      C.tableStep({
        title: "Mark-Sweep × Stop-Copy",
        body: "Duas técnicas de <b>rastreamento</b> (ambas partem das raízes):",
        headers: ["", "Mark-and-Sweep", "Stop-and-Copy"],
        rows: [
          ["Move objetos?", "não", "sim (copia)"],
          ["Fragmentação", "sim", "não (compacta)"],
          ["Memória usada", "todo o heap", "metade por vez"],
          ["Custo", "∝ heap todo (sweep)", "∝ objetos vivos"],
          ["Ciclos inalcançáveis", "coletados", "coletados"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Coletores de rastreamento definem “vivo” como “alcançável das raízes”.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "<b>Marca</b> os alcançáveis (onda a partir das raízes) e <b>varre</b> o resto (Mark-Sweep), " +
          "ou <b>copia</b> os vivos e compacta (Stop-Copy). Ambos coletam ciclos de lixo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c19-coleta-lixo",
    num: "GC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Coleta de lixo: Mark-Sweep e Stop-Copy",
    type: "conceitual",
    hubDesc: "Rastreamento das raízes: marcação DFS animada + varredura (fragmenta) vs parar-e-copiar (compacta).",
    statement:
      "Entenda a coleta de lixo por rastreamento: a fase de marcação (onda a partir das raízes), a " +
      "varredura (Mark-and-Sweep) e a alternativa Stop-and-Copy, com suas diferenças de compactação e custo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
