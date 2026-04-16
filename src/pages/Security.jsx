import PageLayout from './PageLayout'
import { H1, Lead, Section, Card, Badge, Divider } from './components'

export default function Security() {
  return (
    <PageLayout>
      <Badge color="green">Security</Badge>
      <H1>Built with security first</H1>
      <Lead>Solint is designed to be fully non-custodial. Your keys never leave your browser. We can't move your funds — only you can.</Lead>

      <Section title="Non-custodial architecture">
        Solint never asks for your private key or seed phrase. All wallet interactions go through your browser extension (Phantom). We construct transactions and present them for your approval — you decide whether to sign.
      </Section>

      <Section title="Transaction transparency">
        Before you sign, Phantom shows you exactly what the transaction does: which accounts are being closed, where the SOL goes, and the exact fee. There are no hidden instructions or surprise transfers.
      </Section>

      <Section title="Open source">
        Solint's smart contract interactions use only standard Solana Program Library (SPL) instructions — specifically the <code style={{background:'rgba(255,255,255,0.08)',padding:'2px 6px',borderRadius:4,fontSize:13}}>closeAccount</code> instruction. There are no custom programs or unaudited contracts involved.
      </Section>

      <Divider/>

      <Section title="What we can and cannot do">
        <Card>
          <p style={{color:'#34d399',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>✓ What Solint CAN do</p>
          <ul style={{margin:0,padding:'0 0 0 18px',color:'rgba(255,255,255,0.55)',fontSize:15,lineHeight:2}}>
            <li>Read your token account balances (public on-chain data)</li>
            <li>Construct close-account transactions for your approval</li>
            <li>Receive a 3% protocol fee from reclaimed SOL</li>
          </ul>
        </Card>
        <Card>
          <p style={{color:'#f87171',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>✗ What Solint CANNOT do</p>
          <ul style={{margin:0,padding:'0 0 0 18px',color:'rgba(255,255,255,0.55)',fontSize:15,lineHeight:2}}>
            <li>Access your private keys or seed phrase</li>
            <li>Move funds without your explicit signature</li>
            <li>Close accounts that still hold tokens</li>
            <li>Access any other wallets or accounts</li>
          </ul>
        </Card>
      </Section>
    </PageLayout>
  )
}
