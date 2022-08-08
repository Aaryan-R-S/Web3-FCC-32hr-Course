const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const winETH = await ethers.getContract("WinETH")
    fs.writeFileSync(frontEndAbiFile, winETH.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const winETH = await ethers.getContract("WinETH")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(winETH.address)) {
            contractAddresses[network.config.chainId.toString()].push(winETH.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [winETH.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]