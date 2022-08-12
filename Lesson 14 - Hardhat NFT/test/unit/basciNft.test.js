const { assert } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Unit Test", function () {
          let basicNft, deployer, user1;
          beforeEach(async function () {
              const accounts = await getNamedAccounts();
              deployer = accounts.deployer;
              user1 = accounts.user1;
              await deployments.fixture("all");
              basicNft = await ethers.getContract("BasicNft", deployer);
          });

          it("was deployed", async () => {
              assert(basicNft.address);
          });

          describe("constructor", () => {
              it("initializes the token with the correct name and symbol ", async () => {
                  const name = (await basicNft.name()).toString();
                  assert.equal(name, "Dogie");

                  const symbol = (await basicNft.symbol()).toString();
                  assert.equal(symbol, "DOG");
              });
              it("initializes the token counter correctly ", async () => {
                  const s_tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(s_tokenCounter.toString(), "0");
              });
              it("initializes the token uri correctly ", async () => {
                  const token_uri = await basicNft.tokenURI(0);
                  assert.equal(token_uri.toString(), await basicNft.TOKEN_URI());
              });
          });

          describe("mint nft", () => {
              it("deployer can mint a nft correctly ", async () => {
                  const txResponse = await basicNft.mintNft();
                  await txResponse.wait(1);
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1");
                  const tokenURI = await basicNft.tokenURI(0);
                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
              });
              it("user can mint a nft correctly ", async () => {
                  let txResponse =  await basicNft.mintNft();
                  await txResponse.wait(1);
                  basicNft = await ethers.getContract("BasicNft", user1);
                  txResponse = await basicNft.mintNft();
                  await txResponse.wait(1);
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "2");
                  const tokenURI = await basicNft.tokenURI(1);
                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
              });
          });
      });
