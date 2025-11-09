// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain Contract
<<<<<<< HEAD
 * @dev Contract được tối ưu hóa cho mô hình "Backend-Signing" (Admin Relayer).
 * Backend (admin) sẽ thay mặt người dùng ký và gửi tất cả các giao dịch.
 * 1. Dữ liệu cốt lõi (ID, chủ sở hữu, giai đoạn) được lưu on-chain.
 * 2. Dữ liệu lịch sử (ghi chú, log) được phát ra qua Events để backend (off-chain)
 * lắng nghe và lưu vào database (ví dụ: PostgreSQL).
=======
 * @dev Lưu trữ và theo dõi sản phẩm bằng cách sử dụng 'productId' (string)
 * làm khóa chính, khớp với CSDL off-chain.
>>>>>>> origin/mao_backend_workplaces
 */
contract SupplyChain {

    // Định nghĩa các giai đoạn của chuỗi cung ứng
    enum StageType { Created, Manufactured, Shipped, Delivered }

    // Cấu trúc (struct) dữ liệu của một sản phẩm
    struct Product {
        string productId; // Khóa chính (string), ví dụ: "rau_sach_1"
        string name;
        string description;
<<<<<<< HEAD
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
=======
        string ipfsHash;    // Tùy chọn: hash của dữ liệu chi tiết trên IPFS
        address owner;       // Địa chỉ của người sở hữu (ban đầu là server)
        StageType stage;
        string[] history;   // Mảng lưu lịch sử (cho hàm updateStage)
    }

    // Ánh xạ (Mapping) từ string productId (khóa chính) đến Product struct
    mapping(string => Product) public products;

    // --- Định nghĩa các Sự kiện (Events) ---

    event ProductCreated(
        string indexed productId, // ID (string) để dễ dàng lọc
        string name,
        string ipfsHash,
        address indexed owner      // Địa chỉ của server đã tạo ra nó
    );

    event StageUpdated(
        string indexed productId, // ID (string)
        StageType newStage,
        address indexed updater
    );

    event OwnershipTransferred(
        string indexed productId, // ID (string)
        address indexed from,
        address indexed to
    );

    // --- Các Ràng buộc (Modifiers) ---

    /**
     * @dev Yêu cầu người gọi hàm phải là chủ sở hữu của sản phẩm
     */
    modifier onlyOwner(string memory _id) {
        require(products[_id].owner == msg.sender, "Not product owner");
        _;
    }

    // --- Các Hàm Ghi (Write Functions) ---

    /**
     * @notice Tạo một sản phẩm mới on-chain.
     * @dev Được gọi bởi "Đầu bếp GHI" (process_queue.py) của bạn.
     * @param _productId ID duy nhất (string) từ CSDL của bạn (ví dụ: "DA_TINH_KHIET_1")
     * @param _name Tên sản phẩm
     * @param _description Mô tả sản phẩm (có thể là chuỗi rỗng)
     * @param _ipfsHash Hash IPFS (có thể là chuỗi rỗng)
     */
    function createProduct(
        string memory _productId,
        string memory _name,
        string memory _description,
        string memory _ipfsHash
    ) external {
        
        // ---- SỬA LỖI (Dòng 43 của bạn) ----
        // Kiểm tra xem 'owner' có phải là địa chỉ 0 (mặc định) hay không.
        // Nếu nó *không* phải là địa chỉ 0, nghĩa là sản phẩm đã tồn tại.
        require(
            products[_productId].owner == address(0),
            "Product ID already exists"
        );
        // ---------------------------------

        // Tạo và lưu trữ struct sản phẩm mới
        products[_productId] = Product({
            productId: _productId,
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            owner: msg.sender, // (Đây sẽ là ví của BACKEND_PRIVATE_KEY)
            stage: StageType.Created,
            history: new string[](0)
>>>>>>> origin/mao_backend_workplaces
        });
        
        // Phát ra sự kiện để "Đầu bếp ĐỌC" (listen_events) bắt được
        emit ProductCreated(_productId, _name, _ipfsHash, msg.sender);
    }

    /**
<<<<<<< HEAD
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
=======
     * @notice Cập nhật giai đoạn của một sản phẩm (ví dụ: 'Shipped')
     * @dev (Hàm này cũng phải dùng string ID)
     */
    function updateStage(string memory _id, StageType _stage, string memory _note)
        external
        onlyOwner(_id)
    {
        Product storage p = products[_id];
        p.stage = _stage;
        p.history.push(_note);
        emit StageUpdated(_id, _stage, msg.sender);
    }

    /**
     * @notice Chuyển quyền sở hữu sản phẩm cho người khác
     * @dev (Hàm này cũng phải dùng string ID)
     */
    function transferOwnership(string memory _id, address _newOwner)
>>>>>>> origin/mao_backend_workplaces
        external
        onlyAdmin // <-- CẬP NHẬT: Thay 'onlyOwner' bằng 'onlyAdmin'
    {
        require(_newOwner != address(0), "Invalid new owner address");
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

<<<<<<< HEAD
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
=======
    // --- Các Hàm Đọc (View Functions) ---
    
    // (Bạn có thể thêm các hàm 'getProduct' hoặc 'getAllProducts'
    //  sử dụng string ID ở đây nếu cần)
>>>>>>> origin/mao_backend_workplaces
}