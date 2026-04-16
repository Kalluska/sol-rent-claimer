export function H1({ children }) {
  return <h1 style={{fontSize:42,fontWeight:800,letterSpacing:'-0.035em',marginBottom:12,background:'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.75) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{children}</h1>
}
export function Lead({ children }) {
  return <p style={{fontSize:18,color:'rgba(255,255,255,0.50)',lineHeight:1.75,marginBottom:48,maxWidth:600}}>{children}</p>
}
export function Section({ title, children }) {
  return (
    <div style={{marginBottom:40}}>
      <h2 style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:16,letterSpacing:'-0.02em'}}>{title}</h2>
      <div style={{color:'rgba(255,255,255,0.60)',fontSize:16,lineHeight:1.8}}>{children}</div>
    </div>
  )
}
export function Card({ children }) {
  return <div style={{borderRadius:16,padding:'24px 28px',background:'rgba(255,255,255,0.035)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:16}}>{children}</div>
}
export function Step({ n, title, desc }) {
  return (
    <div style={{display:'flex',gap:18,marginBottom:28,alignItems:'flex-start'}}>
      <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(79,70,229,0.5))',border:'1px solid rgba(124,58,237,0.4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#c4b5fd',fontWeight:700,fontSize:15}}>{n}</div>
      <div>
        <h3 style={{color:'#fff',fontWeight:600,fontSize:16,margin:'0 0 6px'}}>{title}</h3>
        <p style={{color:'rgba(255,255,255,0.50)',fontSize:15,margin:0,lineHeight:1.7}}>{desc}</p>
      </div>
    </div>
  )
}
export function Badge({ color='violet', children }) {
  const colors = {
    violet: {bg:'rgba(124,58,237,0.15)',border:'rgba(124,58,237,0.35)',text:'#c4b5fd'},
    green:  {bg:'rgba(16,185,129,0.12)',border:'rgba(16,185,129,0.30)',text:'#34d399'},
    blue:   {bg:'rgba(6,182,212,0.12)', border:'rgba(6,182,212,0.30)', text:'#22d3ee'},
    amber:  {bg:'rgba(245,158,11,0.12)',border:'rgba(245,158,11,0.30)',text:'#fbbf24'},
  }
  const c = colors[color] || colors.violet
  return <span style={{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:999,background:c.bg,border:`1px solid ${c.border}`,color:c.text,fontSize:13,fontWeight:600,marginRight:8,marginBottom:8}}>{children}</span>
}
export function Divider() {
  return <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'40px 0'}}/>
}
