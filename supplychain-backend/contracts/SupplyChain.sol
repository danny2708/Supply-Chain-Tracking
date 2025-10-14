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

    // ✅ Tạo sản phẩm mới
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

    // ✅ Cập nhật giai đoạn
    function updateStage(uint256 _id, StageType _stage, string memory _note)
        external
        onlyOwner(_id)
    {
        Product storage p = products[_id];
        p.stage = _stage;
        p.history.push(_note);
        emit StageUpdated(_id, _stage, msg.sender);
    }

    // ✅ Chuyển quyền sở hữu
    function transferOwnership(uint256 _id, address _newOwner)
        external
        onlyOwner(_id)
    {
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    // ✅ Lấy thông tin chi tiết của 1 sản phẩm
    function getProduct(uint256 _id)
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address owner,
            string memory stage,
            string[] memory history
        )
    {
        Product storage p = products[_id];
        return (
            p.id,
            p.name,
            p.description,
            p.owner,
            getStageString(p.stage),
            p.history
        );
    }

    // ✅ Hàm mới: trả về danh sách toàn bộ sản phẩm
    function getAllProducts()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory descriptions,
            address[] memory owners,
            string[] memory stages
        )
    {
        uint256 count = nextProductId;
        ids = new uint256[](count);
        names = new string[](count);
        descriptions = new string[](count);
        owners = new address[](count);
        stages = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            Product storage p = products[i];
            ids[i] = p.id;
            names[i] = p.name;
            descriptions[i] = p.description;
            owners[i] = p.owner;
            stages[i] = getStageString(p.stage);
        }
        return (ids, names, descriptions, owners, stages);
    }

    // ✅ Helper: chuyển StageType -> string
    function getStageString(StageType _stage) internal pure returns (string memory) {
        if (_stage == StageType.Created) return "Created";
        if (_stage == StageType.Manufactured) return "Manufactured";
        if (_stage == StageType.Shipped) return "Shipped";
        if (_stage == StageType.Delivered) return "Delivered";
        return "Unknown";
    }
}
