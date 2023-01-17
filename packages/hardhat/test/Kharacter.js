const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

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

async function lockTestFixture(kharacterContract, colorLock) {
  const [deployer, khar, npc1, npc2, pc1, pc2] = await ethers.getSigners();

  await kharacterContract.mint(deployer.address);
  await kharacterContract.mint(npc1.address);
  await kharacterContract.mint(npc2.address);

  let deployerTokenId = await kharacterContract.tokenOfOwnerByIndex(
    deployer.address,
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

  await kharacterContract.setLocks(deployerTokenId, [colorLock.address]);
  await kharacterContract.setLocks(npc1TokenId, [colorLock.address]);
  // npc2 doesn't get any locks

  return { deployerTokenId, npc1TokenId, npc2TokenId };
}

describe("Kharacter", function () {
  async function deployKharacterFixture() {
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

  async function deployLockFixture() {
    const lockContractFactory = await ethers.getContractFactory("Lock");

    const colorLock = await lockContractFactory.deploy(
      300,
      colorLockDesc,
      colorLockKeylist
    );
    await colorLock.deployed();

    return { colorLock };
  }

  describe("deployment", function () {
    it("should set the correctname", async function () {
      const kharacterContractFactory = await ethers.getContractFactory(
        "Kharacter"
      );
      const kharacterContract = await kharacterContractFactory.deploy();
      await kharacterContract.deployed();
      expect(await kharacterContract.name()).to.equal("Kharacter");
    });
  });

  describe("register", function () {
    it("should register msg.sender", async function () {
      const [admin, npc1, npc2, pc1, pc2] = await ethers.getSigners();
      const kharacterContractFactory = await ethers.getContractFactory(
        "Kharacter"
      );
      const kharacterContract = await kharacterContractFactory.deploy();
      await kharacterContract.deployed();
      await kharacterContract.register();

      expect(await kharacterContract.registered(admin.address)).to.be.true;
    });
  });

  describe("mint", function () {
    it("should create the corrent number of tokens", async function () {
      const [admin, npc1, npc2, pc1, pc2] = await ethers.getSigners();
      const kreditContractFactory = await ethers.getContractFactory("Kredit");
      const kreditContract = await kreditContractFactory.deploy();
      await kreditContract.deployed();

      const kharacterContractFactory = await ethers.getContractFactory(
        "Kharacter"
      );
      const kharacterContract = await kharacterContractFactory.deploy();
      await kharacterContract.deployed();
      await kharacterContract.setKredit(kreditContract.address);

      await kharacterContract.register();
      await kharacterContract.mint(0);
      await kharacterContract.mint(0);
      expect(await kharacterContract.balanceOf(admin.address)).to.equal(2);
    });
  });

  describe("burn", function () {
    it("should burn the corrent number of tokens", async function () {
      const [admin, npc1, npc2, pc1, pc2] = await ethers.getSigners();
      const kreditContractFactory = await ethers.getContractFactory("Kredit");
      const kreditContract = await kreditContractFactory.deploy();
      await kreditContract.deployed();

      const kharacterContractFactory = await ethers.getContractFactory(
        "Kharacter"
      );
      const kharacterContract = await kharacterContractFactory.deploy();
      await kharacterContract.deployed();
      await kharacterContract.setKredit(kreditContract.address);

      await kharacterContract.register();
      await kharacterContract.mint(0);
      expect(await kharacterContract.balanceOf(admin.address)).to.equal(1);
      await kharacterContract.burn(0);
      expect(await kharacterContract.balanceOf(admin.address)).to.equal(0);
    });
  });

  describe("getLocks", function () {
    it("should return a list of locks", async function () {
      const { kharacterContract, pc1 } = await loadFixture(
        deployKharacterFixture
      );
      const { colorLock } = await loadFixture(deployLockFixture);

      let tokenId = await kharacterContract.tokenOfOwnerByIndex(pc1.address, 0);
      await kharacterContract
        .connect(pc1)
        .setLocks(tokenId, [colorLock.address, colorLock.address]);

      expect(
        await kharacterContract.connect(pc1).getLocks(tokenId)
      ).to.deep.equal([colorLock.address, colorLock.address]);
    });
  });

  describe("probe", function () {
    it("should return true when correct pick is provided", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);

      await kharacterContract
        .connect(npc1)
        .setLocks(npc1TokenId, [colorLock.address]);

      let lockIndex = 0;

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i]);
        if (tempResult == true) {
          break;
        }
      }

      expect(
        await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i])
      ).to.equal(true);
    });
  });

  describe("exploit", function () {
    it("should return true when no locks are present", async function () {
      const { kharacterContract, pc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);
      let lockIndex = 0;

      expect(
        await kharacterContract
          .connect(pc1)
          .exploit(pc1TokenId, npc1TokenId, [colorList[lockIndex]])
      ).to.equal(true);
    });

    it("should return true when correct picks are provided", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);

      await kharacterContract
        .connect(npc1)
        .setLocks(npc1TokenId, [colorLock.address]);

      let lockIndex = 0;

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i]);
        if (tempResult == true) {
          break;
        }
      }

      expect(
        await kharacterContract
          .connect(pc1)
          .exploit(pc1TokenId, npc1TokenId, [colorList[i]])
      ).to.equal(true);
    });

    it("should return false when wrong picks are provided", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);

      await kharacterContract
        .connect(npc1)
        .setLocks(npc1TokenId, [colorLock.address]);

      let lockIndex = 0;

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i]);
        if (tempResult == false) {
          break;
        }
      }

      expect(
        await kharacterContract
          .connect(pc1)
          .exploit(pc1TokenId, npc1TokenId, [colorList[i]])
      ).to.equal(false);
    });
  });

  describe("hack", function () {
    it("should emit Cracked when no locks are present", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      let lockIndex = 0;
      let default_reward = 10;

      await expect(
        kharacterContract
          .connect(pc1)
          .hack(pc1TokenId, npc1TokenId, [colorList[lockIndex]])
      )
        .to.emit(kharacterContract, "Cracked")
        .withArgs(npc1TokenId, pc1TokenId, default_reward);
    });

    it("should emit Cracked when correct picks are provided", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);

      await kharacterContract
        .connect(npc1)
        .setLocks(npc1TokenId, [colorLock.address]);

      let lockIndex = 0;
      let default_reward = 10;

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i]);
        if (tempResult == true) {
          break;
        }
      }

      await expect(
        kharacterContract
          .connect(pc1)
          .hack(pc1TokenId, npc1TokenId, [colorList[i]])
      )
        .to.emit(kharacterContract, "Cracked")
        .withArgs(npc1TokenId, pc1TokenId, default_reward);
    });

    it("should emit Attacked when wrong picks are provided", async function () {
      const { kharacterContract, pc1, npc1, pc1TokenId, npc1TokenId } =
        await loadFixture(deployKharacterFixture);

      const { colorLock } = await loadFixture(deployLockFixture);

      await kharacterContract
        .connect(npc1)
        .setLocks(npc1TokenId, [colorLock.address]);

      let lockIndex = 0;
      let default_reward = 10;

      let i;
      let tempResult;
      for (i = 0; i < colorList.length; i++) {
        tempResult = await kharacterContract
          .connect(pc1)
          .probe(pc1TokenId, npc1TokenId, lockIndex, colorList[i]);
        if (tempResult == false) {
          break;
        }
      }

      await expect(
        kharacterContract
          .connect(pc1)
          .hack(pc1TokenId, npc1TokenId, [colorList[i]])
      )
        .to.emit(kharacterContract, "Attacked")
        .withArgs(npc1TokenId, pc1TokenId);
    });
  });
});
