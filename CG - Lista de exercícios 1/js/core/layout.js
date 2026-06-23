/*
 * layout.js — Monta a página de uma questão (question.html?q=NN):
 * cabeçalho, enunciado, abas de partes, canvas + controles + painel de explicação.
 * Cria um CartesianPlane e um Stepper e conecta a navegação + teclado.
 *
 * window.QuestionPage.mount(rootEl)
 */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function getQueryId() {
    var m = /[?&]q=(\d+)/.exec(window.location.search);
    return m ? Number(m[1]) : null;
  }

  function renderRelatedGuides(host, q) {
    var api = window.RelatedGuides;
    var links = api && api.forQuestion ? api.forQuestion(q) : [];
    host.innerHTML = "";
    host.style.display = links.length ? "" : "none";
    links.forEach(function (item) {
      var link = el("a", "q-btn q-related-guide", "Ver mais: " + escapeText(item.title));
      link.href = item.href;
      host.appendChild(link);
    });
  }

  var QuestionPage = {
    mount: function (rootEl) {
      var id = getQueryId();
      var q = window.GUI.get(id);

      document.title = q
        ? "Q" + q.num + " — " + q.title
        : "Questão não encontrada";

      if (!q) {
        rootEl.appendChild(
          el(
            "div",
            "q-missing",
            "<h1>Questão " +
              (id == null ? "?" : id) +
              " não encontrada.</h1><p><a href='index.html'>← Voltar para todas as questões</a></p>"
          )
        );
        return;
      }

      // ---- Cabeçalho ----
      var header = el("header", "q-header");
      var nav = el("div", "q-nav");
      nav.appendChild(el("a", "q-back", "← Todas as questões"));
      nav.firstChild.setAttribute("href", "index.html");
      header.appendChild(nav);

      var titleRow = el("div", "q-titlerow");
      titleRow.appendChild(el("span", "q-badge", q.num));
      titleRow.appendChild(el("h1", "q-h1", escapeText(q.title)));
      titleRow.appendChild(
        el("span", "q-type " + q.type, q.type === "computacional" ? "computacional" : "conceitual")
      );
      header.appendChild(titleRow);
      header.appendChild(el("div", "q-section", escapeText(q.section || "")));
      this._addQuestionBar(header, q);
      rootEl.appendChild(header);

      // ---- Enunciado ----
      if (q.enunciado) {
        rootEl.appendChild(
          el("section", "q-enunciado", "<strong>Enunciado.</strong> " + q.enunciado)
        );
      }

      // ---- Abas de partes ----
      var parts = q.parts || [];
      var tabsBar = el("div", "q-tabs");
      if (parts.length > 1) rootEl.appendChild(tabsBar);

      // ---- Palco: canvas + explicação ----
      var stage = el("div", "q-stage");
      var canvasWrap = el("div", "q-canvas-wrap");
      var canvas = el("canvas", "q-canvas");
      canvas.id = "plane";

      var controls = el("div", "q-controls");
      var btnReset = el("button", "q-btn", "⏮");
      var btnPrev = el("button", "q-btn", "◀");
      var btnPlay = el("button", "q-btn q-btn-play", "▶ Reproduzir");
      var btnNext = el("button", "q-btn", "▶▶");
      var counter = el("span", "q-counter", "");
      btnReset.title = "Reiniciar";
      btnPrev.title = "Anterior (←)";
      btnNext.title = "Próximo (→)";
      btnPlay.title = "Reproduzir/pausar (espaço)";
      controls.appendChild(btnReset);
      controls.appendChild(btnPrev);
      controls.appendChild(btnPlay);
      controls.appendChild(btnNext);
      controls.appendChild(counter);
      canvasWrap.appendChild(controls);

      var progress = el("div", "q-progress");
      var progressBar = el("div", "q-progress-bar");
      progress.appendChild(progressBar);
      canvasWrap.appendChild(progress);
      canvasWrap.appendChild(canvas);

      var explain = el("aside", "q-explain");
      var stepTitle = el("div", "q-step-title", "");
      var stepBody = el("div", "q-step-body", "");
      var relatedGuides = el("div", "q-related-guides", "");
      explain.appendChild(stepTitle);
      explain.appendChild(stepBody);
      explain.appendChild(relatedGuides);
      renderRelatedGuides(relatedGuides, q);

      stage.appendChild(canvasWrap);
      stage.appendChild(explain);
      rootEl.appendChild(stage);

      // ---- Plane + Stepper ----
      var plane = new window.CartesianPlane(canvas);
      var stepper = new window.Stepper(plane);

      stepper.onRender = function (step, i, total) {
        stepTitle.innerHTML = step ? escapeText(step.titulo || "") : "";
        stepBody.innerHTML = step ? step.explicacao || "" : "";
        counter.textContent = total ? "passo " + (i + 1) + " / " + total : "";
        var pct = total > 1 ? (i / (total - 1)) * 100 : 100;
        progressBar.style.width = pct + "%";
        btnPrev.disabled = stepper.atStart();
        btnNext.disabled = stepper.atEnd();
      };
      stepper.onPlayState = function (playing) {
        btnPlay.innerHTML = playing ? "⏸ Pausar" : "▶ Reproduzir";
        btnPlay.classList.toggle("playing", playing);
      };

      // ---- Lógica de troca de parte ----
      var tabButtons = [];
      function activatePart(idx) {
        plane._resize();
        var part = parts[idx];
        var steps = (part.build && part.build(plane)) || [];
        // Sem canvas quando nenhum passo desenha (conceituais textuais).
        var hasDraw = steps.some(function (s) {
          return typeof s.draw === "function";
        });
        stage.classList.toggle("no-canvas", !hasDraw);
        plane._resize();
        stepper.setSteps(steps);
        tabButtons.forEach(function (b, j) {
          b.classList.toggle("active", j === idx);
        });
      }

      parts.forEach(function (part, idx) {
        if (parts.length > 1) {
          var tab = el("button", "q-tab", escapeText(part.label || "Parte " + (idx + 1)));
          tab.addEventListener("click", function () {
            activatePart(idx);
          });
          tabsBar.appendChild(tab);
          tabButtons.push(tab);
        }
      });

      // ---- Eventos ----
      btnReset.addEventListener("click", function () {
        stepper.reset();
      });
      btnPrev.addEventListener("click", function () {
        stepper.pause();
        stepper.prev();
      });
      btnNext.addEventListener("click", function () {
        stepper.pause();
        stepper.next();
      });
      btnPlay.addEventListener("click", function () {
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

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          plane._resize();
          stepper.render();
        }, 120);
      });

      // Redesenha o canvas quando o tema muda (cores vêm do CSS).
      window.addEventListener("themechange", function () {
        stepper.render();
      });

      // Inicializa primeira parte (após layout estabilizar para medir o canvas).
      requestAnimationFrame(function () {
        activatePart(0);
      });
    },

    _addQuestionBar: function (header, q) {
      var all = window.GUI.all();
      var bar = el("nav", "q-questionbar");
      bar.setAttribute("aria-label", "Navegação entre questões");
      all.forEach(function (item) {
        var label = item.num || item.id;
        var active = item.id === q.id;
        var link = el("a", "q-jump" + (active ? " active" : ""), escapeText(label));
        link.setAttribute("href", "question.html?q=" + item.id);
        link.setAttribute("title", "Ir para Q" + label + " — " + item.title);
        link.setAttribute("aria-label", "Ir para Q" + label + ": " + item.title);
        if (active) link.setAttribute("aria-current", "page");
        bar.appendChild(link);
      });
      header.appendChild(bar);
    },
  };

  function escapeText(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.QuestionPage = QuestionPage;
  window.escapeText = escapeText;
})();
