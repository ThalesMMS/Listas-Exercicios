/*
 * q11.js — Situações em que o sombreamento Flat é mais utilizado.
 * Diagrama SVG: esfera low-poly facetada (uma cor por face) e um cubo (poliedro real).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  // Esfera aproximada por faixas horizontais planas (flat): 1 cor por faixa.
  function facetSphere(svg, g, cx, cy, R, n) {
    function w(y) { var t = R * R - (y - cy) * (y - cy); return t > 0 ? Math.sqrt(t) : 0; }
    for (var b = 0; b < n; b++) {
      var y0 = cy - R + b * (2 * R / n), y1 = y0 + 2 * R / n;
      var w0 = w(y0), w1 = w(y1), ymid = (y0 + y1) / 2;
      var lit = 0.32 + 0.62 * (1 - Math.abs(ymid - (cy - R * 0.35)) / (R * 1.5)); // frente-cima mais clara
      lit = Math.max(0.16, Math.min(1, lit));
      svg.polygon([[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]],
        { fill: "var(--accent)", opacity: lit, stroke: "var(--bg)", strokeWidth: 1, parent: g });
    }
    // direção da luz
    svg.arrow(cx - R - 30, cy - R - 10, cx - R * 0.5, cy - R * 0.5, { color: "var(--yellow)", strokeWidth: 2, head: 9, parent: g });
    svg.text(cx - R - 18, cy - R - 22, "luz", { size: 11, color: "var(--yellow)", parent: g });
  }

  function cube(svg, g, cx, cy) {
    var top = [[cx, cy - 60], [cx + 62, cy - 24], [cx, cy + 12], [cx - 62, cy - 24]];
    var left = [[cx - 62, cy - 24], [cx, cy + 12], [cx, cy + 84], [cx - 62, cy + 48]];
    var right = [[cx + 62, cy - 24], [cx, cy + 12], [cx, cy + 84], [cx + 62, cy + 48]];
    svg.polygon(top, { fill: "var(--accent)", opacity: 0.95, stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.polygon(left, { fill: "var(--accent)", opacity: 0.55, stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.polygon(right, { fill: "var(--accent)", opacity: 0.35, stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 360);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gS = grp("sphere"), gC = grp("cube");
    svg.text(220, 58, "Esfera low-poly (Flat)", { size: 14, weight: 700, color: "var(--ink)", parent: gS });
    facetSphere(svg, gS, 220, 200, 92, 8);
    svg.text(220, 322, "facetas visíveis: 1 cor por face", { size: 11.5, color: "var(--ink-dim)", parent: gS });
    svg.text(560, 58, "Cubo (poliedro real)", { size: 14, weight: 700, color: "var(--ink)", parent: gC });
    cube(svg, gC, 560, 190);
    svg.text(560, 322, "faces planas → Flat é exato", { size: 11.5, color: "var(--ink-dim)", parent: gC });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Flat shading: uma cor por face",
        body:
          "<p><b>Sombreamento</b> (shading) é como espalhamos pelo polígono a iluminação calculada " +
          "em poucos pontos. No <b>Flat (constante)</b>, calcula-se <b>uma única intensidade por " +
          "polígono</b>: usa-se <b>uma normal por face</b>, o modelo de iluminação é avaliado " +
          "<b>uma só vez</b> (em geral no centroide) e o valor pinta a face inteira.</p>" +
          "<p>O resultado: cada face fica com uma cor <b>chapada</b>, e as facetas ficam visíveis em " +
          "superfícies curvas aproximadas por polígonos (ao lado). É o oposto de Gouraud/Phong, que " +
          "<b>suavizam</b> a transição entre faces (q12).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Como funciona: a normal da face",
        body:
          "<p>Uma <b>normal por face</b> → uma cor por face. Numa superfície curva aproximada por " +
          "polígonos, isso produz o aspecto <b>facetado</b> e as <b>bandas de Mach</b> nas " +
          "transições — faixas de contraste exagerado que o olho \"inventa\" na borda entre duas " +
          "cores chapadas (inibição lateral da retina), realçando ainda mais as arestas.</p>" +
          "<p>É o método de sombreamento <b>mais barato</b>: uma avaliação de iluminação por " +
          "polígono, contra uma por vértice (Gouraud) ou por pixel (Phong). Por isso é rápido, mas " +
          "denuncia a malha.</p>",
        visual: svgStep(["sphere"]),
      },
      {
        title: "Ideal para poliedros reais",
        body:
          "<p>Quando a superfície é <b>de fato plana e facetada</b> (cubos, cristais, objetos " +
          "poliédricos), o Flat é <b>fisicamente correto</b> — cada face realmente tem uma " +
          "orientação (normal) única, então uma cor por face é a resposta certa.</p>" +
          "<p>Aqui não há \"erro\" a esconder: as facetas <b>são</b> o objeto. Suavizar (Gouraud/" +
          "Phong) seria até <b>errado</b>, arredondando quinas que deveriam ser vivas.</p>",
        visual: svgStep(["cube"]),
      },
      S.prosCons({
        title: "Em que situações usar Flat",
        intro: "<p>Resumo das situações favoráveis e das limitações.</p>",
        items: [{
          name: "Sombreamento Flat",
          pros: [
            "Objetos poliédricos / facetados reais (cubos, cristais).",
            "Quando se quer baixo custo / desempenho (tempo real limitado, prévias rápidas).",
            "Faces pequenas o bastante para o facetamento não incomodar.",
            "Estética low-poly intencional.",
            "Quando a precisão visual da curvatura não é crítica.",
          ],
          cons: [
            "Superfícies curvas mostram facetas evidentes.",
            "Bandas de Mach nas bordas entre faces.",
            "Disfarçar a curvatura exige MUITOS polígonos (mais geometria).",
            "Brilho especular fica errado (a face inteira acende ou apaga).",
          ],
        }],
      }),
      S.concept({
        title: "Resumo",
        body:
          "<p>O <b>Flat</b> é mais usado quando o objeto é <b>realmente facetado</b> ou quando o " +
          "<b>desempenho</b> importa mais que a suavidade — em poliedros, cenas low-poly, prévias " +
          "e tempo real com poucos recursos.</p>" +
          "<p>Para superfícies curvas suaves, prefere-se Gouraud ou Phong (próxima questão).</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q11-flat-shading",
    num: "11",
    subject: "Computação Gráfica — Lista 3",
    section: "III) Sombreamento",
    title: "Quando usar o sombreamento Flat",
    type: "conceitual",
    tags: ["sombreamento", "flat", "low-poly"],
    hubDesc: "Uma cor por face: ideal para poliedros e cenas de baixo custo.",
    statement: "Em que situações o <strong>sombreamento Flat</strong> é mais utilizado?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
