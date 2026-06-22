/*
 * boot.js — Inicialização da página (carregado por último pelo loader).
 * Decide entre montar o HUB (index) ou a PÁGINA DE QUESTÃO (question) via EX_PAGE.
 */
(function () {
  "use strict";
  var EX = window.EX || {};
  var U = EX.util;

  function applyHubConfig() {
    var cfg = window.EX_CONFIG || {};
    if (cfg.pageTitle || cfg.hubTitle) document.title = cfg.pageTitle || cfg.hubTitle;

    var title = document.querySelector('[data-ex-config="title"]');
    if (title && cfg.hubTitle) title.textContent = cfg.hubTitle;

    var desc = document.querySelector('[data-ex-config="description"]');
    if (desc && cfg.hubDescriptionHtml) desc.innerHTML = cfg.hubDescriptionHtml;

    var chips = document.querySelector('[data-ex-config="chips"]');
    if (chips && cfg.hubChipsHtml && cfg.hubChipsHtml.length) {
      U.clear(chips);
      cfg.hubChipsHtml.forEach(function (html) {
        chips.appendChild(U.el("span", "ex-chip", html));
      });
    }
  }

  function buildHub(host) {
    var groups = EX.registry.grouped();
    if (!groups.length) {
      host.innerHTML = "<p class='muted'>Nenhuma questão registrada. Veja README/AUTHORING.</p>";
      return;
    }
    groups.forEach(function (g) {
      host.appendChild(U.el("h2", "ex-subject", U.escapeHtml(g.subject)));
      g.sections.forEach(function (sec) {
        if (sec.section) host.appendChild(U.el("div", "ex-section-title", U.escapeHtml(sec.section)));
        var grid = U.el("div", "ex-cards");
        sec.items.forEach(function (q) {
          var a = U.el("a", "ex-card");
          a.href = "question.html?q=" + encodeURIComponent(q.id);
          a.innerHTML =
            '<div class="ex-card-top">' +
            (q.num != null ? '<span class="ex-card-num">' + U.escapeHtml(q.num) + "</span>" : "") +
            '<span class="ex-tag ' + (q.type || "") + '">' + U.escapeHtml(q.type || "") + "</span>" +
            "</div>" +
            "<h3>" + U.escapeHtml(q.title) + "</h3>" +
            (q.hubDesc ? '<div class="ex-card-desc">' + q.hubDesc + "</div>" : "");
          grid.appendChild(a);
        });
        host.appendChild(grid);
      });
    });
  }

  function init() {
    if (window.EX_PAGE === "question") {
      EX.QuestionPage.mount(document.getElementById("app"));
    } else {
      applyHubConfig();
      buildHub(document.getElementById("hub"));
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
