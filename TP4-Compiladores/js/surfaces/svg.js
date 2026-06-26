(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});
  var U = TP4.util;

  function SvgSurface(el) {
    this.el = el;
    this.view(760, 430);
  }
  SvgSurface.prototype.clear = function () { U.clear(this.el); return this; };
  SvgSurface.prototype.view = function (w, h) {
    this.width = w || 760;
    this.height = h || 430;
    this.el.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
    this.el.setAttribute("preserveAspectRatio", "xMidYMid meet");
    return this;
  };
  SvgSurface.prototype.append = function (node, parent) { (parent || this.el).appendChild(node); return node; };
  SvgSurface.prototype.group = function (opts) {
    opts = opts || {};
    var g = U.svgEl("g", { transform: opts.transform || null, class: opts.cls || null });
    return this.append(g, opts.parent);
  };
  SvgSurface.prototype.rect = function (x, y, w, h, opts) {
    opts = opts || {};
    var n = U.svgEl("rect", {
      x: x, y: y, width: w, height: h,
      rx: opts.rx == null ? 10 : opts.rx,
      fill: opts.fill || "var(--bg-soft)",
      stroke: opts.stroke || "var(--border)",
      "stroke-width": opts.strokeWidth == null ? 1.5 : opts.strokeWidth,
      opacity: opts.opacity == null ? null : opts.opacity,
      class: opts.cls || null
    });
    if (opts.dashed) n.setAttribute("stroke-dasharray", Array.isArray(opts.dashed) ? opts.dashed.join(" ") : "7 5");
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.line = function (x1, y1, x2, y2, opts) {
    opts = opts || {};
    var n = U.svgEl("line", {
      x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: opts.stroke || opts.color || "var(--ink-mute)",
      "stroke-width": opts.strokeWidth == null ? 2 : opts.strokeWidth,
      opacity: opts.opacity == null ? null : opts.opacity
    });
    if (opts.dashed) n.setAttribute("stroke-dasharray", Array.isArray(opts.dashed) ? opts.dashed.join(" ") : "7 5");
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.circle = function (cx, cy, r, opts) {
    opts = opts || {};
    var n = U.svgEl("circle", {
      cx: cx, cy: cy, r: r,
      fill: opts.fill || "var(--bg-soft)",
      stroke: opts.stroke || "var(--border)",
      "stroke-width": opts.strokeWidth == null ? 1.5 : opts.strokeWidth,
      opacity: opts.opacity == null ? null : opts.opacity
    });
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.path = function (d, opts) {
    opts = opts || {};
    var n = U.svgEl("path", {
      d: d,
      fill: opts.fill || "none",
      stroke: opts.stroke || opts.color || "var(--ink-mute)",
      "stroke-width": opts.strokeWidth == null ? 2 : opts.strokeWidth,
      opacity: opts.opacity == null ? null : opts.opacity
    });
    if (opts.dashed) n.setAttribute("stroke-dasharray", Array.isArray(opts.dashed) ? opts.dashed.join(" ") : "7 5");
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.polygon = function (pts, opts) {
    opts = opts || {};
    var points = (pts || []).map(function (p) { return Array.isArray(p) ? p[0] + "," + p[1] : p.x + "," + p.y; }).join(" ");
    var n = U.svgEl("polygon", {
      points: points,
      fill: opts.fill || "var(--accent-soft)",
      stroke: opts.stroke || "var(--accent)",
      "stroke-width": opts.strokeWidth == null ? 2 : opts.strokeWidth,
      opacity: opts.opacity == null ? null : opts.opacity
    });
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.text = function (x, y, str, opts) {
    opts = opts || {};
    var n = U.svgEl("text", {
      x: x, y: y,
      fill: opts.color || "var(--ink)",
      "font-size": opts.size || 13,
      "font-weight": opts.weight || null,
      "font-family": opts.mono ? "ui-monospace, Menlo, Consolas, monospace" : "ui-sans-serif, system-ui, sans-serif",
      "text-anchor": opts.anchor || "middle",
      "dominant-baseline": opts.baseline || "middle"
    });
    String(str == null ? "" : str).split("\n").forEach(function (line, i) {
      var t = U.svgEl("tspan", { x: x, dy: i === 0 ? 0 : (opts.lineHeight || 16) });
      t.textContent = line;
      n.appendChild(t);
    });
    return this.append(n, opts.parent);
  };
  SvgSurface.prototype.arrow = function (x1, y1, x2, y2, opts) {
    opts = opts || {};
    var color = opts.color || opts.stroke || "var(--ink-mute)";
    this.line(x1, y1, x2, y2, { stroke: color, strokeWidth: opts.strokeWidth == null ? 2 : opts.strokeWidth, dashed: opts.dashed, parent: opts.parent, opacity: opts.opacity });
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var h = opts.head == null ? 9 : opts.head;
    var a1 = angle + Math.PI * 0.86;
    var a2 = angle - Math.PI * 0.86;
    var pts = [
      [x2, y2],
      [x2 + Math.cos(a1) * h, y2 + Math.sin(a1) * h],
      [x2 + Math.cos(a2) * h, y2 + Math.sin(a2) * h]
    ];
    return this.polygon(pts, { fill: color, stroke: color, strokeWidth: 1, parent: opts.parent, opacity: opts.opacity });
  };
  SvgSurface.prototype.box = function (x, y, w, h, title, subtitle, opts) {
    opts = opts || {};
    this.rect(x, y, w, h, { fill: opts.fill || "var(--bg-soft)", stroke: opts.stroke || "var(--border)", strokeWidth: opts.strokeWidth || 1.5, rx: opts.rx == null ? 12 : opts.rx, parent: opts.parent, dashed: opts.dashed, opacity: opts.opacity });
    this.text(x + w / 2, y + h / 2 - (subtitle ? 8 : 0), title, { color: opts.titleColor || "var(--ink)", size: opts.size || 14, weight: opts.weight || 700, mono: opts.mono, parent: opts.parent });
    if (subtitle) this.text(x + w / 2, y + h / 2 + 13, subtitle, { color: opts.subColor || "var(--ink-dim)", size: opts.subSize || 11, mono: opts.subMono, parent: opts.parent });
  };
  SvgSurface.prototype.badge = function (x, y, text, opts) {
    opts = opts || {};
    var w = opts.w || Math.max(42, String(text).length * 7 + 18);
    this.rect(x - w / 2, y - 14, w, 28, { fill: opts.fill || "var(--accent)", stroke: opts.stroke || "var(--accent)", rx: 14, parent: opts.parent });
    this.text(x, y, text, { color: opts.color || "var(--bg)", size: opts.size || 12, weight: 800, mono: opts.mono, parent: opts.parent });
  };

  TP4.SvgSurface = SvgSurface;
})();
