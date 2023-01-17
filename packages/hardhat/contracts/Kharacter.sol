// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

//import {ERC721} from "solmate/src/tokens/ERC721.sol";
import {ERC721K} from "./ERC721K.sol";
import {Adminlist} from "./Adminlist.sol";

import {Kredit} from "./Kredit.sol";
import {Lock} from "./Lock.sol";

import "hardhat/console.sol";

/**
 * @title Kharacter Token (KHAR)
 * @author Kethic <kethic@kethic.com>
 * @notice Kharacter is an in-game NFT for Not-Your-Keys.
 */

contract Kharacter is ERC721K("Kharacter", "KHAR"), Adminlist(msg.sender) {
    Kredit public kredit;

    // not going to emit addresses, just tokenIds.
    event Attacked(uint256 indexed victim, uint256 indexed hacker);
    event Cracked(
        uint256 indexed victim,
        uint256 indexed hacker,
        uint256 reward
    );

    constructor() {}

    function setKredit(Kredit _kred) external {
        require(msg.sender == admin, "Unauthorized");
        kredit = _kred;
    }

    /*//////////////////////////////////////////////////////////////
                        	PLAYER MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    // contract details related to mananging msg.sender's account
    // an address can only be registered once
    // an address can own multiple tokens, up to MAX_TOKEN_SLOTS
    // upgrading token slots costs more KRED the more slots you have

    uint256 public constant REGISTRATION_PRICE = 0.007 ether; // ($10?)
    uint256 MAX_TOKEN_SLOTS = 5;
    uint256 MAX_INT = 2**256 - 1;
    uint256[] public UPGRADE_SLOT_COSTS = [0, 0, 256, 1024, 4096, MAX_INT];

    mapping(address => bool) public registered;
    mapping(address => uint256) public token_slots;

    // small fee to register as a minor anti-sybil measure
    // function register(address _addr) external payable {
    //  require(msg.sender == _addr, "Not authorized");
    //  require(!registered[_addr], "Already registered");
    // 	require( msg.value >= REGISTRATION_PRICE, "Insufficient funds" );
    // 	registered[_addr] = true;
    //  token_slots[_addr] = 2;
    // }

    // free registration during playtesting
    function register() external {
        require(!registered[msg.sender], "Already registered");
        registered[msg.sender] = true;
        token_slots[msg.sender] = 2;
    }

    function deregister(address _addr) external {
        require(msg.sender == _addr, "Not authorized");
        require(registered[_addr], "Not registered");
        registered[_addr] = false;
        // token_slots[_addr] = 0; // dunno if I want to delete player data when deregistering
    }

    function upgrade_token_slots(uint256 from) external {
        require(ownerOf(from) == msg.sender, "Not authorized");
        require(registered[msg.sender], "Not registered");
        require(
            token_slots[msg.sender] <= MAX_TOKEN_SLOTS,
            "Max Token Slots reached"
        );
        require(
            kredit.balanceOf(from) <=
                UPGRADE_SLOT_COSTS[token_slots[msg.sender]],
            "Insufficient Kredits"
        );

        // is this atomic? can this somehow burn tokens but not mint
        kredit.burn(from, UPGRADE_SLOT_COSTS[token_slots[msg.sender]]);
        token_slots[msg.sender]++;
    }

    /*//////////////////////////////////////////////////////////////
                        KHARACTER TOKEN MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    // ERC721K tokens are in-game identities.  They are the interface to
    // the game.  PCs and NPCs are both Kharacters. I expect players to
    // have multiple Kharacters; at least one as a dirty burner account,
    // and one they use as safe storage for their Kredits. Think of them
    // as Hot Wallet and Cold Wallet.  Players may want to have more than
    // two tokens, and can upgrade their address to have more slots.
    // Kharacters and upgrades are purchased with Kredits.

    uint256[] public MINT_COSTS = [0, 0, 64, 256, 1024, MAX_INT];

    // the caller needs to specify which token to debit kredits from
    // payer is ignored ifthe wallet has less than 2 tokens.
    function mint(uint256 payer) public {
        require(registered[msg.sender], "Not registered");
        require(
            balanceOf(msg.sender) < token_slots[msg.sender],
            "Token Slots full, Upgrade to mint more"
        );
        // players with no tokens can't specify a token to mint from
        if (balanceOf(msg.sender) >= 2) {
            require(
                kredit.balanceOf(payer) >= MINT_COSTS[balanceOf(msg.sender)],
                "Insufficient Kredits"
            );
        }

        _mint(msg.sender, totalSupply());
    }

    function burn(uint256 id) public {
        require(ownerOf(id) == msg.sender, "Not authorized");
        // restrict to token owner or admin.
        _burn(id);
    }

    // there's a lot of fun things we can do with this.  for now, i'l leavt it
    // empty, but at launch, i'm thinking of representing upgrades, solved
    // locks, installed locks, etc.
    function tokenURI(uint256)
        public
        pure
        virtual
        override
        returns (string memory)
    {}

    /// UPGRADES

    /*//////////////////////////////////////////////////////////////
                        KREDIT TOKEN MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    // kredits are a real ERC20 owned in total by the wallet that
    // owns the nft tokens that earned them.  each nft tokenid can
    // only access the tokens it has earned.

    // hrm.  player earns tokens. transfers them away from their
    // wallet, prevent them from being spent or burned.  yeah, no good.
    // i can't let players have independant control of the tokens
    // outside the nft interface.  ah well.

    /*//////////////////////////////////////////////////////////////
                        	LOCK MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    // number of locks currently installed on this tokenId
    mapping(uint256 => uint256) lockCount;

    // address of the locks installed on this tokenId
    mapping(uint256 => address[]) lock;

    // block timestamps of the last time this tokenId was fully cracked by this player
    //		target => attacker => timestamp
    mapping(uint256 => mapping(uint256 => uint256)) lastCracked;

    // how long does it take for the reward to fully regenerate to max, in seconds?
    uint256 private reward_rate;

    // need getLockNames and getLockAddresses?

    // by tokenId
    // todo: need one by address
    function getLocks(uint256 id) public view returns (address[] memory) {
        return lock[id];
    }

    function setLocks(uint256 id, address[] calldata locks) public {
        lockCount[id] = locks.length;
        lock[id] = locks;
    }

    // execute all cracks against a lock stack, writes results to chain and potentially mints kredits
    function hack(
        uint256 attacker,
        uint256 target,
        string[] calldata picks
    ) public returns (bool) {
        if (exploit(attacker, target, picks)) {
            // TODO: adjust reward based on time since lastCracked by this player, and tier.
            lastCracked[target][attacker] = block.timestamp;
            kredit.mint(attacker, 10);
            // target, hacker, reward
            emit Cracked(target, attacker, 10);
        } else {
            // target, hacker
            emit Attacked(target, attacker);
        }
        return true;
    }

    // execute all cracks against a lock stack, non-commital
    function exploit(
        uint256 attacker,
        uint256 target,
        string[] calldata picks
    ) public view returns (bool) {
        bool cracked = false;
        if (lockCount[target] > 0) {
            uint256 passCount = 0;
            for (uint256 i = 0; i < lockCount[target]; i++) {
                if (probe(attacker, target, i, picks[i]) == true) {
                    passCount++;
                }
            }

            cracked = (passCount == lockCount[target]);
        } else {
            cracked = true;
        }
        return cracked;
    }

    // test a crack on a single lock, non-commital
    function probe(
        uint256 attacker,
        uint256 target,
        uint256 lock_index,
        string calldata pick
    ) public view returns (bool) {
        // some interesting options here; maybe the player can acquire a spoof tool eventually
        // pretend to be someone else, and attack a system

        require(attacker != target, "You can't attack yourself"); // debatable

        require(
            ownerOf(attacker) == msg.sender,
            "You don't own the attacker token"
        );

        (, bytes memory data) = lock[target][lock_index].staticcall(
            abi.encodeWithSignature("test(string)", pick)
        );
        return abi.decode(data, (bool));
    }
}
