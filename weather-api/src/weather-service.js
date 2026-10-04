'use strict';

class WeatherServiceError extends Error {
  constructor(
    message,
    {
      statusCode = 500,
      code = 'WEATHER_ERROR',
      cause,
    } = {}
  ) {
    super(message, { cause });

    this.name = 'WeatherServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ---------- Dados mock ----------

function createMockWeather(city) {
  return {
    resolvedAddress: `${city}, Brazil`,
    address: city,
    timezone: 'America/Sao_Paulo',
    currentConditions: {
      temp: 28.5,
      feelslike: 30.2,
      humidity: 75,
      conditions: 'Partially cloudy',
      description:
        'Mock weather data for local development.',
    },
    mock: true,
  };
}

// ---------- Serviço de clima ----------

function createWeatherService({ config, cache }) {
  if (!config || !config.weather) {
    throw new TypeError('config.weather is required');
  }

  if (
    !cache ||
    typeof cache.get !== 'function' ||
    typeof cache.set !== 'function'
  ) {
    throw new TypeError(
      'cache must provide get() and set() methods'
    );
  }

  async function fetchWeather(city) {
    const location = String(city || '').trim();

    if (!location) {
      throw new WeatherServiceError(
        'City is required.',
        {
          statusCode: 400,
          code: 'INVALID_CITY',
        }
      );
    }

    const cacheKey = location.toLowerCase();

    // ---------- Cache ----------

    const cachedWeather = await cache.get(cacheKey);

    if (cachedWeather !== undefined) {
      return {
        data: cachedWeather,
        cached: true,
      };
    }

    // ---------- Modo Mock ----------

    if (config.weather.mock) {
      const mockWeather = createMockWeather(location);

      await cache.set(
        cacheKey,
        mockWeather,
        config.cache.ttlSeconds
      );

      return {
        data: mockWeather,
        cached: false,
      };
    }

    // ---------- Visual Crossing ----------

    const encodedLocation = encodeURIComponent(location);

    const url = new URL(
      `${config.weather.baseUrl}/${encodedLocation}`
    );

    url.searchParams.set(
      'key',
      config.weather.apiKey
    );

    url.searchParams.set(
      'unitGroup',
      config.weather.unitGroup
    );

    url.searchParams.set(
      'contentType',
      'json'
    );

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, config.weather.timeoutMs);

    let response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new WeatherServiceError(
          'Weather provider request timed out.',
          {
            statusCode: 504,
            code: 'WEATHER_PROVIDER_TIMEOUT',
            cause: error,
          }
        );
      }

      throw new WeatherServiceError(
        'Unable to reach the weather provider.',
        {
          statusCode: 502,
          code: 'WEATHER_PROVIDER_UNAVAILABLE',
          cause: error,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new WeatherServiceError(
        'Weather provider returned an invalid response.',
        {
          statusCode: 502,
          code: 'WEATHER_PROVIDER_INVALID_RESPONSE',
          cause: error,
        }
      );
    }

    if (!response.ok) {
      const providerMessage =
        typeof data?.message === 'string'
          ? data.message
          : 'Weather provider rejected the request.';

      throw new WeatherServiceError(
        providerMessage,
        {
          statusCode:
            response.status === 400
              ? 400
              : 502,
          code:
            response.status === 400
              ? 'INVALID_WEATHER_REQUEST'
              : 'WEATHER_PROVIDER_ERROR',
        }
      );
    }

    // ---------- Salva no cache ----------

    await cache.set(
      cacheKey,
      data,
      config.cache.ttlSeconds
    );

    return {
      data,
      cached: false,
    };
  }

  return {
    fetchWeather,
  };
}

module.exports = {
  createWeatherService,
  WeatherServiceError,
};