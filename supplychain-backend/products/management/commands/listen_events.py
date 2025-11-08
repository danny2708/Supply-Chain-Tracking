# (File: products/management/commands/listen_events.py - ĐÃ SỬA LẠI)

import os
import time
import traceback
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from web3.exceptions import BlockNotFound

# (Import các model và service của bạn)
try:
    from app.services.blockchain_service import w3, supply_chain_contract
except ImportError:
    from core.services.blockchain_service import w3, supply_chain_contract

# Import CÁC MODEL MỚI (CSDL 6 bảng)
from products.models import Product
from tracking.models import Event, TrackingEvent # <-- Import model Event/TrackingEvent mới

LAST_BLOCK_FILE = ".last_block_listener" # Đổi tên file để tránh xung đột
POLL_INTERVAL = 3
RETRY_DELAY = 10

class Command(BaseCommand):
    help = "LISTENER (ĐỌC): Lắng nghe sự kiện on-chain và ĐỐI CHIẾU (Reconcile) vào DB"

    def handle(self, *args, **options):
        # (Tất cả logic kết nối w3 và contract giữ nguyên)
        if not w3 or not supply_chain_contract:
            self.stdout.write(self.style.ERROR("❌ [LISTENER ĐỌC]: Web3 hoặc contract chưa khởi tạo"))
            return

        self.stdout.write(self.style.SUCCESS("🚀 [LISTENER ĐỌC]: Bắt đầu lắng nghe sự kiện..."))
        last_block = self.load_last_block()
        self.stdout.write(self.style.WARNING(f"📦 [LISTENER ĐỌC]: Tiếp tục từ block {last_block}"))

        while True:
            try:
                latest_block = w3.eth.block_number
                if latest_block <= last_block:
                    time.sleep(POLL_INTERVAL)
                    continue

                from_block = last_block + 1
                to_block = latest_block
                self.stdout.write(f"🔎 [LISTENER ĐỌC]: Quét block {from_block} → {to_block}")

                # ---- SỬA LỖI CÚ PHÁP WEB3 v6+ ----
                product_filter = supply_chain_contract.events.ProductCreated.create_filter(
                    fromBlock=from_block, toBlock=to_block
                )
                stage_filter = supply_chain_contract.events.StageUpdated.create_filter(
                    fromBlock=from_block, toBlock=to_block
                )
                product_logs = product_filter.get_all_entries()
                stage_logs = stage_filter.get_all_entries()
                # ------------------------------------

                # --- Handle ProductCreated ---
                for event in product_logs:
                    try:
                        args = event["args"]
                        product_id = str(args.get("productId") or "").strip()
                        name = args.get("name", "").strip()
                        
                        if not product_id:
                            self.stdout.write(self.style.WARNING(f"⚠️ [LISTENER ĐỌC]: Bỏ qua event (ID trống)"))
                            continue

                        self.stdout.write(self.style.SUCCESS(f"🧩 [LISTENER ĐỌC]: Thấy ProductCreated | ID={product_id}"))
                        
                        # ----- LOGIC ĐÃ SỬA -----
                        # Nhiệm vụ mới: Tìm và cập nhật, không tạo mới
                        self.reconcile_product_created(product_id)
                        
                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f"❌ [LISTENER ĐỌC]: Lỗi xử lý ProductCreated: {e}"))

                # --- Handle StageUpdated (Logic mới - Cần sửa Smart Contract) ---
                for event in stage_logs:
                    # ... (Logic xử lý StageUpdated sẽ cần viết lại hoàn toàn
                    # để khớp với model Event/TrackingEvent mới của chúng ta) ...
                    pass

                last_block = to_block
                self.save_last_block(last_block)
                time.sleep(POLL_INTERVAL)

            except BlockNotFound:
                time.sleep(POLL_INTERVAL)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"❌ [LISTENER ĐỌC]: Lỗi vòng lặp chính: {e}"))
                time.sleep(RETRY_DELAY)

    # --- Helper functions (ĐÃ VIẾT LẠI) ---

    def load_last_block(self):
        # (Giữ nguyên)
        if os.path.exists(LAST_BLOCK_FILE):
            try:
                with open(LAST_BLOCK_FILE, "r") as f:
                    return int(f.read().strip())
            except Exception:
                return w3.eth.block_number
        return w3.eth.block_number

    def save_last_block(self, block_num):
        # (Giữ nguyên)
        with open(LAST_BLOCK_FILE, "w") as f:
            f.write(str(block_num))

    @transaction.atomic
    def reconcile_product_created(self, product_id):
        """
        Nhiệm vụ mới: Tìm sản phẩm trong DB và xác nhận nó 'completed'.
        Nó KHÔNG tạo sản phẩm mới.
        """
        try:
            product = Product.objects.get(product_id=product_id)
            
            if product.on_chain_status == 'completed':
                self.stdout.write(self.style.WARNING(f"ℹ️ [LISTENER ĐỌC]: Sản phẩm {product_id} đã được đối chiếu."))
            else:
                # Đây là trường hợp 'process_queue' đã chạy
                product.on_chain_status = 'completed'
                product.save()
                self.stdout.write(self.style.SUCCESS(f"✅ [LISTENER ĐỌC]: Đã đối chiếu {product_id}, đánh dấu 'completed'"))

        except Product.DoesNotExist:
            # Đây là trường hợp hiếm: 1 sản phẩm được tạo on-chain
            # mà không đi qua API của chúng ta.
            self.stdout.write(self.style.ERROR(
                f"🚨 CẢNH BÁO: Sản phẩm {product_id} có trên chain nhưng KHÔNG CÓ trong CSDL!"
            ))
            # (Bạn có thể quyết định tạo nó ở đây nếu muốn)
            # Product.objects.create(...)