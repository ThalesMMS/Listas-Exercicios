/*
 * stage.js — Stage (window.EX.Stage): gerencia a ÁREA VISUAL de um passo.
 *
 * Cada passo declara um `visual` e o Stage escolhe a SUPERFÍCIE adequada:
 *   - { type: 'plane', bounds?, draw(plane) }   -> CartesianPlane (canvas)
 *   - { type: 'svg',   view?,   draw(svg) }      -> SvgSurface (diagramas)
 *   - { type: 'dom',             draw(host) }     -> elemento <div> (HTML)
 *   - { type: 'none' }  ou ausente                -> sem visual (texto ocupa tudo)
 *
 * As três superfícies coexistem no DOM; o Stage mostra apenas a do passo atual.
 * É isso que permite, na MESMA lista, misturar plano cartesiano (comp. gráfica),
 * autômatos (compiladores), árvores de busca (IA) e diagramas (eng. de software).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;

  function Stage(host) {
    this.host = host;
    U.clear(host);

    this.canvasWrap = U.el("div", "ex-surface ex-canvas-wrap");
    this.canvas = U.el("canvas", "ex-canvas");
    this.canvasWrap.appendChild(this.canvas);

    this.svg = U.svgEl("svg", { class: "ex-surface ex-svg" });

    this.domHost = U.el("div", "ex-surface ex-dom-surface");

    host.appendChild(this.canvasWrap);
    host.appendChild(this.svg);
    host.appendChild(this.domHost);

    this.plane = null;
    this._show(null);
  }

  Stage.prototype._show = function (which) {
    this.canvasWrap.style.display = which === "plane" ? "block" : "none";
    this.svg.style.display = which === "svg" ? "block" : "none";
    this.domHost.style.display = which === "dom" ? "block" : "none";
  };

  // Renderiza o visual de um passo. Retorna true se houve visual desenhado.
  Stage.prototype.render = function (visual) {
    if (!visual || visual.type === "none") {
      this._show(null);
      return false;
    }
    try {
      if (visual.type === "plane") {
        this._show("plane");
        if (!this.plane) this.plane = new EX.CartesianPlane(this.canvas);
        this.plane._resize();
        if (visual.bounds)
          this.plane.setBounds(visual.bounds[0], visual.bounds[1], visual.bounds[2], visual.bounds[3]);
        this.plane.base();
        if (typeof visual.draw === "function") visual.draw(this.plane);
        return true;
      }
      if (visual.type === "svg") {
        this._show("svg");
        var s = new EX.SvgSurface(this.svg);
        if (visual.view) s.view(visual.view[0], visual.view[1]);
        if (typeof visual.draw === "function") visual.draw(s);
        return true;
      }
      if (visual.type === "dom") {
        this._show("dom");
        U.clear(this.domHost);
        if (typeof visual.draw === "function") visual.draw(this.domHost);
        return true;
      }
    } catch (e) {
      console.error("Stage.render: erro ao desenhar visual", visual && visual.type, e);
    }
    this._show(null);
    return false;
  };

  // Reaplica o tamanho do canvas (após resize de janela).
  Stage.prototype.resize = function () {
    if (this.plane) this.plane._resize();
  };

  EX.Stage = Stage;
})();
