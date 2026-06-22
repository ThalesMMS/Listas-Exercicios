/*
 * q06.js — Otimizações do método de Ray Casting.
 * Diagrama SVG: volume envolvente (esquerda) e subdivisão espacial (direita).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function star(svg, parent, cx, cy, R, r, opts) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var ang = (-90 + k * 36) * Math.PI / 180;
      var rr = (k % 2 === 0) ? R : r;
      pts.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
    }
    opts.parent = parent;
    return svg.polygon(pts, opts);
  }

  function scene(svg, active) {
    svg.view(760, 440);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.12); return g; }
    var gBV = grp("bv");
    var gGrid = grp("grid");

    // ---- Volume envolvente ----
    svg.text(200, 96, "Volume envolvente", { size: 14, weight: 700, color: "var(--ink)", parent: gBV });
    svg.rect(120, 150, 160, 165, { fill: "none", stroke: "var(--accent)", strokeWidth: 2, dashed: "7 5", rx: 4, parent: gBV });
    star(svg, gBV, 200, 232, 58, 24, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
    // raio que acerta a caixa
    svg.arrow(40, 178, 300, 286, { color: "var(--yellow)", strokeWidth: 2.5, head: 10, parent: gBV });
    svg.text(70, 150, "acerta a caixa → testa a geometria", { size: 11, color: "var(--yellow)", parent: gBV, anchor: "start" });
    // raio que erra a caixa
    svg.arrow(40, 372, 300, 404, { color: "var(--ink-mute)", strokeWidth: 2.5, head: 10, parent: gBV });
    svg.text(70, 392, "erra a caixa → descarta sem testar", { size: 11, color: "var(--ink-dim)", parent: gBV, anchor: "start" });

    // ---- Subdivisão espacial ----
    svg.text(560, 96, "Subdivisão espacial", { size: 14, weight: 700, color: "var(--ink)", parent: gGrid });
    var X0 = 430, Y0 = 130, CW = 65, CH = 52, N = 4;
    // células percorridas (diagonal) realçadas
    for (var d = 0; d < N; d++) {
      svg.rect(X0 + d * CW, Y0 + d * CH, CW, CH, { fill: "var(--accent-soft)", parent: gGrid });
    }
    // grade
    var i;
    for (i = 0; i <= N; i++) {
      svg.line(X0 + i * CW, Y0, X0 + i * CW, Y0 + N * CH, { stroke: "var(--ink-mute)", strokeWidth: 1, parent: gGrid });
      svg.line(X0, Y0 + i * CH, X0 + N * CW, Y0 + i * CH, { stroke: "var(--ink-mute)", strokeWidth: 1, parent: gGrid });
    }
    // objetos em algumas células
    [[527, 156, "var(--purple)"], [657, 208, "var(--orange)"], [462, 312, "var(--green)"], [592, 260, "var(--pink)"]].forEach(function (o) {
      svg.circle(o[0], o[1], 15, { fill: o[2], opacity: 0.85, parent: gGrid });
    });
    // raio percorrendo a diagonal
    svg.arrow(X0 - 18, Y0 + 6, X0 + N * CW - 8, Y0 + N * CH - 6, { color: "var(--yellow)", strokeWidth: 2.5, head: 11, parent: gGrid });
    svg.text(560, Y0 + N * CH + 24, "o raio só testa as células no caminho", { size: 11, color: "var(--ink-dim)", parent: gGrid });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "O gargalo: testar todo raio contra todo objeto",
        body:
          "<p>O custo dominante do Ray Casting é a <b>interseção raio-objeto</b>. Sem otimizar, " +
          "cada raio testaria <b>todos</b> os objetos da cena: com P pixels e N objetos, o custo é " +
          "<b>O(P · N)</b> — caríssimo (uma imagem HD tem ~2 milhões de raios primários, antes de " +
          "qualquer raio secundário).</p>" +
          "<p>As otimizações têm um objetivo comum: <b>reduzir o número de testes de interseção</b> " +
          "por raio, idealmente de O(N) para <b>O(log N)</b>. Há duas grandes famílias — " +
          "<b>volumes envolventes</b> e <b>subdivisão espacial</b> — mais técnicas de " +
          "<b>coerência</b> e <b>parada antecipada</b>.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Volumes envolventes (bounding volumes)",
        body:
          "<p>Envolve-se cada objeto (ou grupo) em um volume <b>simples e barato de testar</b> — uma " +
          "<b>esfera</b> (um teste de distância) ou uma <b>caixa alinhada aos eixos (AABB)</b> (o " +
          "<i>slab test</i>). O raio é testado primeiro contra o envoltório:</p>" +
          "<ul><li>se <b>erra</b> o volume, descarta o objeto <b>sem tocar</b> na geometria " +
          "detalhada (que pode ter milhares de triângulos);</li>" +
          "<li>se <b>acerta</b>, aí sim testa a geometria real.</li></ul>" +
          "<p>Há um <b>trade-off</b>: a esfera é o teste mais barato, mas costuma sobrar espaço " +
          "vazio; a AABB é mais justa. Agrupados numa <b>hierarquia (BVH)</b> — uma árvore de " +
          "volumes dentro de volumes — um único teste que falha <b>descarta um ramo inteiro</b> de " +
          "objetos, levando o custo a O(log N).</p>",
        visual: svgStep(["bv"]),
      },
      {
        title: "Subdivisão espacial",
        body:
          "<p>Em vez de envolver objetos, divide-se o <b>espaço</b> em células e guarda-se em cada " +
          "uma quais objetos a ocupam. O raio <b>caminha</b> pelas células que cruza e só testa os " +
          "objetos ali dentro. Principais estruturas:</p>" +
          "<ul><li><b>Grade uniforme</b> — células de tamanho fixo, percorridas com um algoritmo " +
          "tipo DDA 3D; simples, mas ruim com objetos de tamanhos muito diferentes;</li>" +
          "<li><b>Octree</b> — subdivide só onde há detalhe (adaptativa);</li>" +
          "<li><b>kd-tree / BSP</b> — planos de corte que se adaptam à distribuição dos objetos.</li></ul>" +
          "<p>Regiões vazias são <b>puladas</b> e objetos distantes do raio nunca são testados. Como " +
          "o raio para na <b>primeira</b> célula com acerto, o trabalho cai drasticamente.</p>",
        visual: svgStep(["grid"]),
      },
      {
        title: "Coerência e parada antecipada",
        body:
          "<p>Outras otimizações importantes:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip", title: "Coerência",
              html: "Pixels e quadros <b>vizinhos</b> costumam atingir os mesmos objetos. " +
                "Reaproveitar resultados (coerência <b>espacial</b>, <b>temporal</b> e de <b>raios</b>) " +
                "evita recalcular do zero — ex.: começar o teste pelo objeto que o pixel vizinho " +
                "atingiu.",
            });
            EX.Content.callout(host, {
              kind: "tip", title: "Parada antecipada / profundidade",
              html: "Em traçado recursivo, <b>limitar a profundidade</b> de reflexões/refrações e " +
                "encerrar quando a contribuição acumulada fica desprezível (<i>early termination / " +
                "adaptive depth control</i>) corta trabalho inútil. Para sombras, qualquer acerto " +
                "<b>já basta</b> (não precisa do mais próximo).",
            });
            EX.Content.callout(host, {
              kind: "tip", title: "Baratear o próprio teste",
              html: "Usar representações mais simples (cascas, <i>imposters</i>) e <b>nível de " +
                "detalhe (LOD)</b> para objetos distantes reduz o custo de cada interseção, não só a " +
                "quantidade delas.",
            });
          },
        },
      },
      S.comparison({
        title: "Resumo: otimizações",
        intro: "<p>Todas reduzem o número de testes raio-objeto.</p>",
        headers: ["Otimização", "O que economiza"],
        rows: [
          ["Volume envolvente", "Pula a geometria detalhada quando o raio erra o envoltório"],
          ["Hierarquia (BVH)", "Descarta grupos inteiros de objetos de uma vez"],
          ["Subdivisão espacial (octree, kd-tree)", "Testa só objetos nas células que o raio cruza"],
          ["Coerência (espacial/temporal)", "Reaproveita resultados de pixels/quadros vizinhos"],
          ["Limite de profundidade / early-out", "Corta recursão e contribuições desprezíveis"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q06-otimizacoes-raycasting",
    num: "6",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Otimizações do Ray Casting",
    type: "conceitual",
    tags: ["ray casting", "BVH", "octree", "otimização"],
    hubDesc: "Volumes envolventes, subdivisão espacial, coerência e parada antecipada.",
    statement: "Quais são as <strong>otimizações para o método de Ray Casting</strong>? Explique.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
