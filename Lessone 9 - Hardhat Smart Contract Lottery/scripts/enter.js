const { ethers } = require("hardhat")

async function enterWinETH() {
    const winETH = await ethers.getContract("WinETH")
    const entranceFee = await winETH.getEntranceFee()
    await winETH.enterWinETH({ value: entranceFee + 1 })
    console.log("Entered!")
}

enterWinETH()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })