const { ethers } = require ("ethers");
const MNEMONIC = "test test test test test test test test test test test junk"; // hardhat default mnemonic

/*
  params:
    provider: ethers provider
*/
function getPrivateKeys(provider) {
  const wallet0 = ethers.Wallet.fromMnemonic(MNEMONIC, `m/44'/60'/0'/0/0`);
  const wallet1 = ethers.Wallet.fromMnemonic(MNEMONIC, `m/44'/60'/0'/0/1`);
  const wallet2 = ethers.Wallet.fromMnemonic(MNEMONIC, `m/44'/60'/0'/0/2`);
  return [wallet0.connect(provider), wallet1.connect(provider), wallet2.connect(provider)];
}

module.exports = getPrivateKeys;