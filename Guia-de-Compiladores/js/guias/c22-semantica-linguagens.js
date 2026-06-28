/*
 * c22-semantica-linguagens.js — Guia: por que linguagens precisam de semântica formal.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Depois de tipo vem execução",
        "Léxico define tokens, gramática define forma e tipagem rejeita programas ruins. Ainda falta dizer " +
          "o que um programa <b>faz</b> quando roda.",
        C.codeHtml("tokens -> árvore -> tipos -> semântica formal\n                      ^\n                      regras de avaliação")
      ),
      C.tableStep({
        title: "Por que não basta assembly",
        body: "Definir uma linguagem por uma implementação em assembly prende a linguagem a detalhes que não fazem parte dela.",
        headers: ["detalhe do assembly", "por que não deve virar semântica da linguagem"],
        rows: [
          ["direção da pilha", "é escolha de arquitetura/runtime"],
          ["representação exata de inteiros", "é detalhe de alvo"],
          ["bug do compilador de referência", "não deve virar regra da linguagem"],
          ["estratégia de máquina de pilha", "impede implementações alternativas válidas"],
        ],
      }),
      C.tableStep({
        title: "Três estilos de especificação",
        body: "As três formas são expressivas, mas servem melhor a perguntas diferentes.",
        headers: ["modelo", "pergunta respondida", "uso típico"],
        rows: [
          ["operacional", "como a expressão avalia passo a passo?", "compiladores e interpretadores"],
          ["denotacional", "qual função matemática é o significado?", "fundação matemática da linguagem"],
          ["axiomática", "que propriedade vale antes/depois?", "provas de correção e análise estática"],
        ],
      }),
      C.domStep(
        "Semântica operacional",
        "Para um construtor de compiladores, a forma mais direta é a semântica <b>operacional</b>: uma " +
          "máquina abstrata de alto nível avalia expressões por regras.",
        "<p>Ela é concreta o suficiente para guiar implementação e abstrata o suficiente para não escolher " +
          "registradores, endereços ou layout físico.</p>"
      ),
      C.domStep(
        "Otimizações precisam preservar significado",
        "Uma transformação é válida quando o programa novo tem o mesmo significado observável do programa antigo. " +
          "Sem uma semântica formal, essa frase fica vaga.",
        C.codeHtml("antes:  x + 0\napós:   x\nválida se a semântica de + e 0 garante o mesmo valor e os mesmos efeitos")
      ),
      C.domStep(
        "Resumo",
        "Semântica formal separa a definição da linguagem dos acidentes de uma implementação.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Use a semântica formal para dizer o significado de cada expressão; use assembly apenas como uma " +
          "das traduções possíveis desse significado.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c22-semantica-linguagens",
    num: "Sem",
    subject: "Compiladores",
    section: "Semântica Operacional",
    title: "Semântica formal de linguagens",
    type: "conceitual",
    hubDesc: "Por que regras formais definem a linguagem melhor que uma implementação em assembly.",
    statement:
      "Entenda por que uma linguagem precisa de semântica formal: limites da definição por assembly e a diferença " +
      "entre semântica operacional, denotacional e axiomática.",
    parts: [{ label: "Guia", build: build }],
  });
})();
