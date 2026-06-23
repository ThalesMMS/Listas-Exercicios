/*
 * loader.js — Carrega os scripts do manifesto em ordem e, por fim, o boot.
 *
 * Usa script.async = false: garante execução na ordem de inserção, mesmo com
 * scripts inseridos dinamicamente. Funciona em file:// (sem fetch/CORS).
 */
(function () {
  "use strict";
  var list = (window.EX_MANIFEST && window.EX_MANIFEST.scripts) || [];
  var head = document.head || document.documentElement;
  list.concat(["js/core/boot.js"]).forEach(function (src) {
    var s = document.createElement("script");
    s.src = src;
    s.async = false;
    head.appendChild(s);
  });
})();
