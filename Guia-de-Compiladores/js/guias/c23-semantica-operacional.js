/*
 * c23-semantica-operacional.js — Guia: julgamento operacional, ambiente e store.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "O julgamento completo",
        "A semântica operacional de COOL descreve uma avaliação que começa em um contexto e termina com " +
          "um valor resultante e uma nova memória.",
        C.codeHtml("so, E, S ⊢ e : v, S'\n\nself object  so\nambiente     E\nstore inicial S\nexpressão    e\nvalor         v\nstore final   S'")
      ),
      C.tableStep({
        title: "Ambiente vs store",
        body: "A divisão em dois mapas é o ponto central.",
        headers: ["componente", "mapeia", "muda durante a expressão?"],
        rows: [
          ["E (ambiente)", "nome -> local", "não, o escopo é fixo"],
          ["S (store)", "local -> valor", "sim, atribuições produzem S'"],
          ["so (self)", "objeto corrente", "não, self não é reatribuído"],
        ],
      }),
      C.domStep(
        "Locais separam nome e valor",
        "Um identificador não aponta direto para um valor. Ele aponta para um <b>local</b>; o local aponta para " +
          "o valor atual. Isso permite atualizar o valor sem mudar o escopo.",
        C.codeHtml("E = { x : L1 }\nS = { L1 -> Int(4) }\n\nx avalia consultando E[x] = L1 e depois S[L1] = Int(4)")
      ),
      C.domStep(
        "Atribuição encadeia stores",
        "Em <code>x <- e</code>, primeiro avaliamos <code>e</code>, que pode produzir uma store intermediária. " +
          "Depois escrevemos o valor no local de <code>x</code>.",
        C.codeHtml("so, E, S  ⊢ e : v, S1\nE(x) = Lx\nS2 = S1[Lx <- v]\n----------------------\nso, E, S ⊢ x <- e : v, S2")
      ),
      C.tableStep({
        title: "Invariantes e efeitos colaterais",
        body: "A regra fica legível porque separa o que é estável do que muda.",
        headers: ["categoria", "exemplos", "papel"],
        rows: [
          ["invariantes", "so, E, layout dos objetos", "referências estáveis para compilar acessos"],
          ["mutável", "S e S'", "modela efeitos colaterais"],
          ["valor resultante", "v", "resultado da expressão avaliada"],
        ],
      }),
      C.domStep(
        "E se não terminar?",
        "O julgamento só existe para avaliações que terminam. Um loop infinito não produz valor nem store final; " +
          "a semântica não inventa um <code>S'</code>.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Leitura correta</div>" +
          "Se a expressão terminar, então <code>so, E, S ⊢ e : v, S'</code> descreve seu valor e seus efeitos.</div>"
      ),
      C.domStep(
        "Resumo",
        "Semântica operacional formal é uma contabilidade precisa de valor e estado.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Ambiente liga nomes a locais; store liga locais a valores; avaliar uma expressão retorna " +
          "um valor resultante e uma store final.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c23-semantica-operacional",
    num: "Eval",
    subject: "Compiladores",
    section: "Semântica Operacional",
    title: "Semântica operacional formal",
    type: "conceitual",
    hubDesc: "Julgamento so,E,S ⊢ e:v,S', ambiente vs store, locais, invariantes e efeitos colaterais.",
    statement:
      "Entenda o julgamento operacional so, E, S ⊢ e : v, S': diferença entre ambiente e store, locais de memória, " +
      "valor resultante, store final, invariantes e efeitos colaterais.",
    parts: [{ label: "Guia", build: build }],
  });
})();
