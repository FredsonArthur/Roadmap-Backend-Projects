const express = require('express');
const {
  handleCreate,
  handleGetOriginal,
  handleRedirect,
  handleUpdate,
  handleDelete,
  handleGetStats
} = require('../controllers/urlController');

const router = express.Router();

router.post('/shorten', handleCreate);
router.get('/shorten/:shortCode', handleGetOriginal);
router.get('/shorten/:shortCode/stats', handleGetStats);
router.put('/shorten/:shortCode', handleUpdate);
router.delete('/shorten/:shortCode', handleDelete);

// Rota de redirecionamento direto (ex: GET /abc123)
router.get('/:shortCode', handleRedirect);

module.exports = router;