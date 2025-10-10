import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);

  useEffect(()=>{
    async function fetchData(){
      try{
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        setData(json);
      }catch(e){
        // no-op
      }
    }
    if(id) fetchData();
  },[id]);

  return (
    <main style={{padding:24}}>
      <h2>Product {id}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
