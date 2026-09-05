import type { EventEnvelope, ID } from "../../../packages/contracts/src/index";

export interface SyncCursor { stream: string; position: string; }
export interface SyncPort {
  publish<T>(event: EventEnvelope<T>): Promise<void>;
  pull(cursor?: SyncCursor): Promise<{ events: EventEnvelope[]; cursor: SyncCursor | null }>;
}

export class InMemorySync implements SyncPort {
  private readonly events: EventEnvelope[] = [];
  async publish<T>(event: EventEnvelope<T>) { this.events.push(event); }
  async pull(cursor?: SyncCursor) {
    const start = cursor ? Number(cursor.position) + 1 : 0;
    const events = this.events.slice(start);
    const next = events.length ? String(start + events.length - 1) : cursor?.position ?? null;
    return { events, cursor: next === null ? null : { stream: "local", position: next } };
  }
}
