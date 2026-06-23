/*
 * q16.js — Key frames × in-betweens.
 * Diagrama SVG: trajetória de uma bola com 2 key frames (poses sólidas) e os
 * in-betweens (quadros intermediários interpolados, esmaecidos) + linha do tempo.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  var X0 = 120, X1 = 648, BASE = 168, AMP = 96, TL = 300;

  function pos(t) { return [X0 + (X1 - X0) * t, BASE - AMP * Math.sin(Math.PI * t)]; }

  function trajectory(svg, g) {
    var pts = [];
    for (var t = 0; t <= 1.0001; t += 0.04) pts.push(pos(t));
    svg.polyline(pts, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5", parent: g });
    svg.line(X0, TL, X1, TL, { stroke: "var(--ink-mute)", strokeWidth: 2, parent: g });
  }

  function ball(svg, g, t, solid) {
    var p = pos(t);
    svg.circle(p[0], p[1], 16, {
      fill: solid ? "var(--accent)" : "var(--accent-soft)",
      stroke: solid ? "var(--ink)" : "var(--accent)", strokeWidth: solid ? 2 : 1.5,
      dashed: solid ? null : "4 3", parent: g,
    });
    // marca na linha do tempo
    svg.line(p[0], TL - 6, p[0], TL + 6, { stroke: solid ? "var(--accent)" : "var(--ink-mute)", strokeWidth: solid ? 3 : 1.5, parent: g });
    if (solid) svg.circle(p[0], TL, 5, { fill: "var(--accent)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 350);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.12); return g; }
    var gTr = svg.group({});
    trajectory(svg, gTr);

    var gT = grp("tween");
    [0.2, 0.4, 0.6, 0.8].forEach(function (t) { ball(svg, gT, t, false); });
    svg.text((X0 + X1) / 2, 332, "in-betweens: interpolados automaticamente", { size: 12, color: "var(--ink-dim)", parent: gT });

    var gK = grp("key");
    ball(svg, gK, 0, true); ball(svg, gK, 1, true);
    svg.text(X0, BASE + 36, "key frame 1", { size: 12, weight: 700, color: "var(--accent)", parent: gK });
    svg.text(X1, BASE + 36, "key frame 2", { size: 12, weight: 700, color: "var(--accent)", parent: gK });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Quadros-chave e quadros intermediários",
        body:
          "<p>Na animação por <b>key framing</b> (herdada da animação tradicional desenhada à mão), " +
          "o animador define só os <b>momentos importantes</b> (key frames); o resto é preenchido " +
          "por <b>interpolação</b> — o chamado <i>tweening</i> (de <i>in-between</i>).</p>" +
          "<p>A grande vantagem: especificar <b>poucos</b> quadros em vez de todos. Para 24 quadros/" +
          "segundo, o animador pode definir 3–4 poses e deixar o computador gerar as outras ~20.</p>" +
          "<p>Ao lado, a trajetória de uma bola: dois key frames e os in-betweens entre eles.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Key frames (quadros-chave)",
        body:
          "<p>São os quadros que marcam as <b>poses/estados-chave</b> da animação — início, fim e " +
          "<b>extremos</b> do movimento (o ponto mais alto do pulo, a mão totalmente para trás antes " +
          "do golpe). É a abordagem <i>pose-to-pose</i>: definir os marcos antes do meio.</p>" +
          "<p>Cada key frame guarda os <b>parâmetros</b> da pose num instante <b>t</b> — posição, " +
          "rotação, escala, ângulos das juntas. São criados pelo <b>animador</b>, determinam o " +
          "<b>movimento essencial</b> e são <b>poucos</b> (esparsos no tempo).</p>",
        visual: svgStep(["key"]),
      },
      {
        title: "In-betweens (intermediários)",
        body:
          "<p>São os quadros <b>entre</b> os key frames, gerados por <b>interpolação</b> dos " +
          "parâmetros. O <i>como</i> interpolar muda o resultado:</p>" +
          "<ul><li><b>Linear</b> — velocidade constante; simples, mas robótico;</li>" +
          "<li><b>Spline / ease</b> (slow-in, slow-out) — acelera e desacelera nas pontas, dando " +
          "movimento <b>natural</b>.</li></ul>" +
          "<p>Tradicionalmente desenhados por assistentes (os <i>inbetweeners</i>); hoje calculados " +
          "pelo <b>computador</b>. Completam a transição e são <b>muitos</b> (a maioria dos quadros).</p>",
        visual: svgStep(["tween"]),
      },
      S.comparison({
        title: "Resumo: key frames × in-betweens",
        headers: ["", "Key frames", "In-betweens"],
        rows: [
          ["O que são", "Poses/estados-chave", "Quadros entre os key frames"],
          ["Quem cria", "O animador (à mão)", "Interpolação (computador/assistente)"],
          ["Como surgem", "Definidos explicitamente", "Linear ou spline/ease entre 2 keys"],
          ["Quantidade", "Poucos (esparsos)", "Muitos (a maioria)"],
          ["Função", "Definem o movimento essencial", "Completam a transição suave"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q16-keyframes-inbetweens",
    num: "16",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "Key frames × in-betweens",
    type: "conceitual",
    tags: ["animação", "key frame", "interpolação"],
    hubDesc: "Poses-chave do animador × quadros intermediários interpolados (tweening).",
    statement: "Diferencie <strong>key frames</strong> de <strong>in-betweens</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
