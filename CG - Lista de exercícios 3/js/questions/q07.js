/*
 * q07.js — Iluminação direta × global.
 * Diagrama SVG: a mesma "caixa" com objeto e luz, mostrada de dois modos —
 * direta (só o raio da fonte) e global (raios rebatidos + color bleeding). A
 * sombra é a MESMA nos dois: a dureza depende da fonte, não de direta vs global.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function room(svg, parent, ox, oy, kind) {
    var W = 240, H = 210, cx = ox + W / 2, cy = oy + 118, R = 38;
    svg.rect(ox, oy, W, H, { fill: "var(--bg-soft)", stroke: "var(--ink-mute)", strokeWidth: 1.5, rx: 6, parent: parent });
    svg.rect(ox, oy, 14, H, { fill: "var(--red)", opacity: 0.45, parent: parent }); // parede colorida (fonte do bleeding)
    // fonte de luz
    svg.circle(cx, oy + 22, 12, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2, parent: parent });
    // objeto
    svg.circle(cx, cy, R, { fill: "var(--bg-card)", stroke: "var(--ink-dim)", strokeWidth: 2, parent: parent });
    // raio direto (sempre presente)
    svg.arrow(cx, oy + 36, cx, cy - R - 2, { color: "var(--yellow)", strokeWidth: 2.5, head: 10, parent: parent });

    // Sombra IGUAL nos dois painéis: ambos usam a mesma fonte pontual, logo a mesma
    // dureza. O que distingue a global são os raios indiretos e o color bleeding —
    // não a sombra. (Antes: direta=dura, global=suave, reforçando associação errada.)
    svg.ellipse(cx + 22, oy + H - 24, 46, 11, { fill: "var(--ink)", opacity: 0.5, parent: parent });

    if (kind === "global") {
      // raios indiretos (rebatidos)
      svg.arrow(ox + 16, cy, cx - R, cy, { color: "var(--red)", strokeWidth: 2, head: 9, dashed: "5 4", parent: parent });
      svg.arrow(cx, oy + H - 16, cx, cy + R, { color: "var(--cyan)", strokeWidth: 2, head: 9, dashed: "5 4", parent: parent });
      svg.arrow(ox + W - 16, cy + 24, cx + R, cy + 12, { color: "var(--green)", strokeWidth: 2, head: 9, dashed: "5 4", parent: parent });
      // color bleeding: borda esquerda do objeto tingida pela parede vermelha
      svg.path("M " + cx + " " + (cy - R) + " A " + R + " " + R + " 0 0 0 " + cx + " " + (cy + R),
        { stroke: "var(--red)", strokeWidth: 7, fill: "none", opacity: 0.6, parent: parent });
    }
    return { cx: cx, cy: cy };
  }

  function scene(svg, active) {
    svg.view(760, 400);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.14); return g; }
    var gD = grp("direta");
    var gG = grp("global");

    svg.text(190, 50, "Iluminação direta", { size: 14, weight: 700, color: "var(--ink)", parent: gD });
    room(svg, gD, 70, 70, "direta");
	    svg.text(190, 312, "só a luz da fonte direta", { size: 11.5, color: "var(--ink-dim)", parent: gD });
    svg.text(190, 330, "sem inter-reflexão", { size: 11.5, color: "var(--ink-dim)", parent: gD });

    svg.text(550, 50, "Iluminação global", { size: 14, weight: 700, color: "var(--ink)", parent: gG });
    room(svg, gG, 430, 70, "global");
    svg.text(550, 312, "direta + indireta (rebatida)", { size: 11.5, color: "var(--ink-dim)", parent: gG });
	    svg.text(550, 330, "color bleeding e luz indireta", { size: 11.5, color: "var(--ink-dim)", parent: gG });

    // Legenda: a sombra é a mesma; a dureza depende da extensão da fonte, não de direta/global.
    svg.text(380, 376, "A sombra é a mesma nos dois: a dureza depende da extensão da fonte (aqui, pontual), não de direta vs global.",
      { size: 11, color: "var(--ink-dim)" });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Quanta luz a gente considera?",
        body:
          "<p>A diferença entre <b>iluminação direta</b> e <b>global</b> está em <i>quantos saltos</i> " +
          "da luz o modelo leva em conta antes de ela chegar ao olho.</p>" +
          "<p><b>Direta</b>: só o caminho <i>fonte → superfície → olho</i> (um salto). " +
          "<b>Global</b>: também os caminhos <i>fonte → várias superfícies → olho</i> (a luz " +
          "<b>rebate</b> entre os objetos).</p>" +
          "<p class='muted'>Formalmente, a global resolve a <b>equação de renderização</b> " +
          "(L_o = L_e + ∫ f_r · L_i · cos θ dω): a luz que sai de um ponto integra <b>toda</b> a luz " +
          "que chega nele — inclusive a vinda de outras superfícies. A direta só considera o termo " +
          "das fontes.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Iluminação direta (local)",
        body:
          "<p>Considera apenas a luz que vai <b>diretamente da fonte</b> para a superfície (e daí " +
          "ao olho). Não trata a luz que rebate entre objetos — por isso também se chama " +
          "<b>iluminação local</b>: a cor de cada ponto é resolvida isoladamente, sem \"conversar\" " +
          "com o resto da cena. É o que fazem o modelo de Phong (q10) e a rasterização em tempo real.</p>" +
	          "<p>Resultado: cálculo <b>barato</b>. Regiões fora da luz direta ficariam pretas — por isso usa-se um termo <b>ambiente</b> constante como aproximação.</p>" +
	          "<p class='muted'>A sombra pode ser dura ou suave conforme a extensão angular da fonte: uma fonte pontual tende a sombra dura; uma área luminosa pode gerar penumbra mesmo em iluminação direta.</p>",
        visual: svgStep(["direta"]),
      },
      {
        title: "Iluminação global",
        body:
          "<p>Considera também a luz <b>indireta</b>: múltiplas <b>reflexões/refrações</b> entre " +
          "superfícies. Surgem efeitos realistas:</p>" +
	          "<ul><li><b>Iluminação indireta</b> em regiões que não recebem luz direta;</li>" +
	          "<li><b>Color bleeding</b> — uma parede colorida tinge o objeto vizinho;</li>" +
	          "<li><b>Cáusticas</b> — padrões de luz focada por vidro/água;</li>" +
          "<li><b>sombras suaves</b> (penumbra) produzidas por fontes de área.</li></ul>" +
	          "<p class='muted'>Global não significa automaticamente sombra suave: uma fonte pontual ainda pode produzir sombra dura em um renderizador global.</p>" +
	          "<p>Muito mais <b>realista</b>, porém <b>caro</b>. Métodos típicos: " +
          "<b>radiosidade</b> (troca de energia entre superfícies difusas), <b>path tracing</b> " +
          "(integração de Monte Carlo dos caminhos de luz) e <b>photon mapping</b> (bom para " +
          "cáusticas).</p>",
        visual: svgStep(["global"]),
      },
      S.comparison({
        title: "Resumo: direta × global",
        intro: "<p>Trade-off clássico entre realismo e custo.</p>",
        headers: ["", "Iluminação direta", "Iluminação global"],
        rows: [
          ["Considera", "Só luz vinda da fonte", "Também luz refletida por outras superfícies"],
          ["Inter-reflexão", "Não", "Sim"],
	          ["Sombras", "Dependem do tamanho/angular da fonte", "Também dependem da fonte; indireta pode suavizar a cena"],
          ["Realismo", "Menor", "Maior"],
          ["Custo", "Baixo", "Alto"],
          ["Exemplos", "Phong local, ambiente constante", "Radiosidade, path tracing, ray tracing"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q07-direta-global",
    num: "7",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Iluminação direta × global",
    type: "conceitual",
    tags: ["iluminação", "global", "radiosidade"],
    hubDesc: "Só a luz direta da fonte, ou também a luz indireta rebatida entre superfícies.",
    statement: "Diferencie <strong>iluminação direta</strong> de <strong>global</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
