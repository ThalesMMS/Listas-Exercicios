/*
 * c31-coleta-conservadora.js — Guia: conservative garbage collection.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function conservativeHeap(marked) {
    return {
      type: "svg",
      draw: function (svg) {
        C.heap(svg, {
          cells: ["A", "B", "42?", "C", "D"],
          root: 0,
          marked: marked,
          pointers: [
            { from: 0, to: 1 },
            { from: 2, to: 3, color: "var(--yellow)" },
          ],
          note: "42? parece ponteiro para C; conservadoramente, C fica marcado.",
        });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "O problema em C/C++",
        "Em C/C++, uma palavra de memória pode ser ponteiro ou dado comum. O coletor não sabe com 100% de certeza " +
          "se aquele padrão de bits é endereço ou número.",
        C.codeHtml("0x10004000  # ponteiro?\n0x10004000  # inteiro grande?\n# o coletor precisa decidir sem tipos precisos")
      ),
      C.domStep(
        "Regra conservadora",
        "A regra é deliberadamente segura: se <b>parece ponteiro</b>, trate como ponteiro. Isso evita liberar " +
          "um objeto que talvez ainda seja acessível.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Conservador</div>" +
          "Pode manter lixo a mais, mas não remove objeto que ainda pode ser usado.</div>"
      ),
      C.tableStep({
        title: "Filtros de aparência",
        body: "O coletor usa testes simples para reduzir falsos positivos.",
        headers: ["critério", "por que ajuda"],
        rows: [
          ["alinhamento", "ponteiros reais costumam apontar para word boundary"],
          ["segmento válido", "o endereço precisa cair dentro da região de dados/heap"],
          ["valor plausível", "inteiros pequenos raramente parecem endereços válidos"],
        ],
      }),
      {
        title: "Marcação conservadora",
        body:
          "<p>Se uma palavra ambígua parece apontar para <b>C</b>, C é marcado. Mesmo que fosse só um número, " +
          "o coletor prefere manter C a correr o risco de coletar algo vivo.</p>",
        visual: conservativeHeap([0, 1, 2, 3]),
      },
      C.domStep(
        "Por que não pode mover",
        "Um coletor copiador atualiza ponteiros quando move objetos. Na coleta conservadora isso é perigoso: se " +
          "um número for confundido com ponteiro e for atualizado, o programa muda de significado.",
        "<p>Por isso a regra prática é: coleta conservadora <b>não pode mover</b> objetos.</p>"
      ),
      C.tableStep({
        title: "Compatível com Mark-and-Sweep",
        body: "Como os objetos não se movem, a combinação natural é Mark-and-Sweep.",
        headers: ["algoritmo", "compatibilidade"],
        rows: [
          ["Mark-and-Sweep", "compatível: marca e libera sem mover"],
          ["Stop-and-Copy", "incompatível: precisaria atualizar referências ambíguas"],
          ["compactação", "em geral proibida pelo mesmo motivo"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Coleta conservadora troca precisão por segurança.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Em C/C++, se parece ponteiro, marque; aceite falsos positivos; não mova objetos; use Mark-and-Sweep.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c31-coleta-conservadora",
    num: "ConsGC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Coleta de lixo conservadora",
    type: "conceitual",
    hubDesc: "Ponteiros ambíguos em C/C++, regra 'parece ponteiro', objetos imóveis e Mark-and-Sweep.",
    statement:
      "Entenda coleta de lixo conservadora: ambiguidade ponteiro/dado em C/C++, critério parece ponteiro, por que não pode mover " +
      "objetos e por que Mark-and-Sweep é o algoritmo compatível.",
    parts: [{ label: "Guia", build: build }],
  });
})();
