(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});
  var U = TP4.util;

  function sectionUrl(id) { return (window.TP4_CONFIG && window.TP4_CONFIG.sectionBase || "section.html?s=") + encodeURIComponent(id); }
  function queryId() {
    var m = /[?&]s=([^&]+)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function mountHub(host) {
    U.clear(host);
    var groups = TP4.registry.grouped();
    groups.forEach(function (g) {
      var h = U.el("h2", "tp4-section-title", U.escapeHtml(g.subject));
      host.appendChild(h);
      var grid = U.el("div", "tp4-cards");
      g.items.forEach(function (item) {
        var a = U.el("a", "tp4-card");
        a.href = sectionUrl(item.id);
        a.innerHTML =
          "<div class='tp4-card-top'>" +
          "<span class='tp4-card-num'>" + U.escapeHtml(item.num || "") + "</span>" +
          "<span class='tp4-tag " + U.escapeHtml(item.type || "conceitual") + "'>" + U.escapeHtml(item.type || "conceitual") + "</span>" +
          "</div>" +
          "<h3>" + U.escapeHtml(item.title) + "</h3>" +
          (item.hubDesc ? "<div class='tp4-card-desc'>" + item.hubDesc + "</div>" : "") +
          "<div class='tp4-card-footer'>" + ((item.parts || []).length || 1) + " parte(s) · " + countSteps(item) + " passos</div>";
        grid.appendChild(a);
      });
      host.appendChild(grid);
    });
  }

  function countSteps(item) {
    var total = 0;
    (item.parts || []).forEach(function (p) {
      try { total += ((p.build && p.build()) || []).length; } catch (e) { total += 0; }
    });
    return total;
  }

  function mountSection(root) {
    U.clear(root);
    var id = queryId();
    var item = TP4.registry.get(id) || TP4.registry.all()[0];
    if (!item) {
      root.appendChild(U.el("div", "tp4-missing", "<h1>Nenhuma subsessão registrada.</h1>"));
      return;
    }
    document.title = (item.num ? item.num + " — " : "") + item.title;

    var header = U.el("header", "tp4-header");
    header.innerHTML =
      "<div class='tp4-nav'><a class='tp4-back' href='index.html'>← Todas as subsessões</a></div>" +
      "<div class='tp4-title-row'><span class='tp4-badge'>" + U.escapeHtml(item.num || "") + "</span>" +
      "<h1 class='tp4-h1'>" + U.escapeHtml(item.title) + "</h1>" +
      "<span class='tp4-tag " + U.escapeHtml(item.type || "conceitual") + "'>" + U.escapeHtml(item.type || "conceitual") + "</span></div>" +
      (item.subtitle ? "<div class='tp4-subtitle'>" + item.subtitle + "</div>" : "");
    addJumpbar(header, item);
    root.appendChild(header);

    if (item.statement) {
      root.appendChild(U.el("section", "tp4-statement", "<strong>Objetivo.</strong> " + item.statement));
    }

    var parts = item.parts || [];
    var tabs = U.el("div", "tp4-tabs");
    if (parts.length > 1) root.appendChild(tabs);

    var stageWrap = U.el("div", "tp4-stage");
    var visualWrap = U.el("section", "tp4-visual-wrap");
    var controls = U.el("div", "tp4-controls");
    var btnReset = U.el("button", "tp4-btn", "⏮");
    var btnPrev = U.el("button", "tp4-btn", "◀");
    var btnPlay = U.el("button", "tp4-btn", "▶ Reproduzir");
    var btnNext = U.el("button", "tp4-btn", "▶▶");
    var counter = U.el("span", "tp4-counter", "");
    [btnReset, btnPrev, btnPlay, btnNext].forEach(function (b) { b.type = "button"; controls.appendChild(b); });
    controls.appendChild(counter);
    visualWrap.appendChild(controls);
    var progress = U.el("div", "tp4-progress");
    var progressBar = U.el("div", "tp4-progress-bar");
    progress.appendChild(progressBar);
    visualWrap.appendChild(progress);
    var visual = U.el("div", "tp4-visual");
    visualWrap.appendChild(visual);

    var explain = U.el("aside", "tp4-explain");
    var stepTitle = U.el("div", "tp4-step-title", "");
    var stepBody = U.el("div", "tp4-step-body", "");
    explain.appendChild(stepTitle);
    explain.appendChild(stepBody);

    stageWrap.appendChild(visualWrap);
    stageWrap.appendChild(explain);
    root.appendChild(stageWrap);

    var stage = new TP4.Stage(visual);
    var stepper = new TP4.Stepper();
    var tabButtons = [];

    stepper.onRender = function (step, i, total) {
      step = step || {};
      var hasVisual = stage.render(step);
      stageWrap.classList.toggle("no-visual", !hasVisual);
      stepTitle.innerHTML = U.escapeHtml(step.title || "");
      stepBody.innerHTML = step.body || "";
      counter.textContent = total ? "passo " + (i + 1) + " / " + total : "";
      progressBar.style.width = total > 1 ? (i / (total - 1)) * 100 + "%" : "100%";
      btnPrev.disabled = stepper.atStart();
      btnNext.disabled = stepper.atEnd();
    };
    stepper.onPlayState = function (playing) {
      btnPlay.textContent = playing ? "⏸ Pausar" : "▶ Reproduzir";
      btnPlay.classList.toggle("playing", playing);
    };

    function activatePart(index) {
      var p = parts[index];
      var steps = (p && p.build && p.build()) || [];
      stepper.setSteps(steps);
      tabButtons.forEach(function (b, j) { b.classList.toggle("active", j === index); });
    }
    parts.forEach(function (p, idx) {
      if (parts.length > 1) {
        var tab = U.el("button", "tp4-tab", U.escapeHtml(p.label || "Parte " + (idx + 1)));
        tab.type = "button";
        tab.addEventListener("click", function () { activatePart(idx); });
        tabs.appendChild(tab);
        tabButtons.push(tab);
      }
    });

    btnReset.title = "Reiniciar";
    btnPrev.title = "Anterior (←)";
    btnNext.title = "Próximo (→)";
    btnPlay.title = "Reproduzir/pausar (espaço)";
    btnReset.addEventListener("click", function () { stepper.reset(); });
    btnPrev.addEventListener("click", function () { stepper.pause(); stepper.prev(); });
    btnNext.addEventListener("click", function () { stepper.pause(); stepper.next(); });
    btnPlay.addEventListener("click", function () { stepper.toggle(); });

    document.addEventListener("keydown", function (e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { stepper.pause(); stepper.next(); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stepper.pause(); stepper.prev(); e.preventDefault(); }
      else if (e.key === " ") { stepper.toggle(); e.preventDefault(); }
      else if (e.key === "Home") { stepper.reset(); e.preventDefault(); }
    });
    window.addEventListener("tp4-themechange", function () { stepper.render(); });

    activatePart(0);
  }

  function addJumpbar(header, current) {
    var bar = U.el("nav", "tp4-jumpbar");
    bar.setAttribute("aria-label", "Navegação entre subsessões");
    TP4.registry.all().forEach(function (it) {
      var a = U.el("a", "tp4-jump" + (it.id === current.id ? " active" : ""), U.escapeHtml(it.num || it.id));
      a.href = sectionUrl(it.id);
      a.title = it.title;
      if (it.id === current.id) a.setAttribute("aria-current", "page");
      bar.appendChild(a);
    });
    header.appendChild(bar);
  }

  TP4.Layout = { mountHub: mountHub, mountSection: mountSection };
})();
