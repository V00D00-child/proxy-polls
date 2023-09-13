
const { network } = require("hardhat");
const path = require("path");

async function main() {
  if (network.config.chainId !== 1337 && network.config.chainId !== 31337) {
    console.log('NOT deploying contracts. use pre-deployed contracts')
    process.exit(1)
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const PresidentialElection = await ethers.getContractFactory("PresidentialElection");
  const presidentialElection = await PresidentialElection.deploy();
  await presidentialElection.deployed();

  console.log("PresidentialElection address:", presidentialElection.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(presidentialElection);
}

function saveFrontendFiles(contract) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "dapp", "src", "contracts", ``);

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ PresidentialElection: contract.address }, undefined, 2)
  );

  const PresidentialElectionArtifact = artifacts.readArtifactSync("PresidentialElection");

  fs.writeFileSync(
    path.join(contractsDir, "PresidentialElection.json"),
    JSON.stringify(PresidentialElectionArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
