import { ethers } from 'ethers';
import CONTRACTS from '../lib/contracts';
export function useContract(){
  const provider = typeof window !== 'undefined' && window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
  const signer = provider ? provider.getSigner() : null;
  const contract = (signer && CONTRACTS.SupplyChain.address) ? new ethers.Contract(CONTRACTS.SupplyChain.address, CONTRACTS.SupplyChain.abi, signer) : null;
  return { provider, signer, contract };
}
