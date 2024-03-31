// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GovernanceToken is ERC20{
    uint256 public s_maxSupply = 170000;
    uint256 public circulatingSupply = s_maxSupply;

    constructor() ERC20("GovernanceToken","GOT"){
        _mint(msg.sender, s_maxSupply);
    }

    function transfer(address _recipient, uint _amount) public virtual override returns(bool){
        bool success = super.transfer(_recipient, _amount);
        if (success) {
            circulatingSupply -= _amount; // Aggiorna supply circolante
        }
        return success;
    }
}