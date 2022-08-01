// imports (required)
// main function (not required; instead make a helper functions)
// calling main (not required; just export it)
const { getNamedAccounts, deployments, network , ethers} = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// function deployFunc() {
//     console.log("Hi!")
// }

// module.exports.default = deployFunc

// [Use above OR this]
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // we want to use mock for localhost or hardhat network
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    // // [NOT WORKING; Don't know why? Getting this error- TypeError: customChains is not iterable]
    // if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
    //     log(network.name)
    //     await verify(fundMe.address, [ethUsdPriceFeedAddress])
    // }
}

module.exports.tags = ["all", "fundme"]