const { ethers } = require("hardhat");
const hre = require("hardhat");

require("@nomiclabs/hardhat-etherscan");

const colorLockDesc = "Color";
const colorLockKeylist = [
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("red")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("pink")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("orange")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("yellow")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("purple")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("green")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("blue")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("brown")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("white")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("gray")),
];

const primeLockDesc = "Prime";
const primeLockKeylist = [
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("2")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("3")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("5")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("7")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("11")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("13")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("17")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("19")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("23")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("29")),
];

const npc0 = "0x0e9a649CAD3Aff8696B24306eBf9d98E41fBE312";
const npc1 = "0x325cd65dbEC0401f2Bb8452429237DC5D74E3b40";
const npc2 = "0x1f9A7642A9C0AdB45cbeC83Ac8E7c01FEb64325C";

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  console.log(chainId);

  const [deployer] = await ethers.getSigners();

  console.log("\nDeployer address:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());

  const kreditContractFactory = await ethers.getContractFactory("Kredit");
  const kreditContract = await kreditContractFactory.deploy();
  await kreditContract.deployed();
  console.log("\nkreditContract address:    ", kreditContract.address);

  const kharacterContractFactory = await ethers.getContractFactory("Kharacter");
  const kharacterContract = await kharacterContractFactory.deploy(
    kreditContract.address
  );
  await kharacterContract.deployed();
  console.log("kharacterContract address: ", kharacterContract.address);

  const lockContractFactory = await ethers.getContractFactory("Lock");

  const colorLockContract = await lockContractFactory.deploy(
    300000,
    colorLockDesc,
    colorLockKeylist
  );
  await colorLockContract.deployed();
  console.log("colorLockContract address: ", colorLockContract.address);

  const primeLockContract = await lockContractFactory.deploy(
    300000,
    primeLockDesc,
    primeLockKeylist
  );
  await primeLockContract.deployed();
  console.log("primeLockContract address: ", primeLockContract.address);

  await kharacterContract.mint(npc0);
  await kharacterContract.mint(npc1);
  await kharacterContract.mint(npc2);

  console.log("\nkharacters created");

  await kharacterContract.setLocks(0, [colorLockContract.address]);
  await kharacterContract.setLocks(1, [primeLockContract.address]);
  await kharacterContract.setLocks(2, [
    primeLockContract.address,
    colorLockContract.address,
  ]);

  console.log("locks installed");

  await kreditContract.mint(npc0, 10);
  await kreditContract.mint(npc1, 20);
  await kreditContract.mint(npc2, 30);

  console.log("kredits distributed");

  if (chainId != 31337) {
    await hre.run("verify:verify", {
      address: kreditContract.address,
    });
    console.log("kredit verified");

    await hre.run("verify:verify", {
      address: kharacterContract.address,
      constructorArguments: [kreditContract.address],
    });
    console.log("kharacter verified");

    await hre.run("verify:verify", {
      address: colorLockContract.address,
      constructorArguments: [300000, colorLockDesc, colorLockKeylist],
    });
    console.log("colorLock verified");
  }

  console.log("\nnpc0: ", await kharacterContract.ownerOf(0));
  console.log("kred: ", await kreditContract.balanceOf(npc0));
  console.log("locks:", await kharacterContract.getLocks(0));

  console.log("\nnpc1: ", await kharacterContract.ownerOf(1));
  console.log("kred: ", await kreditContract.balanceOf(npc1));
  console.log("locks:", await kharacterContract.getLocks(1));

  console.log("\nnpc2: ", await kharacterContract.ownerOf(2));
  console.log("kred: ", await kreditContract.balanceOf(npc2));
  console.log("locks:", await kharacterContract.getLocks(2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
