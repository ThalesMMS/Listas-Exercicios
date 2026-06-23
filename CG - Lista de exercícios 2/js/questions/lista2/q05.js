/*
 * q05.js — Representação de Sólidos / CSG.
 * "Indique as possíveis operações de conjunto (CSG)" para os dois objetos:
 *   (a) lupa/pirulito  = círculo ∪ cilindro   (UNIÃO)
 *   (b) crescente      = círculo − círculo     (DIFERENÇA)
 * Cada parte: primitivas → operação → resultado + árvore CSG.
 */
(function () {
  "use strict";
  var EX = window.EX;

  function cyl(svg, cx, top, h, w, fill, stroke) {
    var x = cx - w / 2, ry = w * 0.2;
    svg.rect(x, top, w, h, { fill: fill, stroke: "none" });
    svg.ellipse(cx, top + h, w / 2, ry, { fill: fill, stroke: stroke, strokeWidth: 2 });
    svg.line(x, top, x, top + h, { stroke: stroke, strokeWidth: 2 });
    svg.line(x + w, top, x + w, top + h, { stroke: stroke, strokeWidth: 2 });
    svg.ellipse(cx, top, w / 2, ry, { fill: fill, stroke: stroke, strokeWidth: 2 });
  }

  // ---- (a) UNIÃO: lupa = círculo ∪ cilindro ----
  function aPrim(svg) {
    svg.view(470, 300);
    svg.circle(135, 120, 66, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
    svg.text(135, 120, "círculo", { size: 13, color: "var(--accent)", weight: 700 });
    cyl(svg, 340, 70, 150, 48, "var(--green-soft)", "var(--green)");
    svg.text(340, 250, "cilindro", { size: 13, color: "var(--green)", weight: 700 });
  }
  function aUnion(svg, solid) {
    svg.view(470, 300);
    var f1 = solid ? "var(--accent)" : "var(--accent-soft)";
    var f2 = solid ? "var(--accent)" : "var(--green-soft)";
    var s1 = solid ? "var(--accent)" : "var(--accent)";
    var s2 = solid ? "var(--accent)" : "var(--green)";
    cyl(svg, 215, 150, 110, 48, f2, s2);
    svg.circle(215, 120, 72, { fill: f1, stroke: s1, strokeWidth: 2 });
    svg.text(215, 290, solid ? "lupa = círculo ∪ cilindro" : "posicionados e unidos", { size: 13, color: "var(--ink-dim)" });
  }
  function aTree(svg) {
    EX.Diagram.tree(svg, { id: "u", label: "∪", children: [{ id: "c", label: "círculo" }, { id: "y", label: "cilindro" }] }, { nodeShape: "box", highlight: ["u"] });
  }

  // ---- (b) DIFERENÇA: crescente = A − B ----
  function bPrim(svg) {
    svg.view(460, 300);
    svg.circle(205, 165, 88, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
    svg.circle(262, 118, 80, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
    svg.text(150, 215, "A", { size: 17, color: "var(--accent)", weight: 700 });
    svg.text(312, 86, "B", { size: 17, color: "var(--green)", weight: 700 });
  }
  function bResult(svg) {
    svg.view(460, 300);
    svg.rect(0, 0, 460, 300, { fill: "var(--bg-soft)" });
    svg.circle(205, 165, 88, { fill: "var(--accent)" });       // A
    svg.circle(262, 118, 80, { fill: "var(--bg-soft)" });      // − B (recorta)
    svg.circle(262, 118, 80, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: true });
    svg.text(180, 262, "A − B = crescente", { size: 14, color: "var(--ink-dim)", weight: 700 });
  }
  function bTree(svg) {
    EX.Diagram.tree(svg, { id: "d", label: "−", children: [{ id: "a", label: "A" }, { id: "b", label: "B" }] }, { nodeShape: "box", highlight: ["d"] });
  }

  var OPS =
    "<p>As operações de conjunto da CSG:</p>" +
    "<ul><li><span class='accent'>∪ união</span> — tudo que está em A <b>ou</b> em B;</li>" +
    "<li><span class='accent'>∩ interseção</span> — só o que está em A <b>e</b> em B (a sobreposição);</li>" +
    "<li><span class='accent'>− diferença</span> — o que está em A <b>mas não</b> em B (recorte).</li></ul>";

  function buildA() {
    return [
      {
        title: "As primitivas",
        body: "<p>O objeto (lupa/pirulito) é formado por duas primitivas: um <span class='accent'>círculo</span> " +
          "(a lente) e um <span style='color:var(--green)'>cilindro</span> (o cabo).</p>" + OPS,
        visual: { type: "svg", draw: aPrim },
      },
      {
        title: "Qual operação?",
        body: "<p>Precisamos juntar as duas peças <b>mantendo as duas inteiras</b> — nada é removido nem só a sobreposição interessa. " +
          "Logo a operação é a <span class='hl'>união (∪)</span>.</p>" +
          "<p>(∩ daria apenas a região onde as peças se cruzam; − apagaria parte de uma delas.)</p>",
        visual: { type: "svg", draw: function (s) { aUnion(s, false); } },
      },
      {
        title: "Resultado: união",
        body: "<p><b>lupa = círculo ∪ cilindro</b>. Na árvore CSG, um nó <span class='accent'>∪</span> com as duas primitivas como folhas.</p>",
        visual: { type: "svg", draw: function (s) { aUnion(s, true); } },
      },
      { title: "Árvore CSG", body: "<p>A expressão <code>círculo ∪ cilindro</code> como árvore booleana.</p>", visual: { type: "svg", draw: aTree } },
    ];
  }

  function buildB() {
    return [
      {
        title: "As primitivas",
        body: "<p>Temos dois círculos sobrepostos, <span class='accent'>A</span> e <span style='color:var(--green)'>B</span>.</p>" + OPS,
        visual: { type: "svg", draw: bPrim },
      },
      {
        title: "Qual operação?",
        body: "<p>O alvo é um <b>crescente</b> (lua): um disco com uma <b>mordida</b> no lugar do outro. " +
          "Isso é exatamente a <span class='hl'>diferença</span>: <code>A − B</code> " +
          "(o que está em A mas não em B).</p>" +
          "<p>(∪ daria a mancha dupla; ∩ daria só a lente da sobreposição.)</p>",
        visual: { type: "svg", draw: bPrim },
      },
      {
        title: "Resultado: diferença",
        body: "<p><b>crescente = A − B</b>. O segundo círculo funciona como <i>ferramenta de corte</i> sobre o primeiro.</p>",
        visual: { type: "svg", draw: bResult },
      },
      { title: "Árvore CSG", body: "<p>A expressão <code>A − B</code> como árvore booleana.</p>", visual: { type: "svg", draw: bTree } },
    ];
  }

  EX.registry.add({
    id: "q05",
    num: "5",
    subject: "Representação de Sólidos",
    title: "Operações de conjunto (CSG)",
    type: "computacional",
    hubDesc: "Lupa = círculo ∪ cilindro (união); crescente = A − B (diferença).",
    statement: "Indique as possíveis operações de conjunto (CSG) usadas na definição dos objetos: (a) lupa/pirulito e (b) crescente.",
    parts: [
      { label: "a) União", build: buildA },
      { label: "b) Diferença", build: buildB },
    ],
  });
})();
