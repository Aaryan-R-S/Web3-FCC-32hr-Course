// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./SimpleStorage.sol";

// contract StorageFactory { // Independent from SimpleStorage
// -- Inheritance --
contract StorageFactory is SimpleStorage{
    SimpleStorage[] public simpleStorageArray;

    function createSSContract() public{
        // Deploy a contract using another contract
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageArray.push(simpleStorage);
    }

    // Interact with a contract using another contract 
    function storeSSFavInt(uint256 _idx, int256 _favNum) public{
        SimpleStorage(address(simpleStorageArray[_idx])).store(_favNum);
    }

    function getSSFavInt(uint256 _idx) public view returns (int256){
        return SimpleStorage(address(simpleStorageArray[_idx])).show();
    }
}