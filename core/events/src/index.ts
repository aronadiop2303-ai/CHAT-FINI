import type { EventEnvelope, ID } from "../../../packages/contracts/src/index";

type Handler<T> = (event: EventEnvelope<T>) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<string, Set<Handler<any>>>();

  on<T>(type: string, handler: Handler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler);
    this.handlers.set(type, set);
    return () => set.delete(handler);
  }

  async emit<T>(type: string, payload: T, id: ID = crypto.randomUUID()): Promise<void> {
    const event: EventEnvelope<T> = { id, type, occurredAt: new Date().toISOString(), payload };
    for (const handler of this.handlers.get(type) ?? []) await handler(event);
  }
}
