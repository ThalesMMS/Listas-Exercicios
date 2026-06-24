/*
 * q18.js — Morphing de um pentágono para um heptágono (por vértices e por arestas).
 * ÚNICA questão computacional: usa o plano cartesiano (canvas) + cálculos reais
 * de interpolação linear. Pentágono A (5) e heptágono B (7), centrados, raio 4.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var S = EX.Slides;
  var COL = EX.CartesianPlane.COLORS;

  function ngon(n, R) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var a = (90 + k * 360 / n) * Math.PI / 180;
      out.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    return out;
  }
  function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
  function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  function lerpNum(a, b, t) { return a + (b - a) * t; }
  function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; }
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1]]; }
  function scale(p, s) { return [p[0] * s, p[1] * s]; }
  function cross(p, q) { return p[0] * q[1] - p[1] * q[0]; }
  function len(p) { return Math.sqrt(p[0] * p[0] + p[1] * p[1]); }
  function unit(p) {
    var m = len(p);
    return m < 1e-8 ? [1, 0] : [p[0] / m, p[1] / m];
  }
  function polyAt(Aps, Bs, t) { return Aps.map(function (p, k) { return lerp(p, Bs[k], t); }); }
  function edgeFromPoly(poly, i) {
    var a = poly[i];
    var b = poly[(i + 1) % poly.length];
    var d = sub(b, a);
    return { mid: mid(a, b), dir: unit(d), len: len(d) };
  }
  function edgeAt(a, b, t) {
    var dir = unit(lerp(a.dir, b.dir, t));
    var length = lerpNum(a.len, b.len, t);
    var center = lerp(a.mid, b.mid, t);
    return {
      mid: center,
      dir: dir,
      len: length,
      p0: add(center, scale(dir, -length / 2)),
      p1: add(center, scale(dir, length / 2)),
    };
  }
  function lineIntersection(a, b) {
    var p = a.mid;
    var r = a.dir;
    var q = b.mid;
    var s = b.dir;
    var denom = cross(r, s);
    if (Math.abs(denom) < 1e-8) return mid(a.p1, b.p0);
    var u = cross(sub(q, p), s) / denom;
    return add(p, scale(r, u));
  }
  function edgePolyAt(Aedges, Bedges, t) {
    var edges = Aedges.map(function (e, i) { return edgeAt(e, Bedges[i], t); });
    var verts = edges.map(function (e, i) {
      var prev = edges[(i + edges.length - 1) % edges.length];
      return lineIntersection(prev, e);
    });
    return { edges: edges, verts: verts };
  }
  function r2(n) { return (Math.round(n * 100) / 100).toFixed(2); }

  var A = ngon(5, 4);                 // pentágono original (5)
  var B = ngon(7, 4);                 // heptágono (7)
  // A' = pentágono refinado p/ 7 pontos (insere ponto médio em 2 arestas; iguala
  // a cardinalidade, não é amostragem uniforme por comprimento de arco)
  var Ap = [A[0], A[1], mid(A[1], A[2]), A[2], A[3], mid(A[3], A[4]), A[4]];
  var midsA = Ap.map(function (p, i) { return mid(p, Ap[(i + 1) % 7]); });
  var midsB = B.map(function (p, i) { return mid(p, B[(i + 1) % 7]); });
  var edgesA = Ap.map(function (_, i) { return edgeFromPoly(Ap, i); });
  var edgesB = B.map(function (_, i) { return edgeFromPoly(B, i); });

  var BOUNDS = [-6.5, 6.5, -6, 6.5];

  function faintBoth(plane) {
    plane.polygon(Ap, { stroke: COL.accent, lineWidth: 1.5, dashed: true });
    plane.polygon(B, { stroke: COL.green, lineWidth: 1.5, dashed: true });
  }

  // ---- tabela HTML de um ponto k ao longo de t ----
  function tbl(P0, P1, name, activeT) {
    var ts = [0, 0.25, 0.5, 0.75, 1];
    var rows = ts.map(function (t) {
      var p = lerp(P0, P1, t);
      return "<tr class='" + (t === activeT ? "active" : "") + "'><td>" + t +
        "</td><td>" + r2(p[0]) + "</td><td>" + r2(p[1]) + "</td></tr>";
    }).join("");
    return "<p class='muted'>" + name + "</p><table class='ex-table'><thead><tr><th>t</th>" +
      "<th>x</th><th>y</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function planeStep(draw) { return { type: "plane", bounds: BOUNDS, draw: draw }; }

  function build() {
    var steps = [];

    // 1) problema
    steps.push(S.concept({
      title: "O problema: 5 vértices × 7 vértices",
      body:
        "<p><b>Morphing</b> (metamorfose) transforma suavemente uma forma A em outra B ao longo do " +
        "tempo. Todo morphing tem <b>dois sub-problemas</b>:</p>" +
        "<ul><li><b>Correspondência</b> — quem vira quem (parear elementos de A com os de B);</li>" +
        "<li><b>Interpolação</b> — o caminho de cada par, em geral linear: " +
        "<b>P(t) = (1−t)·A + t·B</b>, com t de 0 a 1.</li></ul>" +
        "<p>A interpolação é a parte fácil; a <b>correspondência</b> é o coração do problema. E aqui " +
        "ela falha de cara: o <span class='accent'>pentágono</span> tem 5 vértices e o " +
        "<span class='ok'>heptágono</span>, 7 — sem o mesmo número de pontos, <b>não dá para parear " +
        "1‑para‑1</b>.</p>",
      visual: planeStep(function (plane) {
        plane.polygon(A, { stroke: COL.accent, lineWidth: 2.5 });
        plane.polygon(B, { stroke: COL.green, lineWidth: 2.5 });
        plane.text(-6.3, 5.7, "A: pentágono", { color: COL.accent });
        plane.text(-6.3, -5.5, "B: heptágono", { color: COL.green });
      }),
    }));

    // 2) refinamento do contorno (igualar a cardinalidade, não amostragem uniforme)
    steps.push({
      title: "Solução: refinar o contorno para 7 pontos",
      body:
        "<p>Igualamos a <b>quantidade</b> de pontos (cardinalidade): inserimos <b>2 pontos médios</b> em " +
        "duas arestas do pentágono (entre A₁A₂ e entre A₃A₄). Agora <b>A′</b> também tem <b>7 pontos</b>.</p>" +
        "<div class='formula'>A′₂ = (A₁+A₂)/2 = (" + r2(Ap[2][0]) + ", " + r2(Ap[2][1]) + ")\n" +
        "A′₅ = (A₃+A₄)/2 = (" + r2(Ap[5][0]) + ", " + r2(Ap[5][1]) + ")</div>" +
        "<p>Isto é um <b>refinamento por adição de pontos</b>: iguala a cardinalidade, mas <b>não</b> " +
        "garante espaçamento uniforme ao longo do contorno. \"Reamostragem uniforme\" seria distribuir os " +
        "pontos por <b>comprimento de arco</b> — outro procedimento. Após o refinamento, a correspondência " +
        "é em ordem: A′ᵢ ↔ Bᵢ.</p>" +
        "<p class='muted'>(Uma amostragem comum uniforme que preservasse todos os vértices originais dos " +
        "dois polígonos poderia usar mmc(5,7)=35 pontos; isso não é necessário para toda estratégia de " +
        "correspondência — aqui 7 já basta e é mais claro.)</p>",
      visual: planeStep(function (plane) {
        plane.polygon(B, { stroke: COL.green, lineWidth: 1.5, dashed: true });
        plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2.5 });
        Ap.forEach(function (p, i) {
          var inserted = (i === 2 || i === 5);
          plane.point(p[0], p[1], {
            color: inserted ? COL.orange : COL.accent, radius: inserted ? 6 : 5,
            label: "A'" + i, labelColor: COL.ink,
          });
        });
      }),
    });

    // 3) correspondência
    steps.push({
      title: "Correspondência ponto-a-ponto",
      body:
        "<p>Com 7 pontos de cada lado, pareamos por índice: <b>A′<sub>k</sub> ↔ B<sub>k</sub></b> " +
        "(k = 0…6). Cada linha tracejada liga um ponto de origem ao seu destino.</p>" +
        "<p>A <b>escolha do pareamento importa</b>: pares mal-alinhados fazem a forma \"se torcer\" " +
        "no meio do caminho. Por isso alinhamos os polígonos (mesmo centro, primeiro vértice no " +
        "topo) antes de parear por índice — assim cada par tem um caminho curto e natural.</p>",
      visual: planeStep(function (plane) {
        for (var k = 0; k < 7; k++) plane.segment(Ap[k], B[k], { color: COL.muted, dashed: true, lineWidth: 1.2 });
        plane.polygon(Ap, { stroke: COL.accent, lineWidth: 2 });
        plane.polygon(B, { stroke: COL.green, lineWidth: 2 });
        for (k = 0; k < 7; k++) {
          plane.point(Ap[k][0], Ap[k][1], { color: COL.accent, radius: 4 });
          plane.point(B[k][0], B[k][1], { color: COL.green, radius: 4 });
        }
      }),
    });

    // 4–8) interpolação por vértices
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      steps.push({
        title: "Por vértices — t = " + t,
        body:
          "<p><b>Por vértices:</b> a primitiva é o <b>vértice</b>. Cada um percorre um " +
          "<b>segmento de reta</b> de A′_k até B_k, em <b>velocidade constante</b>:</p>" +
          "<div class='formula'>P_k(t) = (1−t)·A′_k + t·B_k</div>" +
          "<p>Em t = 0 todos os pontos estão em A′; em t = 1, em B; nos valores intermediários, a " +
          "fração t do caminho. A tabela mostra um vértice ao longo de t (a linha atual destacada):</p>" +
          tbl(Ap[1], B[1], "Exemplo — vértice k = 1 (A′₁→B₁):", t),
        visual: planeStep(function (plane) {
          faintBoth(plane);
          var P = polyAt(Ap, B, t);
          var c = t <= 0.001 ? COL.accent : (t >= 0.999 ? COL.green : COL.yellow);
          plane.polygon(P, { stroke: c, lineWidth: 3 });
          P.forEach(function (p) { plane.point(p[0], p[1], { color: c, radius: 4 }); });
          plane.text(-6, 5.4, "t = " + t, { color: c });
        }),
      });
    });

    // 9) arestas como primitiva
    steps.push({
      title: "Por arestas — a aresta é a primitiva",
      body:
        "<p><b>Por arestas:</b> em vez do vértice, a unidade do morphing é a <b>aresta</b>. A ideia é " +
        "interpolar as <b>propriedades geométricas</b> de cada aresta, não as pontas — assim " +
        "preserva-se melhor a <b>orientação</b> e o <b>comprimento</b> dos lados durante a transição " +
        "(útil quando as arestas têm significado, como paredes ou contornos rígidos).</p>" +
        "<p>Para cada aresta pareada interpolamos três grandezas — <b>ponto médio</b>, <b>direção</b> " +
        "e <b>comprimento</b>:</p>" +
        "<div class='formula'>M_i(t) = (1−t)·M_i^A + t·M_i^B\n" +
        "D_i(t) = normalize((1−t)·D_i^A + t·D_i^B)\n" +
        "L_i(t) = (1−t)·L_i^A + t·L_i^B</div>" +
        tbl(midsA[0], midsB[0], "Exemplo — aresta i = 0 (médios):", null),
      visual: planeStep(function (plane) {
        faintBoth(plane);
        for (var i = 0; i < 7; i++) plane.segment(midsA[i], midsB[i], { color: COL.muted, dashed: true, lineWidth: 1.2 });
        midsA.forEach(function (m) { plane.point(m[0], m[1], { color: COL.orange, radius: 4 }); });
        midsB.forEach(function (m) { plane.point(m[0], m[1], { color: COL.green, radius: 4 }); });
        plane.text(-6, 5.4, "médios A′ (laranja) → B (verde)", { color: COL.ink });
      }),
    });

    // 10) interpolando as arestas (t=0.5)
    steps.push({
      title: "Por arestas — interpolando (t = 0,5)",
      body:
        "<p>Em t = 0,5 cada aresta recebe seu médio, direção e comprimento intermediários. " +
        "Assim a aresta intermediária fica totalmente definida, não apenas marcada por um ponto.</p>" +
        "<div class='formula'>M_0(0,5) = (" + r2(lerp(midsA[0], midsB[0], 0.5)[0]) + ", " +
        r2(lerp(midsA[0], midsB[0], 0.5)[1]) + ")</div>" +
        "<p>Há um detalhe: interpoladas de forma independente, as arestas <b>não se encontram</b> " +
        "mais nas pontas (sobram lacunas). Por isso cada <b>vértice</b> do polígono intermediário é " +
        "recuperado pela <b>interseção das retas-suporte de arestas vizinhas</b> — é o que a função " +
        "<code>edgePolyAt</code> faz para fechar a forma (mostrada ao lado).</p>",
      visual: planeStep(function (plane) {
        faintBoth(plane);
        var edgeResult = edgePolyAt(edgesA, edgesB, 0.5);
        plane.polygon(edgeResult.verts, { stroke: COL.yellow, lineWidth: 3 });
        for (var i = 0; i < edgeResult.edges.length; i++) {
          var e = edgeResult.edges[i];
          plane.segment(e.p0, e.p1, { color: COL.orange, lineWidth: 1.5, dashed: [4, 3] });
          plane.point(e.mid[0], e.mid[1], { color: COL.yellow, radius: 4 });
        }
        plane.text(-6, 5.4, "arestas em t = 0,5", { color: COL.yellow });
      }),
    });

    // 11) resumo
    steps.push(S.comparison({
      title: "Resumo: por vértices × por arestas",
      intro: "<p>Mesma ideia de interpolação linear, primitivas diferentes.</p>",
      headers: ["", "Por vértices", "Por arestas"],
      rows: [
        ["Primitiva", "O vértice", "A aresta"],
        ["O que se interpola", "Posição dos cantos", "Médio, direção e comprimento"],
        ["Vértices do intermediário", "Diretos (são o resultado)", "Cruzamento das retas suporte vizinhas"],
        ["Quando preferir", "Caso geral, simples", "Preservar estrutura/orientação das arestas"],
      ],
    }));

    return steps;
  }

  EX.registry.add({
    id: "q18-morphing",
    num: "18",
    subject: "Computação Gráfica — Lista 3",
    section: "V) Animação e Cinemática",
    title: "Morphing: pentágono → heptágono",
    type: "computacional",
    tags: ["morphing", "interpolação", "animação"],
    hubDesc: "Refinamento para 7 pontos e interpolação linear — por vértices e por arestas.",
    statement:
      "Mostre os cálculos de <strong>morphing por vértices e por arestas</strong> de um " +
      "<strong>pentágono para um heptágono</strong>.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
