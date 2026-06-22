/*
 * c14-registros-ativacao.js — Guia: Registros de ativação e layout de objetos.
 * Agora com a ANIMAÇÃO da pilha de chamadas crescendo/desempilhando (f chama g)
 * além do layout de objeto. Reusa EX.Compilers.box.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  // Pilha vertical de células rotuladas (com "dono" opcional à direita) — usada no layout de objeto.
  function column(svg, x, cells, opts) {
    opts = opts || {};
    var y0 = opts.y0 || 24, w = opts.w || 180, h = 40, gap = 4;
    cells.forEach(function (c, i) {
      var y = y0 + i * (h + gap);
      var hot = opts.hot && opts.hot.indexOf(i) !== -1;
      C.box(svg, x, y, w, h, [c.label], {
        fill: hot ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: hot ? "var(--accent)" : "var(--border)",
        mono: false, size: 13,
      });
      if (c.note) svg.text(x + w + 12, y + h / 2, c.note, { anchor: "start", size: 12, color: "var(--ink-dim)" });
    });
  }

  // Desenha um frame (cabeçalho + células) num estado: hot | normal | faded.
  function frame(svg, x, y, w, title, cells, state) {
    var ch = 32, gap = 3, headH = 24;
    var bodyH = cells.length * (ch + gap) + 6;
    var on = state === "hot", faded = state === "faded";
    var col = on ? "var(--accent)" : faded ? "var(--border)" : "var(--ink-mute)";
    svg.rect(x - 8, y - headH - 2, w + 16, bodyH + headH + 4, {
      fill: "none", stroke: col, strokeWidth: on ? 2.5 : 1.5, dashed: faded, rx: 8,
    });
    svg.text(x - 8 + (w + 16) / 2, y - headH / 2 - 2, title, {
      size: 12, weight: 700, color: col,
    });
    cells.forEach(function (lbl, i) {
      var cy = y + i * (ch + gap);
      C.box(svg, x, cy, w, ch, [lbl], {
        fill: faded ? "var(--bg)" : on ? "var(--accent-soft)" : "var(--bg-soft)",
        stroke: faded ? "var(--border)" : on ? "var(--accent)" : "var(--border)",
        mono: false, size: 12.5, color: faded ? "var(--ink-mute)" : "var(--ink)",
      });
    });
  }

  // o: { f:"hot|normal|faded"|null, g:"hot|normal|faded"|null, note }
  function stackVisual(o) {
    return {
      type: "svg",
      draw: function (svg) {
        svg.view(480, 360);
        svg.text(120, 22, "pilha de execução", { size: 13, weight: 700, color: "var(--ink-dim)" });
        if (o.f) frame(svg, 120, 60, 210, "frame de f(x,y,z)", ["endereço de retorno", "x = 1", "y = 2", "z = 3"], o.f);
        if (o.g) frame(svg, 120, 240, 210, "frame de g(t)", ["endereço de retorno", "t = 2"], o.g);
        if (o.tag) svg.text(360, o.tagY || 120, o.tag, { anchor: "start", size: 12, weight: 700, color: o.tagColor || "var(--ink-dim)" });
      },
    };
  }

  function build() {
    return [
      {
        title: "O registro de ativação",
        body:
          "<p>Cada <b>chamada</b> de função recebe um <b>registro de ativação</b> (stack frame) na " +
          "pilha, com: os <b>parâmetros</b>, as <b>variáveis locais</b>, o <b>endereço de retorno</b> e " +
          "elos de controle. Quando <code>main</code> chama <code>f(1,2,3)</code>, empilha-se o frame de " +
          "<code>f</code>:</p>",
        visual: stackVisual({ f: "hot", tag: "← topo (f ativo)", tagY: 110, tagColor: "var(--accent)" }),
      },
      {
        title: "Chamada aninhada: f chama g",
        body:
          "<p>Em <code>f(x,y,z) = if x then g(y) else g(z)</code>: como <code>x</code> é verdadeiro, " +
          "<code>f</code> chama <code>g(y)</code>. Um <b>novo frame</b> (de <code>g</code>, com " +
          "<code>t = 2</code>) é <b>empilhado por cima</b> — o frame de <code>f</code> continua lá, " +
          "esperando.</p>",
        visual: stackVisual({ f: "normal", g: "hot", tag: "← topo (g ativo)", tagY: 290, tagColor: "var(--accent)" }),
      },
      {
        title: "g retorna → desempilha",
        body:
          "<p><code>g(t) = t + 1</code> calcula <code>2 + 1 = 3</code> e <b>retorna</b>. Seu frame é " +
          "<b>desempilhado</b> (sai da pilha) e o controle volta para <code>f</code>, que reassume o " +
          "topo.</p>",
        visual: stackVisual({ f: "hot", g: "faded", tag: "↩ devolve 3", tagY: 290, tagColor: "var(--red)" }),
      },
      {
        title: "f retorna → pilha esvazia",
        body:
          "<p><code>f</code> usa o resultado de <code>g</code> e <b>retorna</b> para <code>main</code>. " +
          "Seu frame também sai. A pilha cresce e encolhe seguindo exatamente o aninhamento das " +
          "chamadas (LIFO).</p>",
        visual: stackVisual({ f: "faded", tag: "↩ retorna a main", tagY: 110, tagColor: "var(--red)" }),
      },
      C.tableStep({
        title: "Quem mora no frame de f? (Lista C, Q2)",
        body: "Em <code>f(x,y,z) = if x then g(y) else g(z)</code>, com <code>g(t) = t+1</code>:",
        headers: ["símbolo", "no frame de f?", "por quê"],
        rows: [
          ["x, y, z", "sim", "parâmetros de f"],
          ["t", "não", "é parâmetro de g (frame de g)"],
          ["g", "não", "é o nome da função, não uma variável"],
        ],
      }),
      {
        title: "Layout de objetos",
        body:
          "<p>Um objeto começa com <b>metadados</b> (id da classe, tamanho, ponteiro para a tabela de " +
          "despacho) e, em seguida, os <b>atributos</b> — na <b>ordem de herança</b>: os da classe-base " +
          "primeiro, depois os da subclasse.</p>" +
          "<p>Isso permite que código da base acesse seus atributos no mesmo deslocamento, mesmo num " +
          "objeto da subclasse.</p>",
        visual: {
          type: "svg",
          draw: function (svg) {
            svg.view(440, 470);
            column(svg, 110, [
              { label: "id da classe" },
              { label: "tamanho do objeto" },
              { label: "ptr tabela de despacho" },
              { label: "x", note: "de B" },
              { label: "y", note: "de B" },
              { label: "z", note: "de C" },
              { label: "u", note: "de A" },
              { label: "v", note: "de A" },
            ], { hot: [3, 4, 5, 6, 7] });
          },
        },
      },
      C.domStep(
        "Deduzir a herança pelo layout (Lista C, Q4)",
        "Como os atributos aparecem <b>base primeiro</b>, a ordem <code>x, y → z → u, v</code> revela a " +
          "cadeia de herança.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Leitura</div>" +
          "<code>x, y</code> (de B) vêm primeiro → <b>B é a base</b>; depois <code>z</code> (C); por fim " +
          "<code>u, v</code> (A). Logo a cadeia é <b>B → C → A</b> (A é a mais derivada, herda de C, " +
          "que herda de B).</div>"
      ),
      C.domStep(
        "Resumo",
        "Frames e layouts são convenções fixas que tornam chamadas e acesso a atributos previsíveis.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Frame = locais + parâmetros + retorno da chamada, empilhado/desempilhado em <b>LIFO</b>. " +
          "Objeto = metadados + atributos em <b>ordem de herança</b> (base primeiro).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c14-registros-ativacao",
    num: "AR",
    subject: "Compiladores",
    section: "Geração de Código",
    title: "Registros de ativação e layout de objetos",
    type: "conceitual",
    hubDesc: "Pilha de chamadas animada (f chama g, LIFO) e layout de objeto (metadados + atributos por herança).",
    statement:
      "Entenda o registro de ativação (stack frame) de uma chamada, a pilha de execução crescendo e " +
      "desempilhando em chamadas aninhadas, e o layout de memória de um objeto em ordem de herança.",
    parts: [{ label: "Guia", build: build }],
  });
})();
