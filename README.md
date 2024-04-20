# Moove Dao

MooveDAO is an Ethereum smart contract that implements a proposal-weighted voting system within a DAO (Decentralised Autonomous Organisation).
The contract is developed in Solidity and uses the OpenZeppelin library to implement the Governance Token, which is used to buy votes.
In this project, Hardhat was used to compile, test and deploy the smart contract.

***Sepolia contract address: 0x9d26d12947276Ee0ABAA8AB14D4adC45a016D808***

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

If you want to deploy the smart contract, you must first configure the hardhat variables.
If you do not already have an account go to https://www.infura.io/ and create one. Click on 'CREATE NEW API KEY', type in a name and then copy the api key at the top.
Navigate to the project directory in your terminal and run the following command and paste your infura api key:

```
npx hardhat vars set INFURA_API_KEY
```

Now follow the same procedure by copying your private key from Sepolia Account(e.g. Metamask), pasting it onto the following command:

```
npx hardhat vars set SEPOLIA_PRIVATE_KEY
```

## Hardhat commands

### Compile
```
npx hardhat compile
```

### Test
```
npx hardhat test
```

### Deploy
```
npx hardhat ignition deploy ./ignition/modules/MooveDao.ts --network sepolia  
```

