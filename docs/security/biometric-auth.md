# Biométrie et sécurité renforcée

## Statut

**Disponible plus tard — architecture préparée, activation non encore implémentée.**

CHAT-FINI prévoit une couche d'authentification locale renforcée pouvant exploiter les mécanismes natifs de chaque appareil :

- Face ID sur les appareils compatibles ;
- empreinte digitale / Touch ID ;
- Android BiometricPrompt ;
- passkeys ;
- clés de sécurité matérielles lorsque pertinentes ;
- stockage sécurisé des secrets via les mécanismes natifs de l'OS.

## Règles de sécurité

1. CHAT-FINI ne collecte ni ne stocke les données biométriques brutes.
2. La biométrie sert à déverrouiller une capacité ou un secret protégé localement.
3. L'implémentation dépend de l'adaptateur de plateforme (iOS, Android, Web/Desktop).
4. Le core reste indépendant du fournisseur et du système d'exploitation.
5. Une solution de secours sécurisée doit exister lorsque la biométrie n'est pas disponible.
6. L'activation en production devra être accompagnée de tests sur appareils réels et d'une revue de sécurité.

## Extensions de sécurité prévues

Également prévues pour une phase ultérieure :

- passkeys / WebAuthn ;
- MFA et authentification adaptative ;
- gestion avancée des sessions et appareils ;
- rotation et révocation des credentials ;
- hardware-backed keys lorsque disponibles ;
- détection de risque et verrouillage renforcé ;
- audit de sécurité et tests de pénétration.

## Principe

L'interface `BiometricAuthPort` du core définit le contrat. Les implémentations natives seront ajoutées plus tard dans les couches plateforme/infrastructure sans modifier le domaine métier de CHAT-FINI.

**Important :** tant que ces adaptateurs et leurs tests ne sont pas implémentés, l'interface constitue uniquement une capacité planifiée et ne doit pas être présentée comme une protection biométrique active.
