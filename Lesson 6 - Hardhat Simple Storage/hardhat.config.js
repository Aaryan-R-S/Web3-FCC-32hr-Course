require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")
/** @type import('hardhat/config').HardhatUserConfig */

const POLYGON_MUMBAI_RPC_PROVIDER = process.env.POLYGON_MUMBAI_RPC_PROVIDER || "https://rpc-mumbai.maticvigil.com/api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "0xkey"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "0xkey"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        mumbai: {
            url: POLYGON_MUMBAI_RPC_PROVIDER,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: Thanks hardhat!,
            chainId: 31337,
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
        token:"MATIC",
    },
    solidity: "0.8.0",
}
