/*
 * q03.js — Os 4 fatores de Gestalt para agrupamento.
 * Diagrama SVG: grade 2×2, uma ilustração por fator (proximidade, similaridade,
 * continuidade, fechamento). Revelação um fator por vez.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  function panel(svg, g, x, y, w, h, title, caption) {
    var cx = x + w / 2;
    svg.rect(x, y, w, h, { fill: "var(--bg-soft)", stroke: "var(--border)", strokeWidth: 1.5, rx: 12, parent: g });
    svg.text(cx, y + 24, title, { size: 15, weight: 700, color: "var(--ink)", parent: g });
    svg.text(cx, y + h - 16, caption, { size: 11.5, color: "var(--ink-dim)", parent: g });
    return cx;
  }

  // Proximidade — 3 grupos de pontos próximos.
  function drawProx(svg, g, x, y, w, h) {
    var cx = panel(svg, g, x, y, w, h, "Proximidade", "perto → mesmo grupo");
    var cy = y + h / 2 + 6;
    [-1, 0, 1].forEach(function (k) {
      var gx = cx + k * 78;
      [[-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(function (o) {
        svg.circle(gx + o[0], cy + o[1], 7, { fill: "var(--accent)", parent: g });
      });
    });
  }

  // Similaridade — colunas de cores diferentes → vê-se colunas.
  function drawSimil(svg, g, x, y, w, h) {
    var cx = panel(svg, g, x, y, w, h, "Similaridade", "iguais → mesmo grupo");
    var cy = y + h / 2 + 6;
    for (var c = -2; c <= 2; c++) {
      for (var r = -1; r <= 1; r++) {
        svg.circle(cx + c * 38, cy + r * 34, 10, {
          fill: (c % 2 === 0) ? "var(--accent)" : "var(--orange)", parent: g,
        });
      }
    }
  }

  // Continuidade — duas curvas que se cruzam, lidas como caminhos suaves.
  function drawCont(svg, g, x, y, w, h) {
    var cx = panel(svg, g, x, y, w, h, "Continuidade", "a visão segue caminhos suaves");
    var x0 = x + 36, x1 = x + w - 36, midx = cx, top = y + 62, bot = y + h - 40;
    svg.path("M " + x0 + " " + top + " Q " + midx + " " + bot + " " + x1 + " " + top,
      { stroke: "var(--accent)", strokeWidth: 4, parent: g });
    svg.path("M " + x0 + " " + bot + " Q " + midx + " " + top + " " + x1 + " " + bot,
      { stroke: "var(--green)", strokeWidth: 4, parent: g });
  }

  // Fechamento — círculo interrompido que o olho completa.
  function drawFech(svg, g, x, y, w, h) {
    var cx = panel(svg, g, x, y, w, h, "Fechamento", "a mente completa a forma");
    var cy = y + h / 2 + 6;
    svg.circle(cx, cy, 50, { stroke: "var(--purple)", strokeWidth: 5, fill: "none", dashed: "42 20", parent: g });
  }

  function scene(svg, stage) {
    svg.view(760, 484);
    function grp(name) {
      var g = svg.group({});
      g.setAttribute("opacity", stage === "all" || stage === name ? 1 : 0.16);
      return g;
    }
    drawProx(svg, grp("prox"), 44, 30, 320, 200);
    drawSimil(svg, grp("simil"), 396, 30, 320, 200);
    drawCont(svg, grp("cont"), 44, 256, 320, 200);
    drawFech(svg, grp("fech"), 396, 256, 320, 200);
  }

  function svgStep(stage) {
    return { type: "svg", draw: function (svg) { scene(svg, stage); } };
  }

  function build() {
    return [
      S.concept({
        title: "Gestalt: percebemos o todo, não as partes isoladas",
        body:
          "<p>A <b>teoria da Gestalt</b> (psicologia, início do séc. XX) parte de um princípio: " +
          "<b>\"o todo é diferente da soma das partes\"</b>. O sistema visual não vê pontos soltos — " +
          "ele <b>organiza e agrupa</b> estímulos em conjuntos coerentes, automaticamente.</p>" +
          "<p>Por baixo de tudo está a <b>lei da <i>Prägnanz</i></b> (boa forma): tendemos à " +
          "interpretação mais <b>simples e estável</b> possível. Isso é fundamental para projetar " +
          "interfaces, ícones, legendas e cenas — alinhar a percepção com a intenção.</p>" +
          "<p>São <span class='accent'>quatro fatores</span> clássicos de agrupamento: " +
          "<b>proximidade</b>, <b>similaridade</b>, <b>continuidade</b> e <b>fechamento</b> " +
          "(ao lado).</p>",
        visual: svgStep("all"),
      }),
      {
        title: "1) Proximidade",
        body:
          "<p>Elementos <b>próximos</b> entre si são percebidos como um <b>grupo</b>. " +
          "A distância pesa <b>mais</b> que a aparência: aproximar junta, afastar separa — mesmo que " +
          "os elementos sejam idênticos.</p>" +
          "<p>Vemos <span class='accent'>três grupos</span> de pontos só pela distância entre eles.</p>" +
          "<p class='muted'><b>Em UI/CG:</b> o <i>espaço em branco</i> agrupa campos de um formulário, " +
          "separa seções de um menu e organiza barras de ferramentas — sem precisar de linhas ou " +
          "caixas.</p>",
        visual: svgStep("prox"),
      },
      {
        title: "2) Similaridade",
        body:
          "<p>Elementos <b>parecidos</b> — em cor, forma, tamanho, textura ou orientação — são " +
          "agrupados, <b>ainda que distantes</b>. A similaridade pode até <b>vencer</b> a " +
          "proximidade quando as duas competem.</p>" +
          "<p>Aqui a <b>cor</b> define o agrupamento: percebemos <span class='accent'>colunas</span> " +
          "(azul e laranja), não linhas, embora as distâncias sejam iguais.</p>" +
          "<p class='muted'><b>Em UI/CG:</b> base das <i>legendas</i> de gráficos (mesma cor = mesma " +
          "série), do realce de itens selecionados e de ícones que compartilham um estilo visual.</p>",
        visual: svgStep("simil"),
      },
      {
        title: "3) Continuidade (boa continuação)",
        body:
          "<p>A visão tende a seguir <b>caminhos contínuos e suaves</b>. Quando linhas se cruzam, " +
          "lemos cada uma como um traço que <b>continua</b> na direção mais natural, em vez de " +
          "\"quebrar\" e trocar de rumo no cruzamento.</p>" +
          "<p>As duas curvas se cruzam, mas cada cor é vista como um caminho inteiro.</p>" +
          "<p class='muted'><b>Em UI/CG:</b> o <i>alinhamento</i> de elementos cria linhas " +
          "imaginárias que guiam o olhar; é também o que faz uma curva de dados ser lida como uma " +
          "trajetória única num gráfico.</p>",
        visual: svgStep("cont"),
      },
      {
        title: "4) Fechamento",
        body:
          "<p>A mente <b>completa</b> formas incompletas, preenchendo as lacunas para perceber " +
          "um <b>todo fechado</b> — desde que haja informação suficiente para inferir a forma.</p>" +
          "<p>Mesmo com aberturas, lemos a figura como um <span class='accent'>círculo</span> inteiro.</p>" +
          "<p class='muted'><b>Em UI/CG:</b> logos que sugerem a forma sem desenhá-la por completo " +
          "(o panda da WWF, o IBM listrado) e o reconhecimento de objetos <b>parcialmente " +
          "ocultos</b> numa cena — o cérebro reconstrói o que falta.</p>",
        visual: svgStep("fech"),
      },
      S.comparison({
        title: "Resumo: os 4 fatores",
        intro:
          "<p>Todos respondem à mesma pergunta: <b>o que vai junto?</b> " +
          "<span class='muted'>(Alguns cursos citam também variantes como região comum e conexão.)</span></p>",
        headers: ["Fator", "Agrupa por…", "Aplicação típica"],
        rows: [
          ["Proximidade", "Distância — o que está perto", "Espaçamento de campos/menus"],
          ["Similaridade", "Aparência — cor, forma, tamanho", "Legendas, seleção, ícones"],
          ["Continuidade", "Caminhos suaves e contínuos", "Alinhamento, curvas de dados"],
          ["Fechamento", "Completar formas incompletas", "Logos, objetos ocluídos"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q03-gestalt",
    num: "3",
    subject: "Computação Gráfica — Lista 3",
    section: "I) Cor e Percepção",
    title: "Os 4 fatores de Gestalt",
    type: "conceitual",
    tags: ["gestalt", "percepção", "agrupamento"],
    hubDesc: "Proximidade, similaridade, continuidade e fechamento — ilustrados.",
    statement:
      "Quais são os <strong>4 fatores de Gestalt</strong> que determinam como os seres " +
      "humanos agrupam as informações?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
