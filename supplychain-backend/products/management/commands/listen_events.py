import os
import time
from django.core.management.base import BaseCommand
from django.db import transaction
from web3.exceptions import BlockNotFound, LogTopicError

from app.services.blockchain_service import w3, supply_chain_contract
from products.models import Product
from tracking.models import Event, TrackingEvent


LAST_BLOCK_FILE = ".last_block_listener"
BATCH_SIZE = 1000
RETRY_DELAY = 5


class Command(BaseCommand):
    help = "Listener on-chain events using batching + auto deploy block detection"

    def handle(self, *args, **options):
        self.stdout.write("🚀 Listener started!")

        if not w3 or not supply_chain_contract:
            self.stderr.write("❌ Web3 or contract not initialized")
            return

        # ---- AUTO DETECT DEPLOY BLOCK ----
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

                # ---- GET EVENTS (ProductCreated + StageUpdated) ----
                product_logs = supply_chain_contract.events.ProductCreated().get_logs(
                    from_block=from_block,
                    to_block=to_block,
                )

                stage_logs = supply_chain_contract.events.StageUpdated().get_logs(
                    from_block=from_block,
                    to_block=to_block,
                )

                # ---- Process ProductCreated ----
                for ev in product_logs:
                    args = ev["args"]
                    pid = str(args.get("productId")).strip()
                    self.stdout.write(self.style.SUCCESS(
                        f"🧩 ProductCreated detected | ID={pid}"
                    ))
                    self.reconcile_product_created(pid)

                # ---- Process StageUpdated (nếu bạn bổ sung sau) ----
                for ev in stage_logs:
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
    # AUTO-DETECT DEPLOY BLOCK
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

        if deploy_block is None:
            raise Exception("Cannot detect deploy block")

        return deploy_block

    # ------------------------------
    # Load / Save block
    # ------------------------------
    def load_last_block(self):
        if os.path.exists(LAST_BLOCK_FILE):
            try:
                return int(open(LAST_BLOCK_FILE).read().strip())
            except:
                pass
        return w3.eth.block_number

    def save_last_block(self, block_num):
        with open(LAST_BLOCK_FILE, "w") as f:
            f.write(str(block_num))

    # ------------------------------
    # RECONCILE PRODUCT (giữ logic cũ)
    # ------------------------------
    @transaction.atomic
    def reconcile_product_created(self, product_id):
        try:
            product = Product.objects.get(product_id=product_id)

            if product.on_chain_status == "completed":
                self.stdout.write(self.style.WARNING(
                    f"⚠ Product {product_id} already completed"
                ))
                return

            product.on_chain_status = "completed"
            product.save()

            self.stdout.write(self.style.SUCCESS(
                f"✅ Product {product_id} synced to DB"
            ))

        except Product.DoesNotExist:
            self.stderr.write(self.style.ERROR(
                f"❌ Product {product_id} not found in DB"
            ))
