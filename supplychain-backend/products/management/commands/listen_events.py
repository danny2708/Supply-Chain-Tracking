import os
import time
from django.core.management.base import BaseCommand
from django.db import transaction
from web3.exceptions import LogTopicError

from app.services.blockchain_service import w3, supply_chain_contract
from products.models import Product

LAST_BLOCK_FILE = ".last_block_listener"
BATCH_SIZE = 5
RETRY_DELAY = 3

class Command(BaseCommand):
    help = "Listener on-chain events (Hybrid mode: Auto-Create Product from Chain)"

    def handle(self, *args, **options):
        self.stdout.write("🚀 Listener started !")

        if not w3 or not supply_chain_contract:
            self.stderr.write("❌ Web3 or contract not initialized")
            return

        deploy_block = self.detect_contract_deploy_block()
        self.stdout.write(f"📌 Contract deployed at block {deploy_block}")

        last_block = self.load_last_block()
        if last_block < deploy_block:
            last_block = deploy_block

        self.stdout.write(f"⏳ Continue from block {last_block}")

        while True:
            try:
                latest_block = w3.eth.block_number

                if last_block >= latest_block:
                    time.sleep(1)
                    continue

                from_block = last_block + 1
                to_block = min(from_block + BATCH_SIZE, latest_block)

                self.stdout.write(f"[⛓] Scanning {from_block} → {to_block}")

                # ---- GET EVENTS ----
                product_logs = supply_chain_contract.events.ProductCreated().get_logs(
                    from_block=from_block, to_block=to_block
                )
                
                stage_logs = supply_chain_contract.events.StageUpdated().get_logs(
                    from_block=from_block, to_block=to_block
                )

                # ---- PROCESS: PRODUCT CREATED ----
                for ev in product_logs:
                    args = ev["args"]
                    real_pid = args.get("productId") 
                    
                    self.stdout.write(self.style.SUCCESS(
                        f"🧩 ProductCreated detected | ID={real_pid}"
                    ))
                    
                    # 🔥 CẬP NHẬT QUAN TRỌNG:
                    # Truyền toàn bộ 'args' vào hàm reconcile để có dữ liệu tạo mới
                    self.reconcile_product_created(real_pid, args)

                # ---- PROCESS: STAGE UPDATED ----
                for ev in stage_logs:
                    args = ev["args"]
                    # Xử lý cập nhật stage (tạm bỏ qua)
                    pass

                last_block = to_block
                self.save_last_block(last_block)

            except LogTopicError:
                self.stderr.write("⚠ RPC error (log topics), retrying...")
                time.sleep(RETRY_DELAY)

            except Exception as e:
                self.stderr.write(f"❌ Listener error: {e}")
                time.sleep(RETRY_DELAY)

    # ------------------------------
    # RECONCILE & AUTO-CREATE
    # ------------------------------
    @transaction.atomic
    def reconcile_product_created(self, product_id, event_data):
        """
        - Nếu có trong DB: Cập nhật status thành 'completed'.
        - Nếu KHÔNG có trong DB: Tạo mới dựa trên data từ Blockchain.
        """
        try:
            product = Product.objects.get(product_id=product_id)
            
            if product.on_chain_status == "completed":
                self.stdout.write(self.style.WARNING(
                    f"⚠️ Sản phẩm {product_id} đã có trong Database (Status: completed). Bỏ qua."
                ))
                return

            product.on_chain_status = "completed"
            product.save()

            self.stdout.write(self.style.SUCCESS(
                f"✅ Product {product_id} synced status to DB"
            ))

        except Product.DoesNotExist:
            # 🔥 CASE: SẢN PHẨM CÓ TRÊN CHAIN NHƯNG KHÔNG CÓ TRONG DB
            self.stdout.write(self.style.WARNING(
                f"✨ Phát hiện sản phẩm mới từ Blockchain: {product_id}. Đang tạo vào DB..."
            ))

            # 1. Xử lý Date (Tránh lỗi nếu chuỗi rỗng)
            m_date = event_data.get('manufactureDate')
            if m_date == "": m_date = None
            
            e_date = event_data.get('expiryDate')
            if e_date == "": e_date = None

            # 2. Tạo mới Product
            # Lưu ý: Event không có 'description' hay 'ipfs', ta để trống hoặc default
            Product.objects.create(
                product_id=product_id,
                name=event_data.get('name', 'Unknown Name'),
                manufacture_date=m_date,
                expiry_date=e_date,
                # Giả sử model có trường owner_address, nếu không thì bỏ dòng này
                # owner=event_data.get('owner'), 
                description="Auto-created from Blockchain Event",
                on_chain_status='completed'
            )

            self.stdout.write(self.style.SUCCESS(
                f"✅ Đã tạo mới sản phẩm {product_id} vào Database thành công!"
            ))

    # ------------------------------
    # UTILS (Giữ nguyên)
    # ------------------------------
    def detect_contract_deploy_block(self):
        address = w3.to_checksum_address(supply_chain_contract.address)
        latest_hex = w3.eth.get_block_number()
        low, high = 0, latest_hex
        deploy_block = None
        while low <= high:
            mid = (low + high) // 2
            code = w3.eth.get_code(address, block_identifier=mid)
            if code and code != b"":
                deploy_block = mid
                high = mid - 1
            else:
                low = mid + 1
        if deploy_block is None: return latest_hex
        return deploy_block

    def load_last_block(self):
        if os.path.exists(LAST_BLOCK_FILE):
            try: return int(open(LAST_BLOCK_FILE).read().strip())
            except: pass
        return w3.eth.block_number

    def save_last_block(self, block_num):
        with open(LAST_BLOCK_FILE, "w") as f: f.write(str(block_num))