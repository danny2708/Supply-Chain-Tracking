import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

class PinataUploadView(APIView):
    """Upload file lên Pinata (IPFS)"""
    def post(self, request):
        try:
            uploaded_file = request.FILES.get("file")

            if not uploaded_file:
                return Response(
                    {"error": "Vui lòng gửi file qua form-data với key 'file'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
                return Response(
                    {
                        "error": "Upload thất bại",
                        "pinata_response": response.text,
                    },
                    status=response.status_code,
                )

            data = response.json()
            cid = data.get("IpfsHash")
            gateway_url = f"{settings.PINATA_GATEWAY_URL}{cid}"

            return Response(
                {
                    "message": "Upload thành công",
                    "cid": cid,
                    "gateway_url": gateway_url,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# === NEW: Upload JSON metadata ===
class PinataUploadJSONView(APIView):
    """Upload JSON metadata lên Pinata (IPFS)"""
    def post(self, request):
        try:
            json_data = request.data  # dữ liệu JSON người dùng gửi lên
            if not json_data:
                return Response(
                    {"error": "Vui lòng gửi dữ liệu JSON metadata."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
                return Response(
                    {
                        "error": "Upload metadata thất bại",
                        "pinata_response": response.text,
                    },
                    status=response.status_code,
                )

            data = response.json()
            cid = data.get("IpfsHash")
            gateway_url = f"{settings.PINATA_GATEWAY_URL}{cid}"

            return Response(
                {
                    "message": "Upload metadata thành công",
                    "cid": cid,
                    "gateway_url": gateway_url,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
