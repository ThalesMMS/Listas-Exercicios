# Listas de Exercícios

Portal estático com listas e guias de Computação Gráfica e Compiladores.

## Uso no navegador

Abra `index.html` diretamente no navegador ou sirva a pasta com um servidor local estático.

## Build para iOS

O app iOS é gerado com Capacitor a partir do portal estático existente.

### Pré-requisitos

- Node.js e npm
- Xcode
- CocoaPods disponível no ambiente do Xcode

### Instalar dependências

```bash
npm install
```

Se o cache global do npm apresentar erro de permissão, use um cache local do projeto:

```bash
npm install --cache .npm-cache
```

### Gerar e sincronizar os arquivos do app iOS

```bash
npm run ios:sync
```

Esse comando cria o bundle web em `dist-ios-web/`, copia os arquivos para `ios/App/App/public/` e sincroniza o projeto nativo com o Capacitor.

### Abrir no Xcode

```bash
npm run ios:open
```

No Xcode, selecione um simulador ou dispositivo e rode o esquema `App`.

### Build via linha de comando

Para validar o build no Simulator sem assinatura:

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Para build em dispositivo real ou distribuição, configure o time de assinatura no Xcode.
