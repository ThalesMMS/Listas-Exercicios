# TP5 Compiladores — sessão didática

Pasta autônoma em HTML/CSS/JS puro para a sessão **TP5 Compiladores**.

## Como abrir

- Duplo clique em `index.html`, ou
- servidor local:

```bash
cd tp5-compiladores
python3 -m http.server 8123
```

Depois abra `http://localhost:8123`.

## Estrutura

```text
index.html                 Hub da sessão
question.html              Página genérica de subsessão (?q=<id>)
css/
  theme.css                Variáveis de tema herdadas do Explainer/Guias
  layout.css               Hub, cards, stage, controles
  components.css           Tabelas, callouts, blocos de fórmula
  tp5.css                  Ajustes específicos desta sessão
js/
  manifest.js              Ordem de carregamento dos scripts
  loader.js                Loader sem fetch, compatível com file://
  core/                    Registro, layout, stepper, stage, tema
  surfaces/                SVG, DOM e canvas-plane
  components/              Componentes visuais reutilizáveis
  templates/               Slides/walkthrough
  tp5/
    kit.js                 Helpers da sessão TP5
    t00-overview.js        Visão geral
    t01-mips-registers.js  Registradores e emit_*
    t02-object-layout.js   Layout, protótipos e constantes
    t03-tables-tags.js     Tags, layouts e tabelas
    t04-calling-convention.js Convenção de chamada
    t05-expression-codegen.js Expressões
    t06-runtime-gc.js      Runtime checks e GC
    t07-exam-qa.js         Revisão e drills
```

## Navegação

- Setas `←` / `→`: passo anterior/próximo.
- Espaço: reproduzir/pausar.
- `Home`: reiniciar a subsessão.
- Botão flutuante: alterna tema claro/escuro.

## Observação

A pasta não altera o `index.html` principal do projeto. Para integrar ao portal depois, basta adicionar um card/link apontando para `tp5-compiladores/index.html`.
