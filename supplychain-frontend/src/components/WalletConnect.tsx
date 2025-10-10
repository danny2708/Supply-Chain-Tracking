import { useState } from 'react';
export default function WalletConnect(){ 
  const [account, setAccount] = useState(null);
  const connect = async ()=>{
    if(window.ethereum){
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accs[0]);
    }else alert('Install MetaMask');
  };
  return (<div><button onClick={connect}>Connect Wallet</button>{account && <span style={{marginLeft:8}}> {account}</span>}</div>);
}
