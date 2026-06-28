/*
 * c29-spilling-avancado.js — Guia: spilling real e coloração otimista.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.domStep(
        "Quando simplify trava",
        "Na coloração de grafos, o algoritmo trava quando todo nó restante tem grau ≥ k. O spill didático " +
          "escolhe um candidato; o spilling avançado ainda tenta evitar custo real.",
        C.codeHtml("se todo nó tem grau >= k:\n  escolher candidato\n  remover otimisticamente\n  tentar colorir o resto")
      ),
      C.tableStep({
        title: "Coloração otimista",
        body: "O candidato é removido antes de confirmar que precisa ir para memória.",
        headers: ["etapa", "resultado possível"],
        rows: [
          ["remove candidato", "subgrafo pode ficar colorível"],
          ["reinsere candidato", "se vizinhos não usam todas as cores, ele recebe registrador"],
          ["vizinhos usam k cores", "spill real é necessário"],
        ],
      }),
      C.codeStep({
        title: "Reescrita com load/store",
        body: "Quando o spill é real, o temporário ganha um slot no frame. Cada leitura recebe um <b>load</b>; cada escrita recebe um <b>store</b>.",
        code:
          "# antes\n" +
          "t = a + b\n" +
          "c = t * d\n" +
          "\n" +
          "# depois de spill(t)\n" +
          "t2 = a + b\n" +
          "store t2 -> slot_t\n" +
          "t3 = load slot_t\n" +
          "c = t3 * d",
        active: [6, 7],
        lang: "text",
      }),
      C.domStep(
        "Reduzir live range",
        "O objetivo da reescrita é encurtar o <b>live range</b>. O temporário original vivo por muito tempo " +
          "vira vários nomes curtos, vivos só entre load/uso ou definição/store.",
        C.codeHtml("t  vivo por muitas linhas\n\nvira\n\nt2 vivo até store\nt3 vivo de load até uso")
      ),
      C.domStep(
        "Recalcular tudo",
        "Depois de inserir loads e stores, o programa mudou. É obrigatório recomputar vivacidade, reconstruir o RIG " +
          "e repetir a coloração.",
        C.codeHtml("reescrever código\nrecalcular liveness\nreconstruir o RIG\nrepetir simplify/select/spill")
      ),
      C.tableStep({
        title: "Como escolher candidato",
        body: "Qualquer candidato preserva correção, mas performance muda.",
        headers: ["heurística", "intuição"],
        rows: [
          ["muitos conflitos", "remove muitas arestas do RIG"],
          ["poucos usos", "gera menos loads/stores"],
          ["fora de loops internos", "evita custo repetido"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Spilling é um ciclo, não uma decisão isolada.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Tente coloração otimista; se falhar, insira load/store, encurte live range, reconstruir o RIG e repetir.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c29-spilling-avancado",
    num: "Spill",
    subject: "Compiladores",
    section: "Alocação de Registradores",
    title: "Spilling avançado",
    type: "computacional",
    hubDesc: "Coloração otimista, reescrita com loads/stores, redução de live ranges e novo RIG.",
    statement:
      "Entenda spilling avançado: coloração otimista, modificação do código com loads e stores, redução de live range, " +
      "reconstruir o RIG e repetir a alocação de registradores.",
    parts: [{ label: "Guia", build: build }],
  });
})();
