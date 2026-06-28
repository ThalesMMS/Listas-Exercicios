import assert from "node:assert/strict";
import { loadCompilersGuides, makeEl } from "./_compilers-harness.mjs";

function plain(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&rarr;/g, "->")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function flatten(value) {
  if (value == null || typeof value === "function") return "";
  if (Array.isArray(value)) return value.map(flatten).join(" ");
  if (typeof value === "object") return Object.values(value).map(flatten).join(" ");
  return String(value);
}

function collectDomText(node) {
  if (!node) return "";
  return [
    node.textContent || "",
    node.innerHTML || "",
    ...(node.childNodes || []).map(collectDomText),
  ].join(" ");
}

function stepText(step) {
  const host = makeEl("div");
  if (step.visual?.type === "dom" && typeof step.visual.draw === "function") {
    step.visual.draw(host);
  }
  return plain(`${flatten(step)} ${collectDomText(host)}`);
}

const { specs } = loadCompilersGuides("Compiladores-Lista-D");
const q = specs.find((spec) => spec.id === "d-q01-self-type-dispatch");
assert.ok(q, "Lista D Q1 should exist");

const steps = q.parts[0].build();
assert.ok(steps.length >= 13, `D-Q1 should have detailed dispatch steps; got ${steps.length}`);

const filledAnswerIndex = steps.findIndex((step) => plain(step.title).includes("As lacunas preenchidas"));
assert.notEqual(filledAnswerIndex, -1, "D-Q1 should include the filled-answer step");

const required = [
  {
    title: "Comando 1",
    command: "io.out_string(c.two().three())",
    needles: ["procura two em C", "C.two()", "new A", "procura three em A", "imprime Cool"],
  },
  {
    title: "Comando 2",
    command: "io.out_string(c.one().three())",
    needles: ["procura one em C", "sobe para A", "new SELF_TYPE", "objeto C", "procura three em C", "imprime compilers"],
  },
  {
    title: "Comando 3",
    command: "io.out_string(b.one().three())",
    needles: ["procura one em B", "sobe para A", "objeto B", "procura three em B", "imprime are"],
  },
  {
    title: "Comando 4",
    command: "io.out_string(c.one().two().one().three())",
    needles: ["c.one()", "C.two()", "new A", "A.one()", "A.three()", "imprime Cool"],
  },
];

for (const item of required) {
  const stepIndex = steps.findIndex((candidate) => plain(candidate.title).includes(item.title));
  assert.ok(stepIndex !== -1, `D-Q1 should include a dedicated "${item.title}" step`);
  assert.ok(
    stepIndex < filledAnswerIndex,
    `${item.title}: explanation should appear before the filled-answer step`,
  );
  const step = steps[stepIndex];
  assert.ok(step, `D-Q1 should include a dedicated "${item.title}" step`);
  const text = stepText(step);
  assert.ok(text.includes(item.command), `${item.title}: should show command ${item.command}`);
  assert.ok(text.includes("class Main"), `${item.title}: should keep the program code visible`);
  assert.ok(text.includes("class A"), `${item.title}: should keep the class code visible`);
  for (const needle of item.needles) {
    assert.ok(text.includes(needle), `${item.title}: should explain "${needle}"`);
  }
}
