
declare global {
  interface Window {
    polkadotExtension: {
      enable: () => Promise<void>;
      accounts: () => Promise<InjectedAccountWithMeta[]>;
    };
  }
}