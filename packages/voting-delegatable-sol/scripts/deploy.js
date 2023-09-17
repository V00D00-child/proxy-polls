
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

  // deploy the PresidentialElection contract
  const PresidentialElection = await ethers.getContractFactory("PresidentialElection");
  const presidentialElection = await PresidentialElection.deploy();
  await presidentialElection.deployed();

  console.log("PresidentialElection address:", presidentialElection.address);

  // deploy the RevocationEnforcer contract
  const RevocationEnforcer = await ethers.getContractFactory("RevocationEnforcer");
  const revocationEnforcer = await RevocationEnforcer.deploy();
  await revocationEnforcer.deployed();

  console.log("RevocationEnforcer address:", revocationEnforcer.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles({ 
    RevocationEnforcer: revocationEnforcer.address,
    PresidentialElection: presidentialElection.address 
  });
}

function saveFrontendFiles(dataToSave) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "dapp", "src", "contracts", ``);

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(dataToSave, undefined, 2)
  );

  const PresidentialElectionArtifact = artifacts.readArtifactSync("PresidentialElection");
  const RevocationEnforcerArtifact = artifacts.readArtifactSync("RevocationEnforcer");

  fs.writeFileSync(
    path.join(contractsDir, "PresidentialElection.json"),
    JSON.stringify(PresidentialElectionArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "RevocationEnforcer.json"),
    JSON.stringify(RevocationEnforcerArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
