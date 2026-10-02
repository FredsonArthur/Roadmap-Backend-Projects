# Expense Tracker

Projeto do [roadmap.sh](https://roadmap.sh/projects/expense-tracker): uma CLI para controlar despesas, com armazenamento em um arquivo JSON. Feito em Node.js, sem bibliotecas externas.

## Requisitos

- Node.js 14 ou superior

## Como usar

Dentro da pasta do projeto:

    node expense-tracker.js <comando> [opções]

Opcional: para usar o comando expense-tracker diretamente, rode npm link nesta pasta.

### Comandos

Adicionar (a categoria é opcional e o padrão é General):

    expense-tracker add --description "Lunch" --amount 20
    expense-tracker add --description "Cinema" --amount 35.50 --category Lazer

Atualizar e remover:

    expense-tracker update --id 1 --amount 25
    expense-tracker update --id 1 --description "Brunch" --category Food
    expense-tracker delete --id 2

Listar (com filtro opcional por categoria):

    expense-tracker list
    expense-tracker list --category Lazer

Resumo do total, geral ou de um mês do ano atual:

    expense-tracker summary
    expense-tracker summary --month 8
    expense-tracker summary --category Food

Orçamento mensal (avisa quando o total do mês ultrapassa o valor):

    expense-tracker budget --month 8 --amount 500

Exportar para CSV:

    expense-tracker export
    expense-tracker export --file minhas-despesas.csv

### Exemplo de saída

    ID  Date        Description  Category  Amount
    1   2026-08-06  Lunch        General   $20
    2   2026-08-06  Dinner       General   $10

    Total expenses: $30
    Total expenses for August: $30

## Armazenamento

As despesas ficam em expenses.json, no diretório onde o comando é executado. O arquivo é criado automaticamente se não existir. Cada despesa tem id, date, description, category e amount, e os orçamentos ficam em um campo separado, por mês.

## Tratamento de erros

Valores negativos, zerados ou com formato inválido (por exemplo, vírgula no lugar do ponto), descrição vazia, IDs inexistentes, mês fora de 1 a 12, opções desconhecidas ou sem valor, e expenses.json corrompido geram uma mensagem de erro clara.