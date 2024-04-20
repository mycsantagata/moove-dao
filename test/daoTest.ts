import { ethers } from "hardhat";

const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MooveDao Test", function () {

  async function setupFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const mooveDao = await ethers.deployContract("MooveDao");
    const etherAmount = ethers.parseEther('0.01'); 
    return {mooveDao, etherAmount, addr1, addr2};
  }

  //Verifica se l'acquisto di voti funziona correttamente
  it("Purchase shares correctly and create new members", async function () {
    const {mooveDao, etherAmount,addr1} = await loadFixture(setupFixture);

    // Effettua l'acquisto di voti da addr1
    
    await mooveDao.connect(addr1).buyShares(5, {value: etherAmount});
    
    // Verifica se addr1 ha correttamente acquisito voti e ha un saldo corretto
    expect(await mooveDao.connect(addr1).getMyShares()).to.equal(5);
    expect(await mooveDao.connect(addr1).getBalance()).to.equal(5000000000000000000n);
  });



  // Verifica che i membri non posso chiudere l'acquisto dei token
  it("Close sale for members", async function () {
    const {mooveDao, etherAmount,addr1} = await loadFixture(setupFixture);
    await mooveDao.connect(addr1).buyShares(5, {value: etherAmount});

    await expect(mooveDao.connect(addr1).toggleSale()).to.be.reverted;
  });

   //Verifica che i membri non posso aprire proposal senza voti
   it("Open proposal without shares", async function () {
    const {mooveDao, addr1} = await loadFixture(setupFixture);
    await expect(mooveDao.connect(addr1).createProposal("Test Proposal")).to.be.revertedWith("Access denied!");
  });

  //Verifica se la proposta funziona correttamente
  it("Create proposals correctly and add them to the final decisions registry", async function () {
    const {mooveDao, etherAmount,addr1} = await loadFixture(setupFixture);
    await mooveDao.connect(addr1).buyShares(5, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");

    // Verifica se la proposta è stata correttamente creata
    const proposals = await mooveDao.getProposals();
    expect(proposals.length).to.equal(1);
    expect(proposals[0].title).to.equal("Test Proposal");
  });

  //Genera errore se cerco di votare una Proposta inesistente
  it("Attempting to vote on a non-existent proposal", async function () {
    const {mooveDao,etherAmount, addr1} = await loadFixture(setupFixture);
    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.toggleSale();

    await expect(mooveDao.connect(addr1).voteProposal(0, 0)).to.be.revertedWith("Proposal not found.");
  });

  //Genera errore se si tenta di acquistare token che vanno oltre il massimo della supply
  it("Exceed the supply limit", async function () {
    const {mooveDao, etherAmount} = await loadFixture(setupFixture);
    const addresses = await ethers.getSigners();
    const addressesToTest = addresses.slice(1, 11); // Recupero i primi 17 indirizzi (escludendo l'owner)
    const addressExpect = addresses[12];
    
    for(const address of addressesToTest){
        await mooveDao.connect(address).buyShares(10, {value: etherAmount});
    }

    await expect(mooveDao.connect(addressExpect).buyShares(10, {value: etherAmount})).to.be.reverted;
  });

  //Verifica se la votazione per le proposte funziona correttamente
  it("Handle voting for proposed decisions correctly", async function () {
    const {mooveDao, etherAmount,addr1, addr2} = await loadFixture(setupFixture);
    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(5, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr2).voteProposal(1, 0);

    const proposals = await mooveDao.getProposals();
    expect(proposals[0].countApproveVote).to.equal(10);
    expect(proposals[0].countRejectVote).to.equal(5);
  });

  //Verifica se la proposta che riceve la maggioranza dei voti viene approvata
  it("Approve Proposal", async function () {
    const {mooveDao,etherAmount, addr1, addr2} = await loadFixture(setupFixture);
    const time11days = 60*60*24*11;

    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(1, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr2).voteProposal(1, 0);   
    await mooveDao.closeProposal((await time.latest()) + time11days, 0);

    const proposals = await mooveDao.getProposals();
    expect(proposals[0].state).to.equal(1); // State.APPROVED
  });

  //Verifica se la proposta viene processata correttamente anche con nessun voto
  it("Approve Proposal with no vote", async function () {
    const {mooveDao,etherAmount, addr1, addr2} = await loadFixture(setupFixture);
    const time11days = 60*60*24*11;

    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(1, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");  
    await mooveDao.closeProposal((await time.latest()) + time11days, 0);

    const proposals = await mooveDao.getProposals();
    expect(proposals[0].state).to.equal(2); // State.REJECTED
    expect(proposals[0].countApproveVote).to.equal(0);
    expect(proposals[0].countRejectVote).to.equal(0);
  });

  //Verifica se la richiesta viene rifiutata
  it("Reject Proposal", async function () {
    const {mooveDao, etherAmount,addr1, addr2} = await loadFixture(setupFixture);
    const time11days = 60*60*24*11;

    await mooveDao.connect(addr1).buyShares(1, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(10, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr2).voteProposal(1, 0);   
    await mooveDao.closeProposal((await time.latest()) + time11days, 0);

    const proposals = await mooveDao.getProposals();
    expect(proposals[0].state).to.equal(2); // State.REJECTED
  });

  //Verifica se array delle proposte viene mantenuto correttamente
  it("Maintain the registry of proposed decisions correctly", async function () {
    const {mooveDao, etherAmount,addr1} = await loadFixture(setupFixture);

    await mooveDao.connect(addr1).buyShares(1, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Proposal 1");
    await mooveDao.connect(addr1).createProposal("Proposal 2");
    await mooveDao.connect(addr1).createProposal("Proposal 3");

    const proposals = await mooveDao.getProposals();
    expect(proposals.length).to.equal(3);
    expect(proposals[0].title).to.equal("Proposal 1");
    expect(proposals[1].title).to.equal("Proposal 2");
    expect(proposals[2].title).to.equal("Proposal 3");
  });

  //Verifico che funziona correttamente la votazione su due proposte in stato DRAFT
  it("Handle voting for 2 proposals", async function () {
    const {mooveDao, etherAmount,addr1} = await loadFixture(setupFixture);

    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal 1");
    await mooveDao.connect(addr1).createProposal("Test Proposal 2");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr1).voteProposal(0, 1);   

    const proposals = await mooveDao.getProposals();
    expect(proposals[0].countApproveVote).to.equal(10);
    expect(proposals[1].countApproveVote).to.equal(10);
  });

   //Genera errore se si tenta di votare una proposta in uno stato chiuso
   it("Vote on a proposal in a closed state", async function () {
    const {mooveDao, etherAmount, addr1, addr2} = await loadFixture(setupFixture);
    const time11days = 60*60*24*11;

    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(1, {value: etherAmount});
    await mooveDao.toggleSale();
    await mooveDao.connect(addr1).createProposal("Test Proposal");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr2).voteProposal(1, 0);   
    await mooveDao.closeProposal((await time.latest()) + time11days, 0);

    await expect(mooveDao.connect(addr1).voteProposal(0,0)).to.be.revertedWith("Proposal already closed.");

  });

  //Genera errore se si tenta di chiudere una proposta in uno stato già chiuso
  it("Close a proposal in a closed state", async function () {
    const {mooveDao, etherAmount, addr1, addr2} = await loadFixture(setupFixture);
    const time11days = 60*60*24*11;

    await mooveDao.connect(addr1).buyShares(10, {value: etherAmount});
    await mooveDao.connect(addr2).buyShares(1, {value: etherAmount});
    await mooveDao.toggleSale(); 
    await mooveDao.connect(addr1).createProposal("Test Proposal");
    await mooveDao.connect(addr1).voteProposal(0, 0);
    await mooveDao.connect(addr2).voteProposal(1, 0);   
    await mooveDao.closeProposal((await time.latest()) + time11days, 0);

    await expect(mooveDao.closeProposal((await time.latest()) + time11days, 0)).to.be.revertedWith("Proposal already closed.");
  });

});