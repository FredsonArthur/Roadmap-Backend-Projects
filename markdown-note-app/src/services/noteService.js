const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const NOTES_DIR = path.join(__dirname, '../../uploads');

// Garantir que a pasta de uploads existe
if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR, { recursive: true });
}

function saveNoteContent(filename, content) {
  const safeName = filename.endsWith('.md') ? filename : `${filename}.md`;
  const filePath = path.join(NOTES_DIR, safeName);
  fs.writeFileSync(filePath, content, 'utf8');
  return safeName;
}

function listNotes() {
  const files = fs.readdirSync(NOTES_DIR);
  return files.filter(file => file.endsWith('.md')).map(file => {
    const stats = fs.statSync(path.join(NOTES_DIR, file));
    return {
      filename: file,
      size: stats.size,
      createdAt: stats.birthtime
    };
  });
}

function getNoteContent(filename) {
  const filePath = path.join(NOTES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function renderMarkdownToHtml(filename) {
  const content = getNoteContent(filename);
  if (content === null) {
    return null;
  }
  return marked.parse(content);
}

module.exports = {
  saveNoteContent,
  listNotes,
  getNoteContent,
  renderMarkdownToHtml
};