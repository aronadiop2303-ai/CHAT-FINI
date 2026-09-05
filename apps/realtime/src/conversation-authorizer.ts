import type { SqlClient } from "./neon-session-validator.js";
import type { TopicAuthorizer } from "./server.js";

export class ConversationTopicAuthorizer implements TopicAuthorizer {
  constructor(private readonly db: SqlClient) {}

  private conversationId(topic: string): string | null {
    const match = /^conversation:([0-9a-f-]{36})$/i.exec(topic);
    return match?.[1] ?? null;
  }

  async canSubscribe(userId: string, topic: string): Promise<boolean> {
    const conversationId = this.conversationId(topic);
    if (!conversationId) return false;
    const result = await this.db.query<{ allowed: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM chat_fini.conversation_members
         WHERE conversation_id = $1::uuid AND user_id = $2::uuid
       ) AS allowed`,
      [conversationId, userId],
    );
    return result.rows[0]?.allowed === true;
  }

  async canPublish(userId: string, topic: string): Promise<boolean> {
    return this.canSubscribe(userId, topic);
  }
}
