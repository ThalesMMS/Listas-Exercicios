/*
 * g03-bresenham-reta.js — Guia: Bresenham (ponto médio) para retas. A função
 * implícita F(x,y) = Δy·x − Δx·y + c, a variável de decisão p, por que
 * p₀ = 2Δy − Δx, os incrementos inteiros, o tratamento dos octantes (sx, sy,
 * steep), um exemplo steep trabalhado e as conexões (Wu/anti-aliasing,
 * hardware). Comparação direta com o DDA.
 *
 * Reusa window.ALG.bresenhamLine (traço inteiro) + EX.Content / EX.Slides /
 * EX.Guia (mat/row/dom para os blocos de derivação).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;
  var ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  var P0 = [0, 0],
    P1 = [6, 4];
  var R = ALG.bresenhamLine(P0, P1); // dx=6, dy=4, p0=2, incNeg=8, incPos=-4
  var BOUNDS = [-1, 7, -1, 5];

  function scene(plane, upto) {
    plane.segment(P0, P1, { color: COL.muted, dashed: true });
    plane.point(P0[0], P0[1], { color: COL.muted, radius: 3 });
    plane.point(P1[0], P1[1], { color: COL.muted, radius: 3, label: "(6,4)" });
    for (var k = 0; k < upto; k++) {
      var px = R.pixels[k];
      plane.pixel(px[0], px[1], { fill: COL.accentSoft, stroke: COL.accent });
    }
  }

  function build() {
    var steps = [];

    // 1) Motivação
    steps.push({
      title: "Mesma meta do DDA, sem números reais",
      body:
        "<p>O DDA acerta os pixels, mas paga um preço: guarda o <code>y</code> em frações/float e " +
        "<b>arredonda a cada passo</b>. Em retas longas, somar <code>yinc</code> milhares de vezes pode " +
        "<span class='hl'>derivar</span> por erro de ponto flutuante (foi a fraqueza que vimos no DDA).</p>" +
        "<p>Bresenham desenha a <b>mesma reta usando só inteiros</b> — somas e comparações de sinal, " +
        "<span class='no'>sem divisão</span> e <span class='no'>sem arredondamento</span>. A pergunta " +
        "“qual o <code>y</code> exato?” é substituída por uma muito mais barata: “o próximo pixel sobe " +
        "ou não?”.</p>" +
        "<p>Intuição: em vez de medir a altura da reta, Bresenham carrega um <b>erro acumulado</b> em " +
        "número inteiro e só observa o <em>sinal</em> dele. Por isso virou o algoritmo clássico de " +
        "hardware — barato, exato e sem erro que se acumula.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 2) Ideia: ponto médio
    steps.push({
      title: "A ideia: o ponto médio decide",
      body:
        "<p>Vamos nos restringir, por enquanto, ao <b>1º octante</b> (reta suave subindo à direita, " +
        "<code>0 ≤ Δy ≤ Δx</code>) — os outros casos saem por simetria mais adiante. Aí o eixo " +
        "dominante é <code>x</code>, então a cada passo <code>x</code> avança <b>1 inteiro</b> e a " +
        "única dúvida é o <code>y</code>.</p>" +
        "<p>Estando num pixel <code>(x, y)</code>, só há <b>dois candidatos</b> à direita: " +
        "<span class='accent'>E = (x+1, y)</span> (mesma linha) ou <span class='hl'>NE = (x+1, y+1)</span> " +
        "(uma linha acima). Como no DDA o <code>x</code> nunca pula, mas aqui escolhemos o pixel sem " +
        "calcular o <code>y</code> real.</p>" +
        "<p>Para decidir, olhamos o <b>ponto médio</b> <code>M = (x+1, y+½)</code>, bem entre E e NE. " +
        "Se a reta ideal passa <b>acima</b> de M, ela está mais perto de NE; se passa <b>abaixo</b>, " +
        "mais perto de E. A <span class='hl'>variável de decisão p</span> é justamente um teste do " +
        "<em>sinal</em> de “reta − M”.</p>" +
        "<p>Mini-conta: a reta do exemplo é <code>y = (4/6)x = (2/3)x</code>. No primeiro passo " +
        "comparamos com <code>M = (1, ½)</code>; a reta vale aí <code>y = 2/3 ≈ 0,67</code>, que é " +
        "<b>acima</b> de <code>½</code> — então o primeiro candidato vencedor será NE. É esse “acima/" +
        "abaixo” que vamos transformar num inteiro.</p>",
      visual: {
        type: "plane",
        bounds: [1, 5, 0, 3],
        draw: function (plane) {
          plane.segment(P0, P1, { color: COL.muted, dashed: true });
          // a partir de (2,1): candidatos E e NE
          plane.pixel(2, 1, { fill: COL.accentSoft, stroke: COL.accent, label: "(x,y)" });
          plane.pixel(3, 1, { fill: "transparent", stroke: COL.cyan, label: "E" });
          plane.pixel(3, 2, { fill: "transparent", stroke: COL.green, label: "NE" });
          plane.point(3, 1.5, { color: COL.yellow, radius: 4, label: "M", labelColor: COL.yellow });
        },
      },
    });

    // 3) A função implícita da reta (derivação)
    steps.push({
      title: "A função implícita F(x, y)",
      body:
        "<p>O “acima/abaixo” do passo anterior precisa virar uma conta. O truque é escrever a reta na " +
        "<b>forma implícita</b> em vez de <code>y = m·x + b</code>. Partindo de " +
        "<code>y = (Δy/Δx)·x + b</code> e multiplicando por <code>Δx</code>:</p>" +
        "<div class='formula'>Δx·y = Δy·x + Δx·b\n0 = Δy·x − Δx·y + (Δx·b)\nF(x, y) = Δy·x − Δx·y + c   (c = Δx·b)</div>" +
        "<p>O valor de <code>F</code> tem um significado geométrico limpo: ele mede de que <b>lado</b> da " +
        "reta está o ponto.</p>" +
        "<ul>" +
        "<li><code>F = 0</code> → o ponto está <b>sobre</b> a reta;</li>" +
        "<li><code>F &gt; 0</code> → está <b>abaixo</b> dela (a reta passa acima do ponto);</li>" +
        "<li><code>F &lt; 0</code> → está <b>acima</b> dela.</li>" +
        "</ul>" +
        "<p>O sinal sai de <code>−Δx·y</code>: como no 1º octante <code>Δx &gt; 0</code>, baixar o " +
        "ponto (menor <code>y</code>) aumenta <code>F</code>. Avaliamos <code>F</code> no ponto médio " +
        "<code>M = (x+1, y+½)</code> e batizamos esse valor de <code>p</code>. Próximo passo: tirar as " +
        "frações de cena.</p>",
      visual: {
        type: "plane",
        bounds: [-1, 7, -1, 5],
        draw: function (plane) {
          plane.segment(P0, P1, { color: COL.muted, dashed: true });
          plane.point(5, 1, { color: COL.cyan, radius: 4, label: "F>0 (abaixo)", labelColor: COL.cyan });
          plane.point(1, 4, { color: COL.purple, radius: 4, label: "F<0 (acima)", labelColor: COL.purple });
          plane.point(3, 2, { color: COL.yellow, radius: 4, label: "F≈0", labelColor: COL.yellow });
        },
      },
    });

    // 4) Derivação dos inteiros
    steps.push({
      title: "Por que p₀ = 2Δy − Δx",
      body:
        "<p>Avaliar <code>F</code> no ponto médio do <b>primeiro</b> trecho — saindo de " +
        "<code>(x₀, y₀)</code>, o meio é <code>M = (x₀+1, y₀+½)</code> — ainda traz o ½. " +
        "Substituindo e usando que o início está sobre a reta (<code>F(x₀, y₀) = 0</code>):</p>" +
        "<div class='formula'>F(x₀+1, y₀+½) = Δy·(x₀+1) − Δx·(y₀+½) + c\n= [Δy·x₀ − Δx·y₀ + c] + Δy − ½Δx\n= 0 + Δy − ½Δx</div>" +
        "<p>Sobrou um <code>½</code>. Como só usamos o <b>sinal</b> de <code>p</code>, podemos " +
        "<span class='hl'>multiplicar tudo por 2</span> sem mudar a decisão — e o ½ some, deixando só " +
        "inteiros:</p>" +
        "<div class='formula'>p₀ = 2Δy − Δx = 2·4 − 6 = " +
        R.p0val +
        "</div>" +
        "<p>Os incrementos também são inteiros e <b>pré-calculados</b>. Por que constantes? Porque a " +
        "diferença <code>p<sub>novo</sub> − p<sub>velho</sub></code> ao andar de um meio-ponto ao " +
        "seguinte depende só de qual candidato escolhemos, não de onde estamos:</p>" +
        "<div class='formula'>se p &lt; 0 → escolhe E (só x++):    p += 2Δy = " +
        R.incNeg +
        "\nse p ≥ 0 → escolhe NE (x++, y++):  p += 2Δy − 2Δx = " +
        R.incPos +
        "</div>" +
        "<p>Cada passo é então <b>uma soma e um teste</b> <code>p &lt; 0?</code> — nada de multiplicar " +
        "ou dividir dentro do laço. (Repare que <code>2Δy</code> é exatamente o numerador inteiro do " +
        "<code>yinc</code> do DDA: os dois algoritmos carregam a mesma inclinação, um em fração, o " +
        "outro em inteiro.)</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, 0);
        },
      },
    });

    // 5..n) Traço
    R.rows.forEach(function (rw, i) {
      var last = i === R.rows.length - 1;
      var inc = rw.p < 0 ? R.incNeg : R.incPos;
      var pNext = rw.p + inc;
      steps.push({
        title: "i = " + i + ": pixel (" + rw.x + ", " + rw.y + ")",
        body:
          "<p>Pixel atual <span class='ok'>(" +
          rw.x +
          ", " +
          rw.y +
          ")</span> com <code>p = " +
          rw.p +
          "</code>.</p>" +
          (i === 0
            ? "<p>Acendemos o extremo inicial e começamos com <code>p₀ = " +
              R.p0val +
              "</code>.</p>"
            : "") +
          (last
            ? "<p>Chegamos ao extremo final <code>(6, 4)</code>. O laço para — repare que demos " +
              "exatamente <code>Δx = " +
              R.dx +
              "</code> passos em <code>x</code>.</p>"
            : "<p>O sinal de <code>p</code> conta de que lado do ponto médio a reta passou. Como " +
              "<code>p = " +
              rw.p +
              " " +
              (rw.p < 0 ? "&lt; 0" : "≥ 0") +
              "</code>" +
              (rw.p < 0
                ? " (médio <b>acima</b> da reta), o próximo é <span class='hl'>E — só x++</span>"
                : " (médio <b>abaixo</b> da reta), o próximo é <span class='hl'>NE — x++, y++</span>") +
              ". Atualizamos somando a constante: <code>p += " +
              inc +
              "</code> → <code>p = " +
              rw.p +
              " + (" +
              inc +
              ") = " +
              pNext +
              "</code>.</p>" +
              (rw.p === 0
                ? "<p class='muted'>Aqui <code>p = 0</code> é um <b>empate</b> exato: por convenção " +
                  "<code>p ≥ 0 → NE</code>. A outra convenção desenharia E — ambos válidos, só seja " +
                  "consistente.</p>"
                : "")),
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            scene(plane, i);
            plane.pixel(rw.x, rw.y, { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Octantes
    steps.push({
      title: "E as outras inclinações?",
      body:
        "<p>A derivação acima vale para o <b>1º octante</b> (reta suave subindo à direita, " +
        "<code>0 ≤ Δy ≤ Δx</code>). Os outros 7 casos saem por <b>simetria</b>, sem refazer a conta — " +
        "ajustamos só duas coisas:</p>" +
        "<ul>" +
        "<li><b>Sentido</b>: os sinais <code>sx, sy = ±1</code> tratam retas que descem ou vão para a " +
        "esquerda. Em vez de <code>x++</code> faça <code>x += sx</code> (idem <code>y</code>); a conta " +
        "de <code>p</code> usa <code>|Δx|, |Δy|</code> e não muda.</li>" +
        "<li><b>Inclinação &gt; 45°</b> (<code>Δy &gt; Δx</code>, <em>steep</em>): aqui o eixo dominante " +
        "é <code>y</code>. Trocamos os papéis de <code>x</code> e <code>y</code> — andamos <b>1 em " +
        "<code>y</code></b> a cada passo e decidimos se <code>x</code> avança. Tudo o que era " +
        "<code>Δx</code> vira <code>Δy</code> e vice-versa.</li>" +
        "</ul>" +
        "<p>Por que isso resolve os buracos? Porque andar sempre pelo eixo que cobre <b>mais</b> " +
        "distância garante 1 pixel por coluna (ou linha) — a mesma razão do <code>max(|Δx|, |Δy|)</code> " +
        "do DDA. Um único núcleo, com <code>sx, sy</code> e a troca steep, cobre os 360°.</p>",
      visual: {
        type: "plane",
        bounds: [-5, 5, -5, 5],
        draw: function (plane) {
          var c = [0, 0];
          var dirs = [
            [4, 1],
            [1, 4],
            [-1, 4],
            [-4, 1],
            [-4, -1],
            [-1, -4],
            [1, -4],
            [4, -1],
          ];
          dirs.forEach(function (d, k) {
            plane.segment(c, d, {
              color: k === 0 ? COL.green : COL.accent,
              lineWidth: k === 0 ? 3 : 1.5,
            });
          });
          plane.point(0, 0, { color: COL.yellow, radius: 3 });
          plane.text(4, 1, "1º octante", { color: COL.green, dx: -30, dy: -8 });
        },
      },
    });

    // n+1b) Exemplo steep trabalhado
    var S0 = [0, 0],
      S1 = [3, 6];
    var RS = ALG.bresenhamLine(S0, S1); // steep: dx=3, dy=6 → domina y
    steps.push({
      title: "Um exemplo steep, passo a passo",
      body:
        "<p>Veja o caso íngreme <code>(0,0)→(3,6)</code>: agora <code>Δx = " +
        RS.dx +
        "</code> e <code>Δy = " +
        RS.dy +
        "</code>, então <code>Δy &gt; Δx</code> — é <em>steep</em>. O dominante passa a ser " +
        "<code>y</code>: a cada passo <code>y</code> sobe 1, e decidimos se <code>x</code> avança.</p>" +
        "<p>Os papéis se invertem na fórmula. A decisão inicial usa <code>2Δx − Δy</code>:</p>" +
        "<div class='formula'>p₀ = 2Δx − Δy = 2·" +
        RS.dx +
        " − " +
        RS.dy +
        " = " +
        RS.p0val +
        "\nse p &lt; 0 → só y++:        p += 2Δx = " +
        RS.incNeg +
        "\nse p ≥ 0 → x++ e y++:      p += 2Δx − 2Δy = " +
        RS.incPos +
        "</div>" +
        "<p>O resultado é a reta espelhada da diagonal: os mesmos pixels que (0,0)→(6,4) geraria se " +
        "trocássemos <code>x</code> por <code>y</code>. Se tivéssemos aplicado a fórmula do 1º octante " +
        "aqui, o <code>y</code> pularia de dois em dois e a reta sairia <span class='no'>pontilhada</span>.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["i", "x", "y", "p", "próximo"],
            rows: RS.rows.map(function (rw, i) {
              var last = i === RS.rows.length - 1;
              return [
                i,
                rw.x,
                rw.y,
                rw.p,
                last ? "fim" : rw.p < 0 ? "y++" : "x++, y++",
              ];
            }),
          });
        },
      },
    });

    // n+2) Comparação
    steps.push({
      title: "Bresenham × DDA, lado a lado",
      body:
        "<p>Para esta mesma reta (0,0)→(6,4), os <b>dois geram os pixels idênticos</b>: " +
        "(0,0)(1,1)(2,1)(3,2)(4,3)(5,3)(6,4). A diferença está por baixo do capô — e é a mesma história " +
        "que vimos no guia do DDA, agora pelo outro lado.</p>" +
        "<p>O DDA carrega o <code>y</code> exato (fração/float) e arredonda; Bresenham carrega o " +
        "<b>erro inteiro</b> <code>p</code> e só lê o sinal. Mesmo resultado visual, custo e robustez " +
        "diferentes. Os prós e contras:</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.prosCons(host, {
            pros: [
              "Só inteiros: soma e teste de sinal",
              "Sem divisão, sem arredondar",
              "Sem erro acumulado (exato)",
              "Ideal para implementar em hardware",
            ],
            cons: [
              "Menos óbvio: precisa entender a variável p",
              "Derivação muda de eixo nos casos steep",
              "Aliasing: bordas serrilhadas (degraus)",
            ],
          });
        },
      },
    });

    // n+3) Conexões e aplicações
    steps.push({
      title: "Onde isso reaparece",
      body:
        "<p>A ideia central — <b>uma decisão inteira atualizada por soma</b> — é uma das mais reusadas " +
        "da computação gráfica:</p>" +
        "<ul>" +
        "<li><b>Círculos e elipses</b>: o mesmo ponto médio, agora avaliando <code>F(x,y)=x²+y²−r²</code> " +
        "em vez da reta (ver o guia de Bresenham para circunferências).</li>" +
        "<li><b>Anti-aliasing (algoritmo de Wu)</b>: Bresenham escolhe <em>um</em> pixel e deixa a borda " +
        "<span class='no'>serrilhada</span>. Wu parte da mesma reta incremental, mas acende <b>dois " +
        "pixels por coluna</b> com intensidade proporcional à distância — a fração que Bresenham jogou " +
        "fora vira o brilho, suavizando o degrau.</li>" +
        "<li><b>Interpolação ao longo de arestas</b>: a mecânica “some um incremento por passo” é a " +
        "mesma que leva cor (Gouraud), profundidade <code>z</code> e coordenadas de textura pixel a " +
        "pixel — exatamente a conexão que o DDA já anunciava.</li>" +
        "<li><b>Hardware e plotters</b>: por usar só inteiros, foi gravado em silício e moveu cabeças de " +
        "plotters/CNC, onde cada passo é um pulso de motor.</li>" +
        "</ul>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          scene(plane, R.pixels.length);
        },
      },
    });

    // n+4) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Empate (p = 0)</b>: é convenção. Aqui usamos <code>p ≥ 0 → NE</code>; a outra convenção " +
        "(<code>p &gt; 0 → NE</code>) escolheria o pixel vizinho nos pontos de empate. Qualquer uma " +
        "serve — só não misture, ou a reta e sua espelhada ficam assimétricas.</li>" +
        "<li><b>Octante errado</b>: aplicar a fórmula do 1º octante a uma reta <em>steep</em> faz o " +
        "<code>y</code> pular e gera <span class='no'>buracos</span> — lembre de trocar " +
        "<code>x</code>↔<code>y</code> quando <code>Δy &gt; Δx</code>.</li>" +
        "<li><b>Esquecer sx/sy</b>: hard-codar <code>x++</code> só funciona para a direita; use " +
        "<code>x += sx</code> e <code>|Δx|, |Δy|</code> na variável de decisão.</li>" +
        "<li><b>p e (x,y)</b> são lidos <b>antes</b> de atualizar: o pixel desenhado é o atual, e só " +
        "depois <code>p</code> e a posição avançam.</li>" +
        "<li><b>Serrilhado</b>: Bresenham é exato na grade, não suave. Se o degrau incomoda, parta para " +
        "anti-aliasing (Wu).</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html:
              "O ponto médio entre os dois candidatos transforma “qual pixel?” num " +
              "<b>teste de sinal inteiro</b> que se atualiza somando uma constante.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g03-bresenham-reta",
    num: "B",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "Bresenham para retas",
    type: "computacional",
    tags: ["rasterização", "reta", "bresenham", "ponto médio", "anti-aliasing"],
    hubDesc: "A função implícita F(x,y), a variável de decisão p, por que p₀ = 2Δy − Δx, incrementos inteiros, octantes e a conexão com Wu.",
    statement:
      "Entenda o algoritmo de Bresenham para retas: a função implícita F(x,y) = Δy·x − Δx·y + c e o " +
      "ponto médio, a variável de decisão p, por que p₀ = 2Δy − Δx, a atualização incremental inteira, " +
      "o tratamento dos octantes (sx, sy e o caso steep) e as conexões com o DDA, com o anti-aliasing " +
      "de Wu e com o hardware.",
    parts: [{ label: "Guia", build: build }],
  });
})();
