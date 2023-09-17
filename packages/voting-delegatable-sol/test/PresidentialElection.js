const { expect } = require("chai");
const { generateUtil } = require("eth-delegatable-utils");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const  getPrivateKeys = require('./utils/keys.js');
const  generateDelegation  = require('./utils/delegation.js');

describe("PresidentialElection contract", function () {
  const CONTRACT_NAME = 'PresidentialElection';
  let hardhatPresidentialElectionContract;
  let hardhatRevocationEnforcerContract;
  let delegatableUtils;
  let CONTRACT_INFO;

  // ethers Wallets
  let wallet0; // owner
  let wallet1;
  let wallet2;
  let pk0; // owner
  let pk1;
  let pk2;

  async function deployPresidentialElectionFixture() {
    // set up ethers Wallets pass in ethers-hardhat provider
    [wallet0, wallet1, wallet2] = getPrivateKeys(ethers.provider);
    pk0 = wallet0._signingKey().privateKey;
    pk1 = wallet1._signingKey().privateKey;
    pk2 = wallet2._signingKey().privateKey;
 
    // deploy contract with owner
    const PresidentialElection = await ethers.getContractFactory("PresidentialElection");
    hardhatPresidentialElectionContract = await PresidentialElection.connect(wallet0).deploy();
    await hardhatPresidentialElectionContract.deployed();

    const RevocationEnforcer = await ethers.getContractFactory("RevocationEnforcer");
    hardhatRevocationEnforcerContract = await RevocationEnforcer.connect(wallet0).deploy();
    await hardhatRevocationEnforcerContract.deployed();
  }

  beforeEach(async () => {
    await loadFixture(deployPresidentialElectionFixture);
    CONTRACT_INFO = {
      chainId: hardhatPresidentialElectionContract.deployTransaction.chainId,
      verifyingContract: hardhatPresidentialElectionContract.address,
      name: CONTRACT_NAME,
    };
    delegatableUtils = generateUtil(CONTRACT_INFO);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatPresidentialElectionContract.owner()).to.equal(wallet0.address);
      expect(await hardhatPresidentialElectionContract.owner()).to.equal(wallet0.address);
    });

    it("Should set the default Candidates", async function () {
      const candidateCount = await hardhatPresidentialElectionContract.getCandidateCount();
      expect(candidateCount).to.equal(2);
    });
  });

  describe("Voting", function () {
    it("Should allow a user to vote for a candidate", async function () {
      await hardhatPresidentialElectionContract.vote(0);
      const voteCount = await hardhatPresidentialElectionContract.getTotalVotesForCandidate(0);
      const hasVotedWallet0 = await hardhatPresidentialElectionContract.hasVoted(wallet0.address);
      expect(voteCount).to.equal(1);
      expect(hasVotedWallet0).to.equal(true);
    });

    it("Should not allow a user to vote multiple times", async function () {
      await hardhatPresidentialElectionContract.connect(wallet1).vote(0);
      const hasVotedWallet0 = await hardhatPresidentialElectionContract.hasVoted(wallet1.address);
      expect(hasVotedWallet0).to.equal(true);
      // Try voting again
      await expect(hardhatPresidentialElectionContract.connect(wallet1).vote(1)).to.be.revertedWith("You have already voted.");
    });
  });

  describe("Candidate Management", function () {
    it("Should allow the owner to add a new candidate", async function () {
      await hardhatPresidentialElectionContract.addCandidate("New Candidate");
      const candidateCount = await hardhatPresidentialElectionContract.getCandidateCount();
      expect(candidateCount).to.equal(3);
    });

    it("Should return correct details of active candidates", async function () {
        const activeCandidates = await hardhatPresidentialElectionContract.getActiveCandidates();
        expect(activeCandidates.length).to.equal(2); // Initial active candidates
      });

    it("Should not allow the owner to add an existing candidate", async function () {
      // Attempt to add an existing candidate
      await expect(hardhatPresidentialElectionContract.addCandidate("Donald Trump")).to.be.revertedWith("Candidate already exists.");
    });

    it("Should allow wallet1 to add a new candidate", async function () {
        await hardhatPresidentialElectionContract.connect(wallet1).addCandidate("Candidate by addr1");
        const candidateCount = await hardhatPresidentialElectionContract.getCandidateCount();
        expect(candidateCount).to.equal(3);
      });
  
      it("Should allow wallet2 to add a new candidate", async function () {
        await hardhatPresidentialElectionContract.connect(wallet2).addCandidate("Candidate by addr2");
        const candidateCount = await hardhatPresidentialElectionContract.getCandidateCount();
        expect(candidateCount).to.equal(3);
      });
  });

  describe("Candidate Details", function () {
    it("Should retrieve details of all active candidates", async function () {
      const activeCandidates = await hardhatPresidentialElectionContract.getActiveCandidates();
      expect(activeCandidates.length).to.equal(2);
      expect(activeCandidates[0].name).to.equal("Donald Trump");
      expect(activeCandidates[1].name).to.equal("Joe Biden");
    });

    it("Should retrieve total votes for a specific candidate", async function () {
      const totalVotes = await hardhatPresidentialElectionContract.getTotalVotesForCandidate(0);
      expect(totalVotes).to.equal(0); // No votes have been cast yet
    });

    it("Should retrieve the total number of candidates", async function () {
      const candidateCount = await hardhatPresidentialElectionContract.getCandidateCount();
      expect(candidateCount).to.equal(2);
    });
  });

  describe("Delegatable Functionality", function () {
    it("Should allow a wallet2 to vote on behave of wallet1", async function () {
      // wallet1 delegate vote to wallet2
      const _delegation = generateDelegation(
        CONTRACT_INFO,
        pk1,
        wallet2.address,
        [], // no caveats
      );

      // wallet2 cast vote and vote on behave of wallet1
      const INVOCATION_MESSAGE = {
        replayProtection: {
          nonce: '0x01',
          queue: '0x00',
        },
        batch: [
          {
            authority: [],
            transaction: {
              to: hardhatPresidentialElectionContract.address,
              gasLimit: '210000000000000000',
              data: (await hardhatPresidentialElectionContract.populateTransaction.vote(0)).data,
            },
          },
          {
            authority: [_delegation],
            transaction: {
              to: hardhatPresidentialElectionContract.address,
              gasLimit: '210000000000000000',
              data: (await hardhatPresidentialElectionContract.populateTransaction.vote(0)).data,
            },
          },
        ],
      };

      const invocation = delegatableUtils.signInvocation(INVOCATION_MESSAGE, pk2);

      let tx = await hardhatPresidentialElectionContract.connect(wallet2).invoke([
        {
          signature: invocation.signature,
          invocations: invocation.invocations,
        },
      ]);

      // wallet1 and wallet2 should not be able to vote again
      expect(await hardhatPresidentialElectionContract.hasVoted(wallet1.address)).to.equal(true);
      expect(await hardhatPresidentialElectionContract.hasVoted(wallet2.address)).to.equal(true);
      await expect(hardhatPresidentialElectionContract.connect(wallet1).vote(0)).to.be.revertedWith("You have already voted.");
      await expect(hardhatPresidentialElectionContract.connect(wallet2).vote(0)).to.be.revertedWith("You have already voted.");
      expect(await hardhatPresidentialElectionContract.getTotalVotesForCandidate(0)).to.equal(2);
    });
  });

  describe("RevocationEnforcer Functionality", function () {
    it("Should revoke a delegation", async function () {
      // wallet1 delegate vote to wallet2
      const _delegation = generateDelegation(
        CONTRACT_INFO,
        pk1,
        wallet2.address,
        [
          {
          enforcer: hardhatRevocationEnforcerContract.address,
          terms: '0x00',
        },
        ],
      );
      expect(await hardhatRevocationEnforcerContract.connect(wallet1).checkIsRevoked(_delegation)).to.equal(false);

      // wallet1 revoke delegation
      const domainHash = await hardhatPresidentialElectionContract.domainHash();
      await hardhatRevocationEnforcerContract.connect(wallet1).revokeDelegation(_delegation, domainHash);
      expect(await hardhatRevocationEnforcerContract.connect(wallet1).checkIsRevoked(_delegation)).to.equal(true);

      // wallet2 should not be able to vote on behave of wallet1
      const INVOCATION_MESSAGE = {
        replayProtection: {
          nonce: '0x01',
          queue: '0x00',
        },
        batch: [
          {
            authority: [_delegation],
            transaction: {
              to: hardhatPresidentialElectionContract.address,
              gasLimit: '210000000000000000',
              data: (await hardhatPresidentialElectionContract.populateTransaction.vote(0)).data,
            },
          },
        ],
      };
      const invocation = delegatableUtils.signInvocation(INVOCATION_MESSAGE, pk2);
      await expect(hardhatPresidentialElectionContract.connect(wallet2).invoke([
        {
          signature: invocation.signature,
          invocations: invocation.invocations,
        },
      ])).to.be.revertedWith("RevocationEnforcer:revoked");
    });
  });
});
