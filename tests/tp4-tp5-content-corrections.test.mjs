/*
 * tp4-tp5-content-corrections.test.mjs - Regression checks for the
 * TP4/TP5 compiler-session correctness review.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const tp4Overview = read("TP4-Compiladores/js/sessions/00-overview.js");
const tp4FeatureTables = read("TP4-Compiladores/js/sessions/03-feature-tables.js");
const tp4TypeRules = read("TP4-Compiladores/js/sessions/04-type-checking-rules.js");
const tp4SelfType = read("TP4-Compiladores/js/sessions/05-selftype-conforms-lub.js");
const tp4Errors = read("TP4-Compiladores/js/sessions/06-errors-and-recovery.js");
const tp4Diagrams = read("TP4-Compiladores/js/lib/diagrams.js");
const tp4GtOverview = read("TP4-Compiladores/tp4-compiladores-ground-truth/00-overview.md");
const tp4GtTypeRules = read("TP4-Compiladores/tp4-compiladores-ground-truth/04-type-checking-rules.md");
const tp4GtSelfType = read("TP4-Compiladores/tp4-compiladores-ground-truth/05-selftype-conforms-lub.md");
const tp4GtErrors = read("TP4-Compiladores/tp4-compiladores-ground-truth/06-errors-and-recovery.md");
const tp4GtExam = read("TP4-Compiladores/tp4-compiladores-ground-truth/07-exam-qa.md");

const tp5Tables = read("TP5-Compiladores/js/tp5/t03-tables-tags.js");
const tp5Calling = read("TP5-Compiladores/js/tp5/t04-calling-convention.js");
const tp5GtLayout = read("TP5-Compiladores/tp5-compiladores-ground-truth/02-object-layout.md");
const tp5GtTags = read("TP5-Compiladores/tp5-compiladores-ground-truth/03-tables-and-tags.md");
const tp5GtCalling = read("TP5-Compiladores/tp5-compiladores-ground-truth/04-calling-convention.md");
const tp5GtExam = read("TP5-Compiladores/tp5-compiladores-ground-truth/07-exam-qa.md");

const dynamicReceiverPhrase = "tipo dinâmico" + " do receptor";
const legacyStringDispTab = "Str" + "_dispTab";
const legacyBltImmediate = "b" + "lti";
const legacyBgtImmediate = "b" + "gti";
const zeroMinusOne = "0," + "-1";

assert.ok(
  !tp4SelfType.includes(dynamicReceiverPhrase) &&
    !tp4GtSelfType.includes("caller's dynamic type") &&
    !tp4GtExam.includes("caller's dynamic"),
  "TP4 must not frame SELF_TYPE as the receiver runtime type",
);
assert.ok(
  /tipo est[aá]tico/.test(tp4SelfType) && /despacho din[aâ]mico/.test(tp4SelfType),
  "TP4 SELF_TYPE prose must distinguish static SELF_TYPE from dynamic dispatch",
);

assert.ok(
  /identificador do ramo[\s\S]*<code>self<\/code>|<code>self<\/code>[\s\S]*identificador do ramo/.test(tp4TypeRules) &&
    /branch identifier[\s\S]*`self`|`self`[\s\S]*case branch/.test(tp4GtTypeRules),
  "TP4 case rules must forbid binding self as a branch identifier",
);
assert.ok(
  /case[\s\S]*<code>self<\/code>|<code>self<\/code>[\s\S]*case/.test(tp4Errors) &&
    /case branch[\s\S]*self|self[\s\S]*case branch/.test(tp4GtErrors),
  "TP4 error catalog must include self as an illegal case branch identifier",
);

assert.ok(
  !/quebram a hierarquia global[\s\S]*Main ausente/.test(tp4Errors) &&
    !/quebra o grafo[\s\S]*Main ausente/.test(tp4Diagrams),
  "TP4 must not justify missing Main as an inheritance-graph break",
);
assert.ok(/ponto de entrada/.test(tp4Errors), "TP4 fatal errors must separate missing Main as an entry-point error");

assert.ok(
  /localmente em <code>Main<\/code>|<code>methods_of\[Main\]<\/code>/.test(tp4FeatureTables),
  "TP4 Main.main text must require a method declared locally in Main",
);

assert.ok(tp4Overview.includes("cool-tree.handcode.h"), "TP4 overview must name cool-tree.handcode.h for AST extras");
assert.ok(
  !/cool-tree\.h<\/code>", "Declarações extras/.test(tp4Overview) &&
    tp4GtOverview.includes("cool-tree.handcode.h"),
  "TP4 overview must not assign type_check extras to cool-tree.h",
);

assert.ok(
  tp5Calling.includes("sw   $t1 0($sp)") &&
    tp5Calling.includes("addiu $sp $sp -4") &&
    tp5Calling.includes("addiu $sp $sp 4") &&
    tp5Calling.includes("lw   $t1 0($sp)") &&
    tp5Calling.indexOf("sw   $t1 0($sp)") < tp5Calling.indexOf("jal  Object.copy") &&
    tp5Calling.indexOf("lw   $t1 0($sp)") > tp5Calling.indexOf("jal  Object.copy"),
  "TP5 new SELF_TYPE snippet must preserve class_objTab entry across Object.copy",
);

assert.ok(
  /\$ra=0\(\$fp\)|\$ra = 0\(\$fp\)/.test(tp5Calling) &&
    /-1, -2/.test(tp5Calling) &&
    !tp5Calling.includes(zeroMinusOne) &&
    !tp5GtCalling.includes("0, -1, -2"),
  "TP5 frame docs must put saved registers at non-local offsets and locals at -1, -2, ...",
);

assert.ok(
  tp5Tables.includes('B: { x: 260, y: 170, label: "B", lines: ["tag 4"]') &&
    tp5Tables.includes('D: { x: 170, y: 270, label: "D", lines: ["tag 5"]') &&
    tp5Tables.includes('E: { x: 350, y: 270, label: "E", lines: ["tag 6"]') &&
    tp5Tables.includes('C: { x: 530, y: 170, label: "C", lines: ["tag 7"]'),
  "TP5 case tag diagram must respect DFS preorder for B's subtree",
);

assert.ok(!tp5GtLayout.includes(legacyStringDispTab), "TP5 ground truth must use String_dispTab consistently");
assert.ok(
  !tp5GtExam.includes(legacyBltImmediate) && !tp5GtExam.includes(legacyBgtImmediate),
  "TP5 ground truth must not name non-standard immediate branch pseudo-instructions",
);
assert.ok(
  tp5GtTags.includes("[tag, tag + subtreeSize)") && /inclusive range/.test(tp5GtTags),
  "TP5 tag interval notation must distinguish half-open and inclusive forms",
);

console.log("TP4/TP5 content correction checks passed.");
