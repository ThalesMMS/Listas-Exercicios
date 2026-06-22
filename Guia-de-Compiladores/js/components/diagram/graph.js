/*
 * graph.js — EX.Diagram.graph: grafo de nós e arestas com POSIÇÕES DADAS (SVG).
 *
 * Diferente de tree.js (layout automático), aqui o autor informa x,y de cada nó.
 * Bom para grafos genéricos: dependências, redes, fluxo, máquinas simples.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Diagram = EX.Diagram || {};

  function toSet(v) {
    var set = {};
    if (!v) return set;
    if (v instanceof Array || (v && typeof v.forEach === "function")) {
      v.forEach(function (k) { set[k] = true; });
    } else if (typeof v === "object") {
      for (var k in v) if (v.hasOwnProperty(k)) set[k] = true;
    }
    return set;
  }

  /*
   * EX.Diagram.graph(svg, spec, opts)
   *   spec:
   *     nodes: [{ id, label, x, y, r? }]
   *     edges: [{ from, to, label?, directed? }]
   *   opts:
   *     view:        [w,h] (default: 600x400)
   *     highlight:   [ids] nós destacados (amarelo)
   *     activeEdges: [[a,b], ...] arestas destacadas
   *     nodeRadius:  raio padrão (default 26)
   *   Retorna mapa id -> {x,y}.
   */
  EX.Diagram.graph = function (svg, spec, opts) {
    opts = opts || {};
    spec = spec || {};
    var nodes = spec.nodes || [];
    var edges = spec.edges || [];
    var R = opts.nodeRadius || 26;

    var view = opts.view || [600, 400];
    svg.view(view[0], view[1]);

    var pos = {};
    nodes.forEach(function (n) { pos[n.id] = { x: n.x, y: n.y, r: n.r || R }; });

    var hi = toSet(opts.highlight);
    var activeE = {};
    (opts.activeEdges || []).forEach(function (e) {
      activeE[e[0] + "|" + e[1]] = true;
    });

    // 1) Arestas (encurtadas até a borda dos nós).
    edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to];
      if (!a || !b) return;
      var on = activeE[e.from + "|" + e.to] || activeE[e.to + "|" + e.from];
      var color = on ? "var(--yellow)" : "var(--ink-mute)";
      var sw = on ? 3 : 2;
      var ang = Math.atan2(b.y - a.y, b.x - a.x);
      var x1 = a.x + Math.cos(ang) * a.r;
      var y1 = a.y + Math.sin(ang) * a.r;
      var x2 = b.x - Math.cos(ang) * b.r;
      var y2 = b.y - Math.sin(ang) * b.r;
      if (e.directed) {
        svg.arrow(x1, y1, x2, y2, { color: color, strokeWidth: sw });
      } else {
        svg.line(x1, y1, x2, y2, { stroke: color, strokeWidth: sw });
      }
      if (e.label != null) {
        var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        svg.text(mx, my - 8, String(e.label), {
          size: 12, color: "var(--ink-dim)", mono: true,
        });
      }
    });

    // 2) Nós.
    nodes.forEach(function (n) {
      var p = pos[n.id];
      var active = hi[n.id];
      svg.circle(p.x, p.y, p.r, {
        fill: active ? "var(--yellow-soft)" : "var(--bg-soft)",
        stroke: active ? "var(--yellow)" : "var(--accent)",
        strokeWidth: active ? 3 : 2,
      });
      var label = n.label == null ? n.id : String(n.label);
      svg.text(p.x, p.y, label, {
        weight: 700,
        size: label.length > 3 ? 13 : 16,
        color: "var(--ink)",
      });
    });

    var out = {};
    for (var k in pos) if (pos.hasOwnProperty(k)) out[k] = { x: pos[k].x, y: pos[k].y };
    return out;
  };
})();
