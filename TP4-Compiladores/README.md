# TP4 Compiladores — Sessão didática interativa

Sessão independente em HTML/CSS/JS puro para estudar o TP4 de Compiladores: análise semântica estática da linguagem Cool.

## Como abrir

Abra `index.html` no navegador. A sessão funciona via `file://`, sem build, sem servidor local e sem dependências externas.

- Hub: `index.html`
- Subsessão: `section.html?s=<id>`
- Tema claro/escuro: botão flutuante no canto inferior direito; preferência salva em `localStorage` (`tp4-theme`).

## Navegação

- `←` / `→`: passo anterior/próximo.
- `espaço`: reproduzir/pausar.
- `Home`: reiniciar a parte atual.
- Subsessões com partes têm abas no topo.

## Estrutura

```text
Aplicação prática da teoria de construção de um Analisador Semântico.pdf   (PDF-fonte: enunciado/teoria do TP4)
index.html
section.html
css/
  theme.css
  layout.css
  components.css
js/
  config.js
  manifest.js
  loader.js
  core/
    registry.js
    theme.js
    stepper.js
    layout.js
    stage.js
  surfaces/
    svg.js
    dom.js
  lib/
    util.js
    diagrams.js
  sessions/
    00-overview.js
    01-data-structures.js
    02-inheritance-graph.js
    03-feature-tables.js
    04-type-checking-rules.js
    05-selftype-conforms-lub.js
    06-errors-and-recovery.js
    07-exam-qa.js
tp4-compiladores-ground-truth/   notas-fonte (ground truth), uma .md por subsessão (00-07)
```

## Conteúdo

1. Visão geral do PA4/TP4.
2. Estruturas de dados centrais: `ClassTable`, `MethodSig`, `TypeEnv`, `ObjectEnv`.
3. Grafo de herança e checagens fatais.
4. Tabelas de features e regras de override.
5. Regras de tipagem das expressões.
6. `SELF_TYPE`, conformidade e `lub`.
7. Catálogo de erros e recuperação.
8. Revisão para prova e perguntas prováveis.
