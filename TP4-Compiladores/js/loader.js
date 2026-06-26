(function () {
  "use strict";

  function loadSequential(paths, done) {
    var i = 0;
    function next() {
      if (i >= paths.length) { done(); return; }
      var s = document.createElement("script");
      s.src = paths[i++];
      s.onload = next;
      s.onerror = function () {
        var msg = document.createElement("pre");
        msg.textContent = "Erro ao carregar " + s.src;
        document.body.appendChild(msg);
      };
      document.body.appendChild(s);
    }
    next();
  }

  loadSequential(window.TP4_MANIFEST || [], function () {
    if (!window.TP4 || !window.TP4.Layout) return;
    if (window.TP4_PAGE === "hub") window.TP4.Layout.mountHub(document.getElementById("hub"));
    else window.TP4.Layout.mountSection(document.getElementById("app"));
  });
})();
