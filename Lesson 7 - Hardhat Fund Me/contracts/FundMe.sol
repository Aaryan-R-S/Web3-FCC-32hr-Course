// SPDX-License-Identifier: MIT

// 1. Pragma
pragma solidity ^0.8.8;

// 2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// 3. Errors
error FundMe__NotOwner();

// 4. Interfaces

// 5. Libraries

// 6. Contracts
/** @title A contract for crowd funding
 *  @author Aaryan Raj Saxena
 *  @notice This contract is a to demo a sample funding project
 *  @dev This implements price feed as our library
 */
contract FundMe {
    // defining our library functions to be available on uint256 object
    // 1. Type Declarations
    using PriceConverter for uint256;

    // 2. State variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // MORE GAS OPTIMIZED
    // Could we make this constant?  /* hint: no! We should make it immutable! As we have to define its value in the constructor later */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 1 * 1e18;
    AggregatorV3Interface private s_priceFeed;

    // 3. Events

    // 4. Events
    modifier onlyOwner() {
        // require(msg.sender == owner), "FundeMe__NotOwner";
        // MORE GAS OPTIMIZED
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // 5. Functions
    // Constructor -> Receive -> Fallback -> External -> Public ->  Internal -> Private -> View -> Pure
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
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

    /** @notice This function funds this contract 
     *  @dev This implements price feed as our library
    */
    function fund() public payable {
        // first parameter of getConversionRate will be msg.value. To pass the other parameters you have to ultimately give it to the function only as parameter like msg.value.getConversionRate("secondParams")
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(L4_PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    /** @notice This function withdraw funds from this contract 
    */
    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

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
        (bool callSuccess, ) = payable(msg.sender).call{ value: address(this).balance }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            // mappings can't be in memory, sorry!
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{ value: address(this).balance }("");
        require(callSuccess, "Call failed");
    }

    function getAddressToAmountFunded(address fundingAddress) public view returns (uint256){
        return s_addressToAmountFunded[fundingAddress];
    }    
    
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
