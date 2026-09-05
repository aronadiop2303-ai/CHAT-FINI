import type { AIProvider, AIRequest, AIResponse } from "../../../packages/contracts/src/index";

export class AIRouter {
  private readonly providers = new Map<string, AIProvider>();
  register(name: string, provider: AIProvider) { this.providers.set(name, provider); return this; }
  async generate(request: AIRequest, preferredProvider?: string): Promise<AIResponse> {
    const entries = preferredProvider ? [[preferredProvider, this.providers.get(preferredProvider)]] as const : [...this.providers.entries()];
    for (const [name, provider] of entries) {
      if (!provider) continue;
      try { return await provider.generate(request); } catch { /* fail over to next provider */ }
    }
    throw new Error("No AI provider is available");
  }
}
