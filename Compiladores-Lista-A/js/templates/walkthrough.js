/*
 * walkthrough.js — Templates que GERAM listas de Step (EX.Walkthrough).
 *
 * EX.Walkthrough.fromTrace(trace, {title, body, render}) -> Step[]
 *   Um Step por entrada de um "trace" (execução). title/body podem ser strings
 *   fixas ou funções (entry,i)=>string; render(entry,i,all)=>visual produz o
 *   visual de cada passo.
 *
 * EX.Walkthrough.code({code, lang?, steps}) -> Step[]
 *   Percorre um trecho de código realçando, a cada passo, um conjunto de linhas
 *   (via visual "dom" + EX.Content.code).
 *
 * IIFE + namespace global. Funções PURAS (builders): não guardam estado global.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Walkthrough = EX.Walkthrough || {};

  // Resolve um campo que pode ser função (entry,i,all) ou valor fixo.
  function resolve(field, entry, i, all) {
    return typeof field === "function" ? field(entry, i, all) : field;
  }

  /*
   * EX.Walkthrough.fromTrace(trace, opts) -> Step[]
   *   trace: any[]               — uma entrada por passo.
   *   opts:
   *     title  : string | (entry,i,all)=>string   título do passo
   *     body   : string | (entry,i,all)=>string   corpo (HTML) do passo
   *     render : (entry,i,all)=>visual             visual do passo (opcional)
   */
  EX.Walkthrough.fromTrace = function (trace, opts) {
    trace = trace || [];
    opts = opts || {};
    var steps = [];
    for (var i = 0; i < trace.length; i++) {
      var entry = trace[i];
      var step = {
        title: resolve(opts.title, entry, i, trace) || ("Passo " + (i + 1)),
        body: resolve(opts.body, entry, i, trace) || "",
      };
      if (typeof opts.render === "function") {
        var v = opts.render(entry, i, trace);
        if (v) step.visual = v;
      }
      steps.push(step);
    }
    return steps;
  };

  /*
   * EX.Walkthrough.code({code, lang?, steps}) -> Step[]
   *   code : string                 — trecho de código completo.
   *   lang : "js"|"c"|"py"|"text"    — linguagem p/ tokenização (default "text").
   *   steps: { lines:number[], title, body }[]
   *          Cada passo realça `lines` (via EX.Content.code) e mostra title/body.
   */
  EX.Walkthrough.code = function (spec) {
    spec = spec || {};
    var code = spec.code || "";
    var lang = spec.lang || "text";
    var steps = spec.steps || [];
    var out = [];
    for (var i = 0; i < steps.length; i++) {
      out.push(makeCodeStep(code, lang, steps[i], i));
    }
    return out;
  };

  // Cria um Step que realça as linhas do passo k no bloco de código.
  function makeCodeStep(code, lang, st, i) {
    st = st || {};
    var lines = st.lines || [];
    return {
      title: st.title || ("Passo " + (i + 1)),
      body: st.body || "",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.code(host, { code: code, lang: lang, active: lines });
        },
      },
    };
  }
})();
