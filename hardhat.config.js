require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    carvTestnet: {
      url: "https://testnet.carv.io/rpc",
      chainId: 1234, // تأكد من الـ Chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
