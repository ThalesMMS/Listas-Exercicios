/*
 * automaton.js — EX.Diagram.automaton: autômato finito (DFA/NFA) em SVG.
 *
 * Estado = círculo (r~26); estado de aceitação = círculo duplo (dois círculos
 * concêntricos). Uma seta "de início" entra no estado inicial. Transições são
 * setas rotuladas; auto-laços (from==to) usam uma curva acima do estado.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Diagram = EX.Diagram || {};

  var R = 26; // raio do estado

  /*
   * EX.Diagram.automaton(svg, spec, opts)
   *   spec:
   *     states:      [{ id, label, x, y, accepting? }]
   *     start:       id do estado inicial
   *     transitions: [{ from, to, label }]   (várias com mesmo from/to: rótulos juntados)
   *   opts:
   *     view:             [w,h] (default: 600x320)
   *     activeState:      id do estado atual (amarelo)
   *     activeTransition: [from, to] transição destacada (amarelo)
   *   Retorna mapa id -> {x,y}.
   */
  EX.Diagram.automaton = function (svg, spec, opts) {
    opts = opts || {};
    spec = spec || {};
    var states = spec.states || [];
    var trans = spec.transitions || [];

    var view = opts.view || [600, 320];
    svg.view(view[0], view[1]);

    var pos = {};
    states.forEach(function (s) { pos[s.id] = { x: s.x, y: s.y, accepting: !!s.accepting }; });

    var at = opts.activeTransition || null;
    function isActiveTrans(from, to) {
      return at && at[0] === from && at[1] === to;
    }

    // Junta transições paralelas (mesmo from/to) num rótulo só, ex.: "0, 1".
    var grouped = {};
    var order = [];
    trans.forEach(function (t) {
      var key = t.from + "->" + t.to;
      if (!grouped[key]) {
        grouped[key] = { from: t.from, to: t.to, labels: [] };
        order.push(key);
      }
      if (t.label != null) grouped[key].labels.push(String(t.label));
    });

    // 1) Seta de início (entra à esquerda do estado inicial).
    if (spec.start && pos[spec.start]) {
      var ps = pos[spec.start];
      svg.arrow(ps.x - R - 36, ps.y, ps.x - R - 2, ps.y, {
        color: "var(--ink-dim)", strokeWidth: 2,
      });
      svg.text(ps.x - R - 44, ps.y, "início", {
        anchor: "end", size: 12, color: "var(--ink-dim)",
      });
    }

    // 2) Transições.
    order.forEach(function (key) {
      var g = grouped[key];
      var a = pos[g.from], b = pos[g.to];
      if (!a || !b) return;
      var on = isActiveTrans(g.from, g.to);
      var color = on ? "var(--yellow)" : "var(--ink-mute)";
      var sw = on ? 3 : 2;
      var label = g.labels.join(", ");

      if (g.from === g.to) {
        // auto-laço: curva acima do estado.
        var lx = a.x - 14, rx = a.x + 14, ty = a.y - R;
        svg.curve(lx, ty, rx, ty, -46, { stroke: color, strokeWidth: sw, fill: "none" });
        // pequena cabeça de seta na chegada
        svg.arrow(rx - 6, ty - 6, rx, ty, { color: color, strokeWidth: sw, head: 9 });
        svg.text(a.x, a.y - R - 40, label, { size: 13, color: "var(--ink-dim)", mono: true });
      } else {
        var ang = Math.atan2(b.y - a.y, b.x - a.x);
        // Se existir transição no sentido oposto, curva levemente p/ não sobrepor.
        var hasReverse = !!grouped[g.to + "->" + g.from];
        var x1 = a.x + Math.cos(ang) * R, y1 = a.y + Math.sin(ang) * R;
        var x2 = b.x - Math.cos(ang) * R, y2 = b.y - Math.sin(ang) * R;
        var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        if (hasReverse) {
          var perp = ang - Math.PI / 2;
          var off = 16;
          var cxp = mx + Math.cos(perp) * off, cyp = my + Math.sin(perp) * off;
          svg.path("M " + x1 + " " + y1 + " Q " + cxp + " " + cyp + " " + x2 + " " + y2, {
            stroke: color, strokeWidth: sw, fill: "none",
          });
          // cabeça de seta no fim
          svg.arrow(
            x2 - Math.cos(ang) * 8 + Math.cos(perp) * 4,
            y2 - Math.sin(ang) * 8 + Math.sin(perp) * 4,
            x2, y2, { color: color, strokeWidth: sw, head: 10 }
          );
          svg.text(cxp + Math.cos(perp) * 8, cyp + Math.sin(perp) * 8, label, {
            size: 13, color: "var(--ink-dim)", mono: true,
          });
        } else {
          svg.arrow(x1, y1, x2, y2, { color: color, strokeWidth: sw });
          svg.text(mx, my - 10, label, { size: 13, color: "var(--ink-dim)", mono: true });
        }
      }
    });

    // 3) Estados (por cima).
    states.forEach(function (s) {
      var p = pos[s.id];
      var active = opts.activeState === s.id;
      var stroke = active ? "var(--yellow)" : "var(--accent)";
      var fill = active ? "var(--yellow-soft)" : "var(--bg-soft)";
      var sw = active ? 3 : 2;
      svg.circle(p.x, p.y, R, { fill: fill, stroke: stroke, strokeWidth: sw });
      if (p.accepting) {
        svg.circle(p.x, p.y, R - 5, { fill: "none", stroke: stroke, strokeWidth: sw });
      }
      var label = s.label == null ? s.id : String(s.label);
      svg.text(p.x, p.y, label, { weight: 700, size: 15, color: "var(--ink)" });
    });

    var out = {};
    for (var k in pos) if (pos.hasOwnProperty(k)) out[k] = { x: pos[k].x, y: pos[k].y };
    return out;
  };
})();
