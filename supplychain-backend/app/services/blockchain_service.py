import json
import os
from web3 import Web3
from django.conf import settings
from web3.exceptions import InvalidAddress
from dotenv import load_dotenv

# Load .env
load_dotenv(os.path.join(settings.BASE_DIR, '.env'), override=True)

# ======= GLOBALS =======
w3 = None
backend_account = None
supply_chain_contract = None


# ============================================================
# 1. INIT WEB3 CONNECTION (sep via env)
# ============================================================

def init_web3():
    global w3

    provider_url = getattr(settings, "BLOCKCHAIN_PROVIDER_URL", "").strip()

    if not provider_url:
        raise ValueError("BLOCKCHAIN_PROVIDER_URL không tồn tại trong .env")

    # ------------------------------------
    # Không convert WS cho Alchemy/Infura
    # ------------------------------------
    is_wss = provider_url.startswith("wss://")
    is_https = provider_url.startswith("https://")

    try:
        if is_wss:
            print(f"🔌 Kết nối bằng WebSocketProvider: {provider_url}")
            w3 = Web3(Web3.WebsocketProvider(provider_url))
        else:
            print(f"🔌 Kết nối bằng HTTPProvider: {provider_url}")
            w3 = Web3(Web3.HTTPProvider(provider_url))

        if not w3.is_connected():
            raise ConnectionError(f"❌ Không thể kết nối RPC: {provider_url}")

        print(f"✅ ĐÃ KẾT NỐI RPC: {provider_url}")

    except Exception as e:
        print(f"❌ Lỗi khi khởi tạo Web3: {e}")
        raise e


# ============================================================
# 2. LOAD BACKEND WALLET
# ============================================================

def load_backend_wallet():
    global backend_account, w3

    if not w3:
        raise RuntimeError("Web3 chưa được khởi tạo")

    pk = getattr(settings, "BACKEND_WALLET_PRIVATE_KEY", "").strip()

    if not pk:
        raise ValueError("Thiếu BACKEND_WALLET_PRIVATE_KEY trong .env")

    try:
        backend_account = w3.eth.account.from_key(pk)
        w3.eth.default_account = backend_account.address

        print(f"✅ Backend wallet loaded: {backend_account.address}")

    except Exception as e:
        print(f"❌ Không thể load backend private key: {e}")
        raise e


# ============================================================
# 3. INIT CONTRACT INSTANCE
# ============================================================

def init_contract():
    global supply_chain_contract, w3

    if not w3:
        raise RuntimeError("Web3 chưa được khởi tạo")

    contract_addr = getattr(settings, "CONTRACT_ADDRESS", "").strip()

    if not Web3.is_address(contract_addr):
        raise InvalidAddress(f"CONTRACT_ADDRESS không hợp lệ: {contract_addr}")

    abi_path = os.path.join(
        settings.BASE_DIR,
        "artifacts",
        "contracts",
        "SupplyChain.sol",
        "SupplyChain.json",
    )

    if not os.path.exists(abi_path):
        raise FileNotFoundError(f"Không tìm thấy ABI tại: {abi_path}")

    try:
        with open(abi_path, "r") as f:
            artifact = json.load(f)

        abi = artifact["abi"]

        supply_chain_contract = w3.eth.contract(
            address=Web3.to_checksum_address(contract_addr),
            abi=abi
        )

        print(f"✅ Contract đã sẵn sàng: {contract_addr}")

    except Exception as e:
        print(f"❌ Lỗi khi init contract: {e}")
        raise e


# ============================================================
# 4. BOOTSTRAP MODULE (tự khởi chạy khi import)
# ============================================================

try:
    init_web3()
    load_backend_wallet()
    init_contract()
    print("🚀 Blockchain service READY trên Sepolia")
except Exception as e:
    print(f"❌ Blockchain service KHÔNG KHỞI TẠO: {e}")
