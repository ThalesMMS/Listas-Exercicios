/*
 * layout.js — Monta a página de uma questão (question.html?q=<id>) e conecta
 * Stage + Stepper + controles + teclado. (window.EX.QuestionPage)
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  var el = U.el;

  function queryId() {
    var m = /[?&]q=([^&]+)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  var QuestionPage = {
    mount: function (root) {
      var id = queryId();
      var q = EX.registry.get(id);
      document.title = q ? "Q" + (q.num || q.id) + " — " + q.title : "Questão não encontrada";

      if (!q) {
        root.appendChild(
          el(
            "div",
            "ex-missing",
            "<h1>Questão não encontrada.</h1><p><a href='index.html'>← Voltar</a></p>"
          )
        );
        return;
      }

      // ---- Cabeçalho ----
      var header = el("header", "ex-header");
      var nav = el("div", "ex-nav");
      var back = el("a", "ex-back", "← Todas as questões");
      back.href = "index.html";
      nav.appendChild(back);
      header.appendChild(nav);
      header.appendChild(
        el(
          "div",
          "ex-crumb",
          U.escapeHtml(q.subject || "") + (q.section ? " · " + U.escapeHtml(q.section) : "")
        )
      );
      var titlerow = el("div", "ex-titlerow");
      if (q.num != null) titlerow.appendChild(el("span", "ex-badge", U.escapeHtml(q.num)));
      titlerow.appendChild(el("h1", "ex-h1", U.escapeHtml(q.title)));
      titlerow.appendChild(
        el("span", "ex-type " + (q.type || ""), U.escapeHtml(q.type || ""))
      );
      header.appendChild(titlerow);
      this._questionBar(header, q);
      root.appendChild(header);

      if (q.statement)
        root.appendChild(el("section", "ex-statement", "<strong>Enunciado.</strong> " + q.statement));

      // ---- Abas ----
      var parts = q.parts || [];
      var tabsBar = el("div", "ex-tabs");
      if (parts.length > 1) root.appendChild(tabsBar);

      // ---- Palco ----
      var stage = el("div", "ex-stage");
      var visCol = el("div", "ex-visual-col");
      var visHost = el("div", "ex-stage-visual");
      visCol.appendChild(visHost);

      var controls = el("div", "ex-controls");
      var bReset = el("button", "ex-btn", "⏮");
      var bPrev = el("button", "ex-btn", "◀");
      var bPlay = el("button", "ex-btn ex-btn-play", "▶ Reproduzir");
      var bNext = el("button", "ex-btn", "▶▶");
      var counter = el("span", "ex-counter", "");
      bReset.title = "Reiniciar";
      bPrev.title = "Anterior (←)";
      bNext.title = "Próximo (→)";
      bPlay.title = "Reproduzir/pausar (espaço)";
      [bReset, bPrev, bPlay, bNext, counter].forEach(function (n) {
        controls.appendChild(n);
      });
      visCol.appendChild(controls);
      var progress = el("div", "ex-progress");
      var bar = el("div", "ex-progress-bar");
      progress.appendChild(bar);
      visCol.appendChild(progress);

      var explain = el("aside", "ex-explain");
      var stepTitle = el("div", "ex-step-title", "");
      var stepBody = el("div", "ex-step-body", "");
      explain.appendChild(stepTitle);
      explain.appendChild(stepBody);

      stage.appendChild(visCol);
      stage.appendChild(explain);
      root.appendChild(stage);

      // ---- Stage + Stepper ----
      var theStage = new EX.Stage(visHost);
      var stepper = new EX.Stepper(theStage);
      stepper.onRender = function (step, i, total) {
        stepTitle.innerHTML = step ? U.escapeHtml(step.title || "") : "";
        stepBody.innerHTML = step ? step.body || "" : "";
        counter.textContent = total ? "passo " + (i + 1) + " / " + total : "";
        bar.style.width = (total > 1 ? (i / (total - 1)) * 100 : 100) + "%";
        bPrev.disabled = stepper.atStart();
        bNext.disabled = stepper.atEnd();
      };
      stepper.onPlayState = function (playing) {
        bPlay.innerHTML = playing ? "⏸ Pausar" : "▶ Reproduzir";
        bPlay.classList.toggle("playing", playing);
      };

      var tabButtons = [];
      function activate(idx) {
        theStage.resize();
        var part = parts[idx];
        var steps = (part.build && part.build({})) || [];
        var hasVisual = steps.some(function (s) {
          return s.visual && s.visual.type && s.visual.type !== "none";
        });
        stage.classList.toggle("no-visual", !hasVisual);
        theStage.resize();
        stepper.setSteps(steps);
        tabButtons.forEach(function (b, j) {
          b.classList.toggle("active", j === idx);
        });
      }
      parts.forEach(function (part, idx) {
        if (parts.length > 1) {
          var tab = el("button", "ex-tab", U.escapeHtml(part.label || "Parte " + (idx + 1)));
          tab.addEventListener("click", function () {
            activate(idx);
          });
          tabsBar.appendChild(tab);
          tabButtons.push(tab);
        }
      });

      bReset.addEventListener("click", function () {
        stepper.reset();
      });
      bPrev.addEventListener("click", function () {
        stepper.pause();
        stepper.prev();
      });
      bNext.addEventListener("click", function () {
        stepper.pause();
        stepper.next();
      });
      bPlay.addEventListener("click", function () {
        stepper.toggle();
      });
      document.addEventListener("keydown", function (e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.key === "ArrowRight") {
          stepper.pause();
          stepper.next();
          e.preventDefault();
        } else if (e.key === "ArrowLeft") {
          stepper.pause();
          stepper.prev();
          e.preventDefault();
        } else if (e.key === " ") {
          stepper.toggle();
          e.preventDefault();
        } else if (e.key === "Home") {
          stepper.reset();
          e.preventDefault();
        }
      });
      var rt = null;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          theStage.resize();
          stepper.render();
        }, 120);
      });
      window.addEventListener("themechange", function () {
        stepper.render();
      });

      requestAnimationFrame(function () {
        activate(0);
      });
    },

    _questionBar: function (header, q) {
      var all = EX.registry.all();
      var bar = el("nav", "ex-questionbar");
      bar.setAttribute("aria-label", "Navegação entre questões");
      all.forEach(function (item) {
        var label = item.num || item.id;
        var active = item.id === q.id;
        var link = el("a", "ex-jump" + (active ? " active" : ""), U.escapeHtml(label));
        link.href = "question.html?q=" + encodeURIComponent(item.id);
        link.title = "Ir para Q" + label + " — " + item.title;
        link.setAttribute("aria-label", "Ir para Q" + label + ": " + item.title);
        if (active) link.setAttribute("aria-current", "page");
        bar.appendChild(link);
      });
      header.appendChild(bar);
    },
  };

  EX.QuestionPage = QuestionPage;
})();
