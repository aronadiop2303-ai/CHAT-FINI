import type { ID, UserIdentity } from "../../../packages/contracts/src/index";
import type { IdentityProvider, IdentitySession } from "./index";

export interface RegistrationInput {
  displayName: string;
  credentials: {
    identifier: string;
    secret: string;
  };
}

export interface AuthFlow {
  signIn(credentials: { identifier: string; secret: string }): Promise<IdentitySession>;
  signOut(): Promise<void>;
  currentUser(): Promise<UserIdentity | null>;
}

/**
 * Provider-agnostic authentication orchestration.
 * Concrete credential storage and token/session handling remain in infrastructure adapters.
 */
export class DefaultAuthFlow implements AuthFlow {
  constructor(private readonly identity: IdentityProvider) {}

  signIn(credentials: { identifier: string; secret: string }) {
    return this.identity.signIn(credentials);
  }

  signOut() {
    return this.identity.signOut();
  }

  async currentUser(): Promise<UserIdentity | null> {
    const session = await this.identity.getCurrentSession();
    if (!session) return null;
    return this.identity.getIdentity(session.user.id as ID);
  }
}
