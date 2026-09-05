# Roadmap

## Foundation
- Workspace and application shells
- Stable domain contracts
- Identity and session boundaries
- Persistence and realtime adapters
- Automated typecheck/build

## Communication core
- Conversations and messages
- Presence and receipts
- Media pipeline
- Offline queue and multi-device sync
- Calls/WebRTC boundary

## Intelligence
- Provider-neutral AI router
- Conversation memory
- Tool/capability permissions
- OMNI integration boundary

## Connectors
- Connector SDK and event normalization
- External messaging integrations added one by one with explicit permissions

Each stage must be additive: new providers and clients should implement existing contracts instead of forcing a rewrite of the core.
