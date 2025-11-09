# app/services/blockchain_service.py
import json
import os
from web3 import Web3
from django.conf import settings
from web3.exceptions import InvalidAddress

# ======= Biến toàn cục =======
w3 = None
backend_account = None
supply_chain_contract = None

# ======= 1. Khởi tạo kết nối Web3 =======
try:
    provider_url = getattr(settings, "BLOCKCHAIN_PROVIDER_URL", "http://127.0.0.1:8545")
    ws_url = provider_url.replace("http", "ws")  # Tự động đổi nếu là local Ganache/Hardhat

    try:
        w3 = Web3(Web3.WebsocketProvider(ws_url))
        if w3.is_connected():
            print(f"✅ Kết nối WebSocket thành công: {ws_url}")
        else:
            raise ConnectionError("WebSocket connection failed")
    except Exception:
        # Fallback sang HTTP nếu WS lỗi
        w3 = Web3(Web3.HTTPProvider(provider_url))
        if w3.is_connected():
            print(f"⚠️ WebSocket lỗi, fallback sang HTTP Provider: {provider_url}")
        else:
            raise ConnectionError(f"Không thể kết nối tới {provider_url}")

except Exception as e:
    print(f"❌ Lỗi khởi tạo Web3: {e}")

# ======= 2. Tài khoản backend =======
if w3:
    try:
        if not settings.BACKEND_WALLET_PRIVATE_KEY:
            raise ValueError("Thiếu BACKEND_WALLET_PRIVATE_KEY trong .env")

        backend_account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
        w3.eth.default_account = backend_account.address
        print(f"✅ Đã load tài khoản backend: {backend_account.address}")

    except Exception as e:
        print(f"❌ Lỗi khi load Private Key: {e}")
        backend_account = None

# ======= 3. Khởi tạo Contract Instance =======
if w3 and backend_account:
    try:
        abi_path = os.path.join(
            settings.BASE_DIR,
            "artifacts",
            "contracts",
            "SupplyChain.sol",
            "SupplyChain.json",
        )

        with open(abi_path, "r") as f:
            artifact = json.load(f)
            contract_abi = artifact["abi"]
            contract_bytecode = artifact.get("bytecode")

        SupplyChainFactory = w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)

        supply_chain_contract = SupplyChainFactory(address=settings.CONTRACT_ADDRESS)

        print(f"✅ Đã khởi tạo contract instance: {settings.CONTRACT_ADDRESS}")

    except InvalidAddress:
        print(f"❌ CONTRACT_ADDRESS '{settings.CONTRACT_ADDRESS}' không hợp lệ.")
        supply_chain_contract = None
    except FileNotFoundError:
        print(f"❌ Không tìm thấy file ABI tại {abi_path}.")
        supply_chain_contract = None
    except Exception as e:
        print(f"❌ Lỗi khi khởi tạo contract: {e}")
<<<<<<< HEAD
        supply_chain_contract = None
=======
        supply_chain_contract = None
>>>>>>> origin/mao_backend_workplaces
