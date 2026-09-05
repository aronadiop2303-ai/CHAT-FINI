import type { Conversation, ID } from "../../../packages/contracts/src/index";

export interface ConversationPort {
  list(): Promise<Conversation[]>;
  get(id: ID): Promise<Conversation | null>;
  create(input: Omit<Conversation, "id" | "updatedAt">): Promise<Conversation>;
}

export class InMemoryConversationRepository implements ConversationPort {
  private readonly items = new Map<ID, Conversation>();
  async list() { return [...this.items.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async get(id: ID) { return this.items.get(id) ?? null; }
  async create(input: Omit<Conversation, "id" | "updatedAt">) {
    const now = new Date().toISOString();
    const conversation: Conversation = { ...input, id: crypto.randomUUID(), updatedAt: now };
    this.items.set(conversation.id, conversation);
    return conversation;
  }
}
