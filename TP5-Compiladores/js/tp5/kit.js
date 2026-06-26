/*
 * kit.js — helpers didáticos específicos do TP5 Compiladores.
 * Mantém os módulos pequenos: blocos de código, tabelas, cards e diagramas SVG.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  var U = EX.util;
  var TP5 = (EX.TP5 = EX.TP5 || {});

  function esc(s) {
    return U.escapeHtml(String(s == null ? "" : s));
  }

  TP5.esc = esc;

  TP5.code = function (text, title) {
    return (
      (title ? "<div class='tp5-code-title'>" + esc(title) + "</div>" : "") +
      "<pre class='tp5-pre'>" + esc(text).replace(/\n/g, "\n") + "</pre>"
    );
  };

  TP5.formula = function (text) {
    return "<pre class='formula'>" + esc(text) + "</pre>";
  };

  TP5.chips = function (items) {
    return (
      "<div class='tp5-chipline'>" +
      items
        .map(function (it) {
          var cls = it.cls ? " " + it.cls : "";
          return "<span class='tp5-chip" + cls + "'>" + esc(it.text || it) + "</span>";
        })
        .join("") +
      "</div>"
    );
  };

  TP5.panels = function (items, cols) {
    return (
      "<div class='" + (cols === 3 ? "tp5-grid-3" : "tp5-grid-2") + "'>" +
      items
        .map(function (p) {
          return (
            "<section class='tp5-panel'><h4>" + esc(p.title) + "</h4>" +
            (p.html || "<p>" + esc(p.text || "") + "</p>") +
            "</section>"
          );
        })
        .join("") +
      "</div>"
    );
  };

  TP5.table = function (headers, rows, active) {
    return (
      "<table class='q-table'><tr>" +
      headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
      "</tr>" +
      rows
        .map(function (r, i) {
          return (
            "<tr" + (i === active ? " class='active'" : "") + ">" +
            r.map(function (c) { return "<td>" + c + "</td>"; }).join("") +
            "</tr>"
          );
        })
        .join("") +
      "</table>"
    );
  };

  TP5.domVisual = function (html) {
    return {
      type: "dom",
      draw: function (host) {
        host.innerHTML = html;
      },
    };
  };

  TP5.domStep = function (title, body, html) {
    return { title: title, body: body, visual: TP5.domVisual(html) };
  };

  TP5.svgStep = function (title, body, view, draw) {
    return { title: title, body: body, visual: { type: "svg", view: view, draw: draw } };
  };

  TP5.noneStep = function (title, body) {
    return { title: title, body: body, visual: { type: "none" } };
  };

  TP5.box = function (svg, x, y, w, h, title, lines, opts) {
    opts = opts || {};
    svg.rect(x, y, w, h, {
      fill: opts.fill || "var(--bg-soft)",
      stroke: opts.stroke || "var(--border)",
      strokeWidth: opts.strokeWidth || 2,
      rx: opts.rx == null ? 12 : opts.rx,
      dashed: opts.dashed,
      opacity: opts.opacity,
    });
    if (title) {
      svg.text(x + w / 2, y + 21, title, {
        size: opts.titleSize || 14,
        weight: 800,
        color: opts.titleColor || "var(--ink)",
        mono: opts.monoTitle,
      });
    }
    (lines || []).forEach(function (line, i) {
      svg.text(x + w / 2, y + (title ? 46 : 25) + i * 18, line, {
        size: opts.lineSize || 12,
        color: opts.lineColor || "var(--ink-dim)",
        mono: opts.mono,
      });
    });
  };

  TP5.pill = function (svg, x, y, text, opts) {
    opts = opts || {};
    var w = opts.w || Math.max(72, String(text).length * 8 + 26);
    var h = opts.h || 32;
    svg.rect(x, y, w, h, {
      fill: opts.fill || "var(--accent-soft)",
      stroke: opts.stroke || "var(--accent)",
      strokeWidth: 1.7,
      rx: h / 2,
    });
    svg.text(x + w / 2, y + h / 2 + 1, text, {
      size: opts.size || 12,
      weight: 800,
      color: opts.color || "var(--ink)",
      mono: opts.mono,
    });
    return { x: x, y: y, w: w, h: h };
  };

  TP5.pipeline = function (svg, labels, active) {
    var x = 28, y = 105, w = 138, h = 72, gap = 24;
    labels.forEach(function (b, i) {
      var on = i === active;
      TP5.box(svg, x + i * (w + gap), y, w, h, b.title, b.lines || [], {
        fill: on ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: on ? "var(--accent)" : "var(--border)",
        titleColor: on ? "var(--accent)" : "var(--ink)",
        lineSize: 11,
      });
      if (i < labels.length - 1) svg.arrow(x + i * (w + gap) + w + 4, y + h / 2, x + (i + 1) * (w + gap) - 4, y + h / 2, { color: "var(--ink-mute)", head: 10 });
    });
  };

  TP5.memoryObject = function (svg, x, y, rows, opts) {
    opts = opts || {};
    var rowH = opts.rowH || 38;
    var offW = opts.offW || 74;
    var valW = opts.valW || 260;
    rows.forEach(function (r, i) {
      var top = y + i * rowH;
      var hot = r.hot;
      svg.rect(x, top, offW, rowH, {
        fill: hot ? "var(--yellow-soft)" : "var(--bg-soft)",
        stroke: hot ? "var(--yellow)" : "var(--border)",
        strokeWidth: 1.4,
        rx: i === 0 ? 10 : 0,
      });
      svg.rect(x + offW, top, valW, rowH, {
        fill: hot ? "var(--yellow-soft)" : r.fill || "var(--bg-card)",
        stroke: hot ? "var(--yellow)" : "var(--border)",
        strokeWidth: 1.4,
        rx: i === 0 ? 10 : 0,
      });
      svg.text(x + offW / 2, top + rowH / 2, r.off, { mono: true, size: 12, color: "var(--ink-mute)" });
      svg.text(x + offW + valW / 2, top + rowH / 2, r.value, { mono: r.mono !== false, size: 12, color: r.color || "var(--ink)" });
    });
  };

  TP5.stackFrame = function (svg, x, y, rows, opts) {
    opts = opts || {};
    var rowH = 35;
    svg.text(x + 150, y - 22, opts.title || "frame visto a partir de $fp", { size: 13, weight: 800, color: "var(--ink-dim)" });
    rows.forEach(function (r, i) {
      var top = y + i * rowH;
      var fill = r.hot ? "var(--accent-soft)" : r.warn ? "var(--yellow-soft)" : "var(--bg-soft)";
      var stroke = r.hot ? "var(--accent)" : r.warn ? "var(--yellow)" : "var(--border)";
      svg.rect(x, top, 92, rowH, { fill: fill, stroke: stroke, strokeWidth: 1.5, rx: i === 0 ? 9 : 0 });
      svg.rect(x + 92, top, 260, rowH, { fill: fill, stroke: stroke, strokeWidth: 1.5, rx: i === 0 ? 9 : 0 });
      svg.text(x + 46, top + rowH / 2, r.off, { mono: true, size: 12, color: "var(--ink-mute)" });
      svg.text(x + 222, top + rowH / 2, r.label, { mono: true, size: 12, color: r.color || "var(--ink)" });
    });
    svg.arrow(x - 36, y + (rows.findIndex(function (r) { return r.fp; }) + 0.5) * rowH, x - 4, y + (rows.findIndex(function (r) { return r.fp; }) + 0.5) * rowH, { color: "var(--orange)", head: 8 });
    svg.text(x - 42, y + (rows.findIndex(function (r) { return r.fp; }) + 0.5) * rowH, "$fp", { anchor: "end", size: 12, mono: true, weight: 800, color: "var(--orange)" });
  };

  TP5.machine = function (svg, spec) {
    spec = spec || {};
    svg.text(140, 58, "acumulador", { size: 13, weight: 800, color: "var(--ink-dim)" });
    TP5.box(svg, 65, 75, 150, 72, "$a0", [spec.a0 || "—"], {
      fill: spec.hot === "a0" ? "var(--yellow-soft)" : "var(--accent-soft)",
      stroke: spec.hot === "a0" ? "var(--yellow)" : "var(--accent)",
      mono: true,
      titleSize: 18,
      lineSize: 15,
    });
    svg.text(472, 58, "pilha ($sp aponta para o topo livre)", { size: 13, weight: 800, color: "var(--ink-dim)" });
    var stack = spec.stack || [];
    var baseY = 75;
    if (!stack.length) {
      TP5.box(svg, 350, baseY, 250, 72, "pilha", ["vazia"], { stroke: "var(--border)", fill: "var(--bg-soft)", mono: true });
    } else {
      for (var i = 0; i < stack.length; i++) {
        var top = baseY + i * 40;
        svg.rect(350, top, 250, 36, { fill: i === stack.length - 1 ? "var(--green-soft)" : "var(--bg-soft)", stroke: i === stack.length - 1 ? "var(--green)" : "var(--border)", strokeWidth: 1.5, rx: 8 });
        svg.text(475, top + 18, stack[i], { mono: true, size: 13, color: "var(--ink)" });
      }
      svg.arrow(624, baseY + (stack.length - 0.5) * 40 - 4, 604, baseY + (stack.length - 0.5) * 40 - 4, { color: "var(--green)", head: 8 });
      svg.text(632, baseY + (stack.length - 0.5) * 40 - 4, "topo", { anchor: "start", size: 12, color: "var(--green)", weight: 800 });
    }
    if (spec.caption) svg.text(360, 260, spec.caption, { size: 14, weight: 800, color: "var(--yellow)" });
  };

  TP5.classTree = function (svg, nodes, edges, opts) {
    opts = opts || {};
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      svg.line(a.x, a.y + 26, b.x, b.y - 26, { stroke: "var(--ink-mute)", strokeWidth: 2 });
    });
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      TP5.box(svg, n.x - 54, n.y - 26, 108, 52, n.label || id, n.lines || [], {
        fill: n.hot ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: n.hot ? "var(--accent)" : "var(--border)",
        titleColor: n.hot ? "var(--accent)" : "var(--ink)",
        titleSize: 13,
        lineSize: 11,
        mono: n.mono,
      });
    });
  };

  TP5.note = function (kind, title, body) {
    var cls = kind === "warn" ? "warn" : kind === "bad" ? "danger" : "tip";
    return "<div class='ex-callout " + cls + "'><div class='ex-callout-title'>" + esc(title) + "</div>" + body + "</div>";
  };
})();
