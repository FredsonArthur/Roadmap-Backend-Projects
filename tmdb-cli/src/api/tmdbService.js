// Dados simulados (Mocks) para o TMDB CLI Tool
const mockMovies = {
  playing: [
    { id: 1, title: "Filme em Exibição 1", release_date: "2026-05-10", vote_average: 7.8, vote_count: 1240, overview: "Uma emocionante história de aventura a passar nos cinemas atualmente." },
    { id: 2, title: "Filme em Exibição 2", release_date: "2026-05-02", vote_average: 6.5, vote_count: 850, overview: "Um drama intenso que explora as relações humanas na atualidade." }
  ],
  popular: [
    { id: 3, title: "O Grande Sucesso Popular", release_date: "2025-11-15", vote_average: 8.4, vote_count: 15420, overview: "Um blockbuster de ação que conquistou o público a nível mundial." },
    { id: 4, title: "Aventura Épica 2", release_date: "2025-08-20", vote_average: 8.1, vote_count: 9820, overview: "A continuação da saga que marcou uma geração de espetadores." }
  ],
  top: [
    { id: 5, title: "Obra-Prima do Cinema", release_date: "1999-03-31", vote_average: 9.3, vote_count: 28400, overview: "Um clássico aclamado pela crítica que redefiniu a sétima arte." },
    { id: 6, title: "O Drama Vencedor", release_date: "2010-07-16", vote_average: 8.8, vote_count: 22100, overview: "Uma narrativa complexa e brilhante sobre os limites da mente." }
  ],
  upcoming: [
    { id: 7, title: "O Futuro Blockbuster", release_date: "2026-09-12", vote_average: 0.0, vote_count: 0, overview: "O filme mais antecipado do próximo trimestre com estreia marcada nos cinemas." },
    { id: 8, title: "Ficção Científica 2026", release_date: "2026-10-30", vote_average: 0.0, vote_count: 0, overview: "Uma viagem espetacular por mundos distantes e desconhecidos." }
  ]
};

async function fetchMovies(type) {
  const validTypes = ['playing', 'popular', 'top', 'upcoming'];

  if (!validTypes.includes(type)) {
    throw new Error(`Tipo inválido: "${type}". Escolha entre: playing, popular, top, upcoming.`);
  }

  // Simula um pequeno atraso de rede para dar um aspeto realista
  await new Promise(resolve => setTimeout(resolve, 400));

  return mockMovies[type] || [];
}

module.exports = { fetchMovies };