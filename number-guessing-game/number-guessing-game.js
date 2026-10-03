#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const MAX_HINTS = 2;
// Os recordes ficam no diretório atual (onde o jogo é executado)
const SCORES_FILE = path.join(process.cwd(), 'high-scores.json');

const DIFFICULTIES = [
  { key: 'easy', name: 'Easy', chances: 10 },
  { key: 'medium', name: 'Medium', chances: 5 },
  { key: 'hard', name: 'Hard', chances: 3 },
];

// ---------- Entrada do usuário ----------

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const bufferedLines = [];
let pendingResolve = null;
let inputClosed = false;

rl.on('line', (line) => {
  if (pendingResolve) {
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve(line);
  } else {
    bufferedLines.push(line);
  }
});

rl.on('close', () => {
  inputClosed = true;
  if (pendingResolve) {
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve(null);
  }
});

function readLine(prompt) {
  rl.setPrompt(prompt);
  rl.prompt();
  if (bufferedLines.length > 0) return Promise.resolve(bufferedLines.shift());
  if (inputClosed) return Promise.resolve(null);
  return new Promise((resolve) => {
    pendingResolve = resolve;
  });
}

// Encerra o jogo com educação se a entrada for fechada (Ctrl+C ou Ctrl+D)
async function ask(prompt) {
  const answer = await readLine(prompt);
  if (answer === null) {
    console.log('\nGoodbye!');
    process.exit(0);
  }
  return answer.trim();
}

// ---------- Utilitários ----------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------- Recordes ----------

function loadScores() {
  try {
    if (!fs.existsSync(SCORES_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (err) {
    return {};
  }
}

function saveScores(scores) {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning: could not save the high score.');
  }
}

function isValidScore(score) {
  return score && Number.isFinite(score.attempts) && Number.isFinite(score.seconds);
}

// Menos tentativas é melhor; em caso de empate, vence o menor tempo
function isBetterScore(current, best) {
  if (!isValidScore(best)) return true;
  if (current.attempts !== best.attempts) return current.attempts < best.attempts;
  return current.seconds < best.seconds;
}

function updateHighScore(difficulty, attempts, elapsedMs) {
  const scores = loadScores();
  const current = { attempts, seconds: Math.round(elapsedMs / 100) / 10 };
  const best = scores[difficulty.key];

  if (isBetterScore(current, best)) {
    scores[difficulty.key] = current;
    saveScores(scores);
    console.log(
      `New high score for ${difficulty.name}: ${plural(attempts, 'attempt', 'attempts')} in ${formatSeconds(elapsedMs)}!`
    );
  } else {
    console.log(
      `High score for ${difficulty.name}: ${plural(best.attempts, 'attempt', 'attempts')} in ${best.seconds.toFixed(1)}s.`
    );
  }
}

// ---------- Jogo ----------

function printWelcome() {
  console.log('Welcome to the Number Guessing Game!');
  console.log(`I'm thinking of a number between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
  console.log('The number of chances you get depends on the difficulty level.');
  console.log(`Type "hint" at any time to get a clue (up to ${MAX_HINTS} per round).`);
}

async function chooseDifficulty() {
  console.log('\nPlease select the difficulty level:');
  DIFFICULTIES.forEach((d, i) => console.log(`${i + 1}. ${d.name} (${d.chances} chances)`));
  console.log('');

  while (true) {
    const choice = (await ask('Enter your choice: ')).toLowerCase();
    const difficulty = DIFFICULTIES.find((d, i) => choice === String(i + 1) || choice === d.key);
    if (difficulty) return difficulty;
    console.log('Invalid choice. Enter 1, 2 or 3.');
  }
}

function buildHint(secret, hintsUsed) {
  if (hintsUsed === 0) {
    return `Hint: the number is ${secret % 2 === 0 ? 'even' : 'odd'}.`;
  }
  const low = Math.max(MIN_NUMBER, secret - randomInt(0, 19));
  const high = Math.min(MAX_NUMBER, low + 19);
  return `Hint: the number is between ${low} and ${high}.`;
}

async function playRound() {
  const secret = randomInt(MIN_NUMBER, MAX_NUMBER);
  const difficulty = await chooseDifficulty();

  console.log(`\nGreat! You have selected the ${difficulty.name} difficulty level.`);
  console.log(`You have ${difficulty.chances} chances to guess the correct number.`);
  console.log("Let's start the game!");

  let attempts = 0;
  let hintsUsed = 0;
  const startTime = Date.now();

  while (attempts < difficulty.chances) {
    console.log('');
    const input = (await ask('Enter your guess: ')).toLowerCase();

    if (input === 'hint') {
      if (hintsUsed >= MAX_HINTS) {
        console.log('No more hints for this round.');
      } else {
        console.log(buildHint(secret, hintsUsed));
        hintsUsed++;
      }
      continue;
    }

    const guess = Number(input);
    if (!/^\d+$/.test(input) || guess < MIN_NUMBER || guess > MAX_NUMBER) {
      console.log(`Please enter a whole number between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
      continue;
    }

    attempts++;

    if (guess === secret) {
      const elapsed = Date.now() - startTime;
      console.log(
        `Congratulations! You guessed the correct number in ${plural(attempts, 'attempt', 'attempts')}.`
      );
      console.log(`Time: ${formatSeconds(elapsed)}`);
      updateHighScore(difficulty, attempts, elapsed);
      return;
    }

    console.log(`Incorrect! The number is ${secret < guess ? 'less' : 'greater'} than ${guess}.`);
  }

  console.log(`\nGame over! You ran out of chances. The number was ${secret}.`);
  console.log(`Time: ${formatSeconds(Date.now() - startTime)}`);
}

async function askPlayAgain() {
  while (true) {
    const answer = (await ask('\nDo you want to play again? (y/n): ')).toLowerCase();
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    console.log('Please answer y or n.');
  }
}

async function main() {
  printWelcome();

  let playing = true;
  while (playing) {
    await playRound();
    playing = await askPlayAgain();
  }

  console.log('\nThanks for playing! Goodbye.');
  rl.close();
}

main();