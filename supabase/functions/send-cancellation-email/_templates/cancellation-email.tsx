
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

interface CancellationEmailProps {
  userName: string
  isRefund: boolean
  refundAmount: number
  subscriptionEnd?: string
  cancellationReason: string
}

export const CancellationEmail = ({
  userName,
  isRefund,
  refundAmount,
  subscriptionEnd,
  cancellationReason,
}: CancellationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {isRefund 
        ? `💰 Rückerstattung von €${(refundAmount / 100).toFixed(2)} bestätigt`
        : '📅 Ihre Kündigung wurde bestätigt'
      }
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {isRefund ? '💰 Rückerstattung bestätigt' : '📅 Kündigung bestätigt'}
        </Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        {isRefund ? (
          <>
            <Text style={text}>
              Ihre Kündigung innerhalb der 14-Tage-Geld-zurück-Garantie wurde erfolgreich verarbeitet.
            </Text>
            
            <Section style={refundBox}>
              <Text style={refundTitle}>💸 Rückerstattungsdetails</Text>
              <Text style={refundDetails}>
                <strong>Betrag:</strong> €{(refundAmount / 100).toFixed(2)}<br/>
                <strong>Grund:</strong> {cancellationReason}<br/>
                <strong>Bearbeitungsdauer:</strong> 3-5 Werktage<br/>
                <strong>Ihr Zugang:</strong> Sofort beendet
              </Text>
            </Section>
          </>
        ) : (
          <>
            <Text style={text}>
              Ihre Kündigung wurde erfolgreich verarbeitet. Ihr Zugang bleibt bis zum Ende der aktuellen Abrechnungsperiode aktiv.
            </Text>
            
            <Section style={cancellationBox}>
              <Text style={cancellationTitle}>📋 Kündigungsdetails</Text>
              <Text style={cancellationDetails}>
                <strong>Grund:</strong> {cancellationReason}<br/>
                <strong>Zugang bis:</strong> {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Periodenende'}<br/>
                <strong>Status:</strong> Gekündigt zum Periodenende
              </Text>
            </Section>
          </>
        )}

        <Text style={text}>
          <strong>Was passiert jetzt?</strong>
        </Text>
        
        <Text style={bulletList}>
          {isRefund ? (
            <>
              • Ihre Rückerstattung wird in 3-5 Werktagen bearbeitet<br/>
              • Alle Premium-Features wurden sofort deaktiviert<br/>
              • Ihre Trainingspläne wurden archiviert<br/>
              • Sie können sich jederzeit wieder anmelden
            </>
          ) : (
            <>
              • Ihr Zugang bleibt bis {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'zum Periodenende'} aktiv<br/>
              • Keine weitere Abrechnung<br/>
              • Ihre Daten bleiben gespeichert<br/>
              • Reaktivierung jederzeit möglich
            </>
          )}
        </Text>

        {isRefund && (
          <Section style={guaranteeBox}>
            <Text style={guaranteeText}>
              <strong>🛡️ 14-Tage-Geld-zurück-Garantie</strong><br/>
              Sie haben von unserer Geld-zurück-Garantie Gebrauch gemacht. 
              Wir hoffen, Sie haben TierTrainer24 trotzdem gerne ausprobiert!
            </Text>
          </Section>
        )}

        <Text style={text}>
          Falls Sie Fragen haben, antworten Sie einfach auf diese E-Mail oder kontaktieren Sie unseren Support.
        </Text>

        <Text style={text}>
          {isRefund ? 'Vielen Dank, dass Sie TierTrainer24 ausprobiert haben!' : 'Schade, dass Sie uns verlassen!'}<br/>
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

const refundBox = {
  backgroundColor: '#d1fae5',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #10b981',
  margin: '25px 0',
}

const refundTitle = {
  color: '#065f46',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const refundDetails = {
  color: '#065f46',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const cancellationBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  margin: '25px 0',
}

const cancellationTitle = {
  color: '#374151',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const cancellationDetails = {
  color: '#374151',
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

const guaranteeBox = {
  backgroundColor: '#dbeafe',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #3b82f6',
  margin: '25px 0',
}

const guaranteeText = {
  color: '#1e40af',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
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
