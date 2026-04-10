import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private jobSubscriptions: Map<string, Set<string>> = new Map(); // jobId -> socketIds

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Configure selon tes besoins en production
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Subscribe to job updates
      socket.on('subscribe:job', (jobId: string) => {
        console.log(`[WebSocket] Client ${socket.id} subscribed to job ${jobId}`);
        socket.join(`job:${jobId}`);
        
        if (!this.jobSubscriptions.has(jobId)) {
          this.jobSubscriptions.set(jobId, new Set());
        }
        this.jobSubscriptions.get(jobId)?.add(socket.id);
      });

      // Unsubscribe from job updates
      socket.on('unsubscribe:job', (jobId: string) => {
        console.log(`[WebSocket] Client ${socket.id} unsubscribed from job ${jobId}`);
        socket.leave(`job:${jobId}`);
        this.jobSubscriptions.get(jobId)?.delete(socket.id);
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        // Clean up subscriptions
        this.jobSubscriptions.forEach((subscribers, jobId) => {
          subscribers.delete(socket.id);
        });
      });
    });

    console.log('[WebSocket] Server initialized');
  }

  // Emit job update to all subscribers
  emitJobUpdate(jobId: string, data: unknown): void {
    if (!this.io) return;
    
    const room = `job:${jobId}`;
    this.io.to(room).emit('job:update', data);
    console.log(`[WebSocket] Emitted update for job ${jobId} to room ${room}`);
  }

  // Emit step update
  emitStepUpdate(jobId: string, step: unknown): void {
    if (!this.io) return;
    
    const room = `job:${jobId}`;
    this.io.to(room).emit('job:step', step);
  }

  // Get number of subscribers for a job
  getSubscriberCount(jobId: string): number {
    return this.jobSubscriptions.get(jobId)?.size || 0;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
