/*
 * slides.js — Templates de "slide" para questões CONCEITUAIS (EX.Slides).
 *
 * Cada função RETORNA um objeto Step ({title, body, visual?}) pronto para entrar
 * no array de uma parte. O visual, quando existe, é do tipo "dom" e usa os
 * componentes de EX.Content (callout, definition, prosCons, table).
 *
 * IIFE + namespace global. Funções PURAS (builders): não guardam estado global.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Slides = EX.Slides || {};
  var C = function () { return EX.Content || {}; };

  /*
   * EX.Slides.concept({title, body, visual?}) -> Step
   *   Slide de introdução/conceito. Apenas texto por padrão; aceita um visual
   *   pronto (qualquer tipo) se fornecido.
   */
  EX.Slides.concept = function (spec) {
    spec = spec || {};
    var step = { title: spec.title || "Conceito", body: spec.body || "" };
    if (spec.visual) step.visual = spec.visual;
    return step;
  };

  /*
   * EX.Slides.definition({title?, term, body}) -> Step
   *   Slide de definição: visual "dom" com EX.Content.definition(term, body).
   *   O corpo do painel lateral repete o termo de forma curta.
   */
  EX.Slides.definition = function (spec) {
    spec = spec || {};
    var term = spec.term || "";
    var body = spec.body || "";
    return {
      title: spec.title || ("Definição: " + term),
      body: "<p>Veja a definição de <span class='accent'>" +
        EX.util.escapeHtml(term) + "</span> ao lado.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.definition(host, { term: term, html: body });
        },
      },
    };
  };

  /*
   * EX.Slides.comparison({title, intro?, headers, rows}) -> Step
   *   Slide de comparação: visual "dom" com uma tabela EX.Content.table.
   *   intro (opcional) vira o corpo do painel lateral.
   */
  EX.Slides.comparison = function (spec) {
    spec = spec || {};
    var headers = spec.headers || [];
    var rows = spec.rows || [];
    return {
      title: spec.title || "Comparação",
      body: spec.intro || "<p>Compare as alternativas na tabela ao lado.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, { headers: headers, rows: rows });
        },
      },
    };
  };

  /*
   * EX.Slides.prosCons({title, intro?, items:[{name, pros, cons}]}) -> Step
   *   Slide de prós/contras: visual "dom" com um bloco por item (nome em
   *   destaque + EX.Content.prosCons).
   */
  EX.Slides.prosCons = function (spec) {
    spec = spec || {};
    var items = spec.items || [];
    return {
      title: spec.title || "Prós e contras",
      body: spec.intro || "<p>Veja vantagens e desvantagens ao lado.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          for (var i = 0; i < items.length; i++) {
            var it = items[i] || {};
            if (it.name != null) {
              host.appendChild(
                EX.util.el("div", "ex-proscons-title accent", EX.util.escapeHtml(it.name))
              );
            }
            EX.Content.prosCons(host, { pros: it.pros || [], cons: it.cons || [] });
          }
        },
      },
    };
  };
})();
