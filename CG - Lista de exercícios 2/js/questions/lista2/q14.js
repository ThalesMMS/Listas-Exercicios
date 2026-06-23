/*
 * q14.js — Superfícies Implícitas.
 * "Quais são as formas de representar implicitamente uma superfície?"
 */
(function () {
  "use strict";
  var EX = window.EX;
  var COL = EX.CartesianPlane.COLORS;

  function eachPixel(plane, fn) {
    var ctx = plane.ctx, st = 3;
    for (var sy = 0; sy < plane.cssH; sy += st) for (var sx = 0; sx < plane.cssW; sx += st) {
      var x = plane.xmin + (sx - plane.offsetX) / plane.scale;
      var y = plane.ymax - (sy - plane.offsetY) / plane.scale;
      var col = fn(x, y);
      if (col) { ctx.fillStyle = col; ctx.fillRect(sx, sy, st, st); }
    }
  }

  // Algébrica: elipse (x/3)²+(y/2)²−1=0.
  function algebric(plane) {
    eachPixel(plane, function (x, y) { return (x * x) / 9 + (y * y) / 4 - 1 < 0 ? COL.accentSoft : null; });
    plane.text(0, 0, "(x/3)² + (y/2)² − 1 = 0", { color: COL.accent, align: "center" });
  }

  // Blobby/metaballs: soma de campos radiais.
  function field(cs, x, y) {
    var s = 0;
    for (var i = 0; i < cs.length; i++) { var dx = x - cs[i].x, dy = y - cs[i].y; s += (cs[i].r * cs[i].r) / (dx * dx + dy * dy + 1e-4); }
    return s;
  }
  function blobby(plane) {
    var cs = [{ x: -1.3, y: 0, r: 1.25 }, { x: 1.3, y: 0, r: 1.25 }];
    eachPixel(plane, function (x, y) { return field(cs, x, y) >= 1 ? COL.greenSoft : null; });
    cs.forEach(function (c) { plane.point(c.x, c.y, { color: COL.green, radius: 3 }); });
    plane.text(0, 2.3, "Σ rᵢ²/‖p−cᵢ‖² = T", { color: COL.green, align: "center" });
  }

  // SDF: distância assinada a um círculo r=2.
  function sdf(plane) {
    eachPixel(plane, function (x, y) {
      var d = Math.sqrt(x * x + y * y) - 2;
      if (d < 0) return COL.purpleSoft || COL.accentSoft;
      return null;
    });
    var ctx = plane.ctx;
    [1, 2, 3].forEach(function (r, i) {
      ctx.beginPath(); ctx.arc(plane.cx(0), plane.cy(0), r * plane.scale, 0, Math.PI * 2);
      ctx.strokeStyle = r === 2 ? COL.accent : COL.muted; ctx.lineWidth = r === 2 ? 2.5 : 1;
      ctx.setLineDash(r === 2 ? [] : [4, 4]); ctx.stroke(); ctx.setLineDash([]);
    });
    plane.text(0, 2.1, "f = dist − 2", { color: COL.accent, align: "center" });
    plane.text(0, -3.0, "isolinhas: f = −1, 0, +1", { color: COL.muted, align: "center" });
  }

  var B = [-4, 4, -3.2, 3.2];

  function build() {
    return [
      {
        title: "A pergunta: que função f usar?",
        body:
          "<p>Representar implicitamente é escolher a <b>função f</b> tal que <code>f(p) = 0</code> seja a superfície " +
          "desejada. Há várias formas de construir essa f:</p>" +
          "<ul><li>algébrica;</li><li>blobby/metaballs;</li><li>campos de distância (SDF);</li>" +
          "<li>RBF / conjuntos de nível.</li></ul>",
        visual: { type: "none" },
      },
      {
        title: "1) Algébrica (analítica)",
        body:
          "<p>f é um <b>polinômio</b> explícito. <span class='hl'>Quádricas</span> (esfera, elipsoide, cilindro, cone) e " +
          "<span class='hl'>superquádricas</span> (expoentes ajustam de cubo a esfera) são as mais comuns.</p>" +
          "<p>Exata e compacta, mas limitada às formas que a equação descreve.</p>",
        visual: { type: "plane", bounds: B, draw: algebric },
      },
      {
        title: "2) Blobby / metaballs",
        body:
          "<p>f é a <b>soma de funções de base radial</b> (uma por \"centro\"/carga) menos um limiar <code>T</code>. " +
          "Próximos, os campos se somam e as bolhas <b>se fundem</b> suavemente — ideal para formas orgânicas (Q15).</p>",
        visual: { type: "plane", bounds: B, draw: blobby },
      },
      {
        title: "3) Campo de distância com sinal (SDF)",
        body:
          "<p>f(p) é a <b>distância assinada</b> até a superfície (negativa dentro). As isolinhas são offsets da forma. " +
          "Base do <b>ray-marching</b> e de operações como dilatar/encolher e arredondar.</p>",
        visual: { type: "plane", bounds: B, draw: sdf },
      },
      EX.Slides.definition({
        title: "4) RBF e conjuntos de nível",
        term: "RBF / level sets",
        body:
          "<p><b>RBF</b> (funções de base radial): interpolam uma f implícita a partir de pontos amostrados da " +
          "superfície (com normais) — reconstrução de superfícies.</p>" +
          "<p><b>Conjuntos de nível</b> (level sets): f é um campo amostrado numa grade que <b>evolui no tempo</b> " +
          "(fluidos, fusões), e a superfície é a isosuperfície <code>f = 0</code>.</p>",
      }),
    ];
  }

  EX.registry.add({
    id: "q14",
    num: "14",
    subject: "Superfícies Implícitas",
    title: "Formas de representar implicitamente",
    type: "conceitual",
    hubDesc: "Algébrica (quádricas), blobby/metaballs, SDF e RBF/level sets.",
    statement: "Quais são as formas de representar implicitamente uma superfície?",
    parts: [{ label: "Resolução", build: build }],
  });
})();
