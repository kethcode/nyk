require("dotenv").config();

const fs = require("fs");
const path = require("path");
const console = require("console");
const ethers = require("ethers");

const kharacterContractAddress = "0x4f0e47B94c8A01234b56dc49065D3760efbf9339";
const kharacterContractAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed id)",
];

const provider = new ethers.providers.WebSocketProvider(
  process.env.RPC_KEY_WSS
);

const contract = new ethers.Contract(
  kharacterContractAddress,
  kharacterContractAbi,
  provider
);

async function main() {
  console.log("Searching for Targets");

  filterFrom = contract.filters.Transfer();
  let events = await contract.queryFilter(filterFrom, 8253406);

  events.forEach((element) => {
    let target_detail = {};
    target_detail["tokenId"] = element.args["id"].toNumber();
    target_detail["owner"] = element.args["to"];

    console.log(target_detail);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
