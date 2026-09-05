import type { ID, UserIdentity } from "../../../packages/contracts/src/index";

export interface IdentitySession {
  user: UserIdentity;
  accessToken?: string;
  expiresAt?: string;
}

export interface IdentityCredentials {
  identifier: string;
  secret: string;
}

export interface IdentityProvider {
  readonly id: string;
  signIn(credentials: IdentityCredentials): Promise<IdentitySession>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<IdentitySession | null>;
  getIdentity(userId: ID): Promise<UserIdentity | null>;
}

export type BiometricMethod =
  | "face_id"
  | "fingerprint"
  | "touch_id"
  | "android_biometric"
  | "passkey"
  | "hardware_security_key";

export type BiometricAvailability =
  | "available"
  | "unavailable"
  | "not_configured"
  | "temporarily_locked";

export interface BiometricCapability {
  method: BiometricMethod;
  availability: BiometricAvailability;
}

export interface BiometricAuthPort {
  readonly id: string;
  getCapabilities(): Promise<BiometricCapability[]>;
  authenticate(reason: string): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  enable(): Promise<void>;
  disable(): Promise<void>;
}

/** Authentication persistence boundary. Implementations live in infrastructure/. */
export interface IdentityRepository {
  findUserByIdentity(provider: string, providerSubject: string): Promise<UserIdentity | null>;
  createUser(user: Omit<UserIdentity, "id">): Promise<UserIdentity>;
  linkIdentity(userId: ID, provider: string, providerSubject: string): Promise<void>;
  createSession(userId: ID, deviceId?: ID): Promise<IdentitySession>;
  revokeSession(accessToken: string): Promise<void>;
  getSession(accessToken: string): Promise<IdentitySession | null>;
}

export interface CredentialVerifier {
  readonly provider: string;
  verify(credentials: IdentityCredentials): Promise<{
    subject: string;
    identity: Omit<UserIdentity, "id">;
  } | null>;
}

/** Vendor-neutral orchestration; concrete credential/database adapters stay outside core. */
export class DefaultAuthFlow implements IdentityProvider {
  readonly id = "default-auth";
  private currentToken: string | null = null;

  constructor(
    private readonly repository: IdentityRepository,
    private readonly verifier: CredentialVerifier,
  ) {}

  async signIn(credentials: IdentityCredentials): Promise<IdentitySession> {
    const verified = await this.verifier.verify(credentials);
    if (!verified) throw new Error("Invalid credentials");

    let user = await this.repository.findUserByIdentity(this.verifier.provider, verified.subject);
    if (!user) {
      user = await this.repository.createUser(verified.identity);
      await this.repository.linkIdentity(user.id, this.verifier.provider, verified.subject);
    }

    const session = await this.repository.createSession(user.id);
    this.currentToken = session.accessToken ?? null;
    return session;
  }

  async signOut(): Promise<void> {
    if (this.currentToken) await this.repository.revokeSession(this.currentToken);
    this.currentToken = null;
  }

  async getCurrentSession(): Promise<IdentitySession | null> {
    return this.currentToken ? this.repository.getSession(this.currentToken) : null;
  }

  async getIdentity(userId: ID): Promise<UserIdentity | null> {
    const session = await this.getCurrentSession();
    return session?.user.id === userId ? session.user : null;
  }
}

/** Compatibility port for the initial in-memory implementation. */
export interface IdentityPort {
  getCurrentSession(): Promise<IdentitySession | null>;
  signOut(): Promise<void>;
}

export class InMemoryIdentity implements IdentityPort, IdentityProvider {
  readonly id = "memory";

  constructor(private session: IdentitySession | null = null) {}

  async signIn(): Promise<IdentitySession> {
    if (!this.session) throw new Error("No in-memory identity configured");
    return this.session;
  }

  async getCurrentSession() {
    return this.session;
  }

  async getIdentity(userId: ID) {
    return this.session?.user.id === userId ? this.session.user : null;
  }

  async signOut() {
    this.session = null;
  }
}

export function isSameUser(a: ID, b: ID): boolean {
  return a === b;
}
