/*
 * demo-parametric-transition.js — Exemplo neutro de variacao por parametro.
 *
 * Mostra uma transicao simples entre dois estados usando t = 0, 0.25, ..., 1,
 * com visual no plano e tabela no painel explicativo.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;
  var COL = EX.CartesianPlane.COLORS;
  var BOUNDS = [-6, 6, -4, 5];
  var START = [-4, -2];
  var END = [4, 3];
  var TS = [0, 0.25, 0.5, 0.75, 1];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pointAt(t) {
    return [lerp(START[0], END[0], t), lerp(START[1], END[1], t)];
  }

  function fmt(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function table(activeT) {
    var rows = TS.map(function (t) {
      var p = pointAt(t);
      return "<tr" + (t === activeT ? " class='active'" : "") + "><td>" + t +
        "</td><td>" + fmt(p[0]) + "</td><td>" + fmt(p[1]) + "</td></tr>";
    }).join("");
    return "<table class='ex-table'><thead><tr><th>t</th><th>x</th><th>y</th></tr></thead><tbody>" +
      rows + "</tbody></table>";
  }

  function drawState(plane, t) {
    var p = pointAt(t);
    plane.segment(START, END, { color: COL.muted, dashed: true, lineWidth: 1.5 });
    plane.point(START[0], START[1], { color: COL.accent, label: "A", radius: 5 });
    plane.point(END[0], END[1], { color: COL.green, label: "B", radius: 5 });
    TS.forEach(function (k) {
      var q = pointAt(k);
      plane.point(q[0], q[1], { color: COL.muted, radius: 2.5 });
    });
    plane.point(p[0], p[1], { color: COL.yellow, label: "t=" + t, radius: 6, labelColor: COL.ink });
    plane.text(-5.7, 4.4, "P(t) = (1-t)A + tB", { color: COL.ink, align: "left" });
  }

  function visual(t) {
    return {
      type: "plane",
      bounds: BOUNDS,
      draw: function (plane) { drawState(plane, t); },
    };
  }

  function build() {
    var steps = [
      S.concept({
        title: "Um parametro controla a transicao",
        body:
          "<p>Este exemplo usa um parametro <b>t</b>, de 0 a 1, para mostrar uma mudanca gradual entre dois estados.</p>" +
          "<p>O mesmo padrao serve para qualquer explicacao em que voce queira comparar inicio, meio e fim.</p>",
        visual: visual(0),
      }),
    ];

    TS.forEach(function (t) {
      steps.push({
        title: "t = " + t,
        body:
          "<p>Interpolamos entre o estado A e o estado B:</p>" +
          "<div class='formula'>P(t) = (1-t)A + tB</div>" +
          table(t),
        visual: visual(t),
      });
    });

    steps.push(S.comparison({
      title: "Resumo do padrao",
      intro: "<p>Use passos por valor de parametro quando o leitor precisa acompanhar a variacao.</p>",
      headers: ["Elemento", "Funcao no exemplo"],
      rows: [
        ["Estados A e B", "Referencias fixas no desenho"],
        ["Parametro t", "Controla o quanto a transicao avancou"],
        ["Tabela", "Mostra os valores numericos do passo ativo"],
      ],
    }));

    return steps;
  }

  EX.registry.add({
    id: "demo-parametric-transition",
    num: "T",
    subject: "Demonstrações das superfícies",
    section: "Canvas",
    title: "Transição por parâmetro",
    type: "conceitual",
    hubDesc: "Variação neutra por t, com plano cartesiano e tabela de valores.",
    statement: "Demonstra uma sequencia de passos baseada em valores de parametro.",
    parts: [{ label: "Demonstração", build: build }],
  });
})();
