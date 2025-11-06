// src/services/WalletConnectService.js
import { UniversalProvider } from '@walletconnect/universal-provider';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Carv SVM Testnet configuration
export const CARV_SVM_CONFIG = {
  name: 'Carv SVM Testnet',
  url: 'https://svm.carv.io/chain',
  chainId: 'carv-svm-testnet',
  symbol: 'CARV',
  explorer: 'https://explorer.carv.io/'
};

export class WalletConnectService {
  constructor() {
    this.provider = null;
    this.connection = null;
    this.publicKey = null;
    this.isConnected = false;
    this.walletConnectProjectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Need to get from walletconnect.com
  }

  async initialize() {
    try {
      this.provider = await UniversalProvider.init({
        projectId: this.walletConnectProjectId,
        relayUrl: 'wss://relay.walletconnect.com'
      });

      this.connection = new Connection(CARV_SVM_CONFIG.url, 'confirmed');
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    }
  }

  setupEventListeners() {
    if (!this.provider) return;

    this.provider.on('display_uri', (uri) => {
      // Show QR code modal
      this.showQRCodeModal(uri);
    });

    this.provider.on('connect', () => {
      console.log('WalletConnect connected');
      this.isConnected = true;
    });

    this.provider.on('disconnect', () => {
      console.log('WalletConnect disconnected');
      this.isConnected = false;
      this.publicKey = null;
    });

    this.provider.on('session_update', ({ params }) => {
      console.log('Session updated:', params);
    });
  }

  showQRCodeModal(uri) {
    // Create QR code modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
        <h3>Scan with BackPack</h3>
        <div id="qrcode" style="margin: 20px 0;"></div>
        <button onclick="this.closest('div').parentElement.remove()" 
                style="background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generate QR code (you might want to use a proper QR code library)
    const qrContainer = modal.querySelector('#qrcode');
    qrContainer.innerHTML = `
      <div style="padding: 20px; border: 2px dashed #ccc;">
        <p>URI: ${uri.substring(0, 50)}...</p>
        <p>Copy this URI and paste in BackPack wallet</p>
      </div>
    `;
  }

  async connectWallet() {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const { uri, approval } = await this.provider.connect({
        namespaces: {
          solana: {
            methods: [
              'solana_signTransaction',
              'solana_signMessage',
              'solana_signAndSendTransaction'
            ],
            chains: [`solana:${CARV_SVM_CONFIG.chainId}`],
            events: ['accountsChanged', 'chainChanged']
          }
        }
      });

      if (uri) {
        this.showQRCodeModal(uri);
      }

      const session = await approval();
      console.log('WalletConnect session:', session);

      // Extract public key from session
      const accounts = session.namespaces.solana.accounts;
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const pubkey = account.split(':')[2];
        this.publicKey = new PublicKey(pubkey);
        this.isConnected = true;

        return {
          success: true,
          publicKey: this.publicKey.toString(),
          network: CARV_SVM_CONFIG.name,
          session: session
        };
      }

      throw new Error('No accounts found in session');

    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      throw error;
    }
  }

  async getBalance() {
    if (!this.isConnected || !this.publicKey || !this.connection) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.connection.getBalance(this.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    if (this.provider) {
      await this.provider.disconnect();
    }
    
    this.isConnected = false;
    this.publicKey = null;
    
    // Remove any QR code modals
    const modals = document.querySelectorAll('[style*="z-index: 10000"]');
    modals.forEach(modal => modal.remove());
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      publicKey: this.publicKey ? this.publicKey.toString() : null,
      network: CARV_SVM_CONFIG.name
    };
  }
}

// Create singleton instance
const walletConnectService = new WalletConnectService();
export default walletConnectService;