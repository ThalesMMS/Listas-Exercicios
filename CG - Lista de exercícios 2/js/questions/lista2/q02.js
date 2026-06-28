/*
 * q02.js — Visualização 3D e Projeções.
 * "Quais são os elementos que caracterizam a projeção?" — objeto, centro/direção
 * de projeção, plano de projeção e projetores, com diagrama SVG rotulado.
 */
(function () {
  "use strict";
  var EX = window.EX;

  var COP = [54, 172];
  var T = 0.45;
  var OBJ = [[332, 112], [432, 150], [342, 236]];   // triângulo (objeto)
  function lerp(a, p, t) { return [a[0] + t * (p[0] - a[0]), a[1] + t * (p[1] - a[1])]; }

  // Diagrama de projeção central com os 4 elementos rotulados.
  function scene(svg, hi) {
    hi = hi || {};
    svg.view(470, 300);
    var IMG = OBJ.map(function (p) { return lerp(COP, p, T); });
    function on(k) { return hi[k] ? "var(--yellow)" : null; }

    // plano de projeção
    svg.polygon([[165, 128], [245, 116], [245, 214], [165, 226]], {
      fill: hi.plano ? "var(--yellow-soft)" : "var(--accent-soft)",
      stroke: on("plano") || "var(--accent)", strokeWidth: hi.plano ? 3 : 1.5,
    });
    svg.text(205, 108, "plano de projeção", { size: 12, color: on("plano") || "var(--accent)", weight: hi.plano ? 700 : 400 });

    // projetores
    OBJ.forEach(function (P) {
      svg.line(COP[0], COP[1], P[0], P[1], { stroke: on("proj") || "var(--ink-mute)", strokeWidth: hi.proj ? 2 : 1, dashed: true });
    });
    svg.text(120, 150, "projetores", { size: 12, color: on("proj") || "var(--ink-dim)", weight: hi.proj ? 700 : 400, anchor: "start" });

    // imagem (resultado)
    svg.polygon(IMG, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
    svg.text(202, 236, "imagem", { size: 11, color: "var(--green)" });

    // objeto
    svg.polygon(OBJ, { fill: hi.obj ? "var(--yellow-soft)" : "var(--bg-soft)", stroke: on("obj") || "var(--ink)", strokeWidth: hi.obj ? 3 : 2 });
    svg.text(392, 250, "objeto", { size: 12, color: on("obj") || "var(--ink-dim)", weight: hi.obj ? 700 : 400 });

    // centro de projeção
    svg.circle(COP[0], COP[1], hi.cop ? 7 : 5, { fill: on("cop") || "var(--orange)" });
    svg.text(54, 200, "COP / DOP", { size: 12, color: on("cop") || "var(--orange)", weight: 700 });
  }

  function build() {
    return [
      {
        title: "Os elementos da projeção",
        body:
          "<p>Toda projeção é caracterizada por <b>quatro elementos</b>:</p>" +
          "<ol>" +
          "<li><b>Objeto/cena</b> — o que será projetado;</li>" +
          "<li><b>Centro de projeção (COP)</b> ou <b>direção de projeção (DOP)</b>;</li>" +
          "<li><b>Plano (superfície) de projeção</b> — onde a imagem se forma;</li>" +
          "<li><b>Projetores</b> — os raios que ligam o objeto ao COP/DOP.</li>" +
          "</ol>" +
          "<p>A <span class='ok'>imagem</span> é a <i>consequência</i>: a interseção dos projetores com o plano.</p>",
        visual: { type: "svg", draw: function (s) { scene(s, {}); } },
      },
      {
        title: "1) Objeto / cena",
        body:
          "<p>É o <span class='hl'>conjunto de pontos, arestas e faces</span> em 3D que queremos representar. " +
          "Tudo o que a projeção faz é decidir <b>onde cada ponto do objeto aparece</b> no plano.</p>",
        visual: { type: "svg", draw: function (s) { scene(s, { obj: true }); } },
      },
      {
        title: "2) Centro (COP) ou Direção (DOP) de projeção",
        body:
          "<p>O <span style='color:var(--orange)'>COP</span> é o ponto de onde os projetores partem.</p>" +
          "<ul><li>COP <b>finito</b> → projetores convergem → projeção <span class='hl'>perspectiva</span>;</li>" +
          "<li>COP no <b>infinito</b> → projetores <b>paralelos</b>, definidos por uma <span class='hl'>direção (DOP)</span> " +
          "→ projeção <span class='hl'>paralela</span>.</li></ul>",
        visual: { type: "svg", draw: function (s) { scene(s, { cop: true, proj: true }); } },
      },
      {
        title: "3) Plano de projeção",
        body:
          "<p>É a <span class='accent'>superfície</span> (em geral um plano) onde a imagem 2D é registrada — " +
          "o análogo do <b>filme/sensor</b> de uma câmera ou da <b>tela</b>.</p>" +
          "<p>Sua posição e orientação em relação ao objeto e aos projetores mudam completamente a imagem.</p>",
        visual: { type: "svg", draw: function (s) { scene(s, { plano: true }); } },
      },
      {
        title: "4) Projetores (raios projetantes)",
        body:
          "<p>São as <span class='hl'>retas</span> que ligam cada ponto do objeto ao COP (ou seguem a DOP). " +
          "A imagem de um ponto é onde <b>o seu projetor fura o plano</b>.</p>" +
          "<p>Convergentes ⇒ perspectiva; paralelos ⇒ projeção paralela.</p>",
        visual: { type: "svg", draw: function (s) { scene(s, { proj: true }); } },
      },
      EX.Slides.comparison({
        title: "COP finito × COP no infinito",
        intro: "<p>O elemento que mais muda a imagem é o COP/DOP:</p>",
        headers: ["", "Perspectiva (COP finito)", "Paralela (DOP)"],
        rows: [
          ["Projetores", "convergem num ponto", "paralelos entre si"],
          ["Tamanho da imagem", "diminui com a distância", "preservado"],
          ["Paralelismo", "pode se perder (fuga)", "preservado"],
          ["Uso típico", "realismo/visualização", "engenharia/medidas"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q02",
    num: "2",
    subject: "Visualização 3D e Projeções",
    title: "Elementos que caracterizam a projeção",
    type: "conceitual",
    hubDesc: "Objeto, centro/direção de projeção, plano de projeção e projetores.",
    statement:
      "Quais são os elementos que caracterizam a projeção: objeto/cena, COP ou DOP, " +
      "plano de projeção e projetores?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
