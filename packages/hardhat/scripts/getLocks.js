require("dotenv").config();

const fs = require("fs");
const path = require("path");
const console = require("console");
const ethers = require("ethers");

const kharacterContractAddress = "0x4f0e47B94c8A01234b56dc49065D3760efbf9339";
const kharacterContractAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed id)",
  "function ownerOf(uint256 id) public view returns (address owner)",
  "function getLocks(uint256 id) public view returns (address[] memory)",
];

const lockContractAbi = ["function desc() public view returns (string)"];

const provider = new ethers.providers.WebSocketProvider(
  process.env.RPC_KEY_WSS
);

const kharacterContract = new ethers.Contract(
  kharacterContractAddress,
  kharacterContractAbi,
  provider
);

async function main() {
  if (process.argv.length <= 2) {
    console.log("syntax: node getLocks <tokenId>");
    process.exit(2);
  }

  console.log(
    "Profiling Locks for Target",
    await kharacterContract.ownerOf(process.argv[2])
  );

  let locks = await kharacterContract.getLocks(process.argv[2]);

//   console.log(locks);
  for (let i = 0; i < locks.length; i++) {
    let lockContract = new ethers.Contract(locks[i], lockContractAbi, provider);

    console.log("\nLock[%d] Address:", i, locks[i]);
    console.log("Lock[%d] Type:   ", i, await lockContract.desc());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
