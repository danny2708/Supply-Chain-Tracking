# app/blockchain_service.py
import json
from web3 import Web3
from django.conf import settings

# 1. Khởi tạo kết nối
w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_PROVIDER_URL))

# 2. Load ABI và khởi tạo contract
try:
    with open("contracts/build/SupplyChain.json") as f:
        contract_abi = json.load(f)["abi"]

    supply_chain_contract = w3.eth.contract(
        address=settings.CONTRACT_ADDRESS,
        abi=contract_abi
    )
    print(f"✅ Đã kết nối blockchain, contract: {settings.CONTRACT_ADDRESS}")
except Exception as e:
    print(f"❌ Lỗi kết nối contract: {e}")
    supply_chain_contract = None