# products/management/commands/listen_events.py
import time
import traceback # 👈 THÊM DÒNG NÀY
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone 
from app.services.blockchain_service import supply_chain_contract, w3
from products.models import Product
from tracking.models import TrackingEvent 

class Command(BaseCommand):
    help = 'Lắng nghe sự kiện (mẫu Polling V4 - Đáng tin cậy)'

    def handle(self, *args, **options):
        if not all([supply_chain_contract, w3]):
            self.stderr.write(self.style.ERROR('Contract/Web3 chưa khởi tạo.'))
            return

        self.stdout.write("🎧 Bắt đầu lắng nghe (mẫu V4)...")
        last_processed_block = 0 # Bắt đầu quét từ block 0

        while True:
            try:
                latest_block = w3.eth.block_number
                if latest_block <= last_processed_block:
                    time.sleep(2)
                    continue

                from_block = last_processed_block + 1
                to_block = latest_block

                self.stdout.write(f"Đang quét blocks: {from_block} -> {to_block}")

                # === SỬ DỤNG LẠI LOGIC V2 (web3.py tự xử lý topic) ===
                product_events = supply_chain_contract.events.ProductCreated.get_logs(
                    from_block=from_block,
                    to_block=to_block
                )
                
                stage_events = supply_chain_contract.events.StageUpdated.get_logs(
                    from_block=from_block,
                    to_block=to_block
                )
                # =================================================

                if not product_events and not stage_events:
                    self.stdout.write("... Không có sự kiện nào trong phạm vi này.")
                    last_processed_block = to_block
                    time.sleep(2)
                    continue

                # 4. Xử lý các sự kiện tìm thấy
                if product_events:
                    self.stdout.write(self.style.SUCCESS(f"Tìm thấy {len(product_events)} sự kiện ProductCreated!"))
                    for event in product_events:
                        # 👈 THÊM: Try/Except chi tiết cho TỪNG event
                        try:
                            self.handle_product_created(event)
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Lỗi khi xử lý ProductCreated (ID: {event.args.id}): {e}"))
                            traceback.print_exc() # In ra lỗi chi tiết
                
                if stage_events:
                    self.stdout.write(self.style.SUCCESS(f"Tìm thấy {len(stage_events)} sự kiện StageUpdated!"))
                    for event in stage_events:
                        try:
                            self.handle_stage_updated(event)
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Lỗi khi xử lý StageUpdated (ID: {event.args.id}): {e}"))
                            traceback.print_exc()

                last_processed_block = to_block
                time.sleep(2)

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Lỗi vòng lặp chính: {e}"))
                time.sleep(10)

    # --- Các hàm handler (đã sửa lỗi khớp model) ---

    @transaction.atomic
    def handle_product_created(self, event):
        args = event['args'] 
        
        product, created = Product.objects.get_or_create(
            product_id=str(args.id), 
            defaults={
                'name': args.name,
                'manufacture_date': timezone.now().date(), 
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"   🎉 Đã LƯU vào DB: ID {args.id}"))
        else:
            self.stdout.write(self.style.WARNING(f"   🔍 Đã tồn tại trong DB: ID {args.id}"))

    @transaction.atomic
    def handle_stage_updated(self, event):
        args = event['args']
        tx_hash_hex = event['transactionHash'].hex() 

        self.stdout.write(self.style.NOTICE(f"   🔔 Sự kiện StageUpdated: ID {args.id}, Stage {args.newStage}"))

        TrackingEvent.objects.get_or_create(
            transaction_id=tx_hash_hex,
            defaults={
                'product_id': str(args.id),
                'note': args.note,
                'stage': args.newStage,
                'updater_address': args.updater
            }
        )
        self.stdout.write(f"      -> Đã lưu tracking event.")