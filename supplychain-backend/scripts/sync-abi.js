/* Copy ABI from contracts/build to frontend src/lib/contracts.json - placeholder */
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'contracts', 'build', 'SupplyChain.json');
const dest = path.join(__dirname, '..', '..', 'supplychain-frontend', 'src', 'lib', 'contracts.json');
if(fs.existsSync(src)){
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('ABI copied to frontend');
} else console.log('ABI not found, compile contracts first');
