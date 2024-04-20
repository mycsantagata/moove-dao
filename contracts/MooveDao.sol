// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GovernanceToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MooveDao is Ownable {

    enum State { DRAFT, APPROVED, REJECTED }
    enum VoteType { APPROVE, REJECT }

    GovernanceToken internal token;
    Proposal[] internal proposals;
    bool public saleOpen = true;

    struct Proposal {
        address proposer;
        string title;
        uint256 countApproveVote;
        uint256 countRejectVote;
        State state;
        uint256 endDate;
    }

    mapping(address => uint) internal memberShares;
    mapping(uint256 => mapping(address => bool)) internal proposalsVoted;

    event ProposalCreated(address indexed member, string title, uint256 endDate);
    event Voted(address indexed member, uint256 indexed proposalIndex, VoteType voteType);
    event ProposalClosed(uint256 indexed proposalIndex, State state);
    event SharesPurchased(address indexed member, uint256 amount);

    modifier onlyMember() {
        require(memberShares[msg.sender] > 0, "Access denied!");
        _;
    }

    modifier proposalExist(uint256 _indexProposal){
        require(_indexProposal < proposals.length, "Proposal not found.");
        _;
    }

    modifier saleIsClosed(){
        require(!saleOpen, "The sale is still open!");
        _;
    }

    constructor() Ownable(msg.sender){
        token = new GovernanceToken();
    }

    function toggleSale() external onlyOwner {
        saleOpen = !saleOpen;
    }

    function buyShares(uint256 _amount) external payable {
        require(saleOpen, "Sale is closed");
        require(msg.sender != Ownable.owner(), "Action not permitted for the administrator!");
        uint256 totalAmount = memberShares[msg.sender] + _amount;
        require(totalAmount <= 10, "The maximum number of votes allowed is 10.");
        uint256 tokenToTransfer = _amount * (10 ** uint256(token.decimals()));
        require(token.transfer(msg.sender, tokenToTransfer), "Token transfer failed");
        memberShares[msg.sender] += _amount;
        emit SharesPurchased(msg.sender, _amount);
    }

    function createProposal(string calldata _title) external onlyMember saleIsClosed  {
        proposals.push(Proposal({
            proposer: msg.sender,
            title: _title,
            countApproveVote: 0,
            countRejectVote: 0,
            state: State.DRAFT,
            endDate: block.timestamp + 10 days
        }));

        emit ProposalCreated(msg.sender, _title, block.timestamp + 10 days);
    }

    function voteProposal(VoteType _typeVote, uint256 _indexProposal) external onlyMember proposalExist(_indexProposal) saleIsClosed {
        require(proposals[_indexProposal].state == State.DRAFT, "Proposal already closed.");
        require(proposalsVoted[_indexProposal][msg.sender] == false ,"You have already voted.");
        
        if(_typeVote == VoteType.APPROVE){
            proposals[_indexProposal].countApproveVote += memberShares[msg.sender];
        }else{
            proposals[_indexProposal].countRejectVote += memberShares[msg.sender];
        }
        proposalsVoted[_indexProposal][msg.sender] = true;

        emit Voted(msg.sender, _indexProposal, _typeVote);
    }

    function closeProposal(uint256 _currentDate, uint256 _indexProposal) external onlyOwner proposalExist(_indexProposal) saleIsClosed {
         require(proposals[_indexProposal].state == State.DRAFT, "Proposal already closed.");
         require(_currentDate >= proposals[_indexProposal].endDate, "The proposal has not yet expired.");

         uint256 totalVotes = proposals[_indexProposal].countApproveVote + proposals[_indexProposal].countRejectVote;

         //Controllo se il almeno il 70% dei membri ha votato a favore
         if(totalVotes == 0){
            proposals[_indexProposal].state = State.REJECTED;
         } else if ((proposals[_indexProposal].countApproveVote * 100 / totalVotes) >= 70) {
            proposals[_indexProposal].state = State.APPROVED;
        } else {
            proposals[_indexProposal].state = State.REJECTED;
        }   

        emit ProposalClosed(_indexProposal, proposals[_indexProposal].state);
    }

    function getMyShares() external view returns(uint256) {
        return memberShares[msg.sender];
    }

    function getBalance() external view returns (uint256) {
        return token.balanceOf(msg.sender);
    }

    function getProposals() external view returns(Proposal[] memory){
        return proposals;
    }


}