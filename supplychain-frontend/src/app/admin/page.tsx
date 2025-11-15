"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    manufacture_date: "",
    expiry_date: "",
  });

  useEffect(() => {
    setMounted(true);
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    } else {
      setIsAdmin(true);
      // Load mock products
      setProducts([
        {
          product_id: "PROD001",
          name: "Organic Coffee Beans",
          manufacture_date: "2024-01-15",
          expiry_date: "2025-01-15",
        },
        {
          product_id: "PROD002",
          name: "Premium Tea Set",
          manufacture_date: "2024-02-20",
          expiry_date: "2026-02-20",
        },
      ]);
    }
  }, [router]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.product_id && formData.name) {
      setProducts([...products, formData]);
      setFormData({
        product_id: "",
        name: "",
        manufacture_date: "",
        expiry_date: "",
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.product_id !== productId));
  };

  if (!mounted) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "tracking"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            Tracking Events
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Manage Products</h2>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Add New Product</CardTitle>
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
                          value={formData.product_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              product_id: e.target.value,
                            })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Product Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Product name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">
                          Manufacture Date
                        </label>
                        <Input
                          type="date"
                          value={formData.manufacture_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
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
                          value={formData.expiry_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expiry_date: e.target.value,
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
                        Add Product
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
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
              {products.length > 0 ? (
                products.map((product) => (
                  <Card
                    key={product.product_id}
                    className="bg-slate-800 border-slate-700"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-white">
                              {product.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            ID:{" "}
                            <span className="font-mono text-blue-400">
                              {product.product_id}
                            </span>
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Manufacture Date</p>
                              <p className="text-white">
                                {product.manufacture_date
                                  ? new Date(
                                    product.manufacture_date
                                  ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Expiry Date</p>
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              handleDeleteProduct(product.product_id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-center py-12">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No products yet. Add one to get started.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Tracking Events Tab */}
        {activeTab === "tracking" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Tracking Events</h2>
            <Alert className="bg-blue-900/20 border-blue-700">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400">
                Tracking events management feature coming soon. You can update
                product tracking status and create new tracking events here.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  );
}
