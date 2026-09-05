import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createRealtimeServer } from "./server.js";
import type { SessionValidator, TopicAuthorizer } from "./server.js";
import type { MessageService } from "./message-service.js";
import WebSocket from "ws";

const sessions: SessionValidator = {
  async authenticate(token) {
    return token === "valid" ? { userId: "user-1" } : null;
  },
};

const authorization: TopicAuthorizer = {
  async canSubscribe(userId, topic) {
    return userId === "user-1" && topic === "conversation:allowed";
  },
  async canPublish(userId, topic) {
    return userId === "user-1" && topic === "conversation:allowed";
  },
};

function messageService(): MessageService {
  return {
    async send(input) {
      return {
        id: "message-e2e-1",
        conversationId: input.conversationId,
        senderId: input.senderId,
        kind: input.kind,
        body: input.body,
        createdAt: "2026-09-05T00:00:00.000Z",
        clientMessageId: input.clientMessageId,
      };
    },
  } as MessageService;
}

async function startServer() {
  const runtime = createRealtimeServer({ sessions, authorization, messageService: messageService(), port: 0 });
  runtime.server.listen(0);
  await once(runtime.server, "listening");
  const address = runtime.server.address();
  assert.ok(address && typeof address === "object");
  return { runtime, url: `ws://127.0.0.1:${address.port}` };
}

function connect(url: string, token = "valid"): Promise<WebSocket> {
  const socket = new WebSocket(`${url}?token=${token}`);
  return new Promise((resolve, reject) => {
    socket.once("open", () => resolve(socket));
    socket.once("error", reject);
  });
}

function nextMessage(socket: WebSocket): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const onMessage = (data: WebSocket.RawData) => {
      cleanup();
      resolve(JSON.parse(data.toString()) as Record<string, any>);
    };
    const onError = (error: Error) => { cleanup(); reject(error); };
    const cleanup = () => {
      socket.off("message", onMessage);
      socket.off("error", onError);
    };
    socket.once("message", onMessage);
    socket.once("error", onError);
  });
}

test("WebSocket rejects unauthenticated clients", async () => {
  const { runtime, url } = await startServer();
  const socket = new WebSocket(`${url}?token=bad`);
  const [code] = await once(socket, "close");
  assert.equal(code, 1008);
  await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
});

test("WebSocket authorizes subscriptions and fans out messages", async () => {
  const { runtime, url } = await startServer();
  const sender = await connect(url);
  const receiver = await connect(url);

  sender.send(JSON.stringify({ type: "subscribe", topic: "conversation:allowed" }));
  receiver.send(JSON.stringify({ type: "subscribe", topic: "conversation:allowed" }));
  assert.equal((await nextMessage(sender)).type, "subscribed");
  assert.equal((await nextMessage(receiver)).type, "subscribed");

  sender.send(JSON.stringify({
    type: "send_message",
    conversationId: "allowed",
    kind: "text",
    body: "hello e2e",
    clientMessageId: "client-e2e-1",
  }));

  const accepted = await nextMessage(sender);
  assert.equal(accepted.type, "message.accepted");
  assert.equal(accepted.message.body, "hello e2e");

  const event = await nextMessage(receiver);
  assert.equal(event.type, "event");
  assert.equal(event.topic, "conversation:allowed");
  assert.equal(event.event.type, "message.created");
  assert.equal(event.event.payload.body, "hello e2e");

  sender.close();
  receiver.close();
  await Promise.all([once(sender, "close"), once(receiver, "close")]);
  await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
});

test("WebSocket rejects unauthorized subscriptions", async () => {
  const { runtime, url } = await startServer();
  const socket = await connect(url);
  socket.send(JSON.stringify({ type: "subscribe", topic: "conversation:denied" }));
  const response = await nextMessage(socket);
  assert.deepEqual(response, { type: "error", code: "FORBIDDEN" });
  socket.close();
  await once(socket, "close");
  await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
});

test("WebSocket reports malformed messages without crashing", async () => {
  const { runtime, url } = await startServer();
  const socket = await connect(url);
  socket.send("not-json");
  const response = await nextMessage(socket);
  assert.equal(response.type, "error");
  socket.close();
  await once(socket, "close");
  await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
});
