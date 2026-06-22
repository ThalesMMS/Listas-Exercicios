/*
 * algorithms.js — Algoritmos de Computação Gráfica INSTRUMENTADOS.
 *
 * Cada função devolve um TRAÇO de execução (lista de eventos) + o resultado,
 * de forma independente de UI. Os módulos de questão (qNN.js) traduzem esse
 * traço em passos visuais (Step com draw()).
 *
 * Aritmética EXATA com frações (Fr) para reproduzir os valores do gabarito
 * (ex.: -15/11, 46/11, 5/3) sem erro de ponto flutuante.
 *
 * Exposto em window.ALG. Também funciona em Node (module.exports) para testes.
 *
 * Convenções (iguais ao gabarito):
 *   Janela padrão: xmin=-2, xmax=5, ymin=1, ymax=6
 *   Cohen-Sutherland: L=0001, R=0010, B=0100, T=1000
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Frações exatas
  // ---------------------------------------------------------------------------
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function Fr(n, d) {
    if (n instanceof Fr) {
      this.n = n.n;
      this.d = n.d;
      return;
    }
    d = d == null ? 1 : d;
    if (d === 0) throw new Error("denominador zero");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    var g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }
  function fr(n, d) {
    return n instanceof Fr ? n : new Fr(n, d);
  }
  Fr.prototype.add = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d + o.n * this.d, this.d * o.d);
  };
  Fr.prototype.sub = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d - o.n * this.d, this.d * o.d);
  };
  Fr.prototype.mul = function (o) {
    o = fr(o);
    return new Fr(this.n * o.n, this.d * o.d);
  };
  Fr.prototype.div = function (o) {
    o = fr(o);
    return new Fr(this.n * o.d, this.d * o.n);
  };
  Fr.prototype.num = function () {
    return this.n / this.d;
  };
  Fr.prototype.str = function () {
    if (this.d === 1) return String(this.n);
    return this.n + "/" + this.d;
  };
  // Comparações com inteiro m (exatas; d>0):
  Fr.prototype.ltInt = function (m) {
    return this.n < m * this.d;
  };
  Fr.prototype.gtInt = function (m) {
    return this.n > m * this.d;
  };
  Fr.prototype.eqInt = function (m) {
    return this.n === m * this.d;
  };

  // Ponto com coordenadas fracionárias.
  function P(x, y) {
    return { x: fr(x), y: fr(y) };
  }
  function nx(p) {
    return p.x.num();
  }
  function ny(p) {
    return p.y.num();
  }
  function plabel(p) {
    return "(" + p.x.str() + ", " + p.y.str() + ")";
  }

  // ---------------------------------------------------------------------------
  // Bresenham para circunferências (Q20)
  // ---------------------------------------------------------------------------
  // Octante (2º): p0 = 1 - r, percorre enquanto x <= y.
  function circleBresenham(xc, yc, r) {
    var x = 0,
      y = r,
      p = 1 - r;
    var octant = []; // {x,y,p,decision} relativos ao centro
    var steps = [];
    steps.push({
      type: "init",
      x: x,
      y: y,
      p: p,
      text: "p0 = 1 - r = 1 - " + r + " = " + p + ". Primeiro ponto do octante: (0, " + r + ").",
    });
    while (x <= y) {
      octant.push({ x: x, y: y, p: p });
      var prevP = p,
        prevX = x,
        prevY = y;
      x = x + 1;
      var decision;
      if (prevP < 0) {
        p = prevP + 2 * x + 1;
        decision = "p<0 → x++, p += 2x+1 = " + prevP + " + " + (2 * x + 1) + " = " + p + " (y mantém)";
      } else {
        y = y - 1;
        p = prevP + 2 * (x - y) + 1;
        decision =
          "p≥0 → x++, y--, p += 2(x−y)+1 = " + prevP + " + " + (2 * (x - y) + 1) + " = " + p;
      }
      if (prevX <= prevY) {
        steps.push({
          type: "plot",
          x: prevX,
          y: prevY,
          p: prevP,
          nextX: x,
          nextY: y,
          nextP: p,
          decision: decision,
        });
      }
    }
    return { octant: octant, steps: steps, center: { x: xc, y: yc }, r: r };
  }

  // 8 simétricos de um ponto (x,y) RELATIVO, transladados pelo centro (xc,yc).
  function symmetricPoints(x, y, xc, yc) {
    return [
      { x: xc + x, y: yc + y, sym: "( x,  y)" },
      { x: xc - x, y: yc + y, sym: "(-x,  y)" },
      { x: xc + x, y: yc - y, sym: "( x, -y)" },
      { x: xc - x, y: yc - y, sym: "(-x, -y)" },
      { x: xc + y, y: yc + x, sym: "( y,  x)" },
      { x: xc - y, y: yc + x, sym: "(-y,  x)" },
      { x: xc + y, y: yc - x, sym: "( y, -x)" },
      { x: xc - y, y: yc - x, sym: "(-y, -x)" },
    ];
  }

  // ---------------------------------------------------------------------------
  // Cohen-Sutherland (Q24, Q27)
  // ---------------------------------------------------------------------------
  var LEFT = 1,
    RIGHT = 2,
    BOTTOM = 4,
    TOP = 8;

  function outCode(p, w) {
    var c = 0;
    if (p.x.ltInt(w.xmin)) c |= LEFT;
    else if (p.x.gtInt(w.xmax)) c |= RIGHT;
    if (p.y.ltInt(w.ymin)) c |= BOTTOM;
    else if (p.y.gtInt(w.ymax)) c |= TOP;
    return c;
  }
  function codeBits(c) {
    // 4 bits T B R L (igual ao gabarito: TBRL)
    return (
      (c & TOP ? "1" : "0") +
      (c & BOTTOM ? "1" : "0") +
      (c & RIGHT ? "1" : "0") +
      (c & LEFT ? "1" : "0")
    );
  }
  function codeNames(c) {
    var n = [];
    if (c & TOP) n.push("acima");
    if (c & BOTTOM) n.push("abaixo");
    if (c & RIGHT) n.push("direita");
    if (c & LEFT) n.push("esquerda");
    return n.length ? n.join(", ") : "dentro";
  }

  // Interseção da reta p0->p1 com uma fronteira, mantendo frações exatas.
  function intersect(p0, p1, edge, w) {
    var x0 = p0.x,
      y0 = p0.y,
      x1 = p1.x,
      y1 = p1.y;
    var dx = x1.sub(x0),
      dy = y1.sub(y0);
    if (edge & TOP) {
      // y = ymax
      var t = fr(w.ymax).sub(y0).div(dy);
      return P(x0.add(t.mul(dx)), fr(w.ymax));
    }
    if (edge & BOTTOM) {
      var tb = fr(w.ymin).sub(y0).div(dy);
      return P(x0.add(tb.mul(dx)), fr(w.ymin));
    }
    if (edge & RIGHT) {
      var tr = fr(w.xmax).sub(x0).div(dx);
      return P(fr(w.xmax), y0.add(tr.mul(dy)));
    }
    // LEFT
    var tl = fr(w.xmin).sub(x0).div(dx);
    return P(fr(w.xmin), y0.add(tl.mul(dy)));
  }

  // Retorna {steps, accepted, a, b} — a,b são extremos finais (se aceito).
  function cohenSutherland(pa, pb, w) {
    var a = P(pa.x, pa.y),
      b = P(pb.x, pb.y);
    var ca = outCode(a, w),
      cb = outCode(b, w);
    var steps = [];
    steps.push({
      type: "codes",
      a: a,
      b: b,
      ca: ca,
      cb: cb,
      text:
        "Códigos: " +
        plabel(a) +
        " → " +
        codeBits(ca) +
        " (" +
        codeNames(ca) +
        "); " +
        plabel(b) +
        " → " +
        codeBits(cb) +
        " (" +
        codeNames(cb) +
        ").",
    });

    var guard = 0;
    while (guard++ < 12) {
      if ((ca | cb) === 0) {
        steps.push({ type: "accept", a: a, b: b, text: "c1 = c2 = 0000 → aceitação trivial." });
        return { steps: steps, accepted: true, a: a, b: b };
      }
      if ((ca & cb) !== 0) {
        steps.push({
          type: "reject",
          a: a,
          b: b,
          ca: ca,
          cb: cb,
          text:
            "c1 & c2 = " +
            codeBits(ca & cb) +
            " ≠ 0 → rejeição trivial (mesmo lado externo).",
        });
        return { steps: steps, accepted: false, a: a, b: b };
      }
      // Escolhe um extremo fora.
      var cout = ca !== 0 ? ca : cb;
      var which = ca !== 0 ? "a" : "b";
      // Bit de maior prioridade: T, B, R, L.
      var edge = cout & TOP ? TOP : cout & BOTTOM ? BOTTOM : cout & RIGHT ? RIGHT : LEFT;
      var inter = intersect(a, b, edge, w);
      var edgeName = edge === TOP ? "y=ymax" : edge === BOTTOM ? "y=ymin" : edge === RIGHT ? "x=xmax" : "x=xmin";
      var old = which === "a" ? a : b;
      if (which === "a") {
        a = inter;
        ca = outCode(a, w);
      } else {
        b = inter;
        cb = outCode(b, w);
      }
      steps.push({
        type: "clip",
        which: which,
        edge: edge,
        edgeName: edgeName,
        from: old,
        to: inter,
        a: a,
        b: b,
        ca: ca,
        cb: cb,
        text:
          "Extremo " +
          plabel(old) +
          " está fora (" +
          codeNames(edge) +
          "). Recorta em " +
          edgeName +
          " → " +
          plabel(inter) +
          ". Novo código: " +
          codeBits(which === "a" ? ca : cb) +
          ".",
      });
    }
    return { steps: steps, accepted: false, a: a, b: b };
  }

  // ---------------------------------------------------------------------------
  // Liang-Barsky (Q31)
  // ---------------------------------------------------------------------------
  function liangBarsky(pa, pb, w) {
    var x0 = fr(pa.x),
      y0 = fr(pa.y),
      x1 = fr(pb.x),
      y1 = fr(pb.y);
    var dx = x1.sub(x0),
      dy = y1.sub(y0);
    var rows = [
      { name: "x ≥ xmin", p: dx.mul(-1), q: x0.sub(w.xmin) },
      { name: "x ≤ xmax", p: dx, q: fr(w.xmax).sub(x0) },
      { name: "y ≥ ymin", p: dy.mul(-1), q: y0.sub(w.ymin) },
      { name: "y ≤ ymax", p: dy, q: fr(w.ymax).sub(y0) },
    ];
    var u1 = fr(0),
      u2 = fr(1);
    var steps = [];
    var rejected = false;
    var table = [];
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i].p,
        q = rows[i].q;
      var entry = { name: rows[i].name, p: p, q: q, action: "", u1: u1, u2: u2, r: null };
      if (p.n === 0) {
        // paralelo
        if (q.n < 0) {
          rejected = true;
          entry.action = "p=0 e q<0 → fora (paralelo)";
          table.push(entry);
          steps.push({ type: "boundary", i: i, table: table.slice(), u1: u1, u2: u2, rejected: true, text: rows[i].name + ": " + entry.action });
          break;
        }
        entry.action = "p=0 e q≥0 → paralelo dentro (ignora)";
      } else {
        var ratio = q.div(p);
        entry.r = ratio;
        if (p.num() < 0) {
          // entrada
          if (ratio.num() > u1.num()) u1 = ratio;
          entry.action = "p<0 (entrada) → u1 = max(u1, q/p) = " + u1.str();
        } else {
          // saída
          if (ratio.num() < u2.num()) u2 = ratio;
          entry.action = "p>0 (saída) → u2 = min(u2, q/p) = " + u2.str();
        }
      }
      entry.u1 = u1;
      entry.u2 = u2;
      table.push(entry);
      steps.push({
        type: "boundary",
        i: i,
        table: table.slice(),
        u1: u1,
        u2: u2,
        rejected: false,
        text:
          rows[i].name +
          ": p=" +
          p.str() +
          ", q=" +
          q.str() +
          (entry.r ? ", q/p=" + entry.r.str() : "") +
          ". " +
          entry.action,
      });
    }

    var accepted = !rejected && u1.num() <= u2.num();
    var A = null,
      B = null;
    if (accepted) {
      A = P(x0.add(u1.mul(dx)), y0.add(u1.mul(dy)));
      B = P(x0.add(u2.mul(dx)), y0.add(u2.mul(dy)));
    }
    steps.push({
      type: accepted ? "accept" : "reject",
      u1: u1,
      u2: u2,
      A: A,
      B: B,
      table: table,
      text: accepted
        ? "u1 = " + u1.str() + " ≤ u2 = " + u2.str() + " → segmento aceito: " + plabel(A) + " a " + plabel(B) + "."
        : "u1 = " + u1.str() + " > u2 = " + u2.str() + " → segmento rejeitado.",
    });
    return { steps: steps, accepted: accepted, A: A, B: B, u1: u1, u2: u2, table: table, p0: P(x0, y0), p1: P(x1, y1) };
  }

  // ---------------------------------------------------------------------------
  // Sutherland-Hodgman (Q34) — recorte de polígono por 4 fronteiras
  // ---------------------------------------------------------------------------
  function insideEdge(p, edge, w) {
    if (edge === "left") return !p.x.ltInt(w.xmin); // x >= xmin
    if (edge === "right") return !p.x.gtInt(w.xmax); // x <= xmax
    if (edge === "bottom") return !p.y.ltInt(w.ymin); // y >= ymin
    return !p.y.gtInt(w.ymax); // top: y <= ymax
  }
  function edgeFlag(edge) {
    return edge === "left" ? LEFT : edge === "right" ? RIGHT : edge === "bottom" ? BOTTOM : TOP;
  }
  function clipEdge(poly, edge, w) {
    var out = [];
    var flag = edgeFlag(edge);
    for (var i = 0; i < poly.length; i++) {
      var S = poly[i];
      var Pp = poly[(i + 1) % poly.length];
      var Sin = insideEdge(S, edge, w);
      var Pin = insideEdge(Pp, edge, w);
      if (Sin && Pin) {
        out.push(Pp); // dentro→dentro: adiciona P
      } else if (Sin && !Pin) {
        out.push(intersect(S, Pp, flag, w)); // dentro→fora: interseção
      } else if (!Sin && Pin) {
        out.push(intersect(S, Pp, flag, w)); // fora→dentro: interseção + P
        out.push(Pp);
      } // fora→fora: nada
    }
    return out;
  }
  function sutherlandHodgman(polyIn, w) {
    var order = [
      { edge: "left", label: "esquerda (x ≥ " + w.xmin + ")" },
      { edge: "right", label: "direita (x ≤ " + w.xmax + ")" },
      { edge: "bottom", label: "inferior (y ≥ " + w.ymin + ")" },
      { edge: "top", label: "superior (y ≤ " + w.ymax + ")" },
    ];
    var poly = polyIn.map(function (p) {
      return P(p.x, p.y);
    });
    var steps = [];
    steps.push({ type: "init", poly: poly.slice(), text: "Lista inicial: [" + poly.map(plabel).join(", ") + "]" });
    for (var k = 0; k < order.length; k++) {
      var before = poly.slice();
      poly = clipEdge(poly, order[k].edge, w);
      steps.push({
        type: "clip",
        edge: order[k].edge,
        label: order[k].label,
        before: before,
        poly: poly.slice(),
        text:
          "Após recorte pela fronteira " +
          order[k].label +
          ": [" +
          poly.map(plabel).join(", ") +
          "]",
      });
    }
    return { steps: steps, result: poly };
  }

  // ---------------------------------------------------------------------------
  // Preenchimento (Q37): flood 4/8-conn em grade raster
  // ---------------------------------------------------------------------------
  function key(x, y) {
    return x + "," + y;
  }
  // seed: {x,y}; blocked: Set de chaves "x,y" (borda); bounds: {xmin,xmax,ymin,ymax}.
  // conn: 4 ou 8. Retorna lista de células na ORDEM de visita (BFS), boa p/ animação.
  function flood(seed, blocked, bounds, conn) {
    var n4 = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    var n8 = n4.concat([
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
    var nbrs = conn === 8 ? n8 : n4;
    var visited = {};
    var order = [];
    var queue = [seed];
    visited[key(seed.x, seed.y)] = true;
    var guard = 0;
    while (queue.length && guard++ < 5000) {
      var c = queue.shift();
      if (blocked[key(c.x, c.y)]) continue;
      order.push(c);
      for (var i = 0; i < nbrs.length; i++) {
        var nxv = c.x + nbrs[i][0];
        var nyv = c.y + nbrs[i][1];
        if (nxv < bounds.xmin || nxv > bounds.xmax || nyv < bounds.ymin || nyv > bounds.ymax) continue;
        var kk = key(nxv, nyv);
        if (visited[kk] || blocked[kk]) continue;
        visited[kk] = true;
        queue.push({ x: nxv, y: nyv });
      }
    }
    return order;
  }

  function groupByRow(cells) {
    var rows = {};
    cells.forEach(function (c) {
      (rows[c.y] = rows[c.y] || []).push(c.x);
    });
    Object.keys(rows).forEach(function (y) {
      rows[y].sort(function (a, b) {
        return a - b;
      });
    });
    return rows; // { y: [x,...] }
  }
  // Runs contíguos por linha (para spans de scan-line).
  function runsByRow(cells) {
    var rows = groupByRow(cells);
    var result = {};
    Object.keys(rows).forEach(function (y) {
      var xs = rows[y];
      var runs = [];
      var start = xs[0],
        prev = xs[0];
      for (var i = 1; i < xs.length; i++) {
        if (xs[i] === prev + 1) {
          prev = xs[i];
        } else {
          runs.push([start, prev]);
          start = prev = xs[i];
        }
      }
      runs.push([start, prev]);
      result[y] = runs;
    });
    return result; // { y: [[x0,x1],...] }
  }

  // ---------------------------------------------------------------------------
  // Rasterização de retas — DDA (Q10) e Bresenham (Q15)
  // ---------------------------------------------------------------------------
  // Coerção de coordenada: aceita [x,y], {x,y} (número) ou {x:Fr,y:Fr}.
  function gx(p) { var v = Array.isArray(p) ? p[0] : p.x; return (v && v.num) ? v.num() : v; }
  function gy(p) { var v = Array.isArray(p) ? p[1] : p.y; return (v && v.num) ? v.num() : v; }
  // Arredondamento padrão do DDA: floor(x + 0.5) (meio para cima). Igual a Math.round.
  function roundHalfUp(v) { return Math.floor(v + 0.5); }

  // DDA: passos = max(|Δx|,|Δy|); incrementos racionais (exatos via Fr).
  // Arredonda APENAS para escolher o pixel (Q8). Retorna traço + pixels.
  function ddaLine(p0, p1) {
    var x0 = gx(p0), y0 = gy(p0), x1 = gx(p1), y1 = gy(p1);
    var dx = x1 - x0, dy = y1 - y0;
    var steps = Math.max(Math.abs(dx), Math.abs(dy));
    var caso = Math.abs(dx) >= Math.abs(dy) ? 1 : 2;
    var rows = [], pixels = [];
    if (steps === 0) {
      rows.push({ i: 0, x: fr(x0), y: fr(y0), xr: x0, yr: y0, note: "ponto único" });
      pixels.push([x0, y0]);
      return { p0: { x: x0, y: y0 }, p1: { x: x1, y: y1 }, dx: dx, dy: dy, steps: 0, caso: caso, xinc: fr(0), yinc: fr(0), rows: rows, pixels: pixels };
    }
    var xinc = fr(dx, steps), yinc = fr(dy, steps);
    var x = fr(x0), y = fr(y0);
    for (var i = 0; i <= steps; i++) {
      if (i > 0) { x = x.add(xinc); y = y.add(yinc); }
      var xr = roundHalfUp(x.num()), yr = roundHalfUp(y.num());
      rows.push({ i: i, x: x, y: y, xr: xr, yr: yr, note: i === 0 ? "início" : "x += " + xinc.str() + ", y += " + yinc.str() });
      pixels.push([xr, yr]);
    }
    return { p0: { x: x0, y: y0 }, p1: { x: x1, y: y1 }, dx: dx, dy: dy, steps: steps, caso: caso, xinc: xinc, yinc: yinc, rows: rows, pixels: pixels };
  }

  // Bresenham (inteiro, todos os octantes via sx,sy e flag steep).
  // Convenção de empate: p ≥ 0 → toma a diagonal. p e (x,y) gravados ANTES da atualização.
  function bresenhamLine(p0, p1) {
    var x0 = gx(p0), y0 = gy(p0), x1 = gx(p1), y1 = gy(p1);
    var dxs = x1 - x0, dys = y1 - y0;
    var dx = Math.abs(dxs), dy = Math.abs(dys);
    var sx = dxs >= 0 ? 1 : -1, sy = dys >= 0 ? 1 : -1;
    var steep = dy > dx;
    var caso = steep ? 2 : 1;
    var p, incNeg, incPos;
    if (!steep) { p = 2 * dy - dx; incNeg = 2 * dy; incPos = 2 * dy - 2 * dx; }
    else { p = 2 * dx - dy; incNeg = 2 * dx; incPos = 2 * dx - 2 * dy; }
    var p0val = p, n = steep ? dy : dx;
    var x = x0, y = y0, rows = [], pixels = [];
    for (var i = 0; i <= n; i++) {
      rows.push({ i: i, x: x, y: y, p: p, branch: i === n ? "fim" : (p < 0 ? "p<0" : "p≥0") });
      pixels.push([x, y]);
      if (i < n) {
        if (!steep) { if (p < 0) { x += sx; p += incNeg; } else { x += sx; y += sy; p += incPos; } }
        else { if (p < 0) { y += sy; p += incNeg; } else { y += sy; x += sx; p += incPos; } }
      }
    }
    return { p0: { x: x0, y: y0 }, p1: { x: x1, y: y1 }, dx: dx, dy: dy, sx: sx, sy: sy, caso: caso, p0val: p0val, incNeg: incNeg, incPos: incPos, rows: rows, pixels: pixels };
  }

  // ---------------------------------------------------------------------------
  // Transformações geométricas 2D — matrizes homogêneas 3x3 (Q2, Q5)
  // Convenção: ponto-coluna v=[x,y,1]ᵀ, transformação v' = M·v.
  // ---------------------------------------------------------------------------
  function mIdentity() { return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; }
  function mTranslate(tx, ty) { return [[1, 0, tx], [0, 1, ty], [0, 0, 1]]; }
  function mScale(sx, sy) { return [[sx, 0, 0], [0, sy, 0], [0, 0, 1]]; }
  function mReflectX() { return [[1, 0, 0], [0, -1, 0], [0, 0, 1]]; } // (x,y) -> (x,-y)
  function mRotateDeg(deg) {
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
  }
  function matMul(A, B) {
    var R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
      var sum = 0;
      for (var k = 0; k < 3; k++) sum += A[i][k] * B[k][j];
      R[i][j] = sum;
    }
    return R;
  }
  function matApply(M, p) {
    var x = gx(p), y = gy(p);
    return { x: M[0][0] * x + M[0][1] * y + M[0][2], y: M[1][0] * x + M[1][1] * y + M[1][2] };
  }
  // list = [1ª aplicada, …, última aplicada] → M = última·…·1ª (resposta da Q4).
  function matCompose(list) {
    var M = mIdentity();
    for (var i = 0; i < list.length; i++) M = matMul(list[i], M);
    return M;
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function applyToPolygon(M, pts) { return pts.map(function (p) { return matApply(M, p); }); }

  // ---------------------------------------------------------------------------
  // Exporta
  // ---------------------------------------------------------------------------
  var ALG = {
    Fr: Fr,
    fr: fr,
    P: P,
    nx: nx,
    ny: ny,
    plabel: plabel,
    DEFAULT_WINDOW: { xmin: -2, xmax: 5, ymin: 1, ymax: 6 },
    BITS: { LEFT: LEFT, RIGHT: RIGHT, BOTTOM: BOTTOM, TOP: TOP },
    circleBresenham: circleBresenham,
    symmetricPoints: symmetricPoints,
    outCode: outCode,
    codeBits: codeBits,
    codeNames: codeNames,
    intersect: intersect,
    cohenSutherland: cohenSutherland,
    liangBarsky: liangBarsky,
    sutherlandHodgman: sutherlandHodgman,
    flood: flood,
    groupByRow: groupByRow,
    runsByRow: runsByRow,
    key: key,
    // Retas (Q10, Q15)
    ddaLine: ddaLine,
    bresenhamLine: bresenhamLine,
    // Transformações (Q2, Q5)
    mIdentity: mIdentity,
    mTranslate: mTranslate,
    mScale: mScale,
    mReflectX: mReflectX,
    mRotateDeg: mRotateDeg,
    matMul: matMul,
    matApply: matApply,
    matCompose: matCompose,
    applyToPolygon: applyToPolygon,
    round2: round2,
  };

  if (typeof window !== "undefined") window.ALG = ALG;
  if (typeof module !== "undefined" && module.exports) module.exports = ALG;
})();
