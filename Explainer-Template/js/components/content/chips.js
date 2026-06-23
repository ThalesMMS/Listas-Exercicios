/*
 * chips.js — Chips de valores/coordenadas e legenda colorida.
 *
 * EX.Content.chips(host, items, opts) — lista de chips (ex-coordlist/ex-coord).
 * EX.Content.legend(host, items)       — legenda com quadradinho colorido + rótulo.
 *
 * Usa as classes de components.css: ex-coordlist, ex-coord(.accent/.green/.yellow),
 * ex-legend (com <i> colorido).
 *
 * IIFE + namespace global; funções PURAS de desenho (recebem host, anexam DOM).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  EX.Content = EX.Content || {};

  /*
   * EX.Content.chips(host, items, opts?)
   *   items: (string | {text, cls?})[]  — texto do chip; cls é classe extra
   *          (ex. "accent", "green", "yellow").
   *   opts : { cls? }  — classe extra aplicada a TODOS os chips (opcional).
   * Retorna o elemento <div class="ex-coordlist">.
   */
  EX.Content.chips = function (host, items, opts) {
    items = items || [];
    opts = opts || {};
    var list = U.el("div", "ex-coordlist");
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var text = it && typeof it === "object" ? it.text : it;
      var cls = "ex-coord";
      if (opts.cls) cls += " " + opts.cls;
      if (it && typeof it === "object" && it.cls) cls += " " + it.cls;
      list.appendChild(U.el("span", cls, U.escapeHtml(text)));
    }
    host.appendChild(list);
    return list;
  };

  /*
   * EX.Content.legend(host, items)
   *   items: {color, label}[]  — color é qualquer cor CSS (ex. "var(--accent)").
   * Retorna o elemento <div class="ex-legend">.
   */
  EX.Content.legend = function (host, items) {
    items = items || [];
    var box = U.el("div", "ex-legend");
    for (var i = 0; i < items.length; i++) {
      var it = items[i] || {};
      var span = U.el("span");
      var swatch = U.el("i");
      if (it.color != null) swatch.style.background = it.color;
      span.appendChild(swatch);
      span.appendChild(document.createTextNode(it.label == null ? "" : String(it.label)));
      box.appendChild(span);
    }
    host.appendChild(box);
    return box;
  };
})();
