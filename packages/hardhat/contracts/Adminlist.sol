// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// @notice 
/// @author 
/// @dev Korrupted by @kethcode (removed events, made token-centric)

abstract contract Adminlist {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    address public immutable admin;
    mapping(address => bool) internal mintlist;
    mapping(address => bool) internal burnlist;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _admin) {
        admin = _admin;
        mintlist[_admin] = true;
        burnlist[_admin] = true;
    }

    /*//////////////////////////////////////////////////////////////
                                 LOGIC
    //////////////////////////////////////////////////////////////*/
    function addMinter(address addr) external {
        require(msg.sender == admin, "Unauthorized");
        mintlist[addr] = true;
    }

    function removeMinter(address addr) external {
        require(msg.sender == admin, "Unauthorized");
        mintlist[addr] = false;
    }

    function addBurner(address addr) external {
        require(msg.sender == admin, "Unauthorized");
        burnlist[addr] = true;
    }

    function removeBurner(address addr) external {
        require(msg.sender == admin, "Unauthorized");
        burnlist[addr] = false;
    }
}
