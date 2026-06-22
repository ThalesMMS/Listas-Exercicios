/*
 * q08.js — Tipos de fontes de luz normalmente implementados.
 * Diagrama SVG: três painéis — pontual (radial), direcional (paralela) e spot (cone).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function pontual(svg, g, cx, cy) {
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      svg.arrow(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, cx + Math.cos(a) * 52, cy + Math.sin(a) * 52,
        { color: "var(--yellow)", strokeWidth: 2, head: 8, parent: g });
    }
    svg.circle(cx, cy, 15, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: g });
  }

  function direcional(svg, g, cx, cy) {
    // sol distante (canto)
    svg.circle(cx - 78, cy - 70, 14, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: g });
    // raios paralelos (mesma direção)
    for (var i = -2; i <= 2; i++) {
      var sx = cx - 70 + i * 18, sy = cy - 40 + i * 18;
      svg.arrow(sx, sy, sx + 70, sy + 70, { color: "var(--yellow)", strokeWidth: 2, head: 9, parent: g });
    }
  }

  function spot(svg, g, cx, cy) {
    var pt = [cx, cy - 56];
    var L = [cx - 42, cy + 70], R = [cx + 42, cy + 70];
    svg.polygon([pt, L, R], { fill: "var(--yellow-soft)", stroke: "none", parent: g });
    svg.line(pt[0], pt[1], L[0], L[1], { stroke: "var(--yellow)", strokeWidth: 2, parent: g });
    svg.line(pt[0], pt[1], R[0], R[1], { stroke: "var(--yellow)", strokeWidth: 2, parent: g });
    svg.circle(pt[0], pt[1], 11, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: g });
    // arco do ângulo de corte
    svg.path("M " + (cx - 16) + " " + (cy - 28) + " A 30 30 0 0 0 " + (cx + 16) + " " + (cy - 28),
      { stroke: "var(--orange)", strokeWidth: 1.5, fill: "none", parent: g });
    svg.text(cx, cy - 6, "θ", { size: 13, weight: 700, color: "var(--orange)", parent: g });
  }

  function panel(svg, g, x, title, caption, drawer) {
    var cx = x + 105;
    svg.text(cx, 64, title, { size: 14, weight: 700, color: "var(--ink)", parent: g });
    svg.rect(x, 84, 210, 190, { fill: "var(--bg-soft)", stroke: "var(--border)", strokeWidth: 1.5, rx: 10, parent: g });
    drawer(svg, g, cx, 176);
    svg.text(cx, 296, caption, { size: 11, color: "var(--ink-dim)", parent: g });
  }

  function scene(svg, active) {
    svg.view(760, 330);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    panel(svg, grp("point"), 40, "Pontual (point)", "emite p/ todo lado · atenua c/ a distância", pontual);
    panel(svg, grp("dir"), 275, "Direcional", "raios paralelos · só direção (Sol)", direcional);
    panel(svg, grp("spot"), 510, "Spot (holofote)", "cone com ângulo de corte θ", spot);
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Modelando luzes: ponto, direção e cone",
        body:
          "<p>As fontes de luz mais implementadas diferem em <b>geometria</b> — de onde e como a " +
          "luz chega à cena. Essa geometria determina duas coisas no cálculo de iluminação: como se " +
          "obtém o <b>vetor L</b> (direção para a luz) e se há <b>atenuação</b> com a distância.</p>" +
          "<p>Além delas, há a <b>luz ambiente</b> (uniforme, sem posição nem direção, usada como " +
          "aproximação da luz indireta). Veremos a pontual, a direcional e a spot (ao lado).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Luz pontual (point light)",
        body:
          "<p>Tem uma <b>posição</b> e emite luz <b>em todas as direções</b> a partir dela (como uma " +
          "lâmpada). Para cada ponto P da cena, o vetor <b>L = (posição_luz − P)</b> normalizado — " +
          "ou seja, <b>L muda de ponto a ponto</b>.</p>" +
          "<p>A intensidade <b>cai com a distância</b> por <b>atenuação</b>. Fisicamente segue a " +
          "<b>lei do inverso do quadrado</b> (∝ 1/d²); na prática usa-se um polinômio que evita " +
          "divisão explosiva perto da fonte:</p>" +
          "<div class='formula'>f_at = 1 / (k_c + k_l·d + k_q·d²)</div>" +
          "<p>com termos constante, linear e quadrático. É a fonte mais comum, e a mais cara das " +
          "três por recalcular L e a atenuação em cada ponto.</p>",
        visual: svgStep(["point"]),
      },
      {
        title: "Luz direcional (directional)",
        body:
          "<p>Tem apenas uma <b>direção</b> (sem posição): os raios chegam <b>paralelos</b>, como os " +
          "do <b>Sol</b> — uma fonte tão distante que a distância e a divergência dos raios são " +
          "irrelevantes.</p>" +
          "<p>Consequências: <b>não há atenuação</b> por distância e o vetor <b>L é constante</b> em " +
          "toda a cena (calculado uma única vez). É a fonte <b>mais barata</b>. Suas sombras também " +
          "são mais simples de gerar (projeção <b>ortográfica</b> no <i>shadow map</i>).</p>",
        visual: svgStep(["dir"]),
      },
      {
        title: "Luz spot (holofote)",
        body:
          "<p>É uma luz pontual <b>restrita a um cone</b>: tem posição, uma <b>direção do cone</b> e " +
          "um <b>ângulo de abertura</b> (cutoff <span style='color:var(--orange)'>θ</span>). Fora do " +
          "cone, não ilumina.</p>" +
          "<p>Para suavizar a borda, usa-se um <b>cone interno e um externo</b> (<i>penumbra</i>) ou " +
          "uma <b>atenuação angular</b> do tipo <b>(cos α)^p</b> — mais forte no eixo, decaindo até a " +
          "borda. Soma-se ainda a atenuação por distância da luz pontual. Útil para lanternas, " +
          "faróis e refletores de palco.</p>",
        visual: svgStep(["spot"]),
      },
      S.concept({
        title: "Além das três: luz de área",
        body:
          "<p>As três fontes acima são <b>idealizações</b> (um ponto, uma direção). Renderizadores " +
          "físicos somam a <b>luz de área</b>: uma superfície emissora com <b>tamanho</b> real (um " +
          "painel, uma janela).</p>" +
          "<p>Como cada ponto recebe luz de <b>várias direções</b> da fonte, ela produz " +
          "naturalmente <b>sombras suaves</b> (penumbra) e reflexos alongados — o que pontual e " +
          "direcional não fazem sozinhas. Em troca, é bem mais <b>cara</b> (exige amostrar a área).</p>",
        visual: svgStep("all"),
      }),
      S.comparison({
        title: "Resumo: tipos de fonte de luz",
        intro: "<p>Acrescenta-se a <b>luz ambiente</b> (e, em modelos avançados, fontes de <b>área</b>).</p>",
        headers: ["Fonte", "Geometria", "Vetor L", "Atenuação"],
        rows: [
          ["Ambiente", "Uniforme, sem posição/direção", "—", "—"],
          ["Pontual (point)", "Posição; emite em todas as direções", "Varia por ponto", "Com a distância"],
          ["Direcional", "Só direção; raios paralelos (Sol)", "Constante", "Não"],
          ["Spot (holofote)", "Posição + cone com ângulo de corte", "Varia por ponto", "Distância + angular"],
          ["Área", "Superfície emissora com tamanho", "Várias direções", "Distância (+ tamanho)"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q08-fontes-de-luz",
    num: "8",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Tipos de fontes de luz",
    type: "conceitual",
    tags: ["luz", "point", "spot", "direcional"],
    hubDesc: "Ambiente, pontual, direcional e spot — geometria e atenuação de cada uma.",
    statement:
      "Quais são os <strong>tipos de fontes de luz</strong> normalmente implementados? Explique.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
