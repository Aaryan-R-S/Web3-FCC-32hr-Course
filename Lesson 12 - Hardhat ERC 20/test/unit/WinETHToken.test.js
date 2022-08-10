const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { INITIAL_SUPPLY } = require("../../helper-hardhat-config");

describe("WinETHToken Unit Test", function () {
    //Multipler is used to make reading the math easier because of the 18 decimal points
    const multiplier = 10 ** 18;
    let winETHToken, deployer, user1;
    beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        await deployments.fixture("all");
        winETHToken = await ethers.getContract("WinETHToken", deployer);
    });
    it("was deployed", async () => {
        assert(winETHToken.address);
    });
    describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token ", async () => {
            const totalSupply = await winETHToken.totalSupply();
            assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
            const name = (await winETHToken.name()).toString();
            assert.equal(name, "WinETHToken");

            const symbol = (await winETHToken.symbol()).toString();
            assert.equal(symbol, "WinETH");
        });
    });
    describe("minting", () => {
        it("user can not mint", async () => {
            try {
                await winETHToken._mint(deployer, 100);
                assert(false);
            } catch (e) {
                assert(e);
            }
        });
    });
    describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
            const tokensToSend = ethers.utils.parseEther("10");
            await winETHToken.transfer(user1, tokensToSend);
            expect(await winETHToken.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
            await expect(
                winETHToken.transfer(user1, (10 * multiplier).toString())
            ).to.emit(winETHToken, "Transfer");
        });
        describe("allowances", () => {
            const amount = (20 * multiplier).toString();
            beforeEach(async () => {
                playerToken = await ethers.getContract("WinETHToken", user1);
            });
            it("Should approve other address to spend token", async () => {
                const tokensToSpend = ethers.utils.parseEther("5");
                await winETHToken.approve(user1, tokensToSpend);
                const winETHToken1 = await ethers.getContract("WinETHToken", user1);
                await winETHToken1.transferFrom(deployer, user1, tokensToSpend);
                expect(await winETHToken1.balanceOf(user1)).to.equal(
                    tokensToSpend
                );
            });
            it("doesn't allow an unnaproved member to do transfers", async () => {
                //Deployer is approving that user1 can spend 20 of their precious OT's

                await expect(
                    playerToken.transferFrom(deployer, user1, amount)
                ).to.be.revertedWith("ERC20: insufficient allowance");
            });
            it("emits an approval event, when an approval occurs", async () => {
                await expect(winETHToken.approve(user1, amount)).to.emit(
                    winETHToken,
                    "Approval"
                );
            });
            it("the allowance being set is accurate", async () => {
                await winETHToken.approve(user1, amount);
                const allowance = await winETHToken.allowance(deployer, user1);
                assert.equal(allowance.toString(), amount);
            });
            it("won't allow a user to go over the allowance", async () => {
                await winETHToken.approve(user1, amount);
                await expect(
                    playerToken.transferFrom(
                        deployer,
                        user1,
                        (40 * multiplier).toString()
                    )
                ).to.be.revertedWith("ERC20: insufficient allowance");
            });
        });
    });
});