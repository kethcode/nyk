/* end to end test quite for building demos and exercising changes and
 * new features during development
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const padLockDesc = "Padlock";
const padLockKeylist = [
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("unlock")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("open")),
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("release")),
];

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

const colorList = [
  "red",
  "pink",
  "orange",
  "yellow",
  "purple",
  "green",
  "blue",
  "brown",
  "white",
  "gray",
];

const primeList = ["2", "3", "5", "7", "11", "13", "17", "19", "23", "29"];

describe("Not Your Keys Jan3 Demo", function () {
  async function deployFixture() {
    const [admin, npc1, npc2, pc1, pc2] = await ethers.getSigners();

    const kreditContractFactory = await ethers.getContractFactory("Kredit");
    const kreditContract = await kreditContractFactory.deploy();
    await kreditContract.deployed();

    const kharacterContractFactory = await ethers.getContractFactory(
      "Kharacter"
    );
    const kharacterContract = await kharacterContractFactory.deploy();
    await kharacterContract.deployed();

    const lockContractFactory = await ethers.getContractFactory("Lock");

    const colorLockContract = await lockContractFactory.deploy(
      300,
      colorLockDesc,
      colorLockKeylist
    );
    await colorLockContract.deployed();

    const primeLockContract = await lockContractFactory.deploy(
      300,
      primeLockDesc,
      primeLockKeylist
    );
    await primeLockContract.deployed();

    await kreditContract.setKharacter(kharacterContract.address);
    await kreditContract.addMinter(kharacterContract.address);

    await kharacterContract.setKredit(kreditContract.address);

    await kharacterContract.connect(admin).register();
    await kharacterContract.connect(admin).mint(0);

    await kharacterContract.connect(npc1).register();
    await kharacterContract.connect(npc1).mint(0);

    await kharacterContract.connect(npc2).register();
    await kharacterContract.connect(npc2).mint(0);

    await kharacterContract.connect(pc1).register();
    await kharacterContract.connect(pc1).mint(0);

    await kharacterContract.connect(pc2).register();
    await kharacterContract.connect(pc2).mint(0);

    let adminTokenId = await kharacterContract.tokenOfOwnerByIndex(
      admin.address,
      0
    );

    let npc1TokenId = await kharacterContract.tokenOfOwnerByIndex(
      npc1.address,
      0
    );

    let npc2TokenId = await kharacterContract.tokenOfOwnerByIndex(
      npc2.address,
      0
    );

    let pc1TokenId = await kharacterContract.tokenOfOwnerByIndex(
      pc1.address,
      0
    );

    let pc2TokenId = await kharacterContract.tokenOfOwnerByIndex(
      pc2.address,
      0
    );

    await kharacterContract
      .connect(pc1)
      .setLocks(pc1TokenId, [colorLockContract.address]);
    await kharacterContract
      .connect(npc1)
      .setLocks(npc1TokenId, [colorLockContract.address]);
    await kharacterContract
      .connect(npc2)
      .setLocks(npc2TokenId, [
        colorLockContract.address,
        primeLockContract.address,
      ]);

    return {
      kreditContract,
      kharacterContract,
      colorLockContract,
      primeLockContract,
      admin,
      npc1,
      npc2,
      pc1,
      pc2,
      adminTokenId,
      npc1TokenId,
      npc2TokenId,
      pc1TokenId,
      pc2TokenId,
    };
  }

  describe("deployment", function () {
    it("should deploy without errors", async function () {
      await loadFixture(deployFixture);
    });
  });

  describe("minting a kharacter", function () {
    it("should assign that token to its owner", async function () {
      const { kharacterContract, pc1 } = await loadFixture(deployFixture);

      let beforeMintBalance = await kharacterContract.balanceOf(pc1.address);
      await kharacterContract.connect(pc1).mint(pc1.address);
      let afterMintBalance = await kharacterContract.balanceOf(pc1.address);

      expect([beforeMintBalance, afterMintBalance]).to.deep.equal([1, 2]);
    });
  });

  describe("installing a lock", function () {
    it("should show the locks when requested", async function () {
      const {
        kharacterContract,
        colorLockContract,
        primeLockContract,
        pc2,
        pc2TokenId,
      } = await loadFixture(deployFixture);

      await kharacterContract
        .connect(pc2)
        .setLocks(pc2TokenId, [
          colorLockContract.address,
          primeLockContract.address,
        ]);

      expect(await kharacterContract.getLocks(pc2TokenId)).to.deep.equal([
        colorLockContract.address,
        primeLockContract.address,
      ]);
    });
  });

  describe("getting lock names", function () {
    it("should return lock names", async function () {
      const { admin, kharacterContract, npc2TokenId } = await loadFixture(
        deployFixture
      );

      let locks = await kharacterContract.getLocks(npc2TokenId);

      const abi = ["function desc() public view returns (string)"];

      const lock0 = new ethers.Contract(locks[0], abi, admin);
      const lock1 = new ethers.Contract(locks[1], abi, admin);
      expect([await lock0.desc(), await lock1.desc()]).to.deep.equal([
        "Color",
        "Prime",
      ]);
    });
  });

  describe("hacking the lock stack", function () {
    it("should work", async function () {
      const {
        kharacterContract,
        pc1,
        pc1TokenId,
        npc2TokenId,
      } = await loadFixture(deployFixture);

      let i;
      let result;
      let colorPick;
      let primePick;

      for (i = 0; i < colorList.length; i++) {
        result = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc2TokenId, 0, colorList[i]);
        if (result == true) {
          colorPick = colorList[i];
          break;
        }
      }

      for (i = 0; i < primeList.length; i++) {
        result = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc2TokenId, 1, primeList[i]);
        if (result == true) {
          primePick = primeList[i];
          break;
        }
      }

      await expect(
        kharacterContract
          .connect(pc1)
          .hack(pc1TokenId, npc2TokenId, [colorPick, primePick])
      )
        .to.emit(kharacterContract, "Cracked")
        .withArgs(npc2TokenId, pc1TokenId, 10);
    });
  });

  describe("exploiting the locks", function () {
    it("should mint rewards to player", async function () {
      const {
        kreditContract,
        kharacterContract,
        pc1,
        pc1TokenId,
        npc2TokenId,
      } = await loadFixture(deployFixture);

      let i;
      let result;
      let colorPick;
      let primePick;

      for (i = 0; i < colorList.length; i++) {
        result = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc2TokenId, 0, colorList[i]);
        if (result == true) {
          colorPick = colorList[i];
          break;
        }
      }

      for (i = 0; i < primeList.length; i++) {
        result = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc2TokenId, 1, primeList[i]);
        if (result == true) {
          primePick = primeList[i];
          break;
        }
      }

      await kharacterContract
        .connect(pc1)
        .hack(pc1TokenId, npc2TokenId, [colorPick, primePick]);

      expect(await kreditContract.balanceOf(pc1TokenId)).to.equal(10);
    });
  });
});
