# Todo List API

Uma API RESTful completa e segura para gerenciamento de tarefas (Todo List), desenvolvida com **Node.js** e **Express**, seguindo os padrões do roadmap.sh. O projeto conta com autenticação baseada em **JWT (JSON Web Token)**, criptografia de senhas com **bcrypt**, paginação de resultados, isolamento de dados por usuário e persistência local em arquivo JSON.

---

## 🚀 Tecnologias Utilizadas

* **Node.js** (v22+)
* **Express** (Framework web)
* **JWT (jsonwebtoken)** (Autenticação e controle de sessão)
* **bcrypt** (Hash seguro de senhas)
* **CORS** (Habilitação de requisições de origens cruzadas)
* **Armazenamento Local** (`database.json`)

---

## 📂 Arquitetura do Projeto

O projeto segue a arquitetura **MVC** combinada com separação de camadas de serviço para manutenibilidade e clareza:

```text
todo-list-api/
├── src/
│   ├── config/        # Configurações centralizadas de ambiente
│   ├── controllers/   # Lógica de controle de rotas e requisições HTTP
│   ├── middlewares/   # Middlewares de autenticação e validação
│   ├── models/        # Camada de persistência e leitura/escrita no JSON
│   ├── routes/        # Definição das rotas da API
│   ├── services/      # Regras de negócio da aplicação
│   └── server.js      # Ponto de entrada da aplicação
├── database.json      # Banco de dados local em arquivo
├── package.json
└── .env
```

⚙️ Como Instalar e Rodar o Projeto

    Clone o repositório ou navegue até a pasta do projeto:
    Bash

    cd todo-list-api

    Instale as dependências:
    Bash

    npm install

    Configure as variáveis de ambiente:
    Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:
    Snippet de código

    PORT=3000
    JWT_SECRET=sua_chave_secreta_super_segura

    Inicie o servidor em modo de desenvolvimento (com hot-reload):
    Bash

    npm run dev

O servidor estará rodando em http://localhost:3000.
📡 Endpoints da API
1. Autenticação

    Registrar Usuário

        POST /register

        Body (JSON):
        JSON

        {
          "name": "Seu Nome",
          "email": "seuemail@email.com",
          "password": "suasenhasegura"
        }

        Retorno: 201 Created contendo o token JWT.

    Fazer Login

        POST /login

        Body (JSON):
        JSON

        {
          "email": "seuemail@email.com",
          "password": "suasenhasegura"
        }

        Retorno: 200 OK contendo o token JWT.

2. Tarefas (Requer Autenticação via Bearer Token)

Todas as rotas abaixo exigem o cabeçalho Authorization: Bearer <SEU_TOKEN>.

    Criar Tarefa

        POST /todos

        Body (JSON):
        JSON

        {
          "title": "Estudar Node.js",
          "description": "Finalizar os módulos do roadmap.sh"
        }

        Retorno: 201 Created com os dados da tarefa criada.

    Listar Tarefas (com paginação)

        GET /todos?page=1&limit=10

        Retorno: 200 OK com a lista paginada e o total de tarefas do usuário.

    Atualizar Tarefa

        PUT /todos/:id

        Body (JSON): (Campos opcionais)
        JSON

        {
          "title": "Estudar Node.js Avançado",
          "description": "Praticar arquitetura em camadas"
        }

        Retorno: 200 OK com a tarefa atualizada.

    Deletar Tarefa

        DELETE /todos/:id

        Retorno: 204 No Content.

🛡️ Segurança e Regras de Negócio

    Isolamento de Dados: Cada usuário possui acesso exclusivo apenas às suas próprias tarefas (filtradas por userId associado ao token JWT).

    Proteção de Rotas: Tentativas de alterar ou deletar tarefas de outros usuários retornam status 403 Forbidden. Requisições sem token válido retornam 401 Unauthorized.