import type { ID, Message, MessageKind, MessagingPort } from "../../../packages/contracts/src/index";

export interface SendMessageInput {
  conversationId: ID;
  senderId: ID;
  kind?: MessageKind;
  body: string;
}

export class InMemoryMessaging implements MessagingPort {
  private readonly messages: Message[] = [];

  async listConversations() { return []; }

  async listMessages(conversationId: ID) {
    return this.messages.filter((message) => message.conversationId === conversationId);
  }

  async sendMessage(input: Omit<Message, "id" | "createdAt" | "status">) {
    const message: Message = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    this.messages.push(message);
    return message;
  }
}
