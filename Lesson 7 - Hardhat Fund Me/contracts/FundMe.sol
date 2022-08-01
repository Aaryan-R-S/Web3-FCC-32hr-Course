// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    // defining our library functions to be available on uint256 object
    using PriceConverter for uint256;

    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    // MORE GAS OPTIMIZED
    // Could we make this constant?  /* hint: no! We should make it immutable! As we have to define its value in the constructor later */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 1 * 1e18;
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // first parameter of getConversionRate will be msg.value. To pass the other parameters you have to ultimately give it to the function only as parameter like msg.value.getConversionRate("secondParams")
        require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(L4_PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }
    
    function getVersion() public view returns (uint256){
        return priceFeed.version();
    }
    
    modifier onlyOwner {
        // require(msg.sender == owner);
        // MORE GAS OPTIMIZED
        if (msg.sender != i_owner) revert NotOwner(); 
        _;
    }
    
    function withdraw() payable onlyOwner public {
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        // For sending money, 3 Methods:
        // 1. Transfer - , error
        // 2. Send - , bool
        // 3. Call - , bool

        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }


    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()
}