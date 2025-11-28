/**
 * deploy_and_sync.js
 */

const fs = require("fs");
const path = require("path");
const { ethers, artifacts, network } = require("hardhat");   // ⭐ FIX QUAN TRỌNG

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
        if (m[1].trim() === key) {
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
    console.log("🔧 Running hardhat compile...");
    await hre.run("compile");

    console.log(`🚀 Deploying SupplyChain contract to '${network.name}'...`);

    // ⭐⭐⭐ FIX: Lấy signer CHUẨN từ Ethers v6 trong Hardhat ⭐⭐⭐
    const [deployer] = await ethers.getSigners();
    if (!deployer) throw new Error("❌ Cannot load deployer (signer undefined)");

    console.log("📌 Deployer address:", deployer.address);

    // ⭐⭐⭐ FIX: Truyền signer vào factory ⭐⭐⭐
    const SupplyChainFactory = await ethers.getContractFactory(
        "SupplyChain",
        deployer
    );

    // Deploy
    const contract = await SupplyChainFactory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed at:", address);

    // Read ABI
    const artifact = await artifacts.readArtifact("SupplyChain");
    const abi = artifact.abi;

    // Write ABI to frontend
    const frontendContractsDir = path.resolve(
        __dirname,
        "../../supplychain-frontend/contracts"
    );
    fs.mkdirSync(frontendContractsDir, { recursive: true });

    const frontendContractJsonPath = path.join(
        frontendContractsDir,
        "SupplyChain.json"
    );

    fs.writeFileSync(
        frontendContractJsonPath,
        JSON.stringify({ address, abi }, null, 2),
        "utf8"
    );
    console.log("📦 Wrote ABI+address to", frontendContractJsonPath);

    // RPC resolve
    let rpcUrl = "http://127.0.0.1:8545";
    if (network.name === "sepolia") rpcUrl = process.env.SEPOLIA_RPC_URL || rpcUrl;
    if (network.name === "ganache") rpcUrl = process.env.GANACHE_URL || rpcUrl;

    // Backend .env update
    const backendEnvPath = path.resolve(__dirname, "../.env");
    await setEnvVar(backendEnvPath, "CONTRACT_ADDRESS", address);
    await setEnvVar(backendEnvPath, "NETWORK", network.name);
    await setEnvVar(backendEnvPath, "BLOCKCHAIN_PROVIDER_URL", rpcUrl);

    // Frontend .env.local update
    const frontendEnvLocalPath = path.resolve(
        __dirname,
        "../../supplychain-frontend/.env.local"
    );
    await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_CONTRACT_ADDRESS", address);
    await setEnvVar(frontendEnvLocalPath, "NEXT_PUBLIC_RPC_URL", rpcUrl);

    console.log("\n🎉 Deploy + sync finished!");
}

main().catch((err) => {
    console.error("❌ Error in deploy_and_sync:", err);
    process.exitCode = 1;
});
