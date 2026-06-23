/*
 * g18-phong.js — Guia: modelo de iluminação de Phong.
 * Componentes ambiente, difusa (N·L) e especular (R·V)^n; os vetores N, L, R, V,
 * a derivação do vetor de reflexão R = 2(N·L)N − L, a variante Blinn-Phong com o
 * meio-vetor H, e a distinção entre iluminação local e global.
 *
 * Visual: SVG (svg.arrow/line/circle/polyline/text).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var P = [300, 260];
  var Nend = [300, 150], Lend = [190, 162], Rend = [410, 162], Vend = [462, 196];
  var LIGHT = [176, 146], EYEp = [478, 182];

  function ang(end) { return Math.atan2(end[1] - P[1], end[0] - P[0]); }
  function arcPoly(svg, a0, a1, r, color) {
    var pts = [];
    for (var i = 0; i <= 10; i++) {
      var a = a0 + (a1 - a0) * i / 10;
      pts.push([P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)]);
    }
    svg.polyline(pts, { stroke: color, strokeWidth: 2 });
  }
  function surface(svg) {
    svg.line(120, P[1], 480, P[1], { stroke: "var(--ink)", strokeWidth: 2.5 });
    for (var x = 130; x < 480; x += 22)
      svg.line(x, P[1], x - 10, P[1] + 12, { stroke: "var(--ink-mute)", strokeWidth: 1 });
    svg.circle(P[0], P[1], 4, { fill: "var(--ink)" });
  }
  function vec(svg, end, color, label, op, dashed) {
    svg.arrow(P[0], P[1], end[0], end[1], { color: color, strokeWidth: 3, head: 11, opacity: op, dashed: dashed });
    svg.text(end[0] + (end[0] < P[0] ? -12 : 12), end[1] - 6, label, { size: 14, weight: 800, color: color, opacity: op });
  }

  function build() {
    return [
      {
        title: "A cor de um ponto, em três parcelas",
        body:
          "<p>De onde vem a cor que vemos num ponto da superfície? Da luz que <em>sai</em> dele em direção " +
          "ao olho. Modelar isso fisicamente de verdade é caríssimo, então Phong (1975) propõe um " +
          "<b>atalho barato e convincente</b>: somar três efeitos.</p>" +
          "<ul><li><b>ambiente</b> — preenchimento de fundo, constante;</li>" +
          "<li><b>difusa</b> — o “corpo” da cor; depende de onde está a <b>luz</b>;</li>" +
          "<li><b>especular</b> — o brilho (highlight); depende de onde está o <b>observador</b>.</li></ul>" +
          "<p>Quatro vetores <b>unitários</b> no ponto contam a história, e quase tudo no modelo será um " +
          "<b>produto escalar</b> entre eles (que mede o cosseno do ângulo): " +
          "<span class='accent'>N</span> (normal à superfície), <span class='hl'>L</span> (aponta para a " +
          "luz), <span class='orange'>R</span> (reflexo de L em torno de N) e <b>V</b> (aponta para o " +
          "observador).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            svg.circle(LIGHT[0], LIGHT[1], 11, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2 });
            svg.ellipse(EYEp[0], EYEp[1], 16, 11, { fill: "var(--bg-soft)", stroke: "var(--green)", strokeWidth: 1.5 });
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
          },
        },
      },
      {
        title: "Ambiente: k_a · I_a",
        body:
          "<p>Uma parcela <b>constante</b>, igual em todo ponto, que simula a luz que já “ricocheteou” " +
          "muitas vezes pelo ambiente e chega de todos os lados sem direção preferida.</p>" +
          "<p><b>Por que existe?</b> Um modelo local só enxerga a luz que vem direto da fonte. Sem o termo " +
          "ambiente, todo ponto que não recebe luz direta ficaria <span class='no'>preto absoluto</span> " +
          "— irreal, porque no mundo as paredes, o chão e o céu reiluminam tudo. O ambiente é uma " +
          "<b>aproximação grosseira</b> dessa iluminação global (que Phong não calcula de verdade).</p>" +
          "<div class='formula'>I_ambiente = k_a · I_a</div>" +
          "<p><code>I_a</code> é a intensidade ambiente da cena; <code>k_a ∈ [0,1]</code> é quanto o " +
          "material reflete dela. É o <em>piso</em> de luminosidade — suba demais e a cena fica “lavada”, " +
          "sem contraste.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            for (var a = 0; a < Math.PI; a += Math.PI / 8)
              svg.arrow(P[0] + 70 * Math.cos(a + Math.PI), P[1] - 70 * Math.sin(a) - 0, P[0] + 30 * Math.cos(a + Math.PI), P[1] - 30 * Math.sin(a), { color: "var(--ink-mute)", strokeWidth: 1.2, head: 5 });
            svg.circle(P[0], P[1], 5, { fill: "var(--ink-dim)" });
            svg.text(P[0], 150, "vem de todos os lados", { size: 12, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Difusa: k_d · I_L · (N · L)",
        body:
          "<p>É a lei de <b>Lambert</b>, e o porquê é físico: uma superfície fosca espalha a luz " +
          "<em>igualmente</em> em todas as direções, então o brilho não depende de para onde olhamos — só " +
          "de <b>quanta luz a superfície coleta</b>. E ela coleta de acordo com o ângulo de incidência.</p>" +
          "<p>Pense num feixe de seção fixa batendo na superfície: <b>de frente</b> ele se concentra numa " +
          "área pequena (claro); <b>rasante</b> ele se espalha sobre uma área grande (a mesma energia, " +
          "diluída → escuro). Essa diluição vale exatamente <code>cos θ</code>, e como N e L são " +
          "unitários:</p>" +
          "<div class='formula'>N · L = |N||L| cos θ = cos θ</div>" +
          "<ul><li>luz <b>de frente</b> (θ = 0) → N·L = 1 → máximo;</li>" +
          "<li>luz a <b>45°</b> → N·L ≈ 0,71;</li>" +
          "<li>luz <b>rasante</b> (θ → 90°) → N·L → 0 → some.</li></ul>" +
          "<p>Por não depender de V, uma superfície fosca parece <b>igual de qualquer ângulo</b> — giz, " +
          "papel, parede de gesso.</p>" +
          "<div class='formula'>I_difusa = k_d · I_L · max(0, N · L)</div>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 0.18, "7 5");
            vec(svg, Vend, "var(--green)", "V", 0.18);
            arcPoly(svg, ang(Nend), ang(Lend), 48, "var(--yellow)");
            svg.text(250, 196, "θ", { size: 15, weight: 800, color: "var(--yellow)" });
          },
        },
      },
      {
        title: "O vetor de reflexão R = 2(N·L)N − L",
        body:
          "<p>Antes do brilho, precisamos de <code>R</code>: a direção em que <code>L</code> seria " +
          "refletida por um espelho perfeito alinhado à superfície. De onde sai a fórmula?</p>" +
          "<p>Decomponha <code>L</code> em duas partes: uma <b>ao longo da normal</b> e outra " +
          "<b>tangente</b> à superfície. A projeção de <code>L</code> sobre <code>N</code> (unitário) é " +
          "<code>(N·L)N</code>. Refletir significa <b>manter a parte tangente</b> e <b>inverter a parte " +
          "normal</b>:</p>" +
          "<div class='formula'>L = (N·L)N + L_tangente\n" +
          "R = (N·L)N − L_tangente\n" +
          "subtraindo:  R = 2(N·L)N − L</div>" +
          "<p>Intuição: <code>2(N·L)N</code> é “duas vezes a sombra de L na normal”; tirar <code>L</code> " +
          "espelha o vetor para o outro lado de <code>N</code>, com o mesmo ângulo. Note que <code>R</code> " +
          "e <code>L</code> fazem ângulos iguais com <code>N</code> — é a lei da reflexão.</p>" +
          "<p>(A reflexão de um raio que <em>chega</em>, usada no ray tracing, troca o sinal: " +
          "<code>R = d − 2(d·N)N</code>. Mesmo princípio, direção oposta de L.)</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            // ângulos iguais L^N e N^R
            arcPoly(svg, ang(Nend), ang(Lend), 40, "var(--yellow)");
            arcPoly(svg, ang(Rend), ang(Nend), 40, "var(--orange)");
            svg.text(262, 200, "θ", { size: 13, weight: 800, color: "var(--yellow)" });
            svg.text(338, 200, "θ", { size: 13, weight: 800, color: "var(--orange)" });
          },
        },
      },
      {
        title: "Especular: k_s · I_L · (R · V)ⁿ",
        body:
          "<p>É o <b>brilho</b> (highlight) — o reflexo da fonte de luz na superfície polida. Quanto mais a " +
          "direção refletida <code>R</code> aponta para o observador <code>V</code>, mais forte o brilho. " +
          "Medimos isso com <code>R·V = cos α</code>:</p>" +
          "<div class='formula'>I_especular = k_s · I_L · max(0, R · V)ⁿ</div>" +
          "<p>O expoente <b>n</b> (brilho/<em>shininess</em>) controla o <b>tamanho</b> do realce: como " +
          "elevamos um número entre 0 e 1 a uma potência, <code>n</code> alto faz o termo despencar a " +
          "menos que <code>R·V</code> esteja muito perto de 1 → brilho <b>pequeno e duro</b> (metal, " +
          "plástico polido). <code>n</code> baixo → brilho <b>amplo e suave</b> (superfície semifosca).</p>" +
          "<p><b>Mini-conta:</b> com <code>α = 20°</code>, <code>cos α ≈ 0,94</code>. Em <code>n = 5</code>: " +
          "0,94⁵ ≈ <span class='ok'>0,73</span> (realce largo). Em <code>n = 100</code>: 0,94¹⁰⁰ ≈ " +
          "<span class='no'>0,002</span> (quase apagado a 20° — o ponto de luz é minúsculo).</p>" +
          "<p>Diferente da difusa, a especular <b>depende do observador</b> — por isso o brilho “anda” na " +
          "superfície quando você muda de ângulo, e a difusa não.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            vec(svg, Nend, "var(--accent)", "N", 0.25);
            vec(svg, Lend, "var(--yellow)", "L", 0.25);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
            arcPoly(svg, ang(Rend), ang(Vend), 64, "var(--green)");
            svg.text(404, 196, "α", { size: 15, weight: 800, color: "var(--green)" });
          },
        },
      },
      {
        title: "Blinn-Phong: o meio-vetor H",
        body:
          "<p>Calcular <code>R</code> a cada pixel custa. Jim Blinn (1977) propôs uma variante mais barata " +
          "que virou padrão (é o que o OpenGL antigo usava): em vez de <code>R·V</code>, use o " +
          "<b>meio-vetor</b> <code>H</code>, a bissetriz entre <code>L</code> e <code>V</code>:</p>" +
          "<div class='formula'>H = (L + V) / |L + V|\n" +
          "I_especular = k_s · I_L · max(0, N · H)ⁿ′</div>" +
          "<p>A ideia: o brilho é máximo quando a superfície está orientada para refletir L direto em V — " +
          "isto é, quando <b>N coincide com H</b>. Então <code>N·H</code> mede o “quão bem alinhado para " +
          "brilhar”, sem precisar construir <code>R</code>.</p>" +
          "<p>Não é idêntico a <code>R·V</code> (o ângulo <code>N^H</code> é cerca de <b>metade</b> de " +
          "<code>R^V</code>), então usa-se um expoente <code>n′</code> maior — na prática, " +
          "<code>n′ ≈ 4n</code> dá realces parecidos. Em troca, Blinn-Phong é mais estável e até mais " +
          "fiel em ângulos rasantes.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            // H = bissetriz de L e V (desenhado a partir de P)
            function unit(end) { var dx = end[0] - P[0], dy = end[1] - P[1], m = Math.sqrt(dx * dx + dy * dy); return [dx / m, dy / m]; }
            var uL = unit(Lend), uV = unit(Vend);
            var hx = uL[0] + uV[0], hy = uL[1] + uV[1];
            var hm = Math.sqrt(hx * hx + hy * hy);
            var Hend = [P[0] + (hx / hm) * 118, P[1] + (hy / hm) * 118];
            vec(svg, Nend, "var(--accent)", "N", 0.5);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Vend, "var(--green)", "V", 1);
            vec(svg, Hend, "var(--purple)", "H", 1, "7 5");
            arcPoly(svg, ang(Nend), ang(Hend), 46, "var(--purple)");
            svg.text(286, 196, "N^H", { size: 12, weight: 800, color: "var(--purple)" });
          },
        },
      },
      {
        title: "A soma (sobre todas as luzes)",
        body:
          "<p>Juntando tudo, com uma parcela difusa+especular por <b>fonte de luz</b> e <b>uma só</b> " +
          "parcela ambiente para a cena:</p>" +
          "<div class='formula'>I = k_a·I_a  +  Σ_luzes [ k_d·I_L·max(0,N·L) + k_s·I_L·max(0,R·V)ⁿ ]</div>" +
          "<p>Os coeficientes <code>k_a, k_d, k_s</code> são propriedades do <b>material</b> (e em geral " +
          "há um por canal R, G, B → daí a cor); <code>n</code> é o brilho. O <code>max(0,·)</code> não é " +
          "detalhe: produtos escalares negativos significam que a luz vem <b>por trás</b> da superfície — " +
          "zeramos para não “iluminar o verso” nem subtrair luz.</p>" +
          "<p>Avaliada uma vez por ponto, essa soma é o que o sombreamento Flat/Gouraud/Phong " +
          "(ver guia seguinte) aplica em granularidades diferentes.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(600, 340);
            surface(svg);
            svg.circle(LIGHT[0], LIGHT[1], 11, { fill: "var(--yellow)", stroke: "var(--orange)", strokeWidth: 2 });
            vec(svg, Nend, "var(--accent)", "N", 1);
            vec(svg, Lend, "var(--yellow)", "L", 1);
            vec(svg, Rend, "var(--orange)", "R", 1, "7 5");
            vec(svg, Vend, "var(--green)", "V", 1);
          },
        },
      },
      {
        title: "Local × global",
        body:
          "<p>Phong é um modelo de iluminação <b>local</b>: para colorir um ponto, olha apenas a luz que " +
          "chega <b>direto</b> das fontes, mais o termo ambiente fixo. Ele <b>ignora</b> o resto da " +
          "cena — por isso é barato (O(1) por ponto por luz) e roda em tempo real.</p>" +
          "<p>O preço: nada que dependa do <em>caminho</em> da luz pela cena aparece sozinho. Sombras, " +
          "reflexos em espelho e sangramento de cor entre paredes exigem <b>iluminação global</b> " +
          "(ray/path tracing, radiosidade) — ou os truques aproximados de tempo real (shadow maps, " +
          "ambient occlusion).</p>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.table(host, {
              headers: ["", "Phong (local)", "Global"],
              rows: [
                ["Luz considerada", "direta + ambiente fake", "inter-reflexões reais"],
                ["Sombras", "não (sem mais cálculo)", "sim"],
                ["Sangramento de cor", "não", "sim (radiosidade)"],
                ["Custo", "barato (por ponto)", "caro"],
              ],
            });
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Cor = <b>ambiente + difusa(N·L) + especular(R·V)ⁿ</b>, somada por luz. É " +
                "<b>local</b>: olha só a luz direta; o resto entra como o termo ambiente. Reflexões/sombras " +
                "“de verdade” pedem ray tracing.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g18-phong",
    num: "I",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Modelo de iluminação de Phong",
    type: "conceitual",
    tags: ["iluminação", "phong", "especular", "blinn-phong"],
    hubDesc: "Ambiente + difusa (N·L) + especular (R·V)ⁿ; derivação de R=2(N·L)N−L, variante Blinn-Phong (N·H); e por que é iluminação local.",
    statement:
      "Entenda o modelo de iluminação de Phong: o cálculo das componentes ambiente, difusa (Lambert N·L) " +
      "e especular (R·V)ⁿ, o papel dos vetores N, L, R, V, a derivação do vetor de reflexão " +
      "R=2(N·L)N−L, a variante Blinn-Phong com o meio-vetor H, e a distinção em relação à iluminação global.",
    parts: [{ label: "Guia", build: build }],
  });
})();
