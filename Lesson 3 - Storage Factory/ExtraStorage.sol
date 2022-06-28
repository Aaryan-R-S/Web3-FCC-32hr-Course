// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SimpleStorage.sol";

contract ExtraStorageFactory is SimpleStorage{ 
    function retrieve() override public view returns (uint256) {
        return favoriteNumber+5;
    }
}