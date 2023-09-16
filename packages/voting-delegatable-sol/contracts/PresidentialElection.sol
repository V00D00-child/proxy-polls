// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import { Delegatable } from "./Delegatable.sol";
import { DelegatableCore } from "./DelegatableCore.sol";

/**
 * @title PresidentialElection
 * @author Idris Bowman
 * @notice The PresidentialElection smart contract facilitates an 
 * on-chain voting system for presidential candidates. Users can 
 * cast their votes for a selected candidate. Each user is allowed 
 * one vote and cannot vote multiple times. Additionally, the contract 
 * allows for the addition of new candidates. The initial candidates 
 * are set as Donald Trump and Joe Biden. The contract also provides functionality
 * to view the total vote count for each candidate, as well as retrieve details 
 * of all active candidates. This contract is designed to promote transparent 
 * and secure voting within the Ethereum blockchain.
 */
contract PresidentialElection is Delegatable, Ownable {
    
    struct Candidate {
        string name;
        uint voteCount;
        bool isActive; // Indicates whether the candidate is active
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;

    event NewCandidateAdded(string name);
    event VoteCast(string candidateName, address voter);

    /**
     * @notice Contract constructor. Initializes the contract with default candidates.
     */
    constructor() Delegatable("PresidentialElection", "1") {
        addCandidate("Donald Trump");
        addCandidate("Joe Biden");
    }

    /**
     * @notice Modifier to prevent users from voting multiple times.
     */
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted.");
        _;
    }

    /**
     * @notice Function to add a new presidential candidate.
     * @param _name string - The name of the new candidate
     */
    function addCandidate(string memory _name) public {
        require(!isCandidateExist(_name), "Candidate already exists.");
        candidates.push(Candidate(_name, 0, true)); // New candidates are active by default.
        emit NewCandidateAdded(_name);
    }

    /**
     * @notice Internal function to check if a candidate with the given name exists.
     * @param _name string - The name of the candidate
     * @return bool - Returns true if the candidate exists, otherwise false
     */
    function isCandidateExist(string memory _name) internal view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(abi.encodePacked(candidates[i].name)) == keccak256(abi.encodePacked(_name))) {
                return true;
            }
        }
        return false;
    }

    // TODO: Add voter registration functionality

    /**
     * @notice Function to allow a user to vote for a candidate.
     * @param _candidateIndex uint - The index of the candidate being voted for
     */
    function vote(uint _candidateIndex) public hasNotVoted {
        require(_candidateIndex < candidates.length, "Invalid candidate index");
        candidates[_candidateIndex].voteCount++;
        hasVoted[_msgSender()] = true;
        emit VoteCast(candidates[_candidateIndex].name, _msgSender());
    }

    /**
     * @notice Function to get the total votes received by a specific candidate.
     * @param _candidateIndex uint - The index of the candidate
     * @return uint - The total votes for the candidate
     */
    function getTotalVotesForCandidate(uint _candidateIndex) public view returns (uint) {
        require(_candidateIndex < candidates.length, "Invalid candidate index");
        return candidates[_candidateIndex].voteCount;
    }

    /**
     * @notice Function to get the total number of candidates.
     * @return uint - The total number of candidates
     */
    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }

    /**
     * @notice Function to retrieve details of all active candidates.
     * @return Candidate[] - An array of active candidates
     */
    function getActiveCandidates() public view returns (Candidate[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].isActive) {
                activeCount++;
            }
        }

        Candidate[] memory activeCandidates = new Candidate[](activeCount);
        uint index = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].isActive) {
                activeCandidates[index] = candidates[i];
                index++;
            }
        }

        return activeCandidates;
    }


    /* ===================================================================================== */
    /* Internal Functions                                                                    */
    /* ===================================================================================== */
       function _msgSender()
        internal
        view
        virtual
        override(DelegatableCore, Context)
        returns (address sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = msg.sender;
        }
        return sender;
    }
}
