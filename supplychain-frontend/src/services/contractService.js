import { ethers } from "ethers";
import contractData from "../../contracts/SupplyChain.json"; // ✅ được auto cập nhật sau deploy


// ✅ Hàm khởi tạo contract
export async function getContract(withSigner = true) {
  if (!contractData.address || !contractData.abi) {
    throw new Error("❌ Contract ABI hoặc address chưa được tạo hoặc copy sang frontend.");
  }

  if (!window.ethereum) {
    throw new Error("⚠️ Vui lòng cài đặt MetaMask để kết nối blockchain.");
  }

  // Khởi tạo provider (từ MetaMask)
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Nếu cần signer (ví đã connect)
  const signerOrProvider = withSigner ? await provider.getSigner() : provider;

  // Tạo contract instance
  const contract = new ethers.Contract(
    contractData.address,
    contractData.abi,
    signerOrProvider
  );

  return { contract, provider };
}

// ✅ Hàm kết nối ví người dùng
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("⚠️ MetaMask chưa được cài đặt");
  }

  // Yêu cầu quyền truy cập vào tài khoản
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const signer = await provider.getSigner();
  const address = accounts[0];

  console.log("👛 Wallet connected:", address);

  return { provider, signer, address };
}

// ✅ Hàm tiện ích: Lấy danh sách sản phẩm từ contract
export async function fetchProducts() {
  const { contract } = await getContract(false);
  const products = [];
  let id = 0;

  try {
    while (true) {
      const [name, description, owner, stage, history] = await contract.getProduct(id);
      products.push({ id, name, description, owner, stage: Number(stage), history });
      id++;
    }
  } catch (err) {
    // Khi hết sản phẩm -> revert -> dừng vòng lặp
    console.log("✅ Fetched", products.length, "products");
  }

  return products;
}
