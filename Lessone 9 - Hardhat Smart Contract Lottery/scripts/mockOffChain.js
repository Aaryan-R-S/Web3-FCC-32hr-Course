const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const winETH = await ethers.getContract("WinETH")
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await winETH.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await winETH.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
        if (network.config.chainId == 31337) {
            await mockVrf(requestId, winETH)
        }
    } else {
        console.log("No upkeep needed!")
    }
}

async function mockVrf(requestId, winETH) {
    console.log("We on a local network? Ok let's pretend...")
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, winETH.address)
    console.log("Responded!")
    const recentWinner = await winETH.getRecentWinner()
    console.log(`The winner is: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })