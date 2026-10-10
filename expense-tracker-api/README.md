# Expense Tracker API

Uma API RESTful robusta e segura para gerenciamento de despesas pessoais, desenvolvida com **Node.js** e **Express** como parte dos projetos do [roadmap.sh](https://roadmap.sh/backend/projects). O projeto implementa arquitetura modular em camadas, autenticação baseada em **JWT (JSON Web Token)**, criptografia com **bcrypt**, isolamento estrito de dados por utilizador, categorias pré-definidas e filtros temporais avançados.

---

## 🚀 Tecnologias Utilizadas

* **Node.js** (v22+)
* **Express** (Framework web minimalista e rápido)
* **JWT (jsonwebtoken)** (Autenticação segura baseada em sessões stateless)
* **bcrypt** (Hash seguro para proteção de senhas)
* **CORS** (Habilitação de requisições de origens cruzadas)
* **Armazenamento Local** (`database.json` via File System)

---

## 📂 Arquitetura do Projeto

O projeto adota uma evolução limpa da arquitetura **MVC** (Model-View-Controller), incorporando uma camada de serviços dedicada para isolar a lógica de negócio, regras de filtros e manipulação de persistência:

```text
expense-tracker-api/
├── src/
│   ├── config/        # Configurações centralizadas de ambiente (.env)
│   ├── controllers/   # Tratamento de requisições HTTP e códigos de status
│   ├── middlewares/   # Middleware de validação e proteção de rotas (JWT)
│   ├── models/        # Camada de persistência (leitura/escrita no JSON)
│   ├── routes/        # Definição e mapeamento das rotas da API
│   ├── services/      # Lógica de negócio, validações e filtros temporais
│   └── server.js      # Ponto de entrada e inicialização do servidor Express
├── database.json      # Base de dados local em arquivo JSON
├── package.json
└── .env
```

---

## ⚙️ Como Instalar e Rodar o Projeto

1. **Navegue até a pasta do projeto:**
   ```bash
   cd expense-tracker-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz da pasta `expense-tracker-api` com o seguinte conteúdo:
   ```env
   PORT=3000
   JWT_SECRET=sua_chave_secreta_super_segura_para_expenses
   ```

4. **Inicie o servidor em modo de desenvolvimento (com hot-reload):**
   ```bash
   npm run dev
   ```

O servidor estará rodando em `http://localhost:3000`.

---

## 📡 Endpoints da API

### 1. Autenticação (Público)

* **Registar Novo Utilizador**
  * **POST** `/register`
  * **Body (JSON):**
    ```json
    {
      "name": "Seu Nome",
      "email": "seuemail@email.com",
      "password": "suasenhasegura"
    }
    ```
  * **Retorno:** `201 Created` contendo o token JWT de acesso.

* **Fazer Login**
  * **POST** `/login`
  * **Body (JSON):**
    ```json
    {
      "email": "seuemail@email.com",
      "password": "suasenhasegura"
    }
    ```
  * **Retorno:** `200 OK` contendo o token JWT.

---

### 2. Gestão de Despesas (Requer Autenticação via Bearer Token)

*Todas as rotas abaixo exigem o cabeçalho HTTP: `Authorization: Bearer <SEU_TOKEN>`.*

* **Criar Despesa**
  * **POST** `/expenses`
  * **Body (JSON):**
    ```json
    {
      "title": "Supermercado Mensal",
      "amount": 250.00,
      "category": "Groceries",
      "date": "2026-06-10"
    }
    ```
  * **Retorno:** `201 Created` com os dados da despesa criada.

* **Listar e Filtrar Despesas**
  * **GET** `/expenses` ou com filtros temporais:
    * `/expenses?filter=past_week` (Última semana)
    * `/expenses?filter=past_month` (Último mês)
    * `/expenses?filter=last_3_months` (Últimos 3 meses)
    * `/expenses?filter=custom&startDate=2026-01-01&endDate=2026-06-01` (Período personalizado)
  * **Retorno:** `200 OK` com o total de registos e a lista filtrada.

* **Atualizar Despesa**
  * **PUT** `/expenses/:id`
  * **Body (JSON):** (Campos opcionais para atualização parcial/total)
    ```json
    {
      "title": "Supermercado Extra",
      "amount": 280.00
    }
    ```
  * **Retorno:** `200 OK` com a despesa atualizada.

* **Deletar Despesa**
  * **DELETE** `/expenses/:id`
  * **Retorno:** `204 No Content`.

---

## 🏷️ Categorias Pré-definidas
As despesas devem obrigatoriamente pertencer a uma das seguintes categorias permitidas:
* `Groceries`
* `Leisure`
* `Electronics`
* `Utilities`
* `Clothing`
* `Health`
* `Others`

---

## 🛡️ Segurança e Regras de Negócio
* **Isolamento de Dados:** Cada utilizador possui acesso exclusivo apenas às suas próprias despesas (validação rigorosa de `userId` extraído do payload do token JWT).
* **Proteção de Acesso:** Tentativas de alterar, visualizar ou remover despesas de outros utilizadores resultam em respostas `403 Forbidden`. Requisições sem token válido retornam `401 Unauthorized`.