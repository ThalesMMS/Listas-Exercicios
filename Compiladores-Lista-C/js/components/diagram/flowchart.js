/*
 * flowchart.js — EX.Diagram.flowchart: fluxograma em SVG.
 *
 * Tipos de nó (kind):
 *   start / end -> estádio (retângulo bem arredondado)
 *   process     -> retângulo
 *   decision    -> losango
 *   io          -> paralelogramo
 * Posições são dadas pelo autor (x,y = centro). Arestas com setas e rótulos
 * (ex.: "sim"/"não" saindo de uma decisão).
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

  // Retorna o ponto na borda do nó (forma simplificada como retângulo/losango)
  // mais próximo do alvo (ax,ay), p/ encurtar a aresta até a borda.
  function anchor(node, ax, ay) {
    var dx = ax - node.x, dy = ay - node.y;
    var hw = node.w / 2, hh = node.h / 2;
    if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
    if (node.kind === "decision") {
      // losango: borda |x|/hw + |y|/hh = 1
      var t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
      return { x: node.x + dx * t, y: node.y + dy * t };
    }
    // retângulo: escala até tocar a borda
    var sx = dx === 0 ? Infinity : hw / Math.abs(dx);
    var sy = dy === 0 ? Infinity : hh / Math.abs(dy);
    var s = Math.min(sx, sy);
    return { x: node.x + dx * s, y: node.y + dy * s };
  }

  function drawNode(svg, n, active) {
    var stroke = active ? "var(--yellow)" : "var(--accent)";
    var fill = active ? "var(--yellow-soft)" : "var(--bg-soft)";
    var sw = active ? 3 : 2;
    var x = n.x - n.w / 2, y = n.y - n.h / 2;
    var kind = n.kind || "process";
    if (kind === "decision") {
      svg.polygon(
        [[n.x, y], [x + n.w, n.y], [n.x, y + n.h], [x, n.y]],
        { fill: fill, stroke: stroke, strokeWidth: sw }
      );
    } else if (kind === "io") {
      var sk = n.h * 0.4; // inclinação do paralelogramo
      svg.polygon(
        [[x + sk, y], [x + n.w, y], [x + n.w - sk, y + n.h], [x, y + n.h]],
        { fill: fill, stroke: stroke, strokeWidth: sw }
      );
    } else {
      // start/end = estádio (rx grande); process = retângulo
      var rx = kind === "start" || kind === "end" ? n.h / 2 : 8;
      svg.rect(x, y, n.w, n.h, { fill: fill, stroke: stroke, strokeWidth: sw, rx: rx });
    }
    svg.text(n.x, n.y, n.label == null ? n.id : String(n.label), {
      size: 13, weight: 600, color: "var(--ink)",
    });
  }

  /*
   * EX.Diagram.flowchart(svg, spec, opts)
   *   spec:
   *     nodes: [{ id, kind:"start"|"process"|"decision"|"io"|"end", label, x, y, w?, h? }]
   *     edges: [{ from, to, label? }]
   *   opts:
   *     view:        [w,h] (default 600x520)
   *     highlight:   [ids] nós destacados
   *     activeEdges: [[a,b], ...] arestas destacadas
   *   Retorna mapa id -> {x,y}.
   */
  EX.Diagram.flowchart = function (svg, spec, opts) {
    opts = opts || {};
    spec = spec || {};
    var nodes = spec.nodes || [];
    var edges = spec.edges || [];

    var view = opts.view || [600, 520];
    svg.view(view[0], view[1]);

    var byId = {};
    nodes.forEach(function (n) {
      var kind = n.kind || "process";
      var dw = kind === "decision" ? 110 : kind === "start" || kind === "end" ? 120 : 130;
      var dh = kind === "decision" ? 80 : 48;
      byId[n.id] = {
        id: n.id, kind: kind, label: n.label, x: n.x, y: n.y,
        w: n.w || dw, h: n.h || dh,
      };
    });

    var hi = toSet(opts.highlight);
    var activeE = {};
    (opts.activeEdges || []).forEach(function (e) { activeE[e[0] + "|" + e[1]] = true; });

    // 1) Arestas.
    edges.forEach(function (e) {
      var a = byId[e.from], b = byId[e.to];
      if (!a || !b) return;
      var pa = anchor(a, b.x, b.y);
      var pb = anchor(b, a.x, a.y);
      var on = activeE[e.from + "|" + e.to];
      svg.arrow(pa.x, pa.y, pb.x, pb.y, {
        color: on ? "var(--yellow)" : "var(--ink-mute)",
        strokeWidth: on ? 3 : 2,
      });
      if (e.label != null) {
        var mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        svg.text(mx + 12, my - 4, String(e.label), {
          size: 12, weight: 600, color: "var(--ink-dim)",
        });
      }
    });

    // 2) Nós.
    nodes.forEach(function (n) { drawNode(svg, byId[n.id], hi[n.id]); });

    var out = {};
    for (var k in byId) if (byId.hasOwnProperty(k)) out[k] = { x: byId[k].x, y: byId[k].y };
    return out;
  };
})();
