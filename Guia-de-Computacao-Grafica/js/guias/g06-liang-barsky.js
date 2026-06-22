/*
 * g06-liang-barsky.js — Guia: recorte de retas por Liang-Barsky (paramétrico).
 * A reta P(u) = P0 + u·(P1−P0), as quatro condições p·u ≤ q, o significado de
 * p<0 (entrada) e p>0 (saída), e a atualização de u1 = max e u2 = min.
 * Comparação com Cohen-Sutherland.
 *
 * Reusa window.ALG.liangBarsky (traço exato com frações).
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;

  var W = { xmin: -2, xmax: 5, ymin: 1, ymax: 6 };
  var P0 = { x: -4, y: 0 },
    P1 = { x: 6, y: 8 };
  var DX = P1.x - P0.x,
    DY = P1.y - P0.y;
  var BOUNDS = [-6, 8, -2, 9];

  function at(u) {
    return [P0.x + u * DX, P0.y + u * DY];
  }
  function win(plane) {
    plane.window(W.xmin, W.xmax, W.ymin, W.ymax, { fill: COL.accentSoft, stroke: COL.accent });
    plane.text(W.xmin, W.ymax, "janela", { color: COL.accent, dx: 2, dy: -6 });
  }
  function frpair(P) {
    return "(" + P.x.str() + ", " + P.y.str() + ")";
  }

  function build() {
    var steps = [];
    var res = ALG.liangBarsky(P0, P1, W);

    // 1) Motivação
    steps.push({
      title: "A reta como um parâmetro u",
      body:
        "<p>Cohen-Sutherland pensa em <em>regiões</em>; Liang-Barsky pensa em <em>um número</em>. " +
        "Descreve a reta por um <b>parâmetro</b> que desliza de uma ponta à outra:</p>" +
        "<div class='formula'>P(u) = P₀ + u·(P₁ − P₀),   u ∈ [0, 1]\n" +
        "x(u) = x₀ + u·Δx\ny(u) = y₀ + u·Δy</div>" +
        "<p>Em <code>u = 0</code> estamos em P₀; em <code>u = 1</code>, em P₁; valores intermediários " +
        "varrem o segmento. Recortar vira <b>uma pergunta só</b>: para qual faixa de <code>u</code> o " +
        "ponto fica dentro da janela?</p>" +
        "<p>A grande sacada é trabalhar no <span class='hl'>espaço do parâmetro</span>, não no plano. " +
        "Achamos a faixa <code>[u₁, u₂]</code> com pura álgebra — sem testar pixel por pixel e sem " +
        "recortar a mesma reta várias vezes, como Cohen-Sutherland às vezes faz.</p>" +
        "<p>Exemplo de trabalho: <span class='accent'>P₀(-4, 0)</span> → <span class='accent'>P₁(6, 8)</span> " +
        "(logo <code>Δx = 10</code>, <code>Δy = 8</code>) contra a janela <code>x ∈ [-2, 5]</code>, " +
        "<code>y ∈ [1, 6]</code>.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, lineWidth: 2 });
          plane.point(P0.x, P0.y, { color: COL.yellow, radius: 4, label: "u=0" });
          plane.point(P1.x, P1.y, { color: COL.yellow, radius: 4, label: "u=1" });
        },
      },
    });

    // 2) As quatro condições
    steps.push({
      title: "Quatro bordas → quatro condições p·u ≤ q",
      body:
        "<p>“Estar dentro” são 4 desigualdades, uma por borda. Vejamos a derivação na borda " +
        "<b>esquerda</b>, <code>x ≥ xmin</code>. Substitua <code>x = x₀ + u·Δx</code>:</p>" +
        "<div class='formula'>x₀ + u·Δx ≥ xmin\nu·Δx ≥ xmin − x₀\n−Δx·u ≤ x₀ − xmin</div>" +
        "<p>(o sinal virou ao multiplicar por −1). Já está no formato <code>p·u ≤ q</code> com " +
        "<code>p = −Δx</code> e <code>q = x₀ − xmin</code>. As outras três saem igual:</p>" +
        "<div class='formula'>esquerda x ≥ xmin :  p = −Δx ,  q = x₀ − xmin\n" +
        "direita  x ≤ xmax :  p = +Δx ,  q = xmax − x₀\n" +
        "inferior y ≥ ymin :  p = −Δy ,  q = y₀ − ymin\n" +
        "superior y ≤ ymax :  p = +Δy ,  q = ymax − y₀</div>" +
        "<p>Pondo as 4 numa só linha: <code>pₖ·u ≤ qₖ</code> para <code>k = 1..4</code>. Onde " +
        "<code>p ≠ 0</code>, a fronteira é cruzada em <code>u = q/p</code>.</p>" +
        "<p>O <b>sinal de p</b> conta a história (porque dividir a desigualdade por p inverte o sentido " +
        "quando <code>p &lt; 0</code>):</p>" +
        "<ul><li><code>p &lt; 0</code>: <code>u ≥ q/p</code> — a reta <b>entra</b> por essa borda → " +
        "candidata a <b>u₁</b> (limite inferior);</li>" +
        "<li><code>p &gt; 0</code>: <code>u ≤ q/p</code> — a reta <b>sai</b> por essa borda → candidata a " +
        "<b>u₂</b> (limite superior);</li>" +
        "<li><code>p = 0</code>: <code>0 ≤ q</code>, sem <code>u</code> — paralela à borda (caso " +
        "especial, ver final).</li></ul>" +
        "<p>Intuição do sinal: <code>p = ±Δ</code> mede se a coordenada <em>cresce</em> ou " +
        "<em>decresce</em> ao atravessar aquela borda no sentido de P₀→P₁ — quem cresce em direção à " +
        "janela está entrando.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, dashed: true });
        },
      },
    });

    // 3) u1 = max, u2 = min
    steps.push({
      title: "Juntando: u₁ = max, u₂ = min",
      body:
        "<p>Cada <b>entrada</b> empurra o início para frente; cada <b>saída</b> puxa o fim para trás. " +
        "Estar dentro da janela é satisfazer <em>todas</em> as desigualdades ao mesmo tempo, então a " +
        "faixa visível é a <b>interseção</b> de todos os limites:</p>" +
        "<div class='formula'>u₁ = max(0, todas as entradas q/p)\nu₂ = min(1, todas as saídas q/p)</div>" +
        "<p>Imagine duas pinças deslizando sobre o segmento: <code>u₁</code> vem da esquerda, " +
        "<code>u₂</code> da direita, e elas só param onde a reta realmente cruza uma borda. Começamos " +
        "com o segmento inteiro <code>u₁ = 0, u₂ = 1</code> e vamos <b>apertando</b> borda a borda. " +
        "O <code>max</code>/<code>min</code> garante que ficamos com a faixa mais restritiva.</p>" +
        "<p>No fim:</p>" +
        "<ul><li>se <code>u₁ ≤ u₂</code> → a pinça não cruzou: existe parte visível em " +
        "<code>[u₁, u₂]</code>;</li>" +
        "<li>se <code>u₁ &gt; u₂</code> → as pinças se ultrapassaram: a reta passa fora, <b>rejeita</b>.</li></ul>" +
        "<p>Um detalhe de eficiência: dá para <b>abortar cedo</b> assim que <code>u₁ &gt; u₂</code>, sem " +
        "examinar as bordas restantes.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.yellow, dashed: true });
        },
      },
    });

    // 4..n) Por borda
    res.steps.forEach(function (st) {
      if (st.type !== "boundary") return;
      var e = st.table[st.i];
      var u1 = st.u1.num(),
        u2 = st.u2.num();
      steps.push({
        title: "Borda " + e.name,
        body:
          "<p>Condição <code>" +
          e.name +
          "</code> → <code>p = " +
          e.p.str() +
          "</code>, <code>q = " +
          e.q.str() +
          "</code>" +
          (e.r ? ", <code>q/p = " + e.r.str() + "</code>" : "") +
          ".</p>" +
          "<p>" +
          (e.p.num() === 0
            ? "Como <code>p = 0</code>, a reta é <b>paralela</b> a esta borda — não há cruzamento. "
            : e.p.num() < 0
              ? "Como <code>p &lt; 0</code>, esta é uma borda de <b class='ok'>entrada</b>: ela " +
                "disputa o limite inferior <code>u₁</code> via <code>max</code>. "
              : "Como <code>p &gt; 0</code>, esta é uma borda de <b class='no'>saída</b>: ela disputa o " +
                "limite superior <code>u₂</code> via <code>min</code>. ") +
          e.action +
          "</p>" +
          "<p>Faixa atual: <span class='hl'>u₁ = " +
          st.u1.str() +
          ", u₂ = " +
          st.u2.str() +
          "</span>" +
          (u1 <= u2 ? "" : " — <span class='no'>u₁ &gt; u₂, já daria para rejeitar</span>") +
          ".</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            win(plane);
            plane.segment(P0, P1, { color: COL.muted, dashed: true });
            if (u1 <= u2) {
              plane.segment(at(u1), at(u2), { color: COL.orange, lineWidth: 3 });
              plane.point(at(u1)[0], at(u1)[1], { color: COL.orange, radius: 4 });
              plane.point(at(u2)[0], at(u2)[1], { color: COL.orange, radius: 4 });
            }
          },
        },
      });
    });

    // n+1) Resultado
    if (res.accepted) {
      steps.push({
        title: "Resultado",
        body:
          "<p>Terminadas as 4 bordas: <code>u₁ = " +
          res.u1.str() +
          " ≤ u₂ = " +
          res.u2.str() +
          "</code> → <span class='ok'>aceito</span>. Basta avaliar a reta nesses dois parâmetros:</p>" +
          "<div class='formula'>A = P(u₁) = P₀ + " + res.u1.str() + "·(Δx, Δy) = " + frpair(res.A) + "\n" +
          "B = P(u₂) = P₀ + " + res.u2.str() + "·(Δx, Δy) = " + frpair(res.B) + "</div>" +
          "<p>A parte visível vai de <span class='ok'>" +
          frpair(res.A) +
          "</span> (na borda esquerda) a <span class='ok'>" +
          frpair(res.B) +
          "</span> (na borda superior).</p>" +
          "<p>Repare: aqui <b>u₁ veio de uma borda em x</b> e <b>u₂ de uma borda em y</b> — o recorte " +
          "real costuma misturar as duas direções. E nenhum extremo foi recortado mais de uma vez, ao " +
          "contrário do que pode acontecer em Cohen-Sutherland.</p>",
        visual: {
          type: "plane",
          bounds: BOUNDS,
          draw: function (plane) {
            win(plane);
            plane.segment(P0, P1, { color: COL.muted, dashed: true });
            plane.segment([res.A.x.num(), res.A.y.num()], [res.B.x.num(), res.B.y.num()], {
              color: COL.green,
              lineWidth: 3.5,
            });
            plane.point(res.A.x.num(), res.A.y.num(), { color: COL.green, radius: 5 });
            plane.point(res.B.x.num(), res.B.y.num(), { color: COL.green, radius: 5 });
          },
        },
      });
    }

    // n+2) Tabela
    steps.push({
      title: "O traço em tabela",
      body:
        "<p>As quatro bordas, na ordem, e como cada uma mexeu em u₁/u₂. Acompanhe as colunas " +
        "<code>u₁</code> e <code>u₂</code> apertando linha a linha: <code>u₁</code> sobe (de 0 até " +
        res.u1.str() +
        "), <code>u₂</code> desce (de 1 até " +
        res.u2.str() +
        "), e elas não se cruzam — logo, aceita.</p>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.table(host, {
            headers: ["borda", "p", "q", "q/p", "u₁", "u₂"],
            rows: res.table.map(function (e) {
              return [e.name, e.p.str(), e.q.str(), e.r ? e.r.str() : "—", e.u1.str(), e.u2.str()];
            }),
          });
        },
      },
    });

    // n+2b) Segundo exemplo: reta paralela rejeitada (novo passo)
    steps.push({
      title: "Caso especial: uma reta paralela",
      body:
        "<p>O exemplo principal não tinha bordas <code>p = 0</code>. Veja agora a horizontal " +
        "<span class='no'>Q₀(-6, 8) → Q₁(8, 8)</span> (<code>Δx = 14</code>, <code>Δy = 0</code>), que " +
        "passa rente <b>acima</b> da janela:</p>" +
        "<div class='formula'>x ≥ xmin: p = −14, q = −4 → entrada, q/p = 2/7  → u₁ = 2/7\n" +
        "x ≤ xmax: p = +14, q = 11 → saída,   q/p = 11/14 → u₂ = 11/14\n" +
        "y ≥ ymin: p = 0,  q = 7 ≥ 0 → paralela DENTRO, ignora\n" +
        "y ≤ ymax: p = 0,  q = −2 < 0 → paralela FORA → REJEITA</div>" +
        "<p>Quando <code>p = 0</code> não há divisão (seria por zero): a reta nunca cruza aquela borda, " +
        "então só perguntamos <b>de que lado ela está</b>. O sinal de <code>q</code> responde: " +
        "<code>q ≥ 0</code> quer dizer “do lado de dentro daquela borda” (ignore-a); <code>q &lt; 0</code> " +
        "quer dizer “totalmente fora” e mata a reta na hora.</p>" +
        "<p>Aqui <code>y = 8 &gt; ymax = 6</code>, então a borda superior dá <code>q &lt; 0</code> e " +
        "rejeita — sem nem precisar de <code>u₁</code> e <code>u₂</code> (que, repare, ainda dariam " +
        "<code>u₁ = 2/7 ≤ u₂ = 11/14</code> olhando só o x).</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment([-6, 8], [8, 8], { color: COL.red, lineWidth: 2.5 });
          plane.point(-6, 8, { color: COL.red, radius: 4, label: "Q₀" });
          plane.point(8, 8, { color: COL.red, radius: 4, label: "Q₁" });
          plane.segment([BOUNDS[0], W.ymax], [BOUNDS[1], W.ymax], { color: COL.muted, dashed: true, lineWidth: 1 });
        },
      },
    });

    // n+3) Comparação
    steps.push(
      EX.Slides.comparison({
        title: "Liang-Barsky × Cohen-Sutherland",
        intro: "<p>Mesma tarefa, filosofias diferentes:</p>",
        headers: ["", "Liang-Barsky", "Cohen-Sutherland"],
        rows: [
          ["Base", "paramétrica (u)", "códigos de região"],
          ["Interseções", "só calcula u (1 divisão/borda)", "pode recortar várias vezes"],
          ["Eficiência", "geralmente melhor", "ótimo se maioria é trivial"],
          ["Rejeita cedo", "u₁ > u₂", "AND dos códigos ≠ 0"],
        ],
      })
    );

    // n+3b) Por que é eficiente / aplicações
    steps.push({
      title: "Por que costuma ganhar (e onde aparece)",
      body:
        "<p>A vantagem sobre Cohen-Sutherland é estrutural. Liang-Barsky <b>não recorta a reta " +
        "repetidamente</b>: ele computa quatro razões <code>q/p</code> e fica com um <code>max</code> e " +
        "um <code>min</code>. No pior caso de Cohen-Sutherland, o mesmo extremo é recortado borda após " +
        "borda, recalculando o código a cada vez — trabalho que aqui simplesmente não existe.</p>" +
        "<p>Outro ganho: por trabalhar no <b>espaço do parâmetro</b>, ele só calcula o ponto " +
        "<code>(x, y)</code> da interseção <b>no final</b>, para <code>u₁</code> e <code>u₂</code>. " +
        "Cohen-Sutherland gera pontos intermediários que podem ser descartados depois.</p>" +
        "<p>A mesma ideia paramétrica generaliza para o <b>Cyrus-Beck</b>, que recorta contra qualquer " +
        "janela <b>convexa</b> (não só retângulos): troca-se cada <code>p, q</code> por um produto " +
        "escalar com a normal da aresta. E os parâmetros <code>u</code> reaparecem como os " +
        "<code>t</code> de interseção no <b>ray casting</b> (ver guia) — a álgebra de “onde a reta " +
        "encontra a fronteira” é a mesma.</p>",
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          win(plane);
          plane.segment(P0, P1, { color: COL.muted, dashed: true });
          if (res.accepted) {
            plane.segment([res.A.x.num(), res.A.y.num()], [res.B.x.num(), res.B.y.num()], {
              color: COL.green,
              lineWidth: 3.5,
            });
            plane.text(at(res.u1.num())[0], at(res.u1.num())[1], "u₁", { color: COL.green, dx: -14, dy: 4 });
            plane.text(at(res.u2.num())[0], at(res.u2.num())[1], "u₂", { color: COL.green, dx: 6, dy: -4 });
          }
        },
      },
    });

    // n+4) Armadilhas
    steps.push({
      title: "Armadilhas e resumo",
      body:
        "<ul>" +
        "<li><b>p = 0 (paralela)</b>: não há divisão (seria por zero). Se <code>q &lt; 0</code>, está " +
        "totalmente fora daquela borda → rejeita; se <code>q ≥ 0</code>, ignore a borda.</li>" +
        "<li><b>Entrada vs saída</b>: trocar o papel de <code>p&lt;0</code> (entrada, mexe em u₁) e " +
        "<code>p&gt;0</code> (saída, mexe em u₂) inverte u₁/u₂ e quebra tudo.</li>" +
        "<li><b>Clamp inicial</b>: comece com <code>u₁ = 0</code> e <code>u₂ = 1</code> — assim o " +
        "resultado nunca escapa do segmento original.</li>" +
        "<li><b>Abortar cedo</b>: assim que <code>u₁ &gt; u₂</code>, pare; insistir nas bordas " +
        "restantes só desperdiça trabalho.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Em uma frase",
            html:
              "Recortar vira achar <b>o maior intervalo de u</b> em que a reta fica dentro — quatro " +
              "razões <code>q/p</code> e um <code>max</code>/<code>min</code>.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g06-liang-barsky",
    num: "u",
    subject: "Computação Gráfica",
    section: "Recorte",
    title: "Liang-Barsky (recorte de retas)",
    type: "computacional",
    tags: ["recorte", "clipping", "paramétrica", "cyrus-beck"],
    hubDesc: "P(u)=P₀+u·(P₁−P₀); derivação de p·u≤q; u₁=max, u₂=min; caso paralelo (p=0); aceita se u₁≤u₂.",
    statement:
      "Entenda o recorte de retas por Liang-Barsky: a forma paramétrica, a derivação das quatro condições " +
      "p·u≤q, o significado de p<0 (entrada) e p>0 (saída), a atualização de u₁=max e u₂=min e o caso " +
      "paralelo (p=0). Inclui um segundo exemplo (reta rejeitada) e por que costuma vencer Cohen-Sutherland, " +
      "com as conexões para Cyrus-Beck e ray casting.",
    parts: [{ label: "Guia", build: build }],
  });
})();
