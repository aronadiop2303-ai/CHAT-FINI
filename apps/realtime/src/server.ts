import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

export interface SessionValidator {
  authenticate(token: string): Promise<{ userId: string } | null>;
}

export interface TopicAuthorizer {
  canSubscribe(userId: string, topic: string): Promise<boolean>;
  canPublish(userId: string, topic: string): Promise<boolean>;
}

export interface RealtimeEvent {
  id: string;
  type: string;
  occurredAt: string;
  payload: unknown;
}

export interface ClientMessage {
  type: "subscribe" | "unsubscribe";
  topic: string;
}

type Client = { socket: WebSocket; userId: string; topics: Set<string> };

export class RealtimeHub {
  private readonly clients = new Set<Client>();
  private readonly seenEvents = new Set<string>();

  constructor(
    private readonly sessions: SessionValidator,
    private readonly authorization: TopicAuthorizer,
  ) {}

  async authenticate(token: string, socket: WebSocket): Promise<Client | null> {
    const session = await this.sessions.authenticate(token);
    if (!session) return null;
    const client: Client = { socket, userId: session.userId, topics: new Set() };
    this.clients.add(client);
    return client;
  }

  remove(client: Client): void {
    this.clients.delete(client);
  }

  async handle(client: Client, raw: string): Promise<void> {
    const message = JSON.parse(raw) as ClientMessage;
    if (message.type !== "subscribe" && message.type !== "unsubscribe") return;
    if (message.type === "subscribe") {
      if (await this.authorization.canSubscribe(client.userId, message.topic)) {
        client.topics.add(message.topic);
        client.socket.send(JSON.stringify({ type: "subscribed", topic: message.topic }));
      } else {
        client.socket.send(JSON.stringify({ type: "error", code: "FORBIDDEN" }));
      }
      return;
    }
    client.topics.delete(message.topic);
  }

  async publish(topic: string, event: RealtimeEvent, actorUserId?: string): Promise<void> {
    if (this.seenEvents.has(event.id)) return;
    if (actorUserId && !(await this.authorization.canPublish(actorUserId, topic))) {
      throw new Error("FORBIDDEN");
    }
    this.seenEvents.add(event.id);
    for (const client of this.clients) {
      if (client.topics.has(topic) && client.socket.readyState === 1) {
        client.socket.send(JSON.stringify({ type: "event", topic, event }));
      }
    }
  }
}

const port = Number(process.env.PORT ?? 8787);
const server = createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ service: "chat-fini-realtime", status: "ok" }));
});
const wss = new WebSocketServer({ server });

const sessions: SessionValidator = {
  async authenticate(token) {
    // Runtime adapter must replace this stub with the CHAT-FINI auth-session lookup.
    return token ? { userId: token } : null;
  },
};
const authorization: TopicAuthorizer = {
  async canSubscribe() { return true; },
  async canPublish() { return false; },
};
const hub = new RealtimeHub(sessions, authorization);

wss.on("connection", async (socket, request) => {
  const token = new URL(request.url ?? "/", "http://localhost").searchParams.get("token") ?? "";
  const client = await hub.authenticate(token, socket);
  if (!client) {
    socket.close(1008, "Unauthorized");
    return;
  }
  socket.on("message", (data) => void hub.handle(client, data.toString()).catch(() => socket.close(1003, "Invalid message")));
  socket.on("close", () => hub.remove(client));
});

server.listen(port, () => console.log(`CHAT-FINI realtime listening on :${port}`));
