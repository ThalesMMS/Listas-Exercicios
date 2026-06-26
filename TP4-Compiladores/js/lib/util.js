(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function svgEl(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function code(s) {
    return "<div class='tp4-formula'>" + escapeHtml(s) + "</div>";
  }

  function chips(items, cls) {
    return "<div class='tp4-chiplist'>" + (items || []).map(function (x) {
      if (typeof x === "string") return "<span class='tp4-mini-chip " + (cls || "") + "'>" + escapeHtml(x) + "</span>";
      return "<span class='tp4-mini-chip " + (x.kind || cls || "") + "'>" + escapeHtml(x.text) + "</span>";
    }).join("") + "</div>";
  }

  function table(headers, rows, activeIndex) {
    var h = "<tr>" + headers.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr>";
    var body = rows.map(function (r, i) {
      var cls = i === activeIndex ? " class='active'" : "";
      return "<tr" + cls + ">" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    }).join("");
    return "<table class='tp4-table'>" + h + body + "</table>";
  }

  function callout(kind, title, html) {
    return "<div class='tp4-callout " + (kind || "") + "'><div class='tp4-callout-title'>" + escapeHtml(title || "Nota") + "</div>" + html + "</div>";
  }

  function prosCons(pros, cons, notes) {
    var out = "<div class='tp4-proscons'>";
    (pros || []).forEach(function (p) { out += "<div class='pro'>+ " + p + "</div>"; });
    (cons || []).forEach(function (c) { out += "<div class='con'>− " + c + "</div>"; });
    (notes || []).forEach(function (n) { out += "<div class='note'>" + n + "</div>"; });
    return out + "</div>";
  }

  function part(label, steps) {
    return { label: label, build: function () { return steps; } };
  }

  TP4.util = {
    el: el,
    svgEl: svgEl,
    clear: clear,
    escapeHtml: escapeHtml,
    code: code,
    chips: chips,
    table: table,
    callout: callout,
    prosCons: prosCons,
    part: part
  };
})();
