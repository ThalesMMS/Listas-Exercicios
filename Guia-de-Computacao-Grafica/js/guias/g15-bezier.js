/*
 * g15-bezier.js — Guia: curvas de Bézier e conversão de interpolada para Bézier.
 * O que é a curva de Bézier (polígono de controle, base de Bernstein, algoritmo
 * de de Casteljau, casca convexa, continuidade C0/C1), e o procedimento
 * matricial de troca de base: Q(u)=U·M_B·G_B = U·M_I·G_I, logo
 * G_B = (M_B⁻¹·M_I)·G_I. Foco no PORQUÊ de cada propriedade e de inverter M_B.
 *
 * Derivação adaptada da Lista 2 (q11). Usa EX.Guia.mat/row/dom + plane.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;
  var MAT = EX.Guia.mat,
    ROW = EX.Guia.row,
    DOM = EX.Guia.dom;

  // Polígono de controle de exemplo para a Bézier cúbica (visuais).
  var BZ = [[1, 1], [2, 5], [6, 5], [7, 2]]; // B0..B3
  var BNAMES = ["B₀", "B₁", "B₂", "B₃"];
  var BB = [0, 8, 0, 6];

  // lerp entre dois pontos.
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  // de Casteljau: avalia a Bézier em t reduzindo o polígono por lerps.
  function deCasteljau(pts, t) {
    var lv = pts.slice();
    while (lv.length > 1) {
      var nx = [];
      for (var i = 0; i + 1 < lv.length; i++) nx.push(lerp(lv[i], lv[i + 1], t));
      lv = nx;
    }
    return lv[0];
  }

  var U = MAT([["u³", "u²", "u", "1"]]);
  var MB = MAT([
    ["−1", "3", "−3", "1"],
    ["3", "−6", "3", "0"],
    ["−3", "3", "0", "0"],
    ["1", "0", "0", "0"],
  ]);
  var MI = MAT([
    ["−9/2", "27/2", "−27/2", "9/2"],
    ["9", "−45/2", "18", "−9/2"],
    ["−11/2", "9", "−9/2", "1"],
    ["1", "0", "0", "0"],
  ]);
  var MBinv = MAT([
    ["0", "0", "0", "1"],
    ["0", "0", "1/3", "1"],
    ["0", "1/3", "2/3", "1"],
    ["1", "1", "1", "1"],
  ]);
  var CONV = MAT([
    ["6", "0", "0", "0"],
    ["−5", "18", "−9", "2"],
    ["2", "−9", "18", "−5"],
    ["0", "0", "0", "6"],
  ]);
  var GB = MAT([["B₀"], ["B₁"], ["B₂"], ["B₃"]]);
  var GI = MAT([["P₀"], ["P₁"], ["P₂"], ["P₃"]]);

  // Desenha o polígono de controle e (opcionalmente) a curva de Bézier.
  function drawBezier(plane, withCurve) {
    plane.polyline(BZ, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
    BZ.forEach(function (p, i) {
      plane.point(p[0], p[1], { color: COL.accent, radius: 5, label: BNAMES[i], labelColor: COL.ink });
    });
    if (withCurve) {
      var pts = [];
      for (var t = 0; t <= 1.0001; t += 0.02) pts.push(deCasteljau(BZ, t));
      plane.polyline(pts, { stroke: COL.accent, lineWidth: 3 });
    }
  }

  function build() {
    return [
      // 1) O que é uma curva de Bézier
      {
        title: "O que é uma curva de Bézier",
        body:
          "<p>Uma Bézier cúbica é definida por <b>4 pontos de controle</b> B₀…B₃. Ligados em ordem, " +
          "eles formam o <b>polígono de controle</b> (tracejado). A curva <span class='hl'>nasce</span> " +
          "em B₀ e <span class='hl'>morre</span> em B₃, mas <b>não toca</b> os pontos do meio — eles " +
          "agem como <b>ímãs</b> que puxam a curva na sua direção.</p>" +
          "<p>É a primitiva de desenho do mundo todo: contornos de <b>fontes</b> (TrueType usa " +
          "quadráticas; PostScript/OpenType, cúbicas), traçados de <b>Illustrator/Figma</b>, " +
          "caminhos de <b>SVG</b> (<code>C</code>) e animações. A cúbica é o “cavalo de batalha” " +
          "por equilibrar flexibilidade e custo.</p>" +
          "<p>Mexa mentalmente em B₁: a curva inteira se reacomoda suavemente. Esse controle " +
          "<b>intuitivo</b> é o que a tornou padrão.</p>",
        visual: {
          type: "plane", bounds: BB,
          draw: function (plane) { drawBezier(plane, true); },
        },
      },
      // 2) A base de Bernstein
      {
        title: "A base de Bernstein",
        body:
          "<p>Por trás da curva está uma combinação dos pontos com <b>pesos</b> que dependem de " +
          "<code>u ∈ [0, 1]</code> — os <b>polinômios de Bernstein</b>:</p>" +
          "<div class='formula'>Q(u) = B₀(1−u)³ + B₁·3u(1−u)² + B₂·3u²(1−u) + B₃·u³</div>" +
          "<p>De onde vêm esses pesos? Do <b>binômio de Newton</b> aplicado a <code>((1−u) + u)³ = " +
          "1</code>. Expandindo:</p>" +
          "<div class='formula'>(1−u)³ + 3u(1−u)² + 3u²(1−u) + u³ = 1</div>" +
          "<p>Cada termo é um peso <code>b_i(u)</code>. Como eles <b>somam 1</b> e são " +
          "<span class='ok'>todos ≥ 0</span> em <code>[0, 1]</code>, cada ponto da curva é uma " +
          "<b>média ponderada</b> (combinação convexa) dos B_i — fato que volta na casca convexa.</p>" +
          "<p>Casos-limite: em <code>u = 0</code> só <code>b₀ = 1</code> sobrevive ⇒ " +
          "<code>Q(0) = B₀</code>; em <code>u = 1</code>, <code>Q(1) = B₃</code>. Daí os extremos " +
          "serem <b>interpolados</b>.</p>",
        visual: DOM(
          ROW("Q(u) =&nbsp;" + U + "· M<sub>B</sub> ·" + MAT([["B₀"], ["B₁"], ["B₂"], ["B₃"]])) +
            "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>os pesos de Bernstein são as linhas de M<sub>B</sub> escritas em u</p>"
        ),
      },
      // 3) de Casteljau
      {
        title: "de Casteljau: a curva como lerps repetidos",
        body:
          "<p>Há um jeito <b>geométrico</b> e numericamente <b>estável</b> de avaliar a curva em um " +
          "<code>u</code>, sem expandir polinômios: o algoritmo de <b>de Casteljau</b>. Ele é só " +
          "<b>interpolação linear</b> (lerp) repetida.</p>" +
          "<p>Para <code>u = ½</code>, com os 4 pontos:</p>" +
          "<ul>" +
          "<li>interpole cada par vizinho → <b>3</b> pontos novos;</li>" +
          "<li>interpole esses → <b>2</b> pontos;</li>" +
          "<li>interpole o último par → <b>1</b> ponto: é <code>Q(½)</code>, <span class='ok'>sobre a " +
          "curva</span>.</li>" +
          "</ul>" +
          "<div class='formula'>lerp(A, B, u) = A + u·(B − A)</div>" +
          "<p>Cada lerp é o <b>incremento linear</b> do <span class='accent'>DDA</span> — Bézier é " +
          "interpolação aninhada. E como só usa médias entre pontos, nunca “estoura”: por isso " +
          "<b>de Casteljau</b> é o método numérico preferido, e também subdivide a curva (útil para " +
          "rasterizar e fazer recorte/colisão).</p>",
        visual: {
          type: "plane", bounds: BB,
          draw: function (plane) {
            var t = 0.5;
            // nível 0: polígono de controle
            plane.polyline(BZ, { stroke: COL.muted, lineWidth: 1.5, dashed: true });
            BZ.forEach(function (p, i) {
              plane.point(p[0], p[1], { color: COL.accent, radius: 4, label: BNAMES[i], labelColor: COL.ink });
            });
            // nível 1
            var l1 = [];
            for (var i = 0; i + 1 < BZ.length; i++) l1.push(lerp(BZ[i], BZ[i + 1], t));
            plane.polyline(l1, { stroke: COL.green, lineWidth: 1.5 });
            l1.forEach(function (p) { plane.point(p[0], p[1], { color: COL.green, radius: 3 }); });
            // nível 2
            var l2 = [];
            for (var j = 0; j + 1 < l1.length; j++) l2.push(lerp(l1[j], l1[j + 1], t));
            plane.polyline(l2, { stroke: COL.orange, lineWidth: 1.5 });
            l2.forEach(function (p) { plane.point(p[0], p[1], { color: COL.orange, radius: 3 }); });
            // nível 3: ponto sobre a curva
            var q = lerp(l2[0], l2[1], t);
            // a curva inteira, de fundo
            var cv = [];
            for (var u = 0; u <= 1.0001; u += 0.02) cv.push(deCasteljau(BZ, u));
            plane.polyline(cv, { stroke: COL.accentSoft, lineWidth: 4 });
            plane.point(q[0], q[1], { color: COL.yellow, radius: 5, ring: COL.yellow, label: "Q(½)", labelColor: COL.ink });
          },
        },
      },
      // 4) Casca convexa e tangentes nos extremos
      {
        title: "Casca convexa e tangentes nas pontas",
        body:
          "<p>Como cada ponto da curva é uma <b>combinação convexa</b> dos B_i (pesos de Bernstein ≥ 0 " +
          "e somando 1), a curva <b>inteira</b> fica <span class='hl'>dentro da casca convexa</span> " +
          "do polígono de controle — o menor polígono convexo que envolve B₀…B₃. Isso é ouro na " +
          "prática: dá um <b>bounding box</b> grátis para teste de colisão e recorte, sem avaliar a " +
          "curva.</p>" +
          "<p>E as <b>tangentes nas pontas</b> apontam ao longo das pernas do polígono. Derivando a " +
          "forma de Bernstein nos extremos:</p>" +
          "<div class='formula'>Q'(0) = 3·(B₁ − B₀)\nQ'(1) = 3·(B₃ − B₂)</div>" +
          "<p>Ou seja: a curva <b>sai</b> de B₀ na direção de B₁ e <b>chega</b> em B₃ vindo de B₂. " +
          "(Essa derivada é a mesma ideia de tangente do guia <span class='accent'>paramétrica</span>.) " +
          "É o que torna o controle previsível — e a chave para emendar curvas com suavidade no " +
          "próximo passo.</p>",
        visual: {
          type: "plane", bounds: BB,
          draw: function (plane) {
            // casca convexa do exemplo: B0-B1-B2-B3 já é convexo aqui.
            plane.polygon(BZ, { stroke: COL.green, fill: COL.greenSoft, lineWidth: 1.5, dashed: true });
            var cv = [];
            for (var u = 0; u <= 1.0001; u += 0.02) cv.push(deCasteljau(BZ, u));
            plane.polyline(cv, { stroke: COL.accent, lineWidth: 3 });
            BZ.forEach(function (p, i) {
              plane.point(p[0], p[1], { color: COL.accent, radius: 4, label: BNAMES[i], labelColor: COL.ink });
            });
            // tangentes nas pontas (ao longo das pernas)
            plane.arrow(BZ[0], lerp(BZ[0], BZ[1], 0.9), { color: COL.orange });
            plane.arrow(BZ[3], lerp(BZ[3], BZ[2], 0.9), { color: COL.orange });
          },
        },
      },
      // 5) Continuidade C0/C1/G1 ao juntar
      {
        title: "Emendar curvas: continuidade C0, C1 e G1",
        body:
          "<p>Formas reais (uma letra, um traçado longo) usam <b>várias</b> Béziers em sequência. " +
          "Como emendá-las sem “bico”?</p>" +
          "<ul>" +
          "<li><b>C0</b> (posição): o fim de uma coincide com o início da outra — <code>B₃ = " +
          "B₀'</code>. Sem buraco, mas pode ter quina.</li>" +
          "<li><b>G1</b> (direção): as tangentes nas pontas são <b>colineares</b> — sem quina, " +
          "embora a “velocidade” possa pular.</li>" +
          "<li><b>C1</b> (velocidade): tangentes iguais em direção <em>e</em> tamanho, " +
          "<code>B₃ − B₂ = B₁' − B₀'</code>. Como <code>Q'(0)</code> e <code>Q'(1)</code> dependem só " +
          "das pernas (passo anterior), basta alinhar e espelhar: <b>B₂, B₃(=B₀'), B₁'</b> " +
          "colineares e <span class='hl'>igualmente espaçados</span>.</li>" +
          "</ul>" +
          "<p>Regra de bolso: <code>C1 ⇒ G1 ⇒ C0</code>. A maioria das ferramentas de desenho mostra " +
          "“alças” simétricas em cada nó exatamente para manter C1/G1 automaticamente.</p>",
        visual: {
          type: "plane", bounds: [0, 10, 0, 5],
          draw: function (plane) {
            // Duas Béziers que se juntam em P com C1 (pernas colineares e iguais).
            var A = [[1, 1], [2, 3], [3, 3], [4, 2.5]]; // primeira
            var join = A[3];
            var dir = [join[0] - A[2][0], join[1] - A[2][1]]; // perna final
            var Cb1 = [join[0] + dir[0], join[1] + dir[1]]; // espelha p/ C1
            var D = [join, Cb1, [8, 3], [9, 1]]; // segunda
            function curve(pts) { var o = []; for (var u = 0; u <= 1.0001; u += 0.02) o.push(deCasteljau(pts, u)); return o; }
            plane.polyline(A, { stroke: COL.muted, lineWidth: 1, dashed: true });
            plane.polyline(D, { stroke: COL.muted, lineWidth: 1, dashed: true });
            plane.polyline(curve(A), { stroke: COL.accent, lineWidth: 3 });
            plane.polyline(curve(D), { stroke: COL.green, lineWidth: 3 });
            // pernas colineares no ponto de junção
            plane.segment(A[2], Cb1, { color: COL.orange, lineWidth: 1.5 });
            plane.point(A[2][0], A[2][1], { color: COL.orange, radius: 3 });
            plane.point(Cb1[0], Cb1[1], { color: COL.orange, radius: 3 });
            plane.point(join[0], join[1], { color: COL.yellow, radius: 5, ring: COL.yellow, label: "junção C1", labelColor: COL.ink });
          },
        },
      },
      // 6) Motivação da conversão
      {
        title: "Por que converter de base",
        body:
          "<p>Agora a outra metade do guia: <b>trocar a base</b> de uma curva. Uma curva " +
          "<b>interpolada</b> passa <em>por</em> todos os seus pontos P₀…P₃ — ótima para “encostar” " +
          "em dados (ver o guia <span class='accent'>paramétrica</span>). Já a <b>Bézier</b>, como " +
          "vimos, passa só pelos extremos e é a base que motores gráficos, fontes e ferramentas de " +
          "desenho entendem (de Casteljau, casca convexa, subdivisão).</p>" +
          "<p>Conversão = <b>mesma curva</b>, outra descrição. Dada a interpolada por P₀…P₃, queremos " +
          "os pontos de controle de Bézier B₀…B₃ que desenham <em>exatamente</em> essa curva — para " +
          "poder editá-la e exportá-la nas ferramentas de Bézier.</p>",
        visual: DOM(
          ROW("interpolada: passa por&nbsp;" + GI) +
            ROW("Bézier: controlada por&nbsp;" + GB) +
            "<p style='text-align:center;color:var(--ink-mute);font-size:13px'>a curva é a mesma; mudam só os pontos que a descrevem</p>"
        ),
      },
      // 7) Mesma curva, duas bases
      {
        title: "Mesma curva, duas bases",
        body:
          "<p>Toda cúbica se escreve <code>Q(u) = U · M · G</code>, com <code>U = [u³ u² u 1]</code> " +
          "(o vetor de potências de <code>u</code>), <b>M</b> a matriz da base e <b>G</b> a geometria " +
          "(os pontos de controle empilhados). A matriz <b>M</b> é o que distingue uma família de " +
          "curvas da outra; <b>U</b> e <b>G</b> têm a mesma forma sempre.</p>" +
          "<p>A curva é <b>uma só</b>. Escrevendo-a nas duas bases, os resultados têm de ser iguais " +
          "para <em>todo</em> <code>u</code>:</p>" +
          "<p style='text-align:center'><code>U·M<sub>B</sub>·G<sub>B</sub> = U·M<sub>I</sub>·G<sub>I</sub></code></p>" +
          "<p>É essa igualdade “ponto a ponto” que vamos resolver para achar <code>G_B</code>.</p>",
        visual: DOM(ROW("Q(u) =&nbsp;" + U + "· M ·" + MAT([["g₀"], ["g₁"], ["g₂"], ["g₃"]]))),
      },
      // 8) As matrizes de base
      {
        title: "As duas matrizes de base",
        body:
          "<p><b>M<sub>B</sub></b> é a matriz de Bézier — suas colunas <em>são</em> os coeficientes " +
          "dos polinômios de Bernstein do passo 2 (a 1ª linha de <code>U·M_B</code> em <code>u</code> " +
          "reconstrói <code>(1−u)³</code> etc.).</p>" +
          "<p><b>M<sub>I</sub></b> é a da interpolada para nós igualmente espaçados " +
          "<code>u = 0, ⅓, ⅔, 1</code> — obtida invertendo a matriz dos <code>uⁱ</code> avaliados " +
          "nesses nós (a derivação está no guia <span class='accent'>paramétrica</span>).</p>" +
          "<p>É por isso que a <b>parametrização importa</b>: M<sub>I</sub> <b>depende dos nós " +
          "escolhidos</b>. Mude os nós e a matriz muda — logo a conversão também.</p>",
        visual: DOM(ROW("M<sub>B</sub> =&nbsp;" + MB) + ROW("M<sub>I</sub> =&nbsp;" + MI)),
      },
      // 9) Igualando as bases
      {
        title: "Cancelar U e isolar G_B",
        body:
          "<p>A igualdade vale para <b>todo u</b>. Aqui está o passo sutil: como o vetor <code>U</code> " +
          "aparece dos dois lados e é <b>arbitrário</b> (vale para qualquer <code>u</code>), os " +
          "fatores à direita dele têm de ser iguais — então podemos <b>cancelá-lo</b>:</p>" +
          "<p style='text-align:center'><code>M<sub>B</sub>·G<sub>B</sub> = M<sub>I</sub>·G<sub>I</sub></code></p>" +
          "<p>(Formalmente: se <code>U·A = U·B</code> para todo <code>U</code>, então <code>A = " +
          "B</code> — basta testar com os <code>U</code> da base canônica.)</p>" +
          "<p>Agora multiplicamos <b>à esquerda</b> por <code>M<sub>B</sub>⁻¹</code> para deixar " +
          "<code>G<sub>B</sub></code> sozinho (a ordem importa: matrizes não comutam, como na " +
          "<span class='accent'>composição de transformações</span>):</p>" +
          "<p style='text-align:center'><code>G<sub>B</sub> = (M<sub>B</sub>⁻¹·M<sub>I</sub>)·G<sub>I</sub></code></p>" +
          "<p>A <span class='hl'>matriz de conversão</span> é <code>M = M<sub>B</sub>⁻¹·M<sub>I</sub></code>.</p>",
        visual: DOM(ROW("M<sub>B</sub>⁻¹ =&nbsp;" + MBinv)),
      },
      // 10) A matriz de conversão
      {
        title: "A matriz de conversão",
        body:
          "<p>Efetuando o produto <code>M<sub>B</sub>⁻¹·M<sub>I</sub></code> (e pondo o fator " +
          "<code>1/6</code> em evidência) chega-se a:</p>" +
          "<p style='text-align:center;font-family:var(--mono)'>B₀ = P₀<br>" +
          "B₁ = (−5P₀ + 18P₁ − 9P₂ + 2P₃)/6<br>" +
          "B₂ = (2P₀ − 9P₁ + 18P₂ − 5P₃)/6<br>" +
          "B₃ = P₃</p>" +
          "<p>Leitura geométrica: os pontos de Bézier do meio (B₁, B₂) ficam <b>fora</b> do trecho " +
          "P₀…P₃ — eles precisam “puxar mais forte” justamente porque a Bézier <em>não</em> passa " +
          "pelos pontos do meio, ao contrário da interpolada.</p>",
        visual: DOM(ROW(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
      // 11) Verificação
      {
        title: "Por que a matriz faz sentido",
        body:
          "<p>Três testes rápidos confirmam que a matriz está certa:</p>" +
          "<ul>" +
          "<li><b>B₀ = P₀</b> e <b>B₃ = P₃</b>: a Bézier resultante <b>interpola os extremos</b> — " +
          "exatamente o que se espera (a Bézier toca as pontas, como vimos no passo 1).</li>" +
          "<li>cada linha <b>soma 1</b> (ex.: (−5+18−9+2)/6 = 6/6 = 1): preserva pontos e é " +
          "<b>invariante a translações</b> — mover todos os P move a curva igual, sem deformar.</li>" +
          "<li><b>Simetria</b>: a linha de B₂ é a de B₁ <em>invertida</em> ((2,−9,18,−5) vs " +
          "(−5,18,−9,2)). Faz sentido: trocar a ordem dos pontos só inverte o sentido de percurso.</li>" +
          "</ul>",
        visual: DOM(ROW(GB + "=" + "<span style='font-family:var(--mono)'>1/6</span>" + CONV + "·" + GI)),
      },
      // 12) Resumo / cuidados
      {
        title: "Resumo e cuidados",
        body:
          "<p>O método é geral: para converter <b>entre quaisquer duas bases</b> cúbicas, a matriz é " +
          "<code>M<sub>destino</sub>⁻¹·M<sub>origem</sub></code>. Aqui foi Bézier ← interpolada.</p>" +
          "<ul>" +
          "<li><b>Nós</b>: M<sub>I</sub> assume <code>u = 0, ⅓, ⅔, 1</code>. Nós diferentes → outra " +
          "M<sub>I</sub> → outra matriz de conversão.</li>" +
          "<li><b>Ponto-linha vs ponto-coluna</b>: trocar a convenção transpõe tudo; seja consistente " +
          "(mesma armadilha do guia de <span class='accent'>transformações</span>).</li>" +
          "<li><b>Avaliação</b>: para <em>desenhar</em> a Bézier resultante, prefira " +
          "<b>de Casteljau</b> (estável) a expandir o polinômio.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html:
                "Bézier = 4 pontos de controle com pesos de <b>Bernstein</b>; avalie por " +
                "<b>de Casteljau</b> (lerps). Mudar de curva é <b>mudar de base</b>: iguale " +
                "<code>U·M·G</code> nas duas bases, cancele <code>U</code> e inverta a matriz da base " +
                "de destino.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g15-bezier",
    num: "B←",
    subject: "Computação Gráfica",
    section: "Curvas & Fractais",
    title: "Conversão interpolada → Bézier",
    type: "computacional",
    tags: ["curvas", "bézier", "bernstein", "de casteljau", "matriz", "base"],
    hubDesc: "Bézier: polígono de controle, Bernstein, de Casteljau, casca convexa, C0/C1; e a conversão G_B = M_B⁻¹·M_I·G_I.",
    statement:
      "Entenda a curva de Bézier — polígono de controle, base de Bernstein, algoritmo de de Casteljau, " +
      "casca convexa, tangentes nas pontas e continuidade C0/C1 ao emendar — e o procedimento " +
      "matricial para converter uma curva interpolada em Bézier: igualar as duas bases, cancelar U e " +
      "obter a matriz de conversão M = M_B⁻¹·M_I.",
    parts: [{ label: "Guia", build: build }],
  });
})();
