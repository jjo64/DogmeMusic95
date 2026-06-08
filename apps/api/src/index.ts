import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import { prisma } from './db/prisma.client';
import { redis } from './cache/redis.client';
import { publishGraphGenerationJob } from './queue/producer';

dotenv.config();

const PORT = process.env.PORT || 4000;
const REDIS_CACHE_TTL = 3600; // 1 hora de cache

// 1. GraphQL Schema Definitions
const typeDefs = `#graphql
  enum JobStatus {
    PENDING
    COMPLETED
    FAILED
  }

  type GenerationJob {
    id: ID!
    artistName: String!
    status: JobStatus!
    error: String
    createdAt: String!
    updatedAt: String!
  }

  enum NodeType {
    artist
    genre
    movement
    theme
  }

  type MusicNode {
    id: ID!
    label: String!
    type: NodeType!
    description: String!
  }

  enum LinkType {
    influence
    member
    collaboration
    thematic
  }

  type MusicLink {
    source: String!
    target: String!
    type: LinkType!
    description: String!
  }

  type GraphMetadata {
    rootArtist: String!
    generationTime: String!
    description: String!
  }

  type MusicGraph {
    nodes: [MusicNode!]!
    links: [MusicLink!]!
    metadata: GraphMetadata!
  }

  type GraphResult {
    status: JobStatus!
    graph: MusicGraph
    jobId: ID
    error: String
  }

  type Artist {
    id: ID!
    name: String!
    era: String
    origin: String
    genres: [String!]!
    description: String
    influenceScore: Int!
    darkness: Float!
    energy: Float!
    experimental: Float!
    acousticness: Float!
    danceability: Float!
  }

  type UserList {
    id: ID!
    name: String!
    artistIds: [String!]!
    createdAt: String!
  }

  type Collection {
    id: ID!
    name: String!
    subtitle: String
    description: String!
    coverColor: String!
    artistIds: [String!]!
    tags: [String!]!
  }

  type ExplorationHistoryEntry {
    id: ID!
    artist: Artist!
    createdAt: String!
  }

  type Query {
    artistGraph(name: String!): GraphResult!
    generationJob(artistName: String!): GenerationJob
    
    # Nuevas Queries
    myLists: [UserList!]!
    explorationHistory: [ExplorationHistoryEntry!]!
    collections: [Collection!]!
    timelineArtists: [Artist!]!
    discoverArtists(
      darkness: Float!
      energy: Float!
      experimental: Float!
      acousticness: Float!
      danceability: Float!
    ): [Artist!]!
  }

  type Mutation {
    requestArtistGraph(name: String!): GraphResult!
    
    # Nuevas Mutaciones
    addHistoryEntry(artistId: ID!): Boolean!
    clearHistory: Boolean!
    
    createList(name: String!): UserList!
    deleteList(id: ID!): Boolean!
    renameList(id: ID!, name: String!): UserList!
    saveArtistToList(artistId: ID!, listId: ID!): UserList!
    removeArtistFromList(artistId: ID!, listId: ID!): UserList!
  }
`;

// Helper for caching
const getCacheKey = (artistName: string) => `graph:${artistName.toUpperCase().trim()}`;

