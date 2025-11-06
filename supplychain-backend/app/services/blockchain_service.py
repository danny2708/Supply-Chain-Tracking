# app/services/blockchain_service.py
import json
import os 
from web3 import Web3
from django.conf import settings
from web3.exceptions import InvalidAddress

# Khai báo biến toàn cục (sẽ được khởi tạo trong try/except block)
w3 = None
backend_account = None
supply_chain_contract = None

# 1. Khởi tạo kết nối Web3
try:
    w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_PROVIDER_URL))
    if not w3.is_connected():
        raise ConnectionError(f"Không thể kết nối tới {settings.BLOCKCHAIN_PROVIDER_URL}")
    print(f"✅ Đã kết nối tới Web3 Provider: {settings.BLOCKCHAIN_PROVIDER_URL}")

except Exception as e:
    print(f"❌ Lỗi kết nối Web3: {e}")

# 2. Khởi tạo tài khoản Admin Backend
if w3:
    try:
        if not settings.BACKEND_WALLET_PRIVATE_KEY:
            raise ValueError("BACKEND_WALLET_PRIVATE_KEY không được tìm thấy trong .env")
            
        backend_account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
        w3.eth.default_account = backend_account.address 
        print(f"✅ Đã load tài khoản Admin Backend: {backend_account.address}")
    except Exception as e:
        print(f"❌ Lỗi khi load Private Key: {e}")
        backend_account = None


# 3. Load ABI và khởi tạo Contract Instance
if w3 and backend_account: # Chỉ chạy nếu kết nối và account thành công
    try:
        # === ĐƯỜNG DẪN ARTIFACT HARDHAT CHUẨN ===
        abi_path = os.path.join(
            settings.BASE_DIR, 
            'artifacts', 
            'contracts', 
            'SupplyChain.sol', 
            'SupplyChain.json' 
        ) 
        # ========================================

        with open(abi_path) as f:
            artifact = json.load(f)
            contract_abi = artifact["abi"]
            contract_bytecode = artifact.get("bytecode") # Lấy bytecode để tăng tính chính xác

        # Tạo Contract Factory Class
        SupplyChainContractFactory = w3.eth.contract(
            abi=contract_abi,
            # Cung cấp bytecode giúp web3.py xác minh tính toàn vẹn của contract
            bytecode=contract_bytecode 
        )

        # Tạo Contract Instance đã deploy
        supply_chain_contract = SupplyChainContractFactory(address=settings.CONTRACT_ADDRESS)
        print(f"✅ Đã khởi tạo Contract Instance: {settings.CONTRACT_ADDRESS}")

    except InvalidAddress:
        print(f"❌ Lỗi: CONTRACT_ADDRESS '{settings.CONTRACT_ADDRESS}' không hợp lệ.")
        supply_chain_contract = None
    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file ABI tại {abi_path}. Hãy chạy Hardhat compile.")
        supply_chain_contract = None
    except Exception as e:
        print(f"❌ Lỗi khi khởi tạo Contract: {e}")
        supply_chain_contract = None