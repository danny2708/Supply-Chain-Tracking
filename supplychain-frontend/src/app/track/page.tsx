"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startQRScanner = async () => {
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setShowQRScanner(true)
      // Start scanning
      scanQRCode()
    } catch (error) {
      setCameraError("Unable to access camera. Please check permissions.")
    }
  }

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowQRScanner(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple QR code detection - look for patterns
        // In production, use a proper QR code library like jsQR or qr-scanner
        // For demo, we'll simulate QR code detection
        const qrPattern = detectQRPattern(data)
        if (qrPattern) {
          setProductId(qrPattern)
          handleSearch(new Event("submit") as any, qrPattern)
          stopQRScanner()
          return
        }
      }

      requestAnimationFrame(scan)
    }

    scan()
  }

  const detectQRPattern = (data: Uint8ClampedArray): string | null => {
    // Simplified QR detection - in production use jsQR library
    // This is a placeholder that simulates QR detection
    // Real implementation would use: https://github.com/cozmo/jsQR
    return null
  }

  // Fallback: Manual QR input via camera capture
  const captureQRImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // For demo, we'll extract text from a simple pattern
    // In production, use jsQR or similar library
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Simulate QR code detection by looking for specific patterns
    // This is a simplified version - real QR detection is more complex
    alert("QR code captured. In production, this would decode the QR code using jsQR library.")
  }

  const handleSearch = (e: React.FormEvent | any, qrProductId?: string) => {
    e.preventDefault()
    const searchId = qrProductId || productId
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
                    onClick={startQRScanner}
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
              <div className="space-y-4">
                {cameraError && (
                  <Alert className="bg-red-900/20 border-red-700">
                    <AlertDescription className="text-red-400">{cameraError}</AlertDescription>
                  </Alert>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* QR Scanner Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-blue-500 rounded-lg"></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={captureQRImage} className="flex-1 bg-green-600 hover:bg-green-700">
                    Capture & Decode
                  </Button>
                  <Button onClick={stopQRScanner} variant="destructive" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Close Scanner
                  </Button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Position QR code within the frame. For demo, use manual Product ID entry.
                </p>
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

        {/* Product Information */}
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

        {/* Empty State */}
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
