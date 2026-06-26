(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});
  var U = TP4.util;

  function DomSurface(host) { this.host = host; }
  DomSurface.prototype.clear = function () { U.clear(this.host); return this; };
  DomSurface.prototype.html = function (html) { this.host.innerHTML = html || ""; return this; };
  DomSurface.prototype.append = function (node) { this.host.appendChild(node); return node; };

  TP4.DomSurface = DomSurface;
})();
