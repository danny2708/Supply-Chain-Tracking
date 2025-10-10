import { useState } from 'react';
export default function useWallet(){
  const [account, setAccount] = useState(null);
  const connect = async ()=>{
    if(window.ethereum){
      const acc = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(acc[0]);
    }
  };
  return { account, connect };
}
