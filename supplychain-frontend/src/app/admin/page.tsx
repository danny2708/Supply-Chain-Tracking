"use client";

import type React from "react";
import Image from "next/image";
import apiClient from "@/src/lib/apiClient";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Upload,
  X,
  Search,
  QrCode,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// ĐÃ SỬA LỖI: Cập nhật typing để chấp nhận null/undefined và logic defensive
const ProductImage = ({
  src,
  alt,
}: {
  src: string | null | undefined;
  alt: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Lấy API URL cho việc hiển thị ảnh IPFS (nếu cần)
  const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

  // Logic SỬA LỖI: Kiểm tra src có phải là chuỗi và có giá trị trước khi gọi startsWith
  const isString = typeof src === "string" && src.length > 0;

  const finalSrc = isString
    ? src.startsWith("http") // Chỉ gọi startsWith nếu chắc chắn là chuỗi
      ? src // Nếu là full URL (http...)
      : `${IPFS_GATEWAY}${src}` // Nếu là CID, nối với Gateway
    : "/placeholder.svg"; // Fallback

  return (
    <div className="relative w-20 h-20 object-cover rounded overflow-hidden bg-slate-700 shrink-0">
      {/* Skeleton Layer */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-600 animate-pulse flex items-center justify-center">
          {/* Icon nhỏ mờ mờ để đẹp hơn (tùy chọn) */}
          <div className="w-4 h-4 bg-slate-500 rounded-full opacity-20"></div>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={finalSrc} // Sử dụng finalSrc đã được xử lý fallback
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
          setIsLoading(false); // Tắt skeleton nếu lỗi ảnh
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [userRole, setUserRole] = useState<string>(""); // 'manager', 'producer', 'retailer', 'transporter'
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState({
    product_id: "",
    name: "",
    description: "",
    manufacture_date: "",
    expiry_date: "",
    user_id: "",
    ipfs: "",
    image_preview: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // QR Code state
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState<any>(null);

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    transaction_id: "",
    product_id: "",
    order_status: "",
    assign_date: "",
    received_date: "",
  });

  // Transporters state
  const [transporters, setTransporters] = useState<any[]>([]);
  const [showAddTransporter, setShowAddTransporter] = useState(false);
  const [editingTransporterId, setEditingTransporterId] = useState<
    string | null
  >(null);
  const [transporterFormData, setTransporterFormData] = useState({
    transporter_id: "",
    name: "",
  });

  // Retailers state
  const [retailers, setRetailers] = useState<any[]>([]);
  const [showAddRetailer, setShowAddRetailer] = useState(false);
  const [editingRetailerId, setEditingRetailerId] = useState<string | null>(
    null
  );
  const [retailerFormData, setRetailerFormData] = useState({
    retailer_id: "",
    name: "",
    location: "",
  });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role") || "";
    const storedUserId = localStorage.getItem("user_id") || "";
    console.log("Current User Role:", storedRole);
    if (!token) {
      router.push("/admin/login"); // Đẩy về trang login chính
    } else {
      setIsAdmin(true);
      setUserRole(storedRole); // Cập nhật Role
      setCurrentUserId(storedUserId);
      const loadAllData = async () => {
        try {
          // Lấy dữ liệu API thông qua apiClient (giả định apiClient đã được cấu hình đúng)
          const productsData = await apiClient.get("/products/");
          setProducts(productsData || []);

          const eventsData = await apiClient.get("/tracking/events/");
          setEvents(eventsData || []);

          const transportersData = await apiClient.get("/users/transporters/");
          setTransporters(transportersData || []);

          const retailersData = await apiClient.get("/users/retailers/");
          setRetailers(retailersData || []);
        } catch (error: any) {
          console.error("Failed to load data:", error);
          router.push("/admin/login");
        }
      };

      loadAllData();
    }
  }, [router]);

  const filterData = (
    data: any[],
    searchTerm: string,
    key: string,
    value: string
  ) => {
    return data.filter((item) => {
      let matchesSearch = true;
      let matchesFilter = true;

      if (searchTerm) {
        matchesSearch = Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (key && value) {
        matchesFilter =
          item[key]?.toString().toLowerCase() === value.toLowerCase();
      }

      return matchesSearch && matchesFilter;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductFormData((prev) => ({
        ...prev,
        image_preview: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const data = await apiClient.postWithFile("/pinata/upload/", form);
      const cid = data.cid;

      setProductFormData((prev) => ({
        ...prev,
        ipfs: cid,
      }));

      console.log("📌 CID:", cid);
    } catch (error) {
      console.error("Image upload failed:", error);
      // Thay alert bằng modal hoặc toast message cho UX tốt hơn
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProducts = async () => {
    const productsData = await apiClient.get("/products/");
    setProducts(productsData);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Loại bỏ image_preview khỏi dữ liệu gửi đi
    const { image_preview, ...payload } = productFormData;

    try {
      if (editingProductId) {
        await apiClient.put(`/products/${editingProductId}/`, payload);
        setEditingProductId(null);
      } else {
        await apiClient.post("/products/", payload);
      }

      setProductFormData({
        product_id: "",
        name: "",
        description: "",
        manufacture_date: "",
        expiry_date: "",
        user_id: "", // user_id sẽ bị bỏ qua (read_only) ở backend
        ipfs: "",
        image_preview: "",
      });
      setShowAddProduct(false);
      await fetchProducts(); // Tải lại danh sách sản phẩm
    } catch (error: any) {
      console.error("Failed to save product:", error);
      alert(`Error: ${error.message}`); // Hiển thị lỗi từ server
    }
  };

  const handleEditProduct = (product: any) => {
    setProductFormData(product);
    setEditingProductId(product.product_id);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`/products/${productId}/`);

        // Cập nhật UI (Cách 1: Tải lại toàn bộ)
        await fetchProducts();

        // Cập nhật UI (Cách 2: Lọc state, nhanh hơn)
        // setProducts(products.filter((p) => p.product_id !== productId));
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate đuôi file sơ bộ
    if (!file.name.endsWith(".xlsx")) {
      alert("Please upload a valid Excel file (.xlsx)");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      // Key 'file' phải khớp với Backend (request.FILES.get("file"))
      formData.append("file", file);

      const response = await apiClient.postWithFile(
        "/products/import_excel/",
        formData
      );

      alert(
        `Import successful! Created: ${response.created_count}, Errors: ${response.error_count}`
      );

      // Tải lại danh sách sản phẩm ngay lập tức
      await fetchProducts();
    } catch (error: any) {
      console.error("Import failed:", error);
      const msg =
        error.response?.data?.error || error.message || "Import failed";
      alert(`Error: ${msg}`);
    } finally {
      setIsImporting(false);
      // Reset input để có thể chọn lại cùng 1 file nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportExcel = async () => {
    // Lấy URL từ biến môi trường
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("accessToken");

    if (!apiUrl) {
      alert("System Configuration Error: Missing API URL.");
      return;
    }

    try {
      setIsExporting(true);

      // Gọi API trực tiếp bằng fetch để có thể xử lý Blob/File
      const response = await fetch(
        `${apiUrl}/products/export_excel/`, // ĐÃ DÙNG biến môi trường
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export API failed response:", errorText);
        throw new Error(
          `Failed to download file. Server response: ${response.status}`
        );
      }

      // Chuyển response thành Blob
      const blob = await response.blob();

      // Tạo đường dẫn ảo cho file
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `products_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`; // Tên file: products_export_2025-11-26.xlsx
      document.body.appendChild(a);
      a.click();

      // Dọn dẹp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Export failed:", error);
      alert("Failed to export excel file. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const fetchEvents = async () => {
    const data = await apiClient.get("/tracking/events/");
    setEvents(data || []);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Tạo payload từ form
      const payload: any = { ...eventFormData };

      if (editingEventId) {
        // --- LOGIC UPDATE (PATCH) ---

        if (userRole === "retailer") {
          // Retailer: Chỉ được cập nhật received_date
          delete payload.order_status;
          delete payload.assign_date;
          delete payload.product_id;
          delete payload.transaction_id;
        } else if (userRole === "transporter") {
          // Transporter: Chỉ cập nhật status và ngày gán
          // Không được sửa received_date
          delete payload.received_date;
          delete payload.product_id;
          delete payload.transaction_id;
        }

        await apiClient.patch(`/tracking/events/${editingEventId}/`, payload);
      } else {
        // Chỉ Retailer (hoặc Manager) mới được tạo Request
        if (userRole === "retailer") {
          // Retailer tạo request: Mặc định status là pending
          payload.order_status = "pending";
          // received_date phải null khi mới tạo
          payload.received_date = null;
        }

        await apiClient.post("/tracking/events/", eventFormData);
      }

      // Reset form & Refresh data
      setEventFormData({
        transaction_id: "",
        product_id: "",
        order_status: "",
        assign_date: "",
        received_date: "",
      });
      setEditingEventId(null);
      setShowAddEvent(false);
      await fetchEvents();
      alert("Event saved successfully!");
    } catch (error: any) {
      console.error("Failed to save event:", error);
      // Hiển thị thông báo lỗi chi tiết từ Backend trả về
      const message =
        error.response?.data?.detail || error.message || "Failed to save event";
      alert(`Error: ${message}`);
    }
  };

  const handleEditEvent = (event: any) => {
    // Xử lý product_id an toàn (API có thể trả về object hoặc string/number)
    let pId = event.product_id || event.product || "";
    if (typeof pId === "object" && pId !== null) {
      pId = pId.product_id || pId.id || "";
    }

    setEventFormData({
      transaction_id: event.transaction_id,
      product_id: String(pId),
      order_status: event.order_status,
      assign_date: event.assign_date,
      received_date: event.received_date,
    });
    setEditingEventId(event.transaction_id);
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await apiClient.delete(`/tracking/events/${transactionId}/`);
        await fetchEvents();
      } catch (error: any) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event");
      }
    }
  };

  const fetchTransporters = async () => {
    const data = await apiClient.get("/users/transporters/");
    setTransporters(data || []);
  };

  const handleAddTransporter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransporterId) {
        // UPDATE
        await apiClient.put(
          `/users/transporters/${editingTransporterId}/`,
          transporterFormData
        );
      } else {
        // CREATE
        await apiClient.post("/users/transporters/", transporterFormData);
      }

      setTransporterFormData({ transporter_id: "", name: "" });
      setEditingTransporterId(null);
      setShowAddTransporter(false);
      await fetchTransporters();
      alert("Transporter saved successfully!");
    } catch (error: any) {
      console.error("Failed to save transporter:", error);
      alert(`Error: ${error.message || "Failed to save transporter"}`);
    }
  };

  const handleEditTransporter = (transporter: any) => {
    setTransporterFormData(transporter);
    setEditingTransporterId(transporter.transporter_id);
    setShowAddTransporter(true);
  };

  const handleDeleteTransporter = async (transporterId: string) => {
    if (confirm("Are you sure you want to delete this transporter?")) {
      try {
        await apiClient.delete(`/users/transporters/${transporterId}/`);
        await fetchTransporters();
      } catch (error: any) {
        console.error("Failed to delete transporter:", error);
        alert("Failed to delete transporter");
      }
    }
  };

  const fetchRetailers = async () => {
    const data = await apiClient.get("/users/retailers/");
    setRetailers(data || []);
  };

  const handleAddRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRetailerId) {
        // UPDATE
        await apiClient.put(
          `/users/retailers/${editingRetailerId}/`,
          retailerFormData
        );
      } else {
        // CREATE
        await apiClient.post("/users/retailers/", retailerFormData);
      }

      setRetailerFormData({
        retailer_id: "",
        name: "",
        location: "",
      });
      setEditingRetailerId(null);
      setShowAddRetailer(false);
      await fetchRetailers();
      alert("Retailer saved successfully!");
    } catch (error: any) {
      console.error("Failed to save retailer:", error);
      alert(`Error: ${error.message || "Failed to save retailer"}`);
    }
  };

  const handleEditRetailer = (retailer: any) => {
    setRetailerFormData(retailer);
    setEditingRetailerId(retailer.retailer_id);
    setShowAddRetailer(true);
  };

  const handleDeleteRetailer = async (retailerId: string) => {
    if (confirm("Are you sure you want to delete this retailer?")) {
      try {
        await apiClient.delete(`/users/retailers/${retailerId}/`);
        await fetchRetailers();
      } catch (error: any) {
        console.error("Failed to delete retailer:", error);
        alert("Failed to delete retailer");
      }
    }
  };

  if (!mounted) return null;
  if (!isAdmin) return null;

  const filteredProducts = filterData(
    products,
    searchQuery,
    filterKey,
    filterValue
  );
  const filteredEvents = filterData(
    events,
    searchQuery,
    filterKey,
    filterValue
  );
  const filteredTransporters = filterData(
    transporters,
    searchQuery,
    filterKey,
    filterValue
  );
  const filteredRetailers = filterData(
    retailers,
    searchQuery,
    filterKey,
    filterValue
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {["products", "events", "transporters", "retailers"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowAddProduct(false);
                setShowAddEvent(false);
                setShowAddTransporter(false);
                setShowAddRetailer(false);
                setEditingProductId(null);
                setEditingEventId(null);
                setEditingTransporterId(null);
                setEditingRetailerId(null);
                setSearchQuery("");
                setFilterKey("");
                setFilterValue("");
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            <div className="flex-1 w-full md:w-auto">
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search in all fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Filter By
              </label>
              <select
                aria-label="Filter By"
                value={filterKey}
                onChange={(e) => {
                  setFilterKey(e.target.value);
                  setFilterValue("");
                }}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              >
                <option value="">All</option>
                {activeTab === "products" && (
                  <>
                    <option value="user_id">User ID</option>
                    <option value="manufacture_date">Manufacture Date</option>
                  </>
                )}
                {activeTab === "events" && (
                  <>
                    <option value="order_status">Order Status</option>
                    <option value="product_id">Product ID</option>
                  </>
                )}
                {activeTab === "retailers" && (
                  <option value="location">Location</option>
                )}
              </select>
            </div>
            {filterKey && (
              <div className="min-w-[150px]">
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  Value
                </label>
                <Input
                  type="text"
                  placeholder="Filter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            )}
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterKey("");
                setFilterValue("");
              }}
              variant="outline"
              size="sm"
              className="border-slate-600"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Manage Products
                </h2>
                <p className="text-sm text-slate-400">
                  Total: {filteredProducts.length} products
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {isExporting ? (
                    "Exporting..."
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Excel
                    </>
                  )}
                </Button>

                {userRole === "producer" && (
                  <>
                    {/* --- NÚT IMPORT EXCEL MỚI --- */}
                    <input
                      aria-label="Import Excel File"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportExcel}
                      accept=".xlsx"
                      className="hidden" // Ẩn input đi
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()} // Kích hoạt input ẩn
                      disabled={isImporting}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      {isImporting ? (
                        "Importing..."
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4 text-green-500" />
                          Import Excel
                        </>
                      )}
                    </Button>
                    {/* ---------------------------- */}

                    <Button
                      onClick={() => {
                        setShowAddProduct(!showAddProduct);
                        if (editingProductId) {
                          setEditingProductId(null);
                          setProductFormData({
                            product_id: "",
                            name: "",
                            description: "",
                            manufacture_date: "",
                            expiry_date: "",
                            user_id: "",
                            ipfs: "",
                            image_preview: "",
                          });
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {editingProductId ? "Cancel Edit" : "Add Product"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingProductId ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Product ID
                        </label>
                        <Input
                          type="text"
                          placeholder="PROD001"
                          value={productFormData.product_id}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              product_id: e.target.value,
                            })
                          }
                          disabled={!!editingProductId}
                          className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Product Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Product name"
                          value={productFormData.name}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Description
                        </label>
                        <Textarea
                          placeholder="Product description"
                          value={productFormData.description}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              description: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Manufacture Date
                        </label>
                        <Input
                          type="date"
                          value={productFormData.manufacture_date}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              manufacture_date: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Expiry Date
                        </label>
                        <Input
                          type="date"
                          value={productFormData.expiry_date}
                          onChange={(e) =>
                            setProductFormData({
                              ...productFormData,
                              expiry_date: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="border-t border-slate-600 pt-4">
                      <label className="text-sm font-medium text-slate-300 block mb-2">
                        Product Image
                      </label>
                      <div className="flex items-center gap-4">
                        {(productFormData.ipfs ||
                          productFormData.image_preview) && (
                          <div className="relative w-24 h-24">
                            {/* Đã sửa logic hiển thị ảnh ở component ProductImage */}
                            <img
                              src={
                                productFormData.image_preview
                                  ? productFormData.image_preview // Ưu tiên ảnh vừa chọn từ máy
                                  : productFormData.ipfs.startsWith("http")
                                  ? productFormData.ipfs // Nếu là link full (http...)
                                  : `https://gateway.pinata.cloud/ipfs/${productFormData.ipfs}` // Nếu chỉ là CID (Qm...)
                              }
                              alt="Preview"
                              className="w-full h-full object-cover rounded border border-slate-600"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />

                            <button
                              aria-label="Remove Image"
                              type="button"
                              onClick={() =>
                                setProductFormData({
                                  ...productFormData,
                                  ipfs: "",
                                  image_preview: "", // SỬA 3: Xóa cả preview khi bấm nút X
                                })
                              }
                              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded cursor-pointer hover:bg-slate-600 transition">
                            <Upload className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white">
                              {uploadingImage ? "Uploading..." : "Upload Image"}
                            </span>
                            <input
                              type="file"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                          {productFormData.ipfs && (
                            <p className="text-xs text-green-400 mt-2">
                              IPFS: {productFormData.ipfs}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-slate-600 pt-4">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingProductId ? "Update Product" : "Add Product"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddProduct(false);
                          setEditingProductId(null);
                          setProductFormData({
                            product_id: "",
                            name: "",
                            description: "",
                            manufacture_date: "",
                            expiry_date: "",
                            user_id: "",
                            ipfs: "",
                            image_preview: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            <div className="grid gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const ownerId = product.user_id || product.user;

                  const isOwner = String(ownerId) === String(currentUserId);
                  // Logic check quyền sửa/xóa sản phẩm
                  // Manager: Full quyền
                  // Producer: Chỉ sản phẩm của mình (so sánh user_id hoặc id tương đương)
                  const canEditProduct =
                    userRole === "manager" ||
                    (userRole === "producer" && isOwner);

                  return (
                    <Card
                      key={product.product_id}
                      className="bg-slate-800 border-slate-700 hover:border-slate-600 transition"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          {/* ...existing code... */}
                          <ProductImage src={product.ipfs} alt={product.name} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-semibold text-white">
                                {product.name}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <p className="text-sm text-slate-400 mb-1">
                              ID:{" "}
                              <span className="font-mono text-blue-400">
                                {product.product_id}
                              </span>
                            </p>
                            <p className="text-sm text-slate-400 mb-2">
                              User:{" "}
                              <span className="font-mono text-blue-400">
                                {product.username} (ID: {product.user})
                              </span>
                            </p>
                            {/* {product.ipfs && (
                              <p className="text-xs text-green-400 mb-2">
                                IPFS: {product.ipfs}
                              </p>
                            )} */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Manufacture</p>
                                <p className="text-white">
                                  {product.manufacture_date
                                    ? new Date(
                                        product.manufacture_date
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Expiry</p>
                                <p className="text-white">
                                  {product.expiry_date
                                    ? new Date(
                                        product.expiry_date
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {/* Nút QR Code ai cũng thấy */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedQrProduct(product);
                                setShowQrModal(true);
                              }}
                            >
                              <QrCode className="w-4 h-4" /> QR Code
                            </Button>

                            {/* Nút Edit: Disable hoặc Ẩn nếu không có quyền */}
                            {canEditProduct && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </Button>
                            )}

                            {/* Nút Delete: Disable hoặc Ẩn nếu không có quyền */}
                            {canEditProduct && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteProduct(product.product_id)
                                }
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-center py-12">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchQuery || filterKey
                      ? "No products match your filters."
                      : "No products yet. Add one to get started."}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Manage Tracking Events
                </h2>
                <p className="text-sm text-slate-400">
                  Total: {filteredEvents.length} events
                </p>
              </div>
              {userRole === "retailer" && (
                <Button
                  onClick={() => {
                    setShowAddEvent(!showAddEvent);
                    if (editingEventId) {
                      setEditingEventId(null);
                      setEventFormData({
                        transaction_id: "",
                        product_id: "",
                        order_status: "",
                        assign_date: "",
                        received_date: "",
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingEventId ? "Cancel Edit" : "Add Event"}
                </Button>
              )}
            </div>

            {/* Add/Edit Event Form */}
            {showAddEvent && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingEventId ? "Edit Event" : "Add New Event"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Transaction ID
                        </label>
                        <Input
                          value={eventFormData.transaction_id}
                          disabled={true} // Luôn khóa
                          className="bg-slate-700 border-slate-600 text-white opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Product ID
                        </label>
                        <Input
                          value={eventFormData.product_id}
                          onChange={(e) =>
                            setEventFormData({
                              ...eventFormData,
                              product_id: e.target.value,
                            })
                          }
                          // Disable nếu đang Edit
                          disabled={!!editingEventId}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            !!editingEventId ? "opacity-50" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Order Status
                        </label>
                        <Input
                          value={eventFormData.order_status}
                          onChange={(e) =>
                            setEventFormData({
                              ...eventFormData,
                              order_status: e.target.value,
                            })
                          }
                          // Disable nếu là Retailer
                          disabled={userRole === "retailer"}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            userRole === "retailer"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Assign Date
                        </label>
                        <Input
                          type="date"
                          value={eventFormData.assign_date}
                          onChange={(e) =>
                            setEventFormData({
                              ...eventFormData,
                              assign_date: e.target.value,
                            })
                          }
                          // Disable nếu là Retailer
                          disabled={userRole === "retailer"}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            userRole === "retailer"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Received Date
                        </label>
                        <Input
                          type="date"
                          value={eventFormData.received_date}
                          onChange={(e) =>
                            setEventFormData({
                              ...eventFormData,
                              received_date: e.target.value,
                            })
                          }
                          // Disable nếu là Transporter
                          disabled={userRole === "transporter"}
                          className={`bg-slate-700 border-slate-600 text-white ${
                            userRole === "transporter"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingEventId ? "Update Event" : "Add Event"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddEvent(false);
                          setEditingEventId(null);
                          setEventFormData({
                            transaction_id: "",
                            product_id: "",
                            order_status: "",
                            assign_date: "",
                            received_date: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Events List */}
            <div className="grid gap-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <Card
                    key={event.transaction_id}
                    className="bg-slate-800 border-slate-700 hover:border-slate-600 transition"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Transaction ID</p>
                              <p className="text-white font-mono font-semibold">
                                {event.transaction_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Product ID</p>
                              <p className="text-white font-mono">
                                {event.product_id || event.product}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Order Status</p>
                              <p className="text-white">{event.order_status}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Assign Date</p>
                              <p className="text-white">
                                {event.assign_date
                                  ? new Date(
                                      event.assign_date
                                    ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Received Date</p>
                              <p className="text-white">
                                {event.received_date
                                  ? new Date(
                                      event.received_date
                                    ).toLocaleDateString("vi-VN")
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          {userRole === "manager" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteEvent(event.transaction_id)
                              }
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchQuery || filterKey
                      ? "No events match your filters."
                      : "No events yet. Add one to get started."}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Transporters Tab */}
        {activeTab === "transporters" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Manage Transporters
                </h2>
                <p className="text-sm text-slate-400">
                  Total: {filteredTransporters.length} transporters
                </p>
              </div>
            </div>

            {/* Add/Edit Transporter Form */}
            {showAddTransporter && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingTransporterId
                      ? "Edit Transporter"
                      : "Add New Transporter"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTransporter} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Transporter ID
                        </label>
                        <Input
                          type="text"
                          placeholder="TRANS001"
                          value={transporterFormData.transporter_id}
                          onChange={(e) =>
                            setTransporterFormData({
                              ...transporterFormData,
                              transporter_id: e.target.value,
                            })
                          }
                          disabled={!!editingTransporterId}
                          className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Transporter Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Express Delivery Co"
                          value={transporterFormData.name}
                          onChange={(e) =>
                            setTransporterFormData({
                              ...transporterFormData,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingTransporterId
                          ? "Update Transporter"
                          : "Add Transporter"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddTransporter(false);
                          setEditingTransporterId(null);
                          setTransporterFormData({
                            transporter_id: "",
                            name: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Transporters List */}
            <div className="grid gap-4">
              {filteredTransporters.length > 0 ? (
                filteredTransporters.map((transporter) => {
                  // Check quyền sở hữu
                  const isOwner =
                    String(transporter.user) === String(currentUserId);
                  const canEdit =
                    userRole === "manager" ||
                    (userRole === "transporter" && isOwner);
                  const canDelete = userRole === "manager";

                  // Check trạng thái Active (mặc định là true nếu API chưa trả về)
                  const isActive = transporter.is_active !== false;

                  return (
                    <Card
                      key={transporter.transporter_id}
                      // Nếu bị khóa (isActive = false) thì làm mờ và xám đi
                      className={`transition border-slate-700 ${
                        isActive
                          ? "bg-slate-800 hover:border-slate-600"
                          : "bg-slate-900/50 border-red-900/50 opacity-75"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className={`text-lg font-semibold ${
                                  isActive
                                    ? "text-white"
                                    : "text-slate-500 line-through"
                                }`}
                              >
                                {transporter.name}
                              </h3>
                              {/* Badge trạng thái */}
                              {!isActive && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-900 text-red-200 border border-red-700">
                                  Inactive
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Transporter ID</p>
                                <p className="text-white font-mono">
                                  {transporter.transporter_id}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {/* Nút Edit */}
                            {canEdit && isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() =>
                                  handleEditTransporter(transporter)
                                }
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                            )}

                            {/* Nút Delete / Activate */}
                            {canDelete && (
                              <Button
                                variant={isActive ? "destructive" : "default"} // Đỏ nếu đang mở, Xanh/Mặc định nếu đang khóa
                                size="sm"
                                className={`gap-2 ${
                                  !isActive
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleDeleteTransporter(
                                    transporter.transporter_id
                                  )
                                }
                              >
                                {isActive ? (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 rotate-90" />{" "}
                                    {/* Icon tượng trưng Activate */}
                                    Activate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchQuery || filterKey
                      ? "No transporters match your filters."
                      : "No transporters yet. Add one to get started."}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Retailers Tab */}
        {activeTab === "retailers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Manage Retailers
                </h2>
                <p className="text-sm text-slate-400">
                  Total: {filteredRetailers.length} retailers
                </p>
              </div>
            </div>

            {/* Add/Edit Retailer Form */}
            {showAddRetailer && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingRetailerId ? "Edit Retailer" : "Add New Retailer"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddRetailer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Retailer ID
                        </label>
                        <Input
                          type="text"
                          placeholder="RET001"
                          value={retailerFormData.retailer_id}
                          onChange={(e) =>
                            setRetailerFormData({
                              ...retailerFormData,
                              retailer_id: e.target.value,
                            })
                          }
                          disabled={!!editingRetailerId}
                          className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Retailer Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Local Store A"
                          value={retailerFormData.name}
                          onChange={(e) =>
                            setRetailerFormData({
                              ...retailerFormData,
                              name: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Location
                        </label>
                        <Input
                          type="text"
                          placeholder="Ho Chi Minh City"
                          value={retailerFormData.location}
                          onChange={(e) =>
                            setRetailerFormData({
                              ...retailerFormData,
                              location: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editingRetailerId ? "Update Retailer" : "Add Retailer"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddRetailer(false);
                          setEditingRetailerId(null);
                          setRetailerFormData({
                            retailer_id: "",
                            name: "",
                            location: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Retailers List */}
            <div className="grid gap-4">
              {filteredRetailers.length > 0 ? (
                filteredRetailers.map((retailer) => {
                  const isOwner =
                    String(retailer.user) === String(currentUserId);
                  const canEdit =
                    userRole === "manager" ||
                    (userRole === "retailer" && isOwner);
                  const canDelete = userRole === "manager";
                  const isActive = retailer.is_active !== false;

                  return (
                    <Card
                      key={retailer.retailer_id}
                      className={`transition border-slate-700 ${
                        isActive
                          ? "bg-slate-800 hover:border-slate-600"
                          : "bg-slate-900/50 border-red-900/50 opacity-75"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className={`text-lg font-semibold ${
                                  isActive
                                    ? "text-white"
                                    : "text-slate-500 line-through"
                                }`}
                              >
                                {retailer.name}
                              </h3>
                              {!isActive && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-900 text-red-200 border border-red-700">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Retailer ID</p>
                                <p className="text-white font-mono">
                                  {retailer.retailer_id}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Location</p>
                                <p className="text-white">
                                  {retailer.location}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {canEdit && isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleEditRetailer(retailer)}
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                            )}

                            {canDelete && (
                              <Button
                                variant={isActive ? "destructive" : "default"}
                                size="sm"
                                className={`gap-2 ${
                                  !isActive
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleDeleteRetailer(retailer.retailer_id)
                                }
                              >
                                {isActive ? (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 rotate-90" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchQuery || filterKey
                      ? "No retailers match your filters."
                      : "No retailers yet. Add one to get started."}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQrModal && selectedQrProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Product QR Code</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div id="qr-code-container" className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={selectedQrProduct.product_id}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {selectedQrProduct.name}
                </h3>
                <p className="text-slate-400 font-mono">
                  {selectedQrProduct.product_id}
                </p>
                <p className="text-sm text-slate-500">
                  Scan this code to track the product
                </p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Create a canvas to convert SVG to PNG for download
                  const svg = document.querySelector("#qr-code-container svg");
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new window.Image(); // Use window.Image to avoid conflict with next/image
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.download = `QR-${selectedQrProduct.product_id}.png`;
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                    img.src =
                      "data:image/svg+xml;base64," +
                      btoa(unescape(encodeURIComponent(svgData)));
                  }
                }}
              >
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
