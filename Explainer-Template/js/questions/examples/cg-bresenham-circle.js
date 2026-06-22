/*
 * cg-bresenham-circle.js — Computação Gráfica / Rasterização.
 * Algoritmo do ponto médio de Bresenham para circunferências (decisão inteira).
 * Percorre o 2º octante (de x=0 até a diagonal x=y) e gera os 8 pontos
 * simétricos. Visual: canvas (CartesianPlane) com pixels passo a passo.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  // --- Algoritmo embutido -------------------------------------------------

  // circleBresenham(xc, yc, r): retorna os pontos do octante como pares
  // RELATIVOS ao centro [x, y] (x de 0 até a diagonal). p0 = 1 - r.
  function circleBresenham(xc, yc, r) {
    var pts = [];
    var x = 0,
      y = r,
      p = 1 - r;
    while (x <= y) {
      pts.push([x, y]); // ponto relativo ao centro
      if (p < 0) {
        // próximo pixel: leste (E)
        p = p + 2 * x + 3;
        x++;
      } else {
        // próximo pixel: sudeste (SE)
        p = p + 2 * (x - y) + 5;
        x++;
        y--;
      }
    }
    return pts;
  }

  // symmetricPoints(x, y, xc, yc): os 8 simétricos de (x, y) somando o centro.
  function symmetricPoints(x, y, xc, yc) {
    return [
      [xc + x, yc + y],
      [xc - x, yc + y],
      [xc + x, yc - y],
      [xc - x, yc - y],
      [xc + y, yc + x],
      [xc - y, yc + x],
      [xc + y, yc - x],
      [xc - y, yc - x],
    ];
  }

  // --- Construção das abas ------------------------------------------------

  function buildCase(xc, yc, r) {
    return function () {
      var octant = circleBresenham(xc, yc, r);
      // bounds com folga em torno do círculo
      var B = [xc - r - 1.5, xc + r + 1.5, yc - r - 1.5, yc + r + 1.5];
      var steps = [];

      function drawCenter(plane) {
        plane.point(xc, yc, { color: COL.muted, radius: 3, label: "C(" + xc + "," + yc + ")" });
      }

      // Passo 0: enunciado do algoritmo
      steps.push({
        title: "Parâmetro de decisão inicial",
        body:
          "<p>Centro <span class='accent'>C(" +
          xc +
          ", " +
          yc +
          ")</span>, raio <span class='hl'>r = " +
          r +
          "</span>.</p>" +
          "<p>Começamos em <code>(x, y) = (0, " +
          r +
          ")</code> com <code>p₀ = 1 − r = " +
          (1 - r) +
          "</code> (coordenadas relativas ao centro).</p>" +
          "<div class='formula'>se p &lt; 0:  p += 2x+3;      x++        (Leste)\n" +
          "senão:     p += 2(x−y)+5;  x++; y--   (Sudeste)</div>" +
          "<p>O laço roda enquanto <code>x ≤ y</code> (apenas o 2º octante).</p>",
        visual: {
          type: "plane",
          bounds: B,
          draw: function (plane) {
            drawCenter(plane);
            // ponto de partida (0, r) relativo ao centro
            plane.pixel(xc + 0, yc + r, { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });

      // Passos do octante: revela um pixel por vez
      octant.forEach(function (rel, i) {
        var rx = rel[0],
          ry = rel[1];
        steps.push({
          title: "Octante — ponto " + (i + 1) + ": (" + rx + ", " + ry + ")",
          body:
            "<p>Pixel relativo <span class='accent'>(" +
            rx +
            ", " +
            ry +
            ")</span> → absoluto <span class='hl'>(" +
            (xc + rx) +
            ", " +
            (yc + ry) +
            ")</span>.</p>" +
            "<p>Acumulados " +
            (i + 1) +
            " de " +
            octant.length +
            " pixels do octante. O laço para quando <code>x &gt; y</code>.</p>",
          visual: {
            type: "plane",
            bounds: B,
            draw: function (plane) {
              drawCenter(plane);
              // pixels já calculados (até i-1) em cor suave
              for (var k = 0; k < i; k++) {
                plane.pixel(xc + octant[k][0], yc + octant[k][1], {
                  fill: COL.accentSoft,
                  stroke: COL.accent,
                });
              }
              // pixel atual em destaque
              plane.pixel(xc + rx, yc + ry, { fill: COL.greenSoft, stroke: COL.green });
            },
          },
        });
      });

      // Passo final: os 8 simétricos do 3º ponto do octante
      var idx = Math.min(2, octant.length - 1); // 3º ponto (índice 2) ou o último
      var base = octant[idx];
      var sym = symmetricPoints(base[0], base[1], xc, yc);
      steps.push({
        title: "Simetria de 8 vias do ponto (" + base[0] + ", " + base[1] + ")",
        body:
          "<p>Cada pixel do octante gera <span class='hl'>8 pixels</span> por reflexão. " +
          "Para o ponto relativo <span class='accent'>(" +
          base[0] +
          ", " +
          base[1] +
          ")</span>:</p>" +
          "<p><code>(±x,±y)</code> e <code>(±y,±x)</code>, sempre somando o centro C(" +
          xc +
          ", " +
          yc +
          ").</p>" +
          "<div class='ex-coordlist'>" +
          sym
            .map(function (p) {
              return "<span class='ex-coord green'>(" + p[0] + ", " + p[1] + ")</span>";
            })
            .join("") +
          "</div>",
        visual: {
          type: "plane",
          bounds: B,
          draw: function (plane) {
            drawCenter(plane);
            // octante inteiro em cor suave
            octant.forEach(function (rel) {
              plane.pixel(xc + rel[0], yc + rel[1], { fill: COL.accentSoft, stroke: COL.accent });
            });
            // os 8 simétricos em destaque
            sym.forEach(function (p) {
              plane.pixel(p[0], p[1], { fill: COL.greenSoft, stroke: COL.green });
            });
          },
        },
      });

      // Passo de fecho: circunferência completa por simetria de todos os pontos
      steps.push({
        title: "Circunferência completa",
        body:
          "<p>Aplicando a simetria de 8 vias a <em>todos</em> os pontos do octante, " +
          "obtemos a circunferência rasterizada inteira.</p>",
        visual: {
          type: "plane",
          bounds: B,
          draw: function (plane) {
            drawCenter(plane);
            octant.forEach(function (rel) {
              symmetricPoints(rel[0], rel[1], xc, yc).forEach(function (p) {
                plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent });
              });
            });
          },
        },
      });

      return steps;
    };
  }

  EX.registry.add({
    id: "cg-bresenham-circle",
    num: "○",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "Bresenham para circunferências",
    type: "computacional",
    tags: ["canvas", "rasterização", "circunferência"],
    hubDesc: "Algoritmo do ponto médio: octante + simetria de 8 vias.",
    statement:
      "Rasterize uma circunferência pelo algoritmo de <strong>Bresenham</strong> (ponto médio). " +
      "Calcule o 2º octante com aritmética inteira (p₀ = 1 − r) e replique por simetria de 8 vias.",
    parts: [
      { label: "a) C(0,0) r=5", build: buildCase(0, 0, 5) },
      { label: "b) C(-1,2) r=5", build: buildCase(-1, 2, 5) },
      { label: "c) C(3,4) r=6", build: buildCase(3, 4, 6) },
    ],
  });
})();
