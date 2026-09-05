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

/**
 * Optional device-level biometric authentication boundary.
 *
 * Platform adapters (Face ID, Touch ID, Android BiometricPrompt, passkeys,
 * secure hardware, etc.) belong outside the core and can be added later.
 * The core must never receive or store raw biometric data.
 */
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
