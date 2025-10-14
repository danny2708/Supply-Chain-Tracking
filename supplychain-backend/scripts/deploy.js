const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SupplyChain contract...");

  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const contract = await SupplyChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);

  // Lấy ABI
  const abi = JSON.parse(contract.interface.formatJson());

  // Đường dẫn đến thư mục frontend
  const frontendDir = path.join(__dirname, "../../supplychain-frontend/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Ghi file JSON
  const contractData = {
    address: address,
    abi: abi,
  };

  const outputPath = path.join(frontendDir, "SupplyChain.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));

  console.log("📦 ABI + Address saved to:", outputPath);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
