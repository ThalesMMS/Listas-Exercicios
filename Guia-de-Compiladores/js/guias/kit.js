/*
 * kit.js - Helpers visuais para as listas de Compiladores.
 *
 * Mantem as questoes pequenas: alternativas, fitas lexicas, grafos de fluxo,
 * hierarquias de classes, RIGs e heaps lineares.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  EX.Compilers = EX.Compilers || {};

  function esc(s) {
    return U.escapeHtml(String(s == null ? "" : s));
  }

  function codeHtml(code) {
    return "<pre class='formula'>" + esc(code) + "</pre>";
  }

  function domStep(title, body, html) {
    return {
      title: title,
      body: body,
      visual: {
        type: "dom",
        draw: function (host) {
          host.innerHTML = html;
        },
      },
    };
  }

  function codeStep(spec) {
    return {
      title: spec.title,
      body: spec.body,
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.code(host, {
            code: spec.code,
            active: spec.active || [],
            dim: spec.dim || [],
            lang: spec.lang || "text",
            startLine: spec.startLine || 1,
          });
        },
      },
    };
  }

  function tableStep(spec) {
    return {
      title: spec.title,
      body: spec.body,
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: spec.headers || [],
            rows: spec.rows || [],
            active: spec.active,
          });
        },
      },
    };
  }

  function choicesHtml(choices, correct) {
    var ok = {};
    (correct || []).forEach(function (c) { ok[c] = true; });
    return "<div class='ex-callout tip'><div class='ex-callout-title'>Alternativas</div>" +
      "<table class='ex-table'><tbody>" +
      choices.map(function (c) {
        var cls = ok[c.id] ? " class='active'" : "";
        var mark = ok[c.id] ? "<span class='ok'>✓</span>" : "<span class='muted'>-</span>";
        return "<tr" + cls + "><td>" + esc(c.id) + "</td><td style='text-align:left'>" +
          c.html + "</td><td>" + mark + "</td></tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  function choiceStep(spec) {
    return domStep(spec.title, spec.body, choicesHtml(spec.choices || [], spec.correct || []));
  }

  function tape(svg, tokens, opts) {
    opts = opts || {};
    var x = opts.x || 40;
    var y = opts.y || 90;
    var h = opts.h || 58;
    var gap = opts.gap || 10;
    var active = opts.active == null ? -1 : opts.active;
    svg.view(opts.w || 760, opts.viewH || 250);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var w = t.w || Math.max(58, String(t.lexeme).length * 16 + 28);
      var isOn = i === active;
      var fill = isOn ? "var(--yellow-soft)" : "var(--bg-soft)";
      var stroke = isOn ? "var(--yellow)" : "var(--accent)";
      svg.rect(x, y, w, h, { fill: fill, stroke: stroke, strokeWidth: isOn ? 3 : 2, rx: 8 });
      svg.text(x + w / 2, y + 19, t.lexeme, { mono: true, weight: 700, size: 15 });
      svg.text(x + w / 2, y + 42, t.label, {
        size: 11,
        color: t.color || "var(--ink-dim)",
        weight: isOn ? 700 : 500,
      });
      if (i < tokens.length - 1) {
        svg.arrow(x + w + 2, y + h / 2, x + w + gap - 2, y + h / 2, {
          color: "var(--ink-mute)",
          head: 7,
          strokeWidth: 1.5,
        });
      }
      x += w + gap;
    }
  }

  function box(svg, x, y, w, h, lines, opts) {
    opts = opts || {};
    svg.rect(x, y, w, h, {
      fill: opts.fill || "var(--bg-soft)",
      stroke: opts.stroke || "var(--accent)",
      strokeWidth: opts.strokeWidth || 2,
      rx: opts.rx == null ? 8 : opts.rx,
      dashed: opts.dashed,
    });
    lines = [].concat(lines || []);
    for (var i = 0; i < lines.length; i++) {
      svg.text(x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * 18, lines[i], {
        mono: opts.mono !== false,
        size: opts.size || 14,
        weight: opts.weight || 600,
        color: opts.color || "var(--ink)",
      });
    }
  }

  function flow(svg, spec) {
    spec = spec || {};
    svg.view(spec.w || 760, spec.h || 420);
    var nodesById = {};
    (spec.nodes || []).forEach(function (n) { nodesById[n.id] = n; });
    (spec.edges || []).forEach(function (e) {
      var a = nodesById[e.from], b = nodesById[e.to];
      if (!a || !b) return;
      var x1 = a.x + a.w / 2;
      var y1 = a.y + a.h;
      var x2 = b.x + b.w / 2;
      var y2 = b.y;
      if (e.fromSide === "right") { x1 = a.x + a.w; y1 = a.y + a.h / 2; }
      if (e.toSide === "right") { x2 = b.x + b.w; y2 = b.y + b.h / 2; }
      if (e.toSide === "left") { x2 = b.x; y2 = b.y + b.h / 2; }
      if (e.curve) {
        curvedArrow(svg, x1, y1, x2, y2, e.curve, e.color || "var(--orange)");
      } else {
        svg.arrow(x1, y1, x2, y2, { color: e.color || "var(--orange)", strokeWidth: 2.5, head: 11 });
      }
      if (e.label) svg.text((x1 + x2) / 2, (y1 + y2) / 2 - 10, e.label, { size: 12, color: "var(--ink-dim)" });
    });
    (spec.nodes || []).forEach(function (n) {
      box(svg, n.x, n.y, n.w, n.h, n.lines, {
        fill: n.active ? "var(--yellow-soft)" : n.fill,
        stroke: n.active ? "var(--yellow)" : n.stroke,
        color: n.color,
      });
    });
  }

  function curvedArrow(svg, x1, y1, x2, y2, bend, color) {
    var mx = (x1 + x2) / 2;
    var my = (y1 + y2) / 2;
    var ang = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    var cx = mx + bend * Math.cos(ang);
    var cy = my + bend * Math.sin(ang);
    svg.path("M " + x1 + " " + y1 + " Q " + cx + " " + cy + " " + x2 + " " + y2, {
      stroke: color,
      strokeWidth: 2.5,
      fill: "none",
    });
    var endAng = Math.atan2(y2 - cy, x2 - cx);
    var head = 10;
    var p1x = x2 - head * Math.cos(endAng - 0.45);
    var p1y = y2 - head * Math.sin(endAng - 0.45);
    var p2x = x2 - head * Math.cos(endAng + 0.45);
    var p2y = y2 - head * Math.sin(endAng + 0.45);
    svg.polygon([[x2, y2], [p1x, p1y], [p2x, p2y]], { fill: color });
  }

  function rig(svg, spec) {
    spec = spec || {};
    svg.view(spec.w || 560, spec.h || 360);
    var nodes = spec.nodes || {};
    (spec.edges || []).forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      svg.line(a.x, a.y, b.x, b.y, { stroke: "var(--ink)", strokeWidth: 3 });
    });
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      var fill = n.fill || "var(--bg-soft)";
      if (spec.colors && spec.colors[id]) fill = spec.colors[id];
      svg.circle(n.x, n.y, n.r || 13, { fill: fill, stroke: "var(--ink)", strokeWidth: 2 });
      svg.text(n.x, n.y - 27, id, { color: "var(--red)", weight: 700, size: 17 });
    });
  }

  function classTree(svg, spec) {
    spec = spec || {};
    svg.view(spec.w || 720, spec.h || 420);
    var nodes = spec.nodes || {};
    (spec.edges || []).forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      svg.arrow(a.x, a.y + 24, b.x, b.y - 24, { color: "var(--ink-mute)", strokeWidth: 2, head: 9 });
    });
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      var active = spec.active && spec.active.indexOf(id) !== -1;
      box(svg, n.x - 54, n.y - 22, 108, 44, id, {
        fill: active ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: active ? "var(--accent)" : "var(--border)",
        mono: false,
        size: 13,
      });
    });
  }

  function heap(svg, spec) {
    spec = spec || {};
    var labels = spec.cells || [];
    var x0 = spec.x || 88;
    var y = spec.y || 130;
    var cw = spec.cw || 54;
    var ch = spec.ch || 38;
    svg.view(spec.w || 760, spec.h || 260);
    var free = {};
    (spec.free || []).forEach(function (i) { free[i] = true; });
    var marked = {};
    (spec.marked || []).forEach(function (i) { marked[i] = true; });
    svg.text(x0 - 45, y + ch / 2, "root", { anchor: "end", size: 13, mono: true, color: "var(--ink-dim)" });
    if (spec.root != null) svg.arrow(x0 - 38, y + ch / 2, x0 + spec.root * cw, y + ch / 2, { color: "var(--ink)", head: 8 });
    for (var i = 0; i < labels.length; i++) {
      var mk = marked[i] && !free[i];
      svg.rect(x0 + i * cw, y, cw, ch, {
        fill: free[i] ? "var(--red-soft)" : mk ? "var(--green-soft)" : "var(--bg-soft)",
        stroke: free[i] ? "var(--red)" : mk ? "var(--green)" : "var(--ink)",
        strokeWidth: mk ? 3 : 2,
      });
      svg.text(x0 + i * cw + cw / 2, y + ch / 2, labels[i], {
        mono: true,
        weight: 700,
        color: free[i] ? "var(--red)" : mk ? "var(--green)" : "var(--ink)",
      });
    }
    (spec.pointers || []).forEach(function (p) {
      var from = p.from, to = p.to;
      if (typeof from !== "number" || typeof to !== "number") return;
      var side = p.side || (from < to ? "top" : "bottom");
      var sx = x0 + from * cw + cw / 2;
      var tx = x0 + to * cw + cw / 2;
      var yy = side === "top" ? y : y + ch;
      var bend = (side === "top" ? -1 : 1) * Math.max(28, Math.abs(to - from) * 14);
      curvedArrow(svg, sx, yy, tx, yy, bend, p.color || (p.free ? "var(--red)" : "var(--ink)"));
    });
    if (spec.note) svg.text(x0 + labels.length * cw / 2, y + ch + 74, spec.note, { size: 13, color: "var(--ink-dim)" });
  }

  EX.Compilers.esc = esc;
  EX.Compilers.codeHtml = codeHtml;
  EX.Compilers.domStep = domStep;
  EX.Compilers.codeStep = codeStep;
  EX.Compilers.tableStep = tableStep;
  EX.Compilers.choiceStep = choiceStep;
  EX.Compilers.choicesHtml = choicesHtml;
  EX.Compilers.tape = tape;
  EX.Compilers.box = box;
  EX.Compilers.flow = flow;
  EX.Compilers.rig = rig;
  EX.Compilers.classTree = classTree;
  EX.Compilers.heap = heap;
})();
