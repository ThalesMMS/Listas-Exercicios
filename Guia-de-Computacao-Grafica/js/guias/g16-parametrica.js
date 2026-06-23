/*
 * g16-parametrica.js — Guia: curvas paramétricas interpoladas.
 * Por que descrever a curva como P(u) = (x(u), y(u)) em vez de y = f(x); a
 * tangente como derivada; e como obter x(u), y(u) a partir dos pontos de
 * controle de modo que a curva PASSE por eles em u = 0, ⅓, ⅔, 1. Foco no
 * porquê da forma paramétrica e da matriz de interpolação.
 *
 * Exemplo e coeficientes reaproveitados da Lista 2 (q12). Visual: plane + mat().
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var MAT = EX.Guia.mat, ROW = EX.Guia.row, DOM = EX.Guia.dom;

  var P = [[1, 2], [3, 4], [4, 2], [7, 5]]; // p0..p3
  var NAMES = ["p₀", "p₁", "p₂", "p₃"];
  var CX = [13.5, -18, 10.5, 1]; // x(u) = 13,5u³ − 18u² + 10,5u + 1
  var CY = [40.5, -58.5, 21, 2]; // y(u) = 40,5u³ − 58,5u² + 21u + 2
  var B = [-1, 8, 0, 6];

  function cubic(c, u) { return ((c[0] * u + c[1]) * u + c[2]) * u + c[3]; }
  function at(u) { return [cubic(CX, u), cubic(CY, u)]; }
  // Derivada do cúbico (tangente): 3a u² + 2b u + c.
  function dcubic(c, u) { return (3 * c[0] * u + 2 * c[1]) * u + c[2]; }
  function tangent(u) { return [dcubic(CX, u), dcubic(CY, u)]; }

  var MI = MAT([
    ["−9/2", "27/2", "−27/2", "9/2"],
    ["9", "−45/2", "18", "−9/2"],
    ["−11/2", "9", "−9/2", "1"],
    ["1", "0", "0", "0"],
  ]);

  function drawControls(plane, withCurve) {
    plane.polyline(P, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
    P.forEach(function (p, i) {
      plane.point(p[0], p[1], {
        color: withCurve ? COL.yellow : COL.accent,
        radius: 5,
        label: NAMES[i] + "(" + p[0] + "," + p[1] + ")",
        labelColor: COL.ink,
      });
    });
  }
  function drawCurve(plane) {
    var pts = [];
    for (var u = 0; u <= 1.0001; u += 0.02) pts.push(at(u));
    plane.polyline(pts, { stroke: COL.accent, lineWidth: 3 });
    [0, 1 / 3, 2 / 3, 1].forEach(function (u) {
      var p = at(u);
      plane.point(p[0], p[1], { color: COL.green, radius: 4 });
    });
  }

  function build() {
    return [
      {
        title: "Uma curva que passa pelos pontos",
        body:
          "<p>Dados 4 pontos de controle, queremos uma curva <b>suave</b> que <b>passe por todos</b> " +
          "eles — diferente da Bézier, que só toca os extremos e é “puxada” pelos do meio.</p>" +
          "<p>Descrevemos a curva por duas funções de um único parâmetro: <code>x(u)</code> e " +
          "<code>y(u)</code>, com <code>u ∈ [0, 1]</code>. Pense em <code>u</code> como o <b>tempo</b>: " +
          "um ponto sai de <span class='accent'>p₀</span> em <code>u = 0</code> e chega a " +
          "<span class='accent'>p₃</span> em <code>u = 1</code>, varrendo a curva pelo caminho.</p>" +
          "<p>O ponto que se move é <code>P(u) = (x(u), y(u))</code>. Esse é o coração da " +
          "<b>representação paramétrica</b> — e o próximo passo mostra por que ela é tão melhor que a " +
          "velha <code>y = f(x)</code>.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, false); },
        },
      },
      {
        title: "Por que paramétrica e não y = f(x)",
        body:
          "<p>A forma <code>y = f(x)</code> amarra um único <code>y</code> a cada <code>x</code>. Isso " +
          "<span class='hl'>quebra</span> em três situações comuns em CG:</p>" +
          "<ul>" +
          "<li><b>Curva multivalorada</b>: se a curva volta sobre si (dois <code>y</code> para o mesmo " +
          "<code>x</code>), <code>f</code> nem é função.</li>" +
          "<li><b>Tangente vertical</b>: onde a curva sobe na vertical, a inclinação " +
          "<code>dy/dx → ∞</code> — impossível de representar.</li>" +
          "<li><b>Curva fechada</b> (círculo, elipse): nenhuma <code>y = f(x)</code> a desenha inteira.</li>" +
          "</ul>" +
          "<p>A saída é dar a <code>x</code> e <code>y</code> a sua <b>própria</b> função de um " +
          "parâmetro neutro <code>u</code>:</p>" +
          "<div class='formula'>P(u) = ( x(u), y(u) )</div>" +
          "<p>Agora <code>x</code> também é livre para subir, descer e repetir. Nada de tangente " +
          "infinita; nada de “um y por x”. O círculo, por exemplo, vira " +
          "<code>(cos u, sin u)</code> — limpo e completo (vemos isso no fim).</p>",
        visual: {
          type: "plane", bounds: [-1.4, 1.4, -1.4, 1.4],
          draw: function (plane) {
            // Círculo: impossível como y = f(x), trivial como (cos u, sin u).
            var pts = [];
            for (var u = 0; u <= 6.2832; u += 0.05) pts.push([Math.cos(u), Math.sin(u)]);
            plane.polyline(pts, { stroke: COL.accent, lineWidth: 2.5, closed: true });
            // Marca os dois y para x = 0,3: a falha de y = f(x).
            plane.point(0.3, Math.sqrt(1 - 0.09), { color: COL.red, radius: 4 });
            plane.point(0.3, -Math.sqrt(1 - 0.09), { color: COL.red, radius: 4 });
            plane.segment([0.3, -1.3], [0.3, 1.3], { color: COL.muted, dashed: true });
            plane.text(0.3, 1.25, "um x, dois y", { color: COL.red, dx: 6, align: "left" });
          },
        },
      },
      {
        title: "A condição de interpolação",
        body:
          "<p>Cada coordenada é um <b>polinômio cúbico</b> em u: <code>x(u) = a u³ + b u² + c u + d</code> " +
          "(idem y). São 4 incógnitas por coordenada — então precisamos de <b>4 condições</b>.</p>" +
          "<p>A escolha natural: impor que a curva <b>passe pelos pontos</b> em nós <b>igualmente " +
          "espaçados</b> <code>u = 0, ⅓, ⅔, 1</code>. Avaliar o cúbico em cada nó dá uma equação:</p>" +
          "<div class='formula'>x(0)  = d                       = x₀\n" +
          "x(⅓) = a/27 + b/9 + c/3 + d      = x₁\n" +
          "x(⅔) = 8a/27 + 4b/9 + 2c/3 + d   = x₂\n" +
          "x(1)  = a + b + c + d            = x₃</div>" +
          "<p>São 4 equações lineares nos coeficientes. Em forma matricial isso é " +
          "<code>U·[a b c d]ᵀ = [x₀ x₁ x₂ x₃]ᵀ</code>, onde <code>U</code> tem os " +
          "<code>uⁱ</code> dos nós. Invertendo <code>U</code> obtemos a <b>matriz de " +
          "interpolação</b> <code>M_I</code>, que devolve os coeficientes a partir dos pontos.</p>",
        visual: DOM(
          ROW("[a b c d]ₓ = M_I · [x₀ x₁ x₂ x₃]ᵀ") + ROW("M_I =&nbsp;" + MI)
        ),
      },
      {
        title: "Montando os coeficientes",
        body:
          "<p>Multiplicando <code>M_I</code> pelos valores de x dos pontos " +
          "<code>[1, 3, 4, 7]</code> (cada linha de <code>M_I</code> vira um coeficiente):</p>" +
          "<div class='formula'>u³: −9/2·1 + 27/2·3 − 27/2·4 + 9/2·7 = 27/2 = 13,5\n" +
          "u²: 9·1 − 45/2·3 + 18·4 − 9/2·7 = −18\n" +
          "u¹: −11/2·1 + 9·3 − 9/2·4 + 1·7 = 21/2 = 10,5\n" +
          "u⁰: 1·1 + 0·3 + 0·4 + 0·7 = 1</div>" +
          "<p>Note a última linha de <code>M_I</code>: <code>[1 0 0 0]</code>. Ela copia <code>x₀</code> " +
          "direto para <code>d</code> — afinal <code>x(0) = d</code> tem de valer <code>x₀</code>. " +
          "É um bom teste de sanidade da matriz.</p>" +
          "<p>O mesmo processo com os valores de y <code>[2, 4, 2, 5]</code> dá os coeficientes de " +
          "<code>y(u)</code>.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, false); },
        },
      },
      {
        title: "As funções x(u) e y(u)",
        body:
          "<div class='formula'>x(u) = 13,5u³ − 18u² + 10,5u + 1\n" +
          "y(u) = 40,5u³ − 58,5u² + 21u + 2</div>" +
          "<p>Pronto: um único par de polinômios descreve toda a curva. Para desenhar, é só varrer " +
          "<code>u</code> de 0 a 1 num passo pequeno e ligar os pontos <code>P(u)</code> por segmentos " +
          "— exatamente o que o visual ao lado faz com passo <code>0,02</code> (51 amostras).</p>" +
          "<p>Avaliar com <b>Horner</b> é o jeito eficiente: " +
          "<code>((a·u + b)·u + c)·u + d</code> usa só <b>3 multiplicações e 3 somas</b> por " +
          "coordenada, sem calcular potências. É o mesmo espírito incremental do " +
          "<span class='accent'>DDA</span> — trocar fórmula cara por contas baratas repetidas.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, true); drawCurve(plane); },
        },
      },
      {
        title: "A tangente é a derivada",
        body:
          "<p>Como <code>P(u)</code> é um ponto que se move com o “tempo” <code>u</code>, sua " +
          "<b>velocidade</b> é a derivada — e ela aponta na <b>direção da tangente</b>:</p>" +
          "<div class='formula'>P'(u) = ( x'(u), y'(u) )\n" +
          "x'(u) = 3a u² + 2b u + c   (idem y')</div>" +
          "<p>Aqui está a vantagem decisiva da forma paramétrica: a tangente é só " +
          "<code>(x'(u), y'(u))</code> — um <b>vetor</b> que nunca “estoura”, mesmo onde a curva sobe " +
          "na vertical. A inclinação clássica <code>dy/dx = y'(u)/x'(u)</code> é que iria ao infinito " +
          "quando <code>x'(u) = 0</code>; o vetor, não.</p>" +
          "<p>No exemplo, no nó inicial <code>u = 0</code> temos <code>P'(0) = (c_x, c_y) = (10,5, " +
          "21)</code> — a curva parte “para cima e para a direita”, na proporção 1:2. As setas verdes " +
          "mostram a tangente em alguns <code>u</code>.</p>" +
          "<p>Essa derivada é a mesma ferramenta que dá a <b>tangente nas pontas da Bézier</b> (ver o " +
          "guia <span class='accent'>Bézier</span>) e a velocidade ao animar ao longo de uma " +
          "trajetória.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) {
            drawControls(plane, true);
            var pts = [];
            for (var u = 0; u <= 1.0001; u += 0.02) pts.push(at(u));
            plane.polyline(pts, { stroke: COL.accent, lineWidth: 3 });
            // Setas de tangente (normalizadas para caber em bounds).
            [0, 1 / 3, 2 / 3, 1].forEach(function (u) {
              var p = at(u), d = tangent(u);
              var L = Math.sqrt(d[0] * d[0] + d[1] * d[1]) || 1;
              var s = 0.9 / L; // comprimento visual fixo
              plane.arrow(p, [p[0] + d[0] * s, p[1] + d[1] * s], { color: COL.green });
              plane.point(p[0], p[1], { color: COL.green, radius: 3 });
            });
          },
        },
      },
      {
        title: "Desenhando e conferindo",
        body:
          "<p>Os pontos verdes marcam os nós <code>u = 0, ⅓, ⅔, 1</code> — e eles caem <b>exatamente</b> " +
          "sobre os pontos de controle. Confira avaliando os polinômios:</p>" +
          "<div class='formula'>x(⅓) = 13,5·(1/27) − 18·(1/9) + 10,5·(1/3) + 1 = 3   → p₁ ✓\n" +
          "y(⅓) = 40,5·(1/27) − 58,5·(1/9) + 21·(1/3) + 2 = 4   → p₁ ✓</div>" +
          "<ul><li><code>x(⅔) = 4, y(⅔) = 2</code> → p₂ ✓</li>" +
          "<li><code>x(1) = 7, y(1) = 5</code> → p₃ ✓</li></ul>" +
          "<p>É a marca da interpolação: a curva <b>encosta</b> em cada ponto no seu nó. Entre os nós " +
          "ela faz o caminho mais suave que um cúbico permite — e é aí que mora o risco de " +
          "ondulação, no próximo passo.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) { drawControls(plane, true); drawCurve(plane); },
        },
      },
      {
        title: "Amostragem: uniforme vs adaptativa",
        body:
          "<p>Para rasterizar a curva nós a aproximamos por <b>segmentos de reta</b> entre amostras de " +
          "<code>u</code>. Quantas amostras?</p>" +
          "<ul>" +
          "<li><b>Uniforme</b>: passo fixo (<code>Δu = 0,02</code>). Simples, mas gasta amostras " +
          "demais nos trechos retos e de menos nas <b>curvas fechadas</b>, onde aparecem “quinas”.</li>" +
          "<li><b>Adaptativa</b>: subdivide só onde a curva entorta. Mede o “quão reto” é um trecho " +
          "(distância do ponto médio à corda) e divide se passar de uma tolerância.</li>" +
          "</ul>" +
          "<p>Um detalhe sutil: passo igual em <code>u</code> <span class='hl'>não</span> dá passo " +
          "igual em <b>comprimento de arco</b> — onde <code>|P'(u)|</code> é grande (curva “rápida”), " +
          "os pontos saem mais espaçados. Animações que precisam de velocidade constante fazem uma " +
          "<b>reparametrização por comprimento de arco</b> (achar <code>u(s)</code> tal que andar " +
          "<code>Δs</code> fixo cubra distância fixa). É o mesmo cuidado de velocidade do guia de " +
          "<span class='accent'>keyframing</span>.</p>",
        visual: {
          type: "plane", bounds: B,
          draw: function (plane) {
            drawControls(plane, true);
            // Mostra a amostragem grosseira (poucos pontos) vs a curva fina.
            var fine = [];
            for (var u = 0; u <= 1.0001; u += 0.02) fine.push(at(u));
            plane.polyline(fine, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
            var coarse = [];
            for (var k = 0; k <= 5; k++) coarse.push(at(k / 5));
            plane.polyline(coarse, { stroke: COL.accent, lineWidth: 2.5 });
            coarse.forEach(function (p) { plane.point(p[0], p[1], { color: COL.green, radius: 3 }); });
            plane.text(P[3][0], P[3][1], "6 amostras: já 'quina'", { color: COL.accent, dx: -4, dy: 14, align: "right" });
          },
        },
      },
      {
        title: "Outras curvas: círculo, elipse, Lissajous",
        body:
          "<p>O exemplo acima é uma curva <b>interpolada por polinômios</b>, mas o poder da forma " +
          "paramétrica vai muito além. Trocando <code>x(u)</code> e <code>y(u)</code> por outras " +
          "funções, descrevemos famílias inteiras:</p>" +
          "<ul>" +
          "<li><b>Círculo</b>: <code>P(t) = (r·cos t, r·sin t)</code>, <code>t ∈ [0, 2π]</code>.</li>" +
          "<li><b>Elipse</b>: <code>(a·cos t, b·sin t)</code> — raios diferentes em x e y.</li>" +
          "<li><b>Lissajous</b>: <code>(sin(a·t), sin(b·t))</code> — os laços dependem da razão " +
          "<code>a : b</code> (aqui 3:2).</li>" +
          "</ul>" +
          "<p>Nenhuma delas é <code>y = f(x)</code> (todas são fechadas e multivaloradas), e todas têm " +
          "tangente <code>P'(t)</code> bem definida em qualquer ponto — inclusive nos topos verticais. " +
          "É a mesma ideia que move a câmera por uma órbita ou anima um pêndulo.</p>",
        visual: {
          type: "plane", bounds: [-1.4, 1.4, -1.4, 1.4],
          draw: function (plane) {
            var el = [], li = [], t;
            for (t = 0; t <= 6.2832; t += 0.04) el.push([1.2 * Math.cos(t), 0.7 * Math.sin(t)]);
            plane.polyline(el, { stroke: COL.muted, lineWidth: 1.5, closed: true, dashed: true });
            for (t = 0; t <= 6.2832; t += 0.02) li.push([Math.sin(3 * t), Math.sin(2 * t)]);
            plane.polyline(li, { stroke: COL.accent, lineWidth: 2.5, closed: true });
            plane.text(0, -1.25, "elipse (tracejada) · Lissajous 3:2 (cheia)", { color: COL.ink, align: "center" });
          },
        },
      },
      {
        title: "Comparação e cuidados",
        body: "<p>Interpolada × Bézier — quando usar cada uma:</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Interpolada", "Bézier"],
              rows: [
                ["Passa pelos pontos?", "sim (todos)", "só pelos extremos"],
                ["Pontos do meio", "a curva os cruza", "atraem (casca convexa)"],
                ["Boa para", "encostar em dados", "design de formas"],
                ["Risco", "oscila/ondula com pontos ruins", "mais estável"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Descreva a curva como <b>P(u) = (x(u), y(u))</b> — um ponto que se move. Impor " +
                "“passar por p_i em u_i” vira um sistema linear; <b>M_I</b> resolve e entrega os " +
                "coeficientes de x(u), y(u). A tangente é a derivada <b>P'(u)</b>. Nós diferentes → outra M_I.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g16-parametrica",
    num: "x(u)",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Curvas paramétricas interpoladas",
    type: "computacional",
    tags: ["curvas", "paramétrica", "interpolação", "tangente"],
    hubDesc: "P(u)=(x(u),y(u)) e por que supera y=f(x); a tangente como derivada; x(u), y(u) via M_I passando por todos os pontos.",
    statement:
      "Entenda por que descrever uma curva como P(u) = (x(u), y(u)) supera y = f(x), como a tangente " +
      "é a derivada P'(u), e como obter x(u) e y(u) de uma curva paramétrica interpolada a partir dos " +
      "pontos de controle, de modo que a curva passe por eles nos nós u = 0, ⅓, ⅔, 1.",
    parts: [{ label: "Guia", build: build }],
  });
})();
