/**
 * deploy_and_sync.js
 * - Compile (via hardhat)
 * - Deploy SupplyChain contract
 * - Read ABI (artifact) and write frontend/contracts/SupplyChain.json
 * - Update backend .env (SUPPLYCHAIN_ADDRESS)
 * - Update frontend .env.local (NEXT_PUBLIC_CONTRACT_ADDRESS, NEXT_PUBLIC_RPC_URL)
 *
 * Usage: node scripts/deploy_and_sync.js
 */

const fs = require("fs");
const path = require("path");

async function setEnvVar(envPath, key, value) {
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  } else {
    // create parent dir if needed
    fs.mkdirSync(path.dirname(envPath), { recursive: true });
  }

  const lines = content.split(/\r?\n/).filter(() => true);
  let found = false;
  const out = lines.map((line) => {
    if (!line) return line;
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
  // Use Hardhat runtime
  const hre = require("hardhat");

  // 1) Compile
  console.log("🔧 Running hardhat compile...");
  await hre.run("compile");

  // 2) Deploy
  console.log("🚀 Deploying SupplyChain contract...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const contract = await SupplyChain.deploy();

  // Compatibility across Hardhat/ethers versions:
  if (typeof contract.waitForDeployment === "function") {
    await contract.waitForDeployment();
  } else if (typeof contract.deployed === "function") {
    await contract.deployed();
  } else if (contract.deployTransaction) {
    await contract.deployTransaction.wait();
  }

  const address = contract.address || (await contract.getAddress?.()) || "";
  console.log("✅ Deployed at:", address);

  // 3) Read ABI from artifacts
  // Use Hardhat artifacts to ensure correct ABI
  const artifact = await hre.artifacts.readArtifact("SupplyChain");
  const abi = artifact.abi;

  // 4) Prepare frontend path
  const frontendContractsDir = path.resolve(__dirname, "../../supplychain-frontend/contracts");
  fs.mkdirSync(frontendContractsDir, { recursive: true });

  const frontendContractJsonPath = path.join(frontendContractsDir, "SupplyChain.json");
  const contractData = {
    address,
    abi,
  };
  fs.writeFileSync(frontendContractJsonPath, JSON.stringify(contractData, null, 2), "utf8");
  console.log("📦 Wrote ABI+address to", frontendContractJsonPath);

  // 5) Update backend .env
  const backendEnvPath = path.resolve(__dirname, "../.env"); // supplychain-backend/.env
  await setEnvVar(backendEnvPath, "SUPPLYCHAIN_ADDRESS", address);

  // 6) Update frontend .env.local
  const frontendEnvLocalPath = path.resolve(__dirname, "../../supplychain-frontend/.env.local");
  // preserve NEXT_PUBLIC_RPC_URL if exists, else set default to localhost:8545
  const rpcDefault = process.env.RPC_URL || "http://127.0.0.1:8545";
  await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_CONTRACT_ADDRESS", address);
  await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_RPC_URL", rpcDefault);

  console.log("\n🎉 Deploy + sync finished.");
  console.log("- Frontend contract JSON:", frontendContractJsonPath);
  console.log("- Backend .env:", backendEnvPath);
  console.log("- Frontend .env.local:", frontendEnvLocalPath);
}

main().catch((err) => {
  console.error("❌ Error in deploy_and_sync:", err);
  process.exitCode = 1;
});
