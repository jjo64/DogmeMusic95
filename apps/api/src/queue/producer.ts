import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
export const QUEUE_NAME = 'graph_generation_queue';

let channel: amqp.Channel | null = null;
let connection: amqp.ChannelModel | null = null;

export async function connectQueue(): Promise<amqp.Channel> {
  if (channel) return channel;

  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    connection = conn;
    
    const ch = await conn.createChannel();
    channel = ch;
    
    await ch.assertQueue(QUEUE_NAME, { durable: true });
    console.log('Successfully connected to RabbitMQ and queue asserted');
    
    // Escuchar cierre de la conexión
    conn.on('close', () => {
      console.warn('RabbitMQ connection closed. Reconnecting...');
      channel = null;
      connection = null;
    });

    return ch;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

export async function publishGraphGenerationJob(artistName: string): Promise<boolean> {
  try {
    const ch = await connectQueue();
    const payload = JSON.stringify({ artistName });
    const success = ch.sendToQueue(QUEUE_NAME, Buffer.from(payload), {
      persistent: true, // Persistir mensaje en disco para evitar pérdidas ante caídas
    });
    console.log(`[Queue] Job published for artist: ${artistName}`);
    return success;
  } catch (error) {
    console.error(`[Queue] Failed to publish job for artist: ${artistName}`, error);
    return false;
  }
}
