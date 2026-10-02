#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Os dados ficam no diretório atual (onde o comando é executado)
const DATA_FILE = path.join(process.cwd(), 'expenses.json');
const DEFAULT_CATEGORY = 'General';
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---------- Utilitários ----------

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Data local no formato YYYY-MM-DD
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatMoney(n) {
  const value = round2(n);
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function sum(expenses) {
  return round2(expenses.reduce((total, e) => total + e.amount, 0));
}

// ---------- Validações ----------

function parseAmount(value) {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    fail('Amount must be a positive number (use a dot for decimals, e.g. 10.50).');
  }
  const amount = round2(Number(value));
  if (amount <= 0) fail('Amount must be greater than zero.');
  return amount;
}

function parseId(value) {
  if (!/^\d+$/.test(value) || Number(value) <= 0) fail(`Invalid expense ID: "${value}".`);
  return Number(value);
}

function parseMonth(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 12) {
    fail(`Invalid month: "${value}". Use a number from 1 to 12.`);
  }
  return Number(value);
}

function parseText(value, label) {
  if (value.trim() === '') fail(`${label} cannot be empty.`);
  return value.trim();
}

// Converte ["--description", "Lunch", "--amount", "20"] em { description: "Lunch", amount: "20" }
function parseOptions(args, allowed) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) fail(`Unexpected argument "${arg}".`);
    const key = arg.slice(2);
    if (!allowed.includes(key)) {
      fail(`Unknown option "--${key}". Allowed: ${allowed.map((a) => `--${a}`).join(', ')}.`);
    }
    const value = args[i + 1];
    if (value === undefined || value.startsWith('--')) fail(`Option "--${key}" requires a value.`);
    options[key] = value;
    i++;
  }
  return options;
}

function requireOptions(options, keys) {
  keys.forEach((key) => {
    if (options[key] === undefined) fail(`Missing required option "--${key}".`);
  });
}

// ---------- Persistência ----------

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const empty = { expenses: [], budgets: {} };
    saveData(empty);
    return empty;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8').trim() || '{}');
    if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error('invalid format');
    if (data.expenses === undefined) data.expenses = [];
    if (!Array.isArray(data.expenses)) throw new Error('invalid format');
    if (typeof data.budgets !== 'object' || data.budgets === null || Array.isArray(data.budgets)) {
      data.budgets = {};
    }
    return data;
  } catch (err) {
    fail(`Could not read expenses.json (${err.message}). Fix or delete the file and try again.`);
  }
}

// ---------- Regras de negócio ----------

function expensesOfMonth(expenses, year, month) {
  const prefix = `${year}-${pad2(month)}`;
  return expenses.filter((e) => e.date.startsWith(prefix));
}

function findExpense(data, id) {
  const expense = data.expenses.find((e) => e.id === id);
  if (!expense) fail(`Expense with ID ${id} not found.`);
  return expense;
}

// Avisa se o total do mês passou do orçamento definido
function warnIfOverBudget(data, year, month) {
  const budget = data.budgets[`${year}-${pad2(month)}`];
  if (budget === undefined) return;
  const total = sum(expensesOfMonth(data.expenses, year, month));
  if (total > budget) {
    console.warn(
      `Warning: you exceeded the ${MONTHS[month - 1]} budget (${formatMoney(budget)}) by ${formatMoney(total - budget)}.`
    );
  }
}

// ---------- Comandos ----------

function addExpense(args) {
  const options = parseOptions(args, ['description', 'amount', 'category']);
  requireOptions(options, ['description', 'amount']);

  const data = loadData();
  const id = data.expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  const date = todayString();
  data.expenses.push({
    id,
    date,
    description: parseText(options.description, 'Description'),
    category: options.category !== undefined ? parseText(options.category, 'Category') : DEFAULT_CATEGORY,
    amount: parseAmount(options.amount),
  });
  saveData(data);
  console.log(`Expense added successfully (ID: ${id})`);
  warnIfOverBudget(data, Number(date.slice(0, 4)), Number(date.slice(5, 7)));
}

function updateExpense(args) {
  const options = parseOptions(args, ['id', 'description', 'amount', 'category']);
  requireOptions(options, ['id']);
  if (options.description === undefined && options.amount === undefined && options.category === undefined) {
    fail('Nothing to update. Use --description, --amount or --category.');
  }

  const id = parseId(options.id);
  const data = loadData();
  const expense = findExpense(data, id);

  if (options.description !== undefined) expense.description = parseText(options.description, 'Description');
  if (options.amount !== undefined) expense.amount = parseAmount(options.amount);
  if (options.category !== undefined) expense.category = parseText(options.category, 'Category');
  saveData(data);
  console.log('Expense updated successfully');
  warnIfOverBudget(data, Number(expense.date.slice(0, 4)), Number(expense.date.slice(5, 7)));
}

