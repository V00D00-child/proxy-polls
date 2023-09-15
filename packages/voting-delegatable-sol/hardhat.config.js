require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require('dotenv').config();

const optimizerEnabled = !process.env.OPTIMIZER_DISABLED;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {
      url: process.env.ETH_CLIENT || 'http://localhost:8545/',
      chainId: process.env.ETH_CLIENT_CHAINID || 1337,
    },
  },
  gasReporter: {
    enabled: true
  },
  solidity: {
    version: '0.8.15',
    settings: {
      optimizer: {
        enabled: optimizerEnabled,
        runs: 200,
      },
      evmVersion: 'istanbul',
    },
  },
};
