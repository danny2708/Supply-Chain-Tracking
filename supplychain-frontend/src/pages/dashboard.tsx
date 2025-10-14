import React, { useState, useEffect } from "react";
import { connectWallet, getContract } from "../services/contractService";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [products, setProducts] = useState([]);

  // ✅ Kết nối ví
  const handleConnect = async () => {
    try {
      const { signer, address } = await connectWallet();
      const sc = getContract(signer);
      setContract(sc);
      setAccount(address);
      alert(`Đã kết nối ví: ${address}`);
    } catch (err) {
      alert("❌ Lỗi kết nối ví: " + err.message);
    }
  };

  // ✅ Tạo sản phẩm mới
  const handleCreateProduct = async () => {
    if (!contract) return alert("⚠️ Bạn cần kết nối ví trước!");
    const name = prompt("Nhập tên sản phẩm:");
    const code = prompt("Nhập mã sản phẩm:");
    if (!name || !code) return;
    try {
      const tx = await contract.addProduct(name, code);
      await tx.wait();
      alert("🎉 Đã tạo sản phẩm thành công!");
      await loadProducts(); // tải lại danh sách
    } catch (err) {
      alert("❌ Lỗi khi tạo sản phẩm: " + err.message);
    }
  };

  // ✅ Lấy danh sách sản phẩm
  const loadProducts = async () => {
    if (!contract) return;
    try {
      const result = await contract.getAllProducts();
      const list = result.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        code: p.code,
        status: p.status,
      }));
      setProducts(list);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách sản phẩm:", err.message);
    }
  };

  // ✅ Tự động load danh sách khi contract thay đổi
  useEffect(() => {
    if (contract) loadProducts();
  }, [contract]);

  return (
    <main style={{ padding: 24, fontFamily: "Arial" }}>
      <h2>🎛️ Producer / Actor Dashboard</h2>
      <p>Kết nối ví, tạo sản phẩm và xem danh sách trên blockchain.</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleConnect}>🔗 Kết nối ví</button>
        <button style={{ marginLeft: 8 }} onClick={handleCreateProduct}>
          ➕ Tạo sản phẩm
        </button>
      </div>

      {account && (
        <p style={{ marginTop: 12, color: "green" }}>
          👛 Đang kết nối với: <b>{account}</b>
        </p>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>📦 Danh sách sản phẩm</h3>
        {products.length === 0 ? (
          <p>Chưa có sản phẩm nào.</p>
        ) : (
          <table
            border={1}
            cellPadding="8"
            style={{
              borderCollapse: "collapse",
              marginTop: 8,
              width: "100%",
              textAlign: "left",
            }}
          >
            <thead style={{ background: "#f2f2f2" }}>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Mã</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.code}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
