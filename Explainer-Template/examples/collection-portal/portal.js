/* portal.js — Alterna tema e compartilha a chave "ex-theme" com copias do Explainer. */
(function () {
  "use strict";
  var KEY = "ex-theme";
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");

  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function label() {
    if (!btn) return;
    btn.textContent = current() === "light" ? "Tema escuro" : "Tema claro";
  }

  if (btn) {
    btn.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      label();
    });
  }

  label();
})();
