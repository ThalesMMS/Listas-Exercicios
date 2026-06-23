/*
 * no-nfd.test.mjs — Guards against decomposed (NFD) Unicode in the repo (issue #16).
 *
 * Accented directory names like "CG - Lista de exercícios 1" must be stored and
 * referenced in composed (NFC) form. On byte-sensitive filesystems (Linux/CI) an
 * NFD path literal won't match an NFC directory → MODULE_NOT_FOUND / ENOENT, even
 * though the names look identical. macOS hides this by normalizing on lookup.
 *
 * This test fails if any tracked path, or any tracked text file's content (e.g. a
 * path literal in a test), is not already NFC.
 */
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execSync("git ls-files -z", { maxBuffer: 1e8 })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

// 1) No tracked PATH may be decomposed.
const nfdPaths = files.filter((f) => f !== f.normalize("NFC"));
assert.deepEqual(
  nfdPaths,
  [],
  "tracked paths must be NFC-normalized:\n" + nfdPaths.map((p) => "  " + JSON.stringify(p)).join("\n"),
);

// 2) No tracked TEXT file may contain NFD content (catches NFD path literals that
//    resolve on macOS but break on Linux).
const TEXT = /\.(mjs|js|md|html|css|json|txt|ya?ml)$/i;
const nfdContent = [];
for (const f of files) {
  if (!TEXT.test(f)) continue;
  let s;
  try {
    s = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  if (s !== s.normalize("NFC")) {
    const line = s.split("\n").findIndex((ln) => ln !== ln.normalize("NFC")) + 1;
    nfdContent.push(`${f}:${line}`);
  }
}
assert.deepEqual(
  nfdContent,
  [],
  "tracked text files must be NFC-normalized (NFD found at):\n" + nfdContent.map((p) => "  " + p).join("\n"),
);

console.log(`Unicode NFC checks passed (${files.length} tracked paths, no NFD names or content).`);
