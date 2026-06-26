/*
 * callout.js — Caixas de destaque, definições e listas de prós/contras.
 *
 * EX.Content.callout(host, {kind, title, html})  — caixa note/tip/warn/danger.
 * EX.Content.definition(host, {term, html})       — termo + explicação.
 * EX.Content.prosCons(host, {pros, cons})          — lista de vantagens/desvantagens.
 *
 * Usa as classes de components.css: ex-callout(.tip/.warn/.danger),
 * ex-callout-title, ex-proscons(.pro/.con).
 *
 * IIFE + namespace global; funções PURAS de desenho (recebem host, anexam DOM).
 * Observação: `html` é conteúdo autorado por nós (confiável) — inserido como
 * markup. `term` é escapado por segurança.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  EX.Content = EX.Content || {};

  /*
   * EX.Content.callout(host, {kind?, title?, html})
   *   kind : "note"|"tip"|"warn"|"danger"  (default "note")
   *   title: título em negrito (opcional)
   *   html : corpo (markup confiável)
   * Retorna o elemento <div class="ex-callout ...">.
   */
  EX.Content.callout = function (host, spec) {
    spec = spec || {};
    var kind = spec.kind || "note";
    var cls = "ex-callout";
    if (kind && kind !== "note") cls += " " + kind;
    var box = U.el("div", cls);
    if (spec.title != null) {
      box.appendChild(U.el("div", "ex-callout-title", U.escapeHtml(spec.title)));
    }
    if (spec.html != null) {
      box.appendChild(U.el("div", "ex-callout-body", spec.html));
    }
    host.appendChild(box);
    return box;
  };

  /*
   * EX.Content.definition(host, {term, html})
   *   term: termo a definir (texto curto)
   *   html: explicação (markup confiável)
   * Renderiza como um callout "note" cujo título é o termo.
   * Retorna o elemento <div class="ex-callout ex-definition">.
   */
  EX.Content.definition = function (host, spec) {
    spec = spec || {};
    var box = U.el("div", "ex-callout ex-definition");
    box.appendChild(U.el("div", "ex-callout-title", U.escapeHtml(spec.term)));
    if (spec.html != null) {
      box.appendChild(U.el("div", "ex-callout-body", spec.html));
    }
    host.appendChild(box);
    return box;
  };

  /*
   * EX.Content.prosCons(host, {pros, cons})
   *   pros: string[]  itens positivos (markup confiável por item)
   *   cons: string[]  itens negativos
   * Retorna o elemento <div class="ex-proscons">.
   */
  EX.Content.prosCons = function (host, spec) {
    spec = spec || {};
    var pros = spec.pros || [];
    var cons = spec.cons || [];
    var box = U.el("div", "ex-proscons");
    for (var i = 0; i < pros.length; i++) {
      box.appendChild(U.el("div", "pro", "+ " + pros[i]));
    }
    for (var j = 0; j < cons.length; j++) {
      box.appendChild(U.el("div", "con", "− " + cons[j]));
    }
    host.appendChild(box);
    return box;
  };
})();
