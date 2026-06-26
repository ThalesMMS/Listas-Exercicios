/* t03-tables-tags.js — Tags de classe, layouts e tabelas globais. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  EX.registry.add({
    id: "03-tables-tags",
    num: "03",
    subject: "TP5 Compiladores",
    section: "Tabelas e tags",
    title: "Class tags, layouts e tabelas globais",
    type: "computacional",
    tags: ["DFS", "dispatch table", "case"],
    hubDesc: "Como a árvore de herança vira tags, slots de atributos, slots de métodos e tabelas usadas por dispatch/new/case.",
    statement: "Mostrar as estruturas globais que conectam a semântica de COOL ao runtime.",
    parts: [
      {
        label: "Tags e layouts",
        build: function () {
          return [
            {
              title: "Tags por DFS preorder",
              body:
                `<p>O gerador atribui tags com uma busca em profundidade a partir de <code>Object</code>. O efeito desejado é que uma classe venha antes de seus descendentes e que descendentes formem um intervalo contíguo.</p>` +
                T.formula(`Object = 0
  IO = 1
  Main = 2
  A = 3
    B = 4
    C = 5`) +
                `<p>Essa propriedade simplifica testes de subtipo em <code>case</code> e permite indexar tabelas por tag.</p>`,
              visual: {
                type: "svg",
                view: [800, 330],
                draw: function (svg) {
                  var nodes = {
                    Object: { x: 400, y: 60, label: "Object", lines: ["tag 0"], hot: true },
                    IO: { x: 190, y: 155, label: "IO", lines: ["tag 1"] },
                    Main: { x: 400, y: 155, label: "Main", lines: ["tag 2"] },
                    A: { x: 610, y: 155, label: "A", lines: ["tag 3"], hot: true },
                    B: { x: 540, y: 255, label: "B", lines: ["tag 4"] },
                    C: { x: 690, y: 255, label: "C", lines: ["tag 5"] },
                  };
                  T.classTree(svg, nodes, [["Object", "IO"], ["Object", "Main"], ["Object", "A"], ["A", "B"], ["A", "C"]]);
                  svg.text(620, 310, "descendentes de A: tags 3..5", { size: 13, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Layout herdado + extensão local",
              body:
                `<p><code>compute_layout_for</code> calcula layouts top-down. Cada classe copia o layout do pai e depois processa seus próprios atributos e métodos.</p>` +
                T.table(
                  ["Feature", "Regra"],
                  [
                    ["atributo novo", "append em <code>attr_order</code>; offset = <code>3 + índice</code>"],
                    ["método novo", "append na dispatch table"],
                    ["override", "substitui o slot herdado, preservando o índice"],
                  ],
                  -1
                ) +
                `<p>A estabilidade do slot é o motivo de overrides funcionarem com dispatch dinâmico.</p>`,
              visual: {
                type: "svg",
                view: [830, 330],
                draw: function (svg) {
                  T.box(svg, 70, 72, 260, 92, "Animal_dispTab", ["0 Object.abort", "1 Animal.speak", "2 Animal.age"], { fill: "var(--bg-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(350, 118, 465, 118, { color: "var(--ink-mute)" });
                  T.box(svg, 490, 72, 270, 92, "Dog_dispTab", ["0 Object.abort", "1 Dog.speak", "2 Animal.age", "3 Dog.fetch"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(625, 220, "Dog.speak ocupa o mesmo slot 1: só muda o alvo.", { size: 14, weight: 800, color: "var(--yellow)" });
                  svg.line(615, 125, 615, 125, { stroke: "var(--yellow)", strokeWidth: 4 });
                },
              },
            },
            {
              title: "ClassLayout: a estrutura que guia a emissão",
              body:
                `<p>O layout não é apenas conceitual; ele é guardado em mapas e vetores que respondem às perguntas do gerador.</p>` +
                T.code(`struct ClassLayout {
  vector<attr_class*> attr_order;
  map<Symbol,int>    attr_offset;
  map<Symbol,Symbol> attr_type;

  vector<method_class*> method_order;
  map<Symbol,int>       method_offset;
  vector<Symbol>        method_defining_class;
};`, "forma resumida") +
                `<p>Com isso, <code>object</code>, <code>assign</code>, <code>dispatch</code>, <code>new SELF_TYPE</code> e <code>case</code> consultam uma fonte única.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.box(svg, 65, 64, 210, 146, "attr side", ["attr_order", "attr_offset", "attr_type"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  T.box(svg, 485, 64, 210, 146, "method side", ["method_order", "method_offset", "defining_class"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  T.box(svg, 300, 92, 160, 90, "ClassLayout", ["por classe"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.arrow(275, 136, 300, 136, { color: "var(--ink-mute)" });
                  svg.arrow(460, 136, 485, 136, { color: "var(--ink-mute)" });
                  svg.text(380, 252, "A emissão de código não recalcula offsets: consulta o layout.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "class_nameTab: tag → nome",
              body:
                `<p><code>class_nameTab</code> é um vetor indexado por tag. Cada posição aponta para a string constante com o nome da classe.</p>` +
                T.formula(`class_nameTab:
  .word str_const_Object   # tag 0
  .word str_const_IO       # tag 1
  .word str_const_Main     # tag 2`) +
                `<p>É usado por <code>Object.type_name</code> e por mensagens de erro de runtime.</p>`,
              visual: {
                type: "svg",
                view: [760, 280],
                draw: function (svg) {
                  T.memoryObject(svg, 150, 52, [
                    { off: "0", value: "str_const(\"Object\")" },
                    { off: "1", value: "str_const(\"IO\")" },
                    { off: "2", value: "str_const(\"Main\")" },
                    { off: "3", value: "str_const(\"A\")", hot: true },
                    { off: "4", value: "str_const(\"B\")" },
                  ], { offW: 64, valW: 310 });
                  svg.text(585, 186, "tag 3 → \"A\"", { anchor: "start", mono: true, size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "class_objTab: tag → protObj/init",
              body:
                `<p><code>class_objTab</code> tem duas palavras por classe: primeiro o protótipo, depois o inicializador.</p>` +
                T.formula(`class_objTab[2*tag + 0] = Class_protObj
class_objTab[2*tag + 1] = Class_init`) +
                `<p>Essa tabela é essencial para <code>new SELF_TYPE</code>, porque o tipo concreto só é conhecido em runtime.</p>`,
              visual: {
                type: "svg",
                view: [820, 310],
                draw: function (svg) {
                  T.memoryObject(svg, 120, 55, [
                    { off: "0", value: "Object_protObj" },
                    { off: "1", value: "Object_init" },
                    { off: "2", value: "IO_protObj" },
                    { off: "3", value: "IO_init" },
                    { off: "2t", value: "DynamicClass_protObj", hot: true },
                    { off: "2t+1", value: "DynamicClass_init", hot: true },
                  ], { offW: 74, valW: 315 });
                  svg.text(575, 210, "new SELF_TYPE usa a tag dinâmica de self", { anchor: "start", size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Dispatch table: slot → método real",
              body:
                `<p>Cada classe tem sua própria dispatch table. O slot é escolhido pelo tipo estático, mas o ponteiro de tabela vem do objeto em runtime.</p>` +
                T.code(`lw   $t1 8($a0)          # dispTab do objeto
lw   $t1 slot*4($t1)     # método no slot estável
jalr $t1                 # chamada indireta`, "dispatch dinâmico") +
                `<p>Override é correto porque a subclasse preserva o mesmo índice do método herdado.</p>`,
              visual: {
                type: "svg",
                view: [800, 300],
                draw: function (svg) {
                  T.box(svg, 55, 80, 150, 90, "objeto", ["header", "dispTab ptr"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(215, 125, 330, 125, { color: "var(--ink-mute)" });
                  T.box(svg, 340, 65, 210, 120, "Dog_dispTab", ["0 Object.abort", "1 Dog.speak", "2 Animal.age"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(560, 112, 680, 112, { color: "var(--ink-mute)" });
                  T.box(svg, 690, 78, 82, 68, "jalr", ["slot 1"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.text(405, 235, "Tipo estático dá o slot; tipo dinâmico dá a tabela.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "case: tags de descendentes",
              body:
                `<p>Para <code>case</code>, cada branch declara um tipo. O teste precisa saber se a tag dinâmica do objeto pertence ao conjunto de tags da classe declarada e de seus descendentes.</p>` +
                T.formula(`tag_descendants_inclusive(A) = [tag(A), tag(B), tag(C), ...]`) +
                `<p>O trabalho implementado usa lista explícita de tags aceitáveis. A propriedade de intervalo contíguo permitiria uma otimização por faixa.</p>`,
              visual: {
                type: "svg",
                view: [790, 320],
                draw: function (svg) {
                  var nodes = {
                    A: { x: 395, y: 65, label: "A", lines: ["tag 3"], hot: true },
                    B: { x: 260, y: 170, label: "B", lines: ["tag 4"], hot: true },
                    D: { x: 170, y: 270, label: "D", lines: ["tag 5"] },
                    E: { x: 350, y: 270, label: "E", lines: ["tag 6"] },
                    C: { x: 530, y: 170, label: "C", lines: ["tag 7"], hot: true },
                  };
                  T.classTree(svg, nodes, [["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"]]);
                  T.pill(svg, 585, 245, "branch A aceita tags 3..7", { w: 190, fill: "var(--yellow-soft)", stroke: "var(--yellow)" });
                },
              },
            },
          ];
        },
      },
    ],
  });
})();
