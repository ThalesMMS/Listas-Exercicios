/*
 * plane.js — CartesianPlane: renderizador de plano cartesiano em <canvas>.
 *
 * Mapeia coordenadas lógicas (matemáticas, y para cima) para pixels do canvas,
 * mantendo escala igual em x e y (células quadradas — essencial para rasterização
 * e circunferências). Suporta HiDPI.
 *
 * Uso típico (chamado pelo Stepper a cada passo):
 *   plane.clear(); plane.drawGrid(); plane.drawAxes();
 *   step.draw(plane);   // desenha o estado cumulativo do passo
 */
(function () {
  "use strict";

  // Paleta do canvas. Valores padrão (tema escuro) são sobrescritos por
  // refreshTheme(), que lê as variáveis CSS — assim canvas e DOM seguem o
  // mesmo tema (claro/escuro). Como o objeto é MUTADO no lugar, os módulos
  // que capturaram CartesianPlane.COLORS continuam vendo as cores atuais.
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

  // Mapa cor->variável CSS. Lido por refreshTheme().
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
    this.padding = 28; // margem interna em pixels de tela
    this.theme = THEME;
    this._resize();
  }

  CartesianPlane.COLORS = THEME;
  CartesianPlane.refreshTheme = refreshTheme;

  // Ajusta resolução interna para o tamanho de exibição (HiDPI).
  CartesianPlane.prototype._resize = function () {
    var dpr = window.devicePixelRatio || 1;
    var rect = this.canvas.getBoundingClientRect();
    var cssW = rect.width || this.canvas.clientWidth || 640;
    var cssH = rect.height || this.canvas.clientHeight || 480;
    this.cssW = cssW;
    this.cssH = cssH;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._recomputeScale();
  };

  CartesianPlane.prototype._recomputeScale = function () {
    var w = this.cssW - 2 * this.padding;
    var h = this.cssH - 2 * this.padding;
    var spanX = this.xmax - this.xmin || 1;
    var spanY = this.ymax - this.ymin || 1;
    this.scale = Math.min(w / spanX, h / spanY); // px por unidade (igual em x e y)
    // Centraliza a região lógica dentro da área útil.
    var usedW = spanX * this.scale;
    var usedH = spanY * this.scale;
    this.offsetX = this.padding + (w - usedW) / 2;
    this.offsetY = this.padding + (h - usedH) / 2;
  };

  CartesianPlane.prototype.setBounds = function (xmin, xmax, ymin, ymax) {
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
    this._recomputeScale();
    return this;
  };

  // Ajusta os limites a partir de uma lista de pontos {x,y} ou [x,y].
  CartesianPlane.prototype.fit = function (points, pad) {
    pad = pad == null ? 1.5 : pad;
    var xs = [],
      ys = [];
    points.forEach(function (p) {
      var x = Array.isArray(p) ? p[0] : p.x;
      var y = Array.isArray(p) ? p[1] : p.y;
      xs.push(x);
      ys.push(y);
    });
    var minx = Math.min.apply(null, xs) - pad;
    var maxx = Math.max.apply(null, xs) + pad;
    var miny = Math.min.apply(null, ys) - pad;
    var maxy = Math.max.apply(null, ys) + pad;
    return this.setBounds(
      Math.floor(minx),
      Math.ceil(maxx),
      Math.floor(miny),
      Math.ceil(maxy)
    );
  };

  // Lógico -> canvas
  CartesianPlane.prototype.cx = function (x) {
    return this.offsetX + (x - this.xmin) * this.scale;
  };
  CartesianPlane.prototype.cy = function (y) {
    return this.offsetY + (this.ymax - y) * this.scale; // y invertido
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

    // Eixo X
    ctx.beginPath();
    ctx.moveTo(this.cx(this.xmin), y0);
    ctx.lineTo(this.cx(this.xmax), y0);
    ctx.stroke();
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(x0, this.cy(this.ymin));
    ctx.lineTo(x0, this.cy(this.ymax));
    ctx.stroke();

    // Rótulos de X
    for (var x = Math.ceil(this.xmin); x <= this.xmax; x++) {
      if (x === 0) continue;
      ctx.fillText(String(x), this.cx(x), y0 + 4);
    }
    // Rótulos de Y
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var y = Math.ceil(this.ymin); y <= this.ymax; y++) {
      if (y === 0) continue;
      ctx.fillText(String(y), x0 - 5, this.cy(y));
    }
    ctx.restore();
    return this;
  };

  // Atalho: limpa + grade + eixos.
  CartesianPlane.prototype.base = function () {
    return this.clear().drawGrid().drawAxes();
  };

  // Célula raster centrada no inteiro (x,y), cobrindo [x-0.5,x+0.5] x [y-0.5,y+0.5].
  CartesianPlane.prototype.pixel = function (x, y, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var s = this.scale;
    var px = this.cx(x - 0.5);
    var py = this.cy(y + 0.5);
    ctx.save();
    ctx.fillStyle = opts.fill || THEME.accentSoft;
    ctx.fillRect(px, py, s, s);
    if (opts.stroke !== false) {
      ctx.strokeStyle = opts.stroke || THEME.accent;
      ctx.lineWidth = opts.lineWidth || 1.5;
      ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
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

  // Ponto (marcador) com rótulo opcional ancorado.
  CartesianPlane.prototype.point = function (x, y, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var r = opts.radius || 5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cx(x), this.cy(y), r, 0, Math.PI * 2);
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
      var dx = opts.labelDx == null ? 8 : opts.labelDx;
      var dy = opts.labelDy == null ? -8 : opts.labelDy;
      ctx.textAlign = opts.labelAlign || "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(String(opts.label), this.cx(x) + dx, this.cy(y) + dy);
    }
    ctx.restore();
    return this;
  };

  CartesianPlane.prototype.segment = function (p0, p1, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var x0 = Array.isArray(p0) ? p0[0] : p0.x;
    var y0 = Array.isArray(p0) ? p0[1] : p0.y;
    var x1 = Array.isArray(p1) ? p1[0] : p1.x;
    var y1 = Array.isArray(p1) ? p1[1] : p1.y;
    ctx.save();
    ctx.strokeStyle = opts.color || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
    ctx.beginPath();
    ctx.moveTo(this.cx(x0), this.cy(y0));
    ctx.lineTo(this.cx(x1), this.cy(y1));
    ctx.stroke();
    ctx.restore();
    return this;
  };

  // Polígono. pts: array de [x,y] ou {x,y}.
  CartesianPlane.prototype.polygon = function (pts, opts) {
    opts = opts || {};
    if (!pts.length) return this;
    var ctx = this.ctx;
    var self = this;
    ctx.save();
    ctx.beginPath();
    pts.forEach(function (p, i) {
      var x = Array.isArray(p) ? p[0] : p.x;
      var y = Array.isArray(p) ? p[1] : p.y;
      if (i === 0) ctx.moveTo(self.cx(x), self.cy(y));
      else ctx.lineTo(self.cx(x), self.cy(y));
    });
    if (opts.closed !== false) ctx.closePath();
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fill();
    }
    if (opts.stroke !== false) {
      ctx.strokeStyle = opts.stroke || THEME.accent;
      ctx.lineWidth = opts.lineWidth || 2;
      if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
      ctx.stroke();
    }
    ctx.restore();
    return this;
  };

  // Janela de recorte (retângulo destacado).
  CartesianPlane.prototype.window = function (xmin, xmax, ymin, ymax, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    var px = this.cx(xmin);
    var py = this.cy(ymax);
    var w = (xmax - xmin) * this.scale;
    var h = (ymax - ymin) * this.scale;
    ctx.save();
    if (opts.fill !== false) {
      ctx.fillStyle = opts.fill || THEME.accentSoft;
      ctx.fillRect(px, py, w, h);
    }
    ctx.strokeStyle = opts.stroke || THEME.accent;
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [6, 5] : opts.dashed);
    ctx.strokeRect(px, py, w, h);
    ctx.restore();
    return this;
  };

  // Preenche uma região retangular lógica [x0,x1] x [y0,y1] (inclusivo em células).
  CartesianPlane.prototype.regionFill = function (x0, x1, y0, y1, color) {
    var ctx = this.ctx;
    var px = this.cx(Math.min(x0, x1) - 0.5);
    var py = this.cy(Math.max(y0, y1) + 0.5);
    var w = (Math.abs(x1 - x0) + 1) * this.scale;
    var h = (Math.abs(y1 - y0) + 1) * this.scale;
    ctx.save();
    ctx.fillStyle = color || THEME.greenSoft;
    ctx.fillRect(px, py, w, h);
    ctx.restore();
    return this;
  };

  // Texto ancorado em coordenadas lógicas.
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

  // Texto em coordenadas de tela (px), útil para legendas fixas.
  CartesianPlane.prototype.screenText = function (px, py, str, opts) {
    opts = opts || {};
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = opts.color || THEME.ink;
    ctx.font = opts.font || "12px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "top";
    ctx.fillText(str, px, py);
    ctx.restore();
    return this;
  };

  window.CartesianPlane = CartesianPlane;

  // Lê as cores do tema atual (definido via data-theme) já no carregamento.
  refreshTheme();
})();
