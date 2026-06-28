/*
 * c33-gerenciamento-automatico-memoria.js — Guia: visão geral de GC.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Por que automatizar memória",
        "Gerenciamento manual causa bugs de memória manual: vazamento quando nada é liberado, ponteiro pendente " +
          "quando algo é liberado cedo demais, e double free quando o mesmo objeto é liberado duas vezes.",
        C.codeHtml("malloc -> esqueceu free     # vazamento\nfree -> ainda usa ponteiro   # dangling pointer\nfree -> free de novo         # double free")
      ),
      C.domStep(
        "Raízes e alcançabilidade",
        "Um coletor começa pelas <b>raízes</b>: variáveis na pilha, registradores, globais e outros pontos que " +
          "o runtime sabe que podem conter referências. A partir delas, segue ponteiros para medir " +
          "<b>alcançabilidade</b>.",
        C.codeHtml("raízes -> objetos alcançáveis -> objetos alcançáveis por eles\n\nnão alcançável => candidato a lixo")
      ),
      C.tableStep({
        title: "GC é uma aproximação",
        body: "O coletor não prevê o futuro do programa; ele usa uma aproximação segura.",
        headers: ["critério", "consequência"],
        rows: [
          ["alcançável", "pode ser usado depois, então fica"],
          ["inalcançável", "não há caminho a partir das raízes, então pode ser coletado"],
          ["conservador", "na dúvida, mantém mais objetos para não coletar algo vivo"],
        ],
      }),
      C.domStep(
        "O compilador informa layouts",
        "Para o coletor saber onde procurar ponteiros, o compilador precisa descrever o <b>layout de frames</b>, " +
          "objetos e registros relevantes. Sem essa informação, o coletor não sabe distinguir referência de dado comum.",
        C.codeHtml("frame de f:\n  slot -1: ponteiro\n  slot -2: inteiro\n  slot -3: ponteiro\n\nGC varre só slots que podem conter referências")
      ),
      C.tableStep({
        title: "Famílias de coleta",
        body: "Os guias específicos detalham estratégias diferentes para a mesma pergunta: o que pode ser liberado?",
        headers: ["técnica", "ideia"],
        rows: [
          ["Mark-Sweep", "marca alcançáveis e varre o resto"],
          ["Stop-Copy", "copia vivos para outro espaço e compacta"],
          ["Contagem de referências", "libera quando contador chega a zero"],
          ["Coleta conservadora", "trata palavras plausíveis como ponteiros"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Gerenciamento automático de memória depende de cooperação entre runtime e compilador.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "GC parte das raízes, calcula alcançabilidade como aproximação segura e usa layouts emitidos pelo compilador para achar referências.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c33-gerenciamento-automatico-memoria",
    num: "AutoGC",
    subject: "Compiladores",
    section: "Gerenciamento de Memória",
    title: "Gerenciamento automático de memória: visão geral",
    type: "conceitual",
    hubDesc: "Bugs de memória manual, raízes, alcançabilidade, GC como aproximação e layouts de frames para o coletor.",
    statement:
      "Entenda a visão geral de gerenciamento automático de memória: bugs de memória manual, raízes, alcançabilidade, " +
      "GC como aproximação segura e como o compilador informa layout de frames ao coletor.",
    parts: [{ label: "Guia", build: build }],
  });
})();
