/*
 * g04-bresenham-circ.js — Guia: Bresenham (ponto médio) para circunferências.
 * A função implícita F(x,y) = x² + y² − r² avaliada no ponto médio (x+1, y−½),
 * de onde sai p₀ ≈ 1 − r e os incrementos inteiros; por que basta calcular 1
 * octante; como a simetria de 8 vias (quais reflexões) completa o resto.
 * Comparação com a abordagem trigonométrica.
 *
 * Algoritmo embutido (relativo ao centro), no mesmo estilo do exemplo do template.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  var XC = 0,
    YC = 0,
    Rr = 6;
  var BOUNDS = [-Rr - 2, Rr + 2, -Rr - 2, Rr + 2];

  // Octante (2º): pontos RELATIVOS ao centro, de (0,r) até a diagonal x=y.
  function circleBresenham(r) {
    var pts = [],
      x = 0,
      y = r,
      p = 1 - r;
    while (x <= y) {
      pts.push([x, y]);
      if (p < 0) {
        p = p + 2 * x + 3;
        x++;
      } else {
        p = p + 2 * (x - y) + 5;
        x++;
        y--;
      }
    }
    return pts;
  }
  function sym8(x, y, xc, yc) {
    return [
      [xc + x, yc + y],
      [xc - x, yc + y],
      [xc + x, yc - y],
      [xc - x, yc - y],
      [xc + y, yc + x],
      [xc - y, yc + x],
      [xc + y, yc - x],
      [xc - y, yc - x],
    ];
  }
  // Circunferência ideal (anel) desenhada direto no contexto.
  function ring(plane, color) {
    var ctx = plane.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(plane.cx(XC), plane.cy(YC), Rr * plane.scale, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.restore();
  }

  function build() {
    var octant = circleBresenham(Rr);
    var steps = [];

    function center(plane) {
      plane.point(XC, YC, { color: COL.muted, radius: 3, label: "C(" + XC + "," + YC + ")" });
    }

    // 1) Motivação
    steps.push({
      title: "Desenhar um círculo sem seno e cosseno",
      body:
        "<p>Dá para rasterizar pela equação paramétrica <code>x = r·cosθ, y = r·sinθ</code>, varrendo " +
        "θ. Mas isso custa <b>um seno e um cosseno por ponto</b> (caro em hardware antigo) e tem um " +
        "problema de amostragem: um passo de θ fixo gera pixels <b>juntos demais</b> perto dos polos e " +
        "<b>espaçados demais</b> onde o arco é mais “horizontal”, deixando <span class='no'>buracos</span> " +
        "ou repetindo pixels.</p>" +
        "<p>Bresenham troca tudo isso por <b>somas inteiras</b> — a mesma filosofia da reta, a decisão " +
        "inteira no ponto médio — e ainda explora a enorme <span class='hl'>simetria</span> do círculo " +
        "para fazer só 1/8 do trabalho.</p>" +
        "<p>Vamos usar o círculo de centro na origem e raio <span class='accent'>r = " +
        Rr +
        "</span> como exemplo ao longo do guia.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
        },
      },
    });

    // 2) Por que só um octante
    steps.push({
      title: "Calcular 1/8 e refletir o resto",
      body:
        "<p>O círculo centrado na origem é <b>simétrico</b> em relação aos dois eixos e às duas " +
        "diagonais — 4 retas de espelhamento que o cortam em <b>8 fatias iguais</b>. Logo, se eu " +
        "conheço <b>um</b> octante, conheço o círculo inteiro de graça.</p>" +
        "<p>Escolhemos o arco de <code>(0, r)</code> até a diagonal <code>x = y</code> (o " +
        "<span class='hl'>2º octante</span>, indo de cima para a direita). Por que esse? Porque nele " +
        "<code>x</code> cresce devagar e <code>y</code> decresce devagar com <code>|inclinação| ≤ 1</code> " +
        "— é o pedaço “bem comportado” onde, como na reta suave, <b>andar 1 em <code>x</code></b> a cada " +
        "passo nunca pula um pixel.</p>" +
        "<p>Os outros 7 octantes saem só <b>trocando sinais e eixos</b> (<code>±x, ±y</code> e " +
        "<code>±y, ±x</code>) — sem recalcular nada. Isso corta o trabalho por 8 e ainda garante uma " +
        "simetria <em>perfeita</em> no desenho, impossível de errar por arredondamento.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
          plane.segment([XC, YC], [XC + Rr, YC + Rr], { color: COL.cyan, dashed: true });
          plane.text(XC + Rr, YC + Rr, "x = y", { color: COL.cyan, dx: -28, dy: -6 });
          plane.pixel(XC, YC + Rr, { fill: COL.greenSoft, stroke: COL.green, label: "início" });
        },
      },
    });

    // 2b) Derivação: a função implícita e p0 = 1 - r
    steps.push({
      title: "De onde vem p₀ = 1 − r",
      body:
        "<p>Como na reta, partimos de uma <b>função implícita</b> que diz de que lado da curva está um " +
        "ponto. Para o círculo de raio <code>r</code>:</p>" +
        "<div class='formula'>F(x, y) = x² + y² − r²</div>" +
        "<ul>" +
        "<li><code>F = 0</code> → o ponto está <b>sobre</b> o círculo;</li>" +
        "<li><code>F &gt; 0</code> → está <b>fora</b> (mais longe que r);</li>" +
        "<li><code>F &lt; 0</code> → está <b>dentro</b>.</li>" +
        "</ul>" +
        "<p>No 2º octante andamos sempre <code>x++</code>; a dúvida é se <code>y</code> deve cair. Os " +
        "candidatos são <span class='accent'>E = (x+1, y)</span> e <span class='hl'>SE = (x+1, y−1)</span>, " +
        "e o juiz é o <b>ponto médio</b> <code>M = (x+1, y−½)</code>. Avaliamos <code>F</code> nele:</p>" +
        "<div class='formula'>p = F(x+1, y−½) = (x+1)² + (y−½)² − r²</div>" +
        "<p>No <b>primeiro</b> passo, <code>x = 0</code> e <code>y = r</code>:</p>" +
        "<div class='formula'>p₀ = (0+1)² + (r−½)² − r²\n= 1 + r² − r + ¼ − r²\n= 5⁄4 − r ≈ 1 − r</div>" +
        "<p>O <code>5⁄4</code> só aparece por causa do ½ do meio-ponto; como usamos apenas o <b>sinal</b> " +
        "de <code>p</code> e <code>r</code> é inteiro, arredondamos para <span class='hl'>p₀ = 1 − r</span> " +
        "(= 1 − " +
        Rr +
        " = " +
        (1 - Rr) +
        ") sem trocar nenhuma decisão. A partir daí <code>p</code> avança só por somas inteiras.</p>",
      visual: {
        type: "plane",
        bounds: [-1, Rr + 2, -1, Rr + 2],
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
          plane.pixel(XC, YC + Rr, { fill: COL.accentSoft, stroke: COL.accent, label: "(0,r)" });
          plane.pixel(XC + 1, YC + Rr, { fill: "transparent", stroke: COL.cyan, label: "E" });
          plane.pixel(XC + 1, YC + Rr - 1, { fill: "transparent", stroke: COL.green, label: "SE" });
          plane.point(XC + 1, YC + Rr - 0.5, { color: COL.yellow, radius: 4, label: "M", labelColor: COL.yellow });
        },
      },
    });

    // 3) Variável de decisão / incrementos
    steps.push({
      title: "Os incrementos: por que +3 e +5",
      body:
        "<p>Começamos em <code>(x, y) = (0, " +
        Rr +
        ")</code> com <code>p₀ = 1 − r = " +
        (1 - Rr) +
        "</code>. A cada passo o sinal de <code>p</code> decide o pixel — exatamente como na reta, " +
        "mas agora o “meio-fio” é o círculo:</p>" +
        "<div class='formula'>se p &lt; 0 (médio dentro) → Leste:    x++,      p += 2x+3\nse p ≥ 0 (médio fora)   → Sudeste:  x++, y--, p += 2(x−y)+5</div>" +
        "<p>De onde saem o <code>+3</code> e o <code>+5</code>? São a <b>variação de <code>p</code></b> " +
        "ao deslizar o ponto médio para o próximo passo — e, de novo, constantes que não exigem " +
        "multiplicação no laço. Escolhendo <b>E</b>, o próximo médio anda só em <code>x</code>:</p>" +
        "<div class='formula'>Δp = (x+2)² − (x+1)² = 2x + 3</div>" +
        "<p>Escolhendo <b>SE</b>, o médio anda em <code>x</code> e desce em <code>y</code>:</p>" +
        "<div class='formula'>Δp = (2x+3) + [(y−3⁄2)² − (y−½)²] = (2x+3) + (2−2y) = 2(x−y)+5</div>" +
        "<p>(Aqui <code>x, y</code> são os valores <em>antes</em> de incrementar — a ordem usada no " +
        "código.) O laço roda enquanto <code>x ≤ y</code>: ao cruzar a diagonal <code>x = y</code> o " +
        "octante acabou.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          ring(plane, COL.muted);
          plane.pixel(XC, YC + Rr, { fill: COL.greenSoft, stroke: COL.green });
        },
      },
    });

    // 4..n) Octante passo a passo
    octant.forEach(function (rel, i) {
      var next = octant[i + 1];
      var last = !next;
      var wentSE = next && next[1] < rel[1]; // y caiu → Sudeste
      steps.push({
        title: "Octante — ponto " + (i + 1) + ": (" + rel[0] + ", " + rel[1] + ")",
        body:
          "<p>Pixel relativo <span class='accent'>(" +
          rel[0] +
          ", " +
          rel[1] +
          ")</span> → absoluto <span class='hl'>(" +
          (XC + rel[0]) +
          ", " +
          (YC + rel[1]) +
          ")</span> (somando o centro).</p>" +
          (i === 0
            ? "<p>É o topo do círculo, com <code>x = 0</code>. Daqui <code>x</code> só cresce.</p>"
            : "") +
          (last
            ? "<p>Agora <code>x = " +
              rel[0] +
              "</code> e <code>y = " +
              rel[1] +
              "</code>: chegamos à diagonal <code>x = y</code>. Como o próximo passo teria " +
              "<code>x &gt; y</code>, o laço <b>para</b> — o octante está completo com " +
              octant.length +
              " pixels.</p>"
            : "<p>Pixel " +
              (i + 1) +
              " de " +
              octant.length +
              ". O sinal de <code>p</code> mandou ir para <span class='hl'>" +
              (wentSE ? "Sudeste (x++, y--)" : "Leste (x++, y mantém)") +
              "</span>, então o próximo é <code>(" +
              next[0] +
              ", " +
              next[1] +
              ")</code>.</p>"),
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            center(plane);
            ring(plane, COL.muted);
            for (var k = 0; k < i; k++)
              plane.pixel(XC + octant[k][0], YC + octant[k][1], {
                fill: COL.accentSoft,
                stroke: COL.accent,
              });
            plane.pixel(XC + rel[0], YC + rel[1], { fill: COL.greenSoft, stroke: COL.green });
          },
        },
      });
    });

    // n+1) Simetria de 8 vias
    var base = octant[Math.min(2, octant.length - 1)];
    var sym = sym8(base[0], base[1], XC, YC);
    steps.push({
      title: "Simetria de 8 vias",
      body:
        "<p>Cada pixel <code>(x, y)</code> do octante (relativo ao centro) gera <b>8 pixels</b>. " +
        "Quatro vêm de espelhar nos eixos — trocar o sinal de <code>x</code> e/ou de <code>y</code>:</p>" +
        "<div class='formula'>(x, y)   (−x, y)   (x, −y)   (−x, −y)</div>" +
        "<p>Os outros quatro vêm de refletir na diagonal <code>x = y</code>, que <b>troca os eixos</b> " +
        "(<code>x ↔ y</code>), e então espelhar nos eixos de novo:</p>" +
        "<div class='formula'>(y, x)   (−y, x)   (y, −x)   (−y, −x)</div>" +
        "<p>São as <b>4 retas de simetria</b> (2 eixos + 2 diagonais) gerando 8 imagens. Só ao final " +
        "somamos o centro <code>(xc, yc)</code>. Para o ponto <span class='accent'>(" +
        base[0] +
        ", " +
        base[1] +
        ")</span> os 8 simétricos ficam:</p>" +
        "<div class='ex-coordlist'>" +
        sym
          .map(function (p) {
            return "<span class='ex-coord green'>(" + p[0] + ", " + p[1] + ")</span>";
          })
          .join("") +
        "</div>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          octant.forEach(function (rel) {
            plane.pixel(XC + rel[0], YC + rel[1], { fill: COL.accentSoft, stroke: COL.accent });
          });
          sym.forEach(function (p) {
            plane.pixel(p[0], p[1], { fill: COL.greenSoft, stroke: COL.green });
          });
        },
      },
    });

    // n+2) Círculo completo
    steps.push({
      title: "Circunferência completa",
      body:
        "<p>Aplicando a simetria a <em>todos</em> os " +
        octant.length +
        " pontos do octante, fechamos o círculo inteiro — tendo calculado de verdade só 1/8 dele. O " +
        "laço fez ~<code>r/√2</code> iterações; o resto é cópia barata.</p>" +
        "<p>Repare que os pixels se <b>adensam</b> perto dos eixos (onde o arco é quase horizontal/" +
        "vertical) e ficam mais espaçados perto das diagonais — o oposto do problema da amostragem " +
        "por θ fixo, e sem nenhum buraco.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          octant.forEach(function (rel) {
            sym8(rel[0], rel[1], XC, YC).forEach(function (p) {
              plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent });
            });
          });
        },
      },
    });

    // n+3) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Bresenham × trigonometria",
        intro:
          "<p>Os dois desenham o mesmo círculo, mas com custos bem diferentes. Por que o método " +
          "incremental venceu para esta tarefa em hardware:</p>",
        headers: ["", "x=r·cosθ", "Bresenham"],
        rows: [
          ["Aritmética", "real (seno/cosseno)", "inteira (somas)"],
          ["Custo por ponto", "1 seno + 1 cosseno", "1 soma + teste de sinal"],
          ["Buracos/dupes", "dependem do passo de θ", "nenhum (grade exata)"],
          ["Trabalho", "todo o círculo", "1 octante + simetria"],
          ["Erro acumulado", "drift de θ em floats", "nenhum (exato)"],
          ["Hardware", "ruim", "ótimo"],
        ],
      })
    );

    // n+3b) Conexões e aplicações
    steps.push({
      title: "Onde isso reaparece",
      body:
        "<p>O ponto médio do círculo é um caso de uma receita maior: <b>escolher o próximo pixel pelo " +
        "sinal de uma função implícita <code>F</code>, atualizada por somas</b>.</p>" +
        "<ul>" +
        "<li><b>Retas</b>: a mesma ideia com <code>F(x,y)=Δy·x−Δx·y+c</code> (ver Bresenham para retas) " +
        "— círculo e reta são duas faces do mesmo método do ponto médio.</li>" +
        "<li><b>Elipses</b>: <code>F(x,y)=b²x²+a²y²−a²b²</code>. Como a inclinação passa por 45° em " +
        "pontos diferentes, a elipse é varrida em <b>duas regiões</b> (e há só simetria de 4, não de 8).</li>" +
        "<li><b>Arcos, setores e cantos arredondados</b>: gera-se o octante e aplicam-se só as " +
        "reflexões desejadas — base de bordas arredondadas em UI e de <em>circles</em> em editores.</li>" +
        "<li><b>Anti-aliasing</b>: como na reta (Wu), dá para acender 2 pixels por passo ponderados pela " +
        "distância ao arco ideal, suavizando o serrilhado.</li>" +
        "<li><b>Hardware/plotters</b>: por usar só inteiros, foi gravado em GPUs antigas e move cabeças " +
        "de CNC em arcos (o comando <code>G02/G03</code> do G-code).</li>" +
        "</ul>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          center(plane);
          octant.forEach(function (rel) {
            sym8(rel[0], rel[1], XC, YC).forEach(function (p) {
              plane.pixel(p[0], p[1], { fill: COL.accentSoft, stroke: COL.accent });
            });
          });
        },
      },
    });

    // n+4) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>Sair do octante</b>: o laço termina em <code>x &gt; y</code>; ir além faz o arco " +
        "ultrapassar a diagonal e <b>duplicar</b> pixels já cobertos pela simetria.</li>" +
        "<li><b>Centro fora da origem</b>: calcule o octante sempre <b>relativo</b> a (0,0) e some " +
        "<code>(xc, yc)</code> só na simetria — assim a derivação de <code>p</code> não muda.</li>" +
        "<li><b>Pontos com menos de 8 imagens</b>: na diagonal <code>x = y</code> (e no eixo, " +
        "<code>x = 0</code>) algumas reflexões coincidem, gerando 4 pixels em vez de 8 — é normal, não " +
        "um bug; só evite acender o mesmo pixel duas vezes se isso importar (ex.: blend).</li>" +
        "<li><b>p₀ inteiro</b>: usar <code>1 − r</code> (em vez de <code>5⁄4 − r</code>) é a " +
        "aproximação correta — o sinal nunca muda, e fica tudo inteiro.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "A grande sacada",
            html:
              "Mesma filosofia da reta de Bresenham (decisão inteira no ponto médio) + a " +
              "<b>simetria do círculo</b> para fazer 1/8 do trabalho.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g04-bresenham-circ",
    num: "○",
    subject: "Computação Gráfica",
    section: "Rasterização",
    title: "Bresenham para circunferências",
    type: "computacional",
    tags: ["rasterização", "circunferência", "bresenham", "simetria", "ponto médio"],
    hubDesc: "A função implícita F=x²+y²−r², a derivação de p₀ = 1 − r e dos incrementos, 1 octante + simetria de 8 vias.",
    statement:
      "Entenda o algoritmo do ponto médio de Bresenham para circunferências: a função implícita " +
      "F(x,y) = x² + y² − r² avaliada no ponto médio (x+1, y−½), de onde saem p₀ = 1 − r e os " +
      "incrementos inteiros; por que se calcula apenas um octante; como a simetria de 8 vias completa " +
      "o desenho; e as conexões com retas, elipses e o anti-aliasing.",
    parts: [{ label: "Guia", build: build }],
  });
})();
