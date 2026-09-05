import type { ID, UserIdentity, Conversation, Message } from "../../../packages/contracts/src/index";

export type StoredUser = UserIdentity & {
  createdAt: string;
  updatedAt: string;
};

export type StoredConversation = Conversation & {
  createdAt: string;
};

export type StoredMessage = Message & {
  editedAt?: string;
  deletedAt?: string;
};

export interface NeonRepositoryContract {
  getUser(userId: ID): Promise<StoredUser | null>;
  listConversations(userId: ID): Promise<StoredConversation[]>;
  getConversation(conversationId: ID): Promise<StoredConversation | null>;
  createConversation(input: {
    kind: "direct" | "group" | "channel" | "system";
    title?: string;
    memberIds: ID[];
  }): Promise<StoredConversation>;
  listMessages(conversationId: ID): Promise<StoredMessage[]>;
  createMessage(input: {
    conversationId: ID;
    senderId: ID;
    kind: Message["kind"];
    body: string;
    clientMessageId?: string;
  }): Promise<StoredMessage>;
}
