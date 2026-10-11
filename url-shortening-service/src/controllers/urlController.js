const {
  createShortUrl,
  getUrlByShortCode,
  updateShortUrl,
  deleteShortUrl
} = require('../services/urlService');

function handleCreate(req, res) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required in request body.' });
    }

    const newUrlObj = createShortUrl(url);
    return res.status(201).json(newUrlObj);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

function handleGetOriginal(req, res) {
  try {
    const { shortCode } = req.params;
    // Incrementa o accessCount ao recuperar a URL para redirecionamento
    const urlObj = getUrlByShortCode(shortCode, true);

    if (!urlObj) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    return res.status(200).json(urlObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    const urlObj = getUrlByShortCode(shortCode, true);

    if (!urlObj) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    // Redirecionamento 301 para a URL original
    return res.redirect(301, urlObj.url);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function handleUpdate(req, res) {
  try {
    const { shortCode } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'New URL is required in request body.' });
    }

    const updatedObj = updateShortUrl(shortCode, url);

    if (!updatedObj) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    return res.status(200).json(updatedObj);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

function handleDelete(req, res) {
  try {
    const { shortCode } = req.params;
    const success = deleteShortUrl(shortCode);

    if (!success) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function handleGetStats(req, res) {
  try {
    const { shortCode } = req.params;
    // Não incrementa accessCount ao buscar estatísticas
    const urlObj = getUrlByShortCode(shortCode, false);

    if (!urlObj) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    return res.status(200).json(urlObj);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleCreate,
  handleGetOriginal,
  handleRedirect,
  handleUpdate,
  handleDelete,
  handleGetStats
};