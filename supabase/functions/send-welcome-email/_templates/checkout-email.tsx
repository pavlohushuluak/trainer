
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface CheckoutEmailProps {
  userName: string
  planName: string
  amount: string
  interval: string
  trialEndDate?: string
  dashboardUrl?: string
}

export const CheckoutEmail = ({
  userName,
  planName,
  amount,
  interval,
  trialEndDate,
  dashboardUrl = "https://tiertrainer24.com/dashboard"
}: CheckoutEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Checkout erfolgreich - Dein TierTrainer-Abo ist aktiviert!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Checkout erfolgreich!</Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        <Text style={text}>
          <strong>Willkommen im TierTrainer-Team! 🚀</strong>
        </Text>
        
        <Text style={text}>
          Dein <strong>{planName}</strong> Abo ist erfolgreich aktiviert worden. 
          Du hast noch {trialEndDate || 'bis zum Ende der Testzeit'} kostenloses Training, 
          bevor dein Abo für {amount}€ pro {interval} startet.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            🏆 Zum Dashboard
          </Button>
        </Section>

        <Section style={detailsBox}>
          <Text style={detailsTitle}>💳 Deine Abo-Details</Text>
          <Text style={detailsText}>
            <strong>Plan:</strong> {planName}<br/>
            <strong>Preis:</strong> {amount}€ pro {interval}<br/>
            <strong>Testphase endet:</strong> {trialEndDate || 'in 7 Tagen'}<br/>
            <strong>Status:</strong> Aktiv ✅
          </Text>
        </Section>

        <Text style={text}>
          Bei Fragen oder Problemen sind wir jederzeit für dich da. Antworte einfach auf diese E-Mail.
        </Text>

        <Text style={text}>
          Viel Erfolg beim Training!<br/>
          Dein TierTrainer-Team 🐕🐱
        </Text>

        <Text style={footer}>
          TierTrainer24 - Für das beste Miteinander mit deinem Tier<br/>
          <Link href="https://tiertrainer24.com/impressum" style={footerLink}>Impressum</Link> | 
          <Link href="https://tiertrainer24.com/datenschutz" style={footerLink}>Datenschutz</Link> | 
          <Link href="https://tiertrainer24.com/agb" style={footerLink}>AGB</Link> | 
          <Link href="https://tiertrainer24.com/support" style={footerLink}>Support</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 30px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const detailsBox = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #0ea5e9',
  margin: '25px 0',
}

const detailsTitle = {
  color: '#0369a1',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const detailsText = {
  color: '#0369a1',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '15px 30px',
  fontWeight: 'bold',
}

const footer = {
  color: '#898989',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
}

const footerLink = {
  color: '#898989',
  textDecoration: 'none',
  margin: '0 5px',
}
