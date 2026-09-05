# Authentication flow

CHAT-FINI uses a vendor-neutral identity boundary.

Flow:

1. Credential provider verifies the user's credentials.
2. `auth_identities` maps the external provider subject to a CHAT-FINI user.
3. A missing user is created in `chat_fini.users`.
4. A session is created in `chat_fini.auth_sessions`.
5. Only a token hash is persisted by the database layer.
6. Sessions can be revoked per device/session.

Biometric authentication (Face ID, fingerprint, Touch ID, Android biometrics, passkeys and hardware security keys) remains a platform capability planned for a later implementation. Raw biometric data never enters the core or database.
