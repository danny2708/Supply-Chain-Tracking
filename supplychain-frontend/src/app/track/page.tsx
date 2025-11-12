"use client"

import React, { useEffect, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode" // Thư viện bạn đã import
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Package, Truck, Store, Calendar, MapPin, CheckCircle, Camera, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data - in production, this would come from a database
const mockProducts: Record<string, any> = {
  PROD001: {
    product_id: "PROD001",
    name: "Organic Coffee Beans",
    manufacture_date: "2024-01-15",
    expiry_date: "2025-01-15",
    transporter: {
      name: "FastShip Logistics",
      order_status: "In Transit",
      assign_date: "2024-10-18",
    },
    retailer: {
      name: "Green Market Store",
      location: "Ho Chi Minh City, Vietnam",
      received_date: null,
    },
  },
  PROD002: {
    product_id: "PROD002",
    name: "Premium Tea Set",
    manufacture_date: "2024-02-20",
    expiry_date: "2026-02-20",
    transporter: {
      name: "Express Delivery Co.",
      order_status: "Delivered",
      assign_date: "2024-10-15",
    },
    retailer: {
      name: "Luxury Goods Boutique",
      location: "Hanoi, Vietnam",
      received_date: "2024-10-19",
    },
  },
  PROD003: {
    product_id: "PROD003",
    name: "Handmade Chocolate",
    manufacture_date: "2024-03-10",
    expiry_date: "2024-12-10",
    transporter: {
      name: "Regional Transport",
      order_status: "Pending",
      assign_date: "2024-10-20",
    },
    retailer: {
      name: "Sweet Delights Shop",
      location: "Da Nang, Vietnam",
      received_date: null,
    },
  },
}

export default function TrackPage() {
  const [productId, setProductId] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [searched, setSearched] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null) // State để lưu kết quả quét

  // **SỬA LỖI 1: Logic useEffect cho QR Scanner**
  useEffect(() => {
    // Chỉ chạy khi showQRScanner là true
    if (!showQRScanner) {
      return
    }

    // Đây là ID của div mà scanner sẽ được render vào
    const scannerElementId = "reader"

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
    )

    function success(result: string) {
      // Dọn dẹp scanner
      scanner.clear()
      // Lưu kết quả quét và ẩn scanner
      setScanResult(result)
      setShowQRScanner(false)
    }

    function error(err: any) {
      console.warn(err)
    }

    // Bắt đầu render scanner
    scanner.render(success, error)

    // Hàm dọn dẹp: Rất QUAN TRỌNG
    // Sẽ chạy khi component unmount hoặc khi showQRScanner thay đổi
    return () => {
      // Đảm bảo scanner đã dừng và camera đã tắt
      // Thêm check getRunningTrackCameraCapabilities để tránh lỗi
      if (scanner && scanner.getState() === 2) { // 2 = SCANNING
        scanner.clear().catch((err) => {
          console.error("Lỗi khi dọn dẹp scanner:", err)
        })
      }
    }
  }, [showQRScanner]) // Chỉ chạy lại khi showQRScanner thay đổi

  // **SỬA LỖI 2: Tự động tìm kiếm khi có kết quả quét**
  useEffect(() => {
    if (scanResult) {
      setProductId(scanResult) // Cập nhật input field
      handleSearch(null, scanResult) // Tự động tìm kiếm
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanResult])

  const handleSearch = (e: React.FormEvent | null, qrProductId?: string) => {
    if (e) e.preventDefault()
    const searchId = qrProductId || productId
    if (!searchId) return // Không tìm nếu ID rỗng

    setSearched(true)
    setNotFound(false)

    const foundProduct = mockProducts[searchId.toUpperCase()]
    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      setNotFound(true)
      setProduct(null)
    }
  }

  // Các hàm helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-400"
      case "In Transit":
        return "text-blue-400"
      case "Pending":
        return "text-yellow-400"
      default:
        return "text-slate-400"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-900/20 border-green-700"
      case "In Transit":
        return "bg-blue-900/20 border-blue-700"
      case "Pending":
        return "bg-yellow-900/20 border-yellow-700"
      default:
        return "bg-slate-700/20 border-slate-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Supply Chain Tracker</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
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
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </form>

                <div className="flex gap-2">
                  <Button
                    // **SỬA LỖI 3: Sửa onClick**
                    onClick={() => setShowQRScanner(true)} // Chỉ cần set state là true
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent border-slate-600 text-slate-300 hover:text-white"
                  >
                    <Camera className="w-4 h-4" />
                    Scan QR Code
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Try: PROD001, PROD002, or PROD003</p>
              </div>
            ) : (
              // **SỬA LỖI 4: Đơn giản hóa JSX cho scanner**
              <div className="space-y-4">
                {/* Thư viện sẽ tự động tạo UI bên trong div này.
                  Chúng ta không cần <video> hay <canvas> nữa.
                */}
                <div id="reader" className="w-full"></div>

                <Button
                  onClick={() => setShowQRScanner(false)} // Chỉ cần set state là false
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

        {/* Product Information (Không thay đổi) */}
        {product && (
          <div className="space-y-6">
            {/* Product Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Product Name</p>
                  <p className="text-lg font-semibold text-white">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Product ID</p>
                  <p className="text-lg font-semibold text-white font-mono">{product.product_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Manufacture Date</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(product.manufacture_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Expiry Date</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(product.expiry_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Transporter Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  Transporter Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Transporter Name</p>
                  <p className="text-lg font-semibold text-white">{product.transporter.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Order Status</p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBgColor(product.transporter.order_status)}`}
                    >
                      <span className={getStatusColor(product.transporter.order_status)}>
                        {product.transporter.order_status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Assignment Date</p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(product.transporter.assign_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retailer Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-500" />
                  Retailer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Retailer Name</p>
                  <p className="text-lg font-semibold text-white">{product.retailer.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Location</p>
                    <p className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {product.retailer.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Received Date</p>
                    {product.retailer.received_date ? (
                      <p className="text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {new Date(product.retailer.received_date).toLocaleDateString("vi-VN")}
                      </p>
                    ) : (
                      <p className="text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Pending
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State (Không thay đổi) */}
        {!product && !notFound && searched && (
          <Card className="bg-slate-800 border-slate-700 text-center py-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Enter a product ID to view tracking information</p>
          </Card>
        )}
      </main>
    </div>
  )
}
