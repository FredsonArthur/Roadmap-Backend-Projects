require('dotenv').config();
const { program } = require('commander');
const { fetchMovies } = require('./api/tmdbService');

function setupCLI() {
  program
    .name('tmdb-app')
    .description('CLI para consultar informações de filmes da API do TMDB')
    .version('1.0.0');

  program
    .option('-t, --type <type>', 'Tipo de filmes (playing, popular, top, upcoming)', 'popular')
    .action(async (options) => {
      const validTypes = ['playing', 'popular', 'top', 'upcoming'];

      if (!validTypes.includes(options.type)) {
        console.error(`Erro: Tipo inválido "${options.type}". Escolha entre: playing, popular, top, upcoming.`);
        process.exit(1);
      }

      console.br ? console.log() : console.log(`\nA procurar filmes do tipo "${options.type}"...\n`);

      try {
        const movies = await fetchMovies(options.type);

        if (movies.length === 0) {
          console.log('Nenhum filme encontrado.');
          return;
        }

        movies.forEach((movie, index) => {
          console.log(`${index + 1}. ${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'})`);
          console.log(`   ⭐ Avaliação: ${movie.vote_average} / 10 (${movie.vote_count} votos)`);
          console.log(`   📝 Sinopse: ${movie.overview ? movie.overview.substring(0, 120) + '...' : 'Sem sinopse disponível'}`);
          console.log('--------------------------------------------------');
        });
      } catch (error) {
        console.error(`\n❌ ${error.message}`);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

module.exports = { setupCLI };