import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from products.serializers import ProductSerializer


# =========================
# Helper functions
# =========================

def _upload_file_to_pinata(uploaded_file):
    """
    Upload file (image, pdf, etc.) lên Pinata
    """
    try:
        headers = {
            "Authorization": f"Bearer {settings.PINATA_JWT}"
        }
        files = {"file": (uploaded_file.name, uploaded_file.read())}

        response = requests.post(
            settings.PINATA_PIN_FILE_URL,
            headers=headers,
            files=files,
        )

        if response.status_code != 200:
            raise Exception(f"Upload thất bại: {response.text}")

        data = response.json()
        cid = data.get("IpfsHash")
        gateway_url = f"{settings.PINATA_GATEWAY_URL}{cid}"

        return {
            "cid": cid,
            "gateway_url": gateway_url,
            "raw": data
        }
    except Exception as e:
        raise e


def _pin_json_to_pinata(json_data):
    """
    Pin JSON metadata lên Pinata
    """
    try:
        headers = {
            "Authorization": f"Bearer {settings.PINATA_JWT}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            settings.PINATA_PIN_JSON_URL,
            headers=headers,
            json=json_data,
        )

        if response.status_code != 200:
            raise Exception(f"Pin metadata thất bại: {response.text}")

        data = response.json()
        cid = data.get("IpfsHash")
        gateway_url = f"{settings.PINATA_GATEWAY_URL}{cid}"

        return {
            "cid": cid,
            "gateway_url": gateway_url,
            "raw": data
        }
    except Exception as e:
        raise e


# =========================
# Views
# =========================

class PinataUploadView(APIView):
    """Upload file lên Pinata (IPFS)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            uploaded_file = request.FILES.get("file")

            if not uploaded_file:
                return Response(
                    {"error": "Vui lòng gửi file qua form-data với key 'file'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            result = _upload_file_to_pinata(uploaded_file)

            return Response(
                {
                    "message": "Upload thành công",
                    "cid": result["cid"],
                    "gateway_url": result["gateway_url"],
                    "raw": result["raw"]
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PinataUploadJSONView(APIView):
    """
    Upload JSON metadata + detect file upload:
    1) Nếu có ảnh trong request.FILES['file'], tự động upload ảnh lên Pinata
    2) Dùng ảnh URL để build metadata JSON
    3) Pin JSON metadata lên Pinata
    4) Tùy chọn: tạo Product trong DB luôn (create_product)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # 1️⃣ Detect file upload
            uploaded_file = request.FILES.get("file")
            image_result = None
            if uploaded_file:
                image_result = _upload_file_to_pinata(uploaded_file)

            # 2️⃣ Lấy các field từ request
            payload = dict(request.data)
            for k, v in payload.items():
                if isinstance(v, (list, tuple)):
                    payload[k] = v[0] if len(v) > 0 else ""

            # Nếu có ảnh upload, dùng URL đó
            if image_result:
                payload["image"] = image_result["gateway_url"]
                payload["image_cid"] = image_result["cid"]
            else:
                # FE có thể gửi sẵn image URL hoặc ipfs field
                if payload.get("image"):
                    pass
                elif payload.get("ipfs"):
                    payload["image"] = payload.get("ipfs")

            # 3️⃣ Build metadata JSON
            metadata = {
                "name": payload.get("name"),
                "description": payload.get("description"),
                "image": payload.get("image"),
                "properties": {
                    "product_id": payload.get("product_id"),
                    "manufacturer": payload.get("manufacturer"),
                    "manufacture_date": payload.get("manufacture_date"),
                    "expiry_date": payload.get("expiry_date"),
                }
            }

            # Copy thêm các trường khác
            for k, v in payload.items():
                if k in ("name", "description", "image", "product_id", "manufacturer", "manufacture_date", "expiry_date", "file"):
                    continue
                metadata["properties"][k] = v

            # 4️⃣ Pin metadata JSON lên Pinata
            metadata_result = _pin_json_to_pinata(metadata)

            # 5️⃣ Build response
            response_payload = {
                "message": "Upload metadata thành công",
                "image": image_result["gateway_url"] if image_result else payload.get("image"),
                "image_cid": image_result["cid"] if image_result else payload.get("image_cid"),
                "metadata_cid": metadata_result["cid"],
                "metadata_gateway_url": metadata_result["gateway_url"],
                "metadata_raw": metadata_result.get("raw"),
            }

            # 6️⃣ Tùy chọn tạo Product trong DB
            create_flag = payload.get("create_product")
            should_create = False
            if isinstance(create_flag, str):
                should_create = create_flag.lower() == "true"
            elif isinstance(create_flag, (bool, int)):
                should_create = bool(create_flag)

            if should_create:
                product_data = {
                    "product_id": payload.get("product_id"),
                    "name": payload.get("name"),
                    "description": payload.get("description"),
                    "manufacture_date": payload.get("manufacture_date"),
                    "expiry_date": payload.get("expiry_date"),
                    "ipfs": metadata_result["gateway_url"],
                }
                serializer = ProductSerializer(data=product_data, context={"request": request})
                serializer.is_valid(raise_exception=True)
                product = serializer.save()
                response_payload["product"] = ProductSerializer(product, context={"request": request}).data

            return Response(response_payload, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Lỗi nội bộ", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
