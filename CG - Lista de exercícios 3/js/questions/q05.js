/*
 * q05.js — Por que, em Ray Casting, calcular os pixels a partir da câmera.
 * Diagrama SVG: câmera → plano de visualização (pixels) → 1 raio por pixel → cena.
 * Destaque do "primeiro objeto atingido = visibilidade".
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;

  var EYE = [78, 220];
  var PX = 200;                 // x do plano de visualização
  var PYC = [140, 180, 220, 260, 300]; // centros verticais dos pixels
  var HIT = [474, 220];         // interseção do raio central com a esfera A

  function scene(svg, active) {
    svg.view(760, 430);
    function on(n) { return active === "all" || active.indexOf(n) >= 0; }
    function grp(n) { var g = svg.group({}); g.setAttribute("opacity", on(n) ? 1 : 0.12); return g; }
    var gScene = grp("scene");
    var gCam = grp("cam");
    var gRays = grp("rays");
    var gHit = grp("hit");

    // ---- Objetos da cena ----
    svg.circle(520, 220, 46, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5, opacity: 0.85, parent: gScene });
    svg.circle(615, 330, 46, { fill: "var(--green)", opacity: 0.8, parent: gScene });
    svg.circle(470, 110, 32, { fill: "var(--purple)", opacity: 0.8, parent: gScene });
    svg.text(640, 250, "cena 3D", { size: 12, color: "var(--ink-dim)", parent: gScene });

    // ---- Câmera + plano de visualização ----
    svg.ellipse(EYE[0], EYE[1], 26, 17, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2, parent: gCam });
    svg.circle(EYE[0], EYE[1], 9, { fill: "var(--ink)", parent: gCam });
    svg.text(EYE[0], EYE[1] + 40, "câmera /", { size: 12, color: "var(--ink)", parent: gCam });
    svg.text(EYE[0], EYE[1] + 56, "observador", { size: 12, color: "var(--ink)", parent: gCam });
    for (var i = 0; i < PYC.length; i++) {
      svg.rect(PX - 15, PYC[i] - 20, 30, 40, {
        fill: (PYC[i] === 220 ? "var(--accent-soft)" : "none"),
        stroke: "var(--ink-mute)", strokeWidth: 1.5, parent: gCam,
      });
    }
    svg.text(PX, 86, "plano de visualização", { size: 12, color: "var(--ink-dim)", parent: gCam });
    svg.text(PX, 100, "(grade de pixels)", { size: 11, color: "var(--ink-mute)", parent: gCam });

    // ---- Um raio por pixel ----
    for (i = 0; i < PYC.length; i++) {
      if (PYC[i] === 220) continue; // o central é o destacado
      var dx = PX - EYE[0], dy = PYC[i] - EYE[1];
      var fx = 662, fy = EYE[1] + dy * ((fx - EYE[0]) / dx);
      svg.line(EYE[0], EYE[1], fx, fy, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5", parent: gRays });
    }
    svg.text(330, 150, "1 raio por pixel", { size: 12.5, color: "var(--ink-dim)", parent: gRays });

    // ---- Raio destacado + primeiro objeto atingido ----
    svg.line(EYE[0], EYE[1], HIT[0], HIT[1], { stroke: "var(--yellow)", strokeWidth: 3, parent: gHit });
    svg.line(HIT[0], HIT[1], 600, 220, { stroke: "var(--yellow)", strokeWidth: 2, dashed: "4 6", opacity: 0.45, parent: gHit });
    svg.circle(HIT[0], HIT[1], 6, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5, parent: gHit });
    svg.text(HIT[0] - 6, 200, "1ª interseção", { size: 11.5, weight: 700, color: "var(--yellow)", parent: gHit, anchor: "middle" });
    // pixel correspondente recebe a cor do objeto
    svg.rect(PX - 15, 200, 30, 40, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5, opacity: 0.9, parent: gHit });
  }

  function svgStep(active) { return { type: "svg", draw: function (svg) { scene(svg, active); } }; }

  function build() {
    return [
      S.concept({
        title: "Ray Casting: a imagem é construída a partir do olho",
        body:
          "<p>Em <b>Ray Casting</b>, para cada <b>pixel</b> do plano de visualização lançamos um " +
          "<b>raio a partir da câmera/observador</b>, atravessando aquele pixel rumo à cena. É uma " +
          "abordagem <b><i>image-order</i></b> (\"ordem da imagem\"): o laço externo percorre os " +
          "<b>pixels</b>, e para cada um pergunta-se \"o que eu vejo aqui?\".</p>" +
          "<p>O contraste é a <b><i>object-order</i></b> da rasterização, que percorre os " +
          "<b>objetos</b> e os <b>projeta</b> na tela. Ray casting inverte o sentido: vai da tela " +
          "para a cena.</p>" +
          "<p>Por que começar pela câmera? Os próximos passos mostram as três razões.</p>",
        visual: svgStep("all"),
      }),
      {
        title: "Câmera e plano de visualização",
        body:
          "<p>O <b>plano de visualização</b> é a própria <b>grade de pixels</b> da imagem, " +
          "posicionada à frente da <span class='accent'>câmera</span> (a uma distância focal d).</p>" +
          "<p>Cada pixel (i, j) corresponde a um <b>ponto 3D</b> nesse plano. O raio daquele pixel " +
          "fica definido por sua origem e direção:</p>" +
          "<div class='formula'>P(t) = O + t · D ,   t &gt; 0</div>" +
          "<p>onde <b>O</b> é o olho e <b>D</b> = (ponto_do_pixel − O), normalizado. Cada pixel é, " +
          "então, uma \"janela\" — uma <b>linha de visão</b> — por onde olhamos a cena.</p>",
        visual: svgStep(["scene", "cam"]),
      },
      {
        title: "1) Projeção correta — um raio por pixel",
        body:
          "<p>Disparamos <b>um raio por pixel</b>, saindo do olho e passando pelo centro do " +
          "pixel. Assim cada pixel corresponde exatamente à <b>linha de visão</b> daquele ponto " +
          "da imagem.</p>" +
          "<p>É a projeção que o <b>observador realmente vê</b> (abordagem <i>image-order</i>: do " +
          "olho para a cena).</p>",
        visual: svgStep(["scene", "cam", "rays"]),
      },
      {
        title: "2) Visibilidade — o primeiro objeto atingido",
        body:
          "<p>Testamos o raio contra os objetos e ficamos com a <b>interseção de menor t &gt; 0</b> " +
          "(a mais próxima do olho). Esse é o objeto <b>visível</b> naquele pixel — as superfícies " +
          "atrás têm t maior e ficam <b>ocultas</b> automaticamente.</p>" +
          "<p>Ou seja, o problema da <b>remoção de superfícies escondidas</b> sai \"de graça\" — basta " +
          "guardar o menor t. Na rasterização (object-order) isso exige uma estrutura extra, o " +
          "<b>z-buffer</b>. Aqui, a própria ordem do raio resolve. A cor do objeto atingido é " +
          "gravada no pixel.</p>",
        visual: svgStep(["scene", "cam", "rays", "hit"]),
      },
      S.concept({
        title: "3) Eficiência — só processa o que é visível",
        body:
          "<p>Partindo da câmera, a iluminação (cara) é calculada <b>só para o ponto que chega ao " +
          "olho</b> em cada pixel. Não se gasta tempo sombreando superfícies que nunca apareceriam.</p>" +
          "<p>Em resumo, calcular a partir da câmera garante: " +
          "<span class='accent'>(1)</span> a projeção correta da imagem vista, " +
          "<span class='accent'>(2)</span> a resolução natural da visibilidade e " +
          "<span class='accent'>(3)</span> eficiência ao sombrear apenas o visível.</p>" +
          "<p class='muted'>A partir do ponto visível, lançar <b>raios secundários</b> (para a luz → " +
          "sombras; espelhados → reflexões; refratados) é o que transforma o ray casting em " +
          "<b>ray tracing</b> recursivo.</p>",
        visual: svgStep("all"),
      }),
      S.comparison({
        title: "Resumo: image-order × object-order",
        intro: "<p>Ray casting parte do olho (image-order); a rasterização parte dos objetos.</p>",
        headers: ["", "Ray Casting (image-order)", "Rasterização (object-order)"],
        rows: [
          ["Laço externo", "Por pixel", "Por objeto/triângulo"],
          ["Sentido", "Da tela → cena", "Da cena → tela"],
          ["Visibilidade", "Menor t do raio (natural)", "Z-buffer (estrutura extra)"],
          ["Sombras/reflexos", "Naturais (raios secundários)", "Exigem técnicas adicionais"],
          ["Forte em", "Realismo, efeitos globais", "Velocidade, tempo real (GPU)"],
        ],
      }),
    ];
  }

  EX.registry.add({
    id: "q05-raycasting-camera",
    num: "5",
    subject: "Computação Gráfica — Lista 3",
    section: "II) Iluminação e Ray Casting",
    title: "Ray Casting a partir da câmera",
    type: "conceitual",
    tags: ["ray casting", "câmera", "visibilidade"],
    hubDesc: "Um raio por pixel a partir do olho: projeção, visibilidade e eficiência.",
    statement:
      "Explique o porquê de calcular os valores dos pixels do plano de visualização a partir " +
      "da <strong>posição da câmera/observador</strong> em Ray Casting.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
