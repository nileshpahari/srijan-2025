import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const clients = new Map<string, WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId'); // Assuming you send userId in query

    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('message', (message) => {
      try {
        const { type, payload } = JSON.parse(message.toString());

        if (type === 'sendMessage') {
          const { conversationId, sender, content } = payload;

          // Broadcast message to all participants
          clients.forEach((client, id) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'newMessage', payload }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) clients.delete(userId);
    });
  });
}
