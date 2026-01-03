const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Token Faucet DApp", function () {
  let token, faucet;
  let owner, user1, user2;

  const FAUCET_AMOUNT = ethers.parseEther("100");
  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy Faucet
    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    // Set faucet as minter
    await token.setFaucet(await faucet.getAddress());
  });

  it("Should allow user to claim tokens", async function () {
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user1.address, FAUCET_AMOUNT, anyValue);

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(FAUCET_AMOUNT);
  });

  it("Should NOT allow claim before cooldown", async function () {
    await faucet.connect(user1).requestTokens();

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cooldown active");
  });

  it("Should allow claim after 24 hours", async function () {
    await faucet.connect(user1).requestTokens();

    await ethers.provider.send("evm_increaseTime", [DAY]);
    await ethers.provider.send("evm_mine");

    await faucet.connect(user1).requestTokens();

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(FAUCET_AMOUNT * 2n);
  });

  it("Should enforce lifetime limit", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await ethers.provider.send("evm_increaseTime", [DAY]);
      await ethers.provider.send("evm_mine");
    }

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime limit exceeded");
  });

  it("Should pause and block claims", async function () {
    await faucet.connect(owner).setPaused(true);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  it("Only admin can pause the faucet", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Only admin");
  });

  it("Different users have independent cooldowns", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    const bal1 = await token.balanceOf(user1.address);
    const bal2 = await token.balanceOf(user2.address);

    expect(bal1).to.equal(FAUCET_AMOUNT);
    expect(bal2).to.equal(FAUCET_AMOUNT);
  });
});
