export default function Timeline({ events=[] }){
  return <ol>{events.map((e,i)=>(<li key={i}>{e.description} - {e.actor}</li>))}</ol>
}
