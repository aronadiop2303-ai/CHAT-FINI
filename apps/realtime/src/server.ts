import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { MessageKind } from "../../../packages/contracts/src/index.js";
import type { MessageService } from "./message-service.js";

export interface SessionValidator { authenticate(token: string): Promise<{ userId: string } | null>; }
export interface TopicAuthorizer {
  canSubscribe(userId: string, topic: string): Promise<boolean>;
  canPublish(userId: string, topic: string): Promise<boolean>;
}
export interface RealtimeEvent { id: string; type: string; occurredAt: string; payload: unknown; }
export type ClientMessage =
  | { type: "subscribe" | "unsubscribe"; topic: string }
  | { type: "send_message"; conversationId: string; kind: MessageKind; body: string; clientMessageId?: string };

type Client = { socket: WebSocket; userId: string; topics: Set<string> };

export class RealtimeHub {
  private readonly clients = new Set<Client>();
  private readonly seenEvents = new Set<string>();
  constructor(private readonly sessions: SessionValidator, private readonly authorization: TopicAuthorizer, private readonly messageService?: MessageService) {}
  async authenticate(token: string, socket: WebSocket): Promise<Client | null> {
    const session = await this.sessions.authenticate(token);
    if (!session) return null;
    const client: Client = { socket, userId: session.userId, topics: new Set() };
    this.clients.add(client); return client;
  }
  remove(client: Client): void { this.clients.delete(client); }
  async handle(client: Client, raw: string): Promise<void> {
    const message = JSON.parse(raw) as ClientMessage;
    if (message.type === "subscribe" || message.type === "unsubscribe") {
      if (message.type === "subscribe") {
        if (await this.authorization.canSubscribe(client.userId, message.topic)) {
          client.topics.add(message.topic);
          client.socket.send(JSON.stringify({ type: "subscribed", topic: message.topic }));
        } else client.socket.send(JSON.stringify({ type: "error", code: "FORBIDDEN" }));
      } else client.topics.delete(message.topic);
      return;
    }
    if (message.type === "send_message") {
      if (!this.messageService) throw new Error("MESSAGE_SERVICE_NOT_CONFIGURED");
      const persisted = await this.messageService.send({ ...message, senderId: client.userId });
      client.socket.send(JSON.stringify({ type: "message.accepted", message: persisted }));
    }
  }
  async publish(topic: string, event: RealtimeEvent, actorUserId?: string): Promise<void> {
    if (this.seenEvents.has(event.id)) return;
    if (actorUserId && !(await this.authorization.canPublish(actorUserId, topic))) throw new Error("FORBIDDEN");
    this.seenEvents.add(event.id);
    for (const client of this.clients) if (client.topics.has(topic) && client.socket.readyState === 1)
      client.socket.send(JSON.stringify({ type: "event", topic, event }));
  }
}

export function createRealtimeServer(options: { sessions: SessionValidator; authorization: TopicAuthorizer; messageService: MessageService; port?: number }) {
  const port = options.port ?? Number(process.env.PORT ?? 8787);
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ service: "chat-fini-realtime", status: "ok" }));
  });
  const wss = new WebSocketServer({ server });
  const hub = new RealtimeHub(options.sessions, options.authorization, options.messageService);
  wss.on("connection", async (socket, request) => {
    const token = new URL(request.url ?? "/", "http://localhost").searchParams.get("token") ?? "";
    const client = await hub.authenticate(token, socket);
    if (!client) { socket.close(1008, "Unauthorized"); return; }
    socket.on("message", (data) => void hub.handle(client, data.toString()).catch((error) => {
      socket.send(JSON.stringify({ type: "error", code: error instanceof Error ? error.message : "INVALID_MESSAGE" }));
    }));
    socket.on("close", () => hub.remove(client));
  });
  return { server, wss, hub, port };
}
