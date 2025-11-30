"use client";

import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Package,
  Truck,
  Store,
  Calendar,
  MapPin,
  CheckCircle,
  Camera,
  X,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 🚨 ĐÃ SỬA LỖI: Lấy URL API từ biến môi trường
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function TrackPage() {
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null); // State để lưu kết quả quét
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Quét QR Code sử dụng Html5QrcodeScanner
  useEffect(() => {
    // Chỉ chạy khi showQRScanner là true
    if (!showQRScanner) {
      return;
    }

    // Đây là ID của div mà scanner sẽ được render vào
    const scannerElementId = "reader";

    const scanner = new Html5QrcodeScanner(
      scannerElementId,
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false // Tắt verbose
    );

    function success(result: string) {
      // Dọn dẹp scanner
      scanner.clear();
      // Lưu kết quả quét và ẩn scanner
      setScanResult(result);
      setShowQRScanner(false);
    }

    function error(err: any) {
      console.warn(err);
    }

    // Bắt đầu render scanner
    scanner.render(success, error);

    // Sẽ chạy khi component unmount hoặc khi showQRScanner thay đổi
    return () => {
      // Đảm bảo scanner đã dừng và camera đã tắt
      if (scanner && scanner.getState() === 2) {
        scanner.clear().catch((err) => {
          console.error("Lỗi khi dọn dẹp scanner:", err);
        });
      }
    };
  }, [showQRScanner]); // Chỉ chạy lại khi showQRScanner thay đổi

  //Tự động tìm kiếm khi có kết quả quét
  useEffect(() => {
    if (scanResult) {
      setProductId(scanResult); // Cập nhật input field
      handleSearch(null, scanResult); // Tự động tìm kiếm
    }
  }, [scanResult]);

  const handleSearch = async (
    e: React.FormEvent | null,
    qrProductId?: string
  ) => {
    if (e) e.preventDefault();

    const searchId = qrProductId || productId;
    if (!searchId) return;

    setSearched(true);
    setNotFound(false);
    setProduct(null);
    setIsLoading(true);
    setEvents([]);

    try {
      // 🚨 ĐÃ SỬA: Sử dụng API_URL cho products
      const productUrl = `${API_URL}/products/${searchId}/`;

      // GỌI API - Lấy thông tin sản phẩm
      const response = await fetch(productUrl);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("API trả về 404: Không tìm thấy ID");
          setNotFound(true);
        } else {
          console.error("Lỗi Server:", response.status);
        }
        return;
      }

      const data = await response.json();
      setProduct(data);

      // GỌI API - Lấy các sự kiện tracking
      // 🚨 ĐÃ SỬA: Sử dụng API_URL cho events
      const eventsUrl = `${API_URL}/products/${searchId}/history/`;
      const eventsRes = await fetch(eventsUrl);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else if (eventsData.results && Array.isArray(eventsData.results)) {
          setEvents(eventsData.results);
        } else {
          setEvents([]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Các hàm helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-400";
      case "In Transit":
        return "text-blue-400";
      case "Pending":
        return "text-yellow-400";
      default:
        return "text-slate-400";
    }
  };

  const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <div className="relative w-20 h-20 object-cover rounded overflow-hidden bg-slate-700 shrink-0">
        {/* Skeleton Layer */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-600 animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 bg-slate-500 rounded-full opacity-20"></div>
          </div>
        )}

        {/* Actual Image */}
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)} // Tắt skeleton nếu lỗi ảnh
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    );
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-900/20 border-green-700";
      case "In Transit":
        return "bg-blue-900/20 border-blue-700";
      case "Pending":
        return "bg-yellow-900/20 border-yellow-700";
      default:
        return "bg-slate-700/20 border-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <style>{`
        /* 1. Khung bao ngoài */
        #reader {
          border: 2px solid #475569 !important; /* Slate-600 */
          background-color: #1e293b !important; /* Slate-800 */
          border-radius: 8px;
          padding: 15px !important;
        }

        /* 2. Icon */
        #reader img {
          filter: invert(1) !important;
          opacity: 0.8;
        }

        /* 3. Chữ thông báo (Start Scanning...): Màu trắng sáng */
        #reader span, #reader p, #reader div {
          color: #f1f5f9 !important; /* Slate-100 */
          font-size: 16px !important;
        }

        /* 4. Scan an Image File
        #reader a {
          color: #60a5fa !important; /* Blue-400 */
          text-decoration: none !important;
          font-weight: 600;
        }
        #reader a:hover {
          text-decoration: underline !important;
          color: #93c5fd !important; /* Blue-300 */
        }

        /* 5. Vùng hiển thị Camera/Vùng chờ */
        #reader__scan_region {
            border: 2px dashed #64748b !important; /* Slate-500 */
            background-color: #0f172a !important; /* Slate-900 */
            margin-bottom: 15px !important;
        }

        /* 6. Dropdown chọn camera */
        #reader select {
          background-color: #334155 !important;
          border: 1px solid #475569 !important;
          color: white !important;
          padding: 8px;
          border-radius: 4px;
          margin-top: 10px;
        }
      `}</style>
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Supply Chain Tracker
            </h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Card */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Track Your Product</CardTitle>
            <CardDescription className="text-slate-400">
              Scan QR code or enter product ID to view tracking information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showQRScanner ? (
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter Product ID (e.g., PROD001)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Search
                  </Button>
                </form>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowQRScanner(true)} // Chỉ cần set state là true
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent border-slate-600 text-slate-300 hover:text-white"
                  >
                    <Camera className="w-4 h-4" />
                    Scan QR Code
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Try: PROD001, PROD002, or PROD003
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div id="reader" className="w-full"></div>

                <Button
                  onClick={() => setShowQRScanner(false)}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Scanner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Not Found Alert */}
        {notFound && (
          <Alert className="bg-red-900/20 border-red-700 mb-8">
            <AlertDescription className="text-red-400">
              Product not found. Please check the product ID and try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-6">
            {/* Skeleton: Product Information */}
            <Card className="bg-slate-800 border-slate-700 animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-slate-700 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-6 flex-col md:flex-row">
                  {/* Image Skeleton */}
                  <div className="w-20 h-20 bg-slate-700 rounded shrink-0"></div>

                  {/* Details Skeleton */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="h-4 w-24 bg-slate-700 rounded mb-2"></div>
                      <div className="h-6 w-3/4 bg-slate-600 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 w-20 bg-slate-700 rounded mb-2"></div>
                      <div className="h-6 w-1/2 bg-slate-600 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 w-24 bg-slate-700 rounded mb-2"></div>
                      <div className="h-16 w-full bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Dates Skeleton */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-600 pt-4">
                  <div className="h-10 bg-slate-700 rounded"></div>
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              </CardContent>
            </Card>

            {/* Skeleton: Tracking Events */}
            <Card className="bg-slate-800 border-slate-700 animate-pulse">
              <CardHeader>
                <div className="h-6 w-40 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 w-64 bg-slate-700 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Giả lập 2 event đang load */}
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="border border-slate-600 rounded-lg p-4 space-y-3 bg-slate-700/50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-10 bg-slate-600 rounded"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Product Information */}
        {!isLoading && product && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-6 flex-col md:flex-row">
                  {/* Product Image */}
                  <ProductImage
                    src={product.ipfs || "/placeholder.svg"}
                    alt={product.name}
                  />
                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Product Name
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {product.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Product ID</p>
                      <p className="text-lg font-semibold text-white font-mono">
                        {product.product_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Description</p>
                      <p className="text-white text-sm">
                        {product.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Creator</p>
                        <p className="text-white font-mono">
                          {product.username} (ID: {product.user})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manufacture & Expiry */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-600 pt-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">
                      Manufacture Date
                    </p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(product.manufacture_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Expiry Date</p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(product.expiry_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Events section */}
            {events.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tracking Events</CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete tracking history for this product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.transaction_id}
                      className="border border-slate-600 rounded-lg p-4 space-y-3 bg-slate-700/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Transaction ID
                          </p>
                          <p className="text-white font-mono font-semibold">
                            {event.transaction_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Order Status
                          </p>
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBgColor(
                              event.order_status
                            )}`}
                          >
                            <span
                              className={getStatusColor(event.order_status)}
                            >
                              {event.order_status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Transporter Name
                          </p>
                          <p className="text-white flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-500" />
                            {event.transporter_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Retailer Name
                          </p>
                          <p className="text-white flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-500" />
                            {event.retailer_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Assign Date
                          </p>
                          <p className="text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {new Date(event.assign_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">
                            Received Date
                          </p>
                          {event.received_date ? (
                            <p className="text-white flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {new Date(event.received_date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          ) : (
                            <p className="text-slate-400 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Pending
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!product && !notFound && searched && (
          <Card className="bg-slate-800 border-slate-700 text-center py-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              Enter a product ID to view tracking information
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
