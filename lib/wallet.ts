export type WalletProvider = "APPLE" | "GOOGLE";

export interface WalletPassRequest {
  provider: WalletProvider;
  entryUrl: string;
}

export interface WalletPassAdapter {
  createSignedPass(request: WalletPassRequest): Promise<Uint8Array | string>;
}

export class UnconfiguredWalletAdapter implements WalletPassAdapter {
  async createSignedPass(request: WalletPassRequest): Promise<Uint8Array | string> {
    void request;
    throw new Error("La signature Wallet sera activée avec les certificats de production.");
  }
}

export function getWalletAdapter(): WalletPassAdapter {
  return new UnconfiguredWalletAdapter();
}
