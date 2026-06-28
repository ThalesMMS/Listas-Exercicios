/*
 * c30-cache-loop-interchange.js — Guia: caches, localidade e loop interchange.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  function build() {
    return [
      C.tableStep({
        title: "Hierarquia de memória",
        body: "Quanto mais longe do processador, maior a capacidade e maior a latência.",
        headers: ["nível", "custo típico", "papel"],
        rows: [
          ["registradores", "1 ciclo", "valores imediatos do código"],
          ["cache", "poucos ciclos", "dados recentes/próximos"],
          ["DRAM", "dezenas de ciclos", "memória principal"],
          ["disco", "muito mais lento", "persistência"],
        ],
      }),
      C.domStep(
        "Cache miss custa caro",
        "Quando o dado não está no cache, ocorre <b>cache miss</b> e o processador precisa buscar na DRAM. " +
          "O programa passa a rodar na velocidade da memória, não na velocidade do processador.",
        "<p>Por isso localidade de dados pode ser mais importante que uma instrução aritmética a menos.</p>"
      ),
      C.codeStep({
        title: "Loop com pouca localidade",
        body: "Se o loop interno percorre uma dimensão que expulsa dados antes do reuso, quase todo acesso vira miss.",
        code:
          "for (j = 0; j < N; j++)\n" +
          "  for (i = 0; i < N; i++)\n" +
          "    soma += A[i][j];",
        active: [2, 3],
        lang: "c",
      }),
      C.codeStep({
        title: "Loop interchange",
        body: "<b>Loop interchange</b> troca a ordem dos laços para melhorar localidade, quando a dependência permite.",
        code:
          "for (i = 0; i < N; i++)\n" +
          "  for (j = 0; j < N; j++)\n" +
          "    soma += A[i][j];",
        active: [1, 2, 3],
        lang: "c",
      }),
      C.tableStep({
        title: "Por que o compilador nem sempre faz",
        body: "A transformação parece simples, mas precisa provar que não muda o resultado.",
        headers: ["limite", "efeito"],
        rows: [
          ["dependências entre iterações", "podem impedir a troca"],
          ["ponteiros/aliasing", "dificultam provar segurança"],
          ["layout real dos dados", "define se a troca ajuda ou atrapalha"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Cache é um recurso que o compilador nem sempre consegue gerenciar sozinho.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Use localidade: carregue dados uma vez, reutilize enquanto estão no cache e aplique loop interchange quando for legal.</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c30-cache-loop-interchange",
    num: "Cache",
    subject: "Compiladores",
    section: "Otimização",
    title: "Cache e loop interchange",
    type: "conceitual",
    hubDesc: "Hierarquia registrador/cache/DRAM/disco, cache miss, localidade e troca de laços.",
    statement:
      "Entenda cache e loop interchange: hierarquia de memória com registradores, cache, DRAM e disco, custo de cache miss, " +
      "localidade de dados e limites da otimização automática pelo compilador.",
    parts: [{ label: "Guia", build: build }],
  });
})();
