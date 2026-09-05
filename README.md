# CHAT FINI

Production foundation for a cross-platform communication platform: web, mobile, messaging, identity, sync, security, AI, memory, connectors and extensibility.

## Principles
- Modular core with stable contracts and replaceable adapters.
- Security and privacy by design; no fake claims of end-to-end encryption until the cryptographic implementation is verified.
- Web and mobile share domain contracts without coupling UI to infrastructure.
- Providers (AI, transport, storage, realtime) stay behind explicit interfaces.
- Google AI Studio and Blink are not project dependencies or runtime components. Gemini may be integrated as an AI provider.

## Workspace
- `apps/web` — web application
- `apps/mobile` — Expo/React Native application
- `core/*` — product domain modules
- `infrastructure/*` — concrete adapters
- `packages/*` — shared contracts, UI and configuration
- `docs/*` — architecture, security and roadmap
- `tests/*` — cross-module tests
