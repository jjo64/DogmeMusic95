import { describe, it, expect } from 'vitest';
import { generateArtistGraph, MusicGraphSchema } from '../../src/services/llm.service';

describe('LLM Service', () => {
  it('should generate a valid music graph structure conforming to Zod schema', async () => {
    const artistName = 'Soda Stereo';
    const graph = await generateArtistGraph(artistName);

    // Validar contra el esquema Zod
    const validation = MusicGraphSchema.safeParse(graph);
    
    expect(validation.success).toBe(true);
    expect(graph.metadata.rootArtist).toBe(artistName);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.links.length).toBeGreaterThan(0);

    // Verificar que todas las referencias de links existan en los nodos
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const link of graph.links) {
      expect(nodeIds.has(link.source)).toBe(true);
      expect(nodeIds.has(link.target)).toBe(true);
    }
  });
});
