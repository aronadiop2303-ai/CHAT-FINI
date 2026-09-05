export interface AuthorizationContext {
  userId: string;
  roles: readonly string[];
}

export interface CapabilityPolicy {
  capability: string;
  allowedRoles: readonly string[];
}

export class CapabilityGuard {
  constructor(private readonly policies: readonly CapabilityPolicy[]) {}
  can(context: AuthorizationContext, capability: string): boolean {
    const policy = this.policies.find((item) => item.capability === capability);
    return !!policy && context.roles.some((role) => policy.allowedRoles.includes(role));
  }
  assert(context: AuthorizationContext, capability: string): void {
    if (!this.can(context, capability)) throw new Error(`Capability denied: ${capability}`);
  }
}
