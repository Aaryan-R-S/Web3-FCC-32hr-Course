// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract SafeMathTester{
    uint8 public bigNumber = 255; // unchecked but get checked for higher versions from 0.8.0

    function add() public {
        bigNumber = bigNumber + 1;
    }
}