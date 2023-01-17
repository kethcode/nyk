const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Kredit", function () {
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

    return {
      kreditContract,
      kharacterContract,
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
    it("should set admin correctly", async function () {
      const { admin, kreditContract } = await loadFixture(deployFixture);
      expect(await kreditContract.admin()).to.equal(admin.address);
    });
  });

  describe("mint", function () {
    it("should create the corrent number of tokens", async function () {
      const { admin, kreditContract, pc1TokenId } = await loadFixture(
        deployFixture
      );

      await kreditContract.connect(admin).mint(pc1TokenId, 10000);
      expect(await kreditContract.balanceOf(pc1TokenId)).to.equal(10000);
    });

    it("to a non-existant token should fail", async function () {
      const { admin, kreditContract, pc1TokenId } = await loadFixture(
        deployFixture
      );

      await expect(
        kreditContract.connect(admin).mint(pc1TokenId + 100, 10000)
      ).to.be.revertedWith("NOT_MINTED");
    });
  });

  describe("burn", function () {
    it("should burn the corrent number of tokens", async function () {
      const { admin, kreditContract, pc1TokenId } = await loadFixture(
        deployFixture
      );
      await kreditContract.connect(admin).mint(pc1TokenId, 10000);
      expect(await kreditContract.balanceOf(pc1TokenId)).to.equal(10000);
      await kreditContract.connect(admin).burn(pc1TokenId, 5000);
      expect(await kreditContract.balanceOf(pc1TokenId)).to.equal(5000);
    });
  });
});
