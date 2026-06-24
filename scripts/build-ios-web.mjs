import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist-ios-web");

const entries = [
  "index.html",
  "portal.css",
  "portal.js",
  "shared",
  "CG - Lista de exercícios 1",
  "CG - Lista de exercícios 2",
  "CG - Lista de exercícios 3",
  "Compiladores-Lista-A",
  "Compiladores-Lista-B",
  "Compiladores-Lista-C",
  "Guia-de-Compiladores",
  "Guia-de-Computacao-Grafica"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of entries) {
  await cp(path.join(root, entry), path.join(outDir, entry), {
    recursive: true,
    filter: (source) => !source.includes(`${path.sep}.DS_Store`)
  });
}

console.log(`iOS web bundle written to ${path.relative(root, outDir)}`);
