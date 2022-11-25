// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Inbox {
    string public message;

    // constructor with initial value
    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
