# Weather API

Uma API de clima desenvolvida em Node.js que consulta dados meteorológicos, utiliza cache com Redis/Valkey, configurações por variáveis de ambiente e rate limiting por cliente.

Este projeto faz parte dos projetos do [Backend Developer Roadmap](https://roadmap.sh/backend).

## Funcionalidades

- API HTTP construída com Node.js.
- Endpoint para consulta de clima por cidade.
- Integração preparada para a API da Visual Crossing.
- Modo mock/local para desenvolvimento sem necessidade de API key.
- Cache utilizando Redis/Valkey.
- TTL configurável para os dados armazenados.
- Fallback para cache em memória caso Redis não esteja configurado.
- Rate limiting por cliente.
- Headers HTTP informando o estado do rate limit.
- Tratamento de erros da API externa.
- Configuração através de variáveis de ambiente.
- Endpoint de health check.

## Tecnologias

- Node.js 18+
- JavaScript
- HTTP nativo do Node.js
- Redis/Valkey
- Visual Crossing Weather API
- Git/GitHub

## Estrutura do projeto

```text
weather-api/
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── config.js
    ├── cache.js
    ├── rate-limiter.js
    └── weather-service.js
```

## Como executar
1. Pré-requisitos

# Você precisa ter instalado:

Node.js 18 ou superior.
Redis ou Valkey.

# No Fedora, o Valkey pode ser instalado com:

sudo dnf install valkey valkey-compat-redis

# Depois, inicie o serviço:

sudo systemctl enable --now valkey

# Verifique se está funcionando:

redis-cli ping

# Resposta esperada:

PONG

2. Instalar as dependências

# Entre na pasta do projeto:

cd weather-api

# Instale as dependências:

npm install

3. Configurar as variáveis de ambiente

# Crie o arquivo .env a partir das configurações de exemplo.

# Para desenvolvimento local sem uma chave da Visual Crossing, utilize o modo mock:

WEATHER_MOCK=true

WEATHER_API_KEY=sua_chave_da_visual_crossing

PORT=3000
HOST=127.0.0.1

WEATHER_API_BASE_URL=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline
WEATHER_UNIT_GROUP=metric

REQUEST_TIMEOUT_MS=8000

REDIS_URL=redis://127.0.0.1:6379

CACHE_TTL_SECONDS=43200
CACHE_MAX_ENTRIES=500

RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_SECONDS=60

TRUST_PROXY=false

# Quando WEATHER_MOCK=true, a chave da Visual Crossing não é necessária.

# O arquivo .env não deve ser commitado no Git.

4. Iniciar a API

# Execute:

npm start

# A aplicação será iniciada em:

http://127.0.0.1:3000

# O terminal deverá informar configurações semelhantes a:

Cache: Redis
Weather API started.
Listening on 127.0.0.1:3000
Weather API: mock/local
Endpoints
Health Check
GET /health

Exemplo:

curl http://127.0.0.1:3000/health

# Resposta:

{
  "status": "ok"
}
Weather
GET /weather/:city

# Exemplo:

curl "http://127.0.0.1:3000/weather/Recife"

# No modo mock, a resposta é semelhante a:

{
  "resolvedAddress": "Recife, Brazil",
  "address": "Recife",
  "timezone": "America/Sao_Paulo",
  "currentConditions": {
    "temp": 28.5,
    "feelslike": 30.2,
    "humidity": 75,
    "conditions": "Partially cloudy",
    "description": "Mock weather data for local development."
  },
  "mock": true,
  "cached": false
}

# Quando a mesma cidade é consultada novamente e os dados estão no cache:

{
  "resolvedAddress": "Recife, Brazil",
  "address": "Recife",
  "timezone": "America/Sao_Paulo",
  "currentConditions": {
    "temp": 28.5,
    "feelslike": 30.2,
    "humidity": 75,
    "conditions": "Partially cloudy",
    "description": "Mock weather data for local development."
  },
  "mock": true,
  "cached": true
}

## Cache

# A API utiliza Redis/Valkey para armazenar as respostas da consulta de clima.

# A chave do cache é baseada no nome da cidade normalizado para letras minúsculas.

# Por exemplo:

Recife
RECIFE
recife

# utilizam a mesma chave:

recife

# O TTL padrão é de 12 horas:

CACHE_TTL_SECONDS=43200

# É possível verificar as chaves diretamente no Redis:

redis-cli

# Depois:

KEYS *

# Para consultar o tempo restante de uma chave:

TTL recife
Rate Limiting

# A API possui um limite padrão de:

30 requisições por 60 segundos por cliente

# Configuração:

RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_SECONDS=60

# Quando o limite é atingido, a API retorna:

429 Too Many Requests

# com uma resposta semelhante a:

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}

