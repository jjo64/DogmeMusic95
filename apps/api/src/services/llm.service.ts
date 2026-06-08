import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar SDK de Anthropic
const apiKey = process.env.ANTHROPIC_API_KEY || '';
const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// 1. Esquemas Zod para validación rigurosa del grafo
export const MusicNodeSchema = z.object({
  id: z.string().describe('ID único en minúsculas y sin espacios, ej. "led-zeppelin" o "heavy-metal"'),
  label: z.string().describe('Nombre legible para visualización, ej. "Led Zeppelin" o "Heavy Metal"'),
  type: z.enum(['artist', 'genre', 'movement', 'theme']).describe('Tipo de nodo'),
  description: z.string().describe('Descripción breve de su estilo, rol o importancia histórica (máx 20 palabras)'),
});

export const MusicLinkSchema = z.object({
  source: z.string().describe('ID del nodo de origen'),
  target: z.string().describe('ID del nodo de destino'),
  type: z.enum(['influence', 'member', 'collaboration', 'thematic']).describe('Tipo de relación/conexión'),
  description: z.string().describe('Detalle de la conexión musical (ej. "Inspiró sus riffs de guitarra y batería pesada")'),
});

export const MusicGraphSchema = z.object({
  nodes: z.array(MusicNodeSchema),
  links: z.array(MusicLinkSchema),
  metadata: z.object({
    rootArtist: z.string().describe('El nombre del artista consultado inicialmente'),
    generationTime: z.string().describe('Timestamp ISO de generación'),
    description: z.string().describe('Un resumen corto del ecosistema musical de este artista'),
  }),
});

export type MusicGraph = z.infer<typeof MusicGraphSchema>;

/**
 * Llama a Claude y genera el grafo de influencias y conexiones
 * @param artistName Nombre del artista ingresado por el usuario
 */
export async function generateArtistGraph(artistName: string): Promise<MusicGraph> {
  if (!apiKey) {
    console.warn('[LLM Service] ANTHROPIC_API_KEY no configurado. Retornando datos simulados.');
    return getMockGraph(artistName);
  }

  const prompt = `
  Analiza el ecosistema musical, influencias y conexiones del artista/banda: "${artistName}".
  
  Necesitamos construir un grafo de relaciones completo y de alta calidad. Debe incluir:
  1. El artista raíz.
  2. Sus influencias directas más significativas (quiénes lo inspiraron).
  3. Artistas o bandas influenciadas por él (a quiénes inspiró).
  4. Su género musical primario y movimientos musicales asociados (ej. "Rock Psicodélico", "Grunge", "Seattle Scene").
  5. Temáticas líricas o estéticas clave que los conecten con otros artistas.
  
  Asegúrate de generar entre 8 y 15 nodos y suficientes relaciones (links) para que el grafo sea visualmente rico e interesante en D3.js.
  `;

  try {
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 3000,
      temperature: 0.2, // Temperatura baja para resultados más consistentes y verídicos
      system: `Eres un musicólogo experto y un científico de datos. Tu tarea es extraer grafos de influencias y conexiones temáticas de alta precisión.
      Debes estructurar el grafo de salida llamando a la herramienta 'submit_music_graph'.
      Reglas de consistencia:
      - Cada nodo debe tener un ID único.
      - Todos los IDs utilizados en los links (source y target) deben existir obligatoriamente en la lista de nodes.
      - Evita links duplicados o loops recursivos de un nodo a sí mismo.`,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [
        {
          name: 'submit_music_graph',
          description: 'Envía el grafo de influencias y conexiones musicales generado para el artista.',
          input_schema: {
            type: 'object',
            properties: {
              nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string', enum: ['artist', 'genre', 'movement', 'theme'] },
                    description: { type: 'string' }
                  },
                  required: ['id', 'label', 'type', 'description']
                }
              },
              links: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    source: { type: 'string' },
                    target: { type: 'string' },
                    type: { type: 'string', enum: ['influence', 'member', 'collaboration', 'thematic'] },
                    description: { type: 'string' }
                  },
                  required: ['source', 'target', 'type', 'description']
                }
              },
              metadata: {
                type: 'object',
                properties: {
                  rootArtist: { type: 'string' },
                  generationTime: { type: 'string' },
                  description: { type: 'string' }
                },
                required: ['rootArtist', 'generationTime', 'description']
              }
            },
            required: ['nodes', 'links', 'metadata']
          }
        }
      ],
      tool_choice: { type: 'tool', name: 'submit_music_graph' }
    });

    // Encontrar y parsear la llamada a la herramienta
    const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      throw new Error('El LLM no retornó una llamada estructurada de herramienta.');
    }

    // Validar los datos contra Zod
    const validatedData = MusicGraphSchema.parse(toolUseBlock.input);
    return validatedData;

  } catch (error) {
    console.error(`[LLM Service] Error generando grafo para ${artistName}:`, error);
    throw error;
  }
}

/**
 * Retorna datos simulados en caso de no tener una API Key configurada.
 * Esto asegura que el proyecto funcione de inmediato para demostración y testeo.
 */
function getMockGraph(artistName: string): MusicGraph {
  const rootId = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return {
    nodes: [
      { id: rootId, label: artistName, type: 'artist', description: `Artista consultado: ${artistName}` },
      { id: 'influence-1', label: 'The Beatles', type: 'artist', description: 'Banda británica legendaria que revolucionó el pop/rock mundial.' },
      { id: 'influence-2', label: 'David Bowie', type: 'artist', description: 'Camaleón del rock, pionero del glam rock y la experimentación.' },
      { id: 'genre-rock', label: 'Classic Rock', type: 'genre', description: 'Género musical dominante de los años 60 y 70 con guitarras eléctricas.' },
      { id: 'movement-psychedelia', label: 'Psicodelia', type: 'movement', description: 'Movimiento artístico inspirado en experiencias psicodélicas y sonido etéreo.' },
      { id: 'influenced-1', label: 'Radiohead', type: 'artist', description: 'Referente del rock alternativo y experimental de los 90s en adelante.' },
      { id: 'influenced-2', label: 'Tame Impala', type: 'artist', description: 'Proyecto de Neo-Psicodelia liderado por Kevin Parker.' },
    ],
    links: [
      { source: 'influence-1', target: rootId, type: 'influence', description: 'Inspiró las armonías vocales y composición melódica.' },
      { source: 'influence-2', target: rootId, type: 'influence', description: 'Inspiró la teatralidad escénica y variedad de estilos.' },
      { source: rootId, target: 'genre-rock', type: 'member', description: 'Se encuadra dentro del género de rock.' },
      { source: rootId, target: 'movement-psychedelia', type: 'thematic', description: 'Incorpora elementos sonoros y temáticas de la psicodelia.' },
      { source: rootId, target: 'influenced-1', type: 'influence', description: 'Influenció sus búsquedas de texturas sonoras complejas.' },
      { source: rootId, target: 'influenced-2', type: 'influence', description: 'Inspiró el uso de sintetizadores retro y beats hipnóticos.' },
    ],
    metadata: {
      rootArtist: artistName,
      generationTime: new Date().toISOString(),
      description: `Ecosistema de influencias simulado para ${artistName} en modo desarrollo.`,
    }
  };
}
