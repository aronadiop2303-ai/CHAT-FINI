export interface PersistedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  kind: "text" | "image" | "video" | "file" | "audio" | "system";
  body: string;
  createdAt: string;
  clientMessageId?: string;
}

export interface MessageStore {
  createMessageAndEvent(input: {
    conversationId: string;
    senderId: string;
    kind: PersistedMessage["kind"];
    body: string;
    clientMessageId?: string;
  }): Promise<{ message: PersistedMessage; eventId: string }>;
}

export interface MessageEventPublisher {
  publish(conversationId: string, event: {
    id: string;
    type: "message.created";
    occurredAt: string;
    payload: PersistedMessage;
  }): Promise<void>;
}

export class MessageService {
  constructor(
    private readonly store: MessageStore,
    private readonly publisher: MessageEventPublisher,
  ) {}

  async send(input: Parameters<MessageStore["createMessageAndEvent"]>[0]): Promise<PersistedMessage> {
    const { message, eventId } = await this.store.createMessageAndEvent(input);
    await this.publisher.publish(message.conversationId, {
      id: eventId,
      type: "message.created",
      occurredAt: message.createdAt,
      payload: message,
    });
    return message;
  }
}
