"use client";

import type React from "react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { AlertCircle, Package, Factory, Truck, Store } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Role = "producer" | "retailer" | "transporter" | null;

const ROLE_INFO = {
  producer: {
    icon: Factory,
    label: "Producer",
    description: "Manufacture and create products",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  retailer: {
    icon: Store,
    label: "Retailer",
    description: "Sell and distribute products",
    color: "bg-green-600 hover:bg-green-700",
  },
  transporter: {
    icon: Truck,
    label: "Transporter",
    description: "Transport and deliver products",
    color: "bg-orange-600 hover:bg-orange-700",
  },
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError("");
    setStep("form");
  };

  const handleBackToRole = () => {
    setStep("role");
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    setLoading(true);

    try {
      // Lấy URL từ biến môi trường
      // Lưu ý: process.env.NEXT_PUBLIC_API_URL sẽ lấy giá trị từ file .env
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Kiểm tra xem biến môi trường có tồn tại không để tránh lỗi undefined
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(
        `${apiUrl}/users/register/`, // Sử dụng Template Literal để nối chuỗi
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
            name: name,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin/login");
    } catch (err) {
      console.error("Signup error:", err);
      // Hiển thị thông báo lỗi rõ ràng hơn nếu thiếu env
      if (err instanceof Error && err.message.includes("API URL")) {
         setError("System Configuration Error: Missing API URL.");
      } else {
         setError("Failed to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">
              Supply Chain Tracker
            </h1>
          </div>
          <p className="text-slate-400">Create Your Account</p>
        </div>

        {/* Role Selection */}
        {step === "role" ? (
          <div className="space-y-4">
            <p className="text-center text-slate-300 mb-6 text-sm">
              Select your role in the supply chain
            </p>

            {Object.entries(ROLE_INFO).map(([roleKey, roleData]) => {
              const Icon = roleData.icon;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleRoleSelect(roleKey as Role)}
                  className="w-full p-4 rounded-lg border-2 border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${roleData.color} text-white`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition">
                        {roleData.label}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {roleData.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="text-center mt-6">
              <Link href="/admin/login">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  Already have an account? Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Signup Form */
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Sign Up as {ROLE_INFO[selectedRole!].label}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fill in your details to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-900/20 border-red-700"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    onClick={handleBackToRole}
                    disabled={loading}
                  >
                    Back to Role Selection
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-3">
                  Already have an account?{" "}
                  <Link
                    href="/admin/login"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}