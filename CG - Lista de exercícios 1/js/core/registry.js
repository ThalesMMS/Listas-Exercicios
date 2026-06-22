/*
 * registry.js — Registro global das questões.
 *
 * Cada módulo de questão (js/questions/qNN.js) chama window.GUI.register({...}).
 * As páginas (index.html / question.html) leem window.GUI.questions para montar
 * o hub e renderizar uma questão específica.
 *
 * Sem ES modules / sem fetch: tudo via <script> global para funcionar em file://.
 *
 * Formato de uma questão registrada:
 *   {
 *     id: 20,                       // número (int) usado em ?q=20
 *     num: "20",                    // rótulo exibido
 *     section: "III) ...",          // seção do estudo dirigido (agrupa no hub)
 *     title: "Bresenham ...",       // título curto
 *     type: "computacional" | "conceitual",
 *     enunciado: "texto do enunciado (HTML permitido)",
 *     parts: [                      // 1+ partes (abas). Conceituais: normalmente 1.
 *       { label: "a) ...", build: (plane) => Step[] }
 *     ]
 *   }
 *
 * Step:
 *   { titulo: string, explicacao: htmlString, draw?: (plane) => void,
 *     bounds?: [xmin, xmax, ymin, ymax] }
 *   - draw() desenha o estado CUMULATIVO daquele passo.
 *   - O Stepper aplica step.bounds (se houver), depois limpa o canvas e desenha
 *     grade+eixos, e só então chama draw(). Por isso o ajuste de limites de
 *     visualização deve ir em `bounds`, NÃO dentro de draw().
 */
(function () {
  "use strict";

  if (window.GUI) return; // evita redefinição se o script for incluído duas vezes

  var GUI = {
    questions: {}, // id -> questão
    _order: [], // ordem de registro

    register: function (q) {
      if (!q || typeof q.id === "undefined") {
        console.error("GUI.register: questão sem id", q);
        return;
      }
      if (this.questions[q.id]) {
        // Stub registrado antes do módulo real: o real sobrescreve o stub.
        var idx = this._order.indexOf(q.id);
        if (idx !== -1) this._order.splice(idx, 1);
      }
      this.questions[q.id] = q;
      this._order.push(q.id);
    },

    get: function (id) {
      return this.questions[Number(id)] || null;
    },

    // Lista ordenada por id crescente (20, 21, 22, ...).
    all: function () {
      var ids = Object.keys(this.questions).map(Number);
      ids.sort(function (a, b) {
        return a - b;
      });
      var self = this;
      return ids.map(function (id) {
        return self.questions[id];
      });
    },

    // Agrupa por seção preservando a ordem de aparição das seções.
    bySection: function () {
      var groups = [];
      var index = {};
      this.all().forEach(function (q) {
        var key = q.section || "Outros";
        if (!(key in index)) {
          index[key] = groups.length;
          groups.push({ section: key, items: [] });
        }
        groups[index[key]].items.push(q);
      });
      return groups;
    },
  };

  window.GUI = GUI;
})();
