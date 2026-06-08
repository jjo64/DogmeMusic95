import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'graph_generation_queue';

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
      
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`[Worker] Received job for artist: "${payload.artistName}"`);
        
        // Simulación temporal de la generación del grafo
        console.log(`[Worker] Generating graph for "${payload.artistName}" (simulated)...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        console.log(`[Worker] Done processing: "${payload.artistName}"`);
        
        channel.ack(msg);
      } catch (error) {
        console.error('[Worker] Error processing message:', error);
        // Descartar/Re-encolar el mensaje
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
