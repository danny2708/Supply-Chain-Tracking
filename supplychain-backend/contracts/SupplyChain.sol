// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain Contract
 * @dev Contract được tối ưu hóa cho mô hình "Backend-Signing" (Admin Relayer).
 * Backend (admin) sẽ thay mặt người dùng ký và gửi tất cả các giao dịch.
 * 1. Dữ liệu cốt lõi (ID, chủ sở hữu, giai đoạn) được lưu on-chain.
 * 2. Dữ liệu lịch sử (ghi chú, log) được phát ra qua Events để backend (off-chain)
 * lắng nghe và lưu vào database (ví dụ: PostgreSQL).
 */
contract SupplyChain {
    enum StageType { Created, Manufactured, Shipped, Delivered }

    struct Product {
        uint256 id;
        string name;
        string description;
        address owner; // Chủ sở hữu hiện tại (ví dụ: nhà sản xuất, nhà vận chuyển)
        StageType stage;
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId;
    
    // === THÊM: Địa chỉ ví của Backend (Admin) ===
    address public admin;

    // Events (Dành cho backend lắng nghe)
    event ProductCreated(uint256 indexed id, string name, address owner);
    event StageUpdated(uint256 indexed id, StageType newStage, address updater, string note);
    event OwnershipTransferred(uint256 indexed id, address from, address to);

    // === THÊM: Modifier chỉ cho phép Admin (Backend) gọi ===
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // === XÓA: Modifier 'onlyOwner' không còn cần thiết ===
    // modifier onlyOwner(uint256 _id) { ... }

    /**
     * @dev Gán địa chỉ deploy contract làm admin (Backend)
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Tạo một sản phẩm mới. Chỉ có thể được gọi bởi Admin.
     */
    function createProduct(string memory _name, string memory _description)
        external
        onlyAdmin // <-- CẬP NHẬT: Bảo vệ bằng onlyAdmin
    {
        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            owner: msg.sender, // Owner ban đầu là Admin (Backend)
            stage: StageType.Created
        });

        emit ProductCreated(productId, _name, msg.sender);
    }

    /**
     * @dev [HÀM MỚI] Tạo nhiều sản phẩm trong CÙNG MỘT GIAO DỊCH.
     * Tiết kiệm gas và cải thiện UX. Chỉ Admin được gọi.
     */
    function createProductBatch(
        string[] memory _names,
        string[] memory _descriptions
    ) external onlyAdmin {
        require(_names.length == _descriptions.length, "Data mismatch");

        for (uint i = 0; i < _names.length; i++) {
            uint256 productId = nextProductId++;
            products[productId] = Product({
                id: productId,
                name: _names[i],
                description: _descriptions[i],
                owner: msg.sender, // Owner là Admin (Backend)
                stage: StageType.Created
            });
            // Phát event cho từng sản phẩm để listener bắt được
            emit ProductCreated(productId, _names[i], msg.sender);
        }
    }

    /**
     * @dev Cập nhật giai đoạn của sản phẩm. Chỉ Admin được gọi.
     */
    function updateStage(uint256 _id, StageType _stage, string memory _note)
        external
        onlyAdmin // <-- CẬP NHẬT: Thay 'onlyOwner' bằng 'onlyAdmin'
    {
        Product storage p = products[_id];

        // === Logic nghiệp vụ vẫn giữ nguyên ===
        require(p.stage != StageType.Delivered, "Product already delivered");
        require(uint(_stage) == uint(p.stage) + 1, "Invalid stage transition");
        // ===================================

        p.stage = _stage;
        
        // Phát event để backend lưu lại
        emit StageUpdated(_id, p.stage, msg.sender, _note);
    }

    /**
     * @dev Chuyển quyền sở hữu sản phẩm. Chỉ Admin được gọi.
     */
    function transferOwnership(uint256 _id, address _newOwner)
        external
        onlyAdmin // <-- CẬP NHẬT: Thay 'onlyOwner' bằng 'onlyAdmin'
    {
        require(_newOwner != address(0), "Invalid new owner address");
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    /**
     * @dev Lấy thông tin chi tiết của 1 sản phẩm (cho QR Scan).
     * Hàm này `view` nên bất kỳ ai cũng có thể gọi (miễn phí).
     */
    function getProduct(uint256 _id)
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address owner,
            StageType stage
        )
    {
        Product storage p = products[_id];
        return (
            p.id,
            p.name,
            p.description,
            p.owner,
            p.stage
        );
    }
}