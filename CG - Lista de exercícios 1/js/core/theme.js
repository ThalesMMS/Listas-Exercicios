/*
 * theme.js — Alternância de tema claro/escuro.
 *
 * - Aplica o tema salvo (localStorage) no <html data-theme>.
 * - Monta um botão flutuante de alternância (presente em todas as páginas).
 * - Ao trocar: atualiza as cores do canvas (CartesianPlane.refreshTheme) e
 *   dispara o evento "themechange" para quem precisa redesenhar (layout.js).
 *
 * O CSS controla o DOM via variáveis; o canvas lê as mesmas variáveis.
 */
(function () {
  "use strict";
  var KEY = "gui-theme";
  var btn = null;

  function current() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function saved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function apply(name, persist) {
    document.documentElement.setAttribute("data-theme", name);
    if (persist !== false) {
      try {
        localStorage.setItem(KEY, name);
      } catch (e) {}
    }
    if (window.CartesianPlane && window.CartesianPlane.refreshTheme) {
      window.CartesianPlane.refreshTheme();
    }
    window.dispatchEvent(new Event("themechange"));
    updateBtn();
  }

  function toggle() {
    apply(current() === "dark" ? "light" : "dark");
  }

  function updateBtn() {
    if (!btn) return;
    // mostra o destino da ação
    btn.textContent = current() === "dark" ? "☀ Tema claro" : "🌙 Tema escuro";
  }

  function mount() {
    btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    btn.title = "Alternar tema claro/escuro";
    btn.addEventListener("click", toggle);
    updateBtn();
    document.body.appendChild(btn);
  }

  // Aplica o tema salvo já no load (sem reescrever o storage).
  apply(saved() || "dark", false);

  if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);

  window.Theme = { apply: apply, toggle: toggle, current: current };
})();
