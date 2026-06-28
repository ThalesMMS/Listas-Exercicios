/*
 * c20-contagem-referencias.js — Guia: Coleta de lixo por contagem de referências.
 * Agora com a ANIMAÇÃO da liberação em CASCATA (contadores nas células) e o
 * ponto cego dos ciclos. Reusa EX.Compilers.heap.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Heap com contadores na própria célula (ex.: "B:1"). A=raiz; A→B→C, A→D.
  function rcHeap(cells, pointers, free, note) {
    return {
      type: "svg",
      draw: function (svg) {
        C.heap(svg, { cells: cells, root: 0, free: free || [], pointers: pointers, note: note, cw: 62 });
      },
    };
  }

  function build() {
    return [
      {
        title: "Contar quem aponta para cada objeto",
        body:
          "<p>A pergunta aqui não é “o que alcanço a partir das raízes?”. É “quantas setas chegam " +
          "neste objeto?”.</p>" +
          "<p>Cada objeto guarda esse número num <b>contador de referências</b>, mostrado como " +
          "<code>nome:contador</code>. Se o contador chega a <b>0</b>, ninguém aponta para ele: " +
          "libera <b>na hora</b>.</p>" +
          "<p>Isso é incremental, mas tem um ponto cego importante.</p>",
        visual: rcHeap(
          ["A", "B:1", "C:1", "D:1"],
          [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 0, to: 3 }],
          [],
          "A (raiz) aponta B e D; B aponta C. Cada um com 1 referência."
        ),
      },
      C.domStep(
        "As operações",
        "Toda atribuição de ponteiro mexe em duas pontas: o objeto que perdeu a seta e o objeto que " +
          "ganhou a seta.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Regras</div>" +
          "<ul>" +
          "<li>criar um ponteiro para X → <code>X.count += 1</code>;</li>" +
          "<li>remover um ponteiro para X → <code>X.count −= 1</code>;</li>" +
          "<li>se <code>X.count == 0</code> → libere X e <b>decremente</b> os contadores de todos os " +
          "objetos que X apontava (efeito <b>cascata</b>).</li>" +
          "</ul></div>"
      ),
      {
        title: "Cascata — passo 1: A solta B",
        body:
          "<p>Executando <code>A.ptrParaB = NULL</code>: o contador de <b>B</b> cai de 1 para <b>0</b>. " +
          "Ninguém mais aponta B → ele <b>será liberado</b>. Repare que B ainda aponta C (é o que " +
          "dispara a cascata).</p>",
        visual: rcHeap(
          ["A", "B:0", "C:1", "D:1"],
          [{ from: 1, to: 2 }, { from: 0, to: 3 }],
          [1],
          "B: 1 → 0 → liberado. B apontava C…"
        ),
      },
      {
        title: "Cascata — passo 2: libera C",
        body:
          "<p>Ao liberar <b>B</b>, decrementamos quem <b>B</b> apontava: <b>C</b> cai de 1 para " +
          "<b>0</b> → <b>C também é liberado</b>. A liberação se propaga em <b>cascata</b>. Sobram " +
          "<b>A</b> e <b>D</b>.</p>",
        visual: rcHeap(
          ["A", "B:0", "C:0", "D:1"],
          [{ from: 0, to: 3 }],
          [1, 2],
          "cascata: C: 1 → 0 → liberado. A e D continuam vivos."
        ),
      },
      {
        title: "O ponto cego: ciclos",
        body:
          "<p>Se dois objetos se apontam (<b>ciclo</b>), seus contadores nunca chegam a 0 — mesmo que " +
          "<b>ninguém de fora</b> os alcance. A contagem de referências <b>não coleta ciclos</b>: eles " +
          "<b>vazam</b>.</p>" +
          "<p>É justamente o caso que o rastreamento (Mark-Sweep / Stop-Copy) resolve.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            C.heap(svg, {
              cells: ["D:1", "F:1"], x: 240, root: null, cw: 62,
              pointers: [{ from: 0, to: 1, side: "top" }, { from: 1, to: 0, side: "bottom" }],
              note: "D e F se apontam (count 1 cada), mas são inalcançáveis → vazamento.",
            });
          },
        },
      },
      C.tableStep({
        title: "Contagem de referências × rastreamento",
        body: "Abordagens complementares:",
        headers: ["", "Contagem de refs", "Rastreamento (GC)"],
        rows: [
          ["Quando coleta", "na hora (count = 0)", "em ciclos de coleta"],
          ["Pausas", "curtas, espalhadas", "pausa para coletar"],
          ["Ciclos", "vaza (não coleta)", "coleta"],
          ["Custo por ponteiro", "atualizar contador", "nenhum"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Contagem de referências troca rastreamento por bookkeeping incremental.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Conte ponteiros; libere ao chegar a 0 (com <b>cascata</b> nos objetos apontados). Simples e " +
          "imediato — mas <b>ciclos vazam</b>, exigindo um coletor de rastreamento de apoio.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c20-contagem-referencias",
    num: "RC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Contagem de referências",
    type: "conceitual",
    hubDesc: "Contador por objeto; liberação em cascata animada ao zerar; ciclos vazam.",
    statement:
      "Entenda a coleta de lixo por contagem de referências: as operações de incremento/decremento, a " +
      "liberação em cascata (animada) e a limitação dos ciclos.",
    parts: [{ label: "Guia", build: build }],
  });
})();
