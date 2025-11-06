// frontend/src/services/web3Service.js

export const CARV_NETWORK = {
  chainId: '0x18297', // 98951 in hexadecimal
  chainName: 'Carv SVM AI Agentic Chain',
  rpcUrls: ['https://svm.carv.io/chain'],
  blockExplorerUrls: ['https://explorer.carv.io/'],
  nativeCurrency: {
    name: 'CARV',
    symbol: 'CARV',
    decimals: 18
  }
};

export class CarvWeb3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
  }

  // دالة لربط المحفظة
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // طلب الوصول للحسابات
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        // التحقق من الشبكة
        await this.switchToCarvNetwork();
        
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        return {
          success: true,
          address: accounts[0],
          network: 'Carv SVM'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      return {
        success: false,
        error: 'MetaMask not installed'
      };
    }
  }

  // دالة للتحويل لشبكة Carv
  async switchToCarvNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CARV_NETWORK.chainId }],
      });
    } catch (switchError) {
      // إذا الشبكة مش موجودة في المحفظة، نضيفها
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CARV_NETWORK],
          });
        } catch (addError) {
          throw new Error('Failed to add Carv network');
        }
      }
      throw switchError;
    }
  }

  // الحصول على رصيد
  async getBalance(address) {
    if (!this.provider) return '0';
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

export default new CarvWeb3Service();