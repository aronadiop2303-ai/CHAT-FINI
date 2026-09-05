import { Pool, type PoolClient } from "@neondatabase/serverless";
import type { TransactionClient, TransactionRunner } from "./message-transaction.js";

export class NeonTransactionRunner implements TransactionRunner {
  constructor(private readonly pool: Pool) {}

  async transaction<T>(work: (client: TransactionClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch { /* preserve original failure */ }
      throw error;
    } finally {
      client.release();
    }
  }
}

export function createNeonPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("DATABASE_URL is required");
  return new Pool({ connectionString, max: Number(process.env.DB_POOL_MAX ?? 10) });
}
