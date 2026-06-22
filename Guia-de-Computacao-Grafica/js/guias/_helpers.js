/*
 * _helpers.js — Utilitários compartilhados pelos guias (window.EX.Guia).
 *
 * Pequenos helpers que o framework não traz e que os guias reaproveitam:
 *   EX.Guia.mat(rows)  -> matriz "com colchetes" em HTML (segue o tema via CSS).
 *   EX.Guia.row(html)  -> linha centralizada (ex.: "C = T · R · S").
 *   EX.Guia.dom(html)  -> visual { type:"dom" } a partir de uma string HTML.
 *   EX.Guia.formula(s) -> bloco .formula (monospace, pré-formatado).
 *
 * Origem: o helper mat()/row() foi padronizado a partir da Lista 2 (q11.js).
 * IIFE + namespace global, sem build, sem dependências (file://).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Guia = EX.Guia || {};

  // Matriz como tabela com "colchetes" (bordas laterais). As cores vêm das
  // variáveis CSS, então a matriz acompanha o tema claro/escuro sozinha.
  EX.Guia.mat = function (rows) {
    var s =
      "<table style='border-collapse:collapse;display:inline-table;margin:0 4px;vertical-align:middle;" +
      "border-left:2px solid var(--ink-dim);border-right:2px solid var(--ink-dim)'>";
    rows.forEach(function (r) {
      s += "<tr>";
      r.forEach(function (c) {
        s +=
          "<td style='padding:2px 8px;text-align:center;font-family:var(--mono);font-size:13px;color:var(--ink)'>" +
          c +
          "</td>";
      });
      s += "</tr>";
    });
    return s + "</table>";
  };

  // Linha horizontal centralizada para encadear matrizes/símbolos.
  EX.Guia.row = function (html) {
    return (
      "<div style='display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;" +
      "margin:12px 4px;font-family:var(--mono);font-size:15px;color:var(--ink-dim)'>" +
      html +
      "</div>"
    );
  };

  // Visual DOM a partir de uma string HTML (atalho para os passos textuais).
  EX.Guia.dom = function (html) {
    return {
      type: "dom",
      draw: function (host) {
        host.innerHTML = html;
      },
    };
  };

  // Bloco de fórmula (monospace, mantém quebras de linha).
  EX.Guia.formula = function (s) {
    return "<div class='formula'>" + s + "</div>";
  };
})();
