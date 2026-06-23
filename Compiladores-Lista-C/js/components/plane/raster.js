/*
 * raster.js — EX.Raster: rasterização e preenchimentos sobre a superfície de
 * canvas (CartesianPlane), mais utilitários puros (flood fill, agrupamento por
 * linha). Desenho via plane.pixel; algoritmos não tocam o DOM. Úteis para
 * computação gráfica (raster, flood fill, varredura por linha).
 */
(function () {
  "use strict";
  var EX = (window.EX = window.EX || {});
  EX.Raster = EX.Raster || {};

  // Chave canônica de uma célula inteira "x,y" (estilo usado em `blocked`).
  function key(x, y) {
    return x + "," + y;
  }

  /*
   * EX.Raster.cells(plane, cells, opts)
   * Desenha um conjunto de células (pixels) no plano.
   * cells: lista de [x, y] ou {x, y}.
   * opts: { fill, stroke, label (string|fn(cell,i)->string), labelColor,
   *         order (bool: rotula com índice de visita) }
   */
  EX.Raster.cells = function (plane, cells, opts) {
    opts = opts || {};
    if (!plane || !cells) return plane;
    cells.forEach(function (c, i) {
      var x = Array.isArray(c) ? c[0] : c.x;
      var y = Array.isArray(c) ? c[1] : c.y;
      var lbl = null;
      if (opts.order) lbl = i;
      else if (typeof opts.label === "function") lbl = opts.label(c, i);
      else if (opts.label != null) lbl = opts.label;
      plane.pixel(x, y, {
        fill: opts.fill,
        stroke: opts.stroke,
        label: lbl,
        labelColor: opts.labelColor,
      });
    });
    return plane;
  };

  /*
   * EX.Raster.flood(seed, blocked, bounds, conn)
   * Flood fill por BFS a partir de `seed` (= [x, y] ou {x, y}).
   * blocked: objeto-mapa { "x,y": true } com células bloqueadas (paredes).
   * bounds: { xmin, xmax, ymin, ymax } (inclusivos).
   * conn: 4 (padrão) ou 8 — conectividade.
   * Retorna a lista de células [{x, y}] na ORDEM de visita (BFS).
   */
  EX.Raster.flood = function (seed, blocked, bounds, conn) {
    blocked = blocked || {};
    bounds = bounds || {};
    conn = conn === 8 ? 8 : 4;
    var sx = Array.isArray(seed) ? seed[0] : seed.x;
    var sy = Array.isArray(seed) ? seed[1] : seed.y;
    var xmin = bounds.xmin,
      xmax = bounds.xmax,
      ymin = bounds.ymin,
      ymax = bounds.ymax;

    function inBounds(x, y) {
      return x >= xmin && x <= xmax && y >= ymin && y <= ymax;
    }
    var neigh4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var neigh8 = neigh4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    var neigh = conn === 8 ? neigh8 : neigh4;

    var order = [];
    if (!inBounds(sx, sy) || blocked[key(sx, sy)]) return order;

    var seen = {};
    var queue = [[sx, sy]];
    seen[key(sx, sy)] = true;
    while (queue.length) {
      var cur = queue.shift();
      var cx = cur[0],
        cy = cur[1];
      order.push({ x: cx, y: cy });
      for (var i = 0; i < neigh.length; i++) {
        var nx = cx + neigh[i][0],
          ny = cy + neigh[i][1];
        var k = key(nx, ny);
        if (seen[k] || blocked[k] || !inBounds(nx, ny)) continue;
        seen[k] = true;
        queue.push([nx, ny]);
      }
    }
    return order;
  };

  /*
   * EX.Raster.groupByRow(cells)
   * Agrupa células por linha y. cells: [[x,y]] ou [{x,y}].
   * Retorna [{ y, xs: [x ordenados] }] ordenado por y crescente.
   */
  EX.Raster.groupByRow = function (cells) {
    var rows = {};
    (cells || []).forEach(function (c) {
      var x = Array.isArray(c) ? c[0] : c.x;
      var y = Array.isArray(c) ? c[1] : c.y;
      (rows[y] = rows[y] || []).push(x);
    });
    return Object.keys(rows)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      })
      .map(function (y) {
        return {
          y: y,
          xs: rows[y].sort(function (a, b) {
            return a - b;
          }),
        };
      });
  };

  /*
   * EX.Raster.runsByRow(cells)
   * Decompõe as células em "runs" (trechos contíguos de x) por linha — útil para
   * varredura/scanline e preenchimento por intervalos.
   * Retorna [{ y, runs: [[x0, x1], ...] }] ordenado por y crescente.
   */
  EX.Raster.runsByRow = function (cells) {
    return EX.Raster.groupByRow(cells).map(function (row) {
      var runs = [];
      var xs = row.xs;
      var i = 0;
      while (i < xs.length) {
        var start = xs[i];
        var end = xs[i];
        while (i + 1 < xs.length && xs[i + 1] === end + 1) {
          end = xs[i + 1];
          i++;
        }
        runs.push([start, end]);
        i++;
      }
      return { y: row.y, runs: runs };
    });
  };

  // Exposto para autores reutilizarem o mesmo estilo de chave do `blocked`.
  EX.Raster.key = key;
})();
