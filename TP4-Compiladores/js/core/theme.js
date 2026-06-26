(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});
  var KEY = (window.TP4_CONFIG && window.TP4_CONFIG.themeKey) || "tp4-theme";
  var btn = null;

  function current() { return document.documentElement.getAttribute("data-theme") || "dark"; }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(name, persist) {
    document.documentElement.setAttribute("data-theme", name);
    if (persist !== false) { try { localStorage.setItem(KEY, name); } catch (e) {} }
    updateBtn();
    window.dispatchEvent(new Event("tp4-themechange"));
  }
  function toggle() { apply(current() === "dark" ? "light" : "dark"); }
  function updateBtn() {
    if (!btn) return;
    btn.textContent = current() === "dark" ? "☀ Tema claro" : "🌙 Tema escuro";
  }
  function mount() {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tp4-theme-toggle";
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    updateBtn();
  }

  apply(saved() || current(), false);
  if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);

  TP4.theme = { current: current, apply: apply, toggle: toggle };
})();
