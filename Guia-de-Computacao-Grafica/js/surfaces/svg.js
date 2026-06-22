/*
 * svg.js — Superfície de SVG: SvgSurface (window.EX.SvgSurface).
 *
 * Para diagramas de nós e arestas: árvores (sintática, busca, BST), autômatos
 * (DFA/NFA), fluxogramas, UML, pilhas/filas, matrizes. Trabalha em um sistema de
 * coordenadas definido por view(w, h) (unidades de usuário; o SVG escala para caber).
 *
 * As cores usam variáveis CSS (ex.: var(--accent)) — o SVG segue o tema sem
 * redesenhar. Componentes de alto nível ficam em js/components/diagram/*.js.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;

  function SvgSurface(svg) {
    this.svg = svg;
    this.w = 1000;
    this.h = 700;
    U.clear(svg);
    svg.setAttribute("viewBox", "0 0 " + this.w + " " + this.h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.root = svg; // elementos são anexados aqui (ou em opts.parent)
  }

  // Define o sistema de coordenadas (unidades de usuário).
  SvgSurface.prototype.view = function (w, h) {
    this.w = w;
    this.h = h;
    this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    return this;
  };
  SvgSurface.prototype.clear = function () {
    U.clear(this.svg);
    return this;
  };

  function add(self, el, opts) {
    (opts && opts.parent ? opts.parent : self.root).appendChild(el);
    return el;
  }
  function applyCommon(el, opts) {
    opts = opts || {};
    if (opts.fill != null) el.setAttribute("fill", opts.fill);
    if (opts.stroke != null) el.setAttribute("stroke", opts.stroke);
    if (opts.strokeWidth != null) el.setAttribute("stroke-width", opts.strokeWidth);
    if (opts.opacity != null) el.setAttribute("opacity", opts.opacity);
    if (opts.dashed) el.setAttribute("stroke-dasharray", opts.dashed === true ? "6 5" : opts.dashed);
    if (opts.cls) el.setAttribute("class", opts.cls);
    if (opts.rx != null) el.setAttribute("rx", opts.rx);
    return el;
  }

  SvgSurface.prototype.group = function (opts) {
    var g = U.svgEl("g");
    if (opts && opts.transform) g.setAttribute("transform", opts.transform);
    if (opts && opts.cls) g.setAttribute("class", opts.cls);
    return add(this, g, opts);
  };
  SvgSurface.prototype.rect = function (x, y, w, h, opts) {
    var el = U.svgEl("rect", { x: x, y: y, width: w, height: h });
    return add(this, applyCommon(el, opts), opts);
  };
  SvgSurface.prototype.line = function (x1, y1, x2, y2, opts) {
    var el = U.svgEl("line", { x1: x1, y1: y1, x2: x2, y2: y2 });
    applyCommon(el, opts);
    if (!el.getAttribute("stroke")) el.setAttribute("stroke", "var(--ink-mute)");
    return add(this, el, opts);
  };
  SvgSurface.prototype.circle = function (cx, cy, r, opts) {
    var el = U.svgEl("circle", { cx: cx, cy: cy, r: r });
    return add(this, applyCommon(el, opts), opts);
  };
  SvgSurface.prototype.ellipse = function (cx, cy, rx, ry, opts) {
    var el = U.svgEl("ellipse", { cx: cx, cy: cy, rx: rx, ry: ry });
    return add(this, applyCommon(el, opts), opts);
  };
  SvgSurface.prototype.path = function (d, opts) {
    var el = U.svgEl("path", { d: d });
    applyCommon(el, opts);
    if (!el.getAttribute("fill")) el.setAttribute("fill", "none");
    return add(this, el, opts);
  };
  SvgSurface.prototype.polygon = function (points, opts) {
    var pts = points
      .map(function (p) {
        return (Array.isArray(p) ? p[0] + "," + p[1] : p.x + "," + p.y);
      })
      .join(" ");
    var el = U.svgEl("polygon", { points: pts });
    return add(this, applyCommon(el, opts), opts);
  };
  SvgSurface.prototype.polyline = function (points, opts) {
    var pts = points
      .map(function (p) {
        return (Array.isArray(p) ? p[0] + "," + p[1] : p.x + "," + p.y);
      })
      .join(" ");
    var el = U.svgEl("polyline", { points: pts });
    applyCommon(el, opts);
    if (!el.getAttribute("fill")) el.setAttribute("fill", "none");
    return add(this, el, opts);
  };
  SvgSurface.prototype.text = function (x, y, str, opts) {
    opts = opts || {};
    var el = U.svgEl("text", {
      x: x,
      y: y,
      "text-anchor": opts.anchor || "middle",
      "dominant-baseline": opts.baseline || "middle",
    });
    el.setAttribute("font-size", opts.size || 15);
    el.setAttribute("fill", opts.color || "var(--ink)");
    el.setAttribute(
      "font-family",
      opts.mono
        ? "ui-monospace, Menlo, Consolas, monospace"
        : "ui-sans-serif, system-ui, sans-serif"
    );
    if (opts.weight) el.setAttribute("font-weight", opts.weight);
    if (opts.cls) el.setAttribute("class", opts.cls);
    el.textContent = str;
    return add(this, el, opts);
  };

  // Aresta com cabeça de seta (desenhada explicitamente p/ controlar a cor).
  SvgSurface.prototype.arrow = function (x1, y1, x2, y2, opts) {
    opts = opts || {};
    var color = opts.color || "var(--ink-mute)";
    var head = opts.head || 12;
    var ang = Math.atan2(y2 - y1, x2 - x1);
    // encurta a linha para não invadir a ponta
    var bx = x2 - head * 0.9 * Math.cos(ang);
    var by = y2 - head * 0.9 * Math.sin(ang);
    var g = this.group(opts);
    var ln = U.svgEl("line", { x1: x1, y1: y1, x2: bx, y2: by });
    ln.setAttribute("stroke", color);
    ln.setAttribute("stroke-width", opts.strokeWidth || 2);
    if (opts.dashed) ln.setAttribute("stroke-dasharray", opts.dashed === true ? "6 5" : opts.dashed);
    g.appendChild(ln);
    var p1x = x2 - head * Math.cos(ang - 0.4),
      p1y = y2 - head * Math.sin(ang - 0.4);
    var p2x = x2 - head * Math.cos(ang + 0.4),
      p2y = y2 - head * Math.sin(ang + 0.4);
    var tri = U.svgEl("polygon", { points: x2 + "," + y2 + " " + p1x + "," + p1y + " " + p2x + "," + p2y });
    tri.setAttribute("fill", color);
    g.appendChild(tri);
    return g;
  };

  // Curva quadrática entre dois pontos (para auto-loops / transições curvas).
  SvgSurface.prototype.curve = function (x1, y1, x2, y2, bend, opts) {
    bend = bend == null ? 40 : bend;
    var mx = (x1 + x2) / 2,
      my = (y1 + y2) / 2;
    var ang = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    var cxp = mx + bend * Math.cos(ang),
      cyp = my + bend * Math.sin(ang);
    return this.path("M " + x1 + " " + y1 + " Q " + cxp + " " + cyp + " " + x2 + " " + y2, opts);
  };

  EX.SvgSurface = SvgSurface;
})();
