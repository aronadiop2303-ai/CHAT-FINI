# Provider adapters

Concrete integrations for CHAT-FINI live here.

Current boundaries:

- Database: PostgreSQL adapter (Neon first)
- Identity: provider-independent contract in `core/identity`
- Realtime: transport abstraction before selecting a vendor
- Storage: object-storage abstraction before selecting a vendor
- AI: model/provider router through core contracts

No provider secret or vendor SDK belongs in `core/` or `packages/`.
