/*
 * q37.js — Aplicação dos algoritmos de preenchimento (computacional).
 *
 * Três abas sobre a MESMA figura rasterizada (contorno preto):
 *   a) Boundary Fill — conn-4, semente (6,8): para pela cor de borda.
 *   b) Flood Fill    — conn-4, semente (8,5): troca a cor-alvo inicial.
 *   c) Scan-Line     — calcula interseções com as arestas e pinta spans internos.
 *
 * As animações por semente usam um BFS local com predicados diferentes; a
 * scan-line usa as arestas do contorno, sem reutilizar o resultado do flood.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;

  // Contorno rasterizado (PRETO), conforme o gabarito.
  var BORDER = [
    [3, 7], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9],
    [9, 8], [9, 7], [9, 6], [9, 5], [9, 4],
    [8, 4], [7, 4], [6, 4], [5, 5], [4, 6],
  ];

  // Grade lógica do flood e janela de visualização.
  var FLOOD_BOUNDS = { xmin: 1, xmax: 11, ymin: 2, ymax: 11 };
  var VIEW = [1, 11, 2, 11];

  // Mapa de células bloqueadas (borda) -> true.
  var BLOCKED = {};
  BORDER.forEach(function (b) {
    BLOCKED[ALG.key(b[0], b[1])] = true;
  });

  var BORDER_DARK = "#10151f";
  var BACKGROUND_COLOR = "branco";

  // Contorno vetorial correspondente ao raster acima, usado pela scan-line.
  var SCAN_POLY = [
    [3, 7],
    [5, 9],
    [9, 9],
    [9, 4],
    [7, 4],
    [5, 5],
  ];

  function isBorder(x, y) {
    return !!BLOCKED[ALG.key(x, y)];
  }

  function colorAt(x, y) {
    return isBorder(x, y) ? "preto-borda" : BACKGROUND_COLOR;
  }

  function seededFill(seed, accepts, bounds, conn) {
    var n4 = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    var n8 = n4.concat([
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
    var nbrs = conn === 8 ? n8 : n4;
    var visited = {};
    var order = [];
    var queue = [seed];
    visited[ALG.key(seed.x, seed.y)] = true;

    while (queue.length) {
      var c = queue.shift();
      if (!accepts(c.x, c.y)) continue;
      order.push(c);
      nbrs.forEach(function (d) {
        var nx = c.x + d[0], ny = c.y + d[1];
        var key = ALG.key(nx, ny);
        if (nx < bounds.xmin || nx > bounds.xmax || ny < bounds.ymin || ny > bounds.ymax) return;
        if (visited[key] || !accepts(nx, ny)) return;
        visited[key] = true;
        queue.push({ x: nx, y: ny });
      });
    }

    return order;
  }

  function boundaryFillCells(seed) {
    return seededFill(seed, function (x, y) {
      return !isBorder(x, y);
    }, FLOOD_BOUNDS, 4);
  }

  function floodFillCells(seed) {
    var target = colorAt(seed.x, seed.y);
    return seededFill(seed, function (x, y) {
      return colorAt(x, y) === target;
    }, FLOOD_BOUNDS, 4);
  }

  function scanlineSpans(poly) {
    var minY = Math.min.apply(null, poly.map(function (p) { return p[1]; }));
    var maxY = Math.max.apply(null, poly.map(function (p) { return p[1]; }));
    var rows = {};

    for (var y = Math.ceil(minY) + 1; y < maxY; y++) {
      var xs = [];
      for (var i = 0; i < poly.length; i++) {
        var a = poly[i];
        var b = poly[(i + 1) % poly.length];
        var y0 = a[1], y1 = b[1];
        if (y0 === y1) continue;
        var ymin = Math.min(y0, y1);
        var ymax = Math.max(y0, y1);
        if (y < ymin || y >= ymax) continue;
        var t = (y - y0) / (y1 - y0);
        xs.push(a[0] + t * (b[0] - a[0]));
      }
      xs.sort(function (a, b) { return a - b; });

      var spans = [];
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var left = xs[k];
        var right = xs[k + 1];
        var x0 = Math.floor(left) + 1;
        var x1 = Math.ceil(right) - 1;
        if (x0 <= x1) spans.push({ x0: x0, x1: x1, left: left, right: right });
      }
      if (spans.length) rows[y] = spans;
    }

    return rows;
  }

  function fmtPt(x, y) {
    return "(" + x + ", " + y + ")";
  }

  // Desenha o contorno preto (sempre presente).
  function drawBorder(plane) {
    BORDER.forEach(function (b) {
      plane.pixel(b[0], b[1], { fill: BORDER_DARK, stroke: COL.ink, lineWidth: 2 });
    });
  }

  // Lista de células até o índice k (inclusive), com a atual destacada.
  function drawFill(plane, cells, k, color, soft, strong) {
    for (var i = 0; i <= k && i < cells.length; i++) {
      var isCur = i === k;
      plane.pixel(cells[i].x, cells[i].y, {
        fill: isCur ? strong : soft,
        stroke: color,
        lineWidth: isCur ? 2.5 : 1.5,
      });
    }
  }

  // Lista HTML de coordenadas a partir de células {x,y}.
  function coordList(cells, cls) {
    return (
      "<div class='coordlist'>" +
      cells
        .map(function (c) {
          return "<span class='coord " + cls + "'>" + fmtPt(c.x, c.y) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  // ---------------------------------------------------------------------------
  // a) Boundary Fill — conn-4, semente (6,8). Anima por LINHA (de cima p/ baixo).
  // b) Flood Fill    — conn-4, semente (8,5). Mesmo formato.
  // ---------------------------------------------------------------------------
  function makeSeedPart(label, seed, opts) {
    return {
      label: label,
      build: function (plane) {
        var cells = opts.cells(seed); // ordem BFS
        var runs = ALG.runsByRow(cells); // { y: [[x0,x1]] }
        // Linhas de cima para baixo (y decrescente).
        var ys = Object.keys(runs)
          .map(Number)
          .sort(function (a, b) {
            return b - a;
          });

        var color = opts.color;
        var soft = opts.soft;
        var strong = opts.strong;

        var steps = [];

        // Passo 0 — configuração: figura + semente.
        steps.push({
          titulo: "Configuração — contorno e semente",
          bounds: VIEW,
          explicacao:
            "<p><b>" +
            opts.algName +
            "</b> com <span class='hl'>conectividade 4</span> " +
            "(vizinhos: cima, baixo, esquerda, direita).</p>" +
            "<p>Contorno (borda <span class='muted'>preta</span>) já desenhado. " +
            "Ponto inicial: <span class='ok'>" +
            fmtPt(seed.x, seed.y) +
            "</span>, que está <b>dentro</b> da região.</p>" +
            "<p>" +
            opts.ruleHtml +
            "</p>",
          draw: function (plane) {
            drawBorder(plane);
            plane.point(seed.x, seed.y, {
              color: color,
              radius: 5,
              ring: COL.ink,
              label: "início " + fmtPt(seed.x, seed.y),
              labelColor: COL.ink,
            });
          },
        });

        // Passo 1 — semente plotada (1ª célula).
        steps.push({
          titulo: "Passo 1 — pinta a semente " + fmtPt(seed.x, seed.y),
          bounds: VIEW,
          explicacao:
            "<p>A célula inicial <span class='ok'>" +
            fmtPt(seed.x, seed.y) +
            "</span> é pintada e entra na fila. A partir dela, a propagação visita os vizinhos " +
            "ortogonais que ainda são " +
            opts.targetWord +
            " e não são borda.</p>",
          draw: function (plane) {
            drawBorder(plane);
            drawFill(plane, cells, 0, color, soft, strong);
          },
        });

        // Um passo por LINHA preenchida (de cima p/ baixo, acumulando as anteriores).
        // A ordem BFS do flood não é estritamente por linha, então revelamos por
        // filtro de y (todas as células com y >= linha atual já estão pintadas).
        ys.forEach(function (y) {
          var rowRuns = runs[y];
          var span = rowRuns[0]; // região é convexa por linha → 1 run
          var spanCells = rowRuns
            .map(function (r) {
              var arr = [];
              for (var x = r[0]; x <= r[1]; x++) arr.push({ x: x, y: y });
              return arr;
            })
            .reduce(function (a, b) {
              return a.concat(b);
            }, []);

          steps.push({
            titulo: "Linha y = " + y + " — pinta x de " + span[0] + " a " + span[1],
            bounds: VIEW,
            explicacao:
              "<p>Na linha <span class='hl'>y = " +
              y +
              "</span>, a região interna conectada por conn-4 vai de " +
              "<span class='ok'>x = " +
              span[0] +
              "</span> até <span class='ok'>x = " +
              span[1] +
              "</span> (" +
              (span[1] - span[0] + 1) +
              " células).</p>" +
              coordList(spanCells, opts.cls),
            draw: function (plane) {
              drawBorder(plane);
              // Revela todas as células com y >= esta linha (ordem de cima p/ baixo).
              for (var i = 0; i < cells.length; i++) {
                if (cells[i].y >= y) {
                  var isRow = cells[i].y === y;
                  plane.pixel(cells[i].x, cells[i].y, {
                    fill: isRow ? strong : soft,
                    stroke: color,
                    lineWidth: isRow ? 2.5 : 1.5,
                  });
                }
              }
            },
          });
        });

        // Passo final — região completa + resumo.
        var summary = ys
          .map(function (y) {
            var s = runs[y][0];
            return "y = " + y + ": x = " + s[0] + " a " + s[1];
          })
          .join("\n");
        steps.push({
          titulo: "Região completa — " + cells.length + " células internas",
          bounds: VIEW,
          explicacao:
            "<p>O preenchimento termina ao não restar nenhum vizinho " +
            opts.targetWord +
            ". Foram pintadas <b>" +
            cells.length +
            "</b> células internas:</p>" +
            "<div class='formula'>" +
            summary +
            "</div>" +
            "<p>" +
            opts.endHtml +
            "</p>",
          draw: function (plane) {
            drawBorder(plane);
            cells.forEach(function (c) {
              plane.pixel(c.x, c.y, { fill: soft, stroke: color, lineWidth: 1.5 });
            });
            plane.point(seed.x, seed.y, { color: color, radius: 4, ring: COL.ink });
          },
        });

        return steps;
      },
    };
  }

  // ---------------------------------------------------------------------------
  // c) Scan-Line — vértices da borda por linha + span interno.
  // ---------------------------------------------------------------------------
  function makeScanlinePart() {
    return {
      label: "c) Scan-Line",
      build: function (plane) {
        var spans = scanlineSpans(SCAN_POLY); // { y: [{x0,x1,left,right}] } — interior por interseção
        // Vértices da borda agrupados por linha.
        var borderCells = BORDER.map(function (b) {
          return { x: b[0], y: b[1] };
        });
        var borderByRow = ALG.groupByRow(borderCells); // { y: [x...] }

        // Linhas da borda (de cima p/ baixo) — para a lista de vértices.
        var borderYs = Object.keys(borderByRow)
          .map(Number)
          .sort(function (a, b) {
            return b - a;
          });
        // Linhas com span interno (8..5).
        var fillYs = Object.keys(spans)
          .map(Number)
          .sort(function (a, b) {
            return b - a;
          });

        var steps = [];

        // Passo 0 — ideia da scan-line.
        steps.push({
          titulo: "Scan-Line — ideia",
          bounds: VIEW,
          explicacao:
            "<p>A <b>scan-line</b> varre o polígono <span class='hl'>linha por linha</span>. " +
            "Em cada linha y, ela acha as <b>interseções</b> com a borda e pinta o " +
            "<span class='ok'>intervalo interno</span> entre elas.</p>" +
            "<p>Aqui usamos a borda já rasterizada: por linha, listamos os " +
            "<span class='muted'>vértices/pixels de borda</span> e o <b>span</b> interno " +
            "(o intervalo de x a pintar, sem a borda).</p>",
          draw: function (plane) {
            drawBorder(plane);
          },
        });

        // Passo — lista de TODOS os vértices da borda por linha.
        var allRows = borderYs
          .map(function (y) {
            return (
              "y = " +
              y +
              ": " +
              borderByRow[y]
                .map(function (x) {
                  return fmtPt(x, y);
                })
                .join(", ")
            );
          })
          .join("\n");
        steps.push({
          titulo: "Vértices da borda por linha",
          bounds: VIEW,
          explicacao:
            "<p>Agrupando os pixels do contorno por linha horizontal:</p>" +
            "<div class='formula'>" +
            allRows +
            "</div>" +
            "<p>Em cada linha, esses são os pontos onde a varredura cruza a borda.</p>",
          draw: function (plane) {
            drawBorder(plane);
          },
        });

        // Um passo por linha COM span interno (8 → 5).
        fillYs.forEach(function (y) {
          var verts = borderByRow[y] || [];
          var span = spans[y][0];
          var vertsHtml =
            "<div class='coordlist'>" +
            verts
              .map(function (x) {
                return "<span class='coord'>" + fmtPt(x, y) + "</span>";
              })
              .join("") +
            "</div>";
          var spanCells = [];
          for (var x = span.x0; x <= span.x1; x++) spanCells.push({ x: x, y: y });

          steps.push({
            titulo: "Linha y = " + y + " — span x = " + span.x0 + " até " + span.x1,
            bounds: VIEW,
            explicacao:
              "<p>Linha <span class='hl'>y = " +
              y +
              "</span>. Pixels de borda nesta linha:</p>" +
              vertsHtml +
              "<p>As interseções geométricas da linha de varredura com as arestas ficam em " +
              "<span class='hl'>x = " + span.left + "</span> e <span class='hl'>x = " + span.right + "</span>. " +
              "Entre a borda esquerda e a direita, o intervalo interno preenchido é " +
              "<span class='ok'>x = " +
              span.x0 +
              " até " +
              span.x1 +
              "</span> (a própria borda fica de fora do span):</p>" +
              coordList(spanCells, "green"),
            draw: function (plane) {
              drawBorder(plane);
              // Realça a linha de varredura.
              plane.segment([VIEW[0] - 0.5, y], [VIEW[1] + 0.5, y], {
                color: COL.yellow,
                lineWidth: 1.5,
                dashed: true,
              });
              // Destaca os pixels de borda desta linha.
              verts.forEach(function (x) {
                plane.pixel(x, y, { fill: "rgba(255,209,102,0.25)", stroke: COL.yellow, lineWidth: 2 });
              });
              // Pinta o span interno.
              for (var xx = span.x0; xx <= span.x1; xx++) {
                plane.pixel(xx, y, { fill: COL.greenSoft, stroke: COL.green, lineWidth: 2 });
              }
            },
          });
        });

        // Passo final — todos os spans juntos.
        var spanSummary = fillYs
          .map(function (y) {
            var s = spans[y][0];
            return "y = " + y + ": x = " + s.x0 + " até " + s.x1;
          })
          .join("\n");
        steps.push({
          titulo: "Todos os spans internos",
          bounds: VIEW,
          explicacao:
            "<p>Reunindo os intervalos internos de todas as linhas (borda desconsiderada):</p>" +
            "<div class='formula'>" +
            spanSummary +
            "</div>" +
            "<p>Esse é exatamente o interior do polígono — o mesmo conjunto que Boundary/Flood " +
            "Fill alcançam, mas obtido <b>linha a linha</b> pela geometria, sem recursão.</p>",
          draw: function (plane) {
            drawBorder(plane);
            fillYs.forEach(function (y) {
              var s = spans[y][0];
              for (var xx = s.x0; xx <= s.x1; xx++) {
                plane.pixel(xx, y, { fill: COL.greenSoft, stroke: COL.green, lineWidth: 1.5 });
              }
            });
          },
        });

        return steps;
      },
    };
  }

  window.GUI.register({
    id: 37,
    num: "37",
    section: "V) Preenchimento de Áreas",
    title: "Aplicação: Boundary Fill, Flood Fill e Scan-Line",
    type: "computacional",
    hubDesc: "Preenche a mesma figura por semente (conn-4) e por scan-line.",
    enunciado:
      "Aplique os algoritmos de preenchimento sobre a figura de contorno preto: " +
      "a) Boundary Fill (conn-4, início (6,8)); b) Flood Fill (conn-4, início (8,5)); " +
      "c) Scan-Line (vértices por linha e spans internos).",
    parts: [
      makeSeedPart("a) Boundary Fill", { x: 6, y: 8 }, {
        algName: "Boundary Fill",
        color: COL.accent,
        soft: "rgba(78,161,255,0.18)",
        strong: "rgba(78,161,255,0.40)",
        cls: "accent",
        targetWord: "interno (não-borda)",
	        ruleHtml:
	          "<b>Regra:</b> propaga enquanto a célula não tem a <span class='no'>cor de BORDA</span> (preto). " +
	          "Na animação, a cor de preenchimento é azul para destacar o interior.",
	        endHtml:
	          "O algoritmo <b>parou</b> ao tocar nos pixels de borda pretos; a regra depende da cor de borda, não da cor inicial da região.",
	        cells: boundaryFillCells,
	      }),
	      makeSeedPart("b) Flood Fill", { x: 8, y: 5 }, {
        algName: "Flood Fill",
        color: COL.cyan,
        soft: "rgba(51,214,208,0.18)",
        strong: "rgba(51,214,208,0.40)",
        cls: "accent",
        targetWord: "branco (cor inicial)",
	        ruleHtml:
	          "<b>Regra:</b> recolore todos os pixels conectados de cor <span class='hl'>branca</span> " +
	          "(a cor inicial) para ciano. Ele olha a cor-alvo, não a cor da borda.",
	        endHtml:
	          "Partindo de " +
	          "(8, 5)" +
	          ", a mesma região branca interna é recolorida em ciano — idêntica à do Boundary Fill, " +
	          "pois a região conectada por conn-4 é a mesma.",
	        cells: floodFillCells,
	      }),
      makeScanlinePart(),
    ],
  });
})();
