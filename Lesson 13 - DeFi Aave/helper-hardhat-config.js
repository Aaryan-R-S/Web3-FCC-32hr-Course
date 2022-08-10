const networkConfig = {
  31337: {
      name: "localhost",
      wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
      daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
      daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f"
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  4: {
      name: "rinkeby",
      ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
      wethToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      lendingPoolAddressesProvider: "0x9B880Fb017c2547e3E6B372b5Ee5E600ff637fF8",
      daiEthPriceFeed: "0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D",
      daiToken: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"
  }
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
  networkConfig,
  developmentChains
}