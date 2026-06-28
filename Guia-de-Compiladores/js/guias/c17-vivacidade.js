/*
 * c17-vivacidade.js — Guia: Análise de vivacidade (liveness).
 * Agora com um CFG e a ANIMAÇÃO do fluxo de dados PARA TRÁS: LIVE_out/LIVE_in
 * preenchidos bloco a bloco até o ponto fixo. Reusa EX.Diagram.flowchart.
 */
(function () {
  "use strict";
  var EX = window.EX;
  var C = EX.Compilers;

  var CFG = {
    nodes: [
      { id: "test", kind: "decision", label: "X > 0 ?", x: 300, y: 80 },
      { id: "then", kind: "process", label: "Y := Y + 1", x: 160, y: 250 },
      { id: "els", kind: "process", label: "Z := W + 4", x: 470, y: 250 },
      { id: "fim", kind: "end", label: "fim", x: 300, y: 410 },
    ],
    edges: [
      { from: "test", to: "then", label: "sim" },
      { from: "test", to: "els", label: "não" },
      { from: "then", to: "fim" },
      { from: "els", to: "fim" },
    ],
  };

  // o: { hi:[ids], activeEdges:[[a,b]], live:{id:"{…}"}, out:{id:"{…}"} }
  function cfgVisual(o) {
    o = o || {};
    return {
      type: "svg",
      draw: function (svg) {
        var pos = EX.Diagram.flowchart(svg, CFG, {
          view: [700, 500],
          highlight: o.hi || [],
          activeEdges: o.activeEdges || [],
        });
        Object.keys(o.out || {}).forEach(function (id) {
          var p = pos[id]; if (!p) return;
          svg.text(p.x + 78, p.y - 16, "out " + o.out[id], { anchor: "start", size: 12, mono: true, color: "var(--ink-dim)", weight: 600 });
        });
        Object.keys(o.live || {}).forEach(function (id) {
          var p = pos[id]; if (!p) return;
          svg.text(p.x + 78, p.y + 6, "in " + o.live[id], { anchor: "start", size: 13, mono: true, color: "var(--green)", weight: 700 });
        });
      },
    };
  }

  function build() {
    return [
      C.domStep(
        "O que é uma variável 'viva'",
        "Uma variável está <b>viva</b> num ponto do programa se o valor que ela tem ali <b>pode ser " +
          "usado</b> depois — antes de ser sobrescrita. Variáveis mortas não precisam ocupar " +
          "registrador: por isso a vivacidade é a base da alocação de registradores.",
        C.codeHtml("... a := 5 ...        a está VIVA se algum caminho à frente lê 'a'\n                      antes de redefini-la; senão está MORTA")
      ),
      C.domStep(
        "Cálculo para trás (backward)",
        "A vivacidade flui do <b>uso futuro para trás</b>. Primeiro marque o que o bloco lê " +
          "(<code>USE</code>) e o que ele escreve (<code>DEF</code>). Depois aplique a regra:",
        C.codeHtml("LIVE_out[B] = ∪ LIVE_in[sucessores de B]\nLIVE_in[B]  = USE[B] ∪ ( LIVE_out[B] − DEF[B] )") +
          "<p>Leitura da fórmula: tudo que será necessário depois entra em <code>out</code>. Na entrada " +
          "do bloco, ficam os valores usados pelo bloco mais os valores futuros que o bloco não redefiniu.</p>" +
          "<p>Com laços, repita até nada mudar: esse é o ponto fixo.</p>"
      ),
      {
        title: "O grafo de fluxo e seus USE/DEF",
        body:
          "<p>Vamos analisar este <code>if</code> como um CFG de 4 blocos. Para cada bloco, separe " +
          "duas listas: o que ele lê antes de escrever (<code>USE</code>) e o que ele escreve " +
          "(<code>DEF</code>).</p>" +
          "<ul>" +
          "<li><code>X &gt; 0 ?</code> — USE <code>{X}</code>, DEF <code>{}</code>;</li>" +
          "<li><code>Y := Y + 1</code> — USE <code>{Y}</code>, DEF <code>{Y}</code>;</li>" +
          "<li><code>Z := W + 4</code> — USE <code>{W}</code>, DEF <code>{Z}</code>.</li>" +
          "</ul><p>Agora propagamos a vivacidade <b>de baixo para cima</b>.</p>",
        visual: cfgVisual({}),
      },
      {
        title: "Passo 1 — começa no fim",
        body:
          "<p>No final do programa nada mais será lido: <code>LIVE_out[fim] = {}</code>. " +
          "É daqui que a propagação <b>para trás</b> parte.</p>",
        visual: cfgVisual({ hi: ["fim"], out: { fim: "{ }" } }),
      },
      {
        title: "Passo 2 — ramo then",
        body:
          "<p>No bloco <code>Y := Y + 1</code>: <code>LIVE_out = LIVE_in[fim] = {}</code>. Então " +
          "<code>LIVE_in = USE ∪ (out − DEF) = {Y} ∪ ({}−{Y}) = {Y}</code>. " +
          "Mesmo escrevendo <code>Y</code>, ele é <b>lido antes</b> → entra vivo.</p>",
        visual: cfgVisual({ hi: ["then"], activeEdges: [["then", "fim"]], out: { then: "{ }" }, live: { then: "{ Y }" } }),
      },
      {
        title: "Passo 3 — ramo else",
        body:
          "<p>No bloco <code>Z := W + 4</code>: <code>LIVE_out = {}</code>, " +
          "<code>LIVE_in = {W} ∪ ({}−{Z}) = {W}</code>. <code>W</code> é lido; <code>Z</code> só é " +
          "escrito (não fica vivo na entrada).</p>",
        visual: cfgVisual({ hi: ["els"], activeEdges: [["els", "fim"]], out: { els: "{ }" }, live: { then: "{ Y }", els: "{ W }" } }),
      },
      {
        title: "Passo 4 — o teste (junção dos ramos)",
        body:
          "<p>O bloco do teste tem <b>dois sucessores</b>: " +
          "<code>LIVE_out = LIVE_in[then] ∪ LIVE_in[else] = {Y} ∪ {W} = {Y, W}</code>. " +
          "Como ele só <b>lê</b> <code>X</code>: " +
          "<code>LIVE_in = {X} ∪ ({Y,W} − {}) = {X, Y, W}</code>.</p>",
        visual: cfgVisual({
          hi: ["test"], activeEdges: [["test", "then"], ["test", "els"]],
          out: { test: "{ Y, W }" }, live: { test: "{ X, Y, W }", then: "{ Y }", els: "{ W }" },
        }),
      },
      C.codeStep({
        title: "O resultado",
        body: "Quais variáveis estão vivas <b>antes do teste</b>? Exatamente <code>LIVE_in[test]</code>:",
        code: "if X > 0\n  then Y := Y + 1\n  else Z := W + 4",
        active: [1],
        lang: "text",
      }),
      C.tableStep({
        title: "Vivas antes do teste",
        body: "Uma variável é viva se <em>algum</em> caminho à frente a usa antes de redefini-la:",
        headers: ["variável", "viva?", "por quê"],
        rows: [
          ["X", "sim", "usada na condição do teste"],
          ["Y", "sim", "usada no ramo then (Y + 1)"],
          ["W", "sim", "usada no ramo else (W + 4)"],
          ["Z", "não", "só é escrita (else), nunca lida depois"],
        ],
      }),
      C.domStep(
        "Resumo",
        "Vivacidade diz, em cada ponto, quais valores ainda importam.",
        "<div class='ex-callout tip'><div class='ex-callout-title'>Em uma frase</div>" +
          "Calcule <b>para trás</b>: <code>out</code> = união dos <code>in</code> dos sucessores; " +
          "<code>in = USE ∪ (out − DEF)</code>. Uma variável é viva se há um uso futuro <b>antes</b> de " +
          "uma redefinição. Duas variáveis vivas ao mesmo tempo não podem dividir registrador (próximo guia).</div>"
      ),
    ];
  }

  EX.registry.add({
    id: "c17-vivacidade",
    num: "Live",
    subject: "Compiladores",
    section: "Otimização",
    title: "Análise de vivacidade",
    type: "computacional",
    hubDesc: "Fluxo backward animado no CFG: out = ∪ in[suc]; in = USE ∪ (out − DEF) até o ponto fixo.",
    statement:
      "Entenda a análise de vivacidade: o que torna uma variável viva, as equações de fluxo para trás " +
      "(USE/DEF) propagadas no CFG até o ponto fixo, e seu papel na alocação de registradores.",
    parts: [{ label: "Guia", build: build }],
  });
})();
