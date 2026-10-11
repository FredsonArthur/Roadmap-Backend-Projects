const express = require('express');
const multer = require('multer');
const { 
  handleCheckGrammar, 
  handleSaveNote, 
  handleListNotes, 
  handleGetHtmlNote 
} = require('../controllers/noteController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoints exigidos pelo projeto
router.post('/grammar', upload.single('file'), handleCheckGrammar);
router.post('/notes', upload.single('file'), handleSaveNote);
router.get('/notes', handleListNotes);
router.get('/notes/:filename/html', handleGetHtmlNote);

module.exports = router;