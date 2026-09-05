-- CHAT-FINI Neon repository SQL primitives.
-- Runtime adapters must bind parameters; never interpolate user input.

-- User
SELECT id, display_name, avatar_url, created_at, updated_at
FROM chat_fini.users
WHERE id = $1;

-- Conversations for a user
SELECT c.id, c.kind, c.title, c.created_at, c.updated_at
FROM chat_fini.conversations c
JOIN chat_fini.conversation_members cm ON cm.conversation_id = c.id
WHERE cm.user_id = $1
ORDER BY c.updated_at DESC;

-- Conversation membership + details
SELECT c.id, c.kind, c.title, c.created_at, c.updated_at
FROM chat_fini.conversations c
JOIN chat_fini.conversation_members cm ON cm.conversation_id = c.id
WHERE c.id = $1 AND cm.user_id = $2;

-- Messages (membership must be checked by the calling transaction/service)
SELECT id, conversation_id, sender_id, kind, body, client_message_id,
       created_at, edited_at, deleted_at
FROM chat_fini.messages
WHERE conversation_id = $1
ORDER BY created_at ASC;

-- Message insert. client_message_id supports idempotent mobile retries.
INSERT INTO chat_fini.messages
  (conversation_id, sender_id, kind, body, client_message_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, conversation_id, sender_id, kind, body, client_message_id,
          created_at, edited_at, deleted_at;
