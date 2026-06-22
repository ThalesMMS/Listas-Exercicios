/*
 * dom.js — Superfície de DOM: DomSurface (window.EX.DomSurface).
 *
 * Para visuais baseados em HTML: tabelas passo a passo, blocos de código com
 * realce, fluxos de tokens, listas chave-valor, memória/registradores, etc.
 * Componentes de alto nível ficam em js/components/content/*.js.
 *
 * O host é um <div class="ex-dom-surface">. Os componentes recebem este host
 * (ou o próprio DomSurface) e anexam conteúdo.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;

  function DomSurface(host) {
    this.host = host;
    U.clear(host);
  }
  DomSurface.prototype.clear = function () {
    U.clear(this.host);
    return this;
  };
  // Define o conteúdo via HTML (string) — confiável, autorado por nós.
  DomSurface.prototype.html = function (markup) {
    this.host.innerHTML = markup;
    return this.host;
  };
  // Anexa um nó ou cria-e-anexa um elemento.
  DomSurface.prototype.add = function (node) {
    this.host.appendChild(node);
    return node;
  };
  DomSurface.prototype.el = function (tag, cls, html) {
    return this.add(U.el(tag, cls, html));
  };

  EX.DomSurface = DomSurface;
})();
