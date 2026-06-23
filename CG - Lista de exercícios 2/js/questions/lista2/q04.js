/*
 * q04.js — Representação de Sólidos.
 * "Defina as representações": Sweep, CSG, Enumeração espacial (voxels), Octree,
 * BSP e Fractal (Mandelbrot). Um passo por técnica, com ilustração própria
 * (SVG; o fractal é amostrado no canvas).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // (a) Sweep: perfil 2D varrido → sólido 3D.
  function sweep(svg) {
    svg.view(460, 260);
    // perfil
    svg.polygon([[60, 70], [120, 70], [120, 120], [90, 120], [90, 190], [60, 190]], {
      fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2,
    });
    svg.text(90, 50, "perfil 2D", { size: 12, color: "var(--accent)" });
    svg.arrow(160, 130, 230, 130, { color: "var(--ink-mute)", head: 11 });
    svg.text(195, 116, "varrer", { size: 12, color: "var(--ink-dim)" });
    // sólido extrudado (frente + fundo deslocado)
    var F = [[270, 70], [330, 70], [330, 120], [300, 120], [300, 190], [270, 190]];
    var d = [34, -26];
    var B = F.map(function (p) { return [p[0] + d[0], p[1] + d[1]]; });
    var i;
    for (i = 0; i < F.length; i++) svg.line(F[i][0], F[i][1], B[i][0], B[i][1], { stroke: "var(--ink-mute)", strokeWidth: 1.5 });
    svg.polygon(B, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: true });
    svg.polygon(F, { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 2 });
    svg.text(320, 212, "sólido 3D", { size: 12, color: "var(--ink-dim)" });
  }

  // (b) CSG: árvore booleana de primitivas.
  function csg(svg) {
    EX.Diagram.tree(svg, {
      id: "op", label: "∪", children: [
        { id: "a", label: "esfera" },
        { id: "b", label: "cilindro" },
      ],
    }, { nodeShape: "box", highlight: ["op"] });
  }

  // (c) Voxels: grade de ocupação.
  function voxels(svg) {
    svg.view(460, 280);
    var ox = 130, oy = 56, n = 6, m = 5, s = 34;
    var filled = { "1,1": 1, "2,1": 1, "1,2": 1, "2,2": 1, "3,2": 1, "2,3": 1, "3,3": 1, "4,2": 1, "3,1": 1 };
    for (var j = 0; j < m; j++) for (var i = 0; i < n; i++) {
      svg.rect(ox + i * s, oy + j * s, s, s, {
        fill: filled[i + "," + j] ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: "var(--border)", strokeWidth: 1,
      });
    }
    svg.text(ox + n * s / 2, oy - 18, "grade de ocupação (voxels)", { size: 13, color: "var(--ink-dim)" });
    svg.text(ox + n * s / 2, oy + m * s + 22, "em 3D: o volume é dividido em células cúbicas", { size: 12, color: "var(--ink-mute)" });
  }

  // (d) Octree: subdivisão recursiva (quadtree como análogo 2D).
  function octree(svg) {
    svg.view(440, 300);
    var X = 110, Y = 36, S = 220;
    svg.rect(X, Y + S / 2, S / 2, S / 2, { fill: "var(--accent-soft)", stroke: "none" }); // octante cheio
    svg.rect(X, Y, S, S, { fill: "none", stroke: "var(--accent)", strokeWidth: 2 });
    svg.line(X + S / 2, Y, X + S / 2, Y + S, { stroke: "var(--accent)", strokeWidth: 2 });
    svg.line(X, Y + S / 2, X + S, Y + S / 2, { stroke: "var(--accent)", strokeWidth: 2 });
    var qx = X + S / 2, qy = Y, qs = S / 2; // subdivide quadrante sup-direito
    svg.line(qx + qs / 2, qy, qx + qs / 2, qy + qs, { stroke: "var(--green)", strokeWidth: 1.5 });
    svg.line(qx, qy + qs / 2, qx + qs, qy + qs / 2, { stroke: "var(--green)", strokeWidth: 1.5 });
    svg.text(X + S / 2, Y + S + 28, "subdivisão recursiva — 2D: quadtree · 3D: octree (8 octantes)", { size: 12, color: "var(--ink-dim)" });
  }

  // (e) BSP: partição por planos + árvore binária.
  function bsp(svg) {
    svg.view(470, 250);
    svg.rect(40, 36, 210, 180, { fill: "var(--bg-soft)", stroke: "var(--border)", strokeWidth: 1.5 });
    svg.line(40, 150, 250, 84, { stroke: "var(--accent)", strokeWidth: 2.5 });
    svg.text(150, 132, "h", { size: 15, color: "var(--accent)", weight: 700 });
    svg.arrow(150, 121, 162, 95, { color: "var(--accent)", head: 8 });
    svg.circle(190, 70, 9, { fill: "var(--orange)" }); svg.text(190, 70, "B", { size: 11, color: "var(--bg)", weight: 700 });
    svg.circle(95, 185, 9, { fill: "var(--green)" }); svg.text(95, 185, "A", { size: 11, color: "var(--bg)", weight: 700 });
    svg.text(205, 52, "frente", { size: 11, color: "var(--ink-mute)" });
    svg.text(78, 208, "trás", { size: 11, color: "var(--ink-mute)" });
    var tx = 380;
    svg.line(tx, 70, tx - 40, 120, { stroke: "var(--ink-mute)", strokeWidth: 2 });
    svg.line(tx, 70, tx + 40, 120, { stroke: "var(--ink-mute)", strokeWidth: 2 });
    svg.circle(tx, 56, 18, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 2 }); svg.text(tx, 56, "h", { size: 15, weight: 700 });
    svg.circle(tx - 40, 134, 16, { fill: "var(--bg-soft)", stroke: "var(--orange)", strokeWidth: 2 }); svg.text(tx - 40, 134, "B", { size: 12, weight: 700 });
    svg.circle(tx + 40, 134, 16, { fill: "var(--bg-soft)", stroke: "var(--green)", strokeWidth: 2 }); svg.text(tx + 40, 134, "A", { size: 12, weight: 700 });
    svg.text(tx - 40, 162, "frente", { size: 10, color: "var(--ink-mute)" });
    svg.text(tx + 40, 162, "trás", { size: 10, color: "var(--ink-mute)" });
  }

  // (f) Fractal: conjunto de Mandelbrot amostrado no canvas.
  function mandelbrot(plane) {
    var COL = EX.CartesianPlane.COLORS;
    var ctx = plane.ctx;
    var stride = 3, N = 50;
    for (var sy = 0; sy < plane.cssH; sy += stride) {
      for (var sx = 0; sx < plane.cssW; sx += stride) {
        var cx = plane.xmin + (sx - plane.offsetX) / plane.scale;
        var cy = plane.ymax - (sy - plane.offsetY) / plane.scale;
        var zx = 0, zy = 0, i = 0;
        while (i < N && zx * zx + zy * zy <= 4) { var t = zx * zx - zy * zy + cx; zy = 2 * zx * zy + cy; zx = t; i++; }
        var col;
        if (i >= N) col = COL.purple;
        else if (i < 4) col = COL.bg;
        else if (i < 7) col = COL.accentSoft;
        else if (i < 11) col = COL.accent;
        else if (i < 16) col = COL.cyan;
        else if (i < 26) col = COL.green;
        else col = COL.yellow;
        ctx.fillStyle = col;
        ctx.fillRect(sx, sy, stride, stride);
      }
    }
  }

  function build() {
    return [
      {
        title: "a) Sweep (varredura)",
        body:
          "<p>Gera um sólido <b>varrendo</b> um perfil/contorno 2D ao longo de um caminho:</p>" +
          "<ul><li><b>Translacional</b> (extrusão) — perfil arrastado em linha reta;</li>" +
          "<li><b>Rotacional</b> (torno) — perfil girado em torno de um eixo.</li></ul>" +
          "<p>Compacto e intuitivo para peças com simetria; limitado para formas arbitrárias.</p>",
        visual: { type: "svg", draw: sweep },
      },
      {
        title: "b) CSG (Constructive Solid Geometry)",
        body:
          "<p>Representa o sólido como uma <b>árvore booleana</b>: <span class='hl'>primitivas</span> " +
          "(esfera, cubo, cilindro…) nas folhas e <b>operações de conjunto</b> nos nós " +
          "(<span class='accent'>∪ união</span>, <span class='accent'>∩ interseção</span>, " +
          "<span class='accent'>− diferença</span>) + transformações.</p>" +
          "<p>Exato, conciso e fácil de editar — base do Q5.</p>",
        visual: { type: "svg", draw: csg },
      },
      {
        title: "c) Enumeração espacial (voxels)",
        body:
          "<p>O espaço é dividido numa <b>grade regular</b> de células cúbicas (<span class='hl'>voxels</span>); " +
          "marca-se cada célula como <b>cheia</b> ou <b>vazia</b> (ocupação).</p>" +
          "<p>Simples e uniforme, bom para dados volumétricos (ex.: tomografia), mas o custo de memória " +
          "cresce com <b>O(n³)</b>.</p>",
        visual: { type: "svg", draw: voxels },
      },
      {
        title: "d) Octree",
        body:
          "<p><b>Enumeração espacial adaptativa</b>: subdivide o cubo recursivamente em " +
          "<span class='hl'>8 octantes</span> e só continua dividindo as regiões <b>não homogêneas</b> " +
          "(parcialmente cheias).</p>" +
          "<p>Gasta muito menos memória que voxels uniformes em regiões homogêneas — construída no Q6 " +
          "(em 2D, o análogo é a <i>quadtree</i> com 4 quadrantes).</p>",
        visual: { type: "svg", draw: octree },
      },
      {
        title: "e) BSP (Binary Space Partitioning)",
        body:
          "<p>Particiona o espaço <b>recursivamente por planos</b>. Cada nó guarda um plano e separa o " +
          "que está à <span class='hl'>frente</span> (lado da normal) do que está <span class='hl'>atrás</span>, " +
          "gerando uma <b>árvore binária</b>.</p>" +
          "<p>Permite ordenar superfícies por profundidade (pintor) e testes de visibilidade — aplicada no Q7.</p>",
        visual: { type: "svg", draw: bsp },
      },
      {
        title: "f) Fractal (algoritmo de Mandelbrot)",
        body:
          "<p>Formas <b>autossimilares</b> definidas por <b>recursão/iteração</b>. O conjunto de Mandelbrot " +
          "é o conjunto dos <code>c ∈ ℂ</code> para os quais <code>z ← z² + c</code> (com z₀ = 0) " +
          "<b>não diverge</b>.</p>" +
          "<p>Cada pixel ao lado é colorido pelo nº de iterações até |z| &gt; 2; em " +
          "<span style='color:var(--purple)'>roxo</span>, os pontos que ficam no conjunto. " +
          "Descreve detalhe infinito com pouquíssima informação.</p>",
        visual: { type: "plane", bounds: [-2.3, 0.9, -1.35, 1.35], draw: mandelbrot },
      },
    ];
  }

  EX.registry.add({
    id: "q04",
    num: "4",
    subject: "Representação de Sólidos",
    title: "Defina as representações de sólidos",
    type: "conceitual",
    hubDesc: "Sweep, CSG, voxels, Octree, BSP e fractais (Mandelbrot ao vivo).",
    statement: "Defina as representações: a) Sweep · b) CSG · c) Enumeração espacial (voxels) · d) Octree · e) BSP · f) Fractal (algoritmo de Mandelbrot).",
    parts: [{ label: "Definições", build: build }],
  });
})();
