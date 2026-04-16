import PageLayout from './PageLayout'
import { H1, Lead, Section, Card, Badge, Divider, Step } from './components'

export default function Docs() {
  return (
    <PageLayout>
      <Badge color="blue">Documentation</Badge>
      <H1>Solint Documentation</H1>
      <Lead>Everything you need to understand, use, and integrate with Solint Protocol.</Lead>

      <Section title="Quick Start">
        <Step n="1" title="Connect Phantom" desc="Click 'Connect Wallet' on the home page and approve the connection in Phantom." />
        <Step n="2" title="Scan Your Wallet" desc="Click 'Scan My Wallet'. Solint fetches all SPL and Token-2022 accounts associated with your address." />
        <Step n="3" title="Review and Reclaim" desc="On the Cleanup page, review the accounts found. Select which ones to close, review the summary, and click 'Clean Now'. Approve in Phantom." />
      </Section>

      <Divider/>

      <Section title="Fee Structure">
        <Card>
          <p style={{color:'rgba(255,255,255,0.70)',fontSize:15,margin:'0 0 10px',lineHeight:1.7}}>Solint charges a <span style={{color:'#c4b5fd',fontWeight:600}}>3% protocol fee</span> on the total SOL reclaimed.</p>
          <p style={{color:'rgba(255,255,255,0.40)',fontSize:14,margin:0,fontFamily:'DM Mono,monospace'}}>
            fee = floor(reclaimedLamports × 0.03)<br/>
            youReceive = reclaimedLamports − fee
          </p>
        </Card>
        <p style={{color:'rgba(255,255,255,0.45)',fontSize:14,lineHeight:1.7}}>The fee is sent in the same transaction as the close instructions, so you pay nothing if the transaction fails. Scanning is always free.</p>
      </Section>

      <Section title="Supported Account Types">
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
          {['SPL Tokens','Token-2022','Empty NFT accounts','LP tokens'].map(t=>(
            <span key={t} style={{padding:'6px 14px',borderRadius:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.65)',fontSize:13}}>{t}</span>
          ))}
        </div>
        <p style={{color:'rgba(255,255,255,0.40)',fontSize:14,lineHeight:1.7}}>An account is eligible for closure when its token balance is exactly zero. Accounts with any remaining balance are never shown as closeable.</p>
      </Section>

      <Divider/>

      <Section title="RPC & Data">
        Solint uses Helius RPC for all Solana data queries. No wallet data is stored on our servers — all queries go directly from your browser to the RPC endpoint. We do not log wallet addresses or transaction history.
      </Section>
    </PageLayout>
  )
}
