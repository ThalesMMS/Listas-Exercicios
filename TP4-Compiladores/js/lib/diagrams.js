(function () {
  "use strict";
  var TP4 = (window.TP4 = window.TP4 || {});

  function label(svg, x, y, text, color) { svg.text(x, y, text, { color: color || "var(--ink-dim)", size: 12 }); }
  function title(svg, t) { svg.text(380, 28, t, { size: 17, weight: 800, color: "var(--ink)" }); }
  function note(svg, x, y, t) { svg.text(x, y, t, { size: 12, color: "var(--ink-dim)" }); }
  function color(active, key, fallback) { return active === key ? "var(--accent)" : (fallback || "var(--border)"); }
  function fill(active, key, fallback) { return active === key ? "var(--accent-soft)" : (fallback || "var(--bg-soft)"); }

  function pipeline(svg, active) {
    svg.view(760, 430); title(svg, "Do parser ao gerador de código");
    var boxes = [
      { k: "ast", x: 52, y: 145, w: 135, h: 82, t: "AST do PA3", s: "classes + features + expr" },
      { k: "semant", x: 240, y: 130, w: 160, h: 112, t: "program_class::semant()", s: "ClassTable + type_check" },
      { k: "typed", x: 455, y: 145, w: 140, h: 82, t: "AST anotada", s: "Expression.type setado" },
      { k: "codegen", x: 635, y: 145, w: 80, h: 82, t: "PA5", s: "codegen" }
    ];
    boxes.forEach(function (b, i) {
      svg.box(b.x, b.y, b.w, b.h, b.t, b.s, { fill: fill(active, b.k), stroke: color(active, b.k), titleColor: active === b.k ? "var(--accent)" : "var(--ink)" });
      if (i < boxes.length - 1) svg.arrow(b.x + b.w + 12, b.y + b.h / 2, boxes[i + 1].x - 12, boxes[i + 1].y + boxes[i + 1].h / 2, { color: "var(--ink-mute)" });
    });
    svg.badge(320, 278, "legal?", { fill: active === "semant" ? "var(--yellow)" : "var(--bg-soft)", stroke: "var(--yellow)", color: active === "semant" ? "var(--bg)" : "var(--yellow)" });
    svg.arrow(320, 292, 320, 345, { color: "var(--yellow)", dashed: true });
    svg.box(215, 348, 210, 48, "programa errado", "mensagens de erro", { fill: "var(--red-soft)", stroke: "var(--red)", titleColor: "var(--red)" });
  }

  function semantPhases(svg, active) {
    svg.view(760, 430); title(svg, "As duas fases do semant() no TP4");
    svg.box(280, 58, 200, 50, "program_class::semant()", "ponto de entrada", { fill: fill(active, "entry"), stroke: color(active, "entry") });
    svg.arrow(380, 108, 380, 136, { color: "var(--ink-mute)" });
    svg.box(85, 140, 255, 192, "Fase 1 — construir e validar", "ClassTable(classes)", { fill: fill(active, "phase1"), stroke: color(active, "phase1"), titleColor: "var(--accent)" });
    var p1 = ["install_basic_classes", "install_user_classes", "check_inheritance_graph", "build_feature_tables"];
    p1.forEach(function (t, i) { svg.box(110, 178 + i * 34, 205, 25, t, "", { fill: i === 2 && active === "graph" ? "var(--yellow-soft)" : "var(--bg-card)", stroke: "var(--border)", size: 11, mono: true }); });
    svg.box(420, 140, 255, 192, "Fase 2 — checar tipos", "walk topológico das classes", { fill: fill(active, "phase2"), stroke: color(active, "phase2"), titleColor: "var(--green)" });
    var p2 = ["enterscope()", "atributos herdados + próprios", "feature->type_check(&env)", "expr->set_type(T)"];
    p2.forEach(function (t, i) { svg.box(445, 178 + i * 34, 205, 25, t, "", { fill: i === 2 && active === "type" ? "var(--green-soft)" : "var(--bg-card)", stroke: "var(--border)", size: 11, mono: true }); });
    svg.arrow(340, 236, 420, 236, { color: active === "gate" ? "var(--yellow)" : "var(--ink-mute)", dashed: active === "gate" });
    svg.badge(380, 236, "grafo OK", { fill: active === "gate" ? "var(--yellow)" : "var(--bg-soft)", stroke: "var(--yellow)", color: active === "gate" ? "var(--bg)" : "var(--yellow)", w: 78 });
    note(svg, 380, 374, "Erros de grafo abortam; erros locais usam recuperação e continuam.");
  }

  function typeCheckTree(svg, active) {
    svg.view(760, 430); title(svg, "type_check: ambiente desce, tipo sobe");
    svg.box(300, 68, 160, 54, "assign_class", "x <- e", { fill: fill(active, "root"), stroke: color(active, "root") });
    svg.box(90, 190, 150, 54, "object_class", "x : O.lookup(x)", { fill: fill(active, "id"), stroke: color(active, "id") });
    svg.box(305, 190, 150, 54, "plus_class", "e1 + e2", { fill: fill(active, "plus"), stroke: color(active, "plus") });
    svg.box(540, 190, 130, 54, "set_type(T)", "side effect", { fill: fill(active, "set"), stroke: color(active, "set"), titleColor: active === "set" ? "var(--accent)" : "var(--ink)" });
    svg.box(278, 315, 110, 44, "int_const", ": Int", { fill: fill(active, "leaf"), stroke: color(active, "leaf") });
    svg.box(420, 315, 110, 44, "object", "y : T", { fill: fill(active, "leaf"), stroke: color(active, "leaf") });
    svg.arrow(380, 122, 165, 190, { color: "var(--ink-mute)" });
    svg.arrow(380, 122, 380, 190, { color: "var(--ink-mute)" });
    svg.arrow(380, 244, 333, 315, { color: "var(--ink-mute)" });
    svg.arrow(380, 244, 475, 315, { color: "var(--ink-mute)" });
    svg.arrow(455, 217, 540, 217, { color: active === "set" ? "var(--accent)" : "var(--ink-mute)" });
    svg.path("M 620 250 C 620 305 510 368 380 376 C 260 368 150 305 150 250", { stroke: active === "env" ? "var(--yellow)" : "var(--ink-mute)", dashed: true, strokeWidth: 2 });
    svg.text(380, 390, "TypeEnv = ClassTable + classe atual + escopos de objetos", { color: active === "env" ? "var(--yellow)" : "var(--ink-dim)", size: 12 });
  }

  function fatalRecovery(svg, active) {
    svg.view(760, 430); title(svg, "Erros fatais × erros recuperáveis");
    svg.box(280, 70, 200, 52, "erro semântico", "qual é a natureza?", { fill: "var(--bg-soft)", stroke: "var(--border)" });
    svg.arrow(340, 122, 220, 178, { color: "var(--red)" });
    svg.arrow(420, 122, 540, 178, { color: "var(--green)" });
    svg.rect(70, 178, 285, 130, { fill: fill(active, "fatal", "var(--red-soft)"), stroke: "var(--red)", rx: 12 });
    svg.text(212, 200, "FATAL", { color: "var(--red)", weight: 800, size: 15 });
    svg.text(212, 219, "quebra o grafo", { color: "var(--ink-dim)", size: 11 });
    svg.text(212, 252, "parent indefinido\nherança ilegal\nciclo\nMain ausente", { color: "var(--ink)", size: 12, lineHeight: 17 });
    svg.rect(405, 178, 285, 130, { fill: fill(active, "recover", "var(--green-soft)"), stroke: "var(--green)", rx: 12 });
    svg.text(548, 200, "RECUPERÁVEL", { color: "var(--green)", weight: 800, size: 15 });
    svg.text(548, 219, "erro local", { color: "var(--ink-dim)", size: 11 });
    svg.text(548, 252, "identificador não declarado\noperador com tipo errado\ndispatch inválido\nreturn incompatível", { color: "var(--ink)", size: 12, lineHeight: 17 });
    svg.arrow(212, 308, 212, 356, { color: "var(--red)" });
    svg.arrow(548, 308, 548, 356, { color: "var(--green)" });
    svg.box(88, 360, 248, 42, "halt após fase 1", "evita loops em parent_of", { fill: "var(--red-soft)", stroke: "var(--red)", titleColor: "var(--red)", subColor: "var(--ink-dim)" });
    svg.box(424, 360, 248, 42, "set_type(Object)", "continua e lista mais erros", { fill: "var(--green-soft)", stroke: "var(--green)", titleColor: "var(--green)", subColor: "var(--ink-dim)" });
  }

  function classTable(svg, active) {
    svg.view(760, 430); title(svg, "ClassTable: banco de dados global da semântica");
    svg.box(290, 56, 180, 64, "ClassTable", "consultas de tipo", { fill: "var(--accent-soft)", stroke: "var(--accent)", titleColor: "var(--accent)" });
    // Cinco tabelas numa única fileira: as setas saem do mesmo ponto e descem em
    // leque, sem nenhuma seta atravessar outra caixa.
    var items = [
      { k: "classes", cx: 78, t: "class_by_name", s: "classe → AST" },
      { k: "parents", cx: 231, t: "parent_of", s: "classe → pai" },
      { k: "methods", cx: 384, t: "methods_of", s: "classe → métodos" },
      { k: "attrs", cx: 537, t: "attrs_of", s: "classe → atributos" },
      { k: "queries", cx: 690, t: "queries", s: "conforms, lub, lookup" }
    ];
    var bw = 134, top = 226, bh = 92;
    items.forEach(function (b) {
      svg.box(b.cx - bw / 2, top, bw, bh, b.t, b.s, { fill: fill(active, b.k), stroke: color(active, b.k), mono: true, size: 12, subSize: 10 });
    });
    items.forEach(function (b) {
      svg.arrow(380, 122, b.cx, top - 3, { color: active === b.k ? "var(--accent)" : "var(--ink-mute)", dashed: active !== b.k });
    });
    note(svg, 380, 388, "O type checker não recalcula a hierarquia: ele consulta a ClassTable.");
  }

  function typeEnv(svg, active) {
    svg.view(760, 430); title(svg, "TypeEnv representa o julgamento O, M, C ⊢ e : T");
    svg.text(380, 78, "O, M, C ⊢ e : T", { size: 34, weight: 800, color: "var(--accent)", mono: true });
    var boxes = [
      { k: "o", x: 60, y: 160, w: 180, t: "O — ObjectEnv", s: "escopos de identificadores" },
      { k: "m", x: 290, y: 160, w: 180, t: "M — métodos", s: "ClassTable.lookup_method" },
      { k: "c", x: 520, y: 160, w: 180, t: "C — classe atual", s: "resolve SELF_TYPE" }
    ];
    boxes.forEach(function (b) { svg.box(b.x, b.y, b.w, 92, b.t, b.s, { fill: fill(active, b.k), stroke: color(active, b.k), titleColor: active === b.k ? "var(--accent)" : "var(--ink)" }); });
    svg.arrow(150, 252, 310, 330, { color: active === "flow" ? "var(--yellow)" : "var(--ink-mute)" });
    svg.arrow(380, 252, 380, 330, { color: active === "flow" ? "var(--yellow)" : "var(--ink-mute)" });
    svg.arrow(610, 252, 450, 330, { color: active === "flow" ? "var(--yellow)" : "var(--ink-mute)" });
    svg.box(290, 330, 180, 56, "type_check(env)", "recursão na AST", { fill: fill(active, "flow", "var(--bg-soft)"), stroke: color(active, "flow"), titleColor: active === "flow" ? "var(--yellow)" : "var(--ink)" });
  }

  function scopeStack(svg, active) {
    svg.view(760, 430); title(svg, "ObjectEnv: pilha de escopos");
    var layers = [
      { k: "class", t: "classe C", s: "self : SELF_TYPE\nattrs herdados + próprios" },
      { k: "method", t: "método", s: "formais: a:T, b:U" },
      { k: "let", t: "let", s: "x : Int" },
      { k: "case", t: "case branch", s: "id : BranchType" }
    ];
    layers.forEach(function (l, i) {
      var x = 210 + i * 62, y = 285 - i * 54;
      svg.box(x, y, 340, 48, l.t, l.s, { fill: fill(active, l.k), stroke: color(active, l.k), titleColor: active === l.k ? "var(--accent)" : "var(--ink)", subSize: 10, subMono: true });
    });
    svg.arrow(590, 270, 590, 112, { color: "var(--yellow)", dashed: true });
    svg.text(622, 190, "lookup procura\ndo topo para baixo", { color: "var(--yellow)", size: 12, anchor: "start", lineHeight: 16 });
    svg.text(380, 374, "enterscope() empilha; exitscope() remove; bindings internos sombreiam externos.", { color: "var(--ink-dim)", size: 12 });
  }

  function inheritanceTree(svg, active) {
    svg.view(760, 430); title(svg, "Hierarquia Cool: árvore de herança");
    // Classes básicas à esquerda, hierarquia do usuário à direita: assim a aresta
    // Object→Animal não cruza por trás das caixas das classes básicas.
    var nodes = {
      Object: [380, 60],
      IO: [96, 152], Int: [212, 152], Bool: [328, 152], String: [444, 152],
      Animal: [628, 152], Dog: [560, 258], Cat: [700, 258], Poodle: [560, 352]
    };
    function n(name, fillColor, strokeColor) {
      var p = nodes[name];
      svg.box(p[0] - 48, p[1] - 20, 96, 40, name, "", { fill: active === name ? "var(--accent-soft)" : fillColor || "var(--bg-soft)", stroke: active === name ? "var(--accent)" : strokeColor || "var(--border)", mono: true, size: 13 });
    }
    [["Object","IO"],["Object","Int"],["Object","Bool"],["Object","String"],["Object","Animal"],["Animal","Dog"],["Animal","Cat"],["Dog","Poodle"]].forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]]; svg.arrow(a[0], a[1] + 22, b[0], b[1] - 22, { color: "var(--ink-mute)", strokeWidth: 1.6 });
    });
    ["Object","IO","Int","Bool","String","Animal","Dog","Cat","Poodle"].forEach(function (x) { n(x, /Object|IO|Int|Bool|String/.test(x) ? "var(--purple-soft)" : "var(--bg-soft)", /Object|IO|Int|Bool|String/.test(x) ? "var(--purple)" : "var(--border)"); });
    svg.text(380, 406, "Int, Bool e String existem, mas não podem ser pais de classes do usuário.", { color: "var(--ink-dim)", size: 12 });
  }

  function cycle(svg, active) {
    svg.view(760, 430); title(svg, "Detecção de ciclo: seguir parent pointers");
    var pts = { A: [250, 120], B: [510, 120], C: [510, 300], D: [250, 300] };
    Object.keys(pts).forEach(function (k) {
      var p = pts[k];
      svg.box(p[0] - 48, p[1] - 24, 96, 48, "class " + k, "pai = " + ({ A: "B", B: "C", C: "A", D: "Object" }[k]), { fill: active === k ? "var(--red-soft)" : "var(--bg-soft)", stroke: active === k ? "var(--red)" : "var(--border)", mono: true, size: 12 });
    });
    svg.arrow(300, 120, 460, 120, { color: "var(--red)" });
    svg.arrow(510, 144, 510, 276, { color: "var(--red)" });
    svg.arrow(470, 300, 270, 144, { color: "var(--red)" });
    svg.arrow(250, 276, 250, 150, { color: "var(--ink-mute)", dashed: true });
    svg.text(380, 365, "Se uma classe reaparece no conjunto visiting, todos os nós do caminho estão em ciclo.", { color: "var(--red)", size: 12 });
  }

  function featurePasses(svg, active) {
    svg.view(760, 430); title(svg, "build_feature_tables(): duas passagens");
    svg.box(62, 95, 270, 250, "Passo 1 — coleta local", "preenche methods_of e attrs_of", { fill: fill(active, "pass1"), stroke: color(active, "pass1"), titleColor: "var(--accent)" });
    ["método duplicado na classe", "formal self / duplicado", "formal SELF_TYPE", "tipo de formal/retorno indefinido", "atributo self / duplicado local"].forEach(function (t, i) { svg.box(88, 145 + i * 36, 218, 24, t, "", { fill: "var(--bg-card)", stroke: "var(--border)", size: 10 }); });
    svg.box(428, 95, 270, 250, "Passo 2 — herança", "compara com ancestrais", { fill: fill(active, "pass2"), stroke: color(active, "pass2"), titleColor: "var(--green)" });
    ["atributo herdado não pode redefinir", "override exige assinatura idêntica", "sem overloading por nome", "Main.main existe", "Main.main sem argumentos"].forEach(function (t, i) { svg.box(454, 145 + i * 36, 218, 24, t, "", { fill: "var(--bg-card)", stroke: "var(--border)", size: 10 }); });
    svg.arrow(332, 220, 428, 220, { color: "var(--yellow)" });
    svg.badge(380, 220, "depois", { fill: "var(--yellow)", stroke: "var(--yellow)", color: "var(--bg)", w: 68 });
  }

  function override(svg, active) {
    svg.view(760, 430); title(svg, "Override em Cool: assinatura invariável");
    svg.box(120, 92, 230, 92, "Pai: A", "foo(x:Int): String", { fill: active === "parent" ? "var(--accent-soft)" : "var(--bg-soft)", stroke: active === "parent" ? "var(--accent)" : "var(--border)", mono: true });
    svg.arrow(235, 184, 235, 238, { color: "var(--ink-mute)" });
    svg.box(120, 238, 230, 92, "Filho: B", "foo(x:Int): String", { fill: active === "ok" ? "var(--green-soft)" : "var(--bg-soft)", stroke: active === "ok" ? "var(--green)" : "var(--border)", mono: true });
    svg.box(430, 92, 230, 92, "Filho: C", "foo(): String", { fill: active === "arity" ? "var(--red-soft)" : "var(--bg-soft)", stroke: active === "arity" ? "var(--red)" : "var(--border)", mono: true });
    svg.box(430, 238, 230, 92, "Filho: D", "foo(x:Object): String", { fill: active === "type" ? "var(--red-soft)" : "var(--bg-soft)", stroke: active === "type" ? "var(--red)" : "var(--border)", mono: true });
    svg.badge(235, 358, "OK", { fill: "var(--green)", stroke: "var(--green)", color: "var(--bg)" });
    svg.badge(545, 211, "erro", { fill: "var(--red)", stroke: "var(--red)", color: "var(--bg)" });
    svg.badge(545, 358, "erro", { fill: "var(--red)", stroke: "var(--red)", color: "var(--bg)" });
    note(svg, 380, 402, "Mesmo nome + assinatura diferente não é sobrecarga; é override incompatível.");
  }

  function dispatch(svg, active) {
    svg.view(760, 430); title(svg, "Dispatch: tipo do receptor define o lookup");
    svg.box(60, 70, 160, 54, "e.m(args)", "dispatch dinâmico", { fill: fill(active, "dyn"), stroke: color(active, "dyn"), mono: true });
    svg.box(60, 240, 160, 54, "e@T.m(args)", "static dispatch", { fill: fill(active, "static"), stroke: color(active, "static"), mono: true });
    svg.arrow(220, 97, 350, 97, { color: "var(--ink-mute)" });
    svg.arrow(220, 267, 350, 267, { color: "var(--ink-mute)" });
    svg.box(350, 55, 160, 84, "lookup_method", "em tipo de e\nSELF_TYPE → classe atual", { fill: fill(active, "lookup"), stroke: color(active, "lookup"), subMono: true });
    svg.box(350, 225, 160, 84, "lookup_method", "em T anotado\n@SELF_TYPE proibido", { fill: fill(active, "lookupStatic"), stroke: color(active, "lookupStatic"), subMono: true });
    svg.arrow(510, 97, 650, 97, { color: "var(--green)" });
    svg.arrow(510, 267, 650, 267, { color: "var(--green)" });
    svg.box(610, 70, 118, 54, "retorno", "SELF_TYPE ⇒ tipo de e", { fill: "var(--green-soft)", stroke: "var(--green)", subSize: 10 });
    svg.box(610, 240, 118, 54, "retorno", "SELF_TYPE ⇒ tipo de e", { fill: "var(--green-soft)", stroke: "var(--green)", subSize: 10 });
    note(svg, 380, 372, "Args são checados contra os tipos formais da MethodSig; aridade errada também é erro.");
  }

  function selfType(svg, active) {
    svg.view(760, 430); title(svg, "SELF_TYPE: o tipo do próprio receptor");
    svg.box(82, 105, 180, 68, "class Counter", "inc(n:Int): SELF_TYPE", { fill: fill(active, "class"), stroke: color(active, "class"), mono: true });
    svg.arrow(262, 139, 344, 139, { color: "var(--ink-mute)" });
    svg.box(344, 105, 190, 68, "(new Counter).inc(1)", "receiver = Counter", { fill: fill(active, "call1"), stroke: color(active, "call1"), mono: true });
    svg.arrow(534, 139, 620, 139, { color: "var(--green)" });
    svg.box(620, 105, 94, 68, "Counter", "não Object", { fill: "var(--green-soft)", stroke: "var(--green)", titleColor: "var(--green)", mono: true });
    svg.box(152, 250, 190, 76, "self", "object_class ⇒ SELF_TYPE", { fill: fill(active, "self"), stroke: color(active, "self"), mono: true });
    svg.box(420, 250, 190, 76, "new SELF_TYPE", "resultado SELF_TYPE", { fill: fill(active, "new"), stroke: color(active, "new"), mono: true });
    svg.text(380, 380, "Resolver cedo para a classe atual perderia o polimorfismo do receptor.", { color: "var(--ink-dim)", size: 12 });
  }

  function lubTree(svg, active) {
    svg.view(760, 430); title(svg, "lub(a,b): menor ancestral comum");
    var nodes = { Object: [380, 70], Animal: [380, 155], Dog: [280, 250], Cat: [480, 250], Poodle: [280, 340], String: [620, 155] };
    [["Object","Animal"],["Object","String"],["Animal","Dog"],["Animal","Cat"],["Dog","Poodle"]].forEach(function (e) { var a = nodes[e[0]], b = nodes[e[1]]; svg.arrow(a[0], a[1] + 22, b[0], b[1] - 22, { color: "var(--ink-mute)", strokeWidth: 1.6 }); });
    Object.keys(nodes).forEach(function (k) { var p = nodes[k]; svg.box(p[0] - 54, p[1] - 20, 108, 40, k, "", { fill: active === k ? "var(--yellow-soft)" : "var(--bg-soft)", stroke: active === k ? "var(--yellow)" : "var(--border)", mono: true, size: 13 }); });
    svg.badge(380, 202, "lub(Dog,Cat)=Animal", { fill: "var(--yellow)", stroke: "var(--yellow)", color: "var(--bg)", w: 180 });
    svg.badge(500, 338, "lub(Poodle,String)=Object", { fill: "var(--accent)", stroke: "var(--accent)", color: "var(--bg)", w: 204 });
  }

  function errorFlow(svg, active) {
    svg.view(760, 430); title(svg, "Recuperação: reporta, tipa como Object e continua");
    var steps = [
      { k: "err", x: 60, t: "erro local", s: "ex.: 1 + \"x\"" },
      { k: "msg", x: 250, t: "semant_error", s: "arquivo:linha" },
      { k: "obj", x: 440, t: "tipo Object", s: "recovery type" },
      { k: "next", x: 630, t: "continua", s: "mais erros" }
    ];
    steps.forEach(function (b, i) {
      svg.box(b.x, 160, 120, 78, b.t, b.s, { fill: fill(active, b.k), stroke: color(active, b.k), titleColor: active === b.k ? "var(--accent)" : "var(--ink)" });
      if (i < steps.length - 1) svg.arrow(b.x + 120, 199, steps[i + 1].x, 199, { color: "var(--ink-mute)" });
    });
    svg.box(205, 298, 350, 58, "Objetivo pedagógico e prático", "um único run mostra o máximo possível de problemas", { fill: "var(--green-soft)", stroke: "var(--green)", titleColor: "var(--green)" });
  }

  function examMap(svg, active) {
    svg.view(760, 430); title(svg, "Mapa mental para revisar o TP4");
    svg.box(292, 178, 176, 66, "Analisador Semântico", "PA4 / TP4", { fill: "var(--accent-soft)", stroke: "var(--accent)", titleColor: "var(--accent)" });
    var items = [
      ["Grafo", 140, 80, "herança + ciclos"], ["Features", 620, 80, "attrs + métodos"], ["Escopo", 140, 335, "ObjectEnv"], ["Tipos", 620, 335, "type_check"], ["SELF_TYPE", 380, 70, "conforms + lub"], ["Erros", 380, 350, "fatal vs recover"]
    ];
    items.forEach(function (it) {
      svg.box(it[1] - 70, it[2] - 32, 140, 64, it[0], it[3], { fill: active === it[0] ? "var(--yellow-soft)" : "var(--bg-soft)", stroke: active === it[0] ? "var(--yellow)" : "var(--border)" });
      svg.arrow(380, 211, it[1], it[2], { color: "var(--ink-mute)", dashed: true });
    });
  }

  TP4.D = {
    pipeline: pipeline,
    semantPhases: semantPhases,
    typeCheckTree: typeCheckTree,
    fatalRecovery: fatalRecovery,
    classTable: classTable,
    typeEnv: typeEnv,
    scopeStack: scopeStack,
    inheritanceTree: inheritanceTree,
    cycle: cycle,
    featurePasses: featurePasses,
    override: override,
    dispatch: dispatch,
    selfType: selfType,
    lubTree: lubTree,
    errorFlow: errorFlow,
    examMap: examMap
  };
})();
