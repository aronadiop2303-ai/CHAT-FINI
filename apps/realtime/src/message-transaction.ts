import type { MessageKind } from "../../../packages/contracts/src/index.js";
import type { MessageStore, PersistedMessage } from "./message-service.js";

export interface TransactionClient {
  query<T = unknown>(text: string, values: readonly unknown[]): Promise<{ rows: T[] }>;
}
export interface TransactionRunner { transaction<T>(work: (client: TransactionClient) => Promise<T>): Promise<T>; }

type StoredRow = PersistedMessage & { event_id: string | null };

export class NeonMessageStore implements MessageStore {
  constructor(private readonly runner: TransactionRunner) {}
  async createMessageAndEvent(input: { conversationId: string; senderId: string; kind: MessageKind; body: string; clientMessageId?: string }): Promise<{ message: PersistedMessage; eventId: string }> {
    return this.runner.transaction(async (client) => {
      const inserted = await client.query<PersistedMessage>(
        `WITH authorized AS (SELECT 1 FROM chat_fini.conversation_members WHERE conversation_id = $1::uuid AND user_id = $2::uuid)
         INSERT INTO chat_fini.messages (conversation_id, sender_id, kind, body, client_message_id)
         SELECT $1::uuid, $2::uuid, $3::text, $4::text, $5::text
         WHERE EXISTS (SELECT 1 FROM authorized)
         ON CONFLICT (sender_id, client_message_id) WHERE client_message_id IS NOT NULL DO NOTHING
         RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", kind, body, created_at AS "createdAt", client_message_id AS "clientMessageId"`,
        [input.conversationId, input.senderId, input.kind, input.body, input.clientMessageId ?? null],
      );
      let message = inserted.rows[0];
      if (!message && input.clientMessageId) {
        const existing = await client.query<StoredRow>(
          `SELECT m.id, m.conversation_id AS "conversationId", m.sender_id AS "senderId", m.kind, m.body,
                  m.created_at AS "createdAt", m.client_message_id AS "clientMessageId", e.id AS event_id
           FROM chat_fini.messages m
           LEFT JOIN chat_fini.events e ON e.aggregate_type = 'message' AND e.aggregate_id = m.id AND e.event_type = 'message.created'
           WHERE m.sender_id = $1::uuid AND m.client_message_id = $2 LIMIT 1`,
          [input.senderId, input.clientMessageId],
        );
        const row = existing.rows[0];
        if (!row) throw new Error("FORBIDDEN_CONVERSATION");
        if (row.conversationId !== input.conversationId || row.kind !== input.kind || row.body !== input.body) throw new Error("IDEMPOTENCY_KEY_REUSE");
        if (!row.event_id) throw new Error("MESSAGE_EVENT_MISSING");
        return { message: row, eventId: row.event_id };
      }
      if (!message) throw new Error("FORBIDDEN_CONVERSATION");
      const event = await client.query<{ id: string }>(
        `INSERT INTO chat_fini.events (event_type, aggregate_type, aggregate_id, actor_id, payload, occurred_at)
         VALUES ('message.created', 'message', $1::uuid, $2::uuid,
           jsonb_build_object('id',$1::uuid,'conversationId',$3::uuid,'senderId',$2::uuid,'kind',$4::text,'body',$5::text,'clientMessageId',$6::text,'createdAt',$7::timestamptz), $7::timestamptz)
         RETURNING id`,
        [message.id, input.senderId, input.conversationId, input.kind, input.body, input.clientMessageId ?? null, message.createdAt],
      );
      const eventId = event.rows[0]?.id;
      if (!eventId) throw new Error("MESSAGE_EVENT_CREATE_FAILED");
      return { message, eventId };
    });
  }
}
