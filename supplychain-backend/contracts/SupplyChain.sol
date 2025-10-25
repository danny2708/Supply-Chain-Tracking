// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain Contract
 * @dev Contract để theo dõi sản phẩm qua các giai đoạn của chuỗi cung ứng.
 * Tối ưu hóa cho mô hình Hybrid DApp:
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
        address owner; // Chủ sở hữu hiện tại của sản phẩm (ví dụ: nhà sản xuất, nhà vận chuyển)
        StageType stage;
        // string[] history; // ĐÃ XÓA: Rất tốn gas. Thay thế bằng Event.
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId;

    // Events (Dành cho backend lắng nghe)
    event ProductCreated(uint256 indexed id, string name, address owner);
    event StageUpdated(uint256 indexed id, StageType newStage, address updater, string note);
    event OwnershipTransferred(uint256 indexed id, address from, address to);

    modifier onlyOwner(uint256 _id) {
        require(products[_id].owner == msg.sender, "Not product owner");
        _;
    }

    /**
     * @dev Tạo một sản phẩm mới. Chỉ có thể được gọi bởi nhà sản xuất (người tạo).
     */
    function createProduct(string memory _name, string memory _description) external {
        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            owner: msg.sender,
            stage: StageType.Created
            // history đã bị xóa
        });

        emit ProductCreated(productId, _name, msg.sender);
    }

    /**
     * @dev Cập nhật giai đoạn của sản phẩm. Phải đi theo thứ tự.
     * @param _note Ghi chú cho lần cập nhật này (ví dụ: "Đang vận chuyển tại kho HCM").
     */
    function updateStage(uint256 _id, StageType _stage, string memory _note)
        external
        onlyOwner(_id)
    {
        Product storage p = products[_id];

        // === THÊM KIỂM SOÁT LOGIC ===
        // 1. Không thể cập nhật nếu đã giao hàng
        require(p.stage != StageType.Delivered, "Product already delivered");
        // 2. Phải cập nhật theo đúng thứ tự (Created -> Manufactured -> Shipped ...)
        require(uint(_stage) == uint(p.stage) + 1, "Invalid stage transition");
        // ============================

        p.stage = _stage;

        // p.history.push(_note); // ĐÃ XÓA: Rất tốn gas
        
        // Thay vào đó, phát event để backend lưu lại
        emit StageUpdated(_id, p.stage, msg.sender, _note);
    }

    /**
     * @dev Chuyển quyền sở hữu sản phẩm (ví dụ: từ Nhà sản xuất sang Nhà vận chuyển).
     */
    function transferOwnership(uint256 _id, address _newOwner)
        external
        onlyOwner(_id)
    {
        require(_newOwner != address(0), "Invalid new owner address");
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    /**
     * @dev Lấy thông tin chi tiết của 1 sản phẩm (cho QR Scan).
     * Hàm này `view` nên miễn phí và nhanh chóng.
     * Frontend/Backend sẽ tự chuyển đổi `stage` (uint8) sang "Created", "Shipped"...
     */
    function getProduct(uint256 _id)
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address owner,
            StageType stage // Trả về enum (uint8) để tiết kiệm gas
            // history đã bị xóa
        )
    {
        Product storage p = products[_id];
        return (
            p.id,
            p.name,
            p.description,
            p.owner,
            p.stage // Frontend/Backend sẽ xử lý việc hiển thị tên
            // p.history đã bị xóa
        );
    }
}