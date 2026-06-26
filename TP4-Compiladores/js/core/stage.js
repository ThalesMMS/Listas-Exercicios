(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});
  var U = TP4.util;

  function Stage(container) {
    this.container = container;
    this.svgEl = U.svgEl("svg", { role: "img" });
    this.domHost = U.el("div", "tp4-dom-host");
    this.container.appendChild(this.svgEl);
    this.container.appendChild(this.domHost);
    this.svg = new TP4.SvgSurface(this.svgEl);
    this.dom = new TP4.DomSurface(this.domHost);
  }

  Stage.prototype.render = function (step) {
    step = step || {};
    var visual = step.visual || { type: "none" };
    var type = visual.type || "none";
    this.svgEl.style.display = type === "svg" ? "block" : "none";
    this.domHost.style.display = type === "dom" ? "block" : "none";

    if (type === "svg") {
      this.svg.clear();
      if (visual.view) this.svg.view(visual.view[0], visual.view[1]);
      else this.svg.view(760, 430);
      if (typeof visual.draw === "function") visual.draw(this.svg);
    } else if (type === "dom") {
      this.dom.clear();
      if (visual.html != null) this.dom.html(visual.html);
      if (typeof visual.draw === "function") visual.draw(this.domHost, this.dom);
    } else {
      this.svg.clear();
      this.dom.clear();
    }
    return type !== "none";
  };

  TP4.Stage = Stage;
})();
