# Moove Dao

MooveDAO is an Ethereum smart contract that implements a proposal-weighted voting system within a DAO (Decentralised Autonomous Organisation).
The contract is developed in Solidity and uses the OpenZeppelin library to implement the Governance Token, which is used to buy votes.
In this project, Hardhat was used to compile, test and deploy the smart contract.

***Sepolia contract address: 0xd72eE2DdD33a0692aA5a3699F460c00d9fC838c1***

## Technologies

This project is built using :
+ Hardhat
+ Solidity
+ TypeScript

## Main Features

+ **Purchasing votes**: Users can purchase tokens to receive DAO votes to participate in the decision-making process.

+ **Proposals**: Users can propose decisions to be voted on by the members.

+ **Voting**: Users can vote on proposals within the time limit by deciding whether to approve or reject the proposal.

+ **Approve Proposal**: Proposals that receive more than 70% approval of the total votes by the deadline are approved

+ **Proposals registry**: The contract keeps a record of proposed decisions and their votes.

## Installation and Configuration

To initialize the project, you need to have NodeJS installed on your computer. After downloading the project, 
navigate to the project directory in your terminal and run the following command:
```
npm install
```
This will download all the dependencies.


