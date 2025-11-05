# app/services/blockchain_service.py

import json
import os # 👈 THÊM
from web3 import Web3
from django.conf import settings

# 1. Khởi tạo kết nối
w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_PROVIDER_URL))

# === THÊM: KHỞI TẠO TÀI KHOẢN ADMIN (Backend) ===
# 'backend_account' chính là "cây bút" để backend ký giao dịch
try:
    if not settings.BACKEND_WALLET_PRIVATE_KEY:
        raise ValueError("BACKEND_WALLET_PRIVATE_KEY không được tìm thấy trong .env")
        
    backend_account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
    w3.eth.default_account = backend_account.address # Set tài khoản mặc định
    print(f"✅ Đã load tài khoản Admin Backend: {backend_account.address}")
except Exception as e:
    print(f"❌ Lỗi khi load private key của backend: {e}")
    backend_account = None
# ===============================================


# 2. Load ABI và khởi tạo contract
try:
    # Thêm kiểm tra kết nối
    if not w3.is_connected():
        raise ConnectionError(f"Không thể kết nối tới {settings.BLOCKCHAIN_PROVIDER_URL}")

    abi_path = os.path.join(
        settings.BASE_DIR, 
        'artifacts', 
        'contracts', 
        'SupplyChain.sol', 
        'SupplyChain.json' # 👈 ĐƯỜNG DẪN CHUẨN CỦA HARDHAT
    )

    with open(abi_path) as f:
        contract_abi = json.load(f)["abi"]

    supply_chain_contract = w3.eth.contract(
        address=settings.CONTRACT_ADDRESS,
        abi=contract_abi
    )
    print(f"✅ Đã kết nối blockchain, contract: {settings.CONTRACT_ADDRESS}")

except Exception as e:
    print(f"❌ Lỗi kết nối contract: {e}")
    supply_chain_contract = None
    if backend_account: # Nếu lỗi contract, cũng vô hiệu hóa account
        backend_account = None
        print("   -> Vô hiệu hóa tài khoản backend do lỗi contract.")