function deleteExpense(args) {
  const options = parseOptions(args, ['id']);
  requireOptions(options, ['id']);

  const id = parseId(options.id);
  const data = loadData();
  findExpense(data, id);
  data.expenses = data.expenses.filter((e) => e.id !== id);
  saveData(data);
  console.log('Expense deleted successfully');
}

function listExpenses(args) {
  const options = parseOptions(args, ['category']);
  const data = loadData();
  let expenses = data.expenses;

  if (options.category !== undefined) {
    const category = options.category.trim().toLowerCase();
    expenses = expenses.filter((e) => e.category.toLowerCase() === category);
  }
  if (expenses.length === 0) {
    console.log('No expenses found.');
    return;
  }

  const rows = expenses.map((e) => [String(e.id), e.date, e.description, e.category, formatMoney(e.amount)]);
  const header = ['ID', 'Date', 'Description', 'Category', 'Amount'];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const line = (cols) => cols.map((c, i) => c.padEnd(widths[i])).join('  ').trimEnd();

  console.log(line(header));
  rows.forEach((r) => console.log(line(r)));
}

function showSummary(args) {
  const options = parseOptions(args, ['month', 'category']);
  const data = loadData();
  const year = new Date().getFullYear();
  let expenses = data.expenses;
  let label = 'Total expenses';
  let month;

  if (options.month !== undefined) {
    month = parseMonth(options.month);
    expenses = expensesOfMonth(expenses, year, month);
    label += ` for ${MONTHS[month - 1]}`;
  }
  if (options.category !== undefined) {
    const category = options.category.trim().toLowerCase();
    expenses = expenses.filter((e) => e.category.toLowerCase() === category);
    label += ` (${options.category.trim()})`;
  }

  console.log(`${label}: ${formatMoney(sum(expenses))}`);

  // Mostra o orçamento do mês quando o resumo não está filtrado por categoria
  if (month !== undefined && options.category === undefined) {
    const budget = data.budgets[`${year}-${pad2(month)}`];
    if (budget !== undefined) {
      const total = sum(expenses);
      console.log(`Budget for ${MONTHS[month - 1]}: ${formatMoney(budget)}`);
      if (total > budget) warnIfOverBudget(data, year, month);
      else console.log(`Remaining: ${formatMoney(budget - total)}`);
    }
  }
}

function setBudget(args) {
  const options = parseOptions(args, ['month', 'amount']);
  requireOptions(options, ['month', 'amount']);

  const month = parseMonth(options.month);
  const amount = parseAmount(options.amount);
  const year = new Date().getFullYear();
  const data = loadData();
  data.budgets[`${year}-${pad2(month)}`] = amount;
  saveData(data);
  console.log(`Budget for ${MONTHS[month - 1]} set to ${formatMoney(amount)}`);
  warnIfOverBudget(data, year, month);
}

function csvField(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportExpenses(args) {
  const options = parseOptions(args, ['file']);
  const target = path.resolve(process.cwd(), options.file !== undefined ? options.file : 'expenses.csv');
  if (target === DATA_FILE) fail('The export file cannot be expenses.json.');

  const data = loadData();
  const lines = ['ID,Date,Description,Category,Amount'];
  data.expenses.forEach((e) => {
    lines.push([e.id, e.date, e.description, e.category, e.amount].map(csvField).join(','));
  });
  try {
    fs.writeFileSync(target, lines.join('\n') + '\n', 'utf8');
  } catch (err) {
    fail(`Could not write ${options.file || 'expenses.csv'} (${err.code || err.message}).`);
  }
  console.log(`Exported ${data.expenses.length} expense(s) to ${path.basename(target)}`);
}

function showHelp() {
  console.log(`Usage: expense-tracker <command> [options]

Commands:
  add --description "Lunch" --amount 20 [--category Food]   Add an expense
  update --id 1 [--description ...] [--amount ...] [--category ...]
                                                            Update an expense
  delete --id 1                                             Delete an expense
  list [--category Food]                                    List expenses
  summary [--month 8] [--category Food]                     Show total expenses
  budget --month 8 --amount 500                             Set a monthly budget
  export [--file expenses.csv]                              Export expenses to CSV`);
}

// ---------- Entrada ----------

function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'add':
      return addExpense(args);
    case 'update':
      return updateExpense(args);
    case 'delete':
      return deleteExpense(args);
    case 'list':
      return listExpenses(args);
    case 'summary':
      return showSummary(args);
    case 'budget':
      return setBudget(args);
    case 'export':
      return exportExpenses(args);
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      return showHelp();
    default:
      fail(`Unknown command "${command}". Run "expense-tracker help" to see the available commands.`);
  }
}

main();