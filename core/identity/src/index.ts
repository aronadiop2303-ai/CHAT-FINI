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
