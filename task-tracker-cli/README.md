# Task Tracker CLI

Projeto do [roadmap.sh](https://roadmap.sh/projects/task-tracker): uma CLI para gerenciar tarefas, com armazenamento em um arquivo JSON. Feito em Node.js, sem bibliotecas externas.

## Requisitos

- Node.js 14 ou superior

## Como usar

Dentro da pasta do projeto:

    node task-cli.js <comando> [argumentos]

Opcional: para usar o comando task-cli diretamente, rode npm link nesta pasta.

### Comandos

Adicionar:

    task-cli add "Buy groceries"

Atualizar e remover:

    task-cli update 1 "Buy groceries and cook dinner"
    task-cli delete 1

Mudar status:

    task-cli mark-in-progress 1
    task-cli mark-done 1

Listar:

    task-cli list
    task-cli list todo
    task-cli list in-progress
    task-cli list done

## Armazenamento

As tarefas ficam em tasks.json, no diretório onde o comando é executado. O arquivo é criado automaticamente se não existir.

Cada tarefa tem:

| Campo | Descrição |
|---|---|
| id | Identificador único |
| description | Descrição da tarefa |
| status | todo, in-progress ou done |
| createdAt | Data/hora de criação (ISO 8601) |
| updatedAt | Data/hora da última atualização (ISO 8601) |

## Tratamento de erros

IDs inexistentes ou inválidos, descrição vazia, comandos desconhecidos, filtros inválidos e tasks.json corrompido geram uma mensagem de erro clara.