# Architecture

```text
CHAT-FINI
├── apps
│   ├── web
│   └── mobile
├── core
│   ├── identity
│   ├── messaging
│   ├── conversations
│   ├── contacts
│   ├── presence
│   ├── media
│   ├── calls
│   ├── sync
│   ├── offline
│   ├── security
│   ├── ai
│   ├── memory
│   ├── connectors
│   ├── events
│   └── extensions
├── infrastructure
│   ├── database
│   ├── realtime
│   ├── storage
│   ├── transport
│   └── providers
├── packages
│   ├── contracts
│   ├── ui
│   └── config
├── docs
└── tests
```

The dependency direction is intentional: apps depend on core contracts; core depends on abstractions; infrastructure implements those abstractions. UI must never become the source of business rules.
