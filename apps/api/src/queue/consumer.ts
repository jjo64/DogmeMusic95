import amqp from 'amqplib';
import dotenv from 'dotenv';
import { handleGraphGeneration } from './handlers/graph-generation.handler';
import { prisma } from '../db/prisma.client';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'graph_generation_queue';

async function startWorker() {
  try {
    console.log('[Worker] Connecting to RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Solo procesa un mensaje a la vez para respetar los límites de la API del LLM
    await channel.prefetch(1);

    console.log(`[Worker] Listening for jobs in queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        const payload = JSON.parse(msg.content.toString());
        const artistName: string = payload.artistName;

        try {
          await handleGraphGeneration(artistName);
          channel.ack(msg);
        } catch (error) {
          console.error(`[Worker] Error processing job for "${artistName}":`, error);

          // Registrar el fallo en la base de datos
          try {
            await prisma.generationJob.update({
              where: { artistName: artistName.toUpperCase().trim() },
              data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Error desconocido en el worker',
              },
            });
          } catch (dbError) {
            console.error('[Worker] Failed to update job status to FAILED:', dbError);
          }

          // Descartar el mensaje sin re-encolar (evita bucles de fallos infinitos)
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    connection.on('close', () => {
      console.error('[Worker] Connection to RabbitMQ lost. Exiting...');
      process.exit(1);
    });
  } catch (error) {
    console.error('[Worker] Fatal error starting worker:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startWorker();
}

export { startWorker };
