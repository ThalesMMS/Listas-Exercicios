/*
 * g24-bones.js — Guia: bones, esqueleto e skinning.
 * Esqueleto como hierarquia de juntas/ossos, bind pose, matrizes globais por
 * osso, pesos por vértice e deformação por linear blend skinning.
 *
 * Visual: SVG/DOM. Complementa keyframing, morphing e cinemática (g21-g23).
 */
(function () {
  "use strict";
  var EX = window.EX;

  var INK = "var(--ink)";
  var MUTED = "var(--ink-mute)";
  var DIM = "var(--ink-dim)";
  var ACCENT = "var(--accent)";
  var GREEN = "var(--green)";
  var YELLOW = "var(--yellow)";
  var RED = "var(--red)";
  var SOFT = "var(--bg-soft)";
  var BORDER = "var(--border)";

  function joint(svg, p, label, color, parent) {
    svg.circle(p[0], p[1], 8, {
      fill: SOFT, stroke: color || ACCENT, strokeWidth: 2.5, parent: parent,
    });
    if (label) svg.text(p[0], p[1] - 16, label, { size: 11, weight: 700, color: color || ACCENT, parent: parent });
  }

  function bone(svg, a, b, color, parent, dashed) {
    svg.line(a[0], a[1], b[0], b[1], {
      stroke: color || ACCENT, strokeWidth: 7, dashed: dashed, parent: parent,
    });
  }

  function skeleton(svg, pts, color, parent, dashed) {
    bone(svg, pts.hip, pts.chest, color, parent, dashed);
    bone(svg, pts.chest, pts.head, color, parent, dashed);
    bone(svg, pts.chest, pts.elbow, color, parent, dashed);
    bone(svg, pts.elbow, pts.hand, color, parent, dashed);
    bone(svg, pts.hip, pts.knee, color, parent, dashed);
    bone(svg, pts.knee, pts.foot, color, parent, dashed);
    joint(svg, pts.hip, "raiz", color, parent);
    joint(svg, pts.chest, "peito", color, parent);
    joint(svg, pts.elbow, "cotovelo", color, parent);
    joint(svg, pts.hand, "mão", color, parent);
    joint(svg, pts.knee, "joelho", color, parent);
    joint(svg, pts.foot, "pé", color, parent);
    joint(svg, pts.head, "cabeça", color, parent);
  }

  function character(svg) {
    var pts = {
      hip: [190, 230], chest: [190, 132], head: [190, 62],
      elbow: [280, 158], hand: [360, 114], knee: [250, 300], foot: [324, 292],
    };
    svg.view(520, 340);
    svg.path("M 168 74 Q 190 42 212 74 L 226 126 Q 270 130 296 154 L 366 112 " +
      "Q 380 124 370 140 L 294 190 Q 252 176 224 176 L 214 232 Q 260 252 276 296 " +
      "L 342 286 Q 352 306 334 318 L 256 318 Q 222 278 190 246 Q 170 272 154 318 " +
      "L 88 318 Q 72 306 84 286 L 142 296 Q 146 252 166 232 L 154 176 Q 126 176 " +
      "100 190 L 46 142 Q 36 126 50 114 L 110 154 Q 122 132 154 126 Z", {
      fill: "rgba(105, 125, 255, 0.10)", stroke: BORDER, strokeWidth: 2,
    });
    skeleton(svg, pts, ACCENT);
    svg.text(408, 82, "malha visível", { size: 12, color: DIM, anchor: "start" });
    svg.arrow(396, 88, 302, 128, { color: DIM, head: 9 });
    svg.text(408, 132, "esqueleto invisível", { size: 12, color: ACCENT, weight: 700, anchor: "start" });
    svg.arrow(396, 138, 282, 158, { color: ACCENT, head: 9 });
  }

  function hierarchy(svg) {
    svg.view(700, 310);
    var base = [120, 235], shoulder = [230, 160], elbow = [352, 122], hand = [486, 92];
    bone(svg, base, shoulder, ACCENT);
    bone(svg, shoulder, elbow, GREEN);
    bone(svg, elbow, hand, YELLOW);
    joint(svg, base, "raiz", ACCENT);
    joint(svg, shoulder, "ombro", GREEN);
    joint(svg, elbow, "cotovelo", YELLOW);
    joint(svg, hand, "mão", YELLOW);
    svg.text(126, 272, "Mundo", { size: 12, color: DIM });
    svg.text(230, 204, "R(θ₁)·T", { size: 12, color: GREEN });
    svg.text(362, 158, "R(θ₂)·T", { size: 12, color: YELLOW });
    svg.text(372, 252, "M_mão = M_raiz · M_ombro · M_cotovelo", {
      size: 14, weight: 800, color: INK, mono: true,
    });
    svg.arrow(118, 226, 214, 166, { color: MUTED, head: 9, dashed: "5 4" });
    svg.arrow(236, 154, 334, 124, { color: MUTED, head: 9, dashed: "5 4" });
    svg.arrow(358, 118, 466, 96, { color: MUTED, head: 9, dashed: "5 4" });
  }

  function bindPose(svg) {
    svg.view(700, 300);
    var A0 = [98, 230], A1 = [190, 156], A2 = [302, 156], A3 = [404, 196];
    var B0 = [98, 230], B1 = [190, 116], B2 = [304, 72], B3 = [416, 92];
    svg.text(205, 42, "pose de repouso (bind)", { size: 13, weight: 700, color: DIM });
    svg.text(520, 42, "pose atual", { size: 13, weight: 700, color: DIM });
    [A0, A1, A2, A3].forEach(function (p, i, arr) {
      if (i > 0) bone(svg, arr[i - 1], p, MUTED, null, "5 4");
      joint(svg, p, i === 0 ? "raiz" : "", MUTED);
    });
    [B0, B1, B2, B3].forEach(function (p, i, arr) {
      var q = [p[0] + 300, p[1]];
      if (i > 0) {
        var prev = [arr[i - 1][0] + 300, arr[i - 1][1]];
        bone(svg, prev, q, ACCENT);
      }
      joint(svg, q, i === 0 ? "raiz" : "", ACCENT);
    });
    svg.arrow(438, 152, 506, 122, { color: GREEN, strokeWidth: 2.5, head: 10 });
    svg.text(474, 150, "animação", { size: 12, weight: 700, color: GREEN });
    svg.text(350, 266, "skinMatrix = M_atual · M_bind⁻¹", { size: 16, weight: 800, color: INK, mono: true });
  }

  function weights(svg) {
    svg.view(700, 320);
    var shoulder = [150, 164], elbow = [330, 164], wrist = [520, 164];
    bone(svg, shoulder, elbow, ACCENT);
    bone(svg, elbow, wrist, GREEN);
    joint(svg, shoulder, "ombro", ACCENT);
    joint(svg, elbow, "cotovelo", YELLOW);
    joint(svg, wrist, "pulso", GREEN);
    var verts = [
      [204, 116, 0.95, 0.05], [258, 108, 0.75, 0.25], [314, 116, 0.50, 0.50],
      [370, 108, 0.25, 0.75], [430, 116, 0.05, 0.95],
      [204, 210, 0.95, 0.05], [258, 220, 0.75, 0.25], [314, 210, 0.50, 0.50],
      [370, 220, 0.25, 0.75], [430, 210, 0.05, 0.95],
    ];
    verts.forEach(function (v) {
      var wA = v[2], wB = v[3];
      var color = wA > wB ? ACCENT : (wB > wA ? GREEN : YELLOW);
      svg.circle(v[0], v[1], 7, { fill: color, stroke: INK, strokeWidth: 1.2 });
      svg.text(v[0], v[1] + 23, Math.round(wA * 100) + "/" + Math.round(wB * 100), {
        size: 10, color: DIM, mono: true,
      });
    });
    svg.text(350, 272, "vértices perto da junta misturam os dois ossos", {
      size: 13, weight: 700, color: INK,
    });
    svg.text(350, 296, "P' = Σ wᵢ · (Mᵢ · Bᵢ⁻¹ · P)", {
      size: 15, weight: 800, color: INK, mono: true,
    });
  }

  function weightPaint(svg) {
    svg.view(700, 340);
    var shoulder = [120, 176], elbow = [330, 154], wrist = [560, 184];
    svg.path("M 92 118 Q 210 76 332 108 Q 454 138 596 132 L 610 226 " +
      "Q 454 238 332 214 Q 210 190 92 230 Z", {
      fill: "rgba(105, 125, 255, 0.08)", stroke: BORDER, strokeWidth: 2,
    });
    bone(svg, shoulder, elbow, ACCENT);
    bone(svg, elbow, wrist, GREEN);
    joint(svg, shoulder, "braço", ACCENT);
    joint(svg, elbow, "cotovelo", YELLOW);
    joint(svg, wrist, "antebraço", GREEN);

    var samples = [
      [130, 128, 1.00], [170, 118, 0.95], [210, 114, 0.88], [250, 118, 0.76], [292, 128, 0.62],
      [324, 140, 0.52], [354, 134, 0.42], [394, 136, 0.28], [438, 142, 0.16], [486, 150, 0.07],
      [540, 158, 0.00], [132, 222, 1.00], [178, 208, 0.94], [222, 204, 0.82], [268, 202, 0.68],
      [312, 202, 0.55], [346, 204, 0.45], [390, 210, 0.30], [438, 216, 0.18], [490, 222, 0.08],
      [550, 224, 0.00], [224, 160, 0.82], [286, 166, 0.62], [332, 174, 0.50], [382, 176, 0.32],
      [456, 184, 0.12],
    ];
    samples.forEach(function (p) {
      var w = p[2];
      var fill = w > 0.7 ? ACCENT : (w < 0.3 ? GREEN : YELLOW);
      svg.circle(p[0], p[1], 12, { fill: fill, stroke: INK, strokeWidth: 1, opacity: 0.78 });
    });
    svg.rect(86, 282, 528, 20, { fill: SOFT, stroke: BORDER, strokeWidth: 1.5, rx: 4 });
    for (var i = 0; i < 22; i++) {
      var x = 96 + i * 24;
      var c = i < 8 ? ACCENT : (i > 13 ? GREEN : YELLOW);
      svg.rect(x, 288, 22, 8, { fill: c, opacity: 0.85, rx: 2 });
    }
    svg.text(96, 316, "100% braço", { size: 11, weight: 700, color: ACCENT, anchor: "start" });
    svg.text(350, 316, "mistura perto da junta", { size: 11, weight: 700, color: YELLOW });
    svg.text(614, 316, "100% antebraço", { size: 11, weight: 700, color: GREEN, anchor: "end" });
    svg.text(350, 42, "weight paint = mapa de influência por vértice", {
      size: 14, weight: 800, color: INK,
    });
  }

  function badVsGood(svg) {
    svg.view(700, 280);
    function arm(cx, label, smooth) {
      var shoulder = [cx - 112, 170], elbow = [cx, 134], wrist = [cx + 114, smooth ? 164 : 196];
      var top = smooth
        ? [[cx - 122, 118], [cx - 52, 104], [cx + 18, 104], [cx + 126, 128]]
        : [[cx - 122, 118], [cx - 58, 118], [cx - 6, 118], [cx + 126, 160]];
      var bottom = smooth
        ? [[cx - 120, 216], [cx - 48, 222], [cx + 38, 220], [cx + 112, 210]]
        : [[cx - 120, 216], [cx - 52, 196], [cx + 4, 172], [cx + 112, 230]];
      bone(svg, shoulder, elbow, ACCENT);
      bone(svg, elbow, wrist, GREEN);
      joint(svg, shoulder, "", ACCENT);
      joint(svg, elbow, "", YELLOW);
      joint(svg, wrist, "", GREEN);
      if (smooth) {
        svg.path("M " + (cx - 122) + " 118 Q " + cx + " 92 " + (cx + 126) + " 128 L " +
          (cx + 112) + " 210 Q " + cx + " 224 " + (cx - 120) + " 216 Z", {
          fill: "rgba(41, 204, 106, 0.12)", stroke: GREEN, strokeWidth: 2,
        });
      } else {
        svg.path("M " + (cx - 122) + " 118 L " + (cx - 6) + " 118 L " + (cx + 126) + " 160 L " +
          (cx + 112) + " 230 L " + (cx + 4) + " 172 L " + (cx - 120) + " 216 Z", {
          fill: "rgba(255, 90, 90, 0.12)", stroke: RED, strokeWidth: 2,
        });
      }
      for (var i = 0; i < top.length; i++) {
        svg.line(top[i][0], top[i][1], bottom[i][0], bottom[i][1], {
          stroke: smooth ? GREEN : RED, strokeWidth: 1.2, dashed: "4 4", opacity: 0.75,
        });
        svg.circle(top[i][0], top[i][1], 3.5, { fill: smooth ? GREEN : RED, opacity: 0.9 });
        svg.circle(bottom[i][0], bottom[i][1], 3.5, { fill: smooth ? GREEN : RED, opacity: 0.9 });
      }
      svg.text(cx, 42, label, { size: 13, weight: 800, color: smooth ? GREEN : RED });
    }
    arm(210, "sem blend: dobra dura", false);
    arm(520, "com pesos: dobra suave", true);
  }

  function pipeline(svg) {
    svg.view(700, 260);
    var boxes = [
      ["keyframes / IK", "juntas recebem ângulos"],
      ["matrizes globais", "pai carrega filho"],
      ["skin matrices", "M_atual · M_bind⁻¹"],
      ["vértices", "soma ponderada"],
    ];
    boxes.forEach(function (b, i) {
      var x = 48 + i * 162;
      svg.rect(x, 84, 128, 76, { fill: SOFT, stroke: i === 0 ? ACCENT : BORDER, strokeWidth: 2, rx: 6 });
      svg.text(x + 64, 112, b[0], { size: 12, weight: 800, color: i === 0 ? ACCENT : INK });
      svg.text(x + 64, 140, b[1], { size: 10.5, color: DIM });
      if (i < boxes.length - 1) svg.arrow(x + 132, 122, x + 156, 122, { color: MUTED, head: 9 });
    });
    svg.text(350, 214, "o animador move poucos controles; a malha inteira acompanha", {
      size: 13, weight: 700, color: GREEN,
    });
  }

  function build() {
    return [
      {
        title: "Bones controlam a malha por baixo",
        body:
          "<p><b>Bones</b> são uma estrutura de controle: um <b>esqueleto invisível</b> formado por " +
          "juntas e ossos que move uma <b>malha visível</b>. O artista anima poucos controles — ombro, " +
          "cotovelo, joelho — e o computador deforma centenas ou milhares de vértices.</p>" +
          "<p>A ideia é trocar “mover vértice por vértice” por “mover uma <b>cadeia articulada</b>”. " +
          "Por isso bones ficam no mesmo bloco conceitual de keyframing, morphing e cinemática: as poses " +
          "são animadas no esqueleto; a superfície só acompanha.</p>",
        visual: { type: "svg", draw: character },
      },
      {
        title: "Hierarquia: o pai carrega o filho",
        body:
          "<p>Cada bone tem uma transformação <b>local</b> em relação ao pai. Para saber onde uma junta " +
          "fica no mundo, acumulamos as matrizes desde a raiz até ela. É a mesma composição da " +
          "cinemática direta:</p>" +
          "<div class='formula'>M_mundo(filho) = M_mundo(pai) · M_local(filho)</div>" +
          "<p>Se o ombro gira, o cotovelo e a mão giram junto porque estão abaixo dele na hierarquia. " +
          "Se só o cotovelo gira, a mão acompanha, mas o ombro não muda. Essa direção pai → filho é o " +
          "que dá controle previsível ao rig.</p>",
        visual: { type: "svg", draw: hierarchy },
      },
      {
        title: "Bind pose: a pose zero da pele",
        body:
          "<p>A malha nasce numa <b>bind pose</b> (pose de repouso), normalmente em T-pose ou A-pose. " +
          "Nessa pose, cada vértice recebe pesos dizendo quais ossos o influenciam. Depois, em cada " +
          "quadro, calculamos quanto cada osso saiu da pose de repouso.</p>" +
          "<p>Por isso aparece a matriz inversa de bind: ela remove a posição original do osso antes de " +
          "aplicar a posição atual. Sem esse passo, a malha herdaria deslocamentos duas vezes e sairia " +
          "do lugar.</p>" +
          "<div class='formula'>skinMatrixᵢ = Mᵢ_atual · Mᵢ_bind⁻¹</div>",
        visual: { type: "svg", draw: bindPose },
      },
      {
        title: "Skinning: pesos por vértice",
        body:
          "<p>No <b>skinning</b>, cada vértice guarda uma lista pequena de influências: por exemplo, " +
          "80% antebraço e 20% braço. Ao dobrar o cotovelo, vértices longe da junta seguem quase um " +
          "osso só; vértices perto da dobra misturam os dois para não quebrar a superfície.</p>" +
          "<p>A forma clássica é <b>linear blend skinning</b>: transforme o vértice por cada osso e tire " +
          "a média ponderada. Os pesos devem somar 1.</p>" +
          "<div class='formula'>P' = Σ wᵢ · (Mᵢ_atual · Mᵢ_bind⁻¹ · P)</div>",
        visual: { type: "svg", draw: weights },
      },
      {
        title: "Mapa de pesos (weight paint)",
        body:
          "<p>Em ferramentas como Blender/Maya, esses pesos aparecem como um <b>mapa de cores</b>: regiões " +
          "azuis/roxas pertencem mais ao osso do braço, regiões verdes ao antebraço, e a faixa amarela perto " +
          "do cotovelo mistura os dois.</p>" +
          "<p>O objetivo visual é criar uma <b>transição gradual</b>. Se a mudança de peso for abrupta, a " +
          "malha quebra na articulação; se for distribuída demais, a dobra fica mole e perde volume.</p>",
        visual: { type: "svg", draw: weightPaint },
      },
      {
        title: "O que os pesos evitam",
        body:
          "<p>Se um vértice pertence rigidamente a um único osso, a articulação vira uma <b>dobradiça " +
          "dura</b>: a pele abre fendas ou cria quinas. Com pesos graduais, a deformação é distribuída " +
          "numa faixa ao redor da junta.</p>" +
          "<p>Também há limites: o linear blend skinning pode perder volume em torções fortes, criando o " +
          "efeito “candy wrapper”. Rigs reais corrigem isso com pesos melhores, shapes corretivos, " +
          "constraints ou <b>dual quaternion skinning</b> para rotações difíceis.</p>",
        visual: { type: "svg", draw: badVsGood },
      },
      {
        title: "Fluxo de animação",
        body:
          "<p>O pipeline por quadro é curto:</p>" +
          "<ul>" +
          "<li>animar os controles do esqueleto por keyframes, IK ou captura de movimento;</li>" +
          "<li>propagar as matrizes globais pela hierarquia;</li>" +
          "<li>montar a skin matrix de cada osso com a inversa de bind;</li>" +
          "<li>deformar cada vértice pela soma ponderada dos ossos que o influenciam.</li>" +
          "</ul>" +
          "<p>Assim, bones não substituem keyframing, morphing ou IK; eles são o <b>alvo estrutural</b> " +
          "que essas técnicas controlam quando o objeto é articulado.</p>",
        visual: { type: "svg", draw: pipeline },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Bone</b> é controle, não geometria final: o que aparece é a malha deformada.</li>" +
          "<li><b>Hierarquia</b>: transformações locais se acumulam da raiz até a ponta; pai carrega filho.</li>" +
          "<li><b>Bind pose</b>: pose zero que permite comparar o osso atual contra o osso original.</li>" +
          "<li><b>Skinning</b>: cada vértice mistura poucos ossos por pesos; pesos devem somar 1.</li>" +
          "<li><b>Dobras</b>: pesos ruins geram quinas, perda de volume e torções; corrija com weight paint, " +
          "shapes corretivos ou dual quaternions.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Bones dão uma <b>hierarquia animável</b>. Skinning transforma cada vértice por uma " +
                "soma ponderada das matrizes dos ossos: <code>Σ wᵢ · Mᵢ · Bᵢ⁻¹ · P</code>.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g24-bones",
    num: "B",
    subject: "Computação Gráfica",
    section: "Animação",
    title: "Bones: esqueleto e skinning",
    type: "conceitual",
    tags: ["animação", "bones", "esqueleto", "rigging", "skinning", "juntas", "pesos"],
    hubDesc: "Bones como hierarquia de juntas: bind pose, matrizes globais, pesos por vértice e linear blend skinning.",
    statement:
      "Entenda bones em animação: o esqueleto hierárquico que controla uma malha, a bind pose, as matrizes " +
      "globais dos ossos, os pesos por vértice e a deformação por skinning.",
    parts: [{ label: "Guia", build: build }],
  });
})();
