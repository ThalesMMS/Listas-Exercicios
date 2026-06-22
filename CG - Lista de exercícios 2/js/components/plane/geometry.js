/*
 * geometry.js — EX.Plane: helpers de geometria/plot sobre a superfície de canvas
 * (CartesianPlane). Funções PURAS de desenho: recebem `plane`, desenham e não
 * guardam estado global. Usadas por gráficos de função, campos vetoriais,
 * trajetórias e arcos de ângulo (computação gráfica, IA, cálculo).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Plane = EX.Plane || {};

  // Cor padrão a partir do tema do canvas (com fallback seguro).
  function defColor() {
    var C = EX.CartesianPlane && EX.CartesianPlane.COLORS;
    return (C && C.accent) || "#4ea1ff";
  }

  /*
   * EX.Plane.functionPlot(plane, fn, opts)
   * Amostra fn(x) em [opts.from .. opts.to] com passo opts.step e desenha a
   * curva ligando os pontos com plane.polyline.
   * opts: { from, to, step, color, lineWidth, dashed }
   *   - from/to: padrão = plane.xmin/plane.xmax
   *   - step: padrão = (to-from)/200
   * Pontos com fn(x) não-finito (NaN/Infinity) quebram a curva (descontinuidade).
   */
  EX.Plane.functionPlot = function (plane, fn, opts) {
    opts = opts || {};
    if (!plane || typeof fn !== "function") return plane;
    var from = opts.from != null ? opts.from : plane.xmin;
    var to = opts.to != null ? opts.to : plane.xmax;
    var step = opts.step != null && opts.step > 0 ? opts.step : (to - from) / 200 || 0.05;
    var color = opts.color || defColor();
    var lw = opts.lineWidth || 2.5;

    var seg = [];
    function flush() {
      if (seg.length >= 2) plane.polyline(seg, { stroke: color, lineWidth: lw, dashed: opts.dashed });
      seg = [];
    }
    // <= to com tolerância para incluir o último ponto apesar de erro de ponto flutuante
    for (var x = from; x <= to + step * 1e-6; x += step) {
      var xx = x > to ? to : x;
      var y = fn(xx);
      if (typeof y === "number" && isFinite(y)) seg.push([xx, y]);
      else flush();
    }
    flush();
    return plane;
  };

  /*
   * EX.Plane.vectorField(plane, fn, opts)
   * fn(x, y) -> [dx, dy]; desenha uma seta em cada nó de uma grade.
   * opts: { step, scale, color, from?, to?, head, lineWidth, normalize }
   *   - step: espaçamento da grade (unidades), padrão 1
   *   - scale: fator multiplicado no vetor antes de desenhar, padrão 0.4
   *   - normalize: se true, usa vetores de comprimento unitário * scale
   */
  EX.Plane.vectorField = function (plane, fn, opts) {
    opts = opts || {};
    if (!plane || typeof fn !== "function") return plane;
    var step = opts.step != null && opts.step > 0 ? opts.step : 1;
    var scale = opts.scale != null ? opts.scale : 0.4;
    var color = opts.color || defColor();
    var x0 = opts.from != null ? opts.from[0] : Math.ceil(plane.xmin);
    var y0 = opts.from != null ? opts.from[1] : Math.ceil(plane.ymin);
    var x1 = opts.to != null ? opts.to[0] : Math.floor(plane.xmax);
    var y1 = opts.to != null ? opts.to[1] : Math.floor(plane.ymax);

    for (var x = x0; x <= x1 + 1e-9; x += step) {
      for (var y = y0; y <= y1 + 1e-9; y += step) {
        var v = fn(x, y);
        if (!v) continue;
        var dx = v[0],
          dy = v[1];
        if (!isFinite(dx) || !isFinite(dy)) continue;
        if (opts.normalize) {
          var m = Math.hypot(dx, dy) || 1;
          dx /= m;
          dy /= m;
        }
        if (dx === 0 && dy === 0) {
          plane.point(x, y, { color: color, radius: 2 });
          continue;
        }
        plane.arrow([x, y], [x + dx * scale, y + dy * scale], {
          color: color,
          lineWidth: opts.lineWidth || 1.6,
          head: opts.head || 7,
        });
      }
    }
    return plane;
  };

  /*
   * EX.Plane.pathLine(plane, points, opts)
   * Desenha uma trajetória (polyline) e, por padrão, marcadores em cada ponto.
   * points: lista de [x, y] ou {x, y}.
   * opts: { color, lineWidth, dashed, markers (bool, padrão true), markerColor,
   *         markerRadius, labels (array opcional de rótulos por ponto) }
   */
  EX.Plane.pathLine = function (plane, points, opts) {
    opts = opts || {};
    if (!plane || !points || !points.length) return plane;
    var color = opts.color || defColor();
    plane.polyline(points, {
      stroke: color,
      lineWidth: opts.lineWidth || 2.5,
      dashed: opts.dashed,
    });
    if (opts.markers !== false) {
      var mc = opts.markerColor || color;
      points.forEach(function (p, i) {
        var x = Array.isArray(p) ? p[0] : p.x;
        var y = Array.isArray(p) ? p[1] : p.y;
        plane.point(x, y, {
          color: mc,
          radius: opts.markerRadius || 4,
          label: opts.labels ? opts.labels[i] : null,
        });
      });
    }
    return plane;
  };

  /*
   * EX.Plane.angleArc(plane, cx, cy, r, a0, a1, opts)
   * Desenha um arco de circunferência (raio r em unidades do plano) entre os
   * ângulos a0 e a1 (em RADIANOS), centrado em (cx, cy). Útil para marcar
   * ângulos. Usa plane.ctx + plane.cx/cy/scale (o canvas tem y invertido, então
   * negamos os ângulos para manter o sentido anti-horário matemático).
   * opts: { color, lineWidth, dashed, label, labelColor }
   */
  EX.Plane.angleArc = function (plane, cx, cy, r, a0, a1, opts) {
    opts = opts || {};
    if (!plane) return plane;
    var ctx = plane.ctx;
    var pr = r * plane.scale; // raio em pixels
    var px = plane.cx(cx),
      py = plane.cy(cy);
    ctx.save();
    ctx.strokeStyle = opts.color || defColor();
    ctx.lineWidth = opts.lineWidth || 2;
    if (opts.dashed) ctx.setLineDash(opts.dashed === true ? [5, 4] : opts.dashed);
    ctx.beginPath();
    // y do canvas é invertido => negamos os ângulos e desenhamos no sentido oposto
    ctx.arc(px, py, pr, -a0, -a1, true);
    ctx.stroke();
    if (opts.label != null) {
      var am = (a0 + a1) / 2;
      var lr = pr + 14;
      ctx.fillStyle = opts.labelColor || opts.color || defColor();
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(opts.label), px + lr * Math.cos(am), py - lr * Math.sin(am));
    }
    ctx.restore();
    return plane;
  };
})();
