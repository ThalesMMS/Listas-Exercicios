/*
 * q19.js — Cinemática × Dinâmica.
 * Diagrama SVG: cinemática (movimento: posição/velocidade, sem forças) ×
 * dinâmica (as causas: força, massa → aceleração, F = m·a).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function cinematica(svg, g, x) {
    var y = 196;
    svg.line(x - 20, y + 26, x + 250, y + 26, { stroke: "var(--ink-mute)", strokeWidth: 1.5, parent: g });
    var xs = [x + 10, x + 90, x + 200]; // espaçamento crescente → acelerando
    xs.forEach(function (bx, i) {
      var solid = i === xs.length - 1;
      svg.circle(bx, y, 16, { fill: solid ? "var(--accent)" : "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2, parent: g });
      svg.arrow(bx, y - 26, bx + 24 + i * 14, y - 26, { color: "var(--green)", strokeWidth: 2, head: 8, parent: g });
    });
    svg.text(x + 120, y - 44, "velocidade (v)", { size: 11.5, color: "var(--green)", parent: g });
    svg.text(x + 120, y + 50, "posição ao longo do tempo", { size: 11.5, color: "var(--ink-dim)", parent: g });
  }

  function dinamica(svg, g, x) {
    var c = [x + 110, 188];
    svg.circle(c[0], c[1], 26, { fill: "var(--bg-soft)", stroke: "var(--accent)", strokeWidth: 2.5, parent: g });
    svg.text(c[0], c[1], "m", { size: 16, weight: 800, color: "var(--accent)", parent: g });
    svg.arrow(c[0] + 26, c[1], c[0] + 110, c[1], { color: "var(--red)", strokeWidth: 3.5, head: 13, parent: g });
    svg.text(c[0] + 84, c[1] - 14, "F", { size: 16, weight: 800, color: "var(--red)", parent: g });
    svg.arrow(c[0], c[1] + 26, c[0], c[1] + 78, { color: "var(--ink-dim)", strokeWidth: 2, head: 9, parent: g });
    svg.text(c[0] + 16, c[1] + 60, "m·g", { size: 12, color: "var(--ink-dim)", parent: g });
    svg.arrow(c[0] + 26, c[1] - 30, c[0] + 78, c[1] - 30, { color: "var(--orange)", strokeWidth: 2, head: 9, dashed: "5 4", parent: g });
    svg.text(c[0] + 92, c[1] - 30, "a", { size: 14, weight: 700, color: "var(--orange)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 320);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gC = grp("cin"), gD = grp("din");
    svg.text(170, 60, "Cinemática", { size: 15, weight: 700, color: "var(--ink)", parent: gC });
    cinematica(svg, gC, 60);
    svg.text(170, 296, "o movimento — sem as causas", { size: 11.5, color: "var(--ink-dim)", parent: gC });
    svg.text(560, 60, "Dinâmica", { size: 15, weight: 700, color: "var(--ink)", parent: gD });
    dinamica(svg, gD, 430);
    svg.text(560, 296, "as causas — forças e massa", { size: 11.5, color: "var(--ink-dim)", parent: gD });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Descrever o movimento × explicar suas causas",
        body:
          "<p>Cinemática e dinâmica estudam o mesmo movimento por ângulos diferentes: uma " +
          "<b>descreve</b>, a outra <b>explica</b>.</p>" +
          "<p>A pergunta-chave: <b>como</b> o objeto se move (cinemática) ou <b>por que</b> ele se " +
          "move (dinâmica)?</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Cinemática — o movimento",
        body:
          "<p>Descreve o <b>movimento em si</b>, por relações puramente <b>geométricas e " +
          "temporais</b>: a <b>velocidade</b> é a taxa de variação da <b>posição</b>, e a " +
          "<b>aceleração</b>, a da velocidade (v = dx/dt, a = dv/dt).</p>" +
          "<p><b>Não</b> há forças nem massas na conta — só onde o objeto está e como isso muda no " +
          "tempo. Em animação, é o <b>animador especificando diretamente</b> a trajetória " +
          "(key frames, caminhos): controle total, mas o realismo físico fica por conta do artista.</p>",
        visual: svgStep("cin"),
      },
      {
        title: "Dinâmica — as causas",
        body:
          "<p>Estuda <b>as causas</b> do movimento: <b>forças</b>, <b>massas</b> e torques, regida " +
          "pelas leis de Newton. A força resultante determina a aceleração:</p>" +
          "<div class='formula'>F = m · a   →   a = F / m</div>" +
          "<p>Daí o computador <b>integra no tempo</b> (ex.: método de Euler) para obter velocidade e " +
          "posição: a = F/m → v += a·Δt → x += v·Δt. O movimento <b>emerge</b> da simulação de " +
          "forças (gravidade, molas, colisões, atrito) — muito <b>realista</b>, porém com " +
          "<b>menos controle direto</b> sobre o resultado exato.</p>",
        visual: svgStep("din"),
      },
      S.comparison({
        title: "Resumo: cinemática × dinâmica",
        headers: ["", "Cinemática", "Dinâmica"],
        rows: [
          ["Estuda", "O movimento (pos., vel., acel.)", "As causas (forças, massa, torque)"],
          ["Considera forças?", "Não", "Sim"],
          ["Pergunta", "Como se move?", "Por que se move?"],
          ["Base", "Geometria / tempo (derivadas)", "Leis de Newton + integração no tempo"],
          ["Em animação", "Movimento especificado", "Movimento simulado (física)"],
          ["Trade-off", "Controle total, menos realista", "Realista, menos controlável"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q19-cinematica-dinamica",
    num: "19",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "Cinemática × Dinâmica",
    type: "conceitual",
    tags: ["animação", "cinemática", "dinâmica", "física"],
    hubDesc: "Descrever o movimento (cinemática) × explicar suas causas com forças (dinâmica).",
    statement: "Diferencie <strong>Cinemática</strong> de <strong>Dinâmica</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
