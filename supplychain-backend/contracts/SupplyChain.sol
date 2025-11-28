// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {

    enum StageType { Created, Manufactured, Shipped, Delivered }

    struct Product {
        string productId;      
        string name;
        string description;
        string ipfsHash;
        string manufactureDate; // Mới
        string expiryDate;      // Mới
        address owner;
        StageType stage;
        string[] history;      
    }

    mapping(string => Product) public products;

    // -----------------------------
    // EVENTS (HYBRID STRATEGY)
    // -----------------------------
    event ProductCreated(
        // 1. INDEX: Dùng Hash để RPC lọc nhanh (Machine readable)
        bytes32 indexed productIdHash, 
        
        // 2. DATA: Dùng String để hiển thị rõ trên Etherscan (Human readable)
        string productId,
        string name,
        string manufactureDate,
        string expiryDate,
        
        address indexed owner
    );

    event StageUpdated(
        bytes32 indexed productIdHash,
        string productId, // Hiển thị ID rõ ràng khi update
        StageType newStage,
        address indexed updater
    );

    event OwnershipTransferred(
        bytes32 indexed productIdHash,
        string productId,
        address indexed from,
        address indexed to
    );

    modifier onlyOwner(string memory _id) {
        require(products[_id].owner == msg.sender, "Not product owner");
        _;
    }

    // -----------------------------
    // CREATE PRODUCT
    // -----------------------------
    function createProduct(
        string memory _productId,
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        string memory _manufactureDate, // Input mới
        string memory _expiryDate       // Input mới
    ) external {

        require(products[_productId].owner == address(0), "Product ID already exists");

        products[_productId] = Product({
            productId: _productId,
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            owner: msg.sender,
            stage: StageType.Created,
            history: new string[](0)
        });

        // Emit Event Hybrid: Vừa có Hash để lọc, vừa có String để đọc
        emit ProductCreated(
            keccak256(bytes(_productId)), // Topic 1: Hash
            _productId,                   // Data: Readable String
            _name,                        // Data: Readable Name
            _manufactureDate,             // Data: Readable Date
            _expiryDate,                  // Data: Readable Date
            msg.sender                    // Topic 2: Owner
        );
    }

    // -----------------------------
    // UPDATE STAGE
    // -----------------------------
    function updateStage(
        string memory _id,
        StageType _stage,
        string memory _note
    ) external onlyOwner(_id) 
    {
        Product storage p = products[_id];
        p.stage = _stage;
        p.history.push(_note);

        emit StageUpdated(
            keccak256(bytes(_id)), 
            _id, 
            _stage, 
            msg.sender
        );
    }

    // -----------------------------
    // TRANSFER OWNERSHIP
    // -----------------------------
    function transferOwnership(string memory _id, address _newOwner)
        external
        onlyOwner(_id)
    {
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;

        emit OwnershipTransferred(
            keccak256(bytes(_id)), 
            _id, 
            oldOwner, 
            _newOwner
        );
    }

    // -----------------------------
    // GET PRODUCT
    // -----------------------------
    function getProduct(string memory _id)
        external
        view
        returns (
            string memory productId,
            string memory name,
            string memory description,
            string memory ipfsHash,
            string memory manufactureDate,
            string memory expiryDate,
            address owner,
            StageType stage,
            string[] memory history
        )
    {
        Product storage p = products[_id];
        return (
            p.productId,
            p.name,
            p.description,
            p.ipfsHash,
            p.manufactureDate,
            p.expiryDate,
            p.owner,
            p.stage,
            p.history
        );
    }
}