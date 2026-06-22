/*
 * concept-slide.js — Exemplo de questão CONCEITUAL montada só com os templates
 * EX.Slides (sem desenhar nada complexo). Tema: coesão e acoplamento.
 *
 * Mostra o fluxo típico de uma questão conceitual:
 *   concept (intro) -> definition (coesão) -> definition (acoplamento)
 *   -> prosCons (alto vs. baixo acoplamento) -> comparison (tabela-resumo).
 *
 * IIFE + namespace global. Apenas registra a questão via EX.registry.add.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function build() {
    var steps = [];

    steps.push(
      S.concept({
        title: "Por que coesão e acoplamento?",
        body:
          "<p>Dois critérios clássicos para avaliar a <b>qualidade de um projeto de software</b> " +
          "(módulos, classes, funções) são a <span class='accent'>coesão</span> e o " +
          "<span class='accent'>acoplamento</span>.</p>" +
          "<p>A regra de ouro do bom projeto modular é buscar " +
          "<span class='ok'>alta coesão</span> e <span class='ok'>baixo acoplamento</span>. " +
          "Nos próximos passos definimos cada um e mostramos por quê.</p>",
      })
    );

    steps.push(
      S.definition({
        title: "Coesão",
        term: "Coesão",
        body:
          "<p><b>Coesão</b> mede o quanto as responsabilidades dentro de um mesmo " +
          "módulo estão <span class='accent'>relacionadas entre si</span> e voltadas a um " +
          "único propósito.</p>" +
          "<p><span class='ok'>Alta coesão:</span> o módulo faz <i>uma coisa bem feita</i> " +
          "(ex.: uma classe <code>Fatura</code> que só cuida de faturas).</p>" +
          "<p><span class='no'>Baixa coesão:</span> o módulo acumula tarefas sem relação " +
          "(ex.: uma classe \"Utilidades\" que faz de tudo).</p>",
      })
    );

    steps.push(
      S.definition({
        title: "Acoplamento",
        term: "Acoplamento",
        body:
          "<p><b>Acoplamento</b> mede o grau de <span class='accent'>dependência</span> " +
          "entre módulos diferentes — o quanto um precisa conhecer os detalhes do outro.</p>" +
          "<p><span class='ok'>Baixo acoplamento:</span> módulos se comunicam por " +
          "interfaces simples e estáveis; mudar um quase não afeta os demais.</p>" +
          "<p><span class='no'>Alto acoplamento:</span> módulos dependem de detalhes internos " +
          "uns dos outros; uma mudança se propaga em cascata.</p>",
      })
    );

    steps.push(
      S.prosCons({
        title: "Alto vs. baixo acoplamento",
        intro:
          "<p>O acoplamento sempre existe (módulos precisam colaborar). " +
          "A questão é o seu <b>grau</b>. Compare ao lado.</p>",
        items: [
          {
            name: "Baixo acoplamento",
            pros: [
              "Mudanças ficam localizadas (menos efeito cascata).",
              "Módulos podem ser testados isoladamente.",
              "Facilita reúso e substituição de partes.",
            ],
            cons: [
              "Pode exigir mais abstrações (interfaces, contratos).",
              "Às vezes adiciona indireção ao código.",
            ],
          },
          {
            name: "Alto acoplamento",
            pros: [
              "Pode parecer mais direto e rápido de escrever no início.",
            ],
            cons: [
              "Uma mudança quebra vários módulos de uma vez.",
              "Difícil testar e reusar partes isoladas.",
              "Manutenção fica cara e arriscada com o tempo.",
            ],
          },
        ],
      })
    );

    steps.push(
      S.comparison({
        title: "Resumo comparativo",
        intro:
          "<p>Quadro-resumo: o projeto desejável combina " +
          "<span class='ok'>alta coesão</span> com " +
          "<span class='ok'>baixo acoplamento</span>.</p>",
        headers: ["Critério", "Mede", "Desejável", "Efeito do extremo ruim"],
        rows: [
          [
            "Coesão",
            "Foco interno do módulo",
            "Alta",
            "Módulo \"faz-tudo\", difícil de entender",
          ],
          [
            "Acoplamento",
            "Dependência entre módulos",
            "Baixo",
            "Mudança se propaga em cascata",
          ],
        ],
      })
    );

    return steps;
  }

  EX.registry.add({
    id: "concept-slide",
    num: "◆",
    subject: "Engenharia de Software",
    section: "Conceitos",
    title: "Coesão e acoplamento",
    type: "conceitual",
    tags: ["projeto", "modularidade", "qualidade"],
    hubDesc: "Questão conceitual usando os templates de slide (sem visual complexo).",
    statement:
      "Explique os conceitos de <strong>coesão</strong> e <strong>acoplamento</strong> " +
      "no projeto de software e por que se busca alta coesão e baixo acoplamento.",
    parts: [{ label: "Conceito", build: build }],
  });
})();
