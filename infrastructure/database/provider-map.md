# CHAT-FINI provider map

| Capability | Primary candidate | Fallback candidates |
|---|---|---|
| Relational data | PostgreSQL | Neon, Supabase, AWS RDS/Aurora |
| Vector search | pgvector | dedicated vector service when scale requires it |
| Realtime | dedicated WebSocket/event transport | Supabase Realtime |
| Object storage | S3-compatible | Supabase Storage, Cloudflare R2 |
| Cache/presence | Redis-compatible | provider-native cache |
| Search | PostgreSQL FTS initially | OpenSearch/Elasticsearch |

The map is a decision record, not a hard dependency. Concrete integrations live below `infrastructure/`; domain code uses contracts from `core/data` and `packages/contracts`.
