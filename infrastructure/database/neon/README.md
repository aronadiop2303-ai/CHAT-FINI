# Neon database adapter

This adapter is the PostgreSQL implementation boundary for CHAT-FINI.

Rules:

- Domain/core modules must not import the Neon SDK.
- SQL access belongs here or behind repository interfaces from `core/data`.
- Connection credentials must come from runtime secrets, never source control.
- Provider selection remains configuration-driven so Neon can be replaced without rewriting the core.

Implemented schema lives in the `chat_fini` PostgreSQL schema on the CHAT-FINI Neon project.
