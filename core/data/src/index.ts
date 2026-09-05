export interface DataRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRepository<User extends DataRecord = DataRecord> {
  getById(id: string): Promise<User | null>;
}

export interface ConversationRepository<Conversation extends DataRecord = DataRecord> {
  listForUser(userId: string): Promise<Conversation[]>;
}

export interface MessageRepository<Message extends DataRecord = DataRecord> {
  listByConversation(conversationId: string): Promise<Message[]>;
  create(message: Omit<Message, "id" | "createdAt">): Promise<Message>;
}

export interface DatabaseProvider {
  readonly id: string;
  users: UserRepository;
  conversations: ConversationRepository;
  messages: MessageRepository;
}
