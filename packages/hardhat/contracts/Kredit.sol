// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/// @title Kredit Token (KRED)
/// @author Kethic <kethic@kethic.com>
/// @notice Kredit is the in-game token for Not Your Keys. It's a silenced
/// ERC20 token that emits no events.  It can be burned and minted by
/// token owners and approved contracts.

import { ERC20K } from "./ERC20K.sol";
import { Adminlist } from "./Adminlist.sol";

import { Kharacter } from "./Kharacter.sol";

contract Kredit is ERC20K("Kredit", "KRED", 18), Adminlist(msg.sender) {
    /*//////////////////////////////////////////////////////////////
                        	  KRED STORAGE
    //////////////////////////////////////////////////////////////*/

    Kharacter public kharacter;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
    }

    /*//////////////////////////////////////////////////////////////
                            	KRED LOGIC
    //////////////////////////////////////////////////////////////*/

    function setKharacter(Kharacter _khar) external {
        require(msg.sender == admin, "Unauthorized");
        kharacter = _khar;
    }

    function mint(uint256 to, uint256 value) external {
        require(mintlist[msg.sender], "Unauthorized");
        require(kharacter.ownerOf(to) != address(0), "NOT_MINTED");
        _mint(to, value);
    }

    function burn(uint256 from, uint256 value) external {
        require(
            burnlist[msg.sender] || kharacter.ownerOf(from) == msg.sender,
            "Unauthorized"
        );
        require(value <= balanceOf[from], "Insufficient funds");
        _burn(from, value);
    }

    /*//////////////////////////////////////////////////////////////
                               ERC20 LOGIC
    //////////////////////////////////////////////////////////////*/

    function approve(
        uint256 owner,
        uint256 spender,
        uint256 amount
    ) public override returns (bool) {
        require(kharacter.ownerOf(owner) == msg.sender, "Unauthorized");
        allowance[owner][spender] = amount;

        return true;
    }

    function transfer(
        uint256 owner,
        uint256 to,
        uint256 amount
    ) public override returns (bool) {
        require(kharacter.ownerOf(owner) == msg.sender, "Unauthorized");
        balanceOf[owner] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balanceOf[to] += amount;
        }

        return true;
    }

    function transferFrom(
        uint256 spender,
        uint256 from,
        uint256 to,
        uint256 amount
    ) public override returns (bool) {
        require(kharacter.ownerOf(spender) == msg.sender, "Unauthorized");
        uint256 allowed = allowance[from][spender]; // Saves gas for limited approvals.

        if (allowed != type(uint256).max)
            allowance[from][spender] = allowed - amount;

        balanceOf[from] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balanceOf[to] += amount;
        }

        return true;
    }
}
