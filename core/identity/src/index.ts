import type { ID, UserIdentity } from "../../../packages/contracts/src/index";

export interface IdentitySession {
  user: UserIdentity;
  accessToken?: string;
  expiresAt?: string;
}

export interface IdentityPort {
  getCurrentSession(): Promise<IdentitySession | null>;
  signOut(): Promise<void>;
}

export class InMemoryIdentity implements IdentityPort {
  constructor(private session: IdentitySession | null = null) {}
  async getCurrentSession() { return this.session; }
  async signOut() { this.session = null; }
}

export function isSameUser(a: ID, b: ID): boolean {
  return a === b;
}
