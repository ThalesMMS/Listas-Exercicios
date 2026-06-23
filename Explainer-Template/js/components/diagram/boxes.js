/*
 * boxes.js — Componente de ESTRUTURAS DE DADOS sequenciais (window.EX.Diagram.boxes).
 *
 * Desenha células adjacentes (array / pilha / fila) como retângulos com rótulo
 * central, índices/sub-rótulos opcionais, ponteiros (topo/frente/i) e realce de
 * células. Útil para compiladores (pilha de análise), IA (fila/fronteira) e
 * estruturas de dados em geral.
 *
 * Convenção do projeto: IIFE que ESTENDE EX.Diagram sem sobrescrever irmãos.
 * Função PURA de desenho — recebe a superfície svg, desenha e não guarda estado.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Diagram = EX.Diagram || {};

  // --- helpers internos -----------------------------------------------------

  // Normaliza um item de "cells" para { label, sub }.
  function normCell(c) {
    if (c == null) return { label: "", sub: null };
    if (typeof c === "string" || typeof c === "number") return { label: String(c), sub: null };
    return { label: c.label == null ? "" : String(c.label), sub: c.sub == null ? null : String(c.sub) };
  }

  // Constrói um Set de índices a partir de número, array ou Set.
  function toIndexSet(v) {
    var s = {};
    if (v == null) return s;
    if (typeof v === "number") { s[v] = true; return s; }
    if (v instanceof Array) { v.forEach(function (i) { s[i] = true; }); return s; }
    if (v && typeof v.forEach === "function") { v.forEach(function (i) { s[i] = true; }); return s; }
    return s;
  }

  /*
   * EX.Diagram.boxes(svg, spec, opts)
   *
   * svg  : SvgSurface.
   * spec : {
   *   cells: [ "txt" | {label, sub?} ],   // conteúdo de cada célula
   *   x, y: número,                        // canto superior-esquerdo (unidades de view)
   *   cellW, cellH: número,                // tamanho de cada célula (default 64 x 44)
   *   orientation: "h" | "v",              // horizontal (default) ou vertical
   *   kind: "array" | "stack" | "queue",   // muda os rótulos de ponteiro padrão
   *   indices: true | false,               // mostra o índice 0..n-1 em cada célula
   *   title: "texto"                       // rótulo da estrutura (opcional)
   * }
   * opts : {
   *   highlight: índice | [índices] | Set, // realça células (accent)
   *   active:    idem highlight (alias),
   *   danger:    índice|[...]|Set,          // realça em vermelho
   *   pointers:  [ { index, label?, color? } ], // setas apontando células
   *   top:   índice,   // atalho p/ ponteiro "topo" (pilha)
   *   front: índice,   // atalho p/ ponteiro "frente" (fila)
   *   rear:  índice,   // atalho p/ ponteiro "fim" (fila)
   *   index: índice,   // atalho p/ ponteiro "i" (array)
   *   view: [w, h]     // define svg.view(w, h) antes de desenhar
   * }
   *
   * Retorna { cells: [ {x,y,w,h,cx,cy} ] } com a geometria de cada célula
   * (útil para anotações externas).
   */
  EX.Diagram.boxes = function (svg, spec, opts) {
    spec = spec || {};
    opts = opts || {};
    if (opts.view) svg.view(opts.view[0], opts.view[1]);

    var cells = (spec.cells || []).map(normCell);
    var n = cells.length;
    var horiz = spec.orientation !== "v";
    var cw = spec.cellW || 64;
    var ch = spec.cellH || 44;
    var x0 = spec.x == null ? 30 : spec.x;
    var y0 = spec.y == null ? 60 : spec.y;
    var kind = spec.kind || "array";

    var hi = toIndexSet(opts.highlight != null ? opts.highlight : opts.active);
    var dg = toIndexSet(opts.danger);

    // título da estrutura
    if (spec.title) {
      svg.text(x0, y0 - 16, spec.title, { anchor: "start", weight: 700, size: 14, color: "var(--ink-dim)" });
    }

    // geometria de cada célula
    var geom = [];
    for (var i = 0; i < n; i++) {
      var cx = horiz ? x0 + i * cw : x0;
      var cy = horiz ? y0 : y0 + i * ch;
      geom.push({ x: cx, y: cy, w: cw, h: ch, cx: cx + cw / 2, cy: cy + ch / 2 });
    }

    // estrutura vazia: desenha uma célula tracejada indicativa
    if (n === 0) {
      svg.rect(x0, y0, cw, ch, { fill: "var(--bg)", stroke: "var(--border)", strokeWidth: 1.5, dashed: true, rx: 6 });
      svg.text(x0 + cw / 2, y0 + ch / 2, "vazio", { color: "var(--ink-mute)", size: 12 });
      return { cells: geom };
    }

    // células
    for (var k = 0; k < n; k++) {
      var g = geom[k];
      var fill = "var(--bg-soft)";
      var stroke = "var(--accent)";
      var sw = 2;
      if (dg[k]) { fill = "var(--red-soft)"; stroke = "var(--red)"; sw = 2.5; }
      else if (hi[k]) { fill = "var(--accent-soft)"; stroke = "var(--accent)"; sw = 3; }
      svg.rect(g.x, g.y, g.w, g.h, { fill: fill, stroke: stroke, strokeWidth: sw, rx: 6 });

      // rótulo central
      var hasSub = cells[k].sub != null;
      svg.text(g.cx, hasSub ? g.cy - 6 : g.cy, cells[k].label, {
        weight: 600, size: 15, mono: true, color: "var(--ink)",
      });
      if (hasSub) {
        svg.text(g.cx, g.cy + 11, cells[k].sub, { size: 10.5, color: "var(--ink-dim)" });
      }

      // índice 0..n-1 (acima da célula, no horizontal; à esquerda, no vertical)
      if (spec.indices) {
        if (horiz) svg.text(g.cx, g.y - 9, String(k), { size: 11, mono: true, color: "var(--ink-mute)" });
        else svg.text(g.x - 12, g.cy, String(k), { anchor: "end", size: 11, mono: true, color: "var(--ink-mute)" });
      }
    }

    // --- ponteiros ----------------------------------------------------------
    var pointers = [];
    function addPtr(idx, label, color) {
      if (idx == null || idx < 0 || idx >= n) return;
      pointers.push({ index: idx, label: label, color: color || "var(--yellow)" });
    }
    // atalhos por tipo de estrutura
    if (kind === "stack" && opts.top == null && opts.index == null && !opts.pointers) {
      addPtr(n - 1, "topo", "var(--yellow)");
    }
    addPtr(opts.top, "topo", "var(--yellow)");
    addPtr(opts.front, kind === "queue" ? "frente" : "frente", "var(--green)");
    addPtr(opts.rear, "fim", "var(--orange)");
    addPtr(opts.index, "i", "var(--accent)");
    (opts.pointers || []).forEach(function (p) {
      if (p == null) return;
      addPtr(p.index, p.label == null ? "" : String(p.label), p.color);
    });

    // desenha as setas dos ponteiros do lado oposto aos índices
    pointers.forEach(function (p) {
      var g = geom[p.index];
      if (horiz) {
        // seta vinda de baixo apontando p/ a base da célula
        var tx = g.cx, ty = g.y + g.h;
        svg.arrow(tx, ty + 30, tx, ty + 3, { color: p.color, head: 9, strokeWidth: 2 });
        svg.text(tx, ty + 42, p.label, { size: 12, weight: 600, color: p.color });
      } else {
        // seta vinda da direita
        var rx = g.x + g.w, ry = g.cy;
        svg.arrow(rx + 36, ry, rx + 4, ry, { color: p.color, head: 9, strokeWidth: 2 });
        svg.text(rx + 44, ry, p.label, { anchor: "start", size: 12, weight: 600, color: p.color });
      }
    });

    return { cells: geom };
  };
})();
