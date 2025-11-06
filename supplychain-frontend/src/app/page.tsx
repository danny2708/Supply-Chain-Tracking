"use client"
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if admin is logged in
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      const session = JSON.parse(adminSession);
      setIsAdmin(true);
      setAdminName(session.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    setIsAdmin(false);
    setAdminName("");
  };

  const handleLogin = () => {
    router.push("/admin");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Supply Chain Tracker
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
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
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleLogin} size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Tracking Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Track Product
              </CardTitle>
              <CardDescription className="text-slate-400">
                Scan QR code or search for product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Enter a product ID or scan the QR code on your product to view
                detailed tracking information including transporter details,
                location, and delivery status.
              </p>
              <Link href="/track">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Track Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Panel Card */}
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

          {/* Info Card */}
          <Card className="bg-slate-800 border-slate-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">About This System</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-2">
              <p>
                This supply chain tracking system allows customers to verify
                product authenticity and track delivery status in real-time.
              </p>
              <p>
                Administrators can manage products, update tracking events, and
                maintain the integrity of the supply chain.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
