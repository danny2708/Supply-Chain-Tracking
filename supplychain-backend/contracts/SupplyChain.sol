// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain Contract
 * @dev Lưu trữ và theo dõi sản phẩm bằng cách sử dụng 'productId' (string)
 * làm khóa chính, khớp với CSDL off-chain.
 */
contract SupplyChain {

    // Định nghĩa các giai đoạn của chuỗi cung ứng
    enum StageType { Created, Manufactured, Shipped, Delivered }

    // Cấu trúc (struct) dữ liệu của một sản phẩm
    struct Product {
        string productId; // Khóa chính (string), ví dụ: "rau_sach_1"
        string name;
        string description;
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
        });
        
        // Phát ra sự kiện để "Đầu bếp ĐỌC" (listen_events) bắt được
        emit ProductCreated(_productId, _name, _ipfsHash, msg.sender);
    }

    /**
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
        external
        onlyOwner(_id)
    {
        address oldOwner = products[_id].owner;
        products[_id].owner = _newOwner;
        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    // --- Các Hàm Đọc (View Functions) ---
    
    // (Bạn có thể thêm các hàm 'getProduct' hoặc 'getAllProducts'
    //  sử dụng string ID ở đây nếu cần)
}