# CHAT-FINI WebSocket transport

Production transport boundary for realtime delivery.

The transport must authenticate the connection, authorize conversation topics, fan out persisted events, reconnect safely, and never expose database credentials to clients.

Implementation target: Rust server when concurrency and connection scale justify it; TypeScript remains valid for an initial service if it reduces delivery risk. The core `RealtimePort` remains provider-neutral.
