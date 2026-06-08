import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
// Simular Prisma y Redis para no depender de servicios externos en CI
vi.mock('../../src/db/prisma.client', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: any) => any) => {
      const mockTx = {
        artist: {
          upsert: vi.fn().mockResolvedValue({ id: 'mock-artist-id', name: 'TEST ARTIST' }),
          findUnique: vi.fn().mockResolvedValue(null),
        },
        graph: {
          deleteMany: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 'mock-graph-id' }),
        },
        generationJob: {
          update: vi.fn().mockResolvedValue({ status: 'COMPLETED' }),
        },
      };
      return fn(mockTx);
    }),
    generationJob: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('../../src/cache/redis.client', () => ({
  redis: {
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

// Simular el LLM para retornar datos mock sin hacer llamadas reales
vi.mock('../../src/services/llm.service', () => ({
  generateArtistGraph: vi.fn().mockResolvedValue({
    nodes: [
      {
        id: 'test-artist', label: 'Test Artist', type: 'artist',
        description: 'Test description', era: '2000–PRESENT',
        origin: 'BUENOS AIRES, AR', genres: ['ALTERNATIVE'],
        influenceScore: 85, darkness: 60, energy: 70,
        experimental: 50, acousticness: 30, danceability: 45,
      },
      {
        id: 'genre-alt', label: 'Alternative Rock', type: 'genre',
        description: 'Genre node',
      },
    ],
    links: [
      { source: 'test-artist', target: 'genre-alt', type: 'thematic', description: 'Primary genre' },
    ],
    metadata: {
      rootArtist: 'Test Artist',
      generationTime: new Date().toISOString(),
      description: 'Test graph',
    },
  }),
}));

import { handleGraphGeneration } from '../../src/queue/handlers/graph-generation.handler';
import { prisma } from '../../src/db/prisma.client';
import { redis } from '../../src/cache/redis.client';

describe('Graph Generation Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call LLM, persist graph in DB, and cache in Redis on success', async () => {
    await handleGraphGeneration('Test Artist');

    // Verificar que la transacción de Prisma fue llamada
    expect(prisma.$transaction).toHaveBeenCalledOnce();

    // Verificar que Redis fue utilizado para cachear el resultado
    expect(redis.set).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining('graph:'),
      expect.any(String),
      'EX',
      3600
    );
  });
});
