/*
 * g17-ray-casting.js — Guia: Ray Casting.
 * Um raio por pixel, do observador através do plano de visualização; o primeiro
 * objeto atingido é o visível. A semirreta P(t)=O+t·d, a interseção raio-esfera
 * (uma equação quadrática), a comparação ordem-imagem × ordem-objeto e o caminho
 * para o ray tracing. Otimizações por volumes envolventes e estruturas espaciais.
 *
 * Visual: SVG (svg.line/circle/ellipse/rect/arrow/text).
 */
(function () {
  "use strict";
  var EX = window.EX;

  // Geometria recentrada num view 600x360: o olho fica no meio vertical (y=180)
  // e os raios extremos (pixels 120 e 240) cabem com folga até x≈far.
  var VIEW = [600, 360];
  var EYE = [60, 180];
  var PX = 230; // x do plano de visualização (longe o bastante p/ o leque ser suave)
  var PYS = [120, 150, 180, 210, 240]; // centros dos pixels (simétricos em torno de 180)
  var S1 = [440, 160], R1 = 58; // esfera próxima
  var S2 = [480, 250], R2 = 38; // esfera distante
  var FAR = 525; // raios param logo depois das esferas — não disparam até o infinito

  function camera(svg) {
    svg.ellipse(EYE[0], EYE[1], 22, 15, { fill: "var(--bg-soft)", stroke: "var(--ink-dim)", strokeWidth: 2 });
    svg.circle(EYE[0], EYE[1], 7, { fill: "var(--ink)" });
    svg.text(EYE[0], EYE[1] + 32, "olho", { size: 12, color: "var(--ink-dim)", weight: 700 });
    PYS.forEach(function (py) {
      svg.rect(PX - 12, py - 16, 24, 32, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.3 });
    });
    svg.text(PX, 300, "plano de visualização", { size: 11, color: "var(--ink-dim)" });
  }
  function scene(svg) {
    svg.circle(S2[0], S2[1], R2, { fill: "var(--green-soft)", stroke: "var(--green)", strokeWidth: 2 });
    svg.circle(S1[0], S1[1], R1, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2 });
  }
  // raio do olho pelo pixel py, prolongado até x=far
  function rayTo(py, far) {
    var dx = PX - EYE[0], dy = py - EYE[1];
    var t = (far - EYE[0]) / dx;
    return [far, EYE[1] + dy * t];
  }

  function build() {
    return [
      {
        title: "O que cada pixel enxerga?",
        body:
          "<p>Ray Casting <b>inverte</b> a pergunta da projeção. Em vez de jogar os objetos na tela " +
          "(rasterização), para <b>cada pixel</b> lançamos um <b>raio</b> a partir do observador, " +
          "atravessando aquele pixel rumo à cena — e perguntamos <em>o que esse raio encontra primeiro</em>.</p>" +
          "<p>Pense num modelo de câmera <em>pinhole</em>: o olho é o furo, e o plano de visualização é o " +
          "filme. Cada quadradinho do filme é um pixel; a reta que sai do furo passando por ele define a " +
          "única direção do mundo que aquele pixel vê.</p>" +
          "<p>O <b>primeiro objeto atingido</b> ao longo do raio é o que o pixel mostra. A " +
          "<span class='hl'>visibilidade</span> — o que está na frente de quê — sai <b>de graça</b>, sem " +
          "z-buffer e sem ordenar nada.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            camera(svg);
            scene(svg);
          },
        },
      },
      {
        title: "Um raio por pixel: P(t) = O + t·d",
        body:
          "<p>O raio é uma <b>semirreta</b> parametrizada: parte do olho <code>O</code> e segue na " +
          "direção <code>d</code> que aponta do olho para o <em>centro do pixel</em>.</p>" +
          "<div class='formula'>P(t) = O + t·d ,   t ≥ 0\n" +
          "d = normaliza(pixel − O)</div>" +
          "<p>Cada valor de <code>t</code> é um ponto ao longo do raio: <code>t = 0</code> é o olho, e " +
          "<code>t</code> crescente avança para dentro da cena. Como <code>d</code> é unitário, " +
          "<code>t</code> mede a <b>distância</b> percorrida — o que torna trivial comparar interseções " +
          "(menor <code>t</code> = mais perto).</p>" +
          "<p>São tantos raios quantos pixels: numa tela 1920×1080 são mais de <b>dois milhões</b> de " +
          "raios, cada um percorrendo a cena à procura de interseções. O laço externo é " +
          "<span class='accent'>por pixel</span> — guarde isso, é o que diferencia esta técnica da " +
          "rasterização.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            PYS.forEach(function (py) {
              var e = rayTo(py, FAR);
              svg.line(EYE[0], EYE[1], e[0], e[1], { stroke: "var(--ink-mute)", strokeWidth: 1.3, dashed: "5 5" });
            });
            camera(svg);
            scene(svg);
          },
        },
      },
      {
        title: "Interseção raio–esfera: uma equação do 2º grau",
        body:
          "<p>Como achar onde o raio toca uma esfera? Substituímos o raio <code>P(t) = O + t·d</code> na " +
          "equação da esfera de centro <code>C</code> e raio <code>r</code>, <code>|P − C|² = r²</code>. " +
          "Escrevendo <code>e = O − C</code>:</p>" +
          "<div class='formula'>|O + t·d − C|² = r²\n" +
          "(d·d) t² + 2(e·d) t + (e·e − r²) = 0</div>" +
          "<p>É uma <b>quadrática em t</b>: <code>a = d·d</code> (vale 1 se <code>d</code> é unitário), " +
          "<code>b = 2(e·d)</code>, <code>c = e·e − r²</code>. O <b>discriminante</b> conta a história " +
          "geométrica:</p>" +
          "<ul>" +
          "<li><code>Δ &lt; 0</code> → o raio <span class='no'>erra</span> a esfera;</li>" +
          "<li><code>Δ = 0</code> → <b>tangencia</b> (raiz dupla);</li>" +
          "<li><code>Δ &gt; 0</code> → <span class='ok'>atravessa</span>: duas raízes (entrada e saída).</li>" +
          "</ul>" +
          "<p>Ficamos com a <b>menor raiz positiva</b> — a primeira casca atingida à frente do olho. " +
          "Para um <b>plano</b> <code>n·P = D</code> é ainda mais simples: cai num <code>t</code> linear, " +
          "<code>t = (D − n·O)/(n·d)</code>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            // raio que atravessa a esfera próxima, marcando as duas raízes t1<t2
            var py = 150;
            var dx = PX - EYE[0], dy = py - EYE[1];
            var len = Math.sqrt(dx * dx + dy * dy);
            var ux = dx / len, uy = dy / len;
            // resolve a quadrática contra S1
            var ex = EYE[0] - S1[0], ey = EYE[1] - S1[1];
            var b = 2 * (ex * ux + ey * uy);
            var c = ex * ex + ey * ey - R1 * R1;
            var disc = Math.sqrt(b * b - 4 * c);
            var t1 = (-b - disc) / 2, t2 = (-b + disc) / 2;
            var far = rayTo(py, FAR);
            svg.line(EYE[0], EYE[1], far[0], far[1], { stroke: "var(--ink-mute)", strokeWidth: 1.2, dashed: "4 4" });
            camera(svg); scene(svg);
            var P1 = [EYE[0] + ux * t1, EYE[1] + uy * t1];
            var P2 = [EYE[0] + ux * t2, EYE[1] + uy * t2];
            svg.line(EYE[0], EYE[1], P1[0], P1[1], { stroke: "var(--yellow)", strokeWidth: 3 });
            svg.circle(P1[0], P1[1], 6, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(P2[0], P2[1], 5, { fill: "none", stroke: "var(--ink-dim)", strokeWidth: 2 });
            svg.text(P1[0] - 4, P1[1] - 16, "t₁ (entra)", { size: 11, color: "var(--yellow)", weight: 700, anchor: "end" });
            svg.text(P2[0] + 10, P2[1] + 18, "t₂ (sai)", { size: 11, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "A primeira interseção vence",
        body:
          "<p>Um raio pode cruzar <b>vários</b> objetos. Calculamos o <code>t &gt; 0</code> de cada " +
          "interseção e ficamos com o <b>menor</b> deles — o ponto mais próximo do olho.</p>" +
          "<p>É a versão contínua do <em>teste de profundidade</em>: tudo que estiver <b>atrás</b> desse " +
          "ponto fica automaticamente <b>ocultado</b>, porque tem <code>t</code> maior. Sem z-buffer, sem " +
          "ordenar polígonos — a ordenação por profundidade é só um <code>min</code> sobre os " +
          "<code>t</code>.</p>" +
          "<p>Repare na exigência <code>t &gt; 0</code>: interseções com <code>t &lt; 0</code> estão " +
          "<em>atrás</em> do olho e são descartadas. Uma pequena tolerância (<code>t &gt; ε</code>) também " +
          "evita o raio “re-acertar” a própria superfície de onde partiu — armadilha que reaparece em " +
          "sombras no ray tracing.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            var hit = [S1[0] - R1, 160];
            var beyond = rayTo(160, FAR);
            svg.line(EYE[0], EYE[1], beyond[0], beyond[1], { stroke: "var(--ink-mute)", strokeWidth: 1.2, dashed: "4 4" });
            svg.line(EYE[0], EYE[1], hit[0], hit[1], { stroke: "var(--yellow)", strokeWidth: 3 });
            camera(svg); scene(svg);
            svg.circle(hit[0], hit[1], 6, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(hit[0] - 6, hit[1] - 16, "1ª interseção", { size: 11, color: "var(--yellow)", weight: 700, anchor: "end" });
          },
        },
      },
      {
        title: "Otimizações: não testar tudo",
        body:
          "<p>O custo bruto é <b>nº de raios × nº de objetos</b> — dois milhões de raios vezes milhares de " +
          "triângulos é proibitivo. Acelera-se podando testes que <em>não podem</em> acertar:</p>" +
          "<ul>" +
          "<li><b>Volumes envolventes</b> (caixas/esferas): se o raio nem toca a caixa que embrulha o " +
          "objeto, pula o objeto inteiro — um teste barato evita muitos caros;</li>" +
          "<li><b>Estruturas espaciais</b> (grade uniforme, <b>BVH</b>, octree, BSP): organizam a cena " +
          "para descartar <b>regiões inteiras</b> de uma vez, levando o custo de linear para perto de " +
          "<code>O(log n)</code> por raio — é o que torna o ray tracing viável;</li>" +
          "<li><b>Parada no 1º acerto</b>: quando só importa <em>se</em> há obstáculo (raio de sombra), " +
          "para na primeira interseção sem buscar a mais próxima.</li>" +
          "</ul>" +
          "<p>As estruturas espaciais são as mesmas dos guias de <em>octree</em> e <em>BSP</em> — aqui " +
          "elas servem à travessia de raios.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            svg.rect(S1[0] - R1 - 6, S1[1] - R1 - 6, 2 * R1 + 12, 2 * R1 + 12, { fill: "none", stroke: "var(--orange)", strokeWidth: 1.5, dashed: "6 4" });
            svg.text(S1[0], S1[1] - R1 - 14, "bounding box", { size: 11, color: "var(--orange)", weight: 700 });
            camera(svg); scene(svg);
          },
        },
      },
      {
        title: "Ordem-imagem × ordem-objeto",
        body:
          "<p>O contraste profundo com a rasterização não é “quem é mais bonito”, e sim <b>qual é o laço " +
          "externo</b>:</p>" +
          "<ul>" +
          "<li><b>Ray casting = ordem-imagem</b>: <code>para cada pixel { para cada objeto … }</code>. " +
          "Centrado no pixel — combina naturalmente com cenas definidas por equações (esferas, planos) e " +
          "com efeitos que precisam <em>seguir</em> a luz (sombra, reflexo).</li>" +
          "<li><b>Rasterização = ordem-objeto</b>: <code>para cada primitiva { para cada pixel coberto … " +
          "}</code>. Centrada no triângulo — projeta cada um e pinta os fragmentos, resolvendo " +
          "visibilidade com z-buffer. É o que a <b>GPU</b> faz, massivamente paralela e rapidíssima.</li>" +
          "</ul>" +
          "<p>Por isso jogos em tempo real nascem rasterizados, enquanto cinema e <em>path tracing</em> " +
          "preferem a ordem-imagem. As GPUs modernas hoje fazem <b>os dois</b> (RT cores), borrando a " +
          "fronteira.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            // dois mini-laços lado a lado
            svg.rect(40, 70, 230, 220, { fill: "none", stroke: "var(--accent)", strokeWidth: 1.5, rx: 8 });
            svg.text(155, 92, "ordem-imagem", { size: 13, weight: 800, color: "var(--accent)" });
            svg.text(155, 130, "para cada PIXEL:", { size: 12, color: "var(--ink)", mono: true });
            svg.text(155, 156, "  para cada objeto", { size: 12, color: "var(--ink-dim)", mono: true });
            svg.text(155, 178, "  acha t mínimo", { size: 12, color: "var(--ink-dim)", mono: true });
            svg.text(155, 232, "raio → cena", { size: 12, color: "var(--accent)", weight: 700 });
            svg.rect(330, 70, 230, 220, { fill: "none", stroke: "var(--green)", strokeWidth: 1.5, rx: 8 });
            svg.text(445, 92, "ordem-objeto", { size: 13, weight: 800, color: "var(--green)" });
            svg.text(445, 130, "para cada OBJETO:", { size: 12, color: "var(--ink)", mono: true });
            svg.text(445, 156, "  para cada pixel", { size: 12, color: "var(--ink-dim)", mono: true });
            svg.text(445, 178, "  z-buffer decide", { size: 12, color: "var(--ink-dim)", mono: true });
            svg.text(445, 232, "cena → tela (GPU)", { size: 12, color: "var(--green)", weight: 700 });
          },
        },
      },
      {
        title: "De ray casting a ray tracing",
        body:
          "<p>Ray casting puro encontra a superfície visível e a colore com um modelo de iluminação " +
          "<b>local</b> (ver <em>Phong</em>). O salto para o <b>ray tracing</b> é simples e poderoso: do " +
          "ponto de interseção, <b>lance mais raios</b>.</p>" +
          "<ul>" +
          "<li><b>Raio de sombra</b> → vai do ponto até cada luz; se algo bloqueia (1º acerto basta), o " +
          "ponto está na sombra;</li>" +
          "<li><b>Raio de reflexão</b> → espelha a direção na normal (<code>R = d − 2(d·N)N</code>) e " +
          "segue, trazendo o que aparece no espelho;</li>" +
          "<li><b>Raio de refração</b> → atravessa o material curvando-se por Snell (vidro, água).</li>" +
          "</ul>" +
          "<p>Cada um desses raios secundários pode gerar outros — uma <b>recursão</b> que se aprofunda " +
          "até um limite. É a iluminação <b>global</b> que Phong não dá: sombras e reflexos “de verdade”.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(VIEW[0], VIEW[1]);
            var hit = [S1[0] - R1, 160];
            svg.line(EYE[0], EYE[1], hit[0], hit[1], { stroke: "var(--yellow)", strokeWidth: 2.5 });
            camera(svg); scene(svg);
            svg.circle(hit[0], hit[1], 6, { fill: "var(--yellow)", stroke: "var(--ink)", strokeWidth: 1.5 });
            // raio de sombra (até uma luz no alto) e raio de reflexão
            var light = [300, 50];
            svg.arrow(hit[0], hit[1], light[0], light[1], { color: "var(--orange)", strokeWidth: 1.8, head: 8, dashed: "5 4" });
            svg.text(light[0] + 8, light[1], "sombra → luz", { size: 11, color: "var(--orange)", weight: 700, anchor: "start" });
            svg.circle(light[0], light[1], 8, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2 });
            svg.arrow(hit[0], hit[1], hit[0] - 70, hit[1] + 70, { color: "var(--purple)", strokeWidth: 1.8, head: 8 });
            svg.text(hit[0] - 70, hit[1] + 84, "reflexão", { size: 11, color: "var(--purple)", weight: 700 });
          },
        },
      },
      {
        title: "Comparação e resumo",
        body: "<p>Ray Casting × rasterização — duas ordens de processar a cena:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Ray Casting", "Rasterização"],
              rows: [
                ["Laço externo", "por pixel (image-order)", "por primitiva (object-order)"],
                ["Visibilidade", "menor t (natural)", "z-buffer"],
                ["Sombras/reflexos", "fáceis (lançar mais raios)", "exigem truques"],
                ["Geometria nativa", "esferas, planos, quádricas", "triângulos"],
                ["Custo", "maior por pixel", "muito rápido em GPU"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Um raio <code>P(t)=O+t·d</code> por pixel; resolva a interseção (esfera → quadrática, " +
                "plano → linear) e fique com o <b>menor t &gt; 0</b>. É a base do <b>ray tracing</b>, que " +
                "continua lançando raios para sombra, reflexo e refração.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g17-ray-casting",
    num: "⟶",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Ray Casting",
    type: "conceitual",
    tags: ["ray casting", "visibilidade", "renderização", "interseção"],
    hubDesc: "Um raio por pixel do observador; P(t)=O+t·d; interseção raio-esfera (quadrática); menor t vence; ordem-imagem × ordem-objeto.",
    statement:
      "Entenda o Ray Casting: o cálculo de um raio P(t)=O+t·d por pixel a partir do observador, a " +
      "interseção raio-esfera (equação do 2º grau) e raio-plano, a primeira interseção (menor t) como " +
      "superfície visível, otimizações por volumes envolventes e estruturas espaciais, o contraste " +
      "ordem-imagem × ordem-objeto e o caminho para o ray tracing.",
    parts: [{ label: "Guia", build: build }],
  });
})();
