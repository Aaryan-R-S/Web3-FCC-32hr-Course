require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("solidity-coverage")
// require("@nomiclabs/hardhat-waffle")
/** @type import('hardhat/config').HardhatUserConfig */

const POLYGON_MUMBAI_RPC_PROVIDER = process.env.POLYGON_MUMBAI_RPC_PROVIDER || "https://rpc-mumbai.maticvigil.com/api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/", // not required
            // accounts: Thanks hardhat!,
            chainId: 31337,
        },
        mumbai: {
            url: POLYGON_MUMBAI_RPC_PROVIDER,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "INR",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 1, // similarly on mainnet it will take the second account as deployer.
            31337: 0, // on hardhat use first account
            80001: 0, // on matic use first account
            // Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        user: {
            default: 0, // for testing, choose first account
        },
    },
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
}
