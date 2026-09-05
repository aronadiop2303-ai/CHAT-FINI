# CHAT-FINI realtime service

The service exposes the concrete WebSocket transport for CHAT-FINI while keeping the core realtime contract provider-neutral.

## Authentication

`NeonSessionValidator` validates a presented session token against `chat_fini.auth_sessions` using a SHA-256 token hash. It rejects missing, revoked and expired sessions.

The raw token is never sent to SQL.

## Authorization

`ConversationTopicAuthorizer` only permits topics in the form `conversation:<uuid>` when the authenticated user is a member of that conversation.

The same membership check is currently used for publish authorization. Client-originated message writes are **not** implemented by the WebSocket protocol; persistence remains a server-side application concern.

## Runtime

Required runtime configuration:

- `PORT` (optional, default `8787`)
- `DATABASE_URL` must be supplied by the deployment runtime when the PostgreSQL adapter is wired.

Database credentials must never be committed to Git.

## Production status

The transport boundary and real SQL-backed auth/authorization adapters are implemented. Production activation still requires wiring a PostgreSQL client into the server entrypoint, TLS/secure WebSocket termination, message persistence + event publication, rate limits, observability, reconnect behavior, and end-to-end tests.
