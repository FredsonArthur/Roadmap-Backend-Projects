'use strict';

// Cache em memória com tempo de expiração (TTL), parecido com o SET ... EX do Redis.
// Os métodos são assíncronos de propósito: se um dia você trocar por Redis,
// o resto do projeto continua igual, porque só este arquivo muda.
class TtlCache {
  constructor({ maxEntries = 500, sweepIntervalMs = 60 * 1000 } = {}) {
    if (!Number.isInteger(maxEntries) || maxEntries < 1) {
      throw new RangeError('maxEntries must be a positive integer');
    }
    if (!(sweepIntervalMs > 0)) {
      throw new RangeError('sweepIntervalMs must be greater than zero');
    }

    this.maxEntries = maxEntries;
    this.entries = new Map(); // chave -> { json, expiresAt }

    // Limpa periodicamente o que já expirou, mesmo sem ninguém consultar
    this.timer = setInterval(() => this.sweep(), sweepIntervalMs);
    this.timer.unref(); // não impede o programa de encerrar
  }

  // Devolve o valor guardado, ou undefined se não existir ou já tiver expirado
  async get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return JSON.parse(entry.json);
  }

  // Guarda o valor por "ttlSeconds" segundos
  async set(key, value, ttlSeconds) {
    if (typeof key !== 'string' || key === '') {
      throw new TypeError('key must be a non-empty string');
    }
    if (typeof ttlSeconds !== 'number' || !Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
      throw new RangeError('ttlSeconds must be a positive number');
    }
    // Guarda o valor como texto JSON, como o Redis faz: quem lê recebe uma cópia
    // e não consegue alterar, sem querer, o que está no cache
    const json = JSON.stringify(value);
    if (json === undefined) {
      throw new TypeError('value cannot be converted to JSON');
    }

    this.entries.delete(key); // regravar uma chave a coloca como a mais recente

    // As chaves vêm do que o usuário digita, então o tamanho do cache tem um limite:
    // primeiro descarta o que expirou e, se ainda estiver cheio, o mais antigo
    if (this.entries.size >= this.maxEntries) this.sweep();
    while (this.entries.size >= this.maxEntries) {
      this.entries.delete(this.entries.keys().next().value);
    }

    this.entries.set(key, { json, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  // Remove as entradas expiradas e devolve quantas foram removidas
  sweep() {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
        removed++;
      }
    }
    return removed;
  }

  // Quantidade de entradas guardadas (pode incluir expiradas que ainda não foram limpas)
  get size() {
    return this.entries.size;
  }

  clear() {
    this.entries.clear();
  }

  // Para a limpeza periódica (útil em testes ou ao encerrar o servidor)
  close() {
    clearInterval(this.timer);
  }
}

module.exports = { TtlCache };