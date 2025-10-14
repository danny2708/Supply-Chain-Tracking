import { ethers } from "ethers";
import contractData from "../../contracts/SupplyChain.json"; // ✅ tự động cập nhật sau deploy

// Khởi tạo contract với signer hoặc provider
export function getContract(signerOrProvider) {
  if (!contractData.address || !contractData.abi) {
    throw new Error("Contract ABI hoặc address chưa được tạo!");
  }
  return new ethers.Contract(contractData.address, contractData.abi, signerOrProvider);
}

// Hàm tiện ích để kết nối ví (MetaMask)
export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask chưa được cài đặt");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  console.log("👛 Wallet connected:", address);
  return { provider, signer, address };
}
