// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SubChain is ERC721 {
    address public owner;
    uint256 public totalSubscriptions;
    uint256 public totalSupply;

    // defines the subscription structure
    struct Subscription {
        uint256 id;
        string name;
        uint256 cost;
        uint256 months;
        uint256 maxMonths;
        string date;
        string time;
        string provider;
    }

    // stores key-value pairs (used to add id)
    mapping(uint256 => Subscription) subscriptions;
    mapping(uint256 => mapping(address => bool)) public hasBought;

    // condition to insert subscription into list
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        // sender is the person who called the constructor
        owner = msg.sender;
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxMonths,
        string memory _date,
        string memory _time,
        string memory _provider
    ) public onlyOwner {
        totalSubscriptions++;
        // creates the subscription (saved to blockchain)
        subscriptions[totalSubscriptions] = Subscription(
            totalSubscriptions,
            _name,
            _cost,
            _maxMonths,
            _maxMonths,
            _date,
            _time,
            _provider
        );
    }

    // buy subscription
    function mint(uint256 _id, uint256 _months) public payable {
        // Require that _id is not 0 or less than total subscriptions
        require(_id != 0);
        require(_id <= totalSubscriptions);

        // Require that ETH sent is greater than cost
        require(msg.value >= subscriptions[_id].cost);

        subscriptions[_id].maxMonths = _months;

        hasBought[_id][msg.sender] = true; // <-- Update buying status

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getSubscription(uint256 _id) public view returns(Subscription memory) {
        // returns the subscription stored within the blockchain
        return subscriptions[_id];
    }

    // withdraw ether for the deployer/owner
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
