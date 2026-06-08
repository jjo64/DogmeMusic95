import { prisma } from '../../db/prisma.client';
import { redis } from '../../cache/redis.client';
import { generateArtistGraph } from '../../services/llm.service';
import type { MusicGraph } from '../../services/llm.service';

const REDIS_CACHE_TTL = 3600; // 1 hora

/**
 * Procesa un job de generación de grafo musical.
 * 1. Llama al LLM para generar el grafo de influencias.
 * 2. Persiste artistas, el grafo JSON y actualiza el GenerationJob en una sola transacción.
 * 3. Escribe el resultado en Redis para respuestas instantáneas en futuros requests.
 */
export async function handleGraphGeneration(artistName: string): Promise<void> {
  const normalizedName = artistName.toUpperCase().trim();
  console.log(`[Handler] Starting graph generation for: "${normalizedName}"`);

  // 1. Llamar al LLM
  const graphData: MusicGraph = await generateArtistGraph(normalizedName);

  // 2. Persistir en PostgreSQL dentro de una transacción
  await prisma.$transaction(async (tx) => {
    const artistNodes = graphData.nodes.filter((n) => n.type === 'artist');
    const idMapping: Record<string, string> = {};

    // Upsert de cada nodo artista que viene en el grafo
    for (const n of artistNodes) {
      const normLabel = n.label.toUpperCase().trim();
      const slug = n.id || n.label.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const dbArtist = await tx.artist.upsert({
        where: { name: normLabel },
        update: {
          era: n.era ?? null,
          origin: n.origin ?? null,
          genres: n.genres ?? [],
          description: n.description ?? null,
          influenceScore: n.influenceScore ?? 80,
          darkness: n.darkness ?? 50,
          energy: n.energy ?? 50,
          experimental: n.experimental ?? 50,
          acousticness: n.acousticness ?? 50,
          danceability: n.danceability ?? 50,
        },
        create: {
          id: slug,
          name: normLabel,
          era: n.era ?? null,
          origin: n.origin ?? null,
          genres: n.genres ?? [],
          description: n.description ?? null,
          influenceScore: n.influenceScore ?? 80,
          darkness: n.darkness ?? 50,
          energy: n.energy ?? 50,
          experimental: n.experimental ?? 50,
          acousticness: n.acousticness ?? 50,
          danceability: n.danceability ?? 50,
        },
      });

      idMapping[n.id] = dbArtist.id;
    }

    // Upsert del artista raíz
    const rootSlug = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const rootArtist = await tx.artist.upsert({
      where: { name: normalizedName },
      update: {},
      create: { id: rootSlug, name: normalizedName },
    });

    // Asegurar que el nodo raíz del grafo esté mapeado correctamente
    const rootNodeInGraph = graphData.nodes.find(
      (n) => n.label.toUpperCase().trim() === normalizedName
    );
    if (rootNodeInGraph) {
      idMapping[rootNodeInGraph.id] = rootArtist.id;
    }

    // Remapear IDs de nodos artista en el grafo para usar los IDs reales de la DB
    const resolvedNodes = graphData.nodes.map((n) => {
      if (n.type === 'artist' && idMapping[n.id]) {
        return { ...n, id: idMapping[n.id] };
      }
      return n;
    });

    // Remapear IDs en los links
    const resolvedLinks = graphData.links.map((l) => ({
      ...l,
      source: idMapping[l.source] ?? l.source,
      target: idMapping[l.target] ?? l.target,
    }));

    const resolvedGraph: MusicGraph = {
      ...graphData,
      nodes: resolvedNodes,
      links: resolvedLinks,
    };

    // Eliminar grafo anterior si existía (evita duplicados)
    await tx.graph.deleteMany({ where: { artistId: rootArtist.id } });

    // Guardar el nuevo grafo como JSON
    await tx.graph.create({
      data: { artistId: rootArtist.id, data: resolvedGraph as object },
    });

    // Marcar el job como completado
    await tx.generationJob.update({
      where: { artistName: normalizedName },
      data: { status: 'COMPLETED', error: null },
    });

    // Guardar en Redis (fuera de la transacción para no bloquearla)
    const cacheKey = `graph:${normalizedName}`;
    await redis
      .set(cacheKey, JSON.stringify(resolvedGraph), 'EX', REDIS_CACHE_TTL)
      .catch((err) => console.error('[Handler] Redis cache write failed:', err));

    console.log(`[Handler] Graph for "${normalizedName}" persisted and cached successfully.`);
  });
}
