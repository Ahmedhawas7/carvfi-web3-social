import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export class SolanaService {
  constructor() {
    this.connection = new Connection(
      clusterApiUrl('devnet'), // يمكنك تغييره لـ mainnet-beta لاحقاً
      'confirmed'
    );
    this.wallet = null;
  }

  async connectWallet() {
    try {
      if (window.phantom || window.solana) {
        const provider = window.phantom || window.solana;
        
        if (!provider.isConnected) {
          await provider.connect();
        }
        
        this.wallet = provider;
        return {
          success: true,
          publicKey: provider.publicKey.toString(),
          provider: provider
        };
      } else {
        throw new Error('Phantom wallet not installed');
      }
    } catch (error) {
      console.error('Error connecting Solana wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWalletBalance(publicKey) {
    try {
      const pubKey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  async getWalletActivity(publicKey) {
    try {
      const pubKey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubKey, { limit: 10 });
      
      const activities = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature);
          return {
            type: this.getTransactionType(tx),
            signature: sig.signature,
            timestamp: sig.blockTime * 1000,
            amount: this.getTransactionAmount(tx, publicKey),
            status: sig.confirmationStatus,
            description: this.getTransactionDescription(tx, publicKey)
          };
        })
      );

      return activities.filter(activity => activity !== null);
    } catch (error) {
      console.error('Error getting wallet activity:', error);
      return this.getMockActivities(publicKey);
    }
  }

  getTransactionType(transaction) {
    if (!transaction) return 'unknown';
    
    const instructions = transaction.transaction.message.instructions;
    if (instructions.some(ix => ix.programId?.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
      return 'token_transfer';
    } else if (instructions.some(ix => ix.programId?.toString() === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')) {
      return 'nft_transaction';
    } else {
      return 'transfer';
    }
  }

  getTransactionAmount(transaction, publicKey) {
    if (!transaction) return '0';
    
    try {
      const preBalances = transaction.meta.preBalances;
      const postBalances = transaction.meta.postBalances;
      const accountIndex = transaction.transaction.message.accountKeys.findIndex(
        key => key.toString() === publicKey
      );
      
      if (accountIndex !== -1) {
        const difference = (postBalances[accountIndex] - preBalances[accountIndex]) / LAMPORTS_PER_SOL;
        return Math.abs(difference).toFixed(4);
      }
    } catch (error) {
      console.error('Error calculating transaction amount:', error);
    }
    
    return '0';
  }

  getTransactionDescription(transaction, publicKey) {
    const type = this.getTransactionType(transaction);
    
    const descriptions = {
      'transfer': 'SOL Transfer',
      'token_transfer': 'Token Transfer',
      'nft_transaction': 'NFT Transaction',
      'unknown': 'Transaction'
    };
    
    return descriptions[type] || 'Transaction';
  }

  getMockActivities(publicKey) {
    // بيانات تجريبية للنشاط
    return [
      {
        type: 'transfer',
        signature: 'mock_sig_1',
        timestamp: Date.now() - 86400000,
        amount: '0.5',
        status: 'confirmed',
        description: 'SOL Transfer'
      },
      {
        type: 'token_transfer',
        signature: 'mock_sig_2',
        timestamp: Date.now() - 172800000,
        amount: '100',
        status: 'confirmed',
        description: 'Token Transfer'
      },
      {
        type: 'nft_transaction',
        signature: 'mock_sig_3',
        timestamp: Date.now() - 259200000,
        amount: '1',
        status: 'confirmed',
        description: 'NFT Mint'
      }
    ];
  }

  async getNFTs(publicKey) {
    try {
      // محاكاة بيانات NFTs (في الواقع تحتاج RPC خاص)
      return [
        {
          name: 'CARVFi NFT #1',
          image: 'https://via.placeholder.com/200x200/6366f1/ffffff?text=CARVFi',
          description: 'Exclusive CARVFi Community NFT',
          mint: 'mock_mint_1'
        },
        {
          name: 'Solana Punk #123',
          image: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=SOL',
          description: 'Rare Solana Punk Collection',
          mint: 'mock_mint_2'
        }
      ];
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  async getTokens(publicKey) {
    try {
      // محاكاة بيانات Tokens
      return [
        {
          symbol: 'SOL',
          balance: '2.5',
          value: '250.00',
          price: '100.00'
        },
        {
          symbol: 'CARV',
          balance: '1000',
          value: '50.00',
          price: '0.05'
        },
        {
          symbol: 'USDC',
          balance: '500',
          value: '500.00',
          price: '1.00'
        }
      ];
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }

  async sendTransaction(recipient, amount) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        feePayer: this.wallet.publicKey,
        instructions: [
          // سيتم إضافة تعليمات التحويل هنا
        ],
        recentBlockhash: (await this.connection.getRecentBlockhash()).blockhash
      };

      // في الواقع تحتاج إلى توقيع وإرسال المعاملة
      // const signedTx = await this.wallet.signTransaction(transaction);
      // const signature = await this.connection.sendRawTransaction(signedTx.serialize());

      return {
        success: true,
        signature: 'mock_signature_' + Date.now(),
        message: 'Transaction simulated successfully'
      };
    } catch (error) {
      console.error('Error sending transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getNetworkInfo() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      return {
        network: 'Solana Devnet',
        version: version['solana-core'],
        currentSlot: slot,
        blockHeight: await this.connection.getBlockHeight()
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        network: 'Solana Devnet',
        version: 'Unknown',
        currentSlot: 0,
        blockHeight: 0
      };
    }
  }

  // دالة للتحقق من صحة عنوان Solana
  isValidSolanaAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  // دالة لتحويل العنوان إلى صيغة مختصرة
  shortenAddress(address, chars = 4) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
}

export default SolanaService;
