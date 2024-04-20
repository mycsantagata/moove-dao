// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20 {
    uint256 public s_maxSupply = 100 * (10 ** uint256(decimals()));

    constructor() ERC20("GovernanceToken","GOT"){
        _mint(msg.sender, s_maxSupply);
    }
}