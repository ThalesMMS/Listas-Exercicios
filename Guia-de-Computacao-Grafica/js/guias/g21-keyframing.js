/*
 * g21-keyframing.js — Guia: key framing e in-betweening.
 * Quadros-chave (poses críticas) + geração automática dos quadros intermediários
 * por interpolação. Linear vs suavizado (timing). Derivação do lerp e do
 * smoothstep, splines de Catmull-Rom entre várias chaves e por que rotação
 * pede slerp/quatérnios em vez de interpolar ângulos de Euler.
 *
 * Visual: SVG (svg.circle/line/polyline/text). Exemplo: bola em arco (q16).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var X0 = 110, X1 = 600, BASE = 190, AMP = 96, TL = 300;
  function pos(t) { return [X0 + (X1 - X0) * t, BASE - AMP * Math.sin(Math.PI * t)]; }
  function ball(svg, t, solid) {
    var p = pos(t);
    svg.circle(p[0], p[1], solid ? 16 : 11, {
      fill: solid ? "var(--accent)" : "var(--accent-soft)",
      stroke: solid ? "var(--ink)" : "var(--accent)",
      strokeWidth: solid ? 2 : 1.5,
      dashed: solid ? null : "4 3",
    });
    svg.line(p[0], TL - 6, p[0], TL + 6, { stroke: solid ? "var(--accent)" : "var(--ink-mute)", strokeWidth: solid ? 3 : 1.5 });
  }
  function timeline(svg) {
    svg.line(X0, TL, X1, TL, { stroke: "var(--ink-mute)", strokeWidth: 2 });
    svg.text((X0 + X1) / 2, TL + 28, "tempo  t ∈ [0, 1]", { size: 12, color: "var(--ink-dim)" });
  }
  // smoothstep: easing suave (usado no passo de timing e no de easing).
  function smooth(t) { return t * t * (3 - 2 * t); }

  function build() {
    return [
      {
        title: "Desenhar só os momentos-chave",
        body:
          "<p>Animar é exibir muitos quadros por segundo — tipicamente <b>24, 30 ou 60</b>. Um segundo de " +
          "animação a 24 fps já são 24 desenhos; desenhar todos à mão é inviável e, pior, propenso a " +
          "tremores (a mão nunca repete a pose exata).</p>" +
          "<p>A solução vem da animação tradicional: o animador sênior desenha só os <b>quadros-chave</b> " +
          "(<em>key frames</em> — as poses que <span class='hl'>contam a história</span>: começo, fim, " +
          "extremos do movimento, pontos de impacto) e um assistente preenche os <b>intermediários</b> " +
          "(<em>in-betweens</em>). No computador, o assistente é um <b>algoritmo de interpolação</b>: ele " +
          "nunca se cansa e nunca treme.</p>" +
          "<p>Pense no atributo como um número que varia no tempo. Aqui, dois key frames: a bola em " +
          "<code>t = 0</code> (esquerda) e em <code>t = 1</code> (direita). O <code>t</code> é o tempo " +
          "<b>normalizado</b> entre as duas chaves — sempre em <code>[0, 1]</code>, independentemente de " +
          "quantos segundos a transição dura de verdade.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            timeline(svg);
            ball(svg, 0, true); ball(svg, 1, true);
            svg.text(pos(0)[0], pos(0)[1] + 38, "key frame 1", { size: 12, weight: 700, color: "var(--accent)" });
            svg.text(pos(1)[0], pos(1)[1] + 38, "key frame 2", { size: 12, weight: 700, color: "var(--accent)" });
          },
        },
      },
      {
        title: "In-between = interpolação linear",
        body:
          "<p>Para um quadro intermediário no instante <code>t</code>, interpolamos cada atributo entre os " +
          "key frames. A receita mais simples é a <b>interpolação linear</b> (lerp):</p>" +
          "<div class='formula'>P(t) = (1 − t)·P₀ + t·P₁</div>" +
          "<p><b>De onde vem?</b> Reagrupando os termos, ela é a equação de uma reta no parâmetro " +
          "<code>t</code>:</p>" +
          "<div class='formula'>P(t) = P₀ + t·(P₁ − P₀)</div>" +
          "<p>Ou seja: comece em <code>P₀</code> e ande a fração <code>t</code> do vetor que vai até " +
          "<code>P₁</code>. É a <b>mesma reta paramétrica</b> dos guias de curvas — só que o “ponto” agora " +
          "é uma <em>pose</em>, não um lugar no plano.</p>" +
          "<p><b>Conta concreta:</b> se a opacidade vai de <code>P₀ = 0</code> a <code>P₁ = 1</code>, no " +
          "meio do caminho <code>t = 0,5</code> temos <code>P = 0,5·0 + 0,5·1 = 0,5</code> — meio " +
          "transparente, como esperado. Em <code>t = 0</code> a fórmula devolve exatamente <code>P₀</code>; " +
          "em <code>t = 1</code>, exatamente <code>P₁</code> — as chaves são <span class='ok'>respeitadas " +
          "ponto a ponto</span> (a interpolação <em>passa</em> pelas poses, não só perto).</p>" +
          "<p>Posição, cor, escala, ângulo… cada atributo “anda” de P₀ a P₁ com a mesma mecânica. Vetores " +
          "(uma posição 2D/3D, um RGB) interpolam componente a componente.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            timeline(svg);
            ball(svg, 0, true); ball(svg, 1, true);
            svg.line(pos(0)[0], 250, pos(1)[0], 250, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
          },
        },
      },
      {
        title: "A trajetória e os intermediários",
        body:
          "<p>Avaliando <code>P(t)</code> em vários <code>t</code> (aqui de 0,04 em 0,04) obtemos a sequência " +
          "completa de in-betweens. A bola segue um <b>arco</b> porque a altura usa um seno " +
          "(<code>y ∝ sin(πt)</code>), dando um salto natural em vez de uma reta seca.</p>" +
          "<p><b>Por que o seno e não um lerp em y?</b> Se interpolássemos a altura linearmente entre “no " +
          "chão” e “no chão”, ela ficaria <em>parada no chão</em> o tempo todo — sem salto. O seno é um " +
          "atalho para uma trajetória curva sem precisar de uma chave no topo. Em produção, porém, o normal " +
          "é justamente <b>colocar uma chave no ápice</b> e deixar o interpolador costurar as três poses — " +
          "é o que o passo de splines fará adiante.</p>" +
          "<p>Os quadros sólidos são os key frames (desenhados pelo animador); os tracejados, gerados " +
          "automaticamente. Note que os in-betweens estão <b>uniformemente espaçados no tempo</b> — o " +
          "ritmo desse espaçamento é o tema do próximo passo.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 360);
            var pts = [];
            for (var t = 0; t <= 1.0001; t += 0.04) pts.push(pos(t));
            svg.polyline(pts, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 5" });
            timeline(svg);
            [0.2, 0.4, 0.6, 0.8].forEach(function (t) { ball(svg, t, false); });
            ball(svg, 0, true); ball(svg, 1, true);
          },
        },
      },
      {
        title: "Timing: linear ou suavizado",
        body:
          "<p>A interpolação diz <em>o caminho</em>; o <b>timing</b> diz <em>o ritmo</em> — com que " +
          "velocidade <code>t</code> avança. Reparametrizamos o tempo: em vez de usar <code>t</code> " +
          "direto, aplicamos uma função de <b>easing</b> <code>e(t)</code> antes do lerp.</p>" +
          "<ul>" +
          "<li><b>linear</b> (<code>e(t) = t</code>): in-betweens igualmente espaçados → velocidade " +
          "constante. Soa <span class='no'>robótico</span>: na vida real nada parte e para " +
          "instantaneamente.</li>" +
          "<li><b>ease in/out</b>: <code>t</code> segue uma curva em S → acelera no começo e desacelera " +
          "no fim (natural).</li>" +
          "</ul>" +
          "<p>A curva em S clássica é o <b>smoothstep</b> <code>e(t) = 3t² − 2t³</code>. Não é mágica: é o " +
          "polinômio mais simples que vale <code>0</code> em t=0, <code>1</code> em t=1 e tem " +
          "<b>derivada zero nas duas pontas</b> (<code>e′(0) = e′(1) = 0</code>) — ou seja, parte e chega " +
          "com velocidade nula. Daí o “grude” suave nas extremidades que você vê embaixo.</p>" +
          "<p>É o mesmo princípio das <b>curvas de animação</b> (os editores de Bézier no After Effects/" +
          "Blender): você desenha <code>e(t)</code> e ela vira o ritmo do movimento.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 200);
            svg.line(80, 70, 620, 70, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.text(350, 44, "linear: espaçamento uniforme", { size: 12, color: "var(--ink-dim)" });
            [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (t) {
              svg.circle(80 + 540 * t, 70, 7, { fill: "var(--accent)" });
            });
            svg.line(80, 150, 620, 150, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.text(350, 124, "ease: aperta nas pontas (acelera/desacelera)", { size: 12, color: "var(--ink-dim)" });
            [0, 0.06, 0.2, 0.5, 0.8, 0.94, 1].forEach(function (t) {
              var e = smooth(t);
              svg.circle(80 + 540 * e, 150, 7, { fill: "var(--green)" });
            });
          },
        },
      },
      {
        title: "A curva de easing, por dentro",
        body:
          "<p>Vale ver o easing como um <b>gráfico</b>: no eixo horizontal o tempo de relógio <code>t</code>; " +
          "no vertical, o <code>t</code> “efetivo” <code>e(t)</code> que entra no lerp. A diagonal " +
          "<span class='accent'>linear</span> sobe a uma taxa constante; o <span class='ok'>smoothstep</span> " +
          "sai raso (devagar), acelera no miolo e volta a ficar raso (devagar) no fim.</p>" +
          "<p><b>A inclinação É a velocidade.</b> Onde a curva é íngreme, o atributo varia rápido; onde é " +
          "quase horizontal, ele mal se move. Por isso o smoothstep dá <em>ease-in</em> (começo lento) e " +
          "<em>ease-out</em> (fim lento) de uma vez só.</p>" +
          "<p><b>Caso-limite:</b> em <code>t = 0,5</code>, <code>smoothstep = 3·0,25 − 2·0,125 = 0,5</code> " +
          "— passa pelo meio, igual ao linear. A diferença não está no ponto médio, e sim em " +
          "<em>como</em> ele chega lá. Variantes comuns: <code>t²</code> (só ease-in), <code>1−(1−t)²</code> " +
          "(só ease-out), e o <b>smootherstep</b> <code>6t⁵−15t⁴+10t³</code>, que zera também a " +
          "aceleração nas pontas (transição ainda mais sedosa).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 360);
            var X = 60, Y = 300, W = 240, H = 240; // caixa do gráfico
            // eixos
            svg.line(X, Y, X + W, Y, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.line(X, Y, X, Y - H, { stroke: "var(--ink-mute)", strokeWidth: 2 });
            svg.text(X + W / 2, Y + 26, "t (tempo)", { size: 12, color: "var(--ink-dim)" });
            svg.text(X - 30, Y - H / 2, "e(t)", { size: 12, color: "var(--ink-dim)" });
            // linear
            svg.line(X, Y, X + W, Y - H, { stroke: "var(--accent)", strokeWidth: 2, dashed: "5 4" });
            svg.text(X + W - 6, Y - H + 14, "linear", { size: 11, color: "var(--accent)", anchor: "end" });
            // smoothstep
            var pts = [];
            for (var i = 0; i <= 40; i++) {
              var t = i / 40;
              pts.push([X + W * t, Y - H * smooth(t)]);
            }
            svg.polyline(pts, { stroke: "var(--green)", strokeWidth: 3 });
            svg.text(X + 10, Y - 18, "smoothstep", { size: 11, color: "var(--green)", anchor: "start" });
          },
        },
      },
      {
        title: "Várias chaves: splines de Catmull-Rom",
        body:
          "<p>Com <b>três ou mais</b> key frames, o lerp simples liga uma chave à seguinte por " +
          "<b>retas</b> — e a trajetória ganha <span class='no'>quinas</span> em cada pose. A velocidade " +
          "muda de direção bruscamente ali (a curva tem C⁰, mas não C¹).</p>" +
          "<p>A correção é interpolar com uma <b>spline</b> que passe por todas as chaves de forma suave. A " +
          "<b>Catmull-Rom</b> é a queridinha da animação porque é <em>interpolante</em> (passa exatamente " +
          "pelos pontos, ao contrário da Bézier de controle) e calcula a tangente em cada chave " +
          "<code>Pᵢ</code> automaticamente, a partir dos <b>vizinhos</b>:</p>" +
          "<div class='formula'>tangente em Pᵢ  ≈  (Pᵢ₊₁ − Pᵢ₋₁) / 2</div>" +
          "<p>Intuição: a direção em que você passa por uma chave é a que <em>aponta do ponto anterior " +
          "para o próximo</em> — exatamente como um carro numa estrada antecipa a próxima curva. Com as " +
          "tangentes em mãos, cada trecho vira uma cúbica de Hermite. O resultado é uma trajetória " +
          "<span class='ok'>contínua e sem quinas</span> (C¹).</p>" +
          "<p><b>Caso-limite:</b> as pontas não têm vizinho dos dois lados — duplica-se a chave da " +
          "extremidade (ou usa-se uma tangente unilateral). E um parâmetro de <em>tensão</em> regula o " +
          "quão “esticada” a curva fica. Abaixo: a mesma sequência de chaves ligada por retas (cinza, com " +
          "quinas) e por Catmull-Rom (verde, suave).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(700, 300);
            var K = [[90, 230], [230, 90], [400, 200], [560, 80], [640, 220]];
            // poligonal (lerp simples, com quinas)
            svg.polyline(K, { stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "5 4" });
            // Catmull-Rom amostrada
            function pt(i) { return K[Math.max(0, Math.min(K.length - 1, i))]; }
            var sm = [];
            for (var i = 0; i < K.length - 1; i++) {
              var p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
              for (var s = 0; s <= 12; s++) {
                var t = s / 12, t2 = t * t, t3 = t2 * t;
                var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
                var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
                sm.push([x, y]);
              }
            }
            svg.polyline(sm, { stroke: "var(--green)", strokeWidth: 3 });
            K.forEach(function (p, i) {
              svg.circle(p[0], p[1], 6, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
              svg.text(p[0], p[1] - 14, "K" + i, { size: 11, weight: 700, color: "var(--accent)" });
            });
            svg.text(120, 270, "retas: quinas nas chaves", { size: 12, color: "var(--ink-mute)", anchor: "start" });
            svg.text(560, 270, "Catmull-Rom: suave", { size: 12, color: "var(--green)", anchor: "end" });
          },
        },
      },
      {
        title: "Rotação não é lerp: slerp e quatérnios",
        body:
          "<p>Posição interpola lindamente com lerp. <b>Rotação não.</b> Dois erros clássicos aparecem ao " +
          "tratar um ângulo (ou ângulos de Euler) como um número qualquer:</p>" +
          "<ul>" +
          "<li><b>O caminho mais longo:</b> interpolar de <code>350°</code> a <code>10°</code> linearmente " +
          "varre <code>350°→180°→10°</code> — quase uma volta inteira pelo lado errado, quando o certo " +
          "eram <code>20°</code> pelo curto. (Some/subtraia 360° para pegar a menor diferença.)</li>" +
          "<li><b>Velocidade que “respira”:</b> compondo três ângulos de Euler, a velocidade angular " +
          "resultante acelera e freia sozinha — e duas rotações podem alinhar eixos e <b>perder um grau " +
          "de liberdade</b> (o famoso <span class='hl'>gimbal lock</span>).</li>" +
          "</ul>" +
          "<p>A solução madura é o <b>quatérnio unitário</b>, um ponto na esfera 4D que representa uma " +
          "orientação sem singularidades. Interpola-se com <b>slerp</b> (<em>spherical linear " +
          "interpolation</em>): em vez de cortar reto pela corda, anda-se ao longo do <b>arco</b> da esfera, " +
          "a <span class='ok'>velocidade angular constante</span> e sempre pelo caminho mais curto.</p>" +
          "<div class='formula'>slerp(q₀, q₁, t) = sin((1−t)Ω)/sinΩ · q₀ + sin(tΩ)/sinΩ · q₁</div>" +
          "<p>onde <code>Ω</code> é o ângulo entre <code>q₀</code> e <code>q₁</code>. No limite <code>Ω→0</code> " +
          "(rotações quase iguais) o slerp degenera no lerp comum — então não há perda. Abaixo, lerp (corda " +
          "reta, encolhe e acelera) versus slerp (arco, uniforme).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 300);
            var C = [210, 165], R = 110;
            var a0 = (200 * Math.PI) / 180, a1 = (-20 * Math.PI) / 180;
            var p0 = [C[0] + R * Math.cos(a0), C[1] - R * Math.sin(a0)];
            var p1 = [C[0] + R * Math.cos(a1), C[1] - R * Math.sin(a1)];
            // círculo de orientações
            svg.circle(C[0], C[1], R, { fill: "none", stroke: "var(--ink-mute)", strokeWidth: 1.5, dashed: "4 4" });
            svg.circle(C[0], C[1], 3, { fill: "var(--ink-mute)" });
            // slerp = arco (verde)
            var arc = [];
            for (var i = 0; i <= 24; i++) {
              var a = a0 + (a1 - a0) * (i / 24);
              arc.push([C[0] + R * Math.cos(a), C[1] - R * Math.sin(a)]);
            }
            svg.polyline(arc, { stroke: "var(--green)", strokeWidth: 3 });
            // lerp = corda (vermelho)
            svg.line(p0[0], p0[1], p1[0], p1[1], { stroke: "var(--red)", strokeWidth: 2, dashed: "6 4" });
            // pontos médios mostram o "encolhe" do lerp
            var midL = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            svg.circle(midL[0], midL[1], 5, { fill: "var(--red)" });
            var am = (a0 + a1) / 2;
            svg.circle(C[0] + R * Math.cos(am), C[1] - R * Math.sin(am), 5, { fill: "var(--green)" });
            svg.circle(p0[0], p0[1], 6, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.circle(p1[0], p1[1], 6, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(C[0], 24, "slerp (arco) × lerp (corda)", { size: 12, weight: 700, color: "var(--ink-dim)" });
            svg.text(midL[0], midL[1] + 18, "lerp encolhe", { size: 11, color: "var(--red)" });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Economia</b>: poucas poses-chave geram toda a animação; o computador faz os " +
          "in-betweens sem se cansar.</li>" +
          "<li><b>Lerp</b>: <code>(1−t)P₀ + tP₁</code> — respeita as chaves nas pontas; ótimo para " +
          "posição, cor, escala, opacidade.</li>" +
          "<li><b>Timing</b>: troque <code>t</code> por um easing <code>e(t)</code> (smoothstep " +
          "<code>3t²−2t³</code>) para acelerar/desacelerar — é o que separa o natural do robótico.</li>" +
          "<li><b>Splines</b> (Catmull-Rom) entre várias chaves dão trajetórias suaves, sem quinas " +
          "(C¹), passando exatamente pelas poses.</li>" +
          "<li><b>Rotação</b> pede <b>slerp</b>/quatérnios: caminho mais curto, velocidade constante, " +
          "sem gimbal lock. Nunca interpole ângulos de Euler como números soltos.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Key frames = poses; in-betweens = <code>(1−t)P₀ + tP₁</code>. A <b>curva de timing</b> " +
                "controla o ritmo, <b>splines</b> suavizam várias chaves e <b>slerp</b> cuida da rotação.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g21-keyframing",
    num: "⏯",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Key framing e in-betweening",
    type: "conceitual",
    tags: ["animação", "keyframe", "interpolação", "easing", "slerp"],
    hubDesc: "Poses-chave + in-betweens por interpolação; lerp, easing (smoothstep), splines de Catmull-Rom e slerp/quatérnios para rotação.",
    statement:
      "Entenda key framing e in-betweening: a geração dos quadros intermediários entre quadros-chave " +
      "por interpolação (lerp), como o timing (linear ou easing/smoothstep) muda o movimento, por que " +
      "várias chaves pedem splines de Catmull-Rom e por que rotação exige slerp/quatérnios.",
    parts: [{ label: "Guia", build: build }],
  });
})();
