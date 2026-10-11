const { checkGrammar } = require('../services/grammarService');
const { 
  saveNoteContent, 
  listNotes, 
  getNoteContent, 
  renderMarkdownToHtml 
} = require('../services/noteService');

async function handleCheckGrammar(req, res) {
  try {
    const text = req.body.text || (req.file ? req.file.buffer.toString('utf8') : null);
    
    if (!text) {
      return res.status(400).json({ error: 'Nenhum texto ou arquivo fornecido para verificação gramatical.' });
    }

    const result = await checkGrammar(text);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleSaveNote(req, res) {
  try {
    let filename = req.body.filename;
    let content = req.body.content;

    // Se foi feito upload de um arquivo via multipart/form-data
    if (req.file) {
      filename = req.file.originalname;
      content = req.file.buffer.toString('utf8');
    }

    if (!filename || content === undefined) {
      return res.status(400).json({ error: 'Nome do arquivo (filename) e conteúdo (content) são obrigatórios.' });
    }

    const savedFilename = saveNoteContent(filename, content);
    return res.status(201).json({
      message: 'Nota salva com sucesso!',
      filename: savedFilename
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function handleListNotes(req, res) {
  try {
    const notes = listNotes();
    return res.json({ notes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function handleGetHtmlNote(req, res) {
  try {
    const { filename } = req.params;
    const htmlContent = renderMarkdownToHtml(filename);

    if (htmlContent === null) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    // Retorna o HTML renderizado diretamente
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlContent);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleCheckGrammar,
  handleSaveNote,
  handleListNotes,
  handleGetHtmlNote
};