const { program } = require('commander');
const { fetchTrendingRepositories } = require('./api/githubService');

function setupCLI() {
  program
    .name('trending-repos')
    .description('CLI para listar os repositórios em alta no GitHub')
    .version('1.0.0');

  program
    .option('-d, --duration <duration>', 'Período de tempo (day, week, month, year)', 'week')
    .option('-l, --limit <limit>', 'Número de repositórios a exibir', '10')
    .action(async (options) => {
      const validDurations = ['day', 'week', 'month', 'year'];
      
      if (!validDurations.includes(options.duration)) {
        console.error(`Erro: Duração inválida "${options.duration}". Escolha entre: day, week, month, year.`);
        process.exit(1);
      }

      const limitNum = parseInt(options.limit, 10);
      if (isNaN(limitNum) || limitNum <= 0) {
        console.error('Erro: O limite deve ser um número inteiro positivo.');
        process.exit(1);
      }

      console.log(`\nA procurar repositórios em alta (${options.duration}), limite de ${limitNum}...\n`);

      try {
        const repos = await fetchTrendingRepositories(options.duration, limitNum);

        if (repos.length === 0) {
          console.log('Nenhum repositório encontrado para o período especificado.');
          return;
        }

        repos.forEach((repo, index) => {
          console.log(`${index + 1}. ${repo.full_name}`);
          console.log(`   📝 Descrição: ${repo.description || 'Sem descrição'}`);
          console.log(`   ⭐ Estrelas: ${repo.stargazers_count.toLocaleString()}`);
          console.log(`   💻 Linguagem: ${repo.language || 'Não especificada'}`);
          console.log(`   🔗 URL: ${repo.html_url}`);
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