// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;            

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
// no need to this overflow handling library if you are using solidity v >= 0.8 (inbuilt)
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

// Interfaces compile down to an ABI
// ABI helps in interacting with already deployed smart contract 

contract FundMe{
    using SafeMathChainlink for uint256;
    
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    address public owner;
    constructor() public {
        owner = msg.sender;
    }

    // money will be sent from sender to our contract
    // later we can withdraw money from our contract to admin/owner account 
    function fund() public payable{
        // $1 requires atleast 1000000 Gwei
        uint256 minUSD = 1 * (10 ** 8);
        require(getConversionRate(msg.value) >= minUSD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value; // In Wei
        funders.push(msg.sender);
    }

    function getVersion() public view returns (uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        return priceFeed.version();
    }

    // Returns USD * 10^8 per ether for proper representation of digits after decimal
    function getPrice() public view returns (uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        (,int256 answer,,,) = priceFeed.latestRoundData();
        return uint256(answer);
        // Price Representation = 314471000000 = 3,144.71000000 * 10^8
    }

    // 1 ether = 10^9 Gwei and 1 Gwei = 10^9 Wei
    // From Wei to USD * 10^8
    function getConversionRate(uint256 ethAmountInWei) public view returns (uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUSD = (ethPrice * ethAmountInWei) / 1000000000000000000;    // 10^18
        return ethAmountInUSD;
        // Same Price Representation = 314471000000 = 3,144.71000000 * 10^8
    }

    // admin/owner
    modifier onlyOwner{
        require(msg.sender==owner, "You are not privileged to carry out this transaction");
        _;
    }

    // withdraw all funds sent to this contract using `fund payable function` to admin/owner account
    function withdraw() public payable onlyOwner{ 
        msg.sender.transfer(address(this).balance); // this here is contract
        // since all funds sent to us are withdrawn (here it means that all funds are transferred from our contract to sender/admin/owner) so we can reset the array and map of funders 
        for(uint256 fIdx=0; fIdx<funders.length; fIdx++){
            address funder = funders[fIdx];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
    }    
}