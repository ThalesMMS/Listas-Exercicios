/*
 * g22-morphing-exercicios.js — Extensão do guia de morphing.
 *
 * Acrescenta duas resoluções de prova para morphing por arestas:
 *   - quadrado (4 arestas) → eneágono (9 arestas);
 *   - pentágono (5 arestas) → dodecágono (12 arestas).
 *
 * O arquivo é carregado imediatamente após g22-morphing.js e adiciona duas
 * partes (abas) ao guia já registrado, sem criar um card separado no hub.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var BOUNDS = [-6.5, 6.5, -6, 6.5];
  var SIDE_BOUNDS = [-12.5, 12.5, -6, 7];

  function ngon(n, radius) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var angle = (90 + (k * 360) / n) * Math.PI / 180;
      out.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
    return out;
  }

  function lerp(p, q, t) {
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  }

  function midpoint(p, q) {
    return lerp(p, q, 0.5);
  }

  function shift(points, dx) {
    return points.map(function (p) { return [p[0] + dx, p[1]]; });
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /*
   * Divisão euclidiana: target = source * Ns + Nr.
   * Nr arestas recebem Ns+1 seções; as demais recebem Ns seções.
   */
  function edgeSubdivisionPlan(sourceCount, targetCount) {
    var Ns = Math.floor(targetCount / sourceCount);
    var Nr = targetCount % sourceCount;
    var extra = {};
    var extraEdges = [];
    var sections = [];

    // Espalha as arestas que recebem uma seção adicional pelo contorno.
    for (var k = 0; k < Nr; k++) {
      var edge = Math.floor((k * sourceCount) / Nr);
      extra[edge] = true;
      extraEdges.push(edge);
    }
    for (var i = 0; i < sourceCount; i++) {
      sections.push(Ns + (extra[i] ? 1 : 0));
    }

    return {
      sourceCount: sourceCount,
      targetCount: targetCount,
      Ns: Ns,
      Nr: Nr,
      sections: sections,
      extraEdges: extraEdges,
    };
  }

  function refinePolygon(poly, targetCount) {
    var plan = edgeSubdivisionPlan(poly.length, targetCount);
    var points = [];
    var inserted = [];

    for (var i = 0; i < poly.length; i++) {
      var a = poly[i];
      var b = poly[(i + 1) % poly.length];
      var count = plan.sections[i];

      // Inclui Vi e os pontos internos, mas não repete V(i+1): ele inicia a
      // próxima aresta. A soma das seções é, portanto, o total de pontos.
      for (var j = 0; j < count; j++) {
        points.push(lerp(a, b, j / count));
        inserted.push(j > 0);
      }
    }

    return { plan: plan, points: points, inserted: inserted };
  }

  function edgeMidpoints(poly) {
    return poly.map(function (p, i) {
      return midpoint(p, poly[(i + 1) % poly.length]);
    });
  }

  function fractionList(sectionCount) {
    var out = [];
    for (var j = 1; j < sectionCount; j++) out.push(j + "/" + sectionCount);
    return out.join(", ");
  }

  function edgePlanTable(plan) {
    var rows = plan.sections.map(function (count, i) {
      return "<tr><td>E" + i + " = V" + i + "V" + ((i + 1) % plan.sourceCount) + "</td>" +
        "<td>" + count + "</td><td>" + fractionList(count) + "</td>" +
        "<td>" + (count - 1) + "</td></tr>";
    }).join("");

    return "<table class='ex-table'><thead><tr><th>Aresta original</th><th>Seções</th>" +
      "<th>Posições dos pontos internos</th><th>Pontos inseridos</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table>";
  }

  function sectionVector(plan) {
    return "[" + plan.sections.join(", ") + "]";
  }

  function makePart(sourceCount, targetCount, sourceName, targetName) {
    return {
      label: sourceCount + " → " + targetCount,
      build: function () {
        var source = ngon(sourceCount, 4);
        var target = ngon(targetCount, 4);
        var refined = refinePolygon(source, targetCount);
        var plan = refined.plan;
        var sourceMids = edgeMidpoints(refined.points);
        var targetMids = edgeMidpoints(target);
        var refinedLeft = shift(refined.points, -6.2);
        var targetRight = shift(target, 6.2);
        var insertedCount = targetCount - sourceCount;
        var remainingEdges = sourceCount - plan.Nr;
        var extraEdgeText = plan.extraEdges.map(function (i) { return "E" + i; }).join(" e ");
        var steps = [];

        steps.push({
          title: capitalize(sourceName) + " → " + targetName + ": divisão euclidiana",
          body:
            "<p>O objeto de origem tem <b>" + sourceCount + " arestas</b> e o destino tem <b>" +
            targetCount + "</b>. Para o morphing por arestas, primeiro igualamos a quantidade de " +
            "primitivas.</p>" +
            "<div class='formula'>Amin = " + sourceCount + "    Amax = " + targetCount + "\n" +
            "Ns = floor(Amax / Amin) = floor(" + targetCount + "/" + sourceCount + ") = " +
            plan.Ns + "\n" +
            "Nr = Amax mod Amin = " + targetCount + " mod " + sourceCount + " = " +
            plan.Nr + "</div>" +
            "<p><b>Regra:</b> <code>Nr</code> arestas recebem <code>Ns+1</code> seções; as outras " +
            "<code>Amin−Nr</code> recebem <code>Ns</code> seções. Logo, <b>" + plan.Nr + " aresta" +
            (plan.Nr === 1 ? "" : "s") + "</b> recebe" + (plan.Nr === 1 ? "" : "m") +
            " <b>" + (plan.Ns + 1) + " seções</b> e <b>" + remainingEdges + "</b> recebe" +
            (remainingEdges === 1 ? "" : "m") + " <b>" + plan.Ns + " seções</b>.</p>" +
            "<p class='muted'>Os polígonos regulares são apenas uma visualização. A conta depende " +
            "somente das quantidades de arestas.</p>",
          visual: {
            type: "plane", bounds: SIDE_BOUNDS,
            draw: function (plane) {
              plane.polygon(shift(source, -6.2), { stroke: COL.accent, lineWidth: 2.5 });
              plane.polygon(targetRight, { stroke: COL.green, lineWidth: 2.5 });
              plane.text(-6.2, 6.1, sourceName + ": " + sourceCount, {
                align: "center", color: COL.accent,
              });
              plane.text(6.2, 6.1, targetName + ": " + targetCount, {
                align: "center", color: COL.green,
              });
            },
          },
        });

        steps.push({
          title: "Subdividir as arestas da forma menor",
          body:
            "<p>Uma escolha equilibrada é dar a seção adicional à" +
            (plan.Nr === 1 ? " aresta " : "s arestas ") + "<b>" + extraEdgeText +
            "</b>. O vetor de seções fica <code>" + sectionVector(plan) + "</code>.</p>" +
            "<p>Se <code>Ei = [Vi, V(i+1)]</code> recebe <code>si</code> seções, cada ponto interno é:</p>" +
            "<div class='formula'>P(i,j) = (1 − j/si)·Vi + (j/si)·V(i+1)\n" +
            "j = 1, 2, ..., si−1</div>" +
            "<p>Dividir em <b>3 seções</b> insere pontos em <code>1/3</code> e <code>2/3</code>. " +
            "Dividir em <b>2 seções</b> insere o ponto médio <code>1/2</code>.</p>" +
            edgePlanTable(plan),
          visual: {
            type: "plane", bounds: BOUNDS,
            draw: function (plane) {
              plane.polygon(source, { stroke: COL.muted, lineWidth: 1.2, dashed: true });
              plane.polygon(refined.points, { stroke: COL.accent, lineWidth: 2.5 });
              refined.points.forEach(function (p, i) {
                plane.point(p[0], p[1], {
                  color: refined.inserted[i] ? COL.orange : COL.accent,
                  radius: refined.inserted[i] ? 4.5 : 6,
                });
              });
              source.forEach(function (p, i) {
                var q = source[(i + 1) % source.length];
                var m = midpoint(p, q);
                plane.text(m[0] * 1.18, m[1] * 1.18, "E" + i + ": " + plan.sections[i], {
                  align: "center",
                  color: plan.sections[i] === plan.Ns + 1 ? COL.orange : COL.ink,
                  font: "11px ui-monospace, monospace",
                });
              });
              plane.text(-6.1, 5.5, "originais", { color: COL.accent });
              plane.text(-6.1, 4.8, "inseridos", { color: COL.orange });
            },
          },
        });

        steps.push({
          title: "Conferência: agora são " + targetCount + " arestas",
          body:
            "<p>A soma das subarestas reproduz exatamente o número do objeto maior:</p>" +
            "<div class='formula'>Nr·(Ns+1) + (Amin−Nr)·Ns\n= " + plan.Nr + "·" +
            (plan.Ns + 1) + " + " + remainingEdges + "·" + plan.Ns + "\n= " +
            (plan.Nr * (plan.Ns + 1)) + " + " + (remainingEdges * plan.Ns) + " = " +
            targetCount + "</div>" +
            "<p>Foram inseridos <b>" + insertedCount + " pontos</b>:</p>" +
            "<div class='formula'>" + sourceCount + " vértices originais + " + insertedCount +
            " novos = " + targetCount + " vértices\n" + plan.Nr + "·(" + (plan.Ns + 1) +
            "−1) + " + remainingEdges + "·(" + plan.Ns + "−1) = " + insertedCount + "</div>" +
            "<p>O contorno refinado <b>A′</b> mantém a forma original, pois todos os novos pontos " +
            "estão sobre suas arestas. Agora A′ e B têm <span class='ok'>" + targetCount +
            " arestas cada</span>.</p>",
          visual: {
            type: "plane", bounds: SIDE_BOUNDS,
            draw: function (plane) {
              plane.polygon(refinedLeft, { stroke: COL.accent, lineWidth: 2.5 });
              refinedLeft.forEach(function (p, i) {
                plane.point(p[0], p[1], {
                  color: refined.inserted[i] ? COL.orange : COL.accent,
                  radius: refined.inserted[i] ? 3.5 : 5,
                });
              });
              plane.polygon(targetRight, { stroke: COL.green, lineWidth: 2.5 });
              targetRight.forEach(function (p) {
                plane.point(p[0], p[1], { color: COL.green, radius: 3.5 });
              });
              plane.text(-6.2, 6.1, "A′: " + targetCount + " arestas", {
                align: "center", color: COL.accent,
              });
              plane.text(6.2, 6.1, "B: " + targetCount + " arestas", {
                align: "center", color: COL.green,
              });
            },
          },
        });

        steps.push({
          title: "Parear e interpolar as " + targetCount + " arestas",
          body:
            "<p>Alinhe o primeiro elemento e preserve a mesma orientação do contorno. Em seguida, " +
            "pareie <code>e′i ↔ ei</code>, para <code>i = 0, ..., " + (targetCount - 1) + "</code>.</p>" +
            "<p>Para cada par de arestas, interpole ponto médio, direção e comprimento:</p>" +
            "<div class='formula'>Mi(t) = (1−t)·M′i + t·Mi\n" +
            "Di(t) = normalize((1−t)·D′i + t·Di)\n" +
            "Li(t) = (1−t)·L′i + t·Li</div>" +
            "<p>Os pontos amarelos representam <code>Mi(0,5)</code>. As interseções das retas-suporte " +
            "vizinhas reconstroem os vértices do quadro intermediário.</p>" +
            "<p><b>Resposta final:</b> <code>Ns = " + plan.Ns + "</code>, <code>Nr = " + plan.Nr +
            "</code>, distribuição <code>" + sectionVector(plan) + "</code>; inserir <b>" +
            insertedCount + " pontos</b>, parear as <b>" + targetCount +
            " arestas</b> e interpolar.</p>",
          visual: {
            type: "plane", bounds: BOUNDS,
            draw: function (plane) {
              plane.polygon(refined.points, { stroke: COL.accent, lineWidth: 1.5 });
              plane.polygon(target, { stroke: COL.green, lineWidth: 1.5 });
              for (var i = 0; i < targetCount; i++) {
                plane.segment(sourceMids[i], targetMids[i], {
                  color: COL.muted, dashed: true, lineWidth: 1,
                });
                var m = lerp(sourceMids[i], targetMids[i], 0.5);
                plane.point(m[0], m[1], { color: COL.yellow, radius: 3.5 });
              }
              plane.text(-6.1, 5.5, "A′", { color: COL.accent });
              plane.text(-6.1, 4.8, "B", { color: COL.green });
              plane.text(-6.1, 4.1, "M(0,5)", { color: COL.yellow });
            },
          },
        });

        return steps;
      },
    };
  }

  var guide = EX.registry.get("g22-morphing");
  if (!guide) {
    console.error("g22-morphing-exercicios: guia g22-morphing não encontrado.");
    return;
  }

  guide.tags = guide.tags || [];
  if (guide.tags.indexOf("subdivisão") === -1) guide.tags.push("subdivisão");
  guide.hubDesc =
    "Pentágono→heptágono + exercícios 4→9 e 5→12: igualar arestas, parear e interpolar; " +
    "warp+blend em imagem.";
  guide.statement =
    "Entenda o morphing por vértices e por arestas: transformação gradual, correspondência, " +
    "interpolação, igualação de arestas com as resoluções 4 → 9 e 5 → 12, e morphing de imagem.";
  guide.parts.push(makePart(4, 9, "quadrado", "eneágono"));
  guide.parts.push(makePart(5, 12, "pentágono", "dodecágono"));
})();
