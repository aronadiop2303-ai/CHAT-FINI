import test from "node:test";
import assert from "node:assert/strict";
import { NeonMessageStore, type TransactionClient, type TransactionRunner } from "./message-transaction.js";

class FakeClient implements TransactionClient {
  committed = false;
  rolledBack = false;
  messages = new Map<string, any>();
  events: any[] = [];

  async query<T = unknown>(text: string, values: readonly unknown[]): Promise<{ rows: T[] }> {
    if (text.includes("SELECT m.id")) {
      const row = [...this.messages.values()].find((m) => m.senderId === values[0] && m.clientMessageId === values[1]);
      return { rows: row ? [{ ...row, event_id: this.events.find((e) => e.aggregateId === row.id)?.id } as T] : [] };
    }
    if (text.includes("INSERT INTO chat_fini.messages")) {
      if (values[1] !== "user-1") return { rows: [] };
      const existing = [...this.messages.values()].find((m) => m.senderId === values[1] && m.clientMessageId === values[4]);
      if (existing) return { rows: [] };
      const row = { id: `message-${this.messages.size + 1}`, conversationId: values[0], senderId: values[1], kind: values[2], body: values[3], createdAt: "2026-09-05T00:00:00.000Z", clientMessageId: values[4] };
      this.messages.set(row.id, row);
      return { rows: [row as T] };
    }
    if (text.includes("INSERT INTO chat_fini.events")) {
      const event = { id: `event-${this.events.length + 1}`, aggregateId: values[0] };
      this.events.push(event);
      return { rows: [event as T] };
    }
    return { rows: [] };
  }
}

class FakeRunner implements TransactionRunner {
  constructor(private readonly client: FakeClient) {}
  async transaction<T>(work: (client: TransactionClient) => Promise<T>): Promise<T> {
    try {
      const result = await work(this.client);
      this.client.committed = true;
      return result;
    } catch (error) {
      this.client.messages.clear();
      this.client.events.length = 0;
      this.client.rolledBack = true;
      throw error;
    }
  }
}

test("non-member cannot create a message", async () => {
  const client = new FakeClient();
  const store = new NeonMessageStore(new FakeRunner(client));
  await assert.rejects(() => store.createMessageAndEvent({ conversationId: "not-a-member", senderId: "user-1", kind: "text", body: "hello" }), /FORBIDDEN_CONVERSATION/);
  assert.equal(client.messages.size, 0);
  assert.equal(client.events.length, 0);
});

test("member message and event commit together", async () => {
  const client = new FakeClient();
  const store = new NeonMessageStore(new FakeRunner(client));
  const result = await store.createMessageAndEvent({ conversationId: "conversation-member", senderId: "user-1", kind: "text", body: "hello", clientMessageId: "client-1" });
  assert.equal(result.message.body, "hello");
  assert.equal(result.eventId, "event-1");
  assert.equal(client.committed, true);
});

test("duplicate client message id returns the existing message", async () => {
  const client = new FakeClient();
  const store = new NeonMessageStore(new FakeRunner(client));
  const input = { conversationId: "conversation-member", senderId: "user-1", kind: "text" as const, body: "hello", clientMessageId: "client-1" };
  const first = await store.createMessageAndEvent(input);
  const second = await store.createMessageAndEvent(input);
  assert.equal(second.message.id, first.message.id);
  assert.equal(second.eventId, first.eventId);
  assert.equal(client.messages.size, 1);
  assert.equal(client.events.length, 1);
});
