import PageLayout from './PageLayout'
import { H1, Lead, Section, Badge, Divider, Card } from './components'

export default function Terms() {
  return (
    <PageLayout>
      <Badge color="amber">Terms of Service</Badge>
      <H1>Terms of Service</H1>
      <Lead>Last updated: April 2025. Please read these terms carefully before using Solint.</Lead>

      <Section title="Acceptance of Terms">
        By connecting your wallet and using Solint, you agree to these Terms of Service. If you do not agree, please do not use the service.
      </Section>

      <Section title="Description of Service">
        Solint is a non-custodial web application that helps Solana wallet holders identify and close empty token accounts to reclaim locked SOL rent. The service charges a 3% fee on successfully reclaimed SOL.
      </Section>

      <Section title="User Responsibilities">
        You are solely responsible for all transactions you sign and submit. Solint presents transactions for your review before any signing occurs. By signing a transaction, you confirm that you have reviewed and approve the transaction contents as shown by your wallet.
      </Section>

      <Divider/>

      <Card>
        <p style={{color:'#fbbf24',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>⚠ Important Disclaimer</p>
        <p style={{color:'rgba(255,255,255,0.55)',fontSize:14,margin:0,lineHeight:1.7}}>
          Blockchain transactions are irreversible. Once a token account is closed and SOL is reclaimed, this action cannot be undone. Solint is provided "as is" without warranty of any kind. Use at your own risk.
        </p>
      </Card>

      <Section title="Fees">
        Solint charges a 3% protocol fee on the total SOL reclaimed in each transaction. This fee is deducted automatically within the same transaction. Scanning your wallet is always free. No fee is charged if a transaction fails.
      </Section>

      <Section title="Limitation of Liability">
        Solint and its contributors shall not be liable for any loss of funds, data, or any other damages arising from use of the service. You acknowledge that interacting with blockchain applications carries inherent risks.
      </Section>

      <Section title="Changes to Terms">
        We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
      </Section>
    </PageLayout>
  )
}
