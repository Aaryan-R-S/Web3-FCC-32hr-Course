const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("WinETH Unit Tests", function () {
          let winETH, winETHContract, vrfCoordinatorV2Mock, winETHEntranceFee, interval, player; // , deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners(); // could also do with getNamedAccounts
              //   deployer = accounts[0]
              player = accounts[1];
              await deployments.fixture(["mocks", "wineth"]); // Deploys modules with the tags "mocks" and "wineth"
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock"); // Returns a new connection to the VRFCoordinatorV2Mock contract
              winETHContract = await ethers.getContract("WinETH"); // Returns a new connection to the WinETH contract
              winETH = winETHContract.connect(player); // Returns a new instance of the WinETH contract connected to player
              winETHEntranceFee = await winETH.getEntranceFee();
              interval = await winETH.getInterval();
          });

          describe("constructor", function () {
              it("intitiallizes the winETH correctly", async () => {
                  // Ideally, we'd separate these out so that only 1 assert per "it" block
                  // And ideally, we'd make this check everything
                  const winETHState = (await winETH.getWinETHState()).toString();
                  // Comparisons for WinETH initialization:
                  assert.equal(winETHState, "0");
                  assert.equal(
                      interval.toString(),
                      networkConfig[network.config.chainId]["keepersUpdateInterval"]
                  );
              });
          });

          describe("enterWinETH", function () {
              it("reverts when you don't pay enough", async () => {
                  await expect(winETH.enterWinETH()).to.be.revertedWith(
                      // is reverted when not paid enough or winETH is not open
                      "WinETH__SendMoreToEnterWinETH"
                  );
              });
              it("records player when they enter", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  const contractPlayer = await winETH.getPlayer(0);
                  assert.equal(player.address, contractPlayer);
              });
              it("emits event on enter", async () => {
                  await expect(winETH.enterWinETH({ value: winETHEntranceFee })).to.emit(
                      // emits WinETHEnter event if entered to index player(s) address
                      winETH,
                      "WinETHEnter"
                  );
              });
              it("doesn't allow entrance when winETH is calculating", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  // for a documentation of the methods below, go here: https://hardhat.org/hardhat-network/reference
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  // we pretend to be a keeper for a second
                  await winETH.performUpkeep([]); // changes the state to calculating for our comparison below
                  await expect(winETH.enterWinETH({ value: winETHEntranceFee })).to.be.revertedWith(
                      // is reverted as winETH is calculating
                      "WinETH__WinETHNotOpen"
                  );
              });
          });

          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await winETH.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded);
              });
              it("returns false if winETH isn't open", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  await winETH.performUpkeep([]); // changes the state to calculating
                  const winETHState = await winETH.getWinETHState(); // stores the new state
                  const { upkeepNeeded } = await winETH.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert.equal(winETHState.toString(), "1");
                  assert.equal(upkeepNeeded, false);
              });
              it("returns false if enough time hasn't passed", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await winETH.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded);
              });
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await winETH.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded);
              });
          });

          describe("performUpkeep", function () {
              it("can only run if checkupkeep is true", async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const tx = await winETH.performUpkeep("0x");
                  assert(tx);
              });
              it("reverts if checkup is false", async () => {
                  await expect(winETH.performUpkeep("0x")).to.be.revertedWith(
                      "WinETH__UpkeepNotNeeded"
                  );
              });
              it("updates the winETH state and emits a requestId", async () => {
                  // Too many asserts in this test!
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const txResponse = await winETH.performUpkeep("0x"); // emits requestId
                  const txReceipt = await txResponse.wait(1); // waits 1 block
                  const winETHState = await winETH.getWinETHState(); // updates state
                  const requestId = txReceipt.events[1].args.requestId;
                  assert(requestId.toNumber() > 0);
                  assert(winETHState == 1); // 0 = open, 1 = calculating
              });
          });

          describe("fulfillRandomWords", function () {
              beforeEach(async () => {
                  await winETH.enterWinETH({ value: winETHEntranceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
              });
              it("can only be called after performupkeep", async () => {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, winETH.address) // reverts if not fulfilled
                  ).to.be.revertedWith("nonexistent request");
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, winETH.address) // reverts if not fulfilled
                  ).to.be.revertedWith("nonexistent request");
              });
              // This test is too big...
              it("picks a winner, resets, and sends money", async () => {
                  const additionalEntrances = 3; // to test
                  const startingIndex = 2;
                  for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                      // i = 2; i < 5; i=i+1
                      winETH = winETHContract.connect(accounts[i]); // Returns a new instance of the WinETH contract connected to player
                      await winETH.enterWinETH({ value: winETHEntranceFee });
                  }
                  const startingTimeStamp = await winETH.getLastTimeStamp(); // stores starting timestamp (before we fire our event)

                  // This will be more important for our staging tests...
                  await new Promise(async (resolve, reject) => {
                      winETH.once("WinnerPicked", async () => {
                          // event listener for WinnerPicked
                          console.log("WinnerPicked event fired!");
                          // assert throws an error if it fails, so we need to wrap
                          // it in a try/catch so that the promise returns event
                          // if it fails.
                          try {
                              // Now lets get the ending values...
                              const recentWinner = await winETH.getRecentWinner();
                              const winETHState = await winETH.getWinETHState();
                              const winnerBalance = await accounts[2].getBalance();
                              const endingTimeStamp = await winETH.getLastTimeStamp();
                              await expect(winETH.getPlayer(0)).to.be.reverted;
                              // Comparisons to check if our ending values are correct:
                              assert.equal(recentWinner.toString(), accounts[2].address);
                              assert.equal(winETHState, 0);
                              assert.equal(
                                  winnerBalance.toString(),
                                  startingBalance // startingBalance + ( (winETHEntranceFee * additionalEntrances) + winETHEntranceFee )
                                      .add(
                                          winETHEntranceFee
                                              .mul(additionalEntrances)
                                              .add(winETHEntranceFee)
                                      )
                                      .toString()
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve(); // if try passes, resolves the promise
                          } catch (e) {
                              reject(e); // if try fails, rejects the promise
                          }
                      });

                      const tx = await winETH.performUpkeep("0x");
                      const txReceipt = await tx.wait(1);
                      const startingBalance = await accounts[2].getBalance();
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          winETH.address
                      );
                  });
              });
          });
      });
