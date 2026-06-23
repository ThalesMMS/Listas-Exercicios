/*
 * registry.js — Registro global de questões (window.EX.registry).
 *
 * Cada módulo de questão (js/questions/.../*.js) chama EX.registry.add({...}).
 * As páginas (index.html / question.html) leem o registro para montar o hub e
 * renderizar uma questão.
 *
 * Formato de uma questão:
 *   {
 *     id: "cg-bresenham-circ",   // string única (slug) usada em ?q=<id>
 *     num: "20",                 // rótulo curto opcional exibido no badge
 *     subject: "Computação Gráfica",   // matéria (agrupa no hub, 1º nível)
 *     section: "Rasterização",         // seção (agrupa no hub, 2º nível, opcional)
 *     title: "Bresenham para circunferências",
 *     type: "computacional" | "conceitual",   // só rótulo visual
 *     tags: ["canvas", "rasterização"],        // opcional
 *     hubDesc: "texto curto para o card",       // opcional
 *     statement: "HTML do enunciado",           // opcional
 *     parts: [ { label, build: (ctx) => Step[] } ]   // 1+ partes (abas)
 *   }
 *
 * Step (ver core/stage.js para os tipos de visual):
 *   {
 *     title: "Título do passo",
 *     body: "HTML explicativo (painel lateral)",
 *     visual?: Visual            // { type:'plane'|'svg'|'dom'|'none', ... }
 *   }
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  if (EX.registry) return;

  var registry = {
    questions: {},
    _order: [],

    add: function (q) {
      if (!q || q.id == null) {
        console.error("EX.registry.add: questão sem id", q);
        return;
      }
      if (this.questions[q.id]) {
        var i = this._order.indexOf(q.id);
        if (i !== -1) this._order.splice(i, 1);
      }
      this.questions[q.id] = q;
      this._order.push(q.id);
      return q;
    },

    get: function (id) {
      return this.questions[id] || null;
    },

    // Ordem de registro (estável).
    all: function () {
      var self = this;
      return this._order.map(function (id) {
        return self.questions[id];
      });
    },

    // Agrupa por subject -> section, preservando ordem de aparição.
    grouped: function () {
      var subjects = [];
      var sIndex = {};
      this.all().forEach(function (q) {
        var sub = q.subject || "Outros";
        if (!(sub in sIndex)) {
          sIndex[sub] = subjects.length;
          subjects.push({ subject: sub, sections: [], _secIndex: {} });
        }
        var grp = subjects[sIndex[sub]];
        var sec = q.section || "";
        if (!(sec in grp._secIndex)) {
          grp._secIndex[sec] = grp.sections.length;
          grp.sections.push({ section: sec, items: [] });
        }
        grp.sections[grp._secIndex[sec]].items.push(q);
      });
      return subjects;
    },

    subjects: function () {
      var seen = {};
      var out = [];
      this.all().forEach(function (q) {
        var s = q.subject || "Outros";
        if (!seen[s]) {
          seen[s] = true;
          out.push(s);
        }
      });
      return out;
    },
  };

  EX.registry = registry;
})();
