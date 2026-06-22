/*
 * q10.js — Curvas Paramétricas.
 * "Vantagens e desvantagens: Interpoladas, Hermite, Bézier, NURBS."
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Catmull-Rom -> Bézier (path SVG que PASSA pelos pontos).
  function crPath(pts) {
    var d = "M " + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += " C " + c1[0] + " " + c1[1] + " " + c2[0] + " " + c2[1] + " " + p2[0] + " " + p2[1];
    }
    return d;
  }
  function curves(svg) {
    svg.view(480, 240);
    var Li = [[40, 165], [100, 70], [165, 150], [235, 80]];
    svg.path(crPath(Li), { stroke: "var(--accent)", strokeWidth: 2.5 });
    Li.forEach(function (p) { svg.circle(p[0], p[1], 4, { fill: "var(--accent)" }); });
    svg.text(140, 205, "Interpolada — passa pelos pontos", { size: 12, color: "var(--accent)" });
    var Bz = Li.map(function (p) { return [p[0] + 250, p[1]]; });
    svg.polyline(Bz, { stroke: "var(--ink-mute)", strokeWidth: 1, dashed: true });
    svg.path("M " + Bz[0][0] + " " + Bz[0][1] + " C " + Bz[1][0] + " " + Bz[1][1] + " " + Bz[2][0] + " " + Bz[2][1] + " " + Bz[3][0] + " " + Bz[3][1], { stroke: "var(--green)", strokeWidth: 2.5 });
    Bz.forEach(function (p, i) { svg.circle(p[0], p[1], 4, { fill: i === 0 || i === 3 ? "var(--green)" : "var(--ink-mute)" }); });
    svg.text(390, 205, "Bézier — aproxima (casco convexo)", { size: 12, color: "var(--green)" });
  }

  function build() {
    return [
      {
        title: "Interpolar × aproximar",
        body:
          "<p>A diferença central entre as famílias é se a curva <b>passa pelos pontos</b> (interpola) ou apenas " +
          "<b>os usa como controle</b> (aproxima).</p>" +
          "<p>À esquerda, uma curva <span class='accent'>interpolada</span>; à direita, uma <span style='color:var(--green)'>Bézier</span> " +
          "que toca só os extremos e fica contida no <i>casco convexo</i> do polígono de controle.</p>",
        visual: { type: "svg", draw: curves },
      },
      EX.Slides.prosCons({
        title: "Vantagens × desvantagens",
        intro: "<p>As quatro famílias da questão:</p>",
        items: [
          { name: "a) Interpolada", pros: ["passa por TODOS os pontos (intuitivo)", "bom quando os dados são exatos"], cons: ["pouco controle da forma entre pontos", "tende a oscilar / ultrapassar (overshoot)", "tangentes difíceis de controlar"] },
          { name: "b) Hermite", pros: ["controla posição E tangentes nos extremos", "emenda segmentos com C¹ fácil"], cons: ["exige fornecer as tangentes (menos intuitivo)", "definida por segmento"] },
          { name: "c) Bézier", pros: ["polígono de controle intuitivo", "casco convexo + de Casteljau (estável)", "padrão em fontes/ilustração"], cons: ["não interpola os pontos internos", "controle global dentro do segmento", "grau cresce com o nº de pontos"] },
          { name: "d) NURBS", pros: ["generaliza Bézier/B-spline", "pesos → cônicas exatas (círculo!)", "controle local (knots), grau fixo, padrão CAD"], cons: ["matematicamente mais complexa", "muitos parâmetros (nós e pesos)"] },
        ],
      }),
      EX.Slides.comparison({
        title: "Resumo comparativo",
        intro: "<p>De olho nas propriedades que mais decidem a escolha:</p>",
        headers: ["", "Interpola?", "Controle local", "Continuidade", "Cônicas exatas"],
        rows: [
          ["Interpolada", "sim", "não", "baixa", "não"],
          ["Hermite", "sim (extremos)", "por segmento", "C¹", "não"],
          ["Bézier", "só extremos", "não (global no seg.)", "exige emenda", "não"],
          ["NURBS", "opcional", "sim (knots)", "alta", "sim (pesos)"],
        ],
      }),
      EX.Slides.concept({
        title: "Qual escolher?",
        body:
          "<p><b>Dados que devem ser respeitados</b> → interpolada/Hermite. <b>Design livre</b> de formas → Bézier. " +
          "<b>CAD / precisão / cônicas</b> (e controle local com grau baixo) → <b>NURBS</b>, hoje o padrão da indústria.</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q10",
    num: "10",
    subject: "Curvas Paramétricas",
    title: "Vantagens e desvantagens das curvas",
    type: "conceitual",
    hubDesc: "Interpolada, Hermite, Bézier e NURBS: interpolar × aproximar, controle, pesos.",
    statement: "Quais são as vantagens e desvantagens das curvas paramétricas: a) Interpoladas, b) Hermite, c) Bézier, d) NURBS?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
