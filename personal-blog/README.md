# Personal Blog

Uma aplicação de blog pessoal desenvolvida como um projeto de backend do [roadmap.sh](https://roadmap.sh/) para praticar conceitos fundamentais de desenvolvimento web no lado do servidor.

O projeto possui uma área pública, onde os visitantes podem visualizar os artigos publicados, e uma área administrativa protegida por autenticação, onde é possível criar, editar e excluir artigos.

## Funcionalidades

### Área Pública

- Visualizar todos os artigos publicados.
- Visualizar um artigo individualmente.
- Exibir a data de publicação dos artigos.
- Interface responsiva utilizando HTML e CSS.

### Área Administrativa

- Autenticação utilizando HTTP Basic Authentication.
- Dashboard administrativo com a lista de artigos.
- Criar novos artigos.
- Editar artigos existentes.
- Excluir artigos.
- Validar título, conteúdo e data de publicação.

### Armazenamento

Os artigos são armazenados no sistema de arquivos como arquivos JSON individuais.

Cada artigo possui:

- `id`
- `title`
- `content`
- `date`

## Tecnologias

- Node.js
- JavaScript
- HTML
- CSS
- Sistema de arquivos (`fs`)
- HTTP Basic Authentication
- Server-Side Rendering

O projeto não utiliza dependências externas.

## Estrutura do Projeto

```text
personal-blog/
├── data/
│   └── articles/
├── public/
│   └── style.css
├── src/
│   ├── auth.js
│   ├── articles.js
│   └── views/
│       ├── admin.js
│       ├── article.js
│       ├── edit-article.js
│       ├── home.js
│       ├── layout.js
│       └── new-article.js
├── .gitignore
├── package.json
├── README.md
└── server.js
````

## Como Executar

### Requisitos

* Node.js 18 ou superior.

### Iniciar a aplicação

Entre no diretório do projeto:

```bash
cd personal-blog
```

Inicie o servidor:

```bash
npm start
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Utilizando o Blog

### Blog Público

Acesse:

```text
http://localhost:3000
```

A página inicial exibe os artigos publicados.

Ao clicar em um artigo, é possível visualizar seu conteúdo completo.

### Dashboard Administrativo

Acesse:

```text
http://localhost:3000/admin
```

A aplicação utiliza HTTP Basic Authentication para proteger a área administrativa.

As credenciais padrão são:

```text
Usuário: admin
Senha: admin123
```

Após a autenticação, o dashboard permite:

* Adicionar um artigo.
* Editar um artigo.
* Excluir um artigo.
* Visualizar o blog público.

## Variáveis de Ambiente

As credenciais administrativas padrão podem ser alteradas utilizando variáveis de ambiente:

```text
ADMIN_USERNAME
ADMIN_PASSWORD
```

Caso essas variáveis não sejam definidas, a aplicação utilizará:

```text
Usuário: admin
Senha: admin123
```

## Armazenamento dos Dados

Os artigos são armazenados no diretório:

```text
data/articles/
```

Cada artigo é salvo em um arquivo `.json` separado.

Exemplo:

```json
{
  "id": "1234567890-example",
  "title": "Meu Primeiro Artigo",
  "content": "Este é o conteúdo do meu primeiro artigo.",
  "date": "2026-10-03"
}
```

## Objetivo do Projeto

Este projeto foi desenvolvido para praticar conceitos fundamentais de desenvolvimento backend, incluindo:

* Server-Side Rendering.
* Roteamento.
* Formulários HTML.
* Manipulação de dados enviados por formulários.
* Armazenamento no sistema de arquivos.
* Operações CRUD.
* Autenticação HTTP Basic.
* Templates HTML.
* Servir arquivos estáticos.
* Validação básica de dados.

## Possíveis Melhorias Futuras

Algumas funcionalidades que podem ser adicionadas futuramente:

* Suporte a Markdown.
* Comentários.
* Categorias.
* Tags.
* Busca de artigos.
* Paginação.
* Sistema de autenticação mais completo.
* Suporte a imagens.
* Rascunhos de artigos.
* Editor de texto rico.

## Licença

Este projeto está disponível sob a licença MIT.

```
