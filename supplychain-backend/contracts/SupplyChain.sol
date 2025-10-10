// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    enum StageType { Created, Manufactured, Shipped, Delivered }

    struct Product {
        uint256 id;
        string name;
        string description;
        address owner;
        StageType stage;
        string[] history;
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId;

    event ProductCreated(uint256 indexed id, string name, address owner);
    event StageUpdated(uint256 indexed id, StageType newStage, address updater);
    event OwnershipTransferred(uint256 indexed id, address from, address to);

    modifier onlyOwner(uint256 _id) {
        require(products[_id].owner == msg.sender, "Not product owner");
        _;
    }

    function createProduct(string memory _name, string memory _description) external {
        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            owner: msg.sender,
            stage: StageType.Created,
            history: new string[](0)    
        });

        emit ProductCreated(productId, _name, msg.sender);
    }


    function updateStage(uint256 _id, StageType _stage, string memory _note) external onlyOwner(_id) {
        Product storage p = products[_id];
        p.stage = _stage;
        p.history.push(_note);
        emit StageUpdated(_id, _stage, msg.sender);
    }

    function transferOwnership(uint256 _id, address _newOwner) external onlyOwner(_id) {
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    function getProduct(uint256 _id)
        external
        view
        returns (string memory, string memory, address, StageType, string[] memory)
    {
        Product storage p = products[_id];
        return (p.name, p.description, p.owner, p.stage, p.history);
    }
}
