"use client";
import React, { useEffect, useState } from "react";
import {
  Package,
  LogOut,
  Settings,
  ExternalLink,
  Search,
  ShieldCheck,
  Truck,
  Box,
} from "lucide-react";
// Import Framer Motion cho animations
import { motion } from "framer-motion";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// --- UI COMPONENTS (Đã fix lỗi Props) ---

import type { MouseEventHandler } from "react";

// Sử dụng giá trị mặc định cho className và onClick để tránh lỗi "missing prop"
const Button = ({
  children,
  className = "",
  variant = "default",
  onClick = undefined,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  [key: string]: any;
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer active:scale-95";
  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-900/20 hover:shadow-lg",
    outline:
      "border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white",
    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-900/20 hover:shadow-lg",
  };

  let appliedClass = `${baseStyles} ${
    variants[variant] || variants.default
  } ${className}`;

  // Bọc button bằng motion.button để có hiệu ứng tap nhẹ
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={appliedClass}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ className = "", children, ...props }) => (
  // Thêm backdrop-blur mạnh hơn và border sáng hơn một chút
  <motion.div
    variants={fadeInUp}
    className={`rounded-xl border border-slate-700/50 bg-slate-800/60 shadow-xl backdrop-blur-md text-card-foreground overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ className = "", children }) => (
  <h3
    className={`font-semibold leading-none tracking-tight flex items-center gap-2 ${className}`}
  >
    {children}
  </h3>
);

const CardDescription = ({ className = "", children }) => (
  <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
);

const CardContent = ({ className = "", children }) => (
  <div className={`p-6 pt-0 relative z-10 ${className}`}>{children}</div>
);

// Component tạo nền động
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 100, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-900/30 rounded-full blur-3xl mix-blend-screen"
    />
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2],
        x: [0, -50, 0],
        y: [0, 100, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      }}
      className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-green-900/20 rounded-full blur-3xl mix-blend-screen"
    />
  </div>
);

// --- MAIN PAGE ---

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [userRole, setUserRole] = useState("");
  const [mounted, setMounted] = useState(false);

  const navigateTo = (path) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const storedUsername = localStorage.getItem("username");
      const storedRole = localStorage.getItem("role");

      if (token && storedUsername) {
        setIsAdmin(true);
        setAdminName(storedUsername);
        if (storedRole) setUserRole(storedRole);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
    }

    setIsAdmin(false);
    setAdminName("");
    setUserRole("");
  };

  if (!mounted) return null;

  return (
    // Thêm relative để chứa animated background
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur-lg sticky top-0 z-50 supports-[backdrop-filter]:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Supply Chain Tracker
            </h1>
          </motion.div>

          {/* Right Side Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            {isAdmin ? (
              <>
                <span className="hidden md:inline-block text-sm text-slate-300">
                  Logged in as:{" "}
                  <span className="font-semibold text-blue-400">
                    {adminName}
                  </span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <a href="/admin/login">
                  <Button>Login</Button>
                </a>
                <a href="/admin/signup">
                  <Button variant="success" className="gap-2">
                    <span className="text-lg leading-none pb-1">+</span> Sign Up
                  </Button>
                </a>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* 1. Track Product Card */}
          <Card
            // Thêm hiệu ứng hover scale nhẹ
            whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.5)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Search className="w-32 h-32 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-xl">
                <Search className="w-6 h-6 text-blue-500" />
                Track Product
              </CardTitle>
              <CardDescription>
                Scan QR code or search for product information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <p className="text-slate-300 leading-relaxed text-lg">
                Enter a product ID or scan the QR code on your product to view
                detailed tracking information including transporter details,
                location, and delivery status.
              </p>
              <Button
                className="w-full h-14 text-lg shadow-blue-500/20"
                onClick={() => navigateTo("/track")}
              >
                Track Now
              </Button>
            </CardContent>
          </Card>

          {/* 2. Admin Panel Card */}
          {isAdmin && (
            <Card
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(34, 197, 94, 0.5)",
              }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer group relative overflow-hidden"
            >
              {/* Thêm dải màu trang trí */}
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500/50"></div>
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Settings className="w-32 h-32 text-green-500 rotate-12" />
              </div>

              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Settings className="w-6 h-6 text-green-500 group-hover:rotate-90 transition-transform duration-700" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  Manage products and tracking events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <p className="text-slate-300 leading-relaxed text-lg">
                  Access administrative features to create, update products,
                  update tracking information, import or export information and
                  monitor the supply chain system integrity.
                </p>
                <a href="/admin" className="w-full block">
                  <Button
                    variant="success"
                    className="w-full h-14 text-lg shadow-green-500/20"
                  >
                    Go to Dashboard
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* About Section */}
        <Card className="mt-12 bg-slate-800/40">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              About This System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-slate-700/50 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <p>
                This supply chain tracking system allows customers to verify
                product authenticity and track delivery status in real-time
                using <strong>Blockchain technology</strong> for immutable
                records.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-slate-700/50 rounded-lg shrink-0">
                <Truck className="w-5 h-5 text-green-400" />
              </div>
              <p>
                Administrators can manage products, update tracking events
                throughout the journey from manufacturer to end consumer.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-slate-700/50 rounded-lg shrink-0">
                <Box className="w-5 h-5 text-purple-400" />
              </div>
              <p>
                Ensure transparency and trust in every step of the supply chain
                process.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer - Deploy on Sepolia */}
      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-lg py-6 mt-auto z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <motion.a
            whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 1)" }}
            whileTap={{ scale: 0.98 }}
            href="https://sepolia.etherscan.io/address/0xE26D4450D15b6e95E620342ef4382830f45E2594#events"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-900/20 no-underline backdrop-blur-md"
          >
            {/* Image Container */}
            <div className="relative w-12 h-12 overflow-hidden rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 p-[2px] group-hover:from-blue-400 group-hover:to-blue-600 transition-colors flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                <img
                  // ĐƯỜNG DẪN ẢNH ĐÃ SỬA.
                  src="/sepolia.png"
                  alt="Sepolia Network"
                  className="object-cover w-full h-full scale-110 group-hover:scale-125 transition-transform duration-500"
                  // FIX LỖI TYPE: Sử dụng e.currentTarget thay vì e.target để TS hiểu đúng kiểu Element
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://via.placeholder.com/48/1e293b/3b82f6?text=ETH";
                  }}
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold group-hover:text-blue-400 transition-colors text-left">
                Smart Contract
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg group-hover:text-blue-100 transition-colors bg-clip-text">
                  Deploy on Sepolia
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors group-hover:translate-x-1" />
              </div>
            </div>
          </motion.a>
        </div>
      </footer>
    </div>
  );
}
