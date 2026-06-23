/*
 * q06.js — Representação de Sólidos / Octree.
 * "Indique a árvore da Octree para o objeto" (4×4×4 com entalhe de 2 voxels),
 * critério de homogeneidade = preenchido ou não.
 *
 * Leitura adotada da figura (declarada ao aluno): cubo 4×4×4 totalmente cheio,
 * exceto um entalhe de 2 voxels de profundidade no topo-direito (uma seção em L
 * extrudada). Numeração dos octantes: índice = x' + 2·y' + 4·z' (x',y',z' ∈ {0,1}).
 * Resultado: octantes 5 e 7 vazios; os outros 6 cheios (octree de profundidade 1).
 * Passo final mostra a recursão quando um octante fica PARCIAL.
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Projeção isométrica simples do objeto (seção em L extrudada na profundidade).
  function iso(x, y, z) { return [212 + (x - y) * 24, 150 + (x + y) * 12 - z * 26]; }
  function poly(svg, pts, opts) { return svg.polygon(pts.map(function (p) { return iso(p[0], p[1], p[2]); }), opts); }
  function seg(svg, a, b, opts) { var A = iso(a[0], a[1], a[2]), B = iso(b[0], b[1], b[2]); return svg.line(A[0], A[1], B[0], B[1], opts); }
  function lbl(svg, p, t, color, dash) {
    var P = iso(p[0], p[1], p[2]);
    svg.text(P[0], P[1], t, { size: 12, weight: 700, color: color, cls: dash ? "dash" : null });
  }

  function object(svg) {
    svg.view(440, 300);
    var face = { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 2 };
    var top = { fill: "var(--bg-card)", stroke: "var(--ink)", strokeWidth: 2 };
    // faces (back→front)
    poly(svg, [[0, 0, 0], [0, 4, 0], [0, 4, 4], [0, 0, 4]], face);                 // esquerda (x=0)
    poly(svg, [[0, 0, 4], [2, 0, 4], [2, 4, 4], [0, 4, 4]], top);                  // topo alto (z=4)
    poly(svg, [[2, 0, 2], [4, 0, 2], [4, 4, 2], [2, 4, 2]], top);                  // topo do degrau (z=2)
    poly(svg, [[2, 0, 4], [2, 0, 2], [2, 4, 2], [2, 4, 4]], { fill: "var(--accent-soft)", stroke: "var(--ink)", strokeWidth: 2 }); // espelho do degrau (x=2)
    poly(svg, [[4, 0, 0], [4, 0, 2], [4, 4, 2], [4, 4, 0]], face);                 // direita (x=4)
    poly(svg, [[0, 0, 0], [4, 0, 0], [4, 0, 2], [2, 0, 2], [2, 0, 4], [0, 0, 4]], face); // frente (y=0), em L
    // linhas de octante (x=2, z=2)
    var g = { stroke: "var(--ink-mute)", strokeWidth: 1, dashed: true };
    seg(svg, [2, 0, 0], [2, 0, 2], g); seg(svg, [0, 0, 2], [4, 0, 2], g);
    seg(svg, [2, 0, 0], [2, 4, 0], g); seg(svg, [0, 2, 4], [2, 2, 4], g);
    // rótulos dos octantes do topo
    lbl(svg, [1, 1, 4], "4", "var(--ink)"); lbl(svg, [1, 3, 4], "6", "var(--ink)");
    lbl(svg, [3, 1, 3.1], "5 ∅", "var(--red)"); lbl(svg, [3, 3, 3.1], "7 ∅", "var(--red)");
    svg.text(220, 286, "4×4×4 · entalhe de 2 voxels (octantes 5 e 7 removidos)", { size: 12, color: "var(--ink-dim)" });
  }

  // Octrees
  function children(withStatus) {
    var full = ["0", "1", "2", "3", "4", "6"], empty = ["5", "7"];
    var ch = [];
    ["0", "1", "2", "3", "4", "5", "6", "7"].forEach(function (n) {
      var isEmpty = empty.indexOf(n) >= 0;
      ch.push({ id: "o" + n, label: withStatus ? (n + " " + (isEmpty ? "□" : "■")) : n });
    });
    return ch;
  }
  function treePlain(svg) {
    EX.Diagram.tree(svg, { id: "r", label: "4³", children: children(false) }, { nodeShape: "circle" });
  }
  function treeStatus(svg) {
    EX.Diagram.tree(svg, { id: "r", label: "4³", children: children(true) }, { nodeShape: "circle", highlight: ["o5", "o7"] });
  }
  function treeRecursion(svg) {
    EX.Diagram.tree(svg, {
      id: "p", label: "parcial", children: [
        { id: "w0", label: "■" }, { id: "w1", label: "■" }, { id: "w2", label: "■" }, { id: "w3", label: "■" },
        { id: "w4", label: "□" }, { id: "w5", label: "□" }, { id: "w6", label: "□" }, { id: "w7", label: "□" },
      ],
    }, { nodeShape: "circle", highlight: ["p"] });
  }

  var LEGEND = "<p class='muted'>■ cheio (homogêneo) · □ vazio (homogêneo) · ◧ parcial (subdivide).</p>";

  function build() {
    return [
      {
        title: "O objeto e a numeração dos octantes",
        body:
          "<p><b>Objeto adotado da figura:</b> um cubo <span class='hl'>4×4×4</span> totalmente cheio, " +
          "exceto um <b>entalhe de 2 voxels</b> de profundidade no topo (uma seção em L extrudada).</p>" +
          "<p>O critério de <b>homogeneidade</b> é \"o espaço está preenchido ou não\". Numeramos os 8 octantes por " +
          "<code>índice = x′ + 2·y′ + 4·z′</code> (cada coordenada vale 0 se &lt; 2, 1 se ≥ 2). " +
          "Os octantes <span style='color:var(--red)'>5 e 7</span> (topo, lado x≥2) ficam <b>vazios</b>.</p>",
        visual: { type: "svg", draw: object },
      },
      {
        title: "Raiz heterogênea → 8 octantes",
        body:
          "<p>O cubo inteiro <b>não é homogêneo</b> (tem parte cheia e parte vazia). Pelo critério, a " +
          "<span class='accent'>raiz</span> se subdivide nos <b>8 octantes</b> 0–7.</p>" +
          "<p>Agora classificamos cada octante.</p>",
        visual: { type: "svg", draw: treePlain },
      },
      {
        title: "Classificando os 8 octantes",
        body:
          "<p>Cada octante 2×2×2 é homogêneo:</p>" +
          "<ul><li><span class='ok'>Cheios</span>: 0, 1, 2, 3 (base) e 4, 6 (topo-esquerdo) → folhas ■;</li>" +
          "<li><span class='no'>Vazios</span>: 5, 7 (o entalhe) → folhas □.</li></ul>" +
          "<p>Como todos são homogêneos, a octree tem <b>profundidade 1</b>.</p>" + LEGEND,
        visual: { type: "svg", draw: treeStatus },
      },
      {
        title: "Octree final",
        body:
          "<p>A árvore da Octree do objeto: <b>raiz</b> (heterogênea) com <b>8 folhas</b> — " +
          "<span class='ok'>6 cheias</span> (0,1,2,3,4,6) e <span class='no'>2 vazias</span> (5,7).</p>" + LEGEND,
        visual: { type: "svg", draw: treeStatus },
      },
      {
        title: "Recursão: quando um octante é parcial",
        body:
          "<p>Se o entalhe <b>não coincidisse</b> com a fronteira dos octantes (ex.: 1 voxel de profundidade), " +
          "um octante ficaria <span class='hl'>parcial (◧)</span> — nem cheio nem vazio.</p>" +
          "<p>Nesse caso ele é <b>subdividido novamente</b> em 8 sub-octantes, e assim por diante até o nível " +
          "do <b>voxel</b>. É essa recursão adaptativa que economiza memória da Octree.</p>" + LEGEND,
        visual: { type: "svg", draw: treeRecursion },
      },
    ];
  }

  EX.registry.add({
    id: "q06",
    num: "6",
    subject: "Representação de Sólidos",
    title: "Árvore da Octree",
    type: "computacional",
    hubDesc: "Cubo 4×4×4 com entalhe → raiz + 8 octantes (6 cheios, 2 vazios).",
    statement: "Indique a árvore da Octree para o objeto (cubo 4×4×4 com entalhe de 2 voxels), usando como critério de homogeneidade o preenchimento ou não do espaço.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
