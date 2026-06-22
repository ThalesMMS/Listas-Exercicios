/*
 * ai-gradient-descent.js — Inteligência Artificial / Otimização.
 * Gradiente descendente em 1D sobre f(x) = (x-2)² + 1 (mínimo em (2, 1)).
 * Regra: x_{k+1} = x_k − lr·f'(x_k), com f'(x) = 2(x-2). Visual: canvas com a
 * curva (EX.Plane.functionPlot) e a trajetória de descida (EX.Plane.pathLine).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  // Função e derivada (embutidas).
  function f(x) {
    return (x - 2) * (x - 2) + 1;
  }
  function df(x) {
    return 2 * (x - 2);
  }

  var X0 = -3,
    LR = 0.2,
    N = 9;
  var BOUNDS = [-4, 8, -1, 12];

  // Gera a trajetória de iterações: [{k, x, fx, grad, next}].
  function trace() {
    var out = [];
    var x = X0;
    for (var k = 0; k <= N; k++) {
      var g = df(x);
      var nx = x - LR * g;
      out.push({ k: k, x: x, fx: f(x), grad: g, next: nx });
      x = nx;
    }
    return out;
  }
  var TR = trace();

  // Desenha a parábola dentro dos bounds (recorta f para caber no eixo y).
  function drawCurve(plane) {
    EX.Plane.functionPlot(plane, f, {
      from: BOUNDS[0],
      to: BOUNDS[1],
      step: 0.05,
      color: COL.accent,
      lineWidth: 2.5,
    });
    plane.point(2, 1, { color: COL.green, radius: 4, label: "mín (2, 1)" });
  }

  // Ponto (x, f(x)) só se couber no eixo y visível.
  function visiblePts(upto) {
    var pts = [];
    for (var i = 0; i <= upto; i++) {
      var t = TR[i];
      if (t.fx <= BOUNDS[3] + 0.001) pts.push([t.x, t.fx]);
    }
    return pts;
  }

  function build() {
    var steps = [];

    steps.push({
      title: "A função e o ponto de partida",
      body:
        "<p>Minimizamos <span class='accent'>f(x) = (x − 2)² + 1</span>, cujo mínimo é " +
        "<span class='ok'>(2, 1)</span>. O gradiente é <code>f'(x) = 2(x − 2)</code>.</p>" +
        "<p>Regra de atualização: <code>x_{k+1} = x_k − lr · f'(x_k)</code> com taxa " +
        "<span class='hl'>lr = " +
        LR +
        "</span>, começando em <span class='hl'>x₀ = " +
        X0 +
        "</span>.</p>" +
        "<p>Note que f(x₀) = " +
        EX.util.round(f(X0), 2) +
        " sai do topo do gráfico — descemos a partir dali.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          drawCurve(plane);
        },
      },
    });

    TR.forEach(function (t, i) {
      var dir = t.grad < 0 ? "direita (gradiente negativo)" : t.grad > 0 ? "esquerda (gradiente positivo)" : "nenhuma (gradiente nulo)";
      steps.push({
        title: "Passo k = " + t.k,
        body:
          "<p><code>x_" +
          t.k +
          " = " +
          EX.util.round(t.x, 4) +
          "</code>, <code>f(x_" +
          t.k +
          ") = " +
          EX.util.round(t.fx, 4) +
          "</code>.</p>" +
          "<p>Gradiente <code>f'(x_" +
          t.k +
          ") = 2(" +
          EX.util.round(t.x, 4) +
          " − 2) = " +
          EX.util.round(t.grad, 4) +
          "</code> → andamos para a <span class='hl'>" +
          dir +
          "</span>.</p>" +
          "<p><code>x_" +
          (t.k + 1) +
          " = " +
          EX.util.round(t.x, 4) +
          " − " +
          LR +
          "·(" +
          EX.util.round(t.grad, 4) +
          ") = <span class='ok'>" +
          EX.util.round(t.next, 4) +
          "</span></code></p>" +
          "<p class='muted'>Convergindo para o mínimo (2, 1): f vai de " +
          EX.util.round(TR[0].fx, 2) +
          " a " +
          EX.util.round(t.fx, 4) +
          ".</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            drawCurve(plane);
            // trajetória até aqui (pontos visíveis)
            var pts = visiblePts(i);
            if (pts.length) {
              EX.Plane.pathLine(plane, pts, {
                color: COL.orange,
                lineWidth: 1.8,
                dashed: true,
                markers: true,
                markerColor: COL.orange,
                markerRadius: 3,
              });
            }
            // ponto atual em destaque (se visível)
            if (t.fx <= BOUNDS[3] + 0.001) {
              plane.point(t.x, t.fx, { color: COL.yellow, radius: 5, ring: COL.yellow, label: "x" + t.k });
              // seta do passo de descida (direção do movimento) ao longo de x
              plane.arrow([t.x, t.fx], [t.next, t.fx], { color: COL.green, lineWidth: 2, head: 8 });
            }
          },
        },
      });
    });

    // Passo final: convergência
    var last = TR[TR.length - 1];
    steps.push({
      title: "Convergência",
      body:
        "<p>Após " +
        N +
        " passos, <code>x ≈ " +
        EX.util.round(last.next, 4) +
        "</code> e <code>f(x) ≈ " +
        EX.util.round(f(last.next), 4) +
        "</code> — bem próximo do mínimo <span class='ok'>(2, 1)</span>.</p>" +
        "<p>Cada passo dá <code>x − lr·f'(x)</code>: como <code>f'(x) = 2(x−2)</code>, o erro " +
        "<code>(x − 2)</code> é multiplicado por <code>(1 − 2·lr) = 0,6</code> a cada iteração " +
        "(decaimento geométrico).</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          drawCurve(plane);
          var pts = visiblePts(TR.length - 1);
          pts.push([last.next, f(last.next)]);
          EX.Plane.pathLine(plane, pts, {
            color: COL.orange,
            lineWidth: 1.8,
            dashed: true,
            markers: true,
            markerColor: COL.orange,
            markerRadius: 3,
          });
          plane.point(2, 1, { color: COL.green, radius: 6, ring: COL.green });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "ai-gradient-descent",
    num: "∇",
    subject: "Inteligência Artificial",
    section: "Otimização",
    title: "Gradiente descendente (1D)",
    type: "computacional",
    tags: ["canvas", "otimização", "gradiente"],
    hubDesc: "Descida do gradiente em f(x)=(x-2)²+1 até o mínimo (2,1).",
    statement:
      "Aplique o <strong>gradiente descendente</strong> a f(x) = (x − 2)² + 1 (mínimo em (2, 1)), " +
      "com x₀ = -3 e taxa de aprendizado lr = 0,2, usando x_{k+1} = x_k − lr·f'(x_k) e f'(x) = 2(x − 2).",
    parts: [{ label: "Descida", build: build }],
  });
})();
