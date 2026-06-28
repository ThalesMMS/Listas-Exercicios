/*
 * c26-alinhamento-memoria.js — Guia: word alignment e padding.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "O que é word boundary",
        "Um dado está alinhado quando começa no limite natural de uma palavra da máquina, a <b>word boundary</b>. " +
          "Em 32 bits, a fronteira aparece a cada 4 bytes; em 64 bits, a cada 8 bytes.",
        C.codeHtml("32 bits: | b0 b1 b2 b3 | b4 b5 b6 b7 |\n          ^ word boundary")
      ),
      C.tableStep({
        title: "Por que alinhamento importa",
        body: "Dados desalinhados podem ser incorretos ou caros, dependendo da arquitetura.",
        headers: ["máquina", "efeito do dado desalinhado"],
        rows: [
          ["restritiva", "falha de execução ou instrução inválida"],
          ["tolerante", "funciona, mas com penalidade grande de desempenho"],
          ["preferência do compilador", "emitir layout alinhado por padrão"],
        ],
      }),
      C.domStep(
        "String e padding",
        "A string <code>HELLO\\0</code> ocupa 6 bytes. Em uma palavra de 4 bytes, sobram 2 bytes na segunda " +
          "palavra. O compilador usa <b>padding</b> para começar o próximo dado na próxima fronteira.",
        C.codeHtml("word 1: H E L L\nword 2: O \\0 _ _   # padding\nword 3: próximo dado alinhado")
      ),
      C.tableStep({
        title: "Memória vs velocidade",
        body: "Padding parece desperdício, mas evita acessos desalinhados.",
        headers: ["escolha", "resultado"],
        rows: [
          ["não pular bytes", "próximo dado pode ficar desalinhado"],
          ["pular até a fronteira", "gasta alguns bytes e preserva acesso rápido/correto"],
          ["ignorar a arquitetura", "quebra portabilidade do código gerado"],
        ],
      }),
      C.domStep(
        "Layout de objetos também depende disso",
        "Campos de objetos, strings e tabelas precisam considerar alinhamento. Um offset bonito no papel pode " +
          "não ser um offset válido ou eficiente na arquitetura alvo.",
        "<div class='ex-callout warn'><div class='ex-callout-title'>Armadilha</div>" +
          "O valor do padding não importa porque o programa não deve referenciar esses bytes.</div>"
      ),
      C.domStep(
        "Resumo",
        "Alinhamento é uma regra de layout imposta pelo alvo.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Comece dados em word boundaries; use padding para o próximo dado; evite falha e penalidade de acesso.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c26-alinhamento-memoria",
    num: "Align",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Alinhamento de memória e padding",
    type: "conceitual",
    hubDesc: "Word boundary, dados desalinhados, falha ou penalidade de execução e padding em strings.",
    statement:
      "Entenda alinhamento de memória e padding: word boundaries, dados desalinhados, penalidade ou falha de execução, " +
      "bytes de preenchimento em strings e impacto no layout de dados.",
    parts: [{ label: "Guia", build: build }],
  });
})();
