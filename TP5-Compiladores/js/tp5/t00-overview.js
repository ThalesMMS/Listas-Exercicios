/* t00-overview.js — TP5: visão geral do gerador de código COOL/MIPS. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  function pipeline(active) {
    return {
      type: "svg",
      view: [840, 310],
      draw: function (svg) {
        svg.text(420, 34, "Da AST tipada ao programa executável no SPIM", { size: 18, weight: 800, color: "var(--ink)" });
        T.pipeline(svg, [
          { title: "PA4", lines: ["AST tipada", "sem erros"] },
          { title: "cgen", lines: ["cgen.cc", "cgen.h / emit.h"] },
          { title: ".s MIPS", lines: [".data", ".text"] },
          { title: "SPIM", lines: ["trap.handler", "runtime COOL"] },
          { title: "programa", lines: ["saída", "ou abort"] },
        ], active);
        svg.text(420, 248, "Invariante principal: cada Expression::code deixa o resultado em $a0", {
          size: 14,
          weight: 800,
          color: "var(--yellow)",
          mono: true,
        });
      },
    };
  }

  EX.registry.add({
    id: "00-overview",
    num: "00",
    subject: "TP5 Compiladores",
    section: "Visão geral",
    title: "Visão geral do gerador de código",
    type: "conceitual",
    tags: ["PA5", "COOL", "MIPS"],
    hubDesc: "Mapa mental do TP5: AST tipada, tabelas globais, protótipos, inicializadores e métodos em MIPS.",
    statement: "Entender o escopo do TP5 e a sequência de emissão do gerador de código para COOL.",
    parts: [
      {
        label: "Roteiro",
        build: function () {
          return [
            {
              title: "O que o TP5 implementa",
              body:
                `<p>O TP5 fecha o compilador: ele recebe a <b>AST já tipada</b> e emite assembly MIPS que deve executar no SPIM junto ao runtime da disciplina.</p>` +
                T.chips([
                  { text: "entrada: AST tipada", cls: "ok" },
                  { text: "saída: .s MIPS", cls: "ok" },
                  { text: "sem recuperação de erro semântico", cls: "warn" },
                ]) +
                `<p>A porta de entrada do projeto em C++ é <code>program_class::cgen(ostream&)</code>, que cria a <code>CgenClassTable</code> e chama <code>code()</code>.</p>`,
              visual: pipeline(0),
            },
            {
              title: "A chamada que dispara tudo",
              body:
                `<p>O caminho de execução do gerador é curto, mas concentra todas as decisões de projeto:</p>` +
                T.formula(`program_class::cgen(ostream& s)
  → new CgenClassTable(classes, s)
      → CgenClassTable::code()` ) +
                `<p>Daí em diante, o gerador alterna entre <b>pré-análise</b> e <b>emissão</b>: primeiro decide tags/layouts; depois escreve tabelas e código executável.</p>`,
              visual: {
                type: "svg",
                view: [760, 260],
                draw: function (svg) {
                  T.box(svg, 40, 78, 190, 78, "program", ["cgen(ostream&)", "raiz da AST"], { fill: "var(--accent-soft)", stroke: "var(--accent)" });
                  svg.arrow(240, 117, 310, 117, { color: "var(--ink-mute)" });
                  T.box(svg, 320, 78, 190, 78, "CgenClassTable", ["classes + stream", "estado global"], { fill: "var(--green-soft)", stroke: "var(--green)" });
                  svg.arrow(520, 117, 590, 117, { color: "var(--ink-mute)" });
                  T.box(svg, 600, 78, 120, 78, "code()", ["emissão", "completa"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.text(380, 205, "A AST já passou pelo léxico, sintático e semântico.", { size: 14, color: "var(--ink-dim)", weight: 700 });
                },
              },
            },
            {
              title: "Pipeline interno de CgenClassTable::code()",
              body:
                `<p>O método <code>code()</code> é organizado em três blocos didáticos:</p>` +
                T.panels([
                  { title: "1. Pré-análise", html: `<p><code>assign_class_tags()</code> e <code>compute_layouts()</code>.</p>` },
                  { title: "2. Segmento .data", html: `<p>Constantes, <code>nameTab</code>, <code>objTab</code>, dispatch tables e protótipos.</p>` },
                  { title: "3. Segmento .text", html: `<p>Inicializadores <code>Class_init</code> e corpos dos métodos do usuário.</p>` },
                ], 3) +
                `<p>O ponto central é que os passos do meio dependem dos resultados do início: tags, offsets de atributos e slots de métodos.</p>`,
              visual: {
                type: "svg",
                view: [860, 360],
                draw: function (svg) {
                  svg.text(430, 32, "CgenClassTable::code()", { size: 18, weight: 800, color: "var(--ink)" });
                  var rows = [
                    ["1", "assign_class_tags()", "tags DFS em preorder"],
                    ["2", "compute_layouts()", "offsets de attrs + slots de métodos"],
                    ["3", "code_global_data()", ".data header + tags básicos"],
                    ["4", "code_constants()", "String / Int / Bool constantes"],
                    ["5", "nameTab / objTab / dispTab", "tabelas globais"],
                    ["6", "code_prototype_objects()", "templates Class_protObj"],
                    ["7", "code_global_text()", ".text header"],
                    ["8", "code_initializers()", "Class_init"],
                    ["9", "code_class_methods()", "corpos dos métodos"],
                  ];
                  rows.forEach(function (r, i) {
                    var y = 62 + i * 30;
                    var data = i >= 2 && i <= 5;
                    var text = i >= 6;
                    var stroke = data ? "var(--purple)" : text ? "var(--green)" : "var(--accent)";
                    var fill = data ? "var(--purple-soft)" : text ? "var(--green-soft)" : "var(--accent-soft)";
                    svg.rect(70, y, 52, 24, { fill: fill, stroke: stroke, strokeWidth: 1.3, rx: 8 });
                    svg.text(96, y + 13, r[0], { mono: true, size: 12, weight: 800, color: "var(--ink)" });
                    svg.text(280, y + 13, r[1], { anchor: "start", mono: true, size: 12.5, color: "var(--ink)" });
                    svg.text(560, y + 13, r[2], { anchor: "start", size: 12, color: "var(--ink-dim)" });
                  });
                  T.pill(svg, 650, 108, "pré-análise", { stroke: "var(--accent)", fill: "var(--accent-soft)" });
                  T.pill(svg, 650, 198, ".data", { stroke: "var(--purple)", fill: "var(--purple-soft)", w: 92 });
                  T.pill(svg, 650, 294, ".text", { stroke: "var(--green)", fill: "var(--green-soft)", w: 92 });
                },
              },
            },
            {
              title: "Dois segmentos, duas responsabilidades",
              body:
                `<p>O assembly gerado é dividido em <b>dados estáticos</b> e <b>código executável</b>. Essa separação simplifica tanto a emissão quanto o entendimento do runtime.</p>` +
                T.table(
                  ["Segmento", "Contém", "Usado para"],
                  [
                    ["<code>.data</code>", "constantes, tabelas, protótipos", "criar objetos, despachar métodos, nomear classes"],
                    ["<code>.text</code>", "<code>Class_init</code> e métodos", "executar inicialização e expressões COOL"],
                  ],
                  -1
                ) +
                `<p>Métodos das classes básicas vivem no <code>trap.handler</code>. O gerador precisa emitir suas tabelas e protótipos, mas não seus corpos.</p>`,
              visual: {
                type: "svg",
                view: [760, 280],
                draw: function (svg) {
                  T.box(svg, 55, 68, 285, 150, ".data", ["class_nameTab", "class_objTab", "Class_dispTab", "Class_protObj", "str/int/bool const"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  T.box(svg, 420, 68, 285, 150, ".text", ["Object_init ... Main_init", "Main.main", "Class.method"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(340, 143, 420, 143, { color: "var(--ink-mute)" });
                  svg.text(380, 120, "labels", { size: 12, color: "var(--ink-dim)", weight: 800 });
                  svg.text(380, 166, "referências", { size: 12, color: "var(--ink-dim)", weight: 800 });
                },
              },
            },
            {
              title: "A regra que governa as expressões",
              body:
                `<p>Todo método <code>Expression::code</code> obedece a uma convenção de máquina de pilha:</p>` +
                T.formula(`1. avalia subexpressão
2. deixa o resultado em $a0
3. se precisar guardar, empilha $a0
4. temporários $t1/$t2/$t3 não sobrevivem a uma chamada code() aninhada`) +
                `<p>Essa regra evita um alocador de registradores completo e torna cada nó da AST localmente verificável.</p>`,
              visual: {
                type: "svg",
                view: [720, 300],
                draw: function (svg) {
                  T.machine(svg, { a0: "resultado", stack: ["subexpr. anterior"], hot: "a0", caption: "Invariante: ao sair de code(), $a0 contém o valor da expressão." });
                },
              },
            },
            {
              title: "Como executar e depurar",
              body:
                `<p>O fluxo de execução usado nos testes do projeto é direto:</p>` +
                T.code(`gmake cgen
./mycoolc example.cl       # produz example.s
spim -file example.s       # executa no SPIM
./mycoolc -c example.cl 2>log   # -c habilita cgen_debug`, "comandos") +
                T.note("tip", "Dica de depuração", `<p>O <code>-c</code> só habilita a variável de debug. A utilidade depende dos logs que o gerador emitir quando <code>cgen_debug</code> estiver ativo.</p>`) +
                `<p>Na avaliação, o código deve funcionar com os componentes oficiais de léxico, parsing e semântica.</p>`,
              visual: pipeline(3),
            },
          ];
        },
      },
    ],
  });
})();
