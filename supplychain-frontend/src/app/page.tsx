"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, LogOut, Settings } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (token && storedUsername) {
      setIsAdmin(true);
      setAdminName(storedUsername);
      if (storedRole) setUserRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    setIsAdmin(false);
    setAdminName("");
    setUserRole("");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Supply Chain Tracker
            </h1>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-4">
            {isAdmin ? (
              // --- TRẠNG THÁI ĐÃ ĐĂNG NHẬP ---
              <>
                <span className="text-sm text-slate-300">
                  Logged in as:{" "}
                  <span className="font-semibold text-blue-400">
                    {adminName}
                  </span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2 bg-transparent text-slate-300 hover:text-white border-slate-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/admin/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
                    Login
                  </Button>
                </Link>
                <Link href="/admin/signup">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 gap-2">
                    <span className="text-lg leading-none pb-1">+</span> Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track Product Card (Left Side) */}
          <Card className="bg-slate-800 border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-xl">
                <Package className="w-5 h-5 text-blue-500" />
                Track Product
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Scan QR code or search for product information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300 leading-relaxed">
                Enter a product ID or scan the QR code on your product to view
                detailed tracking information including transporter details,
                location, and delivery status.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium"
                onClick={() => router.push("/track")}
              >
                Track Product
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Admin Panel
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage products and tracking events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Access administrative features to manage products, update
                  tracking information, and monitor the supply chain.
                </p>
                <Link href="/admin">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Go to Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* About Section (Bottom - Full Width) */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              About This System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>
              This supply chain tracking system allows customers to verify
              product authenticity and track delivery status in real-time using
              Blockchain technology.
            </p>
            <p>
              Administrators can manage products, update tracking events, and
              maintain the integrity of the supply chain.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
