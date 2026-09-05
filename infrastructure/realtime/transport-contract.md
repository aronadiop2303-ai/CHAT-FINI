# CHAT-FINI realtime transport

The core realtime module defines the provider-neutral `RealtimePort`. Concrete transports belong here.

## Required guarantees

- authenticated connections only;
- topic authorization before subscription and publish;
- reconnect with bounded backoff;
- server-side fan-out;
- ordered delivery per conversation where the transport supports ordering;
- duplicate-safe event handling using event IDs;
- explicit connection state;
- no database credentials in web/mobile clients.

## Provider strategy

The first production transport can be a dedicated WebSocket service. A provider-native realtime service may be added later as an adapter, without changing the core contracts.

Realtime is not considered production-active until the concrete transport, authentication, authorization, reconnect behavior, persistence integration and end-to-end tests are implemented and verified.
