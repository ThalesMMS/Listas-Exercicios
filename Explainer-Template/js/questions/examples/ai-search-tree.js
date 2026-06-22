/*
 * ai-search-tree.js — Árvore de jogo com o algoritmo MINIMAX.
 *
 * Três níveis de decisão: MAX (raiz) / MIN / MAX, e 8 folhas com utilidades:
 *   [3, 5, 6, 9, 1, 2, 0, -1]
 *
 * Cálculo bottom-up:
 *   MAX (sobre folhas): max(3,5)=5  max(6,9)=9  max(1,2)=2  max(0,-1)=0
 *   MIN:                min(5,9)=5             min(2,0)=0
 *   MAX (raiz):         max(5,0)=5
 * Caminho ótimo: raiz -> MIN(5) -> MAX(5) -> folha 5.
 *
 * Usa EX.Diagram.tree: rótulo = valor; destaque (amarelo) nos nós já avaliados
 * e nas arestas do caminho ótimo.
 */
(function () {
  "use strict";
  var EX = window.EX;

  var LEAVES = [3, 5, 6, 9, 1, 2, 0, -1];

  // Monta a árvore com ids estáveis. Níveis: root(MAX) -> n*(MIN) -> m*(MAX) -> folhas.
  function leaf(id, v) { return { id: id, label: String(v), _val: v, _kind: "leaf" }; }
  function maxNode(id, a, b) { return { id: id, label: "?", _kind: "MAX", children: [a, b] }; }
  function minNode(id, a, b) { return { id: id, label: "?", _kind: "MIN", children: [a, b] }; }

  var L = LEAVES.map(function (v, i) { return leaf("L" + i, v); });
  var m1 = maxNode("m1", L[0], L[1]);
  var m2 = maxNode("m2", L[2], L[3]);
  var m3 = maxNode("m3", L[4], L[5]);
  var m4 = maxNode("m4", L[6], L[7]);
  var n1 = minNode("n1", m1, m2);
  var n2 = minNode("n2", m3, m4);
  var ROOT = { id: "root", label: "?", _kind: "MAX", children: [n1, n2] };

  // Avalia minimax preenchendo _val e _best (filho escolhido) em cada nó.
  function evaluate(node) {
    if (node._kind === "leaf") return node._val;
    var vals = node.children.map(evaluate);
    var pick = 0;
    if (node._kind === "MAX") {
      for (var i = 1; i < vals.length; i++) if (vals[i] > vals[pick]) pick = i;
    } else {
      for (var j = 1; j < vals.length; j++) if (vals[j] < vals[pick]) pick = j;
    }
    node._val = vals[pick];
    node._best = node.children[pick];
    return node._val;
  }
  evaluate(ROOT);

  // Caminho ótimo (sequência de ids da raiz até a folha escolhida).
  var OPTIMAL = (function () {
    var ids = [], n = ROOT;
    while (n) {
      ids.push(n.id);
      n = n._best;
    }
    return ids;
  })();
  // Arestas do caminho ótimo (pares consecutivos).
  var OPT_EDGES = [];
  for (var oi = 0; oi + 1 < OPTIMAL.length; oi++) OPT_EDGES.push([OPTIMAL[oi], OPTIMAL[oi + 1]]);

  // Rótulos por fase: enquanto não revelados, nós internos mostram "?".
  function labelsWith(resolved) {
    // resolved: conjunto de ids cujo valor já foi calculado
    var map = {};
    (function walk(n) {
      if (n._kind === "leaf") { map[n.id] = String(n._val); return; }
      map[n.id] = resolved[n.id] ? String(n._val) : "?";
      n.children.forEach(walk);
    })(ROOT);
    return map;
  }

  // Aplica rótulos temporários a uma cópia da árvore (sem mutar a original entre passos).
  function treeWithLabels(labels) {
    function clone(n) {
      var c = { id: n.id, label: labels[n.id], _kind: n._kind };
      if (n.children) c.children = n.children.map(clone);
      return c;
    }
    return clone(ROOT);
  }

  function drawStep(svg, resolvedSet, highlight, edges) {
    var tree = treeWithLabels(labelsWith(resolvedSet));
    EX.Diagram.tree(svg, tree, {
      nodeShape: "circle",
      highlight: highlight,
      highlightEdges: edges,
      view: [760, 460],
    });
  }

  function build() {
    var steps = [];

    steps.push({
      title: "A árvore de jogo",
      body:
        "<p>Dois jogadores se alternam. A raiz é <b>MAX</b> (quer o maior valor), o nível " +
        "seguinte é <b>MIN</b> (quer o menor) e o último é <b>MAX</b> de novo. " +
        "As <b>folhas</b> são as utilidades finais.</p>" +
        "<p>O <span class='accent'>minimax</span> calcula o valor de cada nó <b>de baixo p/ cima</b>.</p>",
      visual: { type: "svg", draw: function (svg) { drawStep(svg, {}, [], []); } },
    });

    steps.push({
      title: "Nível MAX (acima das folhas)",
      body:
        "<p>Cada nó MAX escolhe o <b>maior</b> dos seus dois filhos:</p>" +
        "<ul>" +
        "<li>max(3, 5) = <span class='hl'>5</span></li>" +
        "<li>max(6, 9) = <span class='hl'>9</span></li>" +
        "<li>max(1, 2) = <span class='hl'>2</span></li>" +
        "<li>max(0, -1) = <span class='hl'>0</span></li>" +
        "</ul>",
      visual: {
        type: "svg",
        draw: function (svg) {
          drawStep(svg, { m1: 1, m2: 1, m3: 1, m4: 1 }, ["m1", "m2", "m3", "m4"], []);
        },
      },
    });

    steps.push({
      title: "Nível MIN",
      body:
        "<p>Cada nó MIN escolhe o <b>menor</b> dos filhos já calculados:</p>" +
        "<ul>" +
        "<li>min(5, 9) = <span class='hl'>5</span></li>" +
        "<li>min(2, 0) = <span class='hl'>0</span></li>" +
        "</ul>",
      visual: {
        type: "svg",
        draw: function (svg) {
          drawStep(svg, { m1: 1, m2: 1, m3: 1, m4: 1, n1: 1, n2: 1 }, ["n1", "n2"], []);
        },
      },
    });

    steps.push({
      title: "Raiz MAX",
      body:
        "<p>A raiz (MAX) escolhe o <b>maior</b>: max(5, 0) = <span class='ok'>5</span>. " +
        "Esse é o <b>valor minimax</b> do jogo.</p>",
      visual: {
        type: "svg",
        draw: function (svg) {
          drawStep(svg, { m1: 1, m2: 1, m3: 1, m4: 1, n1: 1, n2: 1, root: 1 }, ["root"], []);
        },
      },
    });

    steps.push({
      title: "Caminho ótimo",
      body:
        "<p>Seguindo as escolhas de cada jogador a partir da raiz, o jogo ótimo é " +
        "<code>raiz -> 5 (MIN) -> 5 (MAX) -> folha 5</code>, destacado em amarelo.</p>" +
        "<p>Valor minimax = <span class='ok'>5</span>.</p>",
      visual: {
        type: "svg",
        draw: function (svg) {
          drawStep(
            svg,
            { m1: 1, m2: 1, m3: 1, m4: 1, n1: 1, n2: 1, root: 1 },
            OPTIMAL,
            OPT_EDGES
          );
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "ai-search-tree",
    num: "♟",
    subject: "Inteligência Artificial",
    section: "Busca",
    title: "Minimax em árvore de jogo",
    type: "computacional",
    tags: ["busca", "minimax", "jogos"],
    hubDesc: "Propagação bottom-up de valores e caminho ótimo MAX/MIN.",
    statement:
      "Aplique <strong>minimax</strong> a uma árvore MAX/MIN/MAX com folhas " +
      "<code>[3, 5, 6, 9, 1, 2, 0, -1]</code> e encontre o valor e o caminho ótimo.",
    parts: [{ label: "Minimax", build: build }],
  });
})();
