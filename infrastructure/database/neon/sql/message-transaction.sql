-- The application must execute this statement inside a single PostgreSQL transaction.
-- Membership is checked before insertion; the message and its event are committed atomically.

WITH authorized AS (
  SELECT 1
  FROM chat_fini.conversation_members
  WHERE conversation_id = $1::uuid
    AND user_id = $2::uuid
), inserted_message AS (
  INSERT INTO chat_fini.messages (
    conversation_id,
    sender_id,
    kind,
    body,
    client_message_id
  )
  SELECT $1::uuid, $2::uuid, $3::text, $4::text, $5::text
  WHERE EXISTS (SELECT 1 FROM authorized)
  RETURNING id, conversation_id, sender_id, kind, body, client_message_id, created_at
)
INSERT INTO chat_fini.events (
  event_type,
  aggregate_type,
  aggregate_id,
  actor_id,
  payload,
  occurred_at
)
SELECT
  'message.created',
  'message',
  id,
  sender_id,
  jsonb_build_object(
    'id', id,
    'conversationId', conversation_id,
    'senderId', sender_id,
    'kind', kind,
    'body', body,
    'clientMessageId', client_message_id,
    'createdAt', created_at
  ),
  created_at
FROM inserted_message
RETURNING id AS event_id;

-- If no row is returned, the sender is not a member of the conversation.
-- The service must treat that case as authorization failure and roll back.
