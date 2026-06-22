/*
 * tree.js — EX.Diagram.tree: árvore com LAYOUT AUTOMÁTICO (SVG).
 *
 * Usado para: árvores de derivação (sintática), árvores de busca/jogo (IA),
 * árvores binárias de busca (BST), heaps etc.
 *
 * Algoritmo de layout: x por percurso in-order (um contador incremental que
 * avança a cada FOLHA / nó visitado da esquerda p/ direita), y por profundidade.
 * Nós internos recebem a média do x dos filhos — produz uma árvore "centrada".
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Diagram = EX.Diagram || {};

  // Normaliza opts.shown / array de ids -> objeto-conjunto {id:true}.
  function toSet(v) {
    var set = {};
    if (!v) return set;
    if (v instanceof Array) {
      v.forEach(function (k) { set[k] = true; });
    } else if (typeof v.forEach === "function") {
      // Set nativo
      v.forEach(function (k) { set[k] = true; });
    } else if (typeof v === "object") {
      for (var k in v) if (v.hasOwnProperty(k)) set[k] = true;
    }
    return set;
  }

  // Achata a árvore atribuindo {x,y,depth} a cada nó.
  // x: contador in-order (folha = passo); interno = média dos filhos.
  function layout(root) {
    var nodes = []; // ordem de descoberta
    var counter = { x: 0 };
    function visit(node, depth) {
      if (!node) return;
      node._depth = depth;
      nodes.push(node);
      var kids = node.children || [];
      if (kids.length === 0) {
        node._gx = counter.x;
        counter.x += 1;
      } else {
        var first = null, last = null;
        kids.forEach(function (c) {
          visit(c, depth + 1);
          if (first == null) first = c._gx;
          last = c._gx;
        });
        node._gx = (first + last) / 2;
      }
    }
    visit(root, 0);
    return nodes;
  }

  // Coleta arestas pai->filho como [parentId, childId].
  function collectEdges(root) {
    var edges = [];
    (function walk(n) {
      (n.children || []).forEach(function (c) {
        edges.push([n.id, c.id, n, c]);
        walk(c);
      });
    })(root);
    return edges;
  }

  /*
   * EX.Diagram.tree(svg, root, opts)
   *   root: { id, label, children: [...] }
   *   opts:
   *     shown:          Set/array de ids a exibir (default: todos)
   *     highlight:      [ids] destacados (amarelo)
   *     highlightEdges: [[a,b], ...] arestas destacadas
   *     nodeShape:      "circle" (default) | "box"
   *     view:           [w,h] (default: calculado)
   *     edgeLabels:     true (default) usa node.edgeLabel do filho como rótulo da aresta
   *   Retorna mapa id -> {x, y}.
   */
  EX.Diagram.tree = function (svg, root, opts) {
    opts = opts || {};
    if (!root) return {};
    var nodes = layout(root);

    var maxDepth = 0, maxGx = 0;
    nodes.forEach(function (n) {
      if (n._depth > maxDepth) maxDepth = n._depth;
      if (n._gx > maxGx) maxGx = n._gx;
    });

    // Geometria em unidades de view.
    var padX = 60, padY = 50;
    var stepX = 90;   // distância horizontal entre colunas in-order
    var stepY = 100;  // distância vertical entre níveis
    var r = opts.nodeShape === "box" ? 0 : 24;

    var contentW = maxGx * stepX;
    var contentH = maxDepth * stepY;
    var w = (opts.view && opts.view[0]) || contentW + padX * 2;
    var h = (opts.view && opts.view[1]) || contentH + padY * 2;
    svg.view(w, h);

    // Posição final em pixels (centra horizontalmente se sobrar espaço).
    var offX = padX + Math.max(0, (w - padX * 2 - contentW) / 2);
    var pos = {};
    nodes.forEach(function (n) {
      pos[n.id] = { x: offX + n._gx * stepX, y: padY + n._depth * stepY };
    });

    var shown = opts.shown ? toSet(opts.shown) : null; // null => todos
    function isShown(id) { return !shown || shown[id]; }
    var hi = toSet(opts.highlight);
    var hiEdge = {};
    (opts.highlightEdges || []).forEach(function (e) {
      hiEdge[e[0] + "|" + e[1]] = true;
      hiEdge[e[1] + "|" + e[0]] = true;
    });

    // 1) Arestas (atrás dos nós).
    var edges = collectEdges(root);
    edges.forEach(function (e) {
      var a = e[0], b = e[1], child = e[3];
      if (!isShown(a) || !isShown(b)) return;
      var pa = pos[a], pb = pos[b];
      var on = hiEdge[a + "|" + b];
      svg.line(pa.x, pa.y, pb.x, pb.y, {
        stroke: on ? "var(--yellow)" : "var(--ink-mute)",
        strokeWidth: on ? 3 : 2,
      });
      // rótulo da aresta (ex.: símbolo de transição / produção)
      if (opts.edgeLabels !== false && child && child.edgeLabel != null) {
        var mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        svg.text(mx + 10, my, String(child.edgeLabel), {
          size: 12, color: "var(--ink-dim)", mono: true,
        });
      }
    });

    // 2) Nós (por cima).
    nodes.forEach(function (n) {
      if (!isShown(n.id)) return;
      var p = pos[n.id];
      var active = hi[n.id];
      var label = n.label == null ? n.id : String(n.label);
      if (opts.nodeShape === "box") {
        var bw = Math.max(40, 14 + label.length * 10), bh = 36;
        svg.rect(p.x - bw / 2, p.y - bh / 2, bw, bh, {
          fill: active ? "var(--yellow-soft)" : "var(--bg-soft)",
          stroke: active ? "var(--yellow)" : "var(--accent)",
          strokeWidth: active ? 3 : 2,
          rx: 7,
        });
      } else {
        svg.circle(p.x, p.y, r, {
          fill: active ? "var(--yellow-soft)" : "var(--bg-soft)",
          stroke: active ? "var(--yellow)" : "var(--accent)",
          strokeWidth: active ? 3 : 2,
        });
      }
      svg.text(p.x, p.y, label, {
        weight: 700,
        size: label.length > 3 ? 13 : 16,
        color: "var(--ink)",
      });
    });

    // Retorna só {x,y} (sem campos internos).
    var out = {};
    for (var k in pos) if (pos.hasOwnProperty(k)) out[k] = { x: pos[k].x, y: pos[k].y };
    return out;
  };
})();
