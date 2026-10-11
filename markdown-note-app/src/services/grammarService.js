const axios = require('axios');
const qs = require('qs');

async function checkGrammar(text) {
  try {
    const response = await axios.post('https://api.languagetool.org/v2/check', 
      qs.stringify({
        text: text,
        language: 'auto'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const matches = response.data.matches.map(match => ({
      message: match.message,
      shortMessage: match.shortMessage,
      offset: match.offset,
      length: match.length,
      replacements: match.replacements.map(rep => rep.value).slice(0, 5),
      context: match.context
    }));

    return {
      totalErrors: matches.length,
      errors: matches
    };
  } catch (error) {
    console.error('Erro ao verificar gramática:', error.response?.data || error.message);
    throw new Error('Não foi possível realizar a verificação gramatical no momento.');
  }
}

model.exports = { checkGrammar };