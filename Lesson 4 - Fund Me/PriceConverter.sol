// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// This is not a contract but a library. This is because we will be using it in FundMe.sol as (uint).someFunctionOfThisLibrary
library PriceConverter {
    
    // We could make this public, but then we'd have to deploy it. So its "internal" so that no one from outside can interact with it but can easily implement it
    function getPrice() internal view returns (uint256) {
        // Rinkeby ETH / USD Address
        // https://docs.chain.link/docs/ethereum-addresses/
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(price * 1e10);   // here we are returning rate in USD/ETH * 1e18 (i.e. extra multiplier of 1e18 to have high precision instead of "decimal" which has low precision)
    }

    function getConversionRate(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInUsd;  // here we are returning value in USD * 1e18
    }
}
