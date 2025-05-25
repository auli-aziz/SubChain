// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SubChain is ERC721 {
    address public owner;
    uint256 public totalSubscriptions;
    uint256 public totalSupply;

    // Defines the subscription structure
    struct Subscription {
        uint256 id;
        string name;
        uint256 cost; // cost per month
        uint256 months; // default selected months
        uint256 maxMonths;
        string date;
        string time;
        string provider;
        string category;
    }

    // Store subscriptions by ID
    mapping(uint256 => Subscription) public subscriptions;

    // Store who has bought a specific subscription
    mapping(uint256 => mapping(address => bool)) public hasBought;

    // Store expiration time of each subscription per user
    mapping(uint256 => mapping(address => uint256)) public subscriptionExpiry;

    // Only owner can call certain functions
    modifier onlyOwner {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    // Add new subscription listing
    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxMonths,
        string memory _date,
        string memory _time,
        string memory _provider,
        string memory _category
    ) public onlyOwner {
        totalSubscriptions++;

        subscriptions[totalSubscriptions] = Subscription(
            totalSubscriptions,
            _name,
            _cost,
            _maxMonths,
            _maxMonths,
            _date,
            _time,
            _provider,
            _category 
        );
    }

    // Purchase a subscription
    function mint(uint256 _id, uint256 _months) public payable {
        require(_id > 0 && _id <= totalSubscriptions, "Invalid subscription ID");
        require(_months > 0 && _months <= subscriptions[_id].maxMonths, "Invalid duration");

        uint256 cost = subscriptions[_id].cost * _months;
        require(msg.value >= cost, "Insufficient ETH");

        // Check if subscription is still active
        if (subscriptionExpiry[_id][msg.sender] > block.timestamp) {
            revert("You have already subscribed. Please wait until it expires.");
        }

        // Update status
        hasBought[_id][msg.sender] = true;
        subscriptionExpiry[_id][msg.sender] = block.timestamp + (_months * 30 days); // Set new expiry

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    // Return subscription data
    function getSubscription(uint256 _id) public view returns (Subscription memory) {
        return subscriptions[_id];
    }

    // Check if user is subscribed (still active)
    function isSubscribed(uint256 _id, address _user) public view returns (bool) {
        return subscriptionExpiry[_id][_user] > block.timestamp;
    }

    // Withdraw contract balance (owner only)
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
