import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MooveDaoModule = buildModule("MooveDaoModule", (m) => {
  const MooveDao = m.contract("MooveDao");

  return { MooveDao };
});

module.exports = MooveDaoModule;

// Sepolia contract address: 0x9d26d12947276Ee0ABAA8AB14D4adC45a016D808