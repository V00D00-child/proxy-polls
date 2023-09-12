# Account Abstraction Boilerplate

ProxyPolls is a decentralized voting platform built on Web3 technology. It enables users to create and manage revocable Counterfactual Delegations, allowing them to delegate their votes to trusted individuals. Take control of your voting power with ProxyPolls and participate in shaping the future of politics.

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
npm run compile
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

- `MNEMONIC`: and is set to the default seend phrase of hardhat accounts. The first account of the hardhat accounts is used as the bundler signer.
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
