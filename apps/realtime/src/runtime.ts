import { NeonSessionValidator } from "./neon-session-validator.js";
import { ConversationTopicAuthorizer } from "./conversation-authorizer.js";
import { NeonMessageStore } from "./message-transaction.js";
import { MessageService } from "./message-service.js";
import { createNeonPool, NeonTransactionRunner } from "./neon-transaction-runner.js";
import { createRealtimeServer } from "./server.js";

export function createProductionRealtimeServer() {
  const pool = createNeonPool();
  const sessions = new NeonSessionValidator(pool);
  const authorization = new ConversationTopicAuthorizer(pool);
  const store = new NeonMessageStore(new NeonTransactionRunner(pool));
  const messageService = new MessageService(store, {
    publish: async () => {
      // Event publication is connected by the transport adapter after commit.
    },
  });
  return { ...createRealtimeServer({ sessions, authorization, messageService }), pool };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runtime = createProductionRealtimeServer();
  runtime.server.listen(runtime.port, () => console.log(`CHAT-FINI realtime listening on :${runtime.port}`));
}
