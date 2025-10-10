export default function ProductCard({ product }){
  return (
    <div style={{border:'1px solid #ddd', padding:12, borderRadius:6}}>
      <h3>Product {product?.productId}</h3>
      <p>{product?.metaCID}</p>
    </div>
  );
}
