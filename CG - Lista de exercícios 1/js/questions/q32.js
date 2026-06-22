/*
 * q32.js — Qual é o propósito do Sutherland-Hodgman? (conceitual)
 *
 * Slides progressivos com um diagrama: um polígono que entra e sai da janela
 * de visualização, e o resultado recortado (apenas a parte interna), descrito
 * por uma nova lista de vértices.
 */
(function () {
  "use strict";
  var ALG = window.ALG;
  var COL = window.CartesianPlane.COLORS;
  var W = ALG.DEFAULT_WINDOW; // {xmin:-2, xmax:5, ymin:1, ymax:6}

  var BOUNDS = [-6, 9, -2, 10];

  function asNum(p) {
    return [ALG.nx(p), ALG.ny(p)];
  }

  // Polígono ilustrativo (concavo): parte dentro, parte fora da janela.
  var POLY = [
    ALG.P(-4, 3),
    ALG.P(1, 8),
    ALG.P(3, 4),
    ALG.P(7, 7),
    ALG.P(6, -1),
    ALG.P(1, 0.5),
    ALG.P(-3, -0.5),
  ];

  var POLY_DRAW = POLY.map(asNum);
  var CLIPPED_RAW = ALG.sutherlandHodgman(POLY, W).result;
  var CLIPPED = CLIPPED_RAW.map(asNum);

  function drawWindow(plane, opts) {
    opts = opts || {};
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, {
      fill: opts.fill || "rgba(78,161,255,0.08)",
      stroke: COL.accent,
      lineWidth: 2,
    });
  }

  function drawScene(plane, mode) {
    drawWindow(plane);
    plane.text(W.xmax - 0.1, W.ymax + 0.5, "janela", {
      align: "right",
      color: COL.accent,
      font: "12px ui-sans-serif, system-ui",
    });

    if (mode === "input" || mode === "split") {
      // Polígono de entrada: contorno cheio, leve preenchimento.
      plane.polygon(POLY_DRAW, {
        stroke: mode === "split" ? "rgba(120,140,170,0.6)" : COL.purple,
        fill: mode === "split" ? "rgba(120,140,170,0.06)" : "rgba(183,148,246,0.12)",
        lineWidth: mode === "split" ? 1.5 : 2.5,
        dashed: mode === "split" ? [5, 4] : false,
      });
      POLY_DRAW.forEach(function (p) {
        plane.point(p[0], p[1], {
          color: mode === "split" ? "rgba(120,140,170,0.7)" : COL.purple,
          radius: mode === "split" ? 2.5 : 3.5,
        });
      });
    }

    if (mode === "split") {
      // Sobrepõe o resultado recortado (parte interna) em verde.
      plane.polygon(CLIPPED, {
        stroke: COL.green,
        fill: COL.greenSoft,
        lineWidth: 2.5,
      });
    }

    if (mode === "output") {
      // Só o resultado recortado.
      plane.polygon(CLIPPED, {
        stroke: COL.green,
        fill: COL.greenSoft,
        lineWidth: 2.5,
      });
      CLIPPED.forEach(function (p) {
        plane.point(p[0], p[1], { color: COL.green, radius: 3 });
      });
    }
  }

  window.GUI.register({
    id: 32,
    num: "32",
    section: "IV) Recorte — Sutherland-Hodgman",
    title: "Qual é o propósito desse algoritmo?",
    type: "conceitual",
    hubDesc: "Recortar polígonos contra a janela e gerar uma nova lista de vértices.",
    enunciado: "Qual é o propósito do algoritmo de Sutherland-Hodgman?",
    parts: [
      {
        label: "Explicação",
        build: function () {
          return [
            {
              titulo: "Recorte de polígonos (não de retas isoladas)",
              explicacao:
                "<p>Algoritmos como Cohen-Sutherland e Liang-Barsky recortam <b>segmentos isolados</b>. " +
                "Mas uma cena costuma ser feita de <b>polígonos preenchidos</b> — e um polígono não pode " +
                "ser tratado como um amontoado de arestas soltas: ele precisa continuar sendo um " +
                "contorno <span class='hl'>fechado</span> depois do recorte.</p>" +
                "<p>O <b>Sutherland-Hodgman</b> resolve exatamente isso: recorta um <b>polígono inteiro</b> " +
                "contra a janela de visualização.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawScene(plane, "input");
              },
            },
            {
              titulo: "Parte dentro, parte fora",
              explicacao:
                "<p>No diagrama, o polígono <span style='color:#b794f6'><b>roxo</b></span> tem partes " +
                "<span class='ok'>dentro</span> e partes <span class='no'>fora</span> da janela " +
                "<span class='hl'>[−2, 5] × [1, 6]</span>.</p>" +
                "<p>O objetivo é descartar tudo o que está fora e preservar o miolo visível, " +
                "<b>sem deixar buracos nem arestas abertas</b> no contorno.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawScene(plane, "input");
              },
            },
            {
              titulo: "Saída: uma nova lista de vértices",
              explicacao:
                "<p>O propósito é <b>recortar polígonos contra a janela de visualização, gerando " +
                "uma nova lista de vértices</b> que representa apenas a parte do polígono dentro da janela.</p>" +
                "<p>Repare que a saída <span class='ok'>verde</span> tem <b>novos vértices</b>: onde o " +
                "contorno cruzava uma fronteira, surgem interseções; onde uma fronteira é seguida " +
                "por dentro, aparecem cantos sobre a borda da janela.</p>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawScene(plane, "split");
              },
            },
            {
              titulo: "Polígono recortado, pronto para preencher",
              explicacao:
                "<p>O resultado é um <b>polígono fechado</b>, descrito por sua lista de " +
                "vértices, que pode ser preenchido ou rasterizado normalmente quando a janela de recorte é convexa.</p>" +
                "<div class='proscons'>" +
                "<div class='pro'>+ Mantém o polígono como contorno fechado</div>" +
                "<div class='pro'>+ Entrada e saída têm o mesmo formato (lista de vértices), o que permite " +
                "encadear o recorte de uma fronteira na próxima</div>" +
                "<div class='con'>− A janela de recorte deve ser convexa; uma janela côncava pode gerar componentes desconectados difíceis de representar por uma única lista</div>" +
                "</div>",
              bounds: BOUNDS,
              draw: function (plane) {
                drawScene(plane, "output");
              },
            },
          ];
        },
      },
    ],
  });
})();
