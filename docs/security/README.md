# Security baseline

CHAT FINI treats identity, authorization, key management, transport security, data minimization, auditability and recovery as first-class concerns.

Rules:
- Secrets never enter source control.
- Provider credentials stay server-side.
- Every privileged operation is authorized independently.
- E2EE is a cryptographic implementation, not a UI label; it is only considered active after protocol and implementation verification.
- Connectors receive the minimum permissions needed for their capability.
- Security-sensitive changes require tests and review.
