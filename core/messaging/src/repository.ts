import type { ID, Message, MessageKind } from "../../../packages/contracts/src/index";

export interface MessageStore {
  listByConversation(conversationId: ID): Promise<Message[]>;
  create(input: {
    conversationId: ID;
    senderId: ID;
    kind: MessageKind;
    body: string;
    clientMessageId?: string;
  }): Promise<Message>;
}

export interface ConversationStore {
  listForUser(userId: ID): Promise<import("../../../packages/contracts/src/index").Conversation[]>;
}
