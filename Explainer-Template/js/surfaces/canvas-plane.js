/*
 * canvas-plane.js — Superfície de CANVAS: CartesianPlane (window.EX.CartesianPlane).
 *
 * Plano cartesiano com grade/eixos, escala igual em x e y (células quadradas),
 * HiDPI, e desenho de pixel/ponto/segmento/polígono/janela/texto. Base para
 * geometria, rasterização, gráficos de função, campos vetoriais, etc.
 *
 * As cores vêm das variáveis CSS (refreshTheme) — canvas segue o tema claro/escuro.
 * Componentes mais ricos (plot de função, raster fill, vetores) ficam em
 * js/components/plane/*.js, construídos sobre esta superfície.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});

  // Defaults (tema escuro). refreshTheme() sobrescreve a partir do CSS.
  var THEME = {
    bg: "#0f1623",
    grid: "rgba(120,140,170,0.14)",
    gridStrong: "rgba(120,140,170,0.28)",
    axis: "#7d8aa5",
    axisText: "#9fb0cc",
    ink: "#e7edf7",
    accent: "#4ea1ff",
    accentSoft: "rgba(78,161,255,0.18)",
    green: "#3ddc84",
    greenSoft: "rgba(61,220,132,0.18)",
    yellow: "#ffd166",
    orange: "#ff9f43",
    red: "#ff6b6b",
    redSoft: "rgba(255,107,107,0.16)",
    purple: "#b794f6",
    cyan: "#33d6d0",
    pink: "#ff7eb6",
    muted: "#64748b",
  };
  var VAR_MAP = {
    bg: "--canvas-bg",
    grid: "--canvas-grid",
    gridStrong: "--canvas-grid-strong",
    axis: "--canvas-axis",
    axisText: "--canvas-axis-text",
    ink: "--ink",
    accent: "--accent",
    accentSoft: "--accent-soft",
    green: "--green",
    greenSoft: "--green-soft",
    yellow: "--yellow",
    orange: "--orange",
    red: "--red",
    redSoft: "--red-soft",
    purple: "--purple",
    cyan: "--cyan",
    pink: "--pink",
    muted: "--ink-mute",
  };
  function refreshTheme() {
    if (typeof getComputedStyle === "undefined" || !document.documentElement) return;
    var cs = getComputedStyle(document.documentElement);
    Object.keys(VAR_MAP).forEach(function (k) {
      var v = cs.getPropertyValue(VAR_MAP[k]);
      if (v && v.trim()) THEME[k] = v.trim();
    });
  }

  function CartesianPlane(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.xmin = -10;
    this.xmax = 10;
    this.ymin = -10;
    this.ymax = 10;
    this.padding = 28;
    this.theme = THEME;
    this._resize();
  }
  CartesianPlane.COLORS = THEME;
  CartesianPlane.refreshTheme = refreshTheme;

  CartesianPlane.prototype._resize = function () {
    var dpr = window.devicePixelRatio || 1;
    var rect = this.canvas.getBoundingClientRect();
    var cssW = rect.width || this.canvas.clientWidth || 640;
    var cssH = rect.height || this.canvas.clientHeight || 460;
    this.cssW = cssW;
    this.cssH = cssH;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._recompute();
  };
  CartesianPlane.prototype._recompute = function () {
    var w = this.cssW - 2 * this.padding;
    var h = this.cssH - 2 * this.padding;
    var spanX = this.xmax - this.xmin || 1;
    var spanY = this.ymax - this.ymin || 1;
    this.scale = Math.min(w / spanX, h / spanY);
    this.offsetX = this.padding + (w - spanX * this.scale) / 2;
    this.offsetY = this.padding + (h - spanY * this.scale) / 2;
  };
  CartesianPlane.prototype.setBounds = function (xmin, xmax, ymin, ymax) {
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
    this._recompute();
    return this;
  };
  CartesianPlane.prototype.fit = function (points, pad) {
    pad = pad == null ? 1.5 : pad;
    var xs = [],
      ys = [];
    points.forEach(function (p) {
      xs.push(Array.isArray(p) ? p[0] : p.x);
      ys.push(Array.isArray(p) ? p[1] : p.y);
    });
    return this.setBounds(
      Math.floor(Math.min.apply(null, xs) - pad),
      Math.ceil(Math.max.apply(null, xs) + pad),
      Math.floor(Math.min.apply(null, ys) - pad),
      Math.ceil(Math.max.apply(null, ys) + pad)
    );
  };
  CartesianPlane.prototype.cx = function (x) {
    return this.offsetX + (x - this.xmin) * this.scale;
  };
  CartesianPlane.prototype.cy = function (y) {
    return this.offsetY + (this.ymax - y) * this.scale;
  };

  CartesianPlane.prototype.clear = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.drawGrid = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 1;
    for (var x = Math.ceil(this.xmin); x <= this.xmax; x++) {
      ctx.strokeStyle = x === 0 ? THEME.gridStrong : THEME.grid;
      ctx.beginPath();
      ctx.moveTo(this.cx(x), this.cy(this.ymax));
      ctx.lineTo(this.cx(x), this.cy(this.ymin));
      ctx.stroke();
    }
    for (var y = Math.ceil(this.ymin); y <= this.ymax; y++) {
      ctx.strokeStyle = y === 0 ? THEME.gridStrong : THEME.grid;
      ctx.beginPath();
      ctx.moveTo(this.cx(this.xmin), this.cy(y));
      ctx.lineTo(this.cx(this.xmax), this.cy(y));
      ctx.stroke();
    }
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.drawAxes = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = THEME.axis;
    ctx.fillStyle = THEME.axisText;
    ctx.lineWidth = 1.5;
    ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    var showX0 = this.ymin <= 0 && this.ymax >= 0;
    var showY0 = this.xmin <= 0 && this.xmax >= 0;
    var y0 = showX0 ? this.cy(0) : this.cy(this.ymin);
    var x0 = showY0 ? this.cx(0) : this.cx(this.xmin);
    ctx.beginPath();
    ctx.moveTo(this.cx(this.xmin), y0);
    ctx.lineTo(this.cx(this.xmax), y0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, this.cy(this.ymin));
    ctx.lineTo(x0, this.cy(this.ymax));
    ctx.stroke();
    for (var x = Math.ceil(this.xmin); x <= this.xmax; x++) {
      if (x === 0) continue;
      ctx.fillText(String(x), this.cx(x), y0 + 4);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var y = Math.ceil(this.ymin); y <= this.ymax; y++) {
      if (y === 0) continue;
      ctx.fillText(String(y), x0 - 5, this.cy(y));
    }
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.base = function () {
    return this.clear().drawGrid().drawAxes();
  };

  CartesianPlane.prototype.pixel = function (x, y, opts) {
    opts = opts || {};
    var ctx = this.ctx,
      s = this.scale;
    ctx.save();
    ctx.fillStyle = opts.fill || THEME.accentSoft;
    ctx.fillRect(this.cx(x - 0.5), this.cy(y + 0.5), s, s);
    if (opts.stroke !== false) {
      ctx.strokeStyle = opts.stroke || THEME.accent;
      ctx.lineWidth = opts.lineWidth || 1.5;
      ctx.strokeRect(this.cx(x - 0.5) + 0.5, this.cy(y + 0.5) + 0.5, s - 1, s - 1);
    }
    if (opts.label != null) {
      ctx.fillStyle = opts.labelColor || THEME.ink;
      ctx.font = (opts.labelSize || 10) + "px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(opts.label), this.cx(x), this.cy(y));
    }
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.point = function (x, y, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx(x), this.cy(y), opts.radius || 5, 0, Math.PI * 2);
    ctx.fillStyle = opts.color || THEME.green;
    ctx.fill();
    if (opts.ring) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = opts.ring;
      ctx.stroke();
    }
    if (opts.label != null) {
      ctx.fillStyle = opts.labelColor || THEME.ink;
      ctx.font = "bold " + (opts.labelSize || 12) + "px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = opts.labelAlign || "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        String(opts.label),
        this.cx(x) + (opts.labelDx == null ? 8 : opts.labelDx),
        this.cy(y) + (opts.labelDy == null ? -8 : opts.labelDy)
      );
    }
    ctx.restore();
    return this;
  };
  function px(p, k) {
    return Array.isArray(p) ? p[k] : k === 0 ? p.x : p.y;
  }
  CartesianPlane.prototype.segment = function (p0, p1, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = opts.color || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
    ctx.beginPath();
    ctx.moveTo(this.cx(px(p0, 0)), this.cy(px(p0, 1)));
    ctx.lineTo(this.cx(px(p1, 0)), this.cy(px(p1, 1)));
    ctx.stroke();
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.polyline = function (pts, opts) {
    opts = opts || {};
    if (!pts.length) return this;
    var ctx = this.ctx,
      self = this;
    ctx.save();
    ctx.beginPath();
    pts.forEach(function (p, i) {
      var X = self.cx(px(p, 0)),
        Y = self.cy(px(p, 1));
      if (i === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
    });
    if (opts.closed) ctx.closePath();
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fill();
    }
    ctx.strokeStyle = opts.stroke || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
    if (opts.stroke !== false) ctx.stroke();
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.polygon = function (pts, opts) {
    opts = opts || {};
    opts.closed = true;
    return this.polyline(pts, opts);
  };
  CartesianPlane.prototype.window = function (xmin, xmax, ymin, ymax, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var x = this.cx(xmin),
      y = this.cy(ymax);
    var w = (xmax - xmin) * this.scale,
      h = (ymax - ymin) * this.scale;
    ctx.save();
    if (opts.fill !== false) {
      ctx.fillStyle = opts.fill || THEME.accentSoft;
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeStyle = opts.stroke || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.regionFill = function (x0, x1, y0, y1, color) {
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color || THEME.greenSoft;
    ctx.fillRect(
      this.cx(Math.min(x0, x1) - 0.5),
      this.cy(Math.max(y0, y1) + 0.5),
      (Math.abs(x1 - x0) + 1) * this.scale,
      (Math.abs(y1 - y0) + 1) * this.scale
    );
    ctx.restore();
    return this;
  };
  CartesianPlane.prototype.text = function (x, y, str, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = opts.color || THEME.ink;
    ctx.font = opts.font || "12px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "alphabetic";
    ctx.fillText(str, this.cx(x) + (opts.dx || 0), this.cy(y) + (opts.dy || 0));
    ctx.restore();
    return this;
  };
  // Seta no plano (vetor) — útil para campos/forças/gradientes.
  CartesianPlane.prototype.arrow = function (p0, p1, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var x0 = this.cx(px(p0, 0)),
      y0 = this.cy(px(p0, 1)),
      x1 = this.cx(px(p1, 0)),
      y1 = this.cy(px(p1, 1));
    var ang = Math.atan2(y1 - y0, x1 - x0),
      head = opts.head || 9;
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = opts.color || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(ang - 0.4), y1 - head * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - head * Math.cos(ang + 0.4), y1 - head * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return this;
  };

  EX.CartesianPlane = CartesianPlane;
  // alias para compatibilidade com código no estilo do projeto original
  window.CartesianPlane = CartesianPlane;

  refreshTheme();
})();
