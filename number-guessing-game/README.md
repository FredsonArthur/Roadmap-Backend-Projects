# Number Guessing Game

Projeto do [roadmap.sh](https://roadmap.sh/projects/number-guessing-game): um jogo de adivinhar o número no terminal. O computador sorteia um número entre 1 e 100 e você tem um número limitado de chances para acertar. Feito em Node.js, sem bibliotecas externas.

## Requisitos

- Node.js 14 ou superior

## Como jogar

Dentro da pasta do projeto:

    node number-guessing-game.js

Opcional: para usar o comando number-guessing-game diretamente, rode npm link nesta pasta.

### Dificuldades

| Opção | Nível | Chances |
|---|---|---|
| 1 | Easy | 10 |
| 2 | Medium | 5 |
| 3 | Hard | 3 |

Você pode escolher digitando o número ou o nome do nível (por exemplo, `2` ou `medium`).

### Durante a rodada

- Digite um número inteiro de 1 a 100 para chutar. O jogo informa se o número secreto é maior ou menor que o seu chute.
- Digite `hint` para pedir uma dica, até 2 por rodada: a primeira diz se o número é par ou ímpar, e a segunda mostra uma faixa de 20 números que contém o número secreto. Pedir dica não gasta chance.
- Entradas inválidas (letras, decimais, números fora do intervalo) não gastam chance.
- A rodada termina quando você acerta ou quando as chances acabam. Em seguida, o jogo pergunta se você quer jogar de novo.
- Use Ctrl+C ou Ctrl+D a qualquer momento para sair.

### Exemplo de partida

    Welcome to the Number Guessing Game!
    I'm thinking of a number between 1 and 100.
    The number of chances you get depends on the difficulty level.
    Type "hint" at any time to get a clue (up to 2 per round).

    Please select the difficulty level:
    1. Easy (10 chances)
    2. Medium (5 chances)
    3. Hard (3 chances)

    Enter your choice: 2

    Great! You have selected the Medium difficulty level.
    You have 5 chances to guess the correct number.
    Let's start the game!

    Enter your guess: 50
    Incorrect! The number is less than 50.

    Enter your guess: 25
    Incorrect! The number is greater than 25.

    Enter your guess: 35
    Incorrect! The number is less than 35.

    Enter your guess: 30
    Congratulations! You guessed the correct number in 4 attempts.
    Time: 18.4s
    New high score for Medium: 4 attempts in 18.4s!

## Recursos extras

- **Várias rodadas:** ao fim de cada rodada, o jogo pergunta se você quer continuar.
- **Cronômetro:** o tempo da rodada é mostrado ao ganhar ou perder.
- **Dicas:** até 2 por rodada, sem custo de chance.
- **Recordes:** o melhor resultado de cada dificuldade é salvo em high-scores.json, no diretório onde o jogo é executado. Vale o menor número de tentativas e, em caso de empate, o menor tempo. O arquivo é criado automaticamente na primeira vitória.

## Tratamento de erros

Escolha de dificuldade inválida, chutes inválidos, resposta inválida em "jogar de novo", high-scores.json corrompido (o jogo continua e recria o arquivo) e falha ao salvar o recorde (aparece um aviso e o jogo segue) são tratados sem encerrar o programa.