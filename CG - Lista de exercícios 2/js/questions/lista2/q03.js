/*
 * q03.js — Visualização 3D e Projeções.
 * "Quais são os tipos de projeção?" — taxonomia (paralela × perspectiva e seus
 * subtipos) como árvore SVG revelada por níveis + tabela comparativa.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Taxonomia das projeções planares geométricas (rótulos curtos; nomes completos no texto).
  var ROOT = {
    id: "proj", label: "Projeção", children: [
      {
        id: "par", label: "Paralela", children: [
          {
            id: "orto", label: "Ortográfica", children: [
              { id: "multi", label: "Multivista" },
              {
                id: "axo", label: "Axonom.", children: [
                  { id: "iso", label: "Isom." },
                  { id: "dim", label: "Dim." },
                  { id: "tri", label: "Trim." },
                ],
              },
            ],
          },
          {
            id: "obli", label: "Oblíqua", children: [
              { id: "cav", label: "Cavaleira" },
              { id: "cab", label: "Cabinet" },
            ],
          },
        ],
      },
      {
        id: "per", label: "Perspectiva", children: [
          { id: "p1", label: "1 PF" },
          { id: "p2", label: "2 PF" },
          { id: "p3", label: "3 PF" },
        ],
      },
    ],
  };

  function tree(shown, hi) {
    return {
      type: "svg",
      draw: function (svg) {
        EX.Diagram.tree(svg, ROOT, { shown: shown, highlight: hi || [], nodeShape: "box" });
      },
    };
  }

  var S1 = ["proj", "par", "per"];
  var S2 = S1.concat(["orto", "obli"]);
  var S3 = S2.concat(["multi", "axo", "iso", "dim", "tri"]);
  var S4 = S3.concat(["cav", "cab"]);
  var ALL = S4.concat(["p1", "p2", "p3"]);

  function build() {
    return [
      {
        title: "Duas grandes famílias",
        body:
          "<p>Pela natureza dos <b>projetores</b>, toda projeção planar é <span class='hl'>paralela</span> " +
          "ou <span class='hl'>perspectiva</span>.</p>" +
	          "<ul><li><b>Paralela</b> — projetores paralelos (COP no infinito); preserva paralelismo e propriedades afins, mas não todos os comprimentos ou ângulos.</li>" +
          "<li><b>Perspectiva</b> — projetores convergem (COP finito); gera pontos de fuga.</li></ul>",
        visual: tree(S1, ["par", "per"]),
      },
      {
        title: "Paralela: ortográfica × oblíqua",
        body:
          "<p>A projeção paralela divide-se pelo <b>ângulo dos projetores com o plano</b>:</p>" +
          "<ul><li><b>Ortográfica</b> — projetores <span class='accent'>perpendiculares</span> ao plano;</li>" +
          "<li><b>Oblíqua</b> — projetores <span class='accent'>paralelos, mas inclinados</span> em relação ao plano.</li></ul>",
        visual: tree(S2, ["orto", "obli"]),
      },
      {
        title: "Ortográfica: multivista e axonométrica",
        body:
          "<p><b>Multivista</b>: planos paralelos às faces → <i>vistas</i> frontal, superior e lateral (plantas de engenharia).</p>" +
          "<p><b>Axonométrica</b>: o objeto é girado para mostrar várias faces ao mesmo tempo. Conforme os ângulos entre os eixos:</p>" +
          "<ul><li><b>Isométrica</b> — 3 eixos com mesmo ângulo (mesma escala);</li>" +
          "<li><b>Dimétrica</b> — 2 eixos iguais;</li>" +
          "<li><b>Trimétrica</b> — os 3 eixos diferentes.</li></ul>",
        visual: tree(S3, ["multi", "axo", "iso", "dim", "tri"]),
      },
      {
        title: "Oblíqua: cavaleira e cabinet",
        body:
          "<p>Mantêm a <b>face frontal em verdadeira grandeza</b> e projetam a profundidade de forma inclinada:</p>" +
          "<ul><li><b>Cavaleira</b> — profundidade na <span class='hl'>escala 1:1</span>;</li>" +
          "<li><b>Cabinet</b> — profundidade <span class='hl'>reduzida à metade</span> (visual mais natural).</li></ul>",
        visual: tree(S4, ["cav", "cab"]),
      },
      {
        title: "Perspectiva: 1, 2 e 3 pontos de fuga",
        body:
          "<p>Classificada pelo nº de <b>pontos de fuga (PF)</b>, isto é, quantos eixos principais " +
          "não são paralelos ao plano:</p>" +
          "<ul><li><b>1 PF</b> — vista frontal (trilhos que fogem ao horizonte);</li>" +
          "<li><b>2 PF</b> — quina de um objeto (uso comum em arquitetura);</li>" +
          "<li><b>3 PF</b> — também olhando de cima/baixo (vista aérea/vertiginosa).</li></ul>",
        visual: tree(ALL, ["p1", "p2", "p3"]),
      },
      EX.Slides.comparison({
        title: "Resumo comparativo",
        intro: "<p>Os subtipos principais lado a lado:</p>",
        headers: ["Tipo", "Projetores", "Imagem", "Uso típico"],
        rows: [
          ["Ortográfica (multivista)", "⊥ ao plano", "vistas reais, sem fuga", "engenharia, plantas"],
          ["Axonométrica (iso/di/tri)", "⊥, objeto girado", "várias faces, sem fuga", "ilustração técnica"],
          ["Oblíqua (cavaleira/cabinet)", "paralelos, inclinados", "frente verdadeira", "desenho rápido"],
          ["Perspectiva (1/2/3 PF)", "convergem (COP finito)", "fuga, realismo", "arquitetura, jogos"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q03",
    num: "3",
    subject: "Visualização 3D e Projeções",
    title: "Tipos de projeção",
    type: "conceitual",
    hubDesc: "Paralela (ortográfica/oblíqua) × perspectiva (1/2/3 pontos de fuga).",
    statement:
      "Quais são os tipos de projeção, distinguindo projeção paralela e perspectiva, " +
      "e os subtipos ortográfica, oblíqua, cavaleira/cabinet e perspectiva com pontos de fuga?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
