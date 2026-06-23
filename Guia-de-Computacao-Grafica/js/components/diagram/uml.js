/*
 * uml.js — Componente de DIAGRAMA DE CLASSES UML (window.EX.Diagram.uml).
 *
 * Desenha caixas de classe com 3 compartimentos (nome / atributos / métodos) e
 * relações entre elas: herança (seta de triângulo vazado), associação (linha),
 * composição (losango cheio) e agregação (losango vazado), com rótulo opcional.
 * A altura de cada caixa é calculada pelo número de linhas.
 *
 * Convenção do projeto: IIFE que ESTENDE EX.Diagram sem sobrescrever irmãos.
 * Função PURA de desenho — recebe a superfície svg, desenha e não guarda estado.
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Diagram = EX.Diagram || {};

  var HEAD = 26;   // altura do compartimento do nome
  var LINE = 19;   // altura de cada linha de atributo/método
  var PAD = 8;     // respiro vertical dentro de um compartimento
  var DEFW = 150;  // largura padrão da caixa

  // Calcula a geometria (x,y,w,h e linhas-Y de cada compartimento) de uma classe.
  function layout(cls) {
    var attrs = cls.attributes || [];
    var meths = cls.methods || [];
    var w = cls.w || DEFW;
    var hAttr = (attrs.length ? attrs.length * LINE : LINE) + PAD;
    var hMeth = (meths.length ? meths.length * LINE : LINE) + PAD;
    var h = HEAD + hAttr + hMeth;
    return {
      x: cls.x, y: cls.y, w: w, h: h,
      yAttr: cls.y + HEAD, hAttr: hAttr,
      yMeth: cls.y + HEAD + hAttr, hMeth: hMeth,
      cx: cls.x + w / 2, cy: cls.y + h / 2,
    };
  }

  // Ponto na borda da caixa "g" na direção do ponto (tx, ty) — para ancorar relações.
  function border(g, tx, ty) {
    var cx = g.x + g.w / 2, cy = g.y + g.h / 2;
    var dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return [cx, g.y];
    var hw = g.w / 2, hh = g.h / 2;
    var sx = dx === 0 ? Infinity : hw / Math.abs(dx);
    var sy = dy === 0 ? Infinity : hh / Math.abs(dy);
    var t = Math.min(sx, sy);
    return [cx + dx * t, cy + dy * t];
  }

  // Desenha um marcador no FIM da relação (ponta em b, vindo de a).
  // kind: "inherit" (triângulo vazado), "compose" (losango cheio),
  //       "aggregate" (losango vazado), "assoc" (nada).
  function endMarker(svg, ax, ay, bx, by, kind, color) {
    var ang = Math.atan2(by - ay, bx - ax);
    if (kind === "inherit") {
      var s = 14;
      var p1x = bx - s * Math.cos(ang - 0.42), p1y = by - s * Math.sin(ang - 0.42);
      var p2x = bx - s * Math.cos(ang + 0.42), p2y = by - s * Math.sin(ang + 0.42);
      svg.polygon([[bx, by], [p1x, p1y], [p2x, p2y]], {
        fill: "var(--bg)", stroke: color, strokeWidth: 2,
      });
      // ponto de saída da linha = base do triângulo
      return [(p1x + p2x) / 2, (p1y + p2y) / 2];
    }
    if (kind === "compose" || kind === "aggregate") {
      var d = 11;
      var tipx = bx, tipy = by;
      var backx = bx - 2 * d * Math.cos(ang), backy = by - 2 * d * Math.sin(ang);
      var lx = bx - d * Math.cos(ang) - d * Math.cos(ang - Math.PI / 2);
      var ly = by - d * Math.sin(ang) - d * Math.sin(ang - Math.PI / 2);
      var rx = bx - d * Math.cos(ang) - d * Math.cos(ang + Math.PI / 2);
      var ry = by - d * Math.sin(ang) - d * Math.sin(ang + Math.PI / 2);
      svg.polygon([[tipx, tipy], [lx, ly], [backx, backy], [rx, ry]], {
        fill: kind === "compose" ? color : "var(--bg)",
        stroke: color, strokeWidth: 2,
      });
      return [backx, backy];
    }
    return [bx, by]; // assoc: linha simples
  }

  /*
   * EX.Diagram.uml(svg, model, opts)
   *
   * model : {
   *   classes: [ {
   *     name: "Animal",
   *     attributes: ["- nome: String"],   // linhas de atributo (strings)
   *     methods:    ["+ emitirSom()"],     // linhas de método (strings)
   *     x, y: número,                       // canto superior-esquerdo (view)
   *     w?: número                          // largura (default 150)
   *   } ],
   *   relations: [ {
   *     from, to: nome da classe,
   *     kind: "inherit" | "assoc" | "compose" | "aggregate",
   *     label?: "rótulo da relação"
   *     // para herança a SETA aponta de "from" (filha) para "to" (mãe).
   *     // para compose/aggregate o LOSANGO fica no lado "to" (o todo).
   *   } ]
   * }
   * opts : {
   *   shown:     [nomes] | Set,   // se definido, só desenha estas classes/relações
   *   highlight: [nomes],          // realça contorno das classes
   *   highlightRelations: [[from,to]], // realça relações
   *   view: [w, h]                 // define svg.view(w, h)
   * }
   *
   * Retorna mapa nome -> geometria { x,y,w,h,cx,cy }.
   */
  EX.Diagram.uml = function (svg, model, opts) {
    model = model || {};
    opts = opts || {};
    if (opts.view) svg.view(opts.view[0], opts.view[1]);

    var classes = model.classes || [];
    var relations = model.relations || [];

    var shown = null;
    if (opts.shown && typeof opts.shown.forEach === "function") {
      shown = {};
      opts.shown.forEach(function (nm) { shown[nm] = true; });
    }
    function isShown(nm) { return !shown || shown[nm]; }

    var hi = {};
    (opts.highlight || []).forEach(function (nm) { hi[nm] = true; });
    var hiRel = {};
    (opts.highlightRelations || []).forEach(function (r) { hiRel[r[0] + "→" + r[1]] = true; });

    // geometria de cada classe
    var G = {};
    classes.forEach(function (c) { G[c.name] = layout(c); });

    // --- relações primeiro (ficam atrás das caixas) ------------------------
    relations.forEach(function (r) {
      if (!isShown(r.from) || !isShown(r.to)) return;
      var ga = G[r.from], gb = G[r.to];
      if (!ga || !gb) return;
      var on = hiRel[r.from + "→" + r.to];
      var color = on ? "var(--yellow)" : "var(--ink-mute)";
      var sw = on ? 3 : 2;

      var pa = border(ga, gb.cx, gb.cy);
      var pb = border(gb, ga.cx, ga.cy);
      // marcador no lado "to"
      var join = endMarker(svg, pa[0], pa[1], pb[0], pb[1], r.kind, color);
      svg.line(pa[0], pa[1], join[0], join[1], { stroke: color, strokeWidth: sw });
      if (r.label) {
        var mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
        svg.text(mx, my - 7, r.label, { size: 12, color: on ? "var(--yellow)" : "var(--ink-dim)", weight: 600 });
      }
    });

    // --- caixas de classe ---------------------------------------------------
    classes.forEach(function (c) {
      if (!isShown(c.name)) return;
      var g = G[c.name];
      var on = hi[c.name];
      var stroke = on ? "var(--yellow)" : "var(--accent)";
      var sw = on ? 3 : 2;

      // corpo (com cantos arredondados só na moldura externa)
      svg.rect(g.x, g.y, g.w, g.h, { fill: "var(--bg-soft)", stroke: stroke, strokeWidth: sw, rx: 4 });
      // divisórias dos compartimentos
      svg.line(g.x, g.yAttr, g.x + g.w, g.yAttr, { stroke: stroke, strokeWidth: 1.2 });
      svg.line(g.x, g.yMeth, g.x + g.w, g.yMeth, { stroke: stroke, strokeWidth: 1.2 });

      // nome (negrito, centralizado)
      svg.text(g.cx, g.y + HEAD / 2, c.name, { weight: 700, size: 14.5, color: "var(--ink)" });

      // atributos (alinhados à esquerda, monoespaçado)
      (c.attributes || []).forEach(function (a, i) {
        svg.text(g.x + 8, g.yAttr + PAD / 2 + LINE / 2 + i * LINE, a, {
          anchor: "start", size: 12, mono: true, color: "var(--ink-dim)",
        });
      });
      // métodos
      (c.methods || []).forEach(function (m, i) {
        svg.text(g.x + 8, g.yMeth + PAD / 2 + LINE / 2 + i * LINE, m, {
          anchor: "start", size: 12, mono: true, color: "var(--ink-dim)",
        });
      });
    });

    // mapa de geometria de retorno
    var out = {};
    Object.keys(G).forEach(function (nm) {
      var g = G[nm];
      out[nm] = { x: g.x, y: g.y, w: g.w, h: g.h, cx: g.cx, cy: g.cy };
    });
    return out;
  };
})();
