import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MooveDaoModule = buildModule("MooveDaoModule", (m) => {
  const MooveDao = m.contract("MooveDao");

  return { MooveDao };
});

module.exports = MooveDaoModule;

// Sepolia: 0xd72eE2DdD33a0692aA5a3699F460c00d9fC838c1