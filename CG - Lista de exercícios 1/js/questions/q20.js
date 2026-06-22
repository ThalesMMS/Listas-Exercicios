/*
 * q20.js — Bresenham para circunferências (computacional).
 *
 * Para cada parte (a, b, c): anima o cálculo do 2º octante (p0 = 1 - r),
 * destaca o 3º ponto e revela seus 8 simétricos.
 *
 * Serve de TEMPLATE para as demais questões computacionais.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;

  // Desenha a circunferência-alvo como contorno fino (referência visual).
  function circleOutline(plane, xc, yc, r) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(plane.cx(xc), plane.cy(yc), r * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,140,170,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  }

  function fmtPt(x, y) {
    return "(" + x + ", " + y + ")";
  }

  function makePart(xc, yc, r, label) {
    return {
      label: label,
      build: function (plane) {
        var c = ALG.circleBresenham(xc, yc, r);
        var oct = c.octant; // relativos
        // pontos absolutos do octante
        var abs = oct.map(function (o) {
          return { x: xc + o.x, y: yc + o.y, p: o.p };
        });
        var third = oct[2]; // relativo
        var thirdAbs = { x: xc + third.x, y: yc + third.y };
        var sym = ALG.symmetricPoints(third.x, third.y, xc, yc);

        // limites do plano: envolve a circunferência inteira (cada passo declara
        // seu próprio bounds para que grade/eixos fiquem sempre alinhados).
        var B = [xc - r - 2, xc + r + 2, yc - r - 2, yc + r + 2];

        var steps = [];

        // helper: desenha o octante até o índice k (inclusive), destacando o atual.
        // Cada ponto = célula raster + um marcador sólido (bem visível).
        function drawOct(plane, k, highlightThird) {
          circleOutline(plane, xc, yc, r);
          plane.point(xc, yc, { color: COL.purple, radius: 4, label: "C" + fmtPt(xc, yc), labelColor: COL.ink });
          for (var i = 0; i <= k && i < abs.length; i++) {
            var isCur = i === k;
            var isThird = highlightThird && i === 2;
            var color = isThird ? COL.yellow : COL.accent;
            plane.point(abs[i].x, abs[i].y, {
              color: color,
              radius: isCur || isThird ? 6 : 4.5,
              ring: isCur && !isThird ? COL.ink : undefined,
            });
          }
        }

        // Passo 0 — configuração
        steps.push({
          titulo: "Configuração",
          explicacao:
            "<p>Circunferência de <b>centro " +
            fmtPt(xc, yc) +
            "</b> e <b>raio " +
            r +
            "</b>.</p>" +
            "<p>O algoritmo calcula apenas o <span class='hl'>2º octante</span> (de (0, r) até a diagonal x = y) e obtém os demais por simetria. Usamos a variável de decisão inicial:</p>" +
            "<div class='formula'>p₀ = 1 − r = 1 − " +
            r +
            " = " +
            (1 - r) +
            "</div>",
          draw: function (plane) {
            circleOutline(plane, xc, yc, r);
            plane.point(xc, yc, { color: COL.purple, radius: 4, label: "C" + fmtPt(xc, yc), labelColor: COL.ink });
            // ponto inicial do octante já visível desde a configuração
            plane.point(abs[0].x, abs[0].y, {
              color: COL.accent,
              radius: 6,
              ring: COL.ink,
              label: "início " + fmtPt(abs[0].x, abs[0].y),
              labelColor: COL.ink,
            });
          },
        });

        // Passo 1 — inicialização (primeiro ponto)
        steps.push({
          titulo: "Inicialização — ponto (0, r)",
          explicacao:
            "<p>Começamos no topo do octante: <code>x = 0</code>, <code>y = " +
            r +
            "</code>, <code>p = " +
            (1 - r) +
            "</code>.</p>" +
            "<p>Ponto plotado (relativo ao centro): <span class='hl'>(0, " +
            r +
            ")</span> → absoluto <span class='ok'>" +
            fmtPt(abs[0].x, abs[0].y) +
            "</span>.</p>",
          draw: function (plane) {
            drawOct(plane, 0, false);
          },
        });

        // Passos das iterações 1..n-1
        for (var i = 1; i < abs.length; i++) {
          (function (i) {
            var prevP = oct[i - 1].p;
            var moved = prevP < 0;
            var decisionHtml = moved
              ? "<div class='formula'>p = " +
                prevP +
                " &lt; 0  →  x++,  p += 2x+1  →  p = " +
                oct[i].p +
                "\n(y permanece = " +
                oct[i].y +
                ")</div>"
              : "<div class='formula'>p = " +
                prevP +
                " ≥ 0  →  x++,  y--,  p += 2(x−y)+1  →  p = " +
                oct[i].p +
                "</div>";
            steps.push({
              titulo: "Iteração " + i + " — ponto " + fmtPt(oct[i].x, oct[i].y) + " (relativo)",
              explicacao:
                "<p>A partir de p = <span class='hl'>" +
                prevP +
                "</span>:</p>" +
                decisionHtml +
                "<p>Novo ponto do octante: relativo <span class='hl'>" +
                fmtPt(oct[i].x, oct[i].y) +
                "</span> → absoluto <span class='ok'>" +
                fmtPt(abs[i].x, abs[i].y) +
                "</span>.</p>",
              draw: function (plane) {
                drawOct(plane, i, false);
              },
            });
          })(i);
        }

        // Passo — octante completo, destaca o 3º ponto
        var octStr = oct
          .map(function (o) {
            return fmtPt(o.x, o.y);
          })
          .join(", ");
        steps.push({
          titulo: "Octante completo — destaque do 3º ponto",
          explicacao:
            "<p>Pontos do octante (relativos): <span class='muted'>" +
            octStr +
            "</span>.</p>" +
            "<p>O <span class='hl'>3º ponto</span> calculado é relativo <span class='hl'>" +
            fmtPt(third.x, third.y) +
            "</span>, ou seja, absoluto <span class='ok'>" +
            fmtPt(thirdAbs.x, thirdAbs.y) +
            "</span>. É dele que listaremos os simétricos.</p>",
          draw: function (plane) {
            drawOct(plane, abs.length - 1, true);
          },
        });

        // Passo — simétricos do 3º ponto
        var symHtml = sym
          .map(function (s) {
            return "<span class='coord green'>" + fmtPt(s.x, s.y) + "</span>";
          })
          .join("");
        steps.push({
          titulo: "Simetria de 8 vias do 3º ponto",
          explicacao:
            "<p>Para um ponto relativo (x, y) com centro " +
            fmtPt(xc, yc) +
            ", os 8 simétricos são:</p>" +
            "<div class='formula'>( x, y) (−x, y) ( x,−y) (−x,−y)\n( y, x) (−y, x) ( y,−x) (−y,−x)   (+ centro)</div>" +
            "<p>Com o 3º ponto relativo " +
            fmtPt(third.x, third.y) +
            ", os simétricos visualizados são:</p>" +
            "<div class='coordlist'>" +
            symHtml +
            "</div>",
          draw: function (plane) {
            circleOutline(plane, xc, yc, r);
            plane.point(xc, yc, { color: COL.purple, radius: 4 });
            // octante esmaecido + 3º destacado (apenas marcadores)
            abs.forEach(function (a, i) {
              if (i === 2) plane.point(a.x, a.y, { color: COL.yellow, radius: 6, ring: COL.ink });
              else plane.point(a.x, a.y, { color: "rgba(78,161,255,0.55)", radius: 3.5 });
            });
            // 8 simétricos em verde (marcador sólido)
            sym.forEach(function (s) {
              plane.point(s.x, s.y, { color: COL.green, radius: 5.5 });
            });
          },
        });

        steps.forEach(function (s) {
          s.bounds = B;
        });
        return steps;
      },
    };
  }

  window.GUI.register({
    id: 20,
    num: "20",
    section: "III) Rasterização de Circunferências",
    title: "Bresenham para circunferências",
    type: "computacional",
    hubDesc: "Octante 2 com p₀ = 1 − r + os 8 simétricos do 3º ponto.",
    enunciado:
      "Aplique o algoritmo de Bresenham para as circunferências a seguir e indique os simétricos a serem visualizados para o terceiro ponto de cada uma. Use p₀ = 1 − r.",
    parts: [
      makePart(0, 0, 5, "a) Centro (0,0), r=5"),
      makePart(-1, 2, 5, "b) Centro (−1,2), r=5"),
      makePart(3, 4, 6, "c) Centro (3,4), r=6"),
    ],
  });
})();
