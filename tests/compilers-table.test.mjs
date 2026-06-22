/*
 * compilers-table.test.mjs — Unit test for EX.Content.table (issue #3).
 *
 * Verifies the three guarantees of the table component:
 *   1. plain string/number cells are HTML-escaped (safe by default);
 *   2. cells/headers marked { html: "..." } are rendered as trusted raw HTML;
 *   3. activeRow (single, canonical property) adds the "active" class to a row.
 *
 * Loads util.js + table.js against the shared DOM shim (no build, plain IIFEs).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { makeEl } from "./_compilers-harness.mjs";

const ROOT = "Compiladores-Lista-A";
globalThis.window = {};
globalThis.document = { createElement: (t) => makeEl(t), createElementNS: (_n, t) => makeEl(t) };

vm.runInThisContext(fs.readFileSync(`${ROOT}/js/lib/util.js`, "utf8"), { filename: "util.js" });
vm.runInThisContext(fs.readFileSync(`${ROOT}/js/components/content/table.js`, "utf8"), { filename: "table.js" });
const EX = globalThis.window.EX;

const host = makeEl("div");
EX.Content.table(host, {
  headers: ["a<b", { html: "<code>h</code>" }],
  rows: [
    ["x<y&z", { html: "<span class='ok'>ok</span>" }],
    [{ html: "<br>" }, "plain"],
  ],
  activeRow: 1,
});

const table = host.childNodes[0];
assert.equal(table.tagName, "table", "produces a <table>");

const [thead, tbody] = table.childNodes;
const headerCells = thead.childNodes[0].childNodes;
const row0 = tbody.childNodes[0];
const row1 = tbody.childNodes[1];

// 1. plain cells/headers are escaped.
assert.equal(headerCells[0].innerHTML, "a&lt;b", "plain header is escaped");
assert.equal(row0.childNodes[0].innerHTML, "x&lt;y&amp;z", "plain cell escapes < and &");
assert.equal(row1.childNodes[1].innerHTML, "plain", "plain cell with no specials is unchanged");

// 2. { html } cells/headers are raw, trusted HTML.
assert.equal(headerCells[1].innerHTML, "<code>h</code>", "{html} header is raw");
assert.equal(row0.childNodes[1].innerHTML, "<span class='ok'>ok</span>", "{html} cell renders ok-state span raw");
assert.equal(row1.childNodes[0].innerHTML, "<br>", "{html} cell renders a line break raw");

// 3. activeRow highlights exactly one row, via the single canonical property.
assert.equal(row0.className, "", "non-active row has no active class");
assert.equal(row1.className, "active", "activeRow row gets the active class");

console.log("Compilers table component checks passed (escaping, trusted html, activeRow).");
