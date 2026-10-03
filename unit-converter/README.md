# Unit Converter

Projeto do [roadmap.sh](https://roadmap.sh/projects/unit-converter): um conversor de unidades web, com renderização no servidor e sem banco de dados. Feito em Node.js, sem frameworks nem bibliotecas externas (usa só o módulo `http` nativo).

Além das três categorias do projeto base (comprimento, peso e temperatura), esta versão cobre 10 categorias.

## Categorias

- Moeda
- Comprimento
- Área
- Volume
- Peso
- Temperatura
- Velocidade
- Pressão
- Potência
- Sistema numérico (binário, octal, decimal e hexadecimal)

## Requisitos

- Node.js 18 ou superior

## Como rodar

Dentro da pasta do projeto:

    npm start

Depois, abra http://localhost:3000 no navegador. Também é possível iniciar com `node server.js`.

Para usar outra porta:

    PORT=3001 npm start

Por padrão, o servidor aceita conexões só da própria máquina (127.0.0.1). Para mudar isso, use a variável de ambiente `HOST`.

## Como funciona

Cada categoria tem uma página própria (por exemplo, `/length`), com abas para navegar entre elas.

1. Um acesso normal à página (GET) mostra o formulário com o valor, a unidade de origem e a unidade de destino.
2. Ao clicar em **Convert**, o formulário é enviado (POST) para a própria página. O servidor valida os dados, faz a conversão e devolve a página já com o resultado.
3. O botão **Reset** volta ao formulário vazio.

Entradas inválidas, como valor vazio, texto no lugar de número ou unidade desconhecida, voltam a página com uma mensagem de erro, sem derrubar o servidor.

## Estrutura do projeto

    unit-converter/
    ├── server.js
    ├── package.json
    ├── .gitignore
    ├── README.md
    ├── public/
    │   └── style.css
    └── src/
        ├── converters/
        │   ├── index.js
        │   ├── currency.js
        │   ├── length.js
        │   ├── area.js
        │   ├── volume.js
        │   ├── weight.js
        │   ├── temperature.js
        │   ├── speed.js
        │   ├── pressure.js
        │   ├── power.js
        │   └── number-system.js
        └── views/
            ├── layout.js
            └── converter-page.js

- `server.js`: servidor HTTP, rotas, leitura do formulário e arquivos estáticos
- `src/converters/`: uma conversão por arquivo, mais o `index.js`, que reúne todas na ordem das abas
- `src/views/`: geração do HTML (layout com as abas e página do conversor)
- `public/`: arquivos estáticos, como o CSS

## Como adicionar uma nova categoria

1. Crie um arquivo em `src/converters/` que exporte um objeto neste formato:

        {
          slug: 'length',
          name: 'Length',
          units: [{ code: 'm', name: 'Meter' }],
          convert(value, from, to) { ... }
        }

   O `convert` pode ser assíncrono e devolve `{ result: 'texto' }` em caso de sucesso ou `{ error: 'mensagem' }` em caso de erro.

2. Registre a categoria na lista do `src/converters/index.js`. A ordem da lista define a ordem das abas.

## Segurança

- O servidor limita o tamanho do formulário e do valor digitado
- Só são servidos arquivos de dentro da pasta `public`, com proteção contra acesso a arquivos fora dela
- As respostas incluem cabeçalhos de segurança, como a política de conteúdo (CSP), por isso as páginas não usam estilos nem scripts inline