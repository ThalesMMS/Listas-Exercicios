/* t01-mips-registers.js — Registradores MIPS e helpers emit_*. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  var regRows = [
    ["<code>ZERO</code>", "<code>$zero</code>", "constante 0"],
    ["<code>ACC</code>", "<code>$a0</code>", "acumulador: resultado de toda expressão"],
    ["<code>A1</code>", "<code>$a1</code>", "2º argumento para rotinas de runtime"],
    ["<code>SELF</code>", "<code>$s0</code>", "ponteiro para <code>self</code>, preservado pelo callee"],
    ["<code>T1/T2/T3</code>", "<code>$t1..$t3</code>", "temporários de curta duração"],
    ["<code>SP</code>", "<code>$sp</code>", "pilha; cresce para endereços menores"],
    ["<code>FP</code>", "<code>$fp</code>", "base fixa de argumentos e locals"],
    ["<code>RA</code>", "<code>$ra</code>", "endereço de retorno"],
  ];

  EX.registry.add({
    id: "01-mips-registers",
    num: "01",
    subject: "TP5 Compiladores",
    section: "MIPS e infraestrutura",
    title: "Registradores, macros e helpers emit_*",
    type: "referência",
    tags: ["MIPS", "emit.h", "stack"],
    hubDesc: "Tabela de registradores, layout base de objeto, convenções de labels e idiomas emit_push/emit_pop.",
    statement: "Fixar a API de emissão MIPS usada pelo gerador.",
    parts: [
      {
        label: "Referência guiada",
        build: function () {
          return [
            T.domStep(
              "Mapa dos registradores",
              `<p>O código gerado fica simples quando cada registrador tem um papel estável. A tabela abaixo resume a convenção usada no TP5.</p>` +
                T.note("tip", "Regra prática", `<p><code>$a0</code> é o único registrador que deve carregar o resultado de uma expressão ao retornar de <code>code()</code>. Temporários podem ser sobrescritos por chamadas aninhadas.</p>`),
              T.table(["Macro", "MIPS", "Função"], regRows, 1)
            ),
            {
              title: "O cabeçalho comum de todo objeto",
              body:
                `<p>As macros de <code>emit.h</code> fixam o layout mínimo comum a todos os objetos COOL.</p>` +
                T.formula(`DEFAULT_OBJFIELDS = 3
TAG_OFFSET       = 0
SIZE_OFFSET      = 1
DISPTABLE_OFFSET = 2
WORD_SIZE = 4`) +
                `<p>Isso significa que atributos começam no offset de palavra <code>3</code>. Um atributo <code>k</code> fica em <code>3 + k</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.memoryObject(svg, 210, 45, [
                    { off: "-1", value: "eye catcher: -1", color: "var(--ink-mute)" },
                    { off: "+0", value: "class tag", hot: true },
                    { off: "+1", value: "object size (words)" },
                    { off: "+2", value: "dispatch table pointer", hot: true },
                    { off: "+3", value: "attribute 0" },
                    { off: "+4", value: "attribute 1" },
                  ]);
                  svg.text(380, 270, "Objeto = cabeçalho de 3 palavras + slots de atributos", { size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            T.domStep(
              "Labels emitidos no assembly",
              `<p>O gerador não deve inventar nomes aleatórios para estruturas conhecidas; os sufixos padronizados são a interface com o runtime e com o restante do código gerado.</p>`,
              T.table(
                ["Macro/sufixo", "Exemplo", "Significado"],
                [
                  ["<code>_dispTab</code>", "<code>Dog_dispTab</code>", "tabela de despacho da classe"],
                  ["<code>_init</code>", "<code>Dog_init</code>", "inicializador da classe"],
                  ["<code>_protObj</code>", "<code>Dog_protObj</code>", "objeto protótipo"],
                  ["<code>.</code>", "<code>Dog.describe</code>", "entrada de método"],
                  ["<code>int_constN</code>", "<code>int_const3</code>", "constante Int boxeada"],
                  ["<code>str_constN</code>", "<code>str_const5</code>", "constante String boxeada"],
                  ["<code>bool_const0/1</code>", "<code>bool_const1</code>", "Bool false/true"],
                ],
                -1
              )
            ),
            {
              title: "A API mental dos emit_* helpers",
              body:
                `<p>Os helpers <code>emit_*</code> são uma camada fina que imprime instruções MIPS. A vantagem é manter o gerador legível: o código C++ fala em operações de compilador, não em strings soltas de assembly.</p>` +
                T.panels([
                  { title: "load/store/move", html: `<p><code>emit_load</code>, <code>emit_store</code>, <code>emit_load_address</code>, <code>emit_move</code>.</p>` },
                  { title: "aritmética", html: `<p><code>emit_add</code>, <code>emit_sub</code>, <code>emit_mul</code>, <code>emit_div</code>, <code>emit_neg</code>.</p>` },
                  { title: "controle", html: `<p><code>emit_beq</code>, <code>emit_bne</code>, <code>emit_blt</code>, <code>emit_branch</code>.</p>` },
                  { title: "chamada", html: `<p><code>emit_jal</code>, <code>emit_jalr</code>, <code>emit_return</code>.</p>` },
                ], 2),
              visual: {
                type: "svg",
                view: [780, 330],
                draw: function (svg) {
                  var blocks = [
                    { title: "endereços", lines: ["lw / sw / la", "move"], x: 70, y: 58, color: "accent" },
                    { title: "valores", lines: ["add / sub / mul", "fetch/store Int"], x: 300, y: 58, color: "green" },
                    { title: "controle", lines: ["beq / bne / blt", "labels"], x: 530, y: 58, color: "yellow" },
                    { title: "chamadas", lines: ["jal", "jalr", "jr $ra"], x: 300, y: 205, color: "purple" },
                  ];
                  blocks.forEach(function (b) {
                    var stroke = "var(--" + b.color + ")";
                    var fill = "var(--" + b.color + "-soft)";
                    T.box(svg, b.x, b.y, 180, 88, b.title, b.lines, { fill: fill, stroke: stroke, mono: true });
                  });
                  svg.arrow(250, 102, 300, 102, { color: "var(--ink-mute)" });
                  svg.arrow(480, 102, 530, 102, { color: "var(--ink-mute)" });
                  svg.arrow(390, 148, 390, 205, { color: "var(--ink-mute)" });
                  svg.text(390, 305, "O gerador compõe essas peças para cada nó da AST.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "O idiom push/pop",
              body:
                `<p>A pilha cresce para baixo. O helper de push armazena primeiro e depois move <code>$sp</code> para o próximo topo livre; o pop faz o inverso.</p>` +
                T.code(`emit_push(reg):  sw reg 0($sp);  addiu $sp $sp -4
emit_pop(reg):   addiu $sp $sp 4;  lw reg 0($sp)`, "idioma de pilha") +
                `<p>Esse detalhe evita erro de off-by-one quando expressões binárias precisam preservar o primeiro operando.</p>`,
              visual: {
                type: "svg",
                view: [720, 300],
                draw: function (svg) {
                  T.machine(svg, { a0: "e1", stack: ["arg antigo", "e1 salvo"], hot: "a0", caption: "Depois de push($a0), e1 está seguro enquanto e2 é avaliado." });
                },
              },
            },
            {
              title: "Int e Bool são objetos boxeados",
              body:
                `<p>Aritmética não opera diretamente sobre objetos <code>Int</code>; ela acessa o valor inteiro no slot após o cabeçalho.</p>` +
                T.formula(`emit_fetch_int(dst, src)  →  lw dst 12(src)
emit_store_int(src, dst)  →  sw src 12(dst)`) +
                `<p>O offset byte <code>12</code> é o offset de palavra <code>3</code> multiplicado por <code>4</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 310],
                draw: function (svg) {
                  T.memoryObject(svg, 220, 50, [
                    { off: "-1", value: "eye catcher" },
                    { off: "+0", value: "Int tag" },
                    { off: "+1", value: "size = 4" },
                    { off: "+2", value: "Int_dispTab" },
                    { off: "+3", value: "valor inteiro", hot: true },
                  ]);
                  svg.arrow(560, 205, 615, 205, { color: "var(--yellow)", head: 9 });
                  svg.text(625, 205, "12 bytes", { anchor: "start", mono: true, size: 13, weight: 800, color: "var(--yellow)" });
                },
              },
            },
          ];
        },
      },
    ],
  });
})();
