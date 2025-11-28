import time
from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Product

try:
    from app.services.blockchain_service import w3, supply_chain_contract, backend_account
except ImportError as e:
    raise ImportError(f"Không thể import 'app.services.blockchain_service'. Hãy chắc chắn 'app' nằm trong INSTALLED_APPS. Lỗi: {e}")

class Command(BaseCommand):
    help = 'Chạy listener (Worker) để xử lý các tác vụ on-chain từ hàng đợi CSDL'

    def handle(self, *args, **options):
        if not w3 or not supply_chain_contract or not backend_account:
            self.stdout.write(self.style.ERROR("❌ Web3/Contract/Account chưa được khởi tạo! (Kiểm tra app/services/blockchain_service.py)"))
            return

        self.stdout.write(self.style.SUCCESS(
            f'--- [WORKER]: Bắt đầu chạy... Sẽ quét CSDL mỗi 10 giây ---'
        ))
        
        while True:
            try:
                # 1. Lấy 1 sản phẩm đang chờ (pending)
                product_to_process = None
                
                # @transaction.atomic để khóa hàng CSDL,
                # ngăn 2 worker lấy cùng 1 sản phẩm
                with transaction.atomic():
                    product_to_process = Product.objects.select_for_update(skip_locked=True).filter(
                        on_chain_status='pending'
                    ).first() # Lấy 1 cái
                    
                    if product_to_process:
                        # Đánh dấu là 'processing' ngay lập tức
                        product_to_process.on_chain_status = 'processing'
                        product_to_process.save()

                # Nếu CSDL không có gì, nghỉ ngơi
                if not product_to_process:
                    time.sleep(10)
                    continue

                # --- 2. BẮT ĐẦU XỬ LÝ ON-CHAIN (VIỆC CHẬM) ---
                product = product_to_process

                # Chuẩn bị dữ liệu (Handle Null values)
                description = product.description or ""
                # ipfs_payload_for_chain = product.ipfs or "" # Dùng dòng này nếu muốn gửi IPFS lên chain
                ipfs_payload_for_chain = "" # Để trống tiết kiệm gas như yêu cầu cũ

                # --- XỬ LÝ DATE MỚI CHO CONTRACT HYBRID ---
                # Chuyển đổi Date Object sang String (YYYY-MM-DD)
                # Nếu DB lưu None thì truyền chuỗi rỗng ""
                manufacture_date_str = str(product.manufacture_date) if product.manufacture_date else ""
                expiry_date_str = str(product.expiry_date) if product.expiry_date else ""

                self.stdout.write(self.style.WARNING(
                    f"--- [WORKER]: Đang xử lý on-chain cho {product.product_id}..."
                ))
                
                # Gọi hàm createProduct với 6 tham số (đã cập nhật)
                tx = supply_chain_contract.functions.createProduct(
                    product.product_id,
                    product.name,
                    description,
                    ipfs_payload_for_chain,
                    manufacture_date_str,   # <--- THAM SỐ MỚI 1
                    expiry_date_str         # <--- THAM SỐ MỚI 2
                ).build_transaction({
                    'from': backend_account.address,
                    'nonce': w3.eth.get_transaction_count(backend_account.address),
                    'gas': 2500000, # Tăng gas một chút vì hàm phức tạp hơn
                })

                # Ký và gửi giao dịch
                signed_tx = w3.eth.account.sign_transaction(tx, private_key=backend_account.key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
                
                self.stdout.write(f"--- [WORKER]: Gửi giao dịch. Đang chờ xác nhận... Hash: {tx_hash.hex()}")
                
                # Chờ giao dịch được xác nhận
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
                
                # ---- 3. GHI NHẬN THÀNH CÔNG ----
                product.on_chain_status = 'completed'
                product.save()
                
                self.stdout.write(self.style.SUCCESS(
                    f"--- [WORKER]: Hoàn thành {product.product_id}! Đã mined trong block {receipt.blockNumber} ---"
                ))

            except Exception as e:
                # 4. GHI NHẬN LỖI
                self.stdout.write(self.style.ERROR(f"--- [WORKER]: Lỗi khi xử lý {product_to_process.product_id if product_to_process else 'Unknown'}: {e}"))
                if product_to_process:
                    product_to_process.on_chain_status = 'failed'
                    product_to_process.save()
                time.sleep(10) # Nghỉ ngơi khi có lỗi