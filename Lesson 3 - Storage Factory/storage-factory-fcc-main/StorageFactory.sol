// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SimpleStorage.sol";

// Single solidity file can hold multiple contracts

contract StorageFactory { // Independent from SimpleStorage
    SimpleStorage[] public simpleStorageArray;

    function createSSContract() public{
        // Deploy a contract using another contract
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageArray.push(simpleStorage);
    }

    // Interact with a contract using another contract 
    function storeSSFavInt(uint256 _idx, uint256 _favNum) public{
        simpleStorageArray[_idx].store(_favNum);
    }

    function getSSFavInt(uint256 _idx) public view returns (uint256){
        return simpleStorageArray[_idx].retrieve();
    }
}