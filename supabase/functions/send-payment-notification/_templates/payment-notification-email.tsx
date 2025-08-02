
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

interface PaymentNotificationEmailProps {
  userName: string
  paymentType: 'payment_failed' | 'payment_retry' | 'payment_method_required'
  amount: number
  currency: string
  nextRetry?: string
  failureReason?: string
}

export const PaymentNotificationEmail = ({
  userName,
  paymentType,
  amount,
  currency,
  nextRetry,
  failureReason,
}: PaymentNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {paymentType === 'payment_failed' && 'Zahlungsproblem bei Ihrem TierTrainer-Abo'}
      {paymentType === 'payment_retry' && 'Zahlung wird erneut versucht'}
      {paymentType === 'payment_method_required' && 'Zahlungsmethode aktualisieren erforderlich'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {paymentType === 'payment_failed' && '⚠️ Zahlungsproblem'}
          {paymentType === 'payment_retry' && '🔄 Zahlung wird wiederholt'}
          {paymentType === 'payment_method_required' && '💳 Zahlungsmethode aktualisieren'}
        </Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        {paymentType === 'payment_failed' && (
          <>
            <Text style={text}>
              Bei der Abrechnung Ihres TierTrainer-Abonnements ist ein Problem aufgetreten.
            </Text>
            
            <Section style={errorBox}>
              <Text style={errorTitle}>💳 Zahlungsdetails</Text>
              <Text style={errorDetails}>
                <strong>Betrag:</strong> {amount ? `${(amount / 100).toFixed(2)} ${currency}` : 'Siehe Rechnung'}<br/>
                <strong>Problem:</strong> {failureReason || 'Zahlung konnte nicht verarbeitet werden'}<br/>
                {nextRetry && <><strong>Nächster Versuch:</strong> {new Date(nextRetry).toLocaleDateString('de-DE')}<br/></>}
                <strong>Status:</strong> Zahlung fehlgeschlagen
              </Text>
            </Section>
            
            <Text style={text}>
              <strong>Was Sie jetzt tun können:</strong>
            </Text>
            
            <Text style={bulletList}>
              • Überprüfen Sie Ihr Konto auf ausreichende Deckung<br/>
              • Kontrollieren Sie die Gültigkeit Ihrer Kreditkarte<br/>
              • Aktualisieren Sie Ihre Zahlungsmethode<br/>
              • Kontaktieren Sie bei Fragen unseren Support
            </Text>
          </>
        )}

        {paymentType === 'payment_retry' && (
          <>
            <Text style={text}>
              Ihre letzte Zahlung konnte nicht verarbeitet werden. Wir versuchen es automatisch erneut.
            </Text>
            
            <Section style={retryBox}>
              <Text style={retryTitle}>🔄 Erneuter Zahlungsversuch</Text>
              <Text style={retryDetails}>
                <strong>Betrag:</strong> {amount ? `${(amount / 100).toFixed(2)} ${currency}` : 'Siehe Rechnung'}<br/>
                {nextRetry && <><strong>Nächster Versuch:</strong> {new Date(nextRetry).toLocaleDateString('de-DE')}<br/></>}
                <strong>Versuche verbleibend:</strong> 2-3 weitere Versuche
              </Text>
            </Section>
            
            <Text style={text}>
              Um sicherzustellen, dass Ihr Abo aktiv bleibt, empfehlen wir Ihnen, Ihre Zahlungsdaten zu überprüfen.
            </Text>
          </>
        )}

        {paymentType === 'payment_method_required' && (
          <>
            <Text style={text}>
              Ihre aktuelle Zahlungsmethode ist nicht mehr gültig. Bitte aktualisieren Sie diese, um Ihr Abo fortzusetzen.
            </Text>
            
            <Section style={warningBox}>
              <Text style={warningTitle}>⚠️ Handlung erforderlich</Text>
              <Text style={warningDetails}>
                <strong>Problem:</strong> Zahlungsmethode ungültig oder abgelaufen<br/>
                <strong>Auswirkung:</strong> Abo wird pausiert, bis Zahlung erfolgt<br/>
                <strong>Lösung:</strong> Neue Zahlungsmethode hinterlegen
              </Text>
            </Section>
            
            <Text style={text}>
              Ihr Zugang zu TierTrainer wird eingeschränkt, bis eine gültige Zahlungsmethode hinterlegt ist.
            </Text>
          </>
        )}

        <Section style={buttonContainer}>
          <Button style={button} href="https://tiertrainer24.com/mein-tiertraining?tab=subscription">
            💳 Zahlungsmethode aktualisieren
          </Button>
        </Section>

        <Text style={helpBox}>
          <strong>💡 Benötigen Sie Hilfe?</strong><br/>
          Unser Support-Team hilft Ihnen gerne bei Zahlungsproblemen. 
          Kontaktieren Sie uns einfach über unseren Support-Bereich.
        </Text>

        <Section style={buttonContainer}>
          <Button style={{...button, backgroundColor: '#6b7280'}} href="https://tiertrainer24.com/support">
            🎫 Support kontaktieren
          </Button>
        </Section>

        <Text style={text}>
          Vielen Dank für Ihr Verständnis!<br/>
          Ihr TierTrainer-Team 🐾
        </Text>

        <Text style={footer}>
          TierTrainer24 - Für das beste Miteinander mit Ihrem Tier<br/>
          <Link href="https://tiertrainer24.com/impressum" style={footerLink}>Impressum</Link> | 
          <Link href="https://tiertrainer24.com/datenschutz" style={footerLink}>Datenschutz</Link> | 
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

const errorBox = {
  backgroundColor: '#fef2f2',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #f87171',
  margin: '25px 0',
}

const errorTitle = {
  color: '#dc2626',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const errorDetails = {
  color: '#dc2626',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const retryBox = {
  backgroundColor: '#fffbeb',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #f59e0b',
  margin: '25px 0',
}

const retryTitle = {
  color: '#d97706',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const retryDetails = {
  color: '#d97706',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #fbbf24',
  margin: '25px 0',
}

const warningTitle = {
  color: '#92400e',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const warningDetails = {
  color: '#92400e',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const bulletList = {
  ...text,
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '5px',
  borderLeft: '4px solid #6b7280',
}

const helpBox = {
  ...text,
  backgroundColor: '#e0f2fe',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #0288d1',
  color: '#01579b',
  margin: '25px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#dc2626',
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
