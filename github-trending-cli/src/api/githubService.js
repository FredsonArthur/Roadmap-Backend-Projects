const axios = require('axios');
const { getDateFromDuration } = require('../utils/dateHelper');

async function fetchTrendingRepositories(duration, limit) {
  const formattedDate = getDateFromDuration(duration);
  const query = `created:>=${formattedDate}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'github-trending-cli'
      }
    });

    return response.data.items;
  } catch (error) {
    if (error.response) {
      throw new Error(`Erro na API do GitHub (${error.response.status}): ${error.response.data.message || 'Erro desconhecido'}`);
    } else if (error.request) {
      throw new Error('Não foi possível comunicar com a API do GitHub. Verifique a sua ligação à internet.');
    } else {
      throw new Error(`Erro inesperado: ${error.message}`);
    }
  }
}

module.exports = { fetchTrendingRepositories };