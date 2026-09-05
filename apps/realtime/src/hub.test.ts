import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { RealtimeHub, type SessionValidator, type TopicAuthorizer } from "./server.js";

class FakeSocket extends EventEmitter {
  readyState = 1;
  sent: string[] = [];
  send(value: string) { this.sent.push(value); }
}

const sessions: SessionValidator = {
  async authenticate(token) { return token === "valid" ? { userId: "u1" } : null; },
};

const authorization: TopicAuthorizer = {
  async canSubscribe(userId, topic) { return userId === "u1" && topic.startsWith("conversation:"); },
  async canPublish() { return false; },
};

test("rejects invalid sessions", async () => {
  const hub = new RealtimeHub(sessions, authorization);
  const socket = new FakeSocket();
  const client = await hub.authenticate("bad", socket as never);
  assert.equal(client, null);
});

test("authorizes subscriptions and deduplicates events", async () => {
  const hub = new RealtimeHub(sessions, authorization);
  const socket = new FakeSocket();
  const client = await hub.authenticate("valid", socket as never);
  assert.ok(client);

  await hub.handle(client!, JSON.stringify({ type: "subscribe", topic: "conversation:c1" }));
  assert.match(socket.sent[0] ?? "", /subscribed/);

  const event = { id: "e1", type: "message.created", occurredAt: new Date().toISOString(), payload: { id: "m1" } };
  await hub.publish("conversation:c1", event);
  await hub.publish("conversation:c1", event);
  assert.equal(socket.sent.filter((value) => value.includes('"event"')).length, 1);
});
