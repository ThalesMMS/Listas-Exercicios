/*
 * g14-mandelbrot.js — Guia: conjunto de Mandelbrot / fractais.
 * A iteração z ← z² + c, por que o critério de escape é exatamente |z| > 2, a
 * coloração por tempo de escape (degraus e suave), a relação com os conjuntos
 * de Julia e os limites de precisão no zoom. Foco no PORQUÊ do processo
 * iterativo e de cada decisão.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var B = [-2.3, 0.9, -1.3, 1.3];
  var MAXIT = 50;

  // Iterações até |z| > 2 (ou MAXIT se não escapar). c = cr + i·ci.
  function escape(cr, ci, maxit) {
    var zr = 0, zi = 0, n = 0;
    while (n < maxit && zr * zr + zi * zi <= 4) {
      var t = zr * zr - zi * zi + cr;
      zi = 2 * zr * zi + ci;
      zr = t;
      n++;
    }
    return n;
  }
  // Julia: mesma iteração, mas z0 = ponto e c é FIXO (parâmetro da família).
  function juliaEscape(zr0, zi0, cr, ci, maxit) {
    var zr = zr0, zi = zi0, n = 0;
    while (n < maxit && zr * zr + zi * zi <= 4) {
      var t = zr * zr - zi * zi + cr;
      zi = 2 * zr * zi + ci;
      zr = t;
      n++;
    }
    return n;
  }
  function tint(n, maxit) {
    if (n >= maxit) return "#0a0a16"; // dentro do conjunto
    var t = n / maxit;
    var L = Math.round(14 + 68 * Math.sqrt(t));
    return "hsl(" + Math.round(212 - 130 * t) + ",78%," + L + "%)";
  }
  function render(plane, maxit) {
    var ctx = plane.ctx;
    var NX = 120, NY = 96;
    var x0 = plane.xmin, x1 = plane.xmax, y0 = plane.ymin, y1 = plane.ymax;
    var sx = (x1 - x0) / NX, sy = (y1 - y0) / NY;
    var w = sx * plane.scale + 1, h = sy * plane.scale + 1;
    ctx.save();
    for (var i = 0; i < NX; i++) {
      var cr = x0 + (i + 0.5) * sx;
      for (var j = 0; j < NY; j++) {
        var ci = y0 + (j + 0.5) * sy;
        ctx.fillStyle = tint(escape(cr, ci, maxit), maxit);
        ctx.fillRect(plane.cx(cr - sx / 2), plane.cy(ci + sy / 2), w, h);
      }
    }
    ctx.restore();
  }
  // Renderiza um conjunto de Julia para um c fixo, na janela do plano.
  function renderJulia(plane, cr, ci, maxit) {
    var ctx = plane.ctx;
    var NX = 110, NY = 90;
    var x0 = plane.xmin, x1 = plane.xmax, y0 = plane.ymin, y1 = plane.ymax;
    var sx = (x1 - x0) / NX, sy = (y1 - y0) / NY;
    var w = sx * plane.scale + 1, h = sy * plane.scale + 1;
    ctx.save();
    for (var i = 0; i < NX; i++) {
      var zr = x0 + (i + 0.5) * sx;
      for (var j = 0; j < NY; j++) {
        var zi = y0 + (j + 0.5) * sy;
        ctx.fillStyle = tint(juliaEscape(zr, zi, cr, ci, maxit), maxit);
        ctx.fillRect(plane.cx(zr - sx / 2), plane.cy(zi + sy / 2), w, h);
      }
    }
    ctx.restore();
  }

  // Órbita real (ci=0) para os exemplos numéricos.
  function orbit(cr, steps) {
    var z = 0, seq = [0];
    for (var k = 0; k < steps; k++) {
      z = z * z + cr;
      seq.push(z);
      if (Math.abs(z) > 1e6) break;
    }
    return seq;
  }

  function build() {
    var steps = [];

    steps.push({
      title: "Complexidade infinita de uma regra mínima",
      body:
        "<p>Fractais mostram como uma <b>regra simples, repetida</b>, gera estrutura infinitamente " +
        "detalhada e <b>auto-similar</b>. O conjunto de Mandelbrot é o exemplo célebre.</p>" +
        "<p>Toda a figura vem de uma única equação iterada — nada de armazenar a forma; ela é " +
        "<b>computada</b>, ponto a ponto. É o oposto de uma malha de triângulos: aqui a imagem é o " +
        "resultado de um <em>cálculo</em>, não de uma geometria guardada.</p>" +
        "<p>Cada ponto da tela é um número complexo <code>c = cᵣ + i·cᵢ</code> (eixo horizontal = " +
        "parte real, vertical = imaginária). A cor de <code>c</code> responde a uma pergunta: " +
        "<em>a órbita de c foge para o infinito?</em></p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "A regra: z ← z² + c",
      body:
        "<p>Para cada ponto <code>c = (cᵣ, cᵢ)</code> do plano complexo, itere a partir de " +
        "<code>z₀ = 0</code>:</p>" +
        "<div class='formula'>z_{n+1} = z_n² + c</div>" +
        "<p>O quadrado é <b>complexo</b>: se <code>z = a + i·b</code>, então <code>z² = (a² − b²) + " +
        "i·(2ab)</code>. Em coordenadas (o que o código faz):</p>" +
        "<div class='formula'>zᵣ' = zᵣ² − zᵢ² + cᵣ\nzᵢ' = 2·zᵣ·zᵢ + cᵢ</div>" +
        "<p><b>c pertence ao conjunto</b> se a sequência <b>nunca foge para o infinito</b> (fica " +
        "<em>limitada</em> para sempre). Se ela dispara, c está fora.</p>" +
        "<p>Intuição do quadrado: elevar ao quadrado <b>amplifica</b> módulos maiores que 1 e " +
        "<b>encolhe</b> os menores que 1. O <code>+ c</code> empurra de volta. Quem vence essa " +
        "queda-de-braço decide o destino — e o próximo passo prova quando a amplificação ganha de " +
        "vez.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "Por que o limite é exatamente 2",
      body:
        "<p>O critério de parada é <code>|z| &gt; 2</code>. Esse 2 não é chute — sai da própria " +
        "iteração. Suponha que num passo <code>|z| &gt; 2</code> e também <code>|z| ≥ |c|</code> " +
        "(sempre verdade depois que z cresce, pois <code>|c| ≤ 2</code> na região interessante). " +
        "Pela desigualdade triangular:</p>" +
        "<div class='formula'>|z² + c| ≥ |z|² − |c| ≥ |z|² − |z| = |z|·(|z| − 1)</div>" +
        "<p>Como <code>|z| &gt; 2</code>, o fator <code>(|z| − 1) &gt; 1</code> — então cada passo " +
        "<b>multiplica</b> o módulo por algo maior que 1. Uma vez acima de 2, <code>|z|</code> só " +
        "<span class='no'>cresce</span>, e cresce cada vez mais rápido: <b>escapou</b>, é certo que " +
        "vai ao infinito. Não há por que continuar iterando.</p>" +
        "<p>Por isso testamos <code>zᵣ² + zᵢ² &gt; 4</code> (o módulo ao quadrado &gt; 2² = 4) — " +
        "evita a raiz quadrada. E é também por isso que o conjunto inteiro <b>cabe</b> no disco de " +
        "raio 2: nada além dele sobrevive.</p>",
      visual: {
        type: "plane",
        bounds: [-2.6, 2.6, -2.6, 2.6],
        draw: function (plane) {
          render(plane, MAXIT);
          // disco de raio 2 que contém todo o conjunto
          var ring = [];
          for (var a = 0; a <= 6.2832; a += 0.05) ring.push([2 * Math.cos(a), 2 * Math.sin(a)]);
          plane.polyline(ring, { stroke: COL.yellow, lineWidth: 2, closed: true, dashed: true });
          plane.text(0, 2, "|z| = 2", { color: COL.yellow, dx: 6, dy: -6, align: "left" });
        },
      },
    });

    var inSeq = orbit(-0.5, 6);
    var outSeq = orbit(1, 5);
    steps.push({
      title: "Dois pontos, dois destinos",
      body:
        "<p>Acompanhe a órbita (aqui com <code>cᵢ = 0</code>, só parte real, para a conta ficar " +
        "concreta):</p>" +
        "<ul>" +
        "<li><b>c = −0,5</b> (dentro): <code>" +
        inSeq.map(function (z) { return (Math.round(z * 1000) / 1000); }).join(" → ") +
        "</code> … fica <span class='ok'>preso</span> perto de −0,37. Nunca passa de 2.</li>" +
        "<li><b>c = 1</b> (fora): <code>" +
        outSeq.map(function (z) { return Math.round(z); }).join(" → ") +
        "</code> … <span class='no'>dispara</span>. Já em |z| = 5 &gt; 2 sabemos que escapou.</li>" +
        "</ul>" +
        "<p>O caso <code>c = −0,5</code> converge para um <b>ponto fixo</b> (resolve <code>z = z² + " +
        "c</code>); outros valores caem em <b>ciclos</b> de período 2, 3, … — os “bulbos” grudados no " +
        "corpo principal correspondem a esses períodos. O caso <code>c = 1</code> ilustra o passo " +
        "anterior: assim que cruza 2, a multiplicação por <code>(|z|−1)</code> faz o resto.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["n", "z (c = −0,5)", "z (c = 1)"],
            rows: [0, 1, 2, 3, 4].map(function (n) {
              return [
                n,
                inSeq[n] == null ? "" : String(Math.round(inSeq[n] * 1000) / 1000),
                outSeq[n] == null ? "" : String(Math.round(outSeq[n])),
              ];
            }),
          });
        },
      },
    });

    steps.push({
      title: "Colorir pelo tempo de escape",
      body:
        "<p>Os pontos de <b>dentro</b> ficam pretos (nunca escapam em N iterações). Os de fora ganham " +
        "cor pelo <b>número de iterações até escapar</b> — o <b>tempo de escape</b>: poucos passos = " +
        "uma cor, muitos passos = outra.</p>" +
        "<p>Por que isso vira <b>bandas</b>? Pontos que escapam no mesmo número de passos formam uma " +
        "região (uma “curva de nível” do tempo de escape). Quanto mais perto da borda, mais devagar " +
        "se escapa — as bandas se <span class='hl'>apertam</span> e revelam a estrutura fractal " +
        "infinita da fronteira.</p>" +
        "<div class='formula'>cor(c) = paleta( n_escape(c) / N )</div>" +
        "<p>Aqui mapeamos <code>n/N</code> para matiz e brilho (HSL). Os pontos de dentro recebem uma " +
        "cor fixa escura. (Essas faixas têm degraus visíveis — o próximo passo as suaviza.)</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "Coloração suave (sem degraus)",
      body:
        "<p>O tempo de escape é um <b>inteiro</b>, então o colorido sai em <b>degraus</b> — anéis de " +
        "cor chapada. Para um gradiente liso, usa-se a <b>contagem de escape contínua</b>, que " +
        "estima a “fração de passo” no momento em que z cruzou o raio:</p>" +
        "<div class='formula'>ν = n + 1 − log₂( log|z_n| )</div>" +
        "<p>A ideia: quanto mais <code>|z_n|</code> ultrapassou o raio, mais “adiantado” o ponto " +
        "estava — esse excesso preenche o espaço <em>entre</em> dois inteiros. O <code>log</code> " +
        "duplo aparece porque a fuga é (aproximadamente) um <b>quadrado a cada passo</b> " +
        "(crescimento duplo-exponencial), então o tempo certo é logarítmico do logaritmo.</p>" +
        "<p>Trocar <code>n</code> por <code>ν</code> na paleta apaga os anéis e dá aquele degradê " +
        "contínuo das imagens famosas. É um retoque de <em>coloração</em>: não muda quem está dentro " +
        "ou fora, só como pintamos o lado de fora.</p>",
      visual: { type: "plane", bounds: B, draw: function (plane) { render(plane, MAXIT); } },
    });

    steps.push({
      title: "Primos do Mandelbrot: os conjuntos de Julia",
      body:
        "<p>Inverta os papéis da iteração <code>z ← z² + c</code>:</p>" +
        "<ul>" +
        "<li><b>Mandelbrot</b>: fixa <code>z₀ = 0</code> e <b>varre c</b> pela tela. Um ponto por " +
        "valor de <code>c</code>.</li>" +
        "<li><b>Julia</b>: fixa <b>um c</b> e <b>varre z₀</b> pela tela. Cada <code>c</code> gera um " +
        "conjunto de Julia <em>diferente</em>.</li>" +
        "</ul>" +
        "<p>Existe uma ponte linda entre os dois: o <b>c está dentro do Mandelbrot</b> exatamente " +
        "quando o conjunto de Julia daquele <code>c</code> é <b>conexo</b> (uma peça só); se " +
        "<code>c</code> está fora, o Julia se esfarela em <b>poeira</b> (infinitos pontos soltos). " +
        "Por isso o Mandelbrot é um “mapa-índice” de todos os Julias.</p>" +
        "<p>Ao lado, o Julia de <code>c = −0,8 + 0,156i</code> (um c <em>dentro</em> do Mandelbrot) — " +
        "note que é uma peça conexa. O critério <code>|z| &gt; 2</code> e o tempo de escape são " +
        "<b>os mesmos</b>; só mudou o que é fixo e o que varia.</p>",
      visual: {
        type: "plane",
        bounds: [-1.7, 1.7, -1.3, 1.3],
        draw: function (plane) { renderJulia(plane, -0.8, 0.156, 60); },
      },
    });

    steps.push({
      title: "Zoom e auto-similaridade",
      body:
        "<p>Aproximando a borda, reaparecem cópias do conjunto inteiro e detalhes que nunca terminam — " +
        "a <b>auto-similaridade</b>. Como a figura é só a regra iterada, dá para ampliar " +
        "indefinidamente: é só reavaliar a equação na nova janela, com mais iterações.</p>" +
        "<p>(Aqui aproximamos a região do “vale” à esquerda do bulbo principal.)</p>" +
        "<p>Curiosidade: a fronteira do Mandelbrot tem <b>dimensão fractal 2</b> — é tão enrugada que " +
        "“quase preenche área”, apesar de ser uma curva. É a tradução geométrica do detalhe " +
        "infinito.</p>",
      visual: {
        type: "plane",
        bounds: [-0.9, -0.1, -0.4, 0.4],
        draw: function (plane) { render(plane, 80); },
      },
    });

    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Limite de iterações</b>: pontos que escapam <em>devagar</em> parecem “dentro” se N " +
        "for baixo. Mais iterações = borda mais fiel (e mais custo). Perto da fronteira, N precisa " +
        "crescer.</li>" +
        "<li><b>Critério |z| &gt; 2</b>: parar antes (ex.: &gt; 1) classificaria errado — a prova do " +
        "passo do limite exige o 2. (Para coloração suave, às vezes usa-se um raio de escape " +
        "<em>maior</em>, ex. 2¹⁶, para o <code>log</code> ficar mais preciso.)</li>" +
        "<li><b>Precisão no zoom</b>: ampliar demais esgota o <code>double</code> (≈15–16 dígitos) — " +
        "os pixels colapsam num mesmo valor e a imagem vira <span class='no'>blocos chapados</span>. " +
        "Zooms profundos exigem aritmética de <b>precisão arbitrária</b> (big floats).</li>" +
        "<li><b>Custo</b>: é uma iteração por pixel × N — fractais são naturalmente paralelos (cada " +
        "pixel é independente), feitos sob medida para a GPU.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "A grande ideia",
            html: "A forma não é armazenada — é <b>gerada</b> por <code>z ← z² + c</code> mais o teste " +
              "de escape <code>|z| &gt; 2</code>, ponto a ponto. Fixe z₀ e varra c → Mandelbrot; " +
              "fixe c e varra z₀ → Julia.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g14-mandelbrot",
    num: "✺",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Mandelbrot / fractais",
    type: "conceitual",
    tags: ["fractais", "mandelbrot", "julia", "iteração"],
    hubDesc: "z ← z² + c, por que |z|>2 (prova), coloração por tempo de escape (e suave), conjuntos de Julia e auto-similaridade.",
    statement:
      "Entenda a geração do conjunto de Mandelbrot: o processo iterativo z ← z² + c, por que o " +
      "critério de escape é exatamente |z| > 2, a coloração por tempo de escape (com versão suave), a " +
      "relação com os conjuntos de Julia e os limites de precisão no zoom.",
    parts: [{ label: "Guia", build: build }],
  });
})();
