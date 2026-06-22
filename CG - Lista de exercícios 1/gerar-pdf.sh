#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

pandoc "CG - Lista de exercícios 1.md" \
  -o "CG - Lista de exercícios 1.pdf" \
  --pdf-engine=xelatex \
  --lua-filter=pdf-half-images.lua \
  -V geometry:margin=2.5cm \
  -V lang=pt-BR \
  -V mainfont="Helvetica" \
  -V monofont="Menlo"

echo "PDF gerado: CG - Lista de exercícios 1.pdf"
