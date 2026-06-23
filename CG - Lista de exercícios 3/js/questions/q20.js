/*
 * q20.js — Cinemática Direta × Inversa.
 * Diagrama SVG: braço articulado. Direta: ângulos → posição do efetuador.
 * Inversa: posição-alvo → ângulos das juntas.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function armBase(svg, g, base, j1, ee, color) {
    svg.rect(base[0] - 18, base[1], 36, 14, { fill: "var(--ink-mute)", rx: 2, parent: g });
    svg.line(base[0], base[1], j1[0], j1[1], { stroke: color, strokeWidth: 7, parent: g });
    svg.line(j1[0], j1[1], ee[0], ee[1], { stroke: color, strokeWidth: 6, parent: g });
    svg.circle(base[0], base[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2, parent: g });
    svg.circle(j1[0], j1[1], 6, { fill: "var(--ink)", stroke: color, strokeWidth: 2, parent: g });
  }

  function direta(svg, g) {
    var base = [120, 280], j1 = [169, 210], ee = [237, 185];
    armBase(svg, g, base, j1, ee, "var(--accent)");
    // ângulos conhecidos
    svg.path("M " + (base[0] + 34) + " " + base[1] + " A 34 34 0 0 0 " + (base[0] + 24) + " " + (base[1] - 24),
      { stroke: "var(--yellow)", strokeWidth: 2, fill: "none", parent: g });
    svg.text(base[0] + 44, base[1] - 12, "θ₁", { size: 13, weight: 700, color: "var(--yellow)", parent: g });
    svg.text(j1[0] - 4, j1[1] - 16, "θ₂", { size: 13, weight: 700, color: "var(--yellow)", parent: g });
    // efetuador calculado
    svg.circle(ee[0], ee[1], 8, { fill: "var(--green)", stroke: "var(--ink)", strokeWidth: 1.5, parent: g });
    svg.text(ee[0] + 12, ee[1] - 6, "P (calculado)", { size: 12, weight: 700, color: "var(--green)", parent: g, anchor: "start" });
    svg.arrow(60, 130, 150, 130, { color: "var(--ink-dim)", strokeWidth: 2, head: 9, parent: g });
    svg.text(150, 116, "ângulos → posição", { size: 12, color: "var(--ink-dim)", parent: g });
  }

  function inversa(svg, g) {
    var base = [500, 280], j1 = [556, 206], P = [612, 150];
    armBase(svg, g, base, j1, P, "var(--accent)");
    // ângulos desconhecidos
    svg.text(base[0] + 40, base[1] - 12, "θ₁ ?", { size: 13, weight: 700, color: "var(--red)", parent: g });
    svg.text(j1[0] - 6, j1[1] - 16, "θ₂ ?", { size: 13, weight: 700, color: "var(--red)", parent: g });
    // alvo
    svg.circle(P[0], P[1], 9, { fill: "none", stroke: "var(--red)", strokeWidth: 2.5, parent: g });
    svg.circle(P[0], P[1], 3, { fill: "var(--red)", parent: g });
    svg.text(P[0] + 12, P[1] - 6, "alvo P*", { size: 12, weight: 700, color: "var(--red)", parent: g, anchor: "start" });
    svg.arrow(700, 130, 620, 150, { color: "var(--ink-dim)", strokeWidth: 2, head: 9, parent: g });
    svg.text(700, 116, "posição → ângulos ?", { size: 12, color: "var(--ink-dim)", parent: g, anchor: "end" });
  }

  function scene(svg, active) {
    svg.view(760, 320);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gD = grp("dir"), gI = grp("inv");
    svg.text(150, 56, "Cinemática direta", { size: 15, weight: 700, color: "var(--ink)", parent: gD });
    direta(svg, gD);
    svg.text(150, 308, "dados os ângulos → acha a posição", { size: 11.5, color: "var(--ink-dim)", parent: gD });
    svg.text(580, 56, "Cinemática inversa", { size: 15, weight: 700, color: "var(--ink)", parent: gI });
    inversa(svg, gI);
    svg.text(580, 308, "dada a posição → acha os ângulos", { size: 11.5, color: "var(--ink-dim)", parent: gI });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Dos ângulos para a posição — e o caminho inverso",
        body:
          "<p>Em personagens e robôs, o corpo é uma <b>cadeia articulada</b> (juntas e elos). " +
          "Há duas formas de controlá-la, em sentidos opostos.</p>" +
          "<p>Direta: das <b>juntas</b> para a <b>ponta</b>. Inversa: da <b>ponta</b> para as " +
          "<b>juntas</b>.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Cinemática direta (forward)",
        body:
          "<p>Dados os <b>ângulos das juntas</b>, calcula-se a <b>posição/orientação do efetuador " +
          "final</b> (a \"mão\"/ponta). Cada junta aplica uma rotação e cada elo uma translação; o " +
          "efetuador é a <b>composição (multiplicação) dessas matrizes</b> ao longo da hierarquia:</p>" +
          "<div class='formula'>P = M_base · R(θ₁) · M_elo1 · R(θ₂) · M_elo2 · … </div>" +
          "<p>Para um braço plano de 2 elos (l₁, l₂): " +
          "x = l₁cos θ₁ + l₂cos(θ₁+θ₂), y = l₁sen θ₁ + l₂sen(θ₁+θ₂). É uma solução " +
          "<b>direta e única</b>, fácil e barata de calcular.</p>",
        visual: svgStep("dir"),
      },
      {
        title: "Cinemática inversa (inverse)",
        body:
          "<p>Dada a <b>posição-alvo</b> do efetuador final, calculam-se os <b>ângulos das juntas</b> " +
          "necessários para alcançá-la — inverter a função da cinemática direta.</p>" +
          "<p>É <b>não-linear</b> e pode ter:</p>" +
          "<ul><li><b>Múltiplas soluções</b> — o cotovelo para cima ou para baixo alcança o mesmo " +
          "ponto;</li>" +
          "<li><b>Infinitas</b> — quando há mais juntas que o necessário (cadeia redundante);</li>" +
          "<li><b>Nenhuma</b> — se o alvo está fora do alcance.</li></ul>" +
          "<p>Resolve-se por métodos <b>analíticos</b> (fórmula fechada, só para cadeias simples) ou " +
          "<b>iterativos</b> (Jacobiano, CCD), que se aproximam do alvo passo a passo. Mais difícil, " +
          "porém essencial para <b>posicionar a mão num objeto, o pé no chão</b> ou adaptar captura " +
          "de movimento.</p>",
        visual: svgStep("inv"),
      },
      S.comparison({
        title: "Resumo: direta × inversa",
        headers: ["", "Direta (forward)", "Inversa (inverse)"],
        rows: [
          ["Entrada", "Ângulos das juntas", "Posição desejada do efetuador"],
          ["Saída", "Posição do efetuador", "Ângulos das juntas"],
          ["Cálculo", "Composição de matrizes (direto)", "Inversão não-linear"],
          ["Soluções", "Única", "Múltiplas / infinitas / nenhuma"],
          ["Métodos", "Fórmula direta", "Analítico ou iterativo (Jacobiano, CCD)"],
          ["Dificuldade", "Simples", "Mais difícil"],
          ["Uso", "Controlar articulações", "Alcançar alvos (mão no objeto, pé no chão)"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q20-cinematica-direta-inversa",
    num: "20",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "Cinemática Direta × Inversa",
    type: "conceitual",
    tags: ["cinemática", "inversa", "articulado"],
    hubDesc: "Ângulos → posição (direta) × posição-alvo → ângulos (inversa).",
    statement: "Diferencie <strong>Cinemática Direta</strong> de <strong>Inversa</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
