# Not Your Keys

Solve puzzles, exploit smart contracts, and protect your winnings from other players.

Forge your identity

Develop your programming skills and evm knowledge as you compete in an unforgiving pvp 


Solve puzzles and protect your winnings

Backstab your friends
Crack protected systems and 
explore
investigate
analyze




#### erc20 token
 - entity contract address (erc721 of players and npcs)
 - mapping for addresses that can mint
  + these are expected to be npcs
 - mapping for addresses that can transfer without approval
  + these are expected to be players, although might be interesting to have npcs attack players and other npcs later

#### erc721 entity
 - on creation, registers with token
 - exploit() function allows players to mint tokens to themselves
 - 



### jan 3 demo
 - Not Your Keys is an On-Chain PvP Hacking Sandbox
 - find deployed targets
 - examine their locks
 - and exploit them
 - ...but be warned, anything you can do to them, they can do to you

 - use the loot to upgrade your abilities and defenses
 - explore increasingly complex and hostile systems and locks
 - write automation to defend yourself
 
 wishlist (maybe):
 - use real exploit techniques to crack advanced locks
 - write your own locks


#### find deployed targets
 <!-- - targets will be deployed from a specific address
 - honestly, it'd be nice if this address was a GameManager contract, but i dont have time for that today, so it'll just need to be a Goerli burner wallet
 - ok, i need a GameManager so I have a contract to monitor for deploy events
 - seadrch for contract creation events? -->

 - I'm an idiot. Targets are Mint events.

#### examine their locks
 - this should be simple public functions that return friendly data.  json?
 - getLocks, getKeylist
  + { "0": "Color", "1": "Prime", etc };
  + [ 0x1234, 0x5678, etc ]
  + key must be a string. https://www.json.org/json-en.html

#### an exploit them
 - cast send 0x1234 "exploit(bytes32[])" [0x5678, 0x9012]

 -----

Deployer address: 0xE908E8B1B9e6cb2D120CA8631Dc3d0b23b681e7E
Deployer balance: 978121558979036244

kreditContract address:     0xd88A131688A49f7546a50096302017A0efDd9C52
kharacterContract address:  0x4f0e47B94c8A01234b56dc49065D3760efbf9339
colorLockContract address:  0x626b0428027650EB2c6EB387B4b472161823bB0b
primeLockContract address:  0xE287eC3Ae587F6e1Df89D8617b2aCc9ce4cE6A59


npc0:  0x0e9a649CAD3Aff8696B24306eBf9d98E41fBE312
kred:  BigNumber { value: "10" }
locks: [ '0x626b0428027650EB2c6EB387B4b472161823bB0b' ]

npc1:  0x325cd65dbEC0401f2Bb8452429237DC5D74E3b40
kred:  BigNumber { value: "20" }
locks: [ '0xE287eC3Ae587F6e1Df89D8617b2aCc9ce4cE6A59' ]

npc2:  0x1f9A7642A9C0AdB45cbeC83Ac8E7c01FEb64325C
kred:  BigNumber { value: "30" }
locks: [
  '0x626b0428027650EB2c6EB387B4b472161823bB0b',
  '0xE287eC3Ae587F6e1Df89D8617b2aCc9ce4cE6A59'
]