# A API também envia headers informando o estado do limite:

RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset

# Quando o limite é excedido, também é enviado:

Retry-After
Testando o rate limiting

# Execute:

for i in {1..35}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    "http://127.0.0.1:3000/weather/Recife"
done

# Com a configuração padrão, as primeiras 30 requisições devem retornar:

200

# e as seguintes:

429

# Para visualizar os headers:

curl -i "http://127.0.0.1:3000/weather/Recife"
Variáveis de ambiente
Variável	Descrição	Padrão
WEATHER_MOCK	Ativa o modo mock	false
WEATHER_API_KEY	Chave da Visual Crossing	—
PORT	Porta HTTP	3000
HOST	Endereço de escuta	127.0.0.1
WEATHER_API_BASE_URL	URL da API de clima	Visual Crossing
WEATHER_UNIT_GROUP	Unidade dos dados meteorológicos	metric
REQUEST_TIMEOUT_MS	Timeout da API externa	8000
REDIS_URL	URL do Redis/Valkey	—
CACHE_TTL_SECONDS	Tempo de vida do cache	43200
CACHE_MAX_ENTRIES	Máximo de entradas do cache em memória	500
RATE_LIMIT_MAX	Máximo de requisições por janela	30
RATE_LIMIT_WINDOW_SECONDS	Duração da janela do rate limit	60
TRUST_PROXY	Confia no header X-Forwarded-For	false
Modo mock

# Durante o desenvolvimento, a API pode funcionar sem uma chave da Visual Crossing.

# Configure:

WEATHER_MOCK=true

# Nesse modo, a aplicação gera dados meteorológicos locais de exemplo.

# Isso permite testar:

Rotas HTTP.
Cache.
Redis/Valkey.
TTL.
Rate limiting.
Tratamento de respostas.
Configuração da aplicação.

# Quando uma chave real estiver disponível, altere:

WEATHER_MOCK=false

# e configure:

WEATHER_API_KEY=sua_chave_real
Testes realizados

# Durante o desenvolvimento foram validados:

 Inicialização do servidor.
 Endpoint /health.
 Consulta de clima em modo mock.
 Primeira consulta com cached: false.
 Segunda consulta com cached: true.
 Armazenamento da resposta no Redis/Valkey.
 TTL de 12 horas.
 Rate limiting de 30 requisições por 60 segundos.
 Resposta HTTP 429 Too Many Requests.
 Headers RateLimit-Limit.
 Headers RateLimit-Remaining.
 Headers RateLimit-Reset.
 Header Retry-After.
Tratamento de erros

## A API utiliza respostas JSON padronizadas para erros.

# Exemplo:

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}

# A aplicação também trata problemas relacionados à API externa, incluindo:

Timeout.
Indisponibilidade do provedor.
Resposta inválida.
Cidade ou requisição inválida.
Cache em memória

# Se REDIS_URL não estiver configurado, a aplicação utiliza um cache em memória como fallback.

## Nesse caso, o tamanho máximo pode ser configurado através de:

CACHE_MAX_ENTRIES=500

## Quando Redis/Valkey está configurado, ele é utilizado como armazenamento principal do cache.

# Segurança

## Informações sensíveis, como a chave da API e a URL do Redis, são obtidas através de variáveis de ambiente.

## O arquivo .env está incluído no .gitignore e não deve ser enviado para o repositório.

## Utilize .env.example para documentar quais variáveis são necessárias.

# Licença
MIT