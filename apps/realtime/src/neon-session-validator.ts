import { createHash } from "node:crypto";
import type { SessionValidator } from "./server.js";

export interface SqlClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

export class NeonSessionValidator implements SessionValidator {
  constructor(private readonly db: SqlClient) {}

  async authenticate(token: string): Promise<{ userId: string } | null> {
    if (!token) return null;

    const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
    const result = await this.db.query<{ user_id: string }>(
      `SELECT user_id::text AS user_id
       FROM chat_fini.auth_sessions
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [tokenHash],
    );

    const row = result.rows[0];
    return row ? { userId: row.user_id } : null;
  }
}
