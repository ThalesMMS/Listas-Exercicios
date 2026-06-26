/* t04-calling-convention.js — Stack frame, dispatch, new e inicializadores. */
(function () {
  "use strict";
  var EX = window.EX;
  var T = EX.TP5;

  EX.registry.add({
    id: "04-calling-convention",
    num: "04",
    subject: "TP5 Compiladores",
    section: "Chamadas e frames",
    title: "Calling convention, stack frame, dispatch, new e init",
    type: "computacional",
    tags: ["stack frame", "dispatch", "SELF_TYPE"],
    hubDesc: "Frame de método, argumentos, locals, prologue/epilogue, dispatch dinâmico/estático e criação de objetos.",
    statement: "Memorizar a convenção de chamada que sustenta todos os métodos gerados.",
    parts: [
      {
        label: "Convenção de chamada",
        build: function () {
          return [
            {
              title: "O caller empilha argumentos; o callee remove",
              body:
                `<p>Em uma chamada de método, os argumentos são avaliados da esquerda para a direita e empilhados. O receiver fica em <code>$a0</code>. O método chamado salva registradores, executa e, no epílogo, remove também os argumentos.</p>` +
                T.formula(`caller:
  actual_0->code(); push $a0
  actual_1->code(); push $a0
  receiver->code(); $a0 = receiver
  jal / jalr method

callee:
  salva $fp, $s0, $ra
  move $s0 $a0
  ...
  restaura e remove args`) +
                `<p>Resultado de método também volta em <code>$a0</code>.</p>`,
              visual: {
                type: "svg",
                view: [820, 300],
                draw: function (svg) {
                  T.box(svg, 52, 82, 160, 92, "caller", ["eval args", "push actuals", "eval receiver"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(225, 128, 330, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 340, 82, 160, 92, "callee", ["prologue", "body", "epilogue"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.arrow(510, 128, 615, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 625, 82, 150, 92, "$a0", ["resultado"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.text(410, 235, "Callee-saved: SELF em $s0 sobrevive a chamadas internas.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "Frame: argumentos acima, locals abaixo",
              body:
                `<p>O ponto mais cobrado é a localização dos formais e locais. No projeto, para <code>N</code> formais, o formal <code>k</code> é endereçado por:</p>` +
                T.formula(`arg_k offset = (N - k - 1) + 3`) +
                `<p>Com dois formais <code>(a,b)</code>, isso dá <code>a → 4($fp)</code> e <code>b → 3($fp)</code>. Com o prólogo abaixo, os salvos ficam em <code>$ra=0($fp)</code>, <code>$s0=1($fp)</code> e <code>$fp antigo=2($fp)</code>; portanto locais de <code>let</code>/<code>case</code> começam em <code>-1, -2, ...</code> e são reservados antecipadamente por <code>count_max_locals</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 360],
                draw: function (svg) {
                  T.stackFrame(svg, 235, 50, [
                    { off: "+4", label: "arg_0 = a", hot: true },
                    { off: "+3", label: "arg_1 = b", hot: true },
                    { off: "save", label: "old $fp / old $s0 / old $ra", warn: true },
                    { off: "$fp", label: "base estável do frame", fp: true, color: "var(--orange)" },
                    { off: "-1,-2...", label: "slots de let / case locals", hot: true },
                  ], { title: "exemplo: método f(a,b)" });
                  svg.text(380, 318, "A fórmula dos formais é a parte que você deve aplicar em exercícios.", { size: 13, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Prologue e epilogue",
              body:
                `<p>O prólogo reserva a área de salvamento, guarda registradores e fixa <code>$s0</code> como receiver atual. O epílogo desfaz o frame e retorna.</p>` +
                T.code(`emit_method_prologue:
  addiu $sp $sp -12
  sw    $fp 12($sp)
  sw    $s0 8($sp)
  sw    $ra 4($sp)
  addiu $fp $sp 4
  move  $s0 $a0

emit_method_epilogue(nargs):
  lw    $fp 12($sp)
  lw    $s0 8($sp)
  lw    $ra 4($sp)
  addiu $sp $sp 12 + 4*nargs
  jr    $ra`, "esqueleto") +
                `<p>Como o callee remove os argumentos, o caller continua limpo depois do retorno.</p>`,
              visual: {
                type: "svg",
                view: [780, 290],
                draw: function (svg) {
                  T.box(svg, 70, 88, 180, 86, "entrada", ["$a0 = receiver", "$sp após args"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(262, 131, 340, 131, { color: "var(--ink-mute)" });
                  T.box(svg, 350, 88, 170, 86, "prologue", ["salva regs", "$s0 = self"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                  svg.arrow(532, 131, 610, 131, { color: "var(--ink-mute)" });
                  T.box(svg, 620, 88, 120, 86, "body", ["gera expr"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(390, 230, "O epílogo é simétrico: restaura e retorna com resultado em $a0.", { size: 14, weight: 800, color: "var(--ink-dim)" });
                },
              },
            },
            {
              title: "Ambiente de variáveis: ATTR, PARAM, LOCAL",
              body:
                `<p>Durante a emissão de um método, <code>g_env</code> mapeia nomes para uma localização concreta.</p>` +
                T.table(
                  ["VarLoc", "Endereço gerado", "Origem"],
                  [
                    ["<code>ATTR</code>", "<code>off($s0)</code>", "atributo do objeto atual"],
                    ["<code>PARAM</code>", "<code>off($fp)</code>", "formal do método"],
                    ["<code>LOCAL</code>", "<code>off($fp)</code>", "let/case local"],
                  ],
                  -1
                ) +
                `<p>O ambiente é reconstruído por método: atributos primeiro; depois formais; depois escopos temporários de <code>let</code> e <code>case</code>.</p>`,
              visual: {
                type: "svg",
                view: [760, 280],
                draw: function (svg) {
                  T.box(svg, 60, 82, 170, 90, "g_env", ["x ↦ ATTR 3", "a ↦ PARAM 4", "t ↦ LOCAL -1"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(245, 126, 345, 126, { color: "var(--ink-mute)" });
                  T.box(svg, 360, 62, 140, 70, "ATTR", ["$s0 + off"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  T.box(svg, 540, 62, 140, 70, "PARAM", ["$fp + off"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  T.box(svg, 450, 170, 140, 70, "LOCAL", ["$fp + off"], { fill: "var(--yellow-soft)", stroke: "var(--yellow)", mono: true });
                },
              },
            },
            {
              title: "Dispatch dinâmico: offset estático, alvo dinâmico",
              body:
                `<p>Em <code>e.m(a1,...,an)</code>, os argumentos são avaliados e empilhados antes do receiver. Depois vem o check de void e a chamada indireta pelo slot do método.</p>` +
                T.code(`actuals → push
receiver e → $a0
bne $a0 $zero ok
  la $a0 str_const<filename>
  li $t1 <line>
  jal _dispatch_abort
ok:
  lw $t1 8($a0)          # dispatch table dinâmica
  lw $t1 slot*4($t1)     # slot obtido do tipo estático
  jalr $t1`, "dispatch_class::code") +
                `<p>Overrides funcionam porque o slot preserva o índice, mas a tabela vem do objeto real.</p>`,
              visual: {
                type: "svg",
                view: [840, 320],
                draw: function (svg) {
                  T.box(svg, 40, 90, 135, 76, "actuals", ["eval/push"], { fill: "var(--bg-soft)", stroke: "var(--border)", mono: true });
                  svg.arrow(185, 128, 250, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 260, 90, 135, 76, "receiver", ["$a0"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(405, 128, 470, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 480, 90, 135, 76, "void check", ["abort se 0"], { fill: "var(--red-soft)", stroke: "var(--red)", mono: true });
                  svg.arrow(625, 128, 690, 128, { color: "var(--ink-mute)" });
                  T.box(svg, 700, 90, 100, 76, "jalr", ["slot"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                  svg.text(420, 242, "Tipo estático resolve slot; objeto dinâmico fornece dispTab.", { size: 15, weight: 800, color: "var(--yellow)" });
                },
              },
            },
            {
              title: "Dispatch estático: @Type fixa a tabela",
              body:
                `<p>No dispatch estático <code>e@Type.m(...)</code>, o check de void continua obrigatório, mas a tabela carregada é <code>Type_dispTab</code>, não a tabela do objeto.</p>` +
                T.formula(`static dispatch:
  tabela = Type_dispTab
  slot = layout(Type).method_offset[m]
  jalr tabela[slot]`) +
                `<p>Essa forma força a implementação de <code>Type</code> ou de seu ancestral conforme as regras de COOL.</p>`,
              visual: {
                type: "svg",
                view: [760, 260],
                draw: function (svg) {
                  T.box(svg, 70, 80, 170, 82, "receiver", ["$a0"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(250, 121, 360, 121, { color: "var(--ink-mute)" });
                  T.box(svg, 370, 80, 170, 82, "Type_dispTab", ["fixa por @Type"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(550, 121, 650, 121, { color: "var(--ink-mute)" });
                  T.box(svg, 660, 80, 70, 82, "jalr", ["slot"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                },
              },
            },
            {
              title: "new SELF_TYPE: protótipo via tag dinâmica",
              body:
                `<p><code>new T</code> usa labels fixos. <code>new SELF_TYPE</code> não pode: ele deve criar um objeto da classe dinâmica de <code>self</code>.</p>` +
                T.code(`la   $t1 class_objTab
lw   $t2 0($s0)        # tag dinâmica de self
sll  $t2 $t2 3        # 2 palavras por classe = 8 bytes
addu $t1 $t1 $t2
sw   $t1 0($sp)        # preserva entrada da objTab
addiu $sp $sp -4
lw   $a0 0($t1)        # protObj
jal  Object.copy
addiu $sp $sp 4
lw   $t1 0($sp)        # recupera entrada da objTab
lw   $t1 4($t1)        # init
jalr $t1`, "ideia de new SELF_TYPE") +
                `<p>O deslocamento é <code>2 * tag</code> em palavras, ou <code>tag << 3</code> em bytes.</p>`,
              visual: {
                type: "svg",
                view: [820, 300],
                draw: function (svg) {
                  T.box(svg, 40, 82, 135, 88, "$s0", ["self", "tag = t"], { fill: "var(--accent-soft)", stroke: "var(--accent)", mono: true });
                  svg.arrow(185, 126, 290, 126, { color: "var(--ink-mute)" });
                  T.box(svg, 300, 62, 210, 128, "class_objTab", ["2t: protObj", "2t+1: init"], { fill: "var(--purple-soft)", stroke: "var(--purple)", mono: true });
                  svg.arrow(520, 126, 620, 126, { color: "var(--ink-mute)" });
                  T.box(svg, 630, 82, 145, 88, "novo objeto", ["copy", "init"], { fill: "var(--green-soft)", stroke: "var(--green)", mono: true });
                },
              },
            },
            {
              title: "Class_init: inicializar herdado primeiro",
              body:
                `<p>Cada classe recebe um inicializador <code>Class_init</code>. Ele chama o inicializador do pai, executa inicializadores dos atributos da própria classe e retorna <code>SELF</code> em <code>$a0</code>.</p>` +
                T.formula(`Class_init:
  prologue
  jal Parent_init
  for attr with init:
      attr_init->code()
      sw $a0 offset($s0)
      (barreira GC se necessário)
  move $a0 $s0
  epilogue`) +
                `<p>Durante um inicializador, o ambiente contém atributos; <code>let</code>/<code>case</code> usam slots locais do frame do init.</p>`,
              visual: {
                type: "svg",
                view: [820, 290],
                draw: function (svg) {
                  T.pipeline(svg, [
                    { title: "prologue", lines: ["salva regs"] },
                    { title: "Parent_init", lines: ["herdados"] },
                    { title: "attrs", lines: ["init explícito"] },
                    { title: "$a0=$s0", lines: ["return SELF"] },
                    { title: "epilogue", lines: ["jr $ra"] },
                  ], 2);
                },
              },
            },
          ];
        },
      },
    ],
  });
})();
