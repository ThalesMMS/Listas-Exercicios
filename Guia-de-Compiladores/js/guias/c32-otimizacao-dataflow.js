/*
 * c32-otimizacao-dataflow.js — Guia: visão geral de otimização e dataflow.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Otimização segura",
        "Otimizar não é mudar código até ficar menor: é aplicar uma transformação que preserva o significado " +
          "observável do programa. A semântica define o que precisa ser preservado.",
        C.codeHtml("programa original  ==mesmo significado==>  programa melhorado\n\nmelhorado: menor, mais rápido ou mais simples")
      ),
      C.domStep(
        "CFG: onde a análise caminha",
        "Análises globais percorrem o <b>CFG</b> (grafo de fluxo de controle). Cada nó resume um bloco; cada " +
          "aresta mostra por onde a execução pode seguir.",
        C.codeHtml("entry -> B1 -> B2 -> exit\n          \\-> B3 -/")
      ),
      C.tableStep({
        title: "Direção da análise",
        body: "A direção da análise depende da pergunta feita.",
        headers: ["direção da análise", "exemplo", "pergunta"],
        rows: [
          ["forward", "propagação de constantes", "o que sei chegando aqui?"],
          ["backward", "vivacidade", "o que será usado depois daqui?"],
          ["bidirecional no projeto", "combina análises", "quando uma fase alimenta outra"],
        ],
      }),
      C.tableStep({
        title: "Meet, join e lattice",
        body: "Dataflow combina fatos vindos de caminhos diferentes usando uma operação sobre um domínio ordenado.",
        headers: ["termo", "papel"],
        rows: [
          ["lattice", "conjunto de fatos abstratos com ordens"],
          ["meet / join", "combina fatos nos pontos de encontro do CFG"],
          ["ordens", "dizem quando um fato é mais preciso ou mais conservador"],
          ["ponto fixo", "estado em que repetir a análise não muda mais nada"],
        ],
      }),
      C.domStep(
        "Loops exigem ponto fixo",
        "Em loops, uma informação volta pela back-edge e pode mudar o que já foi calculado. Por isso a análise " +
          "itera até o <b>ponto fixo</b>.",
        C.codeHtml("fatos_0\naplica regras -> fatos_1\naplica regras -> fatos_2\n...\npara quando fatos_n = fatos_(n-1)")
      ),
      C.tableStep({
        title: "Como os guias se encaixam",
        body: "Os guias específicos usam esta estrutura comum.",
        headers: ["guia", "usa a visão geral como"],
        rows: [
          ["Otimização local", "transformações seguras dentro de bloco básico"],
          ["Propagação de constantes", "análise forward com join no lattice"],
          ["Vivacidade", "análise backward sobre usos futuros"],
          ["RIG/coloração", "consome vivacidade para alocar registradores"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Dataflow é o vocabulário comum das otimizações globais.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Escolha um domínio em lattice, uma direção da análise, uma operação meet/join e itere no CFG até o ponto fixo.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c32-otimizacao-dataflow",
    num: "DF",
    subject: "Compiladores",
    section: "Otimização",
    title: "Otimização e dataflow: visão geral",
    type: "conceitual",
    hubDesc: "CFG, direção da análise, meet/join, lattice, ordens e ponto fixo como base das otimizações globais.",
    statement:
      "Entenda a visão geral de otimização e dataflow: otimização segura, CFG, direção da análise, meet/join, " +
      "lattice, ordens e iteração até ponto fixo.",
    parts: [{ label: "Guia", build: build }],
  });
})();
