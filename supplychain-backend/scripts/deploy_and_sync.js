/**
 * deploy_and_sync.js
 * Deploy SupplyChain contract + auto sync environment configs
 * Supports auto-detect network (sepolia / localhost / ganache)
 */

const fs = require("fs");
const path = require("path");

async function setEnvVar(envPath, key, value) {
  if (!fs.existsSync(envPath)) {
    fs.mkdirSync(path.dirname(envPath), { recursive: true });
    fs.writeFileSync(envPath, "", "utf8");
  }

  let content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/).filter(() => true);
  let found = false;

  const out = lines.map((line) => {
    if (!line.trim() || line.trim().startsWith("#")) return line;
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) return line;
    const k = m[1].trim();
    if (k === key) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) out.push(`${key}=${value}`);
  fs.writeFileSync(envPath, out.join("\n"), "utf8");
  console.log(`✅ Updated ${key} in ${envPath}`);
}

async function main() {
  const hre = require("hardhat");
  console.log("🔧 Running hardhat compile...");
  await hre.run("compile");

  console.log(`🚀 Deploying SupplyChain contract to '${hre.network.name}'...`);
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const contract = await SupplyChain.deploy();

  if (typeof contract.waitForDeployment === "function") {
    await contract.waitForDeployment();
  } else if (typeof contract.deployed === "function") {
    await contract.deployed();
  } else if (contract.deployTransaction) {
    await contract.deployTransaction.wait();
  }

  const address = contract.address || (await contract.getAddress?.()) || "";
  console.log("✅ Deployed at:", address);

  // Read ABI
  const artifact = await hre.artifacts.readArtifact("SupplyChain");
  const abi = artifact.abi;

  // Write ABI+address to frontend
  const frontendContractsDir = path.resolve(__dirname, "../../supplychain-frontend/contracts");
  fs.mkdirSync(frontendContractsDir, { recursive: true });
  const frontendContractJsonPath = path.join(frontendContractsDir, "SupplyChain.json");
  fs.writeFileSync(frontendContractJsonPath, JSON.stringify({ address, abi }, null, 2), "utf8");
  console.log("📦 Wrote ABI+address to", frontendContractJsonPath);

  // Auto detect network
  const networkName = hre.network.name;
  let rpcUrl = "http://127.0.0.1:8545";
  if (networkName === "sepolia") {
    rpcUrl = process.env.SEPOLIA_RPC_URL || rpcUrl;
  } else if (networkName === "ganache") {
    rpcUrl = process.env.GANACHE_URL || rpcUrl;
  }

  // Update backend .env
  const backendEnvPath = path.resolve(__dirname, "../.env");
  await setEnvVar(backendEnvPath, "CONTRACT_ADDRESS", address);
  await setEnvVar(backendEnvPath, "NEXT_PUBLIC_CONTRACT_ADDRESS", address);
  await setEnvVar(backendEnvPath, "NETWORK", networkName);
  await setEnvVar(backendEnvPath, "BLOCKCHAIN_PROVIDER_URL", rpcUrl);

  // Update frontend .env.local
  const frontendEnvLocalPath = path.resolve(__dirname, "../../supplychain-frontend/.env.local");
  await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_CONTRACT_ADDRESS", address);
  await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_RPC_URL", rpcUrl);

  console.log("\n🎉 Deploy + sync finished successfully!");
  console.log("- ✅ Frontend contract JSON:", frontendContractJsonPath);
  console.log("- ✅ Backend .env:", backendEnvPath);
  console.log("- ✅ Frontend .env.local:", frontendEnvLocalPath);
  console.log(`🌐 Network detected: ${networkName}`);
  console.log(`🔗 RPC URL used: ${rpcUrl}`);
}

main().catch((err) => {
  console.error("❌ Error in deploy_and_sync:", err);
  process.exitCode = 1;
});
