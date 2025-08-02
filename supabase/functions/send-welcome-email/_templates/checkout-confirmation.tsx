
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

interface CheckoutConfirmationProps {
  userName: string
  planName: string
  amount: string
  interval: string
  trialEndDate: string
  dashboardUrl: string
}

export const CheckoutConfirmationEmail = ({
  userName,
  planName,
  amount,
  interval,
  trialEndDate,
  dashboardUrl,
}: CheckoutConfirmationProps) => (
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
          <strong>Perfekt! Dein TierTrainer-Abo ist jetzt aktiviert! 🐾</strong>
        </Text>
        
        <Section style={summaryBox}>
          <Text style={summaryTitle}>Deine Bestellung:</Text>
          <Text style={summaryItem}>
            <strong>Paket:</strong> {planName}<br/>
            <strong>Preis:</strong> {amount} €/{interval}<br/>
            <strong>Testphase bis:</strong> {trialEndDate}<br/>
            <strong>Nächste Abrechnung:</strong> {trialEndDate}
          </Text>
        </Section>

        <Text style={text}>
          Du kannst jetzt sofort mit dem Training beginnen! Die ersten 7 Tage sind völlig kostenlos.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            🚀 Zum Dashboard
          </Button>
        </Section>

        <Section style={legalBox}>
          <Text style={legalTitle}>⚖️ Wichtige Informationen</Text>
          <Text style={legalText}>
            <strong>14-Tage-Geld-zurück-Garantie:</strong> Du kannst innerhalb von 14 Tagen nach dem Kauf ohne Angabe von Gründen kündigen und erhältst dein Geld vollständig zurück.<br/><br/>
            <strong>Widerruf:</strong> Das Widerrufsrecht kann bis 14 Tage nach Vertragsschluss ausgeübt werden.<br/><br/>
            <strong>Kündigung:</strong> Jederzeit in deinem Account unter "Abo verwalten" möglich.<br/><br/>
            <strong>Rechnungen:</strong> Alle Rechnungen findest du in deinem Account-Bereich.
          </Text>
        </Section>

        <Text style={highlightBox}>
          <strong>💡 Tipp:</strong> Lege jetzt das Profil deines Tieres an und starte mit dem ersten Training. 
          Dein vierbeiniger Freund wird begeistert sein!
        </Text>

        <Text style={text}>
          Falls du Fragen hast, antworte einfach auf diese E-Mail. Wir helfen gerne!
        </Text>

        <Text style={text}>
          Viel Erfolg beim Training!<br/>
          Dein TierTrainer-Team 💚
        </Text>

        <Text style={footer}>
          TierTrainer24 - Für das beste Miteinander mit deinem Tier<br/>
          <Link href="https://tiertrainer24.com/impressum" style={footerLink}>Impressum</Link> | 
          <Link href="https://tiertrainer24.com/datenschutz" style={footerLink}>Datenschutz</Link> | 
          <Link href="https://tiertrainer24.com/agb" style={footerLink}>AGB</Link> | 
          <Link href="https://tiertrainer24.com/widerruf" style={footerLink}>Widerrufsrecht</Link> | 
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

const summaryBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  margin: '25px 0',
}

const summaryTitle = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const summaryItem = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const legalBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #fbbf24',
  margin: '25px 0',
}

const legalTitle = {
  color: '#92400e',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const legalText = {
  color: '#92400e',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const highlightBox = {
  ...text,
  backgroundColor: '#dbeafe',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #93c5fd',
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
