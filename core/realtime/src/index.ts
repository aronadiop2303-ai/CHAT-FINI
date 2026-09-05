import type { EventEnvelope, ID } from "../../../packages/contracts/src/index";

export interface RealtimeSubscription {
  readonly id: ID;
  unsubscribe(): Promise<void>;
}

export interface RealtimePort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe<T>(topic: string, handler: (event: EventEnvelope<T>) => void | Promise<void>): Promise<RealtimeSubscription>;
  publish<T>(topic: string, event: EventEnvelope<T>): Promise<void>;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface RealtimeState {
  state: ConnectionState;
  lastConnectedAt?: string;
  lastError?: string;
}

export class InMemoryRealtime implements RealtimePort {
  private readonly subscriptions = new Map<string, Set<(event: EventEnvelope) => void | Promise<void>>>();
  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async subscribe<T>(topic: string, handler: (event: EventEnvelope<T>) => void | Promise<void>): Promise<RealtimeSubscription> {
    const set = this.subscriptions.get(topic) ?? new Set();
    set.add(handler as (event: EventEnvelope) => void | Promise<void>);
    this.subscriptions.set(topic, set);
    const id = crypto.randomUUID();
    return {
      id,
      unsubscribe: async () => set.delete(handler as (event: EventEnvelope) => void | Promise<void>),
    };
  }

  async publish<T>(topic: string, event: EventEnvelope<T>): Promise<void> {
    if (!this.connected) throw new Error("Realtime transport is not connected");
    for (const handler of this.subscriptions.get(topic) ?? []) await handler(event);
  }
}
