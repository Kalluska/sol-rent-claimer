import PageLayout from './PageLayout'
import { H1, Lead, Step, Card, Badge, Divider, Section } from './components'

export default function HowItWorks() {
  return (
    <PageLayout>
      <Badge color="violet">How It Works</Badge>
      <H1>Three steps to reclaim your SOL</H1>
      <Lead>Solint scans your Solana wallet for empty token accounts and helps you close them — returning the locked SOL rent directly to you.</Lead>

      <Step n="1" title="Connect your wallet" desc="Connect your Phantom wallet with one click. We request read-only access first — no signing required until you decide to reclaim." />
      <Step n="2" title="Scan for empty accounts" desc="Solint scans all SPL Token and Token-2022 accounts owned by your wallet. Any account with a zero token balance is eligible to be closed and its rent returned." />
      <Step n="3" title="Select and reclaim" desc="Choose which accounts to close. Review the exact SOL you'll receive minus our 3% protocol fee. Sign one transaction in Phantom — done." />

      <Divider/>

      <Section title="What is SOL rent?">
        Every account on Solana requires a small deposit of SOL to exist on-chain — this is called rent. When you receive tokens, token accounts are created automatically and SOL is locked as rent. When you no longer hold those tokens, the accounts remain open and your SOL stays locked — until you close them.
      </Section>

      <Section title="How much can I reclaim?">
        Each empty token account holds approximately 0.002 SOL (2,039,280 lamports) in rent. If you've interacted with many tokens, NFTs, or DeFi protocols, you could have dozens of empty accounts — meaning potentially 0.1 SOL or more locked and waiting to be returned.
      </Section>

      <Card>
        <p style={{color:'rgba(255,255,255,0.55)',fontSize:15,margin:0,lineHeight:1.7}}>
          <span style={{color:'#c4b5fd',fontWeight:600}}>Security note:</span> Solint is fully non-custodial. We never hold your private keys or funds. All transactions are signed locally in your wallet and broadcast directly to the Solana network.
        </p>
      </Card>
    </PageLayout>
  )
}
