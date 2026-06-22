/*
 * g01-transformacoes.js — Guia: Transformações geométricas em coordenadas
 * homogêneas. Translação, escala, rotação, reflexão, cisalhamento, rotação com
 * ponto fixo e composição (ordem das matrizes). Foco no PORQUÊ de cada matriz,
 * de cada coluna e da ordem — com derivações e mini-contas trabalhadas.
 *
 * Reusa window.ALG (matMul, matCompose, matApply, mTranslate/Scale/RotateDeg/
 * ReflectX, applyToPolygon) e os helpers EX.Guia.mat/row/dom.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var ALG = window.ALG;
  var COL = EX.CartesianPlane.COLORS;
  var MAT = EX.Guia.mat,
    ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  // Triângulo de trabalho: A, B, C.
  var TRI = [
    [2, 1],
    [5, 1],
    [2, 3],
  ];
  var LBL = ["A", "B", "C"];

  // Número -> string curta (inteiro quando possível).
  function n2s(v) {
    var r = ALG.round2(v);
    if (Object.is(r, -0)) r = 0;
    return String(r);
  }
  // Matriz 3x3 numérica -> tabela com colchetes.
  function mat3(M) {
    return MAT(
      M.map(function (row) {
        return row.map(n2s);
      })
    );
  }
  // Desenha um polígono com vértices rotulados.
  function poly(plane, pts, color, opts) {
    opts = opts || {};
    plane.polygon(pts, {
      stroke: color,
      fill: opts.fill || false,
      dashed: opts.dashed,
      lineWidth: opts.lineWidth || 2,
    });
    if (opts.points !== false) {
      pts.forEach(function (p, i) {
        plane.point(p[0], p[1], {
          color: color,
          radius: 3,
          label: opts.labels ? opts.labels[i] : null,
          labelColor: color,
        });
      });
    }
  }
  function asPairs(pts) {
    return pts.map(function (p) {
      return [p.x, p.y];
    });
  }

  var BOUNDS = [-6, 11, -5, 8];

  function build() {
    var steps = [];

    // 1) Motivação
    steps.push({
      title: "Por que coordenadas homogêneas?",
      body:
        "<p>Em computação gráfica nós aplicamos <b>muitas</b> transformações em sequência a cada " +
        "vértice: o modelo é escalado, girado, posicionado na cena, visto pela câmera, projetado… " +
        "Para isso ser rápido e uniforme, queremos que <em>toda</em> transformação tenha a mesma forma.</p>" +
        "<p>O problema: escala e rotação são <b>lineares</b> — cabem numa multiplicação " +
        "<code>v' = M·v</code> com uma matriz 2×2. Mas a <b>translação</b> é uma <em>soma</em> " +
        "<code>v' = v + t</code>; nenhuma matriz 2×2 consegue somar uma constante (afinal " +
        "<code>M·0 = 0</code> sempre — uma matriz 2×2 prende a origem no lugar).</p>" +
        "<p>Misturar <span class='hl'>multiplicação</span> com <span class='hl'>soma</span> quebra a " +
        "composição: não dá para juntar a sequência inteira num único objeto. A saída é representar " +
        "todas as transformações — inclusive a translação — como <b>uma única multiplicação</b>.</p>",
      visual: DOM(
        ROW(
          "rotação/escala: " +
            MAT([["a", "b"], ["c", "d"]]) +
            "·" +
            MAT([["x"], ["y"]]) +
            "&nbsp;&nbsp;✔ linear"
        ) +
          ROW(
            "translação: " +
              MAT([["x"], ["y"]]) +
              "+" +
              MAT([["t<sub>x</sub>"], ["t<sub>y</sub>"]]) +
              "&nbsp;&nbsp;✘ soma, não multiplicação"
          )
      ),
    });

    // 2) A ideia: w = 1
    steps.push({
      title: "A ideia: uma terceira coordenada w = 1",
      body:
        "<p>Acrescentamos uma coordenada: o ponto <code>(x, y)</code> vira <code>(x, y, 1)ᵀ</code> e as " +
        "transformações passam a ser matrizes <b>3×3</b>. Pense nisso como mergulhar o plano " +
        "<code>z = 1</code> dentro do espaço 3D — trabalhamos numa fatia onde a última coordenada vale 1.</p>" +
        "<p>O truque está na <span class='hl'>última coluna</span>. Ao multiplicar, o <code>1</code> do " +
        "ponto <em>puxa</em> essa coluna inteira para o resultado — e a soma vira multiplicação. " +
        "Acompanhe a conta linha a linha:</p>" +
        "<div class='formula'>x' = 1·x + 0·y + t<sub>x</sub>·1 = x + t<sub>x</sub>\n" +
        "y' = 0·x + 1·y + t<sub>y</sub>·1 = y + t<sub>y</sub></div>" +
        "<p>A linha de baixo <code>[0 0 1]</code> só preserva o <code>w = 1</code>, para que o resultado " +
        "continue sendo um ponto válido e possa entrar na próxima matriz.</p>",
      visual: DOM(
        ROW(
          MAT([
            ["1", "0", "t<sub>x</sub>"],
            ["0", "1", "t<sub>y</sub>"],
            ["0", "0", "1"],
          ]) +
            "·" +
            MAT([["x"], ["y"], ["1"]]) +
            "=" +
            MAT([["x + t<sub>x</sub>"], ["y + t<sub>y</sub>"], ["1"]])
        )
      ),
    });

    // 3) Ponto vs vetor (w = 1 vs w = 0)
    steps.push({
      title: "Ponto (w = 1) × vetor (w = 0)",
      body:
        "<p>A coordenada extra distingue duas coisas que parecem iguais mas se transformam diferente:</p>" +
        "<ul>" +
        "<li><b>Ponto</b> <code>(x, y, 1)</code> — uma <em>posição</em>. Sente a translação.</li>" +
        "<li><b>Vetor/direção</b> <code>(x, y, 0)</code> — um <em>deslocamento</em> (normal, velocidade, " +
        "eixo). Como o <code>w = 0</code> zera a última coluna, a translação <span class='no'>não</span> " +
        "o afeta — e faz sentido: deslocar a cena toda não muda “para onde uma seta aponta”.</li>" +
        "</ul>" +
        "<p>Escala e rotação agem nos dois; só a translação enxerga o <code>w</code>. Guardar essa " +
        "distinção evita o erro clássico de transladar uma normal de superfície.</p>",
      visual: DOM(
        ROW(
          "ponto: T·" +
            MAT([["x"], ["y"], ["1"]]) +
            "=" +
            MAT([["x+t<sub>x</sub>"], ["y+t<sub>y</sub>"], ["1"]])
        ) +
          ROW(
            "vetor: T·" +
              MAT([["x"], ["y"], ["0"]]) +
              "=" +
              MAT([["x"], ["y"], ["0"]]) +
              "&nbsp;&nbsp;(intacto)"
          )
      ),
    });

    // 4) Translação
    var T = ALG.mTranslate(4, 2);
    var triT = asPairs(ALG.applyToPolygon(T, TRI));
    steps.push({
      title: "Translação T(tₓ, tᵧ)",
      body:
        "<p>A diagonal é a identidade (mantém <code>x</code> e <code>y</code>); a última coluna soma o " +
        "deslocamento. Aqui <span class='accent'>t = (4, 2)</span>, então o vértice " +
        "<code>A(2, 1)</code> vai para <span class='ok'>(6, 3)</span> — e todos os outros andam o " +
        "mesmo tanto.</p>" +
        "<p>Repare: forma, tamanho e orientação não mudam — só a posição. É a única transformação que " +
        "<em>precisava</em> da coluna extra. A inversa é trivial: <code>T(−tₓ, −tᵧ)</code> traz tudo de volta.</p>" +
        ROW(mat3(T)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triT, COL.accent, { fill: COL.accentSoft });
          plane.arrow(TRI[0], triT[0], { color: COL.yellow });
        },
      },
    });

    // 5) Escala
    var S = ALG.mScale(2, 2);
    var triS = asPairs(ALG.applyToPolygon(S, TRI));
    steps.push({
      title: "Escala S(sₓ, sᵧ)",
      body:
        "<p>Os fatores ficam na diagonal: <code>x' = sₓ·x</code>, <code>y' = sᵧ·y</code>. Aqui " +
        "<span class='accent'>s = (2, 2)</span> (uniforme — preserva proporções). Com " +
        "<code>sₓ ≠ sᵧ</code> a escala é <b>não-uniforme</b> e distorce o formato.</p>" +
        "<p>Detalhe central: a escala é <b>em relação à origem</b>. Multiplicar a coordenada por 2 " +
        "também <span class='hl'>dobra a distância até a origem</span> — por isso o triângulo cresce " +
        "<em>e</em> se afasta. Guarde esse efeito: é o motivo de precisarmos de <em>ponto fixo</em> " +
        "mais adiante.</p>" +
        "<p>Casos especiais: <code>s = 1</code> não faz nada; <code>0 &lt; s &lt; 1</code> encolhe; " +
        "<code>s &lt; 0</code> espelha (próximo passo). A inversa usa <code>1/sₓ, 1/sᵧ</code>.</p>" +
        ROW(mat3(S)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triS, COL.green, { fill: COL.greenSoft });
          plane.point(0, 0, { color: COL.yellow, radius: 4, label: "O" });
        },
      },
    });

    // 6) Rotação — derivação
    steps.push({
      title: "Rotação R(θ): de onde vêm cos e sin",
      body:
        "<p>Escreva o ponto em coordenadas polares: <code>x = r·cosφ</code>, <code>y = r·sinφ</code>. " +
        "Girar por <code>θ</code> mantém o raio <code>r</code> e soma <code>θ</code> ao ângulo:</p>" +
        "<div class='formula'>x' = r·cos(φ+θ),   y' = r·sin(φ+θ)</div>" +
        "<p>Aplicando as fórmulas de soma de arcos e substituindo <code>r·cosφ = x</code>, " +
        "<code>r·sinφ = y</code>:</p>" +
        "<div class='formula'>x' = x·cosθ − y·sinθ\ny' = x·sinθ + y·cosθ</div>" +
        "<p>Isso é exatamente <code>v' = R·v</code>. Outra leitura: cada <b>coluna</b> de R é o destino " +
        "de um eixo — <code>x̂ → (cosθ, sinθ)</code> e <code>ŷ → (−sinθ, cosθ)</code>. R é também em " +
        "torno da <b>origem</b>.</p>",
      visual: DOM(
        ROW(
          MAT([
            ["cosθ", "−sinθ", "0"],
            ["sinθ", "cosθ", "0"],
            ["0", "0", "1"],
          ]) +
            "·" +
            MAT([["x"], ["y"], ["1"]]) +
            "=" +
            MAT([["x cosθ − y sinθ"], ["x sinθ + y cosθ"], ["1"]])
        )
      ),
    });

    // 7) Rotação — exemplo concreto
    var R = ALG.mRotateDeg(90);
    var triR = asPairs(ALG.applyToPolygon(R, TRI));
    steps.push({
      title: "Rotação R(90°) na prática",
      body:
        "<p>Com <span class='accent'>θ = 90°</span>: <code>cosθ = 0</code>, <code>sinθ = 1</code>, " +
        "então <code>(x, y) → (−y, x)</code>. O vértice <code>B(5, 1)</code> vira " +
        "<span class='ok'>(−1, 5)</span>.</p>" +
        "<p>R é uma matriz <b>ortogonal</b> com determinante <code>+1</code>: preserva distâncias e " +
        "ângulos (é uma <em>isometria</em>) e mantém a orientação. Como bônus, sua inversa é a " +
        "<b>transposta</b> — que é justamente <code>R(−θ)</code>.</p>" +
        ROW("R(90°) =&nbsp;" + mat3(R)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triR, COL.purple, { fill: COL.accentSoft });
          plane.point(0, 0, { color: COL.yellow, radius: 4, label: "O" });
        },
      },
    });

    // 8) Reflexão
    var Fx = ALG.mReflectX();
    var triF = asPairs(ALG.applyToPolygon(Fx, TRI));
    steps.push({
      title: "Reflexão",
      body:
        "<p>Refletir no eixo <code>x</code> é trocar o sinal de <code>y</code>: " +
        "<code>(x, y) → (x, −y)</code> — basta um <code>−1</code> na diagonal. Para refletir no eixo " +
        "<code>y</code> seria <code>(−x, y)</code>; em <code>y = x</code>, trocar as coordenadas " +
        "<code>(y, x)</code>.</p>" +
        "<p>Reflexão é um caso particular de <b>escala com fator negativo</b>, então também acontece " +
        "<b>em relação a um eixo pela origem</b>. Seu determinante é <code>−1</code>: ela " +
        "<span class='hl'>inverte a orientação</span> (mão direita vira mão esquerda) — daí a sensação " +
        "de “virar do avesso”. Refletir numa reta qualquer usa o mesmo truque de eixo fixo do próximo passo.</p>" +
        ROW(mat3(Fx)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triF, COL.orange, { fill: COL.redSoft });
          plane.point(0, 0, { color: COL.yellow, radius: 4, label: "O" });
        },
      },
    });

    // 9) Cisalhamento (shear)
    var SH = [
      [1, 0.5, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    var triSH = asPairs(ALG.applyToPolygon(SH, TRI));
    steps.push({
      title: "Cisalhamento (shear)",
      body:
        "<p>O cisalhamento empurra cada ponto na horizontal por um tanto <b>proporcional à sua " +
        "altura</b>: <code>x' = x + k·y</code>, <code>y' = y</code>. Aqui <code>k = 0,5</code>. O efeito " +
        "é o de inclinar — pense num baralho empurrado de lado ou na letra itálica.</p>" +
        "<p>É linear (vira matriz), mas <span class='hl'>não</span> preserva ângulos nem comprimentos. " +
        "Curiosamente preserva <b>área</b> (determinante = 1). Aparece em fontes oblíquas e em algumas " +
        "decomposições de rotação.</p>" +
        ROW(mat3(SH)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triSH, COL.cyan, { fill: COL.accentSoft });
        },
      },
    });

    // 10) Rotação com ponto fixo (conjugação)
    var P = [2, 1]; // ponto fixo = vértice A
    var toOrigin = ALG.mTranslate(-P[0], -P[1]);
    var back = ALG.mTranslate(P[0], P[1]);
    // matCompose([1ª aplicada, …, última]) = última·…·primeira
    var Rp = ALG.matCompose([toOrigin, ALG.mRotateDeg(90), back]);
    var triRp = asPairs(ALG.applyToPolygon(Rp, TRI));
    var triMid = asPairs(ALG.applyToPolygon(toOrigin, TRI));
    steps.push({
      title: "Rotação com ponto fixo (conjugação)",
      body:
        "<p>Toda rotação da nossa matriz é <b>em torno da origem</b>. Para girar em torno de outro ponto " +
        "<span class='accent'>P(2, 1)</span> usamos três passos: <b>leve P até a origem</b> " +
        "(<code>T(−P)</code>), <b>gire</b> (<code>R</code>), <b>volte</b> (<code>T(P)</code>).</p>" +
        "<p>Por que funciona? Levamos o problema a um sistema onde <em>sabemos</em> resolver (a origem), " +
        "resolvemos, e desfazemos a mudança de coordenadas. Esse padrão " +
        "<em>mudar de referencial → fazer → desfazer</em> chama-se <b>conjugação</b> e reaparece em " +
        "reflexão sobre reta qualquer, escala em torno de um ponto, rotação 3D em torno de um eixo " +
        "arbitrário…</p>" +
        "<p>Note a ordem na fórmula: <code>T(−P)</code> aparece à direita porque é aplicada " +
        "<b>primeiro</b>.</p>" +
        ROW("M = T(P) · R(90°) · T(−P) =&nbsp;" + mat3(Rp)),
      visual: {
        type: "plane",
        bounds: BOUNDS,
        draw: function (plane) {
          poly(plane, TRI, COL.muted, { labels: LBL, dashed: true });
          poly(plane, triMid, COL.cyan, { dashed: true, points: false });
          poly(plane, triRp, COL.purple, { fill: COL.accentSoft });
          plane.point(P[0], P[1], { color: COL.yellow, radius: 5, ring: COL.yellow, label: "P (fixo)" });
        },
      },
    });

    // 11) Composição e ordem
    var RT = ALG.matMul(ALG.mRotateDeg(90), ALG.mTranslate(4, 0)); // R·T (aplica T primeiro)
    var TR = ALG.matMul(ALG.mTranslate(4, 0), ALG.mRotateDeg(90)); // T·R (aplica R primeiro)
    var pRT = ALG.matApply(RT, [1, 0]);
    var pTR = ALG.matApply(TR, [1, 0]);
    steps.push({
      title: "Composição: a ordem importa",
      body:
        "<p>Compor é multiplicar matrizes. Na convenção de <b>ponto-coluna</b> (<code>v' = M·v</code>), a " +
        "transformação aplicada <b>primeiro</b> fica à <b>direita</b> — perto do vetor:</p>" +
        "<p style='text-align:center'><code>C = Mₙ · … · M₂ · M₁</code> &nbsp;(aplica M₁ primeiro).</p>" +
        "<p>E multiplicação de matrizes <span class='hl'>não comuta</span>. Veja no ponto " +
        "<code>(1, 0)</code>: girar-depois-de-transladar dá <span class='ok'>(" +
        n2s(pRT.x) + ", " + n2s(pRT.y) + ")</span>; transladar-depois-de-girar dá <span class='no'>(" +
        n2s(pTR.x) + ", " + n2s(pTR.y) + ")</span>. Mesmas peças, ordens diferentes, lugares diferentes.</p>" +
        "<p>(Em livros que usam <b>vetor-linha</b> <code>v' = v·M</code> a ordem inverte: a 1ª aplicada " +
        "fica à esquerda. Não é contradição — é a outra convenção. Só não misture as duas.)</p>",
      visual: DOM(
        ROW("R · T =&nbsp;" + mat3(RT)) +
          ROW("T · R =&nbsp;" + mat3(TR)) +
          "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>mesmas peças, ordens diferentes → resultados diferentes</p>"
      ),
    });

    // 12) Pré-cálculo: uma matriz para o objeto todo
    steps.push({
      title: "Por que isso é tão usado: uma matriz para tudo",
      body:
        "<p>O ganho prático: como a sequência inteira vira <b>uma única matriz</b> <code>C</code>, " +
        "multiplicamos as matrizes <b>uma vez</b> e depois aplicamos <code>C</code> a <em>cada</em> " +
        "vértice. Um modelo com 100 mil vértices paga a composição uma vez, não por vértice.</p>" +
        "<p>É exatamente o que a GPU faz, só que com matrizes <b>4×4</b> em 3D: a famosa cadeia " +
        "<code>Projeção · Visão · Modelo</code> é pré-multiplicada na CPU e enviada pronta ao " +
        "<em>vertex shader</em>. As coordenadas homogêneas ainda servem de bônus para a " +
        "<b>projeção em perspectiva</b>, onde o <code>w</code> deixa de ser 1 e a divisão por " +
        "<code>w</code> cria o encolhimento com a distância.</p>",
      visual: DOM(
        ROW(
          "v' = (" +
            MAT([["P"]]) +
            "·" +
            MAT([["V"]]) +
            "·" +
            MAT([["M"]]) +
            ") · v&nbsp;&nbsp;→&nbsp;&nbsp;" +
            MAT([["C"]]) +
            "· v"
        ) +
          "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>compõe 1×, aplica a todos os vértices</p>"
      ),
    });

    // 13) O que cada transformação preserva
    steps.push(
      EX.Slides.comparison({
        title: "O que cada transformação preserva",
        intro:
          "<p>Uma forma de organizar tudo: por “quanto da figura sobrevive”. Quanto mais acima na " +
          "tabela, mais propriedades são mantidas.</p>",
        headers: ["Transformação", "Distância", "Ângulo", "Área", "Orientação"],
        rows: [
          ["Translação / Rotação", "✔", "✔", "✔", "✔"],
          ["Reflexão", "✔", "✔", "✔", "✘ inverte"],
          ["Escala uniforme", "✘", "✔", "✘", "✔"],
          ["Escala não-uniforme", "✘", "✘", "✘", "✔"],
          ["Cisalhamento", "✘", "✘", "✔", "✔"],
        ],
      })
    );

    // 14) Resumo / regra de ouro
    steps.push({
      title: "Resumo",
      body:
        "<ul>" +
        "<li><b>Translação</b>: última coluna. Inversa <code>T(−t)</code>.</li>" +
        "<li><b>Escala/Reflexão</b>: diagonal (em relação à origem/eixo). Inversa <code>1/s</code>.</li>" +
        "<li><b>Rotação</b>: bloco cos/sin (em relação à origem). Inversa = transposta = <code>R(−θ)</code>.</li>" +
        "<li><b>Cisalhamento</b>: termo fora da diagonal; preserva área.</li>" +
        "<li><b>Ponto/eixo fixo</b>: <code>T(P)·(…)·T(−P)</code> (conjugação).</li>" +
        "<li><b>Ordem</b>: a 1ª aplicada vai à direita; não comuta.</li>" +
        "</ul>",
      visual: {
        type: "dom",
        draw: function (host) {
          EX.Content.callout(host, {
            kind: "tip",
            title: "Regra de ouro",
            html:
              "Reduza qualquer enunciado a <b>uma</b> matriz composta na ordem certa e só então " +
              "aplique aos pontos. Menos contas, menos erros — e é assim que o hardware pensa.",
          });
        },
      },
    });

    return steps;
  }

  EX.registry.add({
    id: "g01-transformacoes",
    num: "T",
    subject: "Computação Gráfica",
    section: "Transformações",
    title: "Transformações geométricas (coordenadas homogêneas)",
    type: "conceitual",
    tags: ["transformações", "matrizes", "homogêneas"],
    hubDesc: "Translação, escala, rotação, reflexão, cisalhamento, ponto fixo e por que a ordem das matrizes importa.",
    statement:
      "Entenda como translação, escala, rotação, reflexão e cisalhamento viram matrizes 3×3 em " +
      "coordenadas homogêneas, a diferença entre ponto (w=1) e vetor (w=0), como transformar em torno " +
      "de um ponto fixo e por que a ordem da composição altera o resultado.",
    parts: [{ label: "Guia", build: build }],
  });
})();
