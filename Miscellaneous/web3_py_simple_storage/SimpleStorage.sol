// SPDX-License-Identifier: MIT

// pragma solidity >=0.6.0 <0.9.0;        // Range of compiler version
// pragma solidity 0.6.0;              // Specific compiler version
pragma solidity ^0.6.0; // Any 0.6.x compiler version

contract SimpleStorage {
    uint256 favoriteUnsignedInt = 5;
    bool favoriteBool = false;
    string favoriteString = "Hello, world!";
    address favoriteAddress = 0xEcC946f4F2138269482f312BEA7cC435604343C2;
    bytes32 favoriteBytes = "dog";

    // In Solidity, there is default initialization so any variable not initialized will have default value, for example, 0 in case of int
    // Visiblility private, internal (defualt, same as protected), public and external (cannot be called internally)
    int256 public favoriteInt;

    function store(int256 _favNum) public returns (int256) {
        favoriteInt = _favNum;
        return favoriteInt;
    }

    // 'view' and 'pure' indicate that it is a state reading (blue colored) call not state changing (orange colored)
    // 'view' (only viewing data and returning it)
    function show() public view returns (int256) {
        return favoriteInt;
    }

    // 'pure' (doing some math but not changing state)
    // function show2x(int256 fI) public pure {
    //     fI*2;
    // }

    struct People {
        uint256 favNum;
        string name;
    }
    People public person = People({favNum: 7, name: "Aaryan R S"});

    People[] public people;
    mapping(string => uint256) public myMap;

    function addPerson(string memory _name, uint256 _favNum) public {
        // people.push(People({favNum:_favNum, name:_name}));
        people.push(People(_favNum, _name));
        myMap[_name] = _favNum;
    }
}
