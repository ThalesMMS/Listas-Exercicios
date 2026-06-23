/*
 * q31.js — Liang-Barsky para os três lados do triângulo ABC (computacional).
 *
 * Abas: AB, BC, CA. Cada passo é uma fronteira: monta a tabela acumulada
 * (Fronteira, p, q, q/p, Ação, u1, u2) destacando a fronteira corrente, e
 * desenha a janela + o segmento inteiro em cinza + o trecho [u1,u2] visível
 * em verde. O passo final marca P(u1)/P(u2) (aceito) ou anuncia a rejeição.
 *
 * Os números vêm SEMPRE do traço de ALG.liangBarsky (frações exatas).
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2,xmax:5,ymin:1,ymax:6}

  var BOUNDS = [-4, 10, -5, 10];

  // Ponto P(u) = P0 + u(P1 - P0) usando frações exatas (guarda também os números).
  function ptAt(p0, p1, u) {
    var x = p0.x.add(u.mul(p1.x.sub(p0.x)));
    var y = p0.y.add(u.mul(p1.y.sub(p0.y)));
    return { fx: x, fy: y, x: x.num(), y: y.num() };
  }

  // Janela de recorte.
  function drawWindow(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  // Tabela HTML acumulada; destaca a linha activeIdx (use -1 para nenhuma).
  function tableHtml(rows, activeIdx) {
    var head =
      "<tr><th>Fronteira</th><th>p</th><th>q</th><th>q/p</th><th>Ação</th>" +
      "<th>u₁</th><th>u₂</th></tr>";
    var body = rows
      .map(function (t, i) {
        var cls = i === activeIdx ? " class='active'" : "";
        return (
          "<tr" +
          cls +
          "><td>" +
          t.name +
          "</td><td>" +
          t.p.str() +
          "</td><td>" +
          t.q.str() +
          "</td><td>" +
          (t.r ? t.r.str() : "—") +
          "</td><td>" +
          t.action +
          "</td><td>" +
          t.u1.str() +
          "</td><td>" +
          t.u2.str() +
          "</td></tr>"
        );
      })
      .join("");
    return "<table class='q-table'>" + head + body + "</table>";
  }

  function makePart(label, an, av, bn, bv) {
    return {
      label: label,
      build: function () {
        var lb = ALG.liangBarsky({ x: av[0], y: av[1] }, { x: bv[0], y: bv[1] }, W);
        var p0 = lb.p0,
          p1 = lb.p1;
        var dx = p1.x.sub(p0.x),
          dy = p1.y.sub(p0.y);

        var steps = [];

        // Segmento inteiro esmaecido + extremos rotulados (P0 em u=0, P1 em u=1).
        function drawBase(plane) {
          drawWindow(plane);
          plane.segment([p0.x.num(), p0.y.num()], [p1.x.num(), p1.y.num()], {
            color: "rgba(120,140,170,0.55)",
            lineWidth: 2,
          });
          plane.point(p0.x.num(), p0.y.num(), {
            color: COL.muted,
            radius: 4,
            label: an + " (u=0)",
            labelColor: COL.axisText,
          });
          plane.point(p1.x.num(), p1.y.num(), {
            color: COL.muted,
            radius: 4,
            label: bn + " (u=1)",
            labelColor: COL.axisText,
          });
        }

        // Trecho visível corrente [u1,u2] em verde (somente se u1 <= u2).
        function drawVisible(plane, u1, u2, markEnds) {
          if (u1.num() > u2.num()) return;
          var Pa = ptAt(p0, p1, u1);
          var Pb = ptAt(p0, p1, u2);
          plane.segment([Pa.x, Pa.y], [Pb.x, Pb.y], { color: COL.green, lineWidth: 4 });
          if (markEnds) {
            plane.point(Pa.x, Pa.y, {
              color: COL.green,
              radius: 5,
              ring: "#0f1623",
              label: "P(u₁)=" + ALG.plabel({ x: Pa.fx, y: Pa.fy }),
              labelColor: COL.ink,
              labelDy: -10,
            });
            plane.point(Pb.x, Pb.y, {
              color: COL.green,
              radius: 5,
              ring: "#0f1623",
              label: "P(u₂)=" + ALG.plabel({ x: Pb.fx, y: Pb.fy }),
              labelColor: COL.ink,
              labelDy: 18,
            });
          }
        }

        // Passo 0 — parametrização do segmento.
        steps.push({
          titulo: "Parametrização do segmento " + label,
          explicacao:
            "<p>Recortamos o lado <b>" +
            label +
            "</b>: de <span class='hl'>" +
            an +
            ALG.plabel(p0) +
            "</span> até <span class='hl'>" +
            bn +
            ALG.plabel(p1) +
            "</span>.</p>" +
            "<p>Forma paramétrica, com <code>u</code> de 0 (em " +
            an +
            ") a 1 (em " +
            bn +
            "):</p>" +
            "<div class='formula'>P(u) = P₀ + u·(P₁ − P₀)\nΔx = " +
            dx.str() +
            "   Δy = " +
            dy.str() +
            "</div>" +
            "<p>Iniciamos o intervalo visível em <span class='ok'>u₁ = 0</span> e <span class='ok'>u₂ = 1</span> e o restringimos fronteira a fronteira.</p>",
          bounds: BOUNDS,
          draw: function (plane) {
            drawBase(plane);
          },
        });

        // Um passo por fronteira.
        var bsteps = lb.steps.filter(function (s) {
          return s.type === "boundary";
        });
        bsteps.forEach(function (bs) {
          var row = bs.table[bs.table.length - 1]; // linha recém-adicionada
          var u1 = bs.u1,
            u2 = bs.u2;
          steps.push({
            titulo: "Fronteira " + (bs.i + 1) + ": " + row.name,
            explicacao:
              "<p>Para <b>" +
              row.name +
              "</b>:</p>" +
              "<div class='formula'>p = " +
              row.p.str() +
              "   q = " +
              row.q.str() +
              (row.r ? "   q/p = " + row.r.str() : "") +
              "</div>" +
              "<p>" +
              row.action +
              ".</p>" +
              "<p>Intervalo visível agora: <span class='hl'>u₁ = " +
              u1.str() +
              "</span>, <span class='hl'>u₂ = " +
              u2.str() +
              "</span>.</p>" +
              tableHtml(bs.table, bs.table.length - 1),
            bounds: BOUNDS,
            draw: function (plane) {
              drawBase(plane);
              drawVisible(plane, u1, u2, false);
            },
          });
        });

        // Passo final — aceitação ou rejeição.
        if (lb.accepted) {
          var Pa = ptAt(p0, p1, lb.u1);
          var Pb = ptAt(p0, p1, lb.u2);
          steps.push({
            titulo: "Resultado: segmento " + label + " ACEITO",
            explicacao:
              "<p>Ao final, <span class='ok'>u₁ = " +
              lb.u1.str() +
              " ≤ u₂ = " +
              lb.u2.str() +
              "</span>: existe trecho visível. Só agora calculamos os extremos recortados:</p>" +
              "<div class='formula'>P(u₁) = P(" +
              lb.u1.str() +
              ") = " +
              ALG.plabel({ x: Pa.fx, y: Pa.fy }) +
              "\nP(u₂) = P(" +
              lb.u2.str() +
              ") = " +
              ALG.plabel({ x: Pb.fx, y: Pb.fy }) +
              "</div>" +
              "<p>O trecho em <span class='ok'>verde</span> é a parte de " +
              label +
              " que aparece dentro da janela.</p>" +
              tableHtml(lb.table, -1),
            bounds: BOUNDS,
            draw: function (plane) {
              drawBase(plane);
              drawVisible(plane, lb.u1, lb.u2, true);
            },
          });
        } else {
          steps.push({
            titulo: "Resultado: segmento " + label + " REJEITADO",
            explicacao:
              "<p>Ao final, <span class='no'>u₁ = " +
              lb.u1.str() +
              " &gt; u₂ = " +
              lb.u2.str() +
              "</span>: as restrições se contradizem.</p>" +
              "<p>A condição de entrada exige u ≥ " +
              lb.u1.str() +
              " e a de saída exige u ≤ " +
              lb.u2.str() +
              ", um intervalo <b>vazio</b>. Logo, <span class='no'>nenhuma parte de " +
              label +
              " é visível</span> e o segmento é descartado.</p>" +
              tableHtml(lb.table, -1),
            bounds: BOUNDS,
            draw: function (plane) {
              drawBase(plane);
              // segmento inteiro em vermelho tracejado: descartado.
              plane.segment([p0.x.num(), p0.y.num()], [p1.x.num(), p1.y.num()], {
                color: COL.red,
                lineWidth: 2,
                dashed: true,
              });
            },
          });
        }

        return steps;
      },
    };
  }

  window.GUI.register({
    id: 31,
    num: "31",
    section: "IV) Recorte — Liang-Barsky",
    title: "Liang-Barsky no triângulo ABC",
    type: "computacional",
    hubDesc: "Recorte dos lados AB, BC e CA pelo intervalo paramétrico [u₁,u₂].",
    enunciado:
      "Aplique o algoritmo de Liang-Barsky para recortar os lados do triângulo A(−1,−3), B(−2,8) e C(9,2) pela janela xmin=−2, xmax=5, ymin=1, ymax=6. Para cada lado, determine o intervalo [u₁,u₂] e os pontos visíveis (ou a rejeição).",
    parts: [
      makePart("AB", "A", [-1, -3], "B", [-2, 8]),
      makePart("BC", "B", [-2, 8], "C", [9, 2]),
      makePart("CA", "C", [9, 2], "A", [-1, -3]),
    ],
  });
})();
