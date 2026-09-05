# Database infrastructure

This boundary contains concrete database adapters. The CHAT-FINI core depends on contracts, never on a vendor SDK.

Planned adapters:

- `neon/` — Neon/Lakebase PostgreSQL
- `supabase/` — Supabase PostgreSQL
- `aws/` — managed PostgreSQL on AWS when required

Selection is configuration-driven. A provider can be replaced without rewriting messaging, identity, memory, or UI modules.
