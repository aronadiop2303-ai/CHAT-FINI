export type ID = string;

export type MessageKind = "text" | "image" | "video" | "file" | "audio" | "system";

export interface UserIdentity {
  id: ID;
  displayName: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: ID;
  title?: string;
  participants: ID[];
  updatedAt: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  kind: MessageKind;
  body: string;
  createdAt: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface MessagingPort {
  listConversations(): Promise<Conversation[]>;
  listMessages(conversationId: ID): Promise<Message[]>;
  sendMessage(input: Omit<Message, "id" | "createdAt" | "status">): Promise<Message>;
}

export interface AIRequest {
  model?: string;
  input: string;
  conversationId?: ID;
}

export interface AIResponse {
  text: string;
  model: string;
  provider: string;
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}

export interface ConnectorPort {
  readonly id: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: Message): Promise<void>;
}

export interface EventEnvelope<T = unknown> {
  id: ID;
  type: string;
  occurredAt: string;
  payload: T;
}
