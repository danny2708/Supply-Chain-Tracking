const CONTRACTS = {
  SupplyChain: {
    address: process.env.NEXT_PUBLIC_SUPPLYCHAIN_ADDRESS || '',
    abi: [] // Fill in after deploy (script can copy ABI here)
  }
};
export default CONTRACTS;
