/*
 * compilers-guide-hub.test.mjs — Verifies the Guia-de-Compiladores page is a
 * self-contained Explainer hub (its own CSS/JS, a #hub mount, a back-link) and
 * that the root index surfaces it as a card.
 *
 * Replaces the old "placeholder" test: the directory is no longer a thin
 * placeholder reusing the root portal assets — it is the real guide hub.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const path = "Guia-de-Compiladores/index.html";

assert.ok(existsSync(path), `${path} should exist`);

const html = readFileSync(path, "utf8");
const rootIndex = readFileSync("index.html", "utf8");

// The hub page names the guide.
assert.ok(html.includes("<title>Guia de Compiladores</title>"), "page title should name the guide");
assert.match(html, /<h1[^>]*>Guia de Compiladores<\/h1>/, "main heading should name the guide");

// It is a self-contained Explainer instance (own assets, not the root portal's).
assert.ok(html.includes('href="css/theme.css"'), "hub should load its own theme CSS");
assert.ok(html.includes('src="js/manifest.js"'), "hub should load the guide manifest");
assert.ok(html.includes('src="js/loader.js"'), "hub should load the loader");
assert.ok(html.includes('id="hub"'), "hub should have the #hub mount point");
assert.ok(html.includes('href="../index.html"'), "hub should link back to the root index");

// The root index surfaces the guide as a card.
assert.ok(
  rootIndex.includes('href="Guia-de-Compiladores/index.html"'),
  "root index should link to the compilers guide",
);
assert.ok(
  rootIndex.includes("<h2>Guia de Compiladores</h2>"),
  "root index should display the compilers guide card",
);
assert.ok(
  rootIndex.includes('<span class="count">guia ampliado</span>'),
  "root index should avoid a brittle hardcoded compiler guide count",
);
assert.ok(
  !rootIndex.includes("20 guias") && !rootIndex.includes("20 tópicos"),
  "root index should not keep stale 20-guide compiler copy",
);
assert.ok(
  rootIndex.includes("listas A-D e TPs") && rootIndex.includes("semântica operacional"),
  "root index compiler guide card should describe the expanded A-D/TP coverage",
);
assert.ok(
  html.includes("listas A-D e nos TPs"),
  "compiler guide hub copy should reference lists A-D and TPs",
);
assert.ok(
  !html.includes("três listas"),
  "compiler guide hub copy should not refer to only three lists",
);

console.log("Guia-de-Compiladores hub checks passed.");
