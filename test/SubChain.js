const { expect } = require("chai");

const NAME = "SubChain";
const SYMBOL = "SC";

const SUB_NAME = "Premium Plan";
const SUB_COST = ethers.parseEther("1");
const SUB_MAX_MONTHS = 12;
const SUB_DATE = "Apr 27";
const SUB_TIME = "10:00AM";
const SUB_PROVIDER = "Netflix";

describe("SubChain", () => {
  let subChain;
  let deployer, buyer;

  beforeEach(async () => {
    // setup accounts
    [deployer, buyer] = await ethers.getSigners();

    const SubChain = await ethers.getContractFactory(NAME);
    subChain = await SubChain.deploy(NAME, SYMBOL);

    // make subscriptions
    const transaction = await subChain
      .connect(deployer)
      .list(
        SUB_NAME,
        SUB_COST,
        SUB_MAX_MONTHS,
        SUB_DATE,
        SUB_TIME,
        SUB_PROVIDER
      );
    await transaction.wait();
  });

  describe("Deployement", () => {
    it("Sets the name", async () => {
      const name = await subChain.name();
      expect(name).to.equal(NAME);
    });

    it("Sets the symbol", async () => {
      const symbol = await subChain.symbol();
      expect(symbol).to.equal(SYMBOL);
    });

    it("Sets the owner", async () => {
      const owner = await subChain.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("Subscriptions", () => {
    it("Updates the subscriptions count", async () => {
      const totalSubscriptions = await subChain.totalSubscriptions();
      expect(totalSubscriptions).to.equal(1);
    });

    it("Returns correct subscription information", async () => {
      const subscription = await subChain.getSubscription(1);
      expect(subscription.id).to.be.equal(1);
      expect(subscription.name).to.be.equal(SUB_NAME);
      expect(subscription.cost).to.be.equal(SUB_COST);
      expect(subscription.months).to.be.equal(SUB_MAX_MONTHS);
      expect(subscription.date).to.be.equal(SUB_DATE);
      expect(subscription.time).to.be.equal(SUB_TIME);
      expect(subscription.provider).to.be.equal(SUB_PROVIDER);
    });
  });

  describe("Minting", () => {
    const ID = 1;
    const AMOUNT = ethers.parseEther("1");

    beforeEach(async () => {
      const transaction = await subChain
        .connect(buyer)
        .mint(ID, SUB_MAX_MONTHS, { value: AMOUNT });
      await transaction.wait();
    });

    it("Updates max months", async () => {
      const subscription = await subChain.getSubscription(1);
      expect(subscription.maxMonths).to.be.equal(SUB_MAX_MONTHS);
    });

    it("Updates buying status", async () => {
      const status = await subChain.hasBought(ID, buyer.address);
      expect(status).to.be.equal(true);
    });

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(
        await subChain.getAddress()
      );
      expect(balance).to.be.equal(AMOUNT);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.parseEther("1", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await subChain
        .connect(buyer)
        .mint(ID, SEAT, { value: AMOUNT });
      await transaction.wait();

      transaction = await subChain.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(
        await subChain.getAddress()
      );
      expect(balance).to.equal(0);
    });
  });
});
