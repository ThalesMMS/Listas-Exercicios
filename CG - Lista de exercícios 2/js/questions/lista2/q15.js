/*
 * q15.js — Superfícies Implícitas.
 * "Por que a utilização de Blobby facilita a representação? Compare com voxels."
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  var CS = [{ x: -1.2, y: -0.2, r: 1.2 }, { x: 1.05, y: 0.35, r: 1.05 }, { x: 0.1, y: 1.15, r: 0.9 }];
  function field(x, y) {
    var s = 0;
    for (var i = 0; i < CS.length; i++) { var dx = x - CS[i].x, dy = y - CS[i].y; s += (CS[i].r * CS[i].r) / (dx * dx + dy * dy + 1e-4); }
    return s;
  }
  function world(plane, sx, sy) {
    return [plane.xmin + (sx - plane.offsetX) / plane.scale, plane.ymax - (sy - plane.offsetY) / plane.scale];
  }

  // Blobby contínuo: campo amostrado por pixel (silhueta suave).
  function blobby(plane) {
    var ctx = plane.ctx, st = 2;
    for (var sy = 0; sy < plane.cssH; sy += st) for (var sx = 0; sx < plane.cssW; sx += st) {
      var w = world(plane, sx, sy), f = field(w[0], w[1]);
      var c = f >= 1.7 ? COL.accent : f >= 1 ? COL.accentSoft : null;
      if (c) { ctx.fillStyle = c; ctx.fillRect(sx, sy, st, st); }
    }
    CS.forEach(function (c) { plane.point(c.x, c.y, { color: COL.accent, radius: 3 }); });
    plane.text(0, -2.2, "blobby: contorno liso e fusão orgânica", { color: COL.accent, align: "center" });
  }

  // Voxels: mesma forma amostrada numa grade grossa (facetada).
  function voxel(plane) {
    var ctx = plane.ctx, h = 0.5;
    for (var x = plane.xmin; x < plane.xmax; x += h) for (var y = plane.ymin; y < plane.ymax; y += h) {
      if (field(x + h / 2, y + h / 2) >= 1) {
        ctx.fillStyle = COL.greenSoft;
        ctx.fillRect(plane.cx(x), plane.cy(y + h), h * plane.scale, h * plane.scale);
        ctx.strokeStyle = COL.green; ctx.lineWidth = 1;
        ctx.strokeRect(plane.cx(x), plane.cy(y + h), h * plane.scale, h * plane.scale);
      }
    }
    plane.text(0, -2.2, "voxels: mesma forma, presa à grade (aliasing)", { color: COL.green, align: "center" });
  }

  var B = [-3.5, 3.5, -2.6, 3.0];

  function build() {
    return [
      {
        title: "O que é Blobby (metaballs)",
        body:
          "<p>Cada \"blob\" é um <b>campo radial</b>; a superfície é a isosuperfície da <b>soma</b> dos campos, " +
          "<code>Σ rᵢ²/‖p−cᵢ‖² = T</code>. Quando dois centros se aproximam, os campos se somam e as bolhas " +
          "<span class='hl'>se fundem suavemente</span>, sozinhas.</p>",
        visual: { type: "plane", bounds: B, draw: blobby },
      },
	      {
	        title: "Por que facilita a representação",
	        body:
	          "<ul>" +
	          "<li><b>Compacto</b>: bastam alguns <b>centros + raios</b> (uns poucos números) para uma forma rica;</li>" +
	          "<li><b>Blending automático</b>: a fusão é consequência da soma — sem costurar nada;</li>" +
	          "<li><b>Orgânico e suave</b>: contornos lisos, ótimos para fluidos, gotas, músculos;</li>" +
	          "<li><b>Fácil de animar</b>: basta <b>mover/escalar os centros</b>; a topologia se ajusta sozinha;</li>" +
	          "<li><b>Resolução livre</b>: avalia-se f em qualquer ponto (sem \"células\").</li>" +
	          "</ul>" +
	          "<p class='muted'>O custo é <b>menor controle preciso</b> da superfície e a necessidade de avaliar o campo e extrair uma malha quando se quer renderizar como polígonos.</p>",
	        visual: { type: "plane", bounds: B, draw: blobby },
	      },
      {
        title: "Comparando com voxels",
        body:
          "<p>A <b>mesma</b> forma em voxels precisa de uma <b>grade</b>: a silhueta fica <span class='no'>facetada</span> " +
          "(aliasing) e a memória cresce com <code>O(n³)</code>. Para suavizar, só aumentando a resolução — mais memória ainda.</p>" +
	          "<p>O Blobby descreve a mesma superfície com <b>pouquíssimos parâmetros</b> e de forma <b>contínua</b>.</p>" +
	          "<p>Já os voxels são melhores quando os dados já são volumétricos medidos, com densidades, tecidos ou <b>materiais heterogêneos</b>.</p>",
	        visual: { type: "plane", bounds: B, draw: voxel },
	      },
      EX.Slides.comparison({
        title: "Blobby × Voxels",
        intro: "<p>Lado a lado:</p>",
        headers: ["Critério", "Blobby (metaballs)", "Voxels"],
        rows: [
          ["Armazenamento", "poucos centros + raios", "grade O(n³)"],
          ["Suavidade", "contínua/analítica", "facetada (aliasing)"],
	          ["Fusão/junção", "automática e orgânica", "presa à célula"],
	          ["Animação", "mover/escalar centros", "recomputar a grade"],
	          ["Resolução", "avalia onde quiser", "fixa pela célula"],
	          ["Controle local", "menos preciso; depende do campo", "explícito por célula"],
	          ["Dados medidos", "menos natural", "bom para volumes e materiais heterogêneos"],
	        ],
	      }),
    ];
  }

  EX.registry.add({
    id: "q15",
    num: "15",
    subject: "Superfícies Implícitas",
    title: "Blobby × Voxels",
    type: "conceitual",
    hubDesc: "Metaballs: compacto, suave, blending automático e animável — vs grade O(n³).",
    statement: "Por que a utilização de Blobby facilita a representação? Compare com o uso de voxels.",
    parts: [{ label: "Resolução", build: build }],
  });
})();
