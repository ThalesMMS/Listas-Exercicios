/*
 * g20-textura.js — Guia: mapeamento de textura e sua correção.
 * As coordenadas (u,v)∈[0,1]², a amostragem nearest vs bilinear, o problema do
 * texture scanning direto (buracos e sobreposições), a correção por mapeamento
 * inverso, os mipmaps contra o aliasing de minificação e a interpolação
 * perspectivamente correta (u/z, v/z, 1/z).
 *
 * Visual: SVG (grades de texels/pixels, setas, trapézio em perspectiva).
 */
(function () {
  "use strict";
  var EX = window.EX;

  function grid(svg, x, y, cols, rows, cw, fill) {
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: fill || "none", stroke: "var(--ink-mute)", strokeWidth: 1 });
  }
  function mark(svg, x, y, cw, c, r, fill, label, color) {
    svg.rect(x + c * cw, y + r * cw, cw, cw, { fill: fill });
    if (label) svg.text(x + c * cw + cw / 2, y + r * cw + cw / 2, label, { size: 13, weight: 800, color: color });
  }

  function build() {
    return [
      {
        title: "Colar uma imagem numa superfície: (u, v)",
        body:
          "<p>Detalhar geometria custa caro; <b>pintar</b> o detalhe é barato. Mapeamento de textura " +
          "associa cada ponto da superfície a um <b>texel</b> (pixel da imagem), via um par de " +
          "<b>coordenadas de textura</b> <code>(u, v) ∈ [0, 1]²</code>.</p>" +
          "<p>Pense numa malha de costura: <code>(u, v)</code> é o “endereço” na estampa, e os vértices " +
          "do modelo carregam seu <code>(u, v)</code>. Convenção comum: <code>(0,0)</code> num canto da " +
          "imagem, <code>(1,1)</code> no oposto — independente da resolução em texels.</p>" +
          "<p>O jeito ingênuo — <b>texture scanning direto</b> — percorre a <b>textura</b> e projeta cada " +
          "texel na tela. Parece natural, mas quebra: a transformação textura→tela quase nunca é " +
          "<b>1:1</b> (há escala, rotação e perspectiva pelo caminho).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 240);
            grid(svg, 40, 40, 4, 4, 28, "var(--bg-soft)");
            svg.text(96, 188, "textura (texels) — (u,v)∈[0,1]²", { size: 11, color: "var(--ink-dim)" });
            svg.arrow(180, 96, 240, 96, { color: "var(--ink-dim)", strokeWidth: 2, head: 9 });
            grid(svg, 250, 40, 5, 5, 24, "var(--accent-soft)");
            svg.text(310, 188, "tela (pixels)", { size: 11, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "O problema: buracos e sobreposições",
        body:
          "<p>Como a grade de origem (texels) e a de destino (pixels) têm <b>tamanhos diferentes</b>, ao " +
          "projetar texel→pixel acontecem dois defeitos complementares:</p>" +
          "<ul>" +
          "<li><span class='no'>× buracos</span> — quando a textura é <em>menor</em> que a região na tela " +
          "(<b>magnificação</b>): faltam texels, e pixels ficam <b>sem ninguém</b> que os pinte;</li>" +
          "<li><span class='hl'>2 sobreposições</span> — quando a textura é <em>maior</em> " +
          "(<b>minificação</b>): vários texels caem no <b>mesmo</b> pixel, escrito mais de uma vez " +
          "(desperdício, e o último vence — instável).</li>" +
          "</ul>" +
          "<p>É a mesma raiz dos buracos do <em>DDA</em> ingênuo: andar de 1 em 1 na grade <b>errada</b> " +
          "(a de origem) não cobre a outra direito. O resultado tem falhas e <em>aliasing</em>.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(360, 240);
            grid(svg, 60, 40, 5, 5, 26, "var(--accent-soft)");
            mark(svg, 60, 40, 26, 0, 1, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 2, 3, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 4, 0, "var(--red-soft)", "×", "var(--red)");
            mark(svg, 60, 40, 26, 1, 1, "var(--yellow-soft)", "2", "var(--yellow)");
            mark(svg, 60, 40, 26, 3, 2, "var(--yellow-soft)", "2", "var(--yellow)");
            svg.text(125, 198, "× buracos   ·   2 sobreposições", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "A correção: mapeamento inverso",
        body:
          "<p>Inverta a varredura: percorra a <b>tela</b> e, para <b>cada pixel</b>, aplique a " +
          "transformação <b>inversa</b> (tela→textura) para achar a coordenada <code>(u, v)</code> " +
          "correspondente, e amostre a textura <em>ali</em>.</p>" +
          "<p>Assim <b>todo pixel é preenchido exatamente uma vez</b> — o laço é sobre os pixels que " +
          "realmente existem, então não sobra nem falta ninguém: <span class='ok'>sem buracos, sem " +
          "sobreposições</span>. É o mesmo princípio do mapeamento inverso em transformações de imagem.</p>" +
          "<p>Em troca, <code>(u, v)</code> quase nunca cai exatamente sobre um texel — cai " +
          "<em>entre</em> eles. Daí a próxima pergunta: <b>como amostrar</b> nessa posição fracionária " +
          "(nearest? bilinear?).</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 240);
            grid(svg, 40, 40, 5, 5, 24, "var(--green-soft)");
            svg.text(100, 188, "tela (pixels)", { size: 11, color: "var(--ink-dim)" });
            grid(svg, 300, 40, 4, 4, 28, "var(--bg-soft)");
            svg.text(356, 188, "textura", { size: 11, color: "var(--ink-dim)" });
            [[1, 1], [3, 0], [2, 3], [0, 4]].forEach(function (p) {
              svg.arrow(40 + p[0] * 24 + 12, 40 + p[1] * 24 + 12, 320, 96, { color: "var(--green)", strokeWidth: 1.3, head: 6, dashed: "4 4", opacity: 0.75 });
            });
            svg.text(220, 214, "cada pixel amostra a textura 1×", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Amostrar entre texels: nearest × bilinear",
        body:
          "<p>Caímos numa posição fracionária <code>(u, v)</code>. Duas formas de obter uma cor:</p>" +
          "<ul>" +
          "<li><b>Nearest</b> (vizinho mais próximo): arredonda para o texel mais perto. Rápido, mas na " +
          "magnificação fica <b>quadriculado</b> (blocos grandes) e “pula” ao mover;</li>" +
          "<li><b>Bilinear</b>: combina os <b>4 texels</b> vizinhos pesando pelas frações " +
          "<code>(f<sub>u</sub>, f<sub>v</sub>)</code> da posição. Suave e barato (duas lerps em u, uma " +
          "em v — interpolação linear, como no DDA).</li>" +
          "</ul>" +
          "<div class='formula'>c = (1−f_u)(1−f_v)·c00 + f_u(1−f_v)·c10\n" +
          "  + (1−f_u)f_v·c01 + f_u f_v·c11</div>" +
          "<p><b>Mini-conta:</b> em <code>f_u = 0,25</code>, <code>f_v = 0,5</code>, os pesos são " +
          "0,375 / 0,125 / 0,375 / 0,125 — somam <span class='ok'>1</span> (é uma média ponderada). " +
          "Mais perto de um texel, mais ele pesa.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(420, 240);
            // 2x2 de texels com o ponto de amostragem entre eles e os 4 pesos
            var x = 120, y = 50, cw = 70;
            grid(svg, x, y, 2, 2, cw, "var(--bg-soft)");
            svg.text(x + cw * 0.5, y + cw * 0.5, "c00", { size: 12, color: "var(--ink-dim)" });
            svg.text(x + cw * 1.5, y + cw * 0.5, "c10", { size: 12, color: "var(--ink-dim)" });
            svg.text(x + cw * 0.5, y + cw * 1.5, "c01", { size: 12, color: "var(--ink-dim)" });
            svg.text(x + cw * 1.5, y + cw * 1.5, "c11", { size: 12, color: "var(--ink-dim)" });
            // ponto de amostra em (fu=0.25, fv=0.5) relativo ao centro de c00
            var sx = x + cw * 0.5 + 0.25 * cw, sy = y + cw * 0.5 + 0.5 * cw;
            svg.circle(sx, sy, 6, { fill: "var(--accent)", stroke: "var(--ink)", strokeWidth: 1.5 });
            svg.text(sx + 12, sy - 12, "(u,v)", { size: 12, weight: 800, color: "var(--accent)", anchor: "start" });
            svg.text(210, 214, "bilinear: média dos 4 vizinhos, pesada pela distância", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Mipmaps: contra o aliasing de minificação",
        body:
          "<p>Na <b>minificação</b> (textura grande espremida em poucos pixels), <em>um</em> pixel cobre " +
          "<b>muitos texels</b>. Amostrar só um deles (nearest/bilinear) ignora os outros → " +
          "<b>aliasing</b>: serrilhado e, em movimento, <span class='no'>cintilação</span> e padrões de " +
          "moiré (um piso xadrez ao longe “fervendo”).</p>" +
          "<p>A solução é <b>pré-filtrar</b>: guardar a textura numa <b>pirâmide</b> de versões cada vez " +
          "menores (nível 0 = original; cada nível seguinte tem metade da largura, já <em>borrada/" +
          "mediada</em>). Em runtime, escolhe-se o nível cujo texel ≈ tamanho do pixel na tela.</p>" +
          "<ul>" +
          "<li>custo extra de memória: só <b>+1/3</b> (1 + 1/4 + 1/16 + … ≈ 4/3);</li>" +
          "<li><b>trilinear</b>: interpola entre os dois níveis vizinhos da pirâmide, sem “costura” " +
          "abrupta na troca de nível;</li>" +
          "<li>a média já foi feita <b>uma vez</b>, ao construir o mipmap — não a cada pixel.</li>" +
          "</ul>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 220);
            // pirâmide de mipmaps: quadrados decrescentes alinhados pela base
            var base = 150, sizes = [120, 60, 30, 15];
            var x = 40, gap = 18;
            sizes.forEach(function (s, i) {
              var y = base - s;
              svg.rect(x, y, s, s, { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 1.5 });
              svg.text(x + s / 2, y - 10, "nível " + i, { size: 10.5, color: "var(--ink-dim)" });
              x += s + gap;
            });
            svg.text(220, 190, "cada nível: metade da largura, já mediado", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Sob perspectiva: não interpole u, v direto",
        body:
          "<p>Numa face inclinada em <b>perspectiva</b>, interpolar <code>u, v</code> " +
          "<b>linearmente na tela</b> está <b>errado</b>. A razão: a projeção em perspectiva divide por " +
          "<code>z</code> (a divisão por <code>w</code> das coordenadas homogêneas), e " +
          "<em>dividir não comuta com interpolar linearmente</em>. A profundidade comprime a textura ao " +
          "longe, mas a interpolação afim espaça por igual → a imagem “entorta” (textura nadando, xadrez " +
          "deformado na diagonal — o clássico “warp” do PS1).</p>" +
          "<p>O conserto: o que <b>é</b> linear na tela são as quantidades <em>divididas por z</em>. " +
          "Então interpolamos <code>u/z, v/z</code> e também <code>1/z</code>, e dividimos no fim para " +
          "recuperar <code>(u, v)</code>:</p>" +
          "<div class='formula'>interpola (linear na tela):  u/z ,  v/z ,  1/z\n" +
          "no pixel:   u = (u/z) / (1/z) ,   v = (v/z) / (1/z)</div>" +
          "<p>Os vértices guardam <code>(u/z, v/z, 1/z)</code>; o rasterizador interpola os três como o " +
          "DDA faz com cor/profundidade, e a divisão por pixel desfaz a perspectiva.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 230);
            // chão em perspectiva (trapézio) com linhas que convergem ao fundo
            var tl = [160, 40], tr = [280, 40], br = [400, 200], bl = [40, 200];
            svg.polygon([tl, tr, br, bl], { fill: "var(--bg-soft)", stroke: "var(--ink)", strokeWidth: 2 });
            // linhas transversais aproximando o espaçamento correto (bunching ao fundo)
            [0.12, 0.28, 0.48, 0.72, 1].forEach(function (t) {
              var lx = bl[0] + (tl[0] - bl[0]) * (1 - t);
              var ly = bl[1] + (tl[1] - bl[1]) * (1 - t);
              var rx = br[0] + (tr[0] - br[0]) * (1 - t);
              var ry = br[1] + (tr[1] - br[1]) * (1 - t);
              svg.line(lx, ly, rx, ry, { stroke: "var(--accent)", strokeWidth: 1.4 });
            });
            svg.text(220, 220, "espaçamento certo: aperta ao fundo (1/z)", { size: 11.5, color: "var(--ink-dim)" });
          },
        },
      },
      {
        title: "Resumo e cuidados",
        body:
          "<ul>" +
          "<li><b>Sempre inverso</b>: varra os pixels e busque o texel — nunca o contrário " +
          "(evita buracos e sobreposições).</li>" +
          "<li><b>Magnificação</b>: amostre <code>bilinear</code> (4 vizinhos pesados) em vez de " +
          "<code>nearest</code> para não ficar quadriculado.</li>" +
          "<li><b>Minificação</b>: use <code>mipmaps</code> (+ trilinear) contra serrilhado e " +
          "cintilação.</li>" +
          "<li><b>Perspectiva</b>: interpole <code>u/z, v/z, 1/z</code> e divida no pixel; senão a " +
          "textura “nada”.</li>" +
          "</ul>",
        visual: {
          type: "dom",
          draw: function (host) {
            EX.Content.callout(host, {
              kind: "tip",
              title: "Ideia-chave",
              html: "Varra a <b>tela</b>, não a textura. Magnificação → <b>bilinear</b>; minificação → " +
                "<b>mipmaps</b>; perspectiva → interpole <b>u/z, v/z, 1/z</b> e divida no pixel.",
            });
          },
        },
      },
    ];
  }

  EX.registry.add({
    id: "g20-textura",
    num: "▦",
    subject: "Computação Gráfica",
    section: "Iluminação & Renderização",
    title: "Correção do mapeamento de textura",
    type: "conceitual",
    tags: ["textura", "perspectiva", "mapeamento inverso", "mipmap", "bilinear"],
    hubDesc: "(u,v)∈[0,1]²; scanning direto falha (buracos/sobreposições); mapeamento inverso; nearest×bilinear; mipmaps; e u/z,v/z,1/z.",
    statement:
      "Entenda o mapeamento de textura e sua correção: as coordenadas (u,v), o problema da interpolação " +
      "incorreta no texture scanning direto, a correção por mapeamento inverso, a amostragem nearest vs " +
      "bilinear, os mipmaps contra o aliasing de minificação e a interpolação perspectivamente correta " +
      "(u/z, v/z, 1/z).",
    parts: [{ label: "Guia", build: build }],
  });
})();
