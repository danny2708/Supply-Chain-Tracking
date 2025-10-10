const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL || 'http://127.0.0.1:7545');

async function verifyTx(txHash, contractAddress, abi, eventName){
  const receipt = await provider.getTransactionReceipt(txHash);
  if(!receipt) return null;
  // decoding events requires iface
  const iface = new ethers.Interface(abi);
  const logs = receipt.logs.map(l => {
    try { return iface.parseLog(l); } catch(e){ return null; }
  }).filter(x=>x);
  return { receipt, logs };
}

module.exports = { verifyTx, provider };
