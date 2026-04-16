import PageLayout from './PageLayout'
import { H1, Lead, Section, Badge, Divider } from './components'

export default function Privacy() {
  return (
    <PageLayout>
      <Badge color="amber">Privacy Policy</Badge>
      <H1>Privacy Policy</H1>
      <Lead>Last updated: April 2025. Solint is designed to collect as little data as possible.</Lead>

      <Section title="Data We Collect">
        Solint does not collect personal information. When you use the app, your wallet address is used only to query public on-chain data from the Solana blockchain. We do not store wallet addresses, transaction history, or any identifying information on our servers.
      </Section>

      <Section title="On-Chain Data">
        All blockchain data queried by Solint (token account balances, account ownership) is public information on the Solana network. Anyone can query this data independently.
      </Section>

      <Section title="Analytics">
        We do not use third-party analytics services, tracking pixels, or cookies that identify individual users. We may collect aggregate, anonymous usage statistics (such as total number of sessions) to improve the product.
      </Section>

      <Divider/>

      <Section title="Third-Party Services">
        Solint uses Helius as an RPC provider to query Solana blockchain data. Helius may log RPC requests in accordance with their own privacy policy. We recommend reviewing Helius's privacy policy at helius.dev.
      </Section>

      <Section title="Wallet Security">
        Solint never asks for your private key, seed phrase, or any sensitive wallet credentials. All wallet interactions are handled entirely by your browser extension (Phantom). We have no access to your keys or funds.
      </Section>

      <Section title="Contact">
        If you have questions about this privacy policy, please reach out via our GitHub repository or community channels.
      </Section>
    </PageLayout>
  )
}
