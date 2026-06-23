/*
 * q17.js — O maior custo do método de key framing.
 * Diagrama SVG: (1) muitas poses-chave feitas à mão (esforço humano) e
 * (2) a dificuldade de interpolar de forma natural (arco correto × reta ingênua).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function stick(svg, g, x, y, k, color) {
    color = color || "var(--accent)";
    svg.circle(x, y, 9, { fill: "none", stroke: color, strokeWidth: 2, parent: g });
    svg.line(x, y + 9, x, y + 36, { stroke: color, strokeWidth: 2, parent: g });
    svg.line(x, y + 16, x - 13, y + 16 + k * 8, { stroke: color, strokeWidth: 2, parent: g });
    svg.line(x, y + 16, x + 13, y + 16 - k * 8, { stroke: color, strokeWidth: 2, parent: g });
    svg.line(x, y + 36, x - 11, y + 56, { stroke: color, strokeWidth: 2, parent: g });
    svg.line(x, y + 36, x + 11, y + 56, { stroke: color, strokeWidth: 2, parent: g });
  }

  function manual(svg, g) {
    var ks = [-1, -0.3, 0.5, 1, 0.2], x = 110;
    ks.forEach(function (k, i) {
      svg.rect(x - 32 + i * 124, 110, 96, 110, { fill: "var(--bg-soft)", stroke: "var(--border)", strokeWidth: 1.5, rx: 8, parent: g });
      stick(svg, g, x + 16 + i * 124, 132, k);
    });
    svg.text(380, 96, "✋ cada pose-chave é feita à mão pelo animador", { size: 12.5, weight: 700, color: "var(--ink)", parent: g });
    svg.text(380, 250, "trabalhoso, demorado e exige habilidade artística", { size: 12, color: "var(--ink-dim)", parent: g });
  }

  function interp(svg, g) {
    var O = [380, 250], L = 120;
    function end(deg) { var a = deg * Math.PI / 180; return [O[0] + L * Math.cos(a), O[1] - L * Math.sin(a)]; }
    var e1 = end(18), e2 = end(150), mid = [(e1[0] + e2[0]) / 2, (e1[1] + e2[1]) / 2];
    svg.circle(O[0], O[1], 6, { fill: "var(--ink)", parent: g });
    // poses-chave (braço)
    svg.line(O[0], O[1], e1[0], e1[1], { stroke: "var(--accent)", strokeWidth: 3, parent: g });
    svg.line(O[0], O[1], e2[0], e2[1], { stroke: "var(--accent)", strokeWidth: 3, parent: g });
    svg.circle(e1[0], e1[1], 6, { fill: "var(--accent)", parent: g });
    svg.circle(e2[0], e2[1], 6, { fill: "var(--accent)", parent: g });
    // correto: arco
    svg.path("M " + e1[0] + " " + e1[1] + " A " + L + " " + L + " 0 0 1 " + e2[0] + " " + e2[1],
      { stroke: "var(--green)", strokeWidth: 2.5, fill: "none", parent: g });
    // ingênuo: reta (corda) — braço "encolhe" no meio
    svg.line(e1[0], e1[1], e2[0], e2[1], { stroke: "var(--red)", strokeWidth: 2, dashed: "6 4", parent: g });
    svg.line(O[0], O[1], mid[0], mid[1], { stroke: "var(--red)", strokeWidth: 2, dashed: "3 3", parent: g });
    svg.circle(mid[0], mid[1], 5, { fill: "var(--red)", parent: g });
    svg.text(380, 150, "correto: arco (rotação)", { size: 12, weight: 700, color: "var(--green)", parent: g });
    svg.text(380, 300, "ingênuo: reta → braço encolhe/atravessa", { size: 12, weight: 700, color: "var(--red)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 340);
    if (active === "interp") interp(svg, svg.group({}));
    else manual(svg, svg.group({}));
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Onde o key framing custa caro",
        body:
          "<p>Cuidado para não confundir os custos. O cálculo dos in-betweens (interpolar dois " +
          "valores) é <b>trivial</b> para o computador — alguns multiplicações por quadro.</p>" +
          "<p>O <b>custo dominante</b> está em outro lugar: no <b>trabalho humano</b> de criar as " +
          "poses-chave e em garantir que a interpolação produza um <b>movimento crível</b>.</p>",
        visual: svgStep("manual"),
      }),
      {
        title: "O maior custo: criar os key frames à mão",
        body:
          "<p>O <b>maior custo</b> é a <b>criação/definição manual dos quadros-chave</b> pelo " +
          "animador: cada pose precisa ser posicionada à mão, controle por controle.</p>" +
          "<p>É <b>trabalhoso, demorado</b> e exige <b>habilidade artística</b> — não basta saber " +
          "computação, é preciso senso de timing e movimento. E <b>não escala</b>: o esforço cresce " +
          "com o número de poses, de personagens e de graus de liberdade (um humanoide tem dezenas " +
          "de juntas). Por isso surgiram alternativas como a <b>captura de movimento</b> e a " +
          "simulação física (q19).</p>",
        visual: svgStep("manual"),
      },
      {
        title: "E o agravante: interpolação natural é difícil",
        body:
          "<p>Garantir que os in-betweens produzam um movimento <b>natural/plausível</b> é " +
          "complicado, porque interpolar <b>linearmente</b> os parâmetros não corresponde ao " +
          "movimento físico real:</p>" +
          "<ul><li><b>Trajetória errada</b> — interpolar a <i>posição</i> da mão em linha reta faz o " +
          "braço \"encolher\" e atravessar o corpo, em vez de <b>girar em arco</b> (veja ao lado);</li>" +
          "<li><b>Rotações</b> — interpolar ângulos/matrizes diretamente causa solavancos; o certo é " +
          "<b>slerp</b> com quaternions;</li>" +
          "<li>movimento <b>mecânico</b> (sem ease) e <b>pé que desliza</b> no chão.</li></ul>" +
          "<p>Corrigir isso exige <b>mais key frames</b> ou ajustar curvas (<i>splines</i>, " +
          "<i>easing</i>) — o que <b>realimenta</b> o custo: mais trabalho humano.</p>",
        visual: svgStep("interp"),
      },
      {
        title: "Resumo",
        body:
          "<p>Em resumo:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "warn", title: "Maior custo do key framing",
              html: "O <b>esforço humano</b> de especificar os quadros-chave (e ajustar os " +
                "in-betweens para um movimento natural). O cálculo da interpolação em si é barato; " +
                "caro é o <b>trabalho do animador</b>.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "q17-custo-keyframing",
    num: "17",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "O maior custo do key framing",
    type: "conceitual",
    tags: ["animação", "key frame", "custo"],
    hubDesc: "O esforço humano de criar as poses-chave à mão (e garantir interpolação natural).",
    statement: "Qual é o <strong>maior custo do método de key framing</strong>?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
