// frontend/src/services/web3Service.js

// Carv SVM Testnet configuration
export const CARV_SVM_CONFIG = {
  name: 'Carv SVM Testnet',
  url: 'https://svm.carv.io/chain',
  chainId: 'carv-svm-testnet',
  symbol: 'CARV',
  explorer: 'https://explorer.carv.io/'
};

export class CarvSolanaService {
  constructor() {
    this.connection = null;
    this.wallet = null;
    this.publicKey = null;
    this.isConnected = false;
    this.setupConnection();
  }

  setupConnection() {
    // We'll setup connection when wallet connects
    this.connection = null;
  }

  // Check if any Solana wallet is available
  isWalletAvailable() {
    if (typeof window === 'undefined') return false;
    
    // Check for BackPack
    if (window.backpack) return true;
    
    // Check for other Solana wallets
    if (window.solana) return true;
    if (window.phantom) return true;
    
    return false;
  }

  // Get wallet provider
  getWalletProvider() {
    if (typeof window === 'undefined') return null;
    
    if (window.backpack) return window.backpack;
    if (window.solana) return window.solana;
    if (window.phantom) return window.phantom;
    
    return null;
  }

  // Connect to wallet
  async connectWallet() {
    const provider = this.getWalletProvider();
    
    if (!provider) {
      throw new Error('No Solana wallet found. Please install BackPack, Phantom, or Solflare.');
    }

    try {
      // Request connection
      await provider.connect();
      
      this.wallet = provider;
      this.publicKey = provider.publicKey;
      this.isConnected = true;

      // Setup connection with Carv SVM RPC
      this.connection = new (await import('@solana/web3.js')).Connection(
        CARV_SVM_CONFIG.url, 
        'confirmed'
      );

      console.log('Connected to wallet:', this.publicKey.toString());

      return {
        success: true,
        publicKey: this.publicKey.toString(),
        network: CARV_SVM_CONFIG.name,
        walletName: this.getWalletName(provider)
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Get wallet name
  getWalletName(provider) {
    if (provider === window.backpack) return 'BackPack';
    if (provider === window.solana) return 'Solana';
    if (provider === window.phantom) return 'Phantom';
    return 'Unknown';
  }

  // Disconnect wallet
  disconnectWallet() {
    if (this.wallet && this.wallet.disconnect) {
      this.wallet.disconnect();
    }
    
    this.wallet = null;
    this.publicKey = null;
    this.isConnected = false;
    this.connection = null;
  }

  // Get balance in CARV
  async getBalance() {
    if (!this.isConnected || !this.publicKey || !this.connection) {
      throw new Error('Wallet not connected');
    }

    try {
      const { LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const balance = await this.connection.getBalance(this.publicKey);
      return balance / LAMPORTS_PER_SOL; // Convert lamports to CARV
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      publicKey: this.publicKey ? this.publicKey.toString() : null,
      network: CARV_SVM_CONFIG.name,
      walletName: this.wallet ? this.getWalletName(this.wallet) : null
    };
  }
}

// Create singleton instance
const solanaService = new CarvSolanaService();
export default solanaService;