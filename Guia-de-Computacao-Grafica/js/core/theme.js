/*
 * theme.js — Alternância de tema claro/escuro (window.EX.Theme).
 *
 * - Aplica o tema salvo (localStorage) em <html data-theme>.
 * - Monta um botão flutuante (presente em todas as páginas).
 * - Ao trocar: atualiza as cores do canvas (CartesianPlane.refreshTheme) e
 *   dispara "themechange" (SVG/DOM seguem as variáveis CSS automaticamente).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var KEY = "ex-theme";
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
    if (EX.CartesianPlane && EX.CartesianPlane.refreshTheme) EX.CartesianPlane.refreshTheme();
    window.dispatchEvent(new Event("themechange"));
    updateBtn();
  }
  function toggle() {
    apply(current() === "dark" ? "light" : "dark");
  }
  function updateBtn() {
    if (btn) btn.textContent = current() === "dark" ? "☀ Tema claro" : "🌙 Tema escuro";
  }
  function mount() {
    btn = document.createElement("button");
    btn.className = "ex-theme-toggle";
    btn.type = "button";
    btn.title = "Alternar tema claro/escuro";
    btn.addEventListener("click", toggle);
    updateBtn();
    document.body.appendChild(btn);
  }

  apply(saved() || "dark", false);
  if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);

  EX.Theme = { apply: apply, toggle: toggle, current: current };
})();
