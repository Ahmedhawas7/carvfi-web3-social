// src/services/web3Service.js
import WalletConnectService from './WalletConnectService';

// Carv SVM Testnet configuration
export const CARV_SVM_CONFIG = {
  name: 'Carv SVM Testnet',
  url: 'https://svm.carv.io/chain',
  chainId: 'carv-svm-testnet',
  symbol: 'CARV',
  explorer: 'https://explorer.carv.io/'
};

export class CarvWeb3Service {
  constructor() {
    this.walletConnectService = new WalletConnectService();
    this.currentProvider = null;
    this.isConnected = false;
    this.publicKey = null;
    this.balance = '0';
  }

  // Check available connection methods
  getAvailableWallets() {
    const wallets = [];
    
    // Check for BackPack
    if (typeof window !== 'undefined' && window.backpack) {
      wallets.push({
        name: 'BackPack',
        type: 'injected',
        icon: '🎒'
      });
    }
    
    // Check for other Solana wallets
    if (typeof window !== 'undefined' && window.solana) {
      wallets.push({
        name: 'Solana',
        type: 'injected',
        icon: '🔷'
      });
    }
    
    // Check for Phantom
    if (typeof window !== 'undefined' && window.phantom) {
      wallets.push({
        name: 'Phantom',
        type: 'injected',
        icon: '👻'
      });
    }
    
    // Always available: WalletConnect
    wallets.push({
      name: 'WalletConnect',
      type: 'walletconnect',
      icon: '🔗',
      description: 'Connect any wallet'
    });
    
    return wallets;
  }

  // Connect using specific wallet
  async connectWallet(walletType = 'walletconnect') {
    try {
      if (walletType === 'walletconnect') {
        const result = await this.walletConnectService.connectWallet();
        this.currentProvider = 'walletconnect';
        this.isConnected = true;
        this.publicKey = result.publicKey;
        return result;
      } else {
        // Direct connection for injected wallets
        return await this.connectInjectedWallet(walletType);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Connect to injected wallet (BackPack, Phantom, etc.)
  async connectInjectedWallet(walletName) {
    let provider;
    
    switch (walletName.toLowerCase()) {
      case 'backpack':
        provider = window.backpack;
        break;
      case 'solana':
        provider = window.solana;
        break;
      case 'phantom':
        provider = window.phantom;
        break;
      default:
        throw new Error(`Unsupported wallet: ${walletName}`);
    }

    if (!provider) {
      throw new Error(`${walletName} wallet not found`);
    }

    try {
      await provider.connect();
      this.currentProvider = walletName;
      this.isConnected = true;
      this.publicKey = provider.publicKey;

      return {
        success: true,
        publicKey: this.publicKey.toString(),
        network: CARV_SVM_CONFIG.name,
        walletName: walletName
      };
    } catch (error) {
      console.error(`Failed to connect to ${walletName}:`, error);
      throw error;
    }
  }

  async getBalance() {
    if (!this.isConnected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      if (this.currentProvider === 'walletconnect') {
        this.balance = await this.walletConnectService.getBalance();
      } else {
        // For injected wallets, use direct connection
        const { Connection, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
        const connection = new Connection(CARV_SVM_CONFIG.url, 'confirmed');
        const balance = await connection.getBalance(this.publicKey);
        this.balance = balance / LAMPORTS_PER_SOL;
      }
      
      return this.balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    if (this.currentProvider === 'walletconnect') {
      await this.walletConnectService.disconnectWallet();
    } else if (this.currentProvider && window[this.currentProvider]) {
      await window[this.currentProvider].disconnect();
    }
    
    this.currentProvider = null;
    this.isConnected = false;
    this.publicKey = null;
    this.balance = '0';
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      publicKey: this.publicKey ? this.publicKey.toString() : null,
      network: CARV_SVM_CONFIG.name,
      walletName: this.currentProvider,
      balance: this.balance
    };
  }

  isAnyWalletAvailable() {
    const wallets = this.getAvailableWallets();
    return wallets.length > 0;
  }
}

// Create singleton instance
const web3Service = new CarvWeb3Service();
export default web3Service;