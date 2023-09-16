# ProxyPolls 🗳️
<p align="left">
  <img src="https://img.shields.io/badge/node-18.x-green" alt="Node Version">
  <img src="https://img.shields.io/badge/solidity-0.8.15-blue" alt="Solidity Version">
  <img src="https://github.com/V00D00-child/proxy-polls/actions/workflows/build.yml/badge.svg?branch=main">
</p>

<p align="left">
  ProxyPolls is a decentralized voting platform built on Web3 technology. It enables users to create and manage revocable Counterfactual Delegations, allowing them to delegate their votes to trusted individuals. Take control of your voting power with ProxyPolls and participate in shaping the future of politics.
</p>


## Insipiration

The inspiration for ProxyPolls idea came from the upcoming US 2024 presidential election. It would be cool to run a social experiment in crypto land where you have presidential voting on-chain. Trying to answer 3 questions:
1. If we allow people to delegate their presidential votes, who will they delegate their vote to?(Elon Musk, or Kim Kardashian:grin:)
2. Is voting on-chain more efficient than the current way the US does voting? 
3. Can we tokenize voter registration cards?

## Development todo list
1. [ ] Create a Voter registration contract using Soulbound tokens
2. [ ] Update the PresidentialElection contract to use the [Revocation Enforcer](https://delegatable.org/docs/enforcers/revocation-enforcer)
3. [ ] Update the PresidentialElection contract to use the Voter registration contract before voting
4. [ ] Update PresidentialElection contract to use the real-world time for voting to close with Chainlink
5. [ ] Create a dapp to allow users to register and vote on-chain

## Start local geth node 

```sh
npm run node
```

## Testing
```sh
npm run test
```

## Compiling contracts

```sh
npm run build
```

## Deploying contract to a local node
Follow the steps below to deploy the contracts to a local node.

### Voting-delegatable contracts

```sh
npm run deploy:voting
```

### ERC-4337 Account Abstraction contracts

```sh
npm run deploy:aa
```

### Deploy all contracts

```sh
npm run depoly:all
```

## Run ERC-4337 Bundler(Transeptor)
We can use use `.env.sample` to create .env file with your `MNEMONIC` and `BENEFICIARY`.

- `MNEMONIC`: and is set to the default seed phrase of hardhat accounts. The first account of the hardhat accounts is used as the bundler signer.
- `BENEFICIARY`: is set to the second account of the hardhat accounts.

Then, we can fund the bundler signer account with some ETH:
```sh
npm run fund 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

Finally, we can run the ERC-4337 Bundler(Transeptor)

```sh
npm run bundler
```

The Bundler will start running on [http://localhost:3000/rpc](http://localhost:3000/rpc).


**Happy _building_!**
