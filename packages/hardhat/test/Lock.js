const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

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

describe("Lock", function () {
  async function deployLockFixture() {
    const [owner, kred, khar, npc1, npc2, pc1, pc2] = await ethers.getSigners();

    const lockContractFactory = await ethers.getContractFactory("Lock");

    const colorLock = await lockContractFactory.deploy(
      300,
      colorLockDesc,
      colorLockKeylist
    );
    await colorLock.deployed();

    return { colorLock, khar, npc1, npc2 };
  }

  describe("deployment", function () {
    it("should set the correct lock parameters address", async function () {
      const { colorLock } = await loadFixture(deployLockFixture);
      expect(await colorLock.desc()).to.equal(colorLockDesc);
    });
  });

  describe("getKeyIndex", function () {
    it("should change as time passes, based on update_rate", async function () {
      const { colorLock } = await loadFixture(deployLockFixture);

      //   console.log(await colorLock.getKeyIndex());
      //   console.log(await colorLock.test(colorList[4]));
      //   await mine(300);
      //   console.log(await colorLock.getKeyIndex());
      //   console.log(await colorLock.test(colorList[5]));

      expect(await colorLock.test(colorList[await colorLock.getKeyIndex()])).to
        .be.true;
    });
  });

  describe("unlock", function () {
    it("should return true if correct", async function () {
      const { colorLock } = await loadFixture(deployLockFixture);

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await colorLock.test(colorList[i]);
        if (tempResult == true) {
          break;
        }
      }

      expect(await colorLock.unlock(colorList[i])).to.be.true;
    });
    it("should revert if incorrect", async function () {
      const { colorLock } = await loadFixture(deployLockFixture);
      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await colorLock.test(colorList[i]);
        if (tempResult == false) {
          break;
        }
      }

      await expect(
        colorLock.unlock(colorList[i])
      ).to.be.revertedWithCustomError(colorLock, "Invalid");
    });
  });
});
