/* t05-expression-codegen.js — Geração de código para expressões. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  EX.registry.add({
    id: "05-expression-codegen",
    num: "05",
    subject: "TP5 Compiladores",
    section: "Expressões",
    title: "Expression::code(): folhas, aritmética, controle, let, case e dispatch",
    type: "computacional",
    tags: ["AST", "$a0", "code()"],
    hubDesc: "Como cada nó da AST deixa resultado em $a0 e usa pilha/temporários para compor expressões.",
    statement: "Mapear os principais nós de expressão COOL para padrões de MIPS.",
    parts: [
      {
        label: "Expressões",
        build: function () {
          return [
            T.domStep(
              "Folhas: carregar o valor em $a0",
              `<p>As folhas da AST não combinam subexpressões; elas apenas carregam o objeto/valor correto em <code>$a0</code>.</p>` +
                T.note("tip", "Invariante", `<p>Ao final de cada linha da tabela, <code>$a0</code> contém o resultado daquela expressão.</p>`),
              T.table(
                ["Nó", "Padrão de emissão"],
                [
                  ["<code>int_const</code>", "<code>la $a0 int_const&lt;k&gt;</code>"],
                  ["<code>string_const</code>", "<code>la $a0 str_const&lt;k&gt;</code>"],
                  ["<code>bool_const</code>", "<code>la $a0 bool_const0/1</code>"],
                  ["<code>no_expr</code>", "<code>move $a0 $zero</code>"],
                  ["<code>object self</code>", "<code>move $a0 $s0</code>"],
                  ["<code>object x</code>", "load via <code>VarLoc</code>"],
                ],
                -1
              )
            ),
            {
              title: "assign: armazenar e manter resultado",
              body:
                `<p>Uma atribuição avalia o lado direito, armazena no local da variável e deixa o valor atribuído em <code>$a0</code>. Isso respeita a semântica de COOL: assignment também é expressão.</p>` +
                T.formula(`RHS->code();        # $a0 = novo valor
lookup VarLoc(name)
ATTR  → sw $a0 off($s0) + GC barrier se -g
PARAM → sw $a0 off($fp)
LOCAL → sw $a0 off($fp)
# resultado da expressão = $a0`) +
                `<p>Somente escrita em atributo precisa de barreira quando GC geracional está ativo.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.machine(svg, { a0: "RHS", stack: [], hot: "a0", caption: "Depois do store, $a0 não é apagado." });
                  T.box(svg, 250, 178, 190, 70, "VarLoc", ["ATTR / PARAM / LOCAL"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                },
              },
            },
            {
              title: "Aritmética: copiar, desboxear, calcular, reboxear",
              body:
                `<p>Operadores <code>+ - * /</code> usam o mesmo molde. O primeiro operando é salvo na pilha; o segundo é avaliado e copiado para produzir um novo objeto <code>Int</code> mutável.</p>` +
                T.code(`e1->code(); push $a0
 e2->code()
 jal Object.copy          # $a0 = cópia fresca de e2
 pop $t1                 # $t1 = e1 boxeado
 lw  $t1 12($t1)         # unbox e1
 lw  $t2 12($a0)         # unbox e2-copy
 <op> $t1 $t1 $t2
 sw  $t1 12($a0)         # rebox no objeto fresco`, "emit_arith") +
                `<p>A cópia evita corromper literais compartilhados como <code>int_const5</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 320],
                draw: function (svg) {
                  T.machine(svg, { a0: "copy(e2)", stack: ["e1 boxeado"], hot: "a0", caption: "Unbox nos registradores $t1/$t2; resultado reboxeado em $a0." });
                },
              },
            },
            {
              title: "Comparações e igualdade",
              body:
                `<p><code>&lt;</code> e <code>&lt;=</code> desboxeiam operandos inteiros e retornam constantes booleanas. <code>=</code> tem um caminho rápido por igualdade de ponteiro e delega comparação de valores ao runtime.</p>` +
                T.panels([
                  { title: "< e <=", html: `<p>Eval/push/eval/pop, unbox, carrega <code>truebool</code>; se o branch falhar, carrega <code>falsebool</code>.</p>` },
                  { title: "=", html: `<p>Se ponteiros são iguais, true. Caso contrário, chama <code>equality_test</code> para Int/Bool/String.</p>` },
                ], 2),
              visual: {
                type: "svg",
                view: [800, 300],
                draw: function (svg) {
                  T.box(svg, 70, 82, 170, 90, "lhs/rhs", ["eval", "unbox se preciso"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(255, 128, 355, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 365, 82, 170, 90, "teste", ["blt/ble", "ou pointer eq"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.arrow(550, 128, 650, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 660, 82, 90, 90, "$a0", ["Bool"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(400, 230, "Resultado é sempre bool_const0 ou bool_const1.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "if: branch por Bool desboxeado",
              body:
                `<p>O predicado de <code>if</code> deve ser um <code>Bool</code>. O gerador lê o valor no offset 12 e desvia para o ramo <code>else</code> se for zero.</p>` +
                T.code(`pred->code()
lw   $t1 12($a0)
beqz $t1 else_lbl
then_exp->code()
b    end_lbl
else_lbl:
else_exp->code()
end_lbl:`, "cond_class::code") +
                `<p>Como ambos os ramos também obedecem ao invariante, o resultado final fica em <code>$a0</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.box(svg, 60, 100, 135, 70, "pred", ["Bool"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(205, 135, 305, 92, { color: "var(--green)", head: 9 });
                  svg.arrow(205, 135, 305, 182, { color: "var(--red)", head: 9 });
                  T.box(svg, 315, 55, 145, 70, "then", ["$a0 = A"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  T.box(svg, 315, 150, 145, 70, "else", ["$a0 = B"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                  svg.arrow(470, 90, 590, 135, { color: "var(--ink-mute)", head: 9 });
                  svg.arrow(470, 185, 590, 135, { color: "var(--ink-mute)", head: 9 });
                  T.box(svg, 600, 100, 105, 70, "end", ["$a0"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                },
              },
            },
            {
              title: "while: loop retorna void",
              body:
                `<p><code>while</code> repete o corpo enquanto o predicado bool for verdadeiro. Quando sai, por definição, retorna <code>void</code>.</p>` +
                T.code(`top:
  pred->code()
  lw $t1 12($a0)
  beqz $t1 out
  body->code()
  b top
out:
  move $a0 $zero`, "loop_class::code") +
                `<p>Mesmo que o corpo produza valores intermediários, eles são descartados a cada iteração.</p>`,
              visual: {
                type: "svg",
                view: [760, 300],
                draw: function (svg) {
                  T.box(svg, 285, 45, 160, 70, "pred", ["Bool"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  T.box(svg, 285, 180, 160, 70, "body", ["descarta resultado"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(365, 115, 365, 180, { color: "var(--green)", head: 10 });
                  // back-edge (b top): body -> pred pela lateral esquerda, fora das caixas
                  svg.curve(285, 215, 285, 80, 78, { stroke: "var(--ink-mute)", strokeWidth: 2 });
                  svg.arrow(270, 93, 285, 80, { color: "var(--ink-mute)", head: 9 });
                  svg.arrow(445, 80, 590, 80, { color: "var(--red)", head: 10 });
                  T.box(svg, 600, 45, 105, 70, "out", ["$a0 = 0"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                },
              },
            },
            {
              title: "block: o último valor vence",
              body:
                `<p>Um bloco <code>{ e1; e2; ...; en; }</code> emite cada subexpressão em ordem. Como todas deixam resultado em <code>$a0</code>, o valor do bloco é simplesmente o valor da última.</p>` +
                T.formula(`e1->code();   # $a0 descartado por e2
 e2->code();
 ...
 en->code();   # resultado do bloco`) +
                `<p>Não há estrutura especial além da ordem.</p>`,
              visual: {
                type: "svg",
                view: [840, 260],
                draw: function (svg) {
                  T.pipeline(svg, [
                    { title: "e1", lines: ["$a0=v1"] },
                    { title: "e2", lines: ["$a0=v2"] },
                    { title: "...", lines: ["..."] },
                    { title: "en", lines: ["$a0=vn"] },
                    { title: "block", lines: ["resultado vn"] },
                  ], 3);
                },
              },
            },
            {
              title: "let: default, slot local e escopo",
              body:
                `<p><code>let</code> aloca um slot local no frame. Se não houver inicializador, carrega o default pelo tipo declarado.</p>` +
                T.table(
                  ["Tipo do let", "Default se init ausente"],
                  [
                    ["<code>Int</code>", "<code>int_const0</code>"],
                    ["<code>Bool</code>", "<code>falsebool</code>"],
                    ["<code>String</code>", "<code>str_const0</code>"],
                    ["outros", "<code>void</code>"],
                  ],
                  -1
                ) +
                T.formula(`g_locals_in_method++
off = -g_locals_in_method
sw $a0 off($fp)
enterscope(id -> LOCAL off)
body->code()
exitscope()
g_locals_in_method--`),
              visual: {
                type: "svg",
                view: [760, 330],
                draw: function (svg) {
                  T.stackFrame(svg, 235, 60, [
                    { off: "+3..", label: "args" },
                    { off: "save", label: "saved regs", warn: true },
                    { off: "$fp", label: "frame base", fp: true, color: "var(--orange)" },
                    { off: "-1", label: "let x", hot: true },
                    { off: "-2", label: "let y / case branch", hot: true },
                  ], { title: "locals descem a partir do frame" });
                },
              },
            },
            {
              title: "case: void, tag dinâmica e branch mais específico",
              body:
                `<p><code>case</code> começa verificando se o scrutinee é void. Depois guarda o objeto, lê sua tag dinâmica e testa os branches ordenados do mais específico para o mais geral.</p>` +
                T.code(`expr->code()
bne $a0 $zero ok
  ... _case_abort2(filename,line)
ok:
  store scrutinee local
  lw $t2 0($a0)       # tag dinâmica
  branches sorted by descending tag
  for each branch:
      test acceptable descendant tags
      on match: bind var, code body, b end
  no match: jal _case_abort`, "typcase_class::code") +
                `<p>A ordenação por tag descendente funciona porque subclasses recebem tags maiores que seus ancestrais.</p>`,
              visual: {
                type: "svg",
                view: [800, 320],
                draw: function (svg) {
                  T.box(svg, 42, 100, 130, 70, "expr", ["$a0"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(182, 135, 270, 135, { color: "var(--ink-mute)" });
                  T.box(svg, 280, 100, 130, 70, "void?", ["abort2 se 0"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                  svg.arrow(420, 135, 510, 135, { color: "var(--ink-mute)" });
                  T.box(svg, 520, 80, 180, 110, "tags", ["branch B", "branch A", "branch Object"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(610, 235, "Mais específico primeiro; no match → _case_abort.", { size: 14, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Dispatch e new usam os módulos anteriores",
              body:
                `<p>Os nós de dispatch e <code>new</code> não são apenas expressões locais: eles dependem de frame, tabelas e layout de classe.</p>` +
                T.panels([
                  { title: "dispatch", html: `<p>usa slots de método, dispatch tables, void check e argumentos no frame.</p>` },
                  { title: "new T", html: `<p>usa <code>T_protObj</code>, <code>Object.copy</code> e <code>T_init</code>.</p>` },
                  { title: "new SELF_TYPE", html: `<p>usa <code>class_objTab</code> indexada pela tag dinâmica de <code>self</code>.</p>` },
                ], 3) +
                `<p>Por isso a geração de expressões só é simples depois que tags e layouts foram calculados.</p>`,
              visual: {
                type: "svg",
                view: [790, 280],
                draw: function (svg) {
                  T.box(svg, 60, 90, 150, 78, "expression", ["dispatch/new"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(220, 129, 315, 85, { color: "var(--ink-mute)" });
                  svg.arrow(220, 129, 315, 170, { color: "var(--ink-mute)" });
                  T.box(svg, 330, 48, 170, 72, "ClassLayout", ["offsets/slots"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  T.box(svg, 330, 150, 170, 72, "Data tables", ["objTab/dispTab"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(510, 85, 610, 129, { color: "var(--ink-mute)" });
                  svg.arrow(510, 185, 610, 129, { color: "var(--ink-mute)" });
                  T.box(svg, 620, 90, 120, 78, "$a0", ["resultado"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                },
              },
            },
          ];
        },
      },
    ],
  });
})();
