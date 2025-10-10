const { ethers } = require('ethers');
require('dotenv').config();
const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL || 'http://127.0.0.1:7545');
module.exports = { ethers, provider };
