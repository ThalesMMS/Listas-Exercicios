/*
 * table.js — Componente de tabela passo a passo (EX.Content.table).
 *
 * Monta <table class="ex-table"> com cabeçalho e linhas. Permite destacar uma
 * linha inteira (activeRow) e aplicar classes por célula (cellClass).
 *
 * IIFE + namespace global (sem build, file://). Função PURA de desenho: recebe
 * o host (<div> da superfície DOM), constrói o DOM e anexa. Não guarda estado.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  EX.Content = EX.Content || {};

  /*
   * EX.Content.table(host, spec)
   *   host: elemento <div> onde a tabela será anexada.
   *   spec:
   *     headers   : string[]            cabeçalhos das colunas (opcional)
   *     rows      : any[][]             matriz de células (linhas x colunas)
   *     activeRow : number             índice da linha a receber class "active" (opcional)
   *     cellClass : (r,c)=>string      classe extra por célula, ex. "hl" (opcional)
   * Retorna o elemento <table> criado.
   */
  EX.Content.table = function (host, spec) {
    spec = spec || {};
    var headers = spec.headers || [];
    var rows = spec.rows || [];
    var activeRow = spec.activeRow;
    var cellClass = typeof spec.cellClass === "function" ? spec.cellClass : null;

    var t = U.el("table", "ex-table");

    if (headers.length) {
      var thead = U.el("thead");
      var htr = U.el("tr");
      for (var h = 0; h < headers.length; h++) {
        htr.appendChild(U.el("th", null, U.escapeHtml(headers[h])));
      }
      thead.appendChild(htr);
      t.appendChild(thead);
    }

    var tbody = U.el("tbody");
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r] || [];
      var tr = U.el("tr", r === activeRow ? "active" : null);
      for (var c = 0; c < row.length; c++) {
        var cls = cellClass ? cellClass(r, c) : "";
        var td = U.el("td", cls || null, U.escapeHtml(row[c]));
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    t.appendChild(tbody);

    host.appendChild(t);
    return t;
  };
})();
