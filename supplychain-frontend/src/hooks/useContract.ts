import { ethers } from 'ethers';
import CONTRACTS from '../lib/contracts';
import { useState, useEffect } from 'react';

export function useContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum as any);
        setProvider(_provider);
        const _signer = await _provider.getSigner();
        setSigner(_signer);
        if (CONTRACTS.SupplyChain.address) {
          const _contract = new ethers.Contract(CONTRACTS.SupplyChain.address, CONTRACTS.SupplyChain.abi, _signer);
          setContract(_contract);
        }
      }
    };
    init();
  }, []);

  return { provider, signer, contract };
}
