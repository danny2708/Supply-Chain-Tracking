const { ethers } = require("ethers");
require("dotenv").config();

// 1. Kết nối với Ganache
const GANACHE_URL = process.env.GANACHE_URL || "http://127.0.0.1:7545";
const provider = new ethers.providers.JsonRpcProvider(GANACHE_URL);

// Lấy thông tin contract
const ABI = require("./abi.json");
const CONTRACT_ADDR = process.env.SUPPLYCHAIN_ADDRESS || "";

// Kiểm tra nếu thiếu địa chỉ contract
if (!CONTRACT_ADDR) {
  console.log(
    "Vui lòng đặt biến SUPPLYCHAIN_ADDRESS trong file .env để lắng nghe sự kiện."
  );
}

// Hàm poll để kiểm tra block mới
async function poll() {
  // Kiểm tra kết nối ban đầu
  try {
    const network = await provider.getNetwork();
    console.log("Đã kết nối tới mạng:", network.name);
  } catch (error) {
    console.error(
      "Không thể kết nối tới provider. Vui lòng kiểm tra lại GANACHE_URL."
    );
    return;
  }

  let lastBlock = await provider.getBlockNumber();
  console.log(`Bắt đầu theo dõi từ block: ${lastBlock}`);

  // Sử dụng setInterval để kiểm tra định kỳ mỗi 2 giây
  setInterval(async () => {
    const currentBlock = await provider.getBlockNumber();
    if (currentBlock > lastBlock) {
      console.log(`Block mới được tìm thấy: ${currentBlock}`);
      lastBlock = currentBlock;
    }
  }, 2000);
}

poll();
