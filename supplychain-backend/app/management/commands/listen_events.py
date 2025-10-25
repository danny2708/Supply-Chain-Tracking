# app/management/commands/listen_events.py
import time
from django.core.management.base import BaseCommand
from app.services.blockchain_service import supply_chain_contract
from products.models import Product
from tracking.models import TrackingEvent # Import model Django của bạn

class Command(BaseCommand):
    help = 'Lắng nghe sự kiện từ Smart Contract và đồng bộ vào DB'

    def handle(self, *args, **options):
        self.stdout.write("🎧 Bắt đầu lắng nghe sự kiện blockchain...")

        # Tạo filter cho các sự kiện bạn quan tâm
        product_filter = supply_chain_contract.events.ProductCreated.create_filter(fromBlock='latest')
        stage_filter = supply_chain_contract.events.StageUpdated.create_filter(fromBlock='latest')

        while True:
            try:
                # Lắng nghe sự kiện ProductCreated
                for event in product_filter.get_new_entries():
                    self.handle_product_created(event)

                # Lắng nghe sự kiện StageUpdated
                for event in stage_filter.get_new_entries():
                    self.handle_stage_updated(event)

                time.sleep(2) # Nghỉ 2 giây
            except Exception as e:
                self.stderr.write(f"Lỗi listener: {e}")
                time.sleep(10) # Chờ 10 giây rồi thử lại

    def handle_product_created(self, event):
        args = event.args
        self.stdout.write(f"🎉 Sự kiện ProductCreated: ID {args.id}")

        # Dùng Django ORM để tạo bản ghi mới trong bảng 'product'
        # (Giả sử model Product của bạn khớp với sơ đồ)
        Product.objects.get_or_create(
            product_id=args.id,
            defaults={
                'name': args.name,
                'user_id': args.owner # Hoặc bạn cần map address sang user_id
            }
        )

    def handle_stage_updated(self, event):
        args = event.args
        self.stdout.write(f"🔔 Sự kiện StageUpdated: ID {args.id}, Stage {args.newStage}")

        # Dùng Django ORM để tạo bản ghi mới trong bảng 'tracking_event'
        TrackingEvent.objects.create(
            product_id=args.id,
            transaction_id=event.transactionHash.hex(), # Lưu tx_hash
            note=args.note,
            stage=args.newStage
            # ...
        )

        # Đồng thời cập nhật stage mới nhất trong bảng 'product'
        Product.objects.filter(product_id=args.id).update(stage=args.newStage)