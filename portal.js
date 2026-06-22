/* portal.js — alterna tema claro/escuro, sincronizado com as listas (chave "ex-theme"). */
(function () {
  "use strict";
  var KEY = "ex-theme";
  var root = document.documentElement;
  var btn = document.getElementById("tt");
  function label() {
    if (!btn) return;
    btn.textContent = root.getAttribute("data-theme") === "light" ? "🌙 Escuro" : "☀ Claro";
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var toLight = root.getAttribute("data-theme") !== "light";
      root.setAttribute("data-theme", toLight ? "light" : "dark");
      try { localStorage.setItem(KEY, toLight ? "light" : "dark"); } catch (e) {}
      label();
    });
  }
  label();
})();
