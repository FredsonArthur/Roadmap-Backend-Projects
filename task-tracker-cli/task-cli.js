#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// O arquivo de tarefas fica no diretório atual (onde o comando é executado)
const TASKS_FILE = path.join(process.cwd(), 'tasks.json');
const STATUSES = ['todo', 'in-progress', 'done'];

// ---------- Persistência ----------

function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, '[]', 'utf8');
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8') || '[]');
    if (!Array.isArray(data)) throw new Error('invalid format');
    return data;
  } catch (err) {
    fail(`Could not read tasks.json (${err.message}). Fix or delete the file and try again.`);
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// ---------- Utilitários ----------

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseId(value) {
  if (value === undefined) fail('Missing task ID.');
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) fail(`Invalid task ID: "${value}".`);
  return id;
}

function findTask(tasks, id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) fail(`Task with ID ${id} not found.`);
  return task;
}

function requireDescription(value) {
  if (value === undefined || value.trim() === '') fail('Missing task description.');
  return value.trim();
}

// ---------- Comandos ----------

function addTask(description) {
  const desc = requireDescription(description);
  const tasks = loadTasks();
  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const now = new Date().toISOString();
  tasks.push({ id, description: desc, status: 'todo', createdAt: now, updatedAt: now });
  saveTasks(tasks);
  console.log(`Task added successfully (ID: ${id})`);
}

function updateTask(idArg, description) {
  const id = parseId(idArg);
  const desc = requireDescription(description);
  const tasks = loadTasks();
  const task = findTask(tasks, id);
  task.description = desc;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Task ${id} updated successfully`);
}

function deleteTask(idArg) {
  const id = parseId(idArg);
  const tasks = loadTasks();
  findTask(tasks, id);
  saveTasks(tasks.filter((t) => t.id !== id));
  console.log(`Task ${id} deleted successfully`);
}

function markTask(idArg, status) {
  const id = parseId(idArg);
  const tasks = loadTasks();
  const task = findTask(tasks, id);
  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Task ${id} marked as ${status}`);
}

function listTasks(filter) {
  if (filter !== undefined && !STATUSES.includes(filter)) {
    fail(`Invalid status "${filter}". Use: ${STATUSES.join(', ')}.`);
  }
  const tasks = loadTasks();
  const result = filter ? tasks.filter((t) => t.status === filter) : tasks;

  if (result.length === 0) {
    console.log('No tasks found.');
    return;
  }
  result.forEach((t) => {
    console.log(`[${t.id}] ${t.description}`);
    console.log(`     status: ${t.status} | created: ${t.createdAt} | updated: ${t.updatedAt}`);
  });
}

function showHelp() {
  console.log(`Usage: task-cli <command> [arguments]

Commands:
  add "description"              Add a new task
  update <id> "description"      Update a task description
  delete <id>                    Delete a task
  mark-in-progress <id>          Mark a task as in progress
  mark-done <id>                 Mark a task as done
  list                           List all tasks
  list todo                      List tasks not started
  list in-progress               List tasks in progress
  list done                      List completed tasks`);
}

// ---------- Entrada ----------

function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'add':
      return addTask(args[0]);
    case 'update':
      return updateTask(args[0], args[1]);
    case 'delete':
      return deleteTask(args[0]);
    case 'mark-in-progress':
      return markTask(args[0], 'in-progress');
    case 'mark-done':
      return markTask(args[0], 'done');
    case 'list':
      return listTasks(args[0]);
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      return showHelp();
    default:
      fail(`Unknown command "${command}". Run "task-cli help" to see the available commands.`);
  }
}

main();