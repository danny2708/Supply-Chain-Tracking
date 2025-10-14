import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { connectWallet, getContract } from "../services/contractService";

export default function Home() {
  useEffect(() => {
    async function init() {
      try {
        // Kết nối ví và gọi contract
        const { signer } = await connectWallet();
        const contract = getContract(signer);

        // Gọi thử hàm từ contract (nếu có, ví dụ getAllProducts hoặc name)
        if (contract.name) {
          const name = await contract.name();
          console.log("🏷️ Contract name:", name);
        } else {
          console.log("✅ Contract loaded thành công!");
        }
      } catch (err) {
        console.error("❌ Lỗi khi load contract:", err.message);
      }
    }

    init();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "Arial" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image src="/logo.svg" alt="logo" width={120} height={40} />
        <h1>SupplyChain DApp</h1>
      </header>
      <p>Welcome — hãy sử dụng Dashboard để tạo và theo dõi sản phẩm.</p>
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/product/1">Product demo (id=1)</Link></li>
      </ul>
    </main>
  );
}
