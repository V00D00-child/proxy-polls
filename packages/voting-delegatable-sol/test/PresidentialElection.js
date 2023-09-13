const { expect } = require("chai");
const { loadFixture, deployContract } = require("@nomicfoundation/hardhat-network-helpers");

describe("PresidentialElection contract", function () {
  let hardhatPresidentialElection;
  let owner, addr1, addr2;

  async function deployPresidentialElectionFixture() {
    const PresidentialElection = await ethers.getContractFactory("PresidentialElection");
    [owner, addr1, addr2] = await ethers.getSigners();

    hardhatPresidentialElection = await PresidentialElection.deploy();

    await hardhatPresidentialElection.deployed();
  }

  beforeEach(async () => {
    await loadFixture(deployPresidentialElectionFixture);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatPresidentialElection.owner()).to.equal(owner.address);
    });

    it("Should set the default Candidates", async function () {
      const candidateCount = await hardhatPresidentialElection.getCandidateCount();
      expect(candidateCount).to.equal(2);
    });
  });

  describe("Voting", function () {
    it("Should allow a user to vote for a candidate", async function () {
      await hardhatPresidentialElection.vote(0);
      const voteCount = await hardhatPresidentialElection.getTotalVotesForCandidate(0);
      expect(voteCount).to.equal(1);
    });

    it("Should not allow a user to vote multiple times", async function () {
      await hardhatPresidentialElection.vote(0);
      // Try voting again
      await expect(hardhatPresidentialElection.vote(1)).to.be.revertedWith("You have already voted.");
    });
  });

  describe("Candidate Management", function () {
    it("Should allow the owner to add a new candidate", async function () {
      await hardhatPresidentialElection.addCandidate("New Candidate");
      const candidateCount = await hardhatPresidentialElection.getCandidateCount();
      expect(candidateCount).to.equal(3);
    });

    it("Should return correct details of active candidates", async function () {
        const activeCandidates = await hardhatPresidentialElection.getActiveCandidates();
        expect(activeCandidates.length).to.equal(2); // Initial active candidates
      });

    it("Should not allow the owner to add an existing candidate", async function () {
      // Attempt to add an existing candidate
      await expect(hardhatPresidentialElection.addCandidate("Donald Trump")).to.be.revertedWith("Candidate already exists.");
    });

    it("Should allow addr1 to add a new candidate", async function () {
        await hardhatPresidentialElection.connect(addr1).addCandidate("Candidate by addr1");
        const candidateCount = await hardhatPresidentialElection.getCandidateCount();
        expect(candidateCount).to.equal(3);
      });
  
      it("Should allow addr2 to add a new candidate", async function () {
        await hardhatPresidentialElection.connect(addr2).addCandidate("Candidate by addr2");
        const candidateCount = await hardhatPresidentialElection.getCandidateCount();
        expect(candidateCount).to.equal(3);
      });
  });

  describe("Candidate Details", function () {
    it("Should retrieve details of all active candidates", async function () {
      const activeCandidates = await hardhatPresidentialElection.getActiveCandidates();
      expect(activeCandidates.length).to.equal(2);
      expect(activeCandidates[0].name).to.equal("Donald Trump");
      expect(activeCandidates[1].name).to.equal("Joe Biden");
    });

    it("Should retrieve total votes for a specific candidate", async function () {
      const totalVotes = await hardhatPresidentialElection.getTotalVotesForCandidate(0);
      expect(totalVotes).to.equal(0); // No votes have been cast yet
    });

    it("Should retrieve the total number of candidates", async function () {
      const candidateCount = await hardhatPresidentialElection.getCandidateCount();
      expect(candidateCount).to.equal(2);
    });
  });
});
