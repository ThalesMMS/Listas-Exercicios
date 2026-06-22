/*
 * util.js — Utilitários gerais do Explainer (window.EX.util).
 *
 * Inclui: helpers de DOM, escape de HTML, formatação e aritmética de frações
 * exatas (útil para qualquer matéria que precise de valores racionais exatos).
 *
 * Sem build, sem dependências: tudo via <script> global (funciona em file://).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});

  // ---- DOM ----
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  // Cria elemento em namespace SVG (necessário para <svg>, <rect>, etc.).
  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- Formatação ----
  function round(n, casas) {
    var f = Math.pow(10, casas == null ? 2 : casas);
    return Math.round(n * f) / f;
  }
  // Formata número PT-BR opcional (vírgula). Mantém ASCII por padrão.
  function fmt(n, casas) {
    var r = round(n, casas);
    return String(r);
  }

  // ---- Frações exatas (gcd-based) ----
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }
  function Fr(n, d) {
    if (n instanceof Fr) {
      this.n = n.n;
      this.d = n.d;
      return;
    }
    d = d == null ? 1 : d;
    if (d === 0) throw new Error("denominador zero");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    var g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }
  function fr(n, d) {
    return n instanceof Fr ? n : new Fr(n, d);
  }
  Fr.prototype.add = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d + o.n * this.d, this.d * o.d);
  };
  Fr.prototype.sub = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d - o.n * this.d, this.d * o.d);
  };
  Fr.prototype.mul = function (o) {
    o = fr(o);
    return new Fr(this.n * o.n, this.d * o.d);
  };
  Fr.prototype.div = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d, this.d * o.n);
  };
  Fr.prototype.num = function () {
    return this.n / this.d;
  };
  Fr.prototype.str = function () {
    return this.d === 1 ? String(this.n) : this.n + "/" + this.d;
  };
  Fr.prototype.ltInt = function (m) {
    return this.n < m * this.d;
  };
  Fr.prototype.gtInt = function (m) {
    return this.n > m * this.d;
  };
  Fr.prototype.eqInt = function (m) {
    return this.n === m * this.d;
  };

  // ---- Misc ----
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function range(a, b) {
    // range(n) => [0..n-1]; range(a,b) => [a..b-1]
    if (b == null) {
      b = a;
      a = 0;
    }
    var out = [];
    for (var i = a; i < b; i++) out.push(i);
    return out;
  }

  EX.util = {
    el: el,
    svgEl: svgEl,
    SVGNS: SVGNS,
    clear: clear,
    escapeHtml: escapeHtml,
    round: round,
    fmt: fmt,
    gcd: gcd,
    Fr: Fr,
    fr: fr,
    clamp: clamp,
    range: range,
  };
})();
