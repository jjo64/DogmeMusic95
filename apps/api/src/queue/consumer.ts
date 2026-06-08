import amqp from 'amqplib';
import dotenv from 'dotenv';
import { prisma } from '../db/prisma.client';
import { redis } from '../cache/redis.client';
import { generateArtistGraph } from '../services/llm.service';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'graph_generation_queue';
const REDIS_CACHE_TTL = 3600; // 1 hora de cache

async function startWorker() {
  try {
    console.log('[Worker] Connecting to RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Solo procesa un mensaje a la vez para no sobrecargar el worker (y respetar límites del LLM)
    await channel.prefetch(1);
    
    console.log(`[Worker] Listening for jobs in queue: ${QUEUE_NAME}`);
    
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      
      const payload = JSON.parse(msg.content.toString());
      const artistName = payload.artistName.toUpperCase().trim();
      console.log(`[Worker] Received job for artist: "${artistName}"`);
      
      try {
        // 1. Llamar al LLM para generar el grafo
        console.log(`[Worker] Calling LLM to generate graph for "${artistName}"...`);
        const graphData = await generateArtistGraph(artistName);
        
        // 2. Guardar en Base de Datos e indicar COMPLETED en el Job
        console.log(`[Worker] Persisting graph and artists for "${artistName}" to database...`);
        await prisma.$transaction(async (tx) => {
          // Extraer todos los nodos que son de tipo 'artist' en el grafo
          const artistNodes = graphData.nodes.filter((n: any) => n.type === 'artist');
          const idMapping: Record<string, string> = {};

          for (const n of artistNodes) {
            const normName = n.label.toUpperCase().trim();
            const slug = n.id || n.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const dbArtist = await tx.artist.upsert({
              where: { name: normName },
              update: {
                era: n.era || null,
                origin: n.origin || null,
                genres: n.genres || [],
                description: n.description || null,
                influenceScore: n.influenceScore || 80,
                darkness: n.darkness !== undefined ? n.darkness : 50,
                energy: n.energy !== undefined ? n.energy : 50,
                experimental: n.experimental !== undefined ? n.experimental : 50,
                acousticness: n.acousticness !== undefined ? n.acousticness : 50,
                danceability: n.danceability !== undefined ? n.danceability : 50,
              },
              create: {
                id: slug,
                name: normName,
                era: n.era || null,
                origin: n.origin || null,
                genres: n.genres || [],
                description: n.description || null,
                influenceScore: n.influenceScore || 80,
                darkness: n.darkness !== undefined ? n.darkness : 50,
                energy: n.energy !== undefined ? n.energy : 50,
                experimental: n.experimental !== undefined ? n.experimental : 50,
                acousticness: n.acousticness !== undefined ? n.acousticness : 50,
                danceability: n.danceability !== undefined ? n.danceability : 50,
              },
            });
            idMapping[n.id] = dbArtist.id;
          }

          // Crear o buscar el artista raíz
          const rootSlug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const rootArtist = await tx.artist.upsert({
            where: { name: artistName },
            update: {},
            create: {
              id: rootSlug,
              name: artistName,
            },
          });

          // Asegurar que el ID raíz esté en el mapping también
          const rootNodeInGraph = graphData.nodes.find((n: any) => n.label.toUpperCase().trim() === artistName);
          if (rootNodeInGraph) {
            idMapping[rootNodeInGraph.id] = rootArtist.id;
          }

          // Modificar los IDs de los nodos de tipo 'artist' en graphData
          graphData.nodes = graphData.nodes.map((n: any) => {
            if (n.type === 'artist' && idMapping[n.id]) {
              return { ...n, id: idMapping[n.id] };
            }
            return n;
          });

          // Modificar los links en graphData para usar los nuevos IDs
          graphData.links = graphData.links.map((l: any) => {
            const source = idMapping[l.source] || l.source;
            const target = idMapping[l.target] || l.target;
            return { ...l, source, target };
          });

          // Eliminar grafos antiguos si existen para evitar duplicados
          await tx.graph.deleteMany({
            where: { artistId: rootArtist.id },
          });

          // Crear el nuevo grafo
          await tx.graph.create({
            data: {
              artistId: rootArtist.id,
              data: graphData as any,
            },
          });

          // Actualizar el estado de la tarea a COMPLETED
          await tx.generationJob.update({
            where: { artistName },
            data: { status: 'COMPLETED', error: null },
          });
        });

        // 3. Escribir en la cache de Redis
        try {
          const cacheKey = `graph:${artistName}`;
          await redis.set(cacheKey, JSON.stringify(graphData), 'EX', REDIS_CACHE_TTL);
          console.log(`[Worker] Cached graph in Redis for: "${artistName}"`);
        } catch (redisError) {
          console.error('[Worker] Redis caching failed:', redisError);
        }

        console.log(`[Worker] Done processing: "${artistName}"`);
        channel.ack(msg);
      } catch (error: any) {
        console.error(`[Worker] Error processing job for "${artistName}":`, error);
        
        // Registrar error en la base de datos
        try {
          await prisma.generationJob.update({
            where: { artistName },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Error desconocido en el worker',
            },
          });
        } catch (dbError) {
          console.error('[Worker] Failed to update job status to FAILED in DB:', dbError);
        }

        // Descartar el mensaje (no re-encolar por defecto para evitar bucles de fallos)
        channel.nack(msg, false, false);
      }
    }, { noAck: false });
    
    connection.on('close', () => {
      console.error('[Worker] Connection to RabbitMQ lost. Exiting process...');
      process.exit(1);
    });

  } catch (error) {
    console.error('[Worker] Fatal error starting worker:', error);
    process.exit(1);
  }
}

// Iniciar worker si es el archivo principal de ejecución
if (require.main === module) {
  startWorker();
}

export { startWorker };

