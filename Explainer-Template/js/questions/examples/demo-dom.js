/*
 * demo-dom.js — Demonstra a SUPERFÍCIE DE DOM (conteúdo HTML).
 * Tabela de "trace" que cresce e destaca a linha atual. Na fase B há
 * componentes EX.Content.table / code que automatizam isso.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var U = EX.util;

  // Simula um laço: soma acumulada de 1..n
  var TRACE = [];
  (function () {
    var soma = 0;
    for (var i = 1; i <= 5; i++) {
      soma += i;
      TRACE.push({ i: i, termo: i, soma: soma });
    }
  })();

  function table(host, upto, active) {
    var t = U.el("table", "ex-table");
    t.innerHTML = "<tr><th>i</th><th>termo</th><th>soma</th></tr>";
    for (var k = 0; k < upto; k++) {
      var r = TRACE[k];
      var tr = U.el("tr", k === active ? "active" : "");
      tr.innerHTML = "<td>" + r.i + "</td><td>" + r.termo + "</td><td>" + r.soma + "</td>";
      t.appendChild(tr);
    }
    host.appendChild(t);
  }

  function build() {
    var steps = [];
    steps.push({
      title: "Início",
      body: "<p>A superfície de <b>DOM</b> recebe um elemento <code>host</code>; você anexa HTML/elementos. Aqui montamos uma tabela de execução.</p>",
      visual: { type: "dom", draw: function (host) { table(host, 0, -1); } },
    });
    TRACE.forEach(function (r, k) {
      steps.push({
        title: "Iteração i = " + r.i,
        body:
          "<p><code>soma += " + r.termo + "</code> → <span class='ok'>soma = " + r.soma + "</span>.</p>",
        visual: { type: "dom", draw: function (host) { table(host, k + 1, k); } },
      });
    });
    steps.push({
      title: "Resultado",
      body: "<p>Soma de 1 a 5 = <span class='ok'>15</span>.</p>",
      visual: { type: "dom", draw: function (host) { table(host, TRACE.length, TRACE.length - 1); } },
    });
    return steps;
  }

  EX.registry.add({
    id: "demo-dom",
    num: "▤",
    subject: "Demonstrações das superfícies",
    section: "DOM",
    title: "Conteúdo HTML (dom)",
    type: "computacional",
    hubDesc: "Tabelas de trace, código com realce, memória/registradores.",
    statement:
      "Demonstra a superfície de <strong>DOM</strong> (HTML). Ideal para tabelas passo a passo, traços de execução, código e estruturas de dados.",
    parts: [{ label: "Demo", build: build }],
  });
})();
