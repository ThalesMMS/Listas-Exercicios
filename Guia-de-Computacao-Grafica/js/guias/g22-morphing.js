/*
 * g22-morphing.js — Guia: morphing por vértices (e por arestas).
 * Transformação gradual de uma forma em outra (pentágono → heptágono); o
 * problema da correspondência quando o número de vértices difere, a
 * interpolação 1-a-1 dos vértices, por que a correspondência é a parte
 * difícil (bom × mau pareamento) e o morphing de imagem (warp + blend).
 *
 * Visual: plane (polígonos). Exemplo e reamostragem da Lista 3 (q18).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  function ngon(n, R) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var a = (90 + (k * 360) / n) * Math.PI / 180;
      out.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    return out;
  }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }

  var A = ngon(5, 4); // pentágono
  var B = ngon(7, 4); // heptágono
  var Ap = [A[0], A[1], mid(A[1], A[2]), A[2], A[3], mid(A[3], A[4]), A[4]]; // 7 pontos
  var BND = [-6.5, 6.5, -6, 6.5];

  function build() {
    var steps = [];

    steps.push({
      title: "Transformar uma forma na outra",
      body:
        "<p>Morphing (de <em>metamorphosis</em>) faz uma forma <b>A</b> virar outra <b>B</b> de modo " +
        "<b>contínuo</b>, gerando os quadros intermediários por interpolação — é o keyframing aplicado à " +
        "<em>geometria</em> inteira, não a um único atributo. A ideia central: cada vértice de A " +
        "“caminha” até um vértice de B ao longo do tempo <code>t ∈ [0, 1]</code>.</p>" +
        "<p>Para isso funcionar, precisamos de duas coisas: <b>(1)</b> saber <em>quem vira quem</em> (a " +
        "<span class='hl'>correspondência</span>) e <b>(2)</b> uma regra de interpolação para cada par. A " +
        "parte (2) é o lerp de sempre; a parte (1) é onde mora toda a dificuldade.</p>" +
        "<p>O obstáculo já aparece aqui: <span class='accent'>A é um pentágono (5 vértices)</span> e " +
        "<span class='ok'>B é um heptágono (7 vértices)</span> — contagens diferentes. Com 5 de um lado e " +
        "7 do outro, <span class='no'>não dá</span> para parear 1-a-1 diretamente: sobrariam dois vértices " +
        "de B sem par.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(A, { stroke: COL.accent, lineWidth: 2.5 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 2.5 });
          plane.text(-6.2, 5.6, "A: pentágono", { color: COL.accent });
          plane.text(-6.2, -5.4, "B: heptágono", { color: COL.green });
        },
      },
    });

    steps.push({
      title: "Igualar a contagem: reamostrar",
      body:
        "<p>A correspondência 1-a-1 exige <b>o mesmo número de vértices</b> dos dois lados. A diferença " +
        "aqui é <code>7 − 5 = 2</code>, então precisamos <b>acrescentar 2 vértices a A</b>.</p>" +
        "<p>O truque é inserir <b>pontos médios</b> de arestas escolhidas (aqui, nas posições 2 e 5): o " +
        "ponto médio de uma aresta <span class='hl'>já está sobre ela</span>, então a forma de A " +
        "<span class='ok'>não muda em nada</span> — o pentágono continua um pentágono, só que agora " +
        "descrito por 7 vértices. É a mesma ideia da reamostragem de uma curva: mais amostras, mesmo " +
        "traçado.</p>" +
        "<p><b>Conta:</b> a aresta entre <code>A₁</code> e <code>A₂</code> ganha o vértice " +
        "<code>(A₁+A₂)/2</code> bem no meio; idem entre <code>A₃</code> e <code>A₄</code>. Os 5 originais " +
        "permanecem. Convém distribuir as inserções (não amontoar numa só aresta), para que os trajetos " +
        "fiquem equilibrados.</p>" +
        "<p>Agora A′ e B têm <b>7 vértices cada</b>, prontos para a correspondência. (Regra geral: " +
        "reamostre <em>sempre a forma com menos vértices</em>, subdividindo até empatar — ou, no caso " +
        "geral, reamostre as duas num número comum de pontos igualmente espaçados.)</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2.5 });
          Ap.forEach(function (p, i) {
            var ins = i === 2 || i === 5;
            plane.point(p[0], p[1], { color: ins ? COL.orange : COL.accent, radius: ins ? 6 : 4, label: "A'" + i, labelColor: COL.ink });
          });
        },
      },
    });

    steps.push({
      title: "Correspondência 1-a-1",
      body:
        "<p>Com 7 e 7, pareamos <code>A′ₖ ↔ Bₖ</code> por índice — as linhas tracejadas ligam cada vértice " +
        "de A′ ao seu correspondente em B. <b>Cada par define o trajeto</b> que aquele vértice percorrerá " +
        "durante o morph (no caso linear, uma reta de <code>A′ₖ</code> até <code>Bₖ</code>).</p>" +
        "<p>Como ambos os polígonos foram gerados a partir do mesmo ângulo inicial (90°) e na mesma " +
        "orientação, parear por índice já casa vértice de cima com vértice de cima — os trajetos saem " +
        "<span class='ok'>curtos e radiais</span>, sem se cruzarem. Repare que as linhas tracejadas não " +
        "se enroscam: é o sinal de um bom pareamento.</p>" +
        "<p>A qualidade do morph <b>depende inteiramente</b> dessa correspondência: o lerp é trivial, mas " +
        "um pareamento ruim faz a forma <span class='no'>dobrar sobre si mesma</span> ou se auto-cruzar no " +
        "meio do caminho. O próximo passo mostra exatamente isso.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          for (var k = 0; k < 7; k++)
            plane.segment(Ap[k], B[k], { color: COL.muted, dashed: true, lineWidth: 1.2 });
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 2 });
        },
      },
    });

    // Novo passo: a correspondência é a parte difícil (bom × mau pareamento).
    steps.push({
      title: "A correspondência é a parte difícil",
      body:
        "<p>Parear por índice deu certo porque alinhamos os “vértices de número 0”. Mas e se o pareamento " +
        "estiver <b>defasado</b> — por exemplo, cada vértice de A′ ligado ao vizinho “errado” de B " +
        "(<code>A′ₖ ↔ B₍ₖ₊₃₎</code>)?</p>" +
        "<p>Veja embaixo: à <span class='accent'>esquerda</span>, o pareamento alinhado (trajetos curtos, " +
        "que não se cruzam). À <span class='no'>direita</span>, o pareamento defasado: os trajetos " +
        "<span class='no'>cruzam o miolo</span> do polígono. No meio do morph (<code>t = 0,5</code>), esses " +
        "cruzamentos fazem a forma <b>encolher, torcer e se auto-intersectar</b> — o efeito “amassado” " +
        "típico de um morph mal feito.</p>" +
        "<p>Por isso, na prática, a correspondência é escolhida com cuidado: alinhar o " +
        "<b>vértice de partida</b> (rotacionar a ordem para minimizar o trajeto total), respeitar a " +
        "<b>mesma orientação</b> (horário × anti-horário) e, em malhas complexas, deixar o artista marcar " +
        "<b>pontos de referência</b> (olho com olho, ponta com ponta). O lerp é mecânico; <span class='hl'>" +
        "decidir quem vira quem é o problema de verdade</span>.</p>",
      visual: {
        type: "plane", bounds: [-13, 13, -6, 7],
        draw: function (plane) {
          var dxL = -6.5, dxR = 6.5;
          function shift(pts, dx) { return pts.map(function (p) { return [p[0] + dx, p[1]]; }); }
          var AL = shift(Ap, dxL), BL = shift(B, dxL);
          var AR = shift(Ap, dxR), BR = shift(B, dxR);
          // esquerda: alinhado (k <-> k)
          for (var k = 0; k < 7; k++)
            plane.segment(AL[k], BL[k], { color: COL.green, dashed: true, lineWidth: 1 });
          plane.polygon(AL, { stroke: COL.accent, lineWidth: 1.5 });
          plane.polygon(BL, { stroke: COL.green, lineWidth: 1.5 });
          plane.text(dxL, 6.2, "alinhado: ✔", { color: COL.green });
          // direita: defasado (k <-> k+3) -> trajetos cruzam o centro
          for (var j = 0; j < 7; j++)
            plane.segment(AR[j], BR[(j + 3) % 7], { color: COL.red, dashed: true, lineWidth: 1 });
          plane.polygon(AR, { stroke: COL.accent, lineWidth: 1.5 });
          plane.polygon(BR, { stroke: COL.green, lineWidth: 1.5 });
          plane.text(dxR, 6.2, "defasado: ✘ cruza", { color: COL.red });
        },
      },
    });

    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      var poly = Ap.map(function (p, k) { return lerp(p, B[k], t); });
      var c = t <= 0.001 ? COL.accent : t >= 0.999 ? COL.green : COL.yellow;
      steps.push({
        title: "Morph por vértices — t = " + t,
        body:
          "<p>Com a correspondência pronta, o morph é só rodar o <b>mesmo lerp do keyframing</b> em " +
          "<b>cada par</b> de vértices ao mesmo tempo:</p>" +
          "<div class='formula'>Pₖ(t) = (1 − t)·A′ₖ + t·Bₖ</div>" +
          "<p>Todos os 7 vértices avançam com o <em>mesmo</em> <code>t</code>, cada um sobre o seu próprio " +
          "trajeto reto. A forma intermediária é o polígono ligando os <code>Pₖ(t)</code>.</p>" +
          "<p>" +
          (t <= 0.001 ? "Em <code>t = 0</code> a fórmula devolve <code>A′ₖ</code> para todo k — é " +
            "exatamente A (o pentágono reamostrado)." :
            t >= 0.999 ? "Em <code>t = 1</code> a fórmula devolve <code>Bₖ</code> para todo k — é " +
              "exatamente B (o heptágono)." :
              "Estado intermediário (" + Math.round(t * 100) + "% do caminho): cada vértice está a essa " +
              "fração do percurso, e a forma é um híbrido “entre” o pentágono e o heptágono. Como o " +
              "pareamento é bom, ela permanece simples (sem auto-cruzamento).") +
          "</p>" +
          (Math.abs(t - 0.5) < 0.001
            ? "<p><b>No meio:</b> <code>Pₖ(0,5) = (A′ₖ + Bₖ)/2</code> é literalmente o ponto médio de cada " +
              "par — a “média geométrica” das duas formas.</p>"
            : "") +
          "<p class='muted'>Para um morph mais natural, troque <code>t</code> por um easing " +
          "<code>e(t)</code> (como no guia de keyframing): a transição grudaria suavemente no início e no " +
          "fim.</p>",
        visual: {
          type: "plane", bounds: BND,
          draw: function (plane) {
            plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1, dashed: true });
            plane.polygon(B, { stroke: COL.green, lineWidth: 1, dashed: true });
            plane.polygon(poly, { stroke: c, lineWidth: 3 });
            poly.forEach(function (p) { plane.point(p[0], p[1], { color: c, radius: 3.5 }); });
            plane.text(-6, 5.4, "t = " + t, { color: c });
          },
        },
      });
    });

    steps.push({
      title: "Variante: morphing por arestas",
      body:
        "<p>Interpolar posições de vértices tem um problema sutil: a média de dois pontos pode " +
        "<b>encurtar arestas</b> e amassar a figura no meio do caminho (lembra o lerp “encolhendo” a " +
        "rotação, no guia de keyframing). Quando o que importa é manter <b>comprimento e ângulo das " +
        "arestas</b>, dá para interpolar a <em>descrição por arestas</em> em vez dos vértices.</p>" +
        "<p>A ideia: para cada aresta, interpole o seu <b>ponto médio</b> e a sua <b>direção/comprimento</b> " +
        "separadamente; depois <b>reconstrua</b> a forma encaixando as arestas de volta (resolvendo um " +
        "pequeno sistema para reconciliar os vértices). Assim a transição preserva melhor a “rigidez” " +
        "local das arestas.</p>" +
        "<p>Abaixo, os trajetos dos <b>pontos médios</b> das arestas correspondentes (de A′ a B) com o " +
        "ponto a meio caminho destacado.</p>",
      visual: {
        type: "plane", bounds: BND,
        draw: function (plane) {
          plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1.5 });
          plane.polygon(B, { stroke: COL.green, lineWidth: 1.5 });
          for (var i = 0; i < 7; i++) {
            var ma = mid(Ap[i], Ap[(i + 1) % 7]);
            var mb = mid(B[i], B[(i + 1) % 7]);
            plane.segment(ma, mb, { color: COL.muted, dashed: true, lineWidth: 1 });
            var m = lerp(ma, mb, 0.5);
            plane.point(m[0], m[1], { color: COL.yellow, radius: 3.5 });
          }
        },
      },
    });

    // Novo passo: morphing de imagem (warp + cross-dissolve).
    steps.push({
      title: "Morphing de imagem: warp + cross-dissolve",
      body:
        "<p>Até aqui morfamos uma <b>malha</b> (vértices). Mas o morphing famoso do cinema/clipes (um rosto " +
        "virando outro) age sobre <b>imagens de pixels</b>, e a receita ganha um segundo ingrediente.</p>" +
        "<p>Um <span class='no'>cross-dissolve</span> puro — só misturar as cores, " +
        "<code>(1−t)·imgA + t·imgB</code> — produz um <b>fantasma duplo</b>: por um tempo vemos os dois " +
        "rostos sobrepostos, desalinhados. Falta alinhar a <em>geometria</em> antes de misturar a cor. A " +
        "técnica clássica (Beier-Neely) combina dois passos:</p>" +
        "<ul>" +
        "<li><b>Warp (deformação):</b> o artista marca <b>pontos/linhas de referência</b> (olho↔olho, " +
        "boca↔boca). Em cada <code>t</code>, deforma-se a imagem A <em>em direção</em> à posição " +
        "intermediária das marcas, e a imagem B <em>de volta</em> para a mesma posição — agora as feições " +
        "<span class='ok'>coincidem na tela</span>.</li>" +
        "<li><b>Blend (cross-dissolve):</b> só então misturam-se as cores com peso <code>t</code>.</li>" +
        "</ul>" +
        "<p>O segredo é a <b>ordem</b>: <em>deforme para alinhar, depois dissolva</em>. As marcas de " +
        "referência são exatamente a <span class='hl'>correspondência</span> de antes — de novo, a parte " +
        "difícil é dizer quem casa com quem; a interpolação é a parte fácil.</p>",
      visual: {
        type: "svg",
        draw: function (svg) {
          svg.view(700, 250);
          function face(cx, cy, col, dxEye, mouthW) {
            svg.circle(cx, cy, 52, { fill: "none", stroke: col, strokeWidth: 2.5 });
            svg.circle(cx - dxEye, cy - 14, 6, { fill: col });
            svg.circle(cx + dxEye, cy - 14, 6, { fill: col });
            svg.path("M " + (cx - mouthW) + " " + (cy + 22) + " Q " + cx + " " + (cy + 34) + " " + (cx + mouthW) + " " + (cy + 22),
              { fill: "none", stroke: col, strokeWidth: 2.5 });
          }
          face(120, 120, "var(--accent)", 20, 16);
          svg.text(120, 200, "A (t=0)", { size: 12, weight: 700, color: "var(--accent)" });
          // intermediário: feições alinhadas + cor misturada
          face(350, 120, "var(--yellow)", 16, 22);
          svg.text(350, 200, "warp p/ alinhar  +  blend", { size: 12, weight: 700, color: "var(--yellow)" });
          face(580, 120, "var(--green)", 12, 28);
          svg.text(580, 200, "B (t=1)", { size: 12, weight: 700, color: "var(--green)" });
          svg.arrow(186, 120, 286, 120, { color: "var(--ink-mute)", head: 10 });
          svg.arrow(416, 120, 516, 120, { color: "var(--ink-mute)", head: 10 });
        },
      },
    });

    steps.push({
      title: "Resumo e cuidados",
      body:
        "<ul>" +
        "<li><b>Morphing = keyframing da geometria</b>: o lerp <code>(1−t)A′ₖ + tBₖ</code> em todos os " +
        "vértices ao mesmo tempo; use um easing em <code>t</code> para suavizar o ritmo.</li>" +
        "<li><b>Correspondência</b> é tudo: alinhe quem vira quem (e por onde começa) para evitar " +
        "dobras e auto-interseções — é a parte difícil, não o lerp.</li>" +
        "<li><b>Contagens diferentes</b>: reamostre a forma com menos vértices (inserindo pontos médios) " +
        "até igualar — sem mudar o traçado.</li>" +
        "<li><b>Por vértices × por arestas</b>: escolha conforme o que precisa ficar “rígido” " +
        "(posições × comprimentos/ângulos das arestas).</li>" +
        "<li><b>Imagem</b>: <em>warp para alinhar, depois cross-dissolve</em> — só misturar cor gera " +
        "fantasma duplo.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Ideia-chave",
            html: "Iguale as contagens, <b>pareie</b> os vértices e interpole cada par: " +
              "<code>(1−t)A′ₖ + tBₖ</code>. Em imagem, <b>deforme antes de dissolver</b>.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g22-morphing",
    num: "⬠⬢",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Morphing por vértices e arestas",
    type: "computacional",
    tags: ["animação", "morphing", "interpolação", "correspondência", "imagem"],
    hubDesc: "Pentágono→heptágono: reamostrar, parear e interpolar 1-a-1; por que a correspondência é o difícil; warp+blend em imagem.",
    statement:
      "Entenda o morphing por vértices e por arestas: a transformação gradual de uma forma em outra " +
      "(como pentágono → heptágono), a correspondência de vértices (a parte difícil — bom × mau " +
      "pareamento), a interpolação 1-a-1 e o morphing de imagem por warp + cross-dissolve.",
    parts: [{ label: "Guia", build: build }],
  });
})();