// 2. GraphQL Resolvers
const resolvers = {
  Query: {
    artistGraph: async (_: any, { name }: { name: string }) => {
      const normalizedName = name.toUpperCase().trim();
      if (!normalizedName) {
        return {
          status: 'FAILED',
          error: 'El nombre del artista no puede estar vacío.',
        };
      }

      // a. Buscar en Redis Cache
      try {
        const cachedGraph = await redis.get(getCacheKey(normalizedName));
        if (cachedGraph) {
          console.log(`[GraphQL] Cache HIT para: "${normalizedName}"`);
          return {
            status: 'COMPLETED',
            graph: JSON.parse(cachedGraph),
          };
        }
      } catch (err) {
        console.error('[GraphQL] Error leyendo cache de Redis:', err);
      }

      // b. Buscar en la base de datos (PostgreSQL)
      const artist = await prisma.artist.findUnique({
        where: { name: normalizedName },
        include: { graphs: true },
      });

      if (artist && artist.graphs.length > 0) {
        const graphData = artist.graphs[0].data as any;
        console.log(`[GraphQL] DB HIT para: "${normalizedName}"`);

        // Guardar en cache de Redis
        try {
          await redis.set(getCacheKey(normalizedName), JSON.stringify(graphData), 'EX', REDIS_CACHE_TTL);
        } catch (err) {
          console.error('[GraphQL] Error escribiendo cache de Redis:', err);
        }

        return {
          status: 'COMPLETED',
          graph: graphData,
        };
      }

      // c. Si no existe, revisar si hay un Job de generación en curso
      let job = await prisma.generationJob.findUnique({
        where: { artistName: normalizedName },
      });

      if (job) {
        console.log(`[GraphQL] Job encontrado para: "${normalizedName}" con estado: ${job.status}`);
        return {
          status: job.status,
          jobId: job.id,
          error: job.error,
        };
      }

      // d. Si no hay job, crear uno nuevo PENDING y encolar la tarea en RabbitMQ
      console.log(`[GraphQL] Iniciando generación de grafo para: "${normalizedName}"`);
      job = await prisma.generationJob.create({
        data: {
          artistName: normalizedName,
          status: 'PENDING',
        },
      });

      const published = await publishGraphGenerationJob(normalizedName);
      if (!published) {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { status: 'FAILED', error: 'No se pudo encolar el trabajo en RabbitMQ.' },
        });
        return {
          status: 'FAILED',
          jobId: job.id,
          error: 'Error de comunicación con el servicio de colas RabbitMQ.',
        };
      }

      return {
        status: 'PENDING',
        jobId: job.id,
      };
    },

    generationJob: async (_: any, { artistName }: { artistName: string }) => {
      const normalizedName = artistName.toUpperCase().trim();
      return prisma.generationJob.findUnique({
        where: { artistName: normalizedName },
      });
    },

    // --- Nuevos Resolvers de Query ---
    myLists: async () => {
      const lists = await prisma.userList.findMany({
        include: { artists: true },
        orderBy: { createdAt: 'desc' },
      });
      return lists.map(l => ({
        id: l.id,
        name: l.name,
        artistIds: l.artists.map(a => a.artistId),
        createdAt: l.createdAt.toISOString(),
      }));
    },

    explorationHistory: async () => {
      const history = await prisma.explorationHistory.findMany({
        include: { artist: true },
        orderBy: { createdAt: 'desc' },
        take: 40,
      });
      return history.map(h => ({
        id: h.id,
        artist: h.artist,
        createdAt: h.createdAt.toISOString(),
      }));
    },

    collections: async () => {
      return prisma.collection.findMany({
        orderBy: { name: 'asc' },
      });
    },

    timelineArtists: async () => {
      const artists = await prisma.artist.findMany({
        where: { era: { not: null } },
      });
      const getFoundingYear = (era: string | null) => {
        if (!era) return 0;
        const match = era.match(/^(\d{4})/);
        return match ? parseInt(match[1]) : 0;
      };
      return artists.sort((a, b) => getFoundingYear(a.era) - getFoundingYear(b.era));
    },

    discoverArtists: async (
      _: any,
      { darkness, energy, experimental, acousticness, danceability }: { darkness: number; energy: number; experimental: number; acousticness: number; danceability: number }
    ) => {
      const artists = await prisma.artist.findMany({
        where: {
          era: { not: null } // Solo buscar artistas reales/sembrados/generados por Claude
        }
      });
      const dist = (a: any) => {
        return Math.sqrt(
          Math.pow(a.darkness - darkness, 2) +
          Math.pow(a.energy - energy, 2) +
          Math.pow(a.experimental - experimental, 2) +
          Math.pow(a.acousticness - acousticness, 2) +
          Math.pow(a.danceability - danceability, 2)
        );
      };
      return artists
        .map(a => ({ artist: a, score: dist(a) }))
        .sort((a, b) => a.score - b.score)
        .map(x => x.artist)
        .slice(0, 10);
    },
  },

  Mutation: {
    requestArtistGraph: async (_: any, { name }: { name: string }) => {
      const normalizedName = name.toUpperCase().trim();
      if (!normalizedName) {
        return { status: 'FAILED', error: 'El nombre del artista no puede estar vacío.' };
      }

      // Eliminar job previo si falló para permitir reintento
      const existingJob = await prisma.generationJob.findUnique({
        where: { artistName: normalizedName },
      });

      if (existingJob && existingJob.status === 'FAILED') {
        await prisma.generationJob.delete({
          where: { artistName: normalizedName },
        });
      }

      return resolvers.Query.artistGraph(_, { name });
    },

    // --- Nuevos Resolvers de Mutaciones ---
    addHistoryEntry: async (_: any, { artistId }: { artistId: string }) => {
      const artist = await prisma.artist.findUnique({ where: { id: artistId } });
      if (!artist) return false;
      
      await prisma.explorationHistory.create({
        data: { artistId },
      });
      return true;
    },

    clearHistory: async () => {
      await prisma.explorationHistory.deleteMany();
      return true;
    },

    createList: async (_: any, { name }: { name: string }) => {
      const list = await prisma.userList.create({
        data: { name },
        include: { artists: true },
      });
      return {
        id: list.id,
        name: list.name,
        artistIds: list.artists.map(a => a.artistId),
        createdAt: list.createdAt.toISOString(),
      };
    },

    deleteList: async (_: any, { id }: { id: string }) => {
      await prisma.userList.delete({ where: { id } });
      return true;
    },

    renameList: async (_: any, { id, name }: { id: string; name: string }) => {
      const list = await prisma.userList.update({
        where: { id },
        data: { name },
        include: { artists: true },
      });
      return {
        id: list.id,
        name: list.name,
        artistIds: list.artists.map(a => a.artistId),
        createdAt: list.createdAt.toISOString(),
      };
    },

    saveArtistToList: async (_: any, { artistId, listId }: { artistId: string; listId: string }) => {
      // Toggle logic
      const existing = await prisma.listMember.findUnique({
        where: {
          listId_artistId: { listId, artistId }
        }
      });

      if (existing) {
        await prisma.listMember.delete({
          where: {
            listId_artistId: { listId, artistId }
          }
        });
      } else {
        await prisma.listMember.create({
          data: { listId, artistId },
        });
      }

      const list = await prisma.userList.findUnique({
        where: { id: listId },
        include: { artists: true },
      });
      if (!list) throw new Error('List not found');
      
      return {
        id: list.id,
        name: list.name,
        artistIds: list.artists.map(a => a.artistId),
        createdAt: list.createdAt.toISOString(),
      };
    },

    removeArtistFromList: async (_: any, { artistId, listId }: { artistId: string; listId: string }) => {
      await prisma.listMember.deleteMany({
        where: { listId, artistId },
      });

      const list = await prisma.userList.findUnique({
        where: { id: listId },
        include: { artists: true },
      });
      if (!list) throw new Error('List not found');

      return {
        id: list.id,
        name: list.name,
        artistIds: list.artists.map(a => a.artistId),
        createdAt: list.createdAt.toISOString(),
      };
    },
  },
};

// 3. Inicializar Servidor Express + Apollo Server
async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(json());

  app.use('/graphql', expressMiddleware(server));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servidor GraphQL corriendo en http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check disponible en http://localhost:${PORT}/health`);
  });
}

startServer().catch((error) => {
  console.error('Error fatal al iniciar el servidor backend:', error);
  process.exit(1);
});
