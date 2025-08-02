
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

interface WelcomeEmailProps {
  userName: string
  planName: string
  trialEndDate?: string
  dashboardUrl?: string
}

export const WelcomeEmail = ({
  userName,
  planName,
  trialEndDate,
  dashboardUrl = "https://tiertrainer24.com/dashboard"
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>🐾 Willkommen bei TierTrainer - Dein kostenloses Training startet jetzt!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🐾 Willkommen bei TierTrainer!</Heading>
        
        <Text style={text}>
          Hallo {userName},
        </Text>
        
        <Text style={text}>
          <strong>Dein Tier wird es dir danken! 💛</strong>
        </Text>
        
        <Text style={text}>
          Du hast erfolgreich dein <strong>{planName}</strong> Training gestartet. 
          Die nächsten 7 Tage kannst du TierTrainer völlig kostenlos nutzen und schauen, 
          wie sehr sich dein Tier darüber freut!
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            🚀 Jetzt mit dem Training starten
          </Button>
        </Section>

        <Text style={text}>
          <strong>Was dich erwartet:</strong>
        </Text>
        
        <Section style={featuresBox}>
          <Text style={featuresText}>
            • KI-Trainer für alle Tierarten<br/>
            • Individuelle Trainingspläne<br/>
            • Text, Sprache & Bilder<br/>
            • Sofortige Hilfe bei Problemen<br/>
            • Liebevolle Unterstützung 24/7
          </Text>
        </Section>

        <Section style={trialBox}>
          <Text style={trialText}>
            <strong>🗓️ Wichtiger Hinweis:</strong><br/>
            Deine kostenlose Testphase endet am <strong>{trialEndDate || 'in 7 Tagen'}</strong>. 
            Falls du vorher kündigst, entstehen dir keine Kosten.
          </Text>
        </Section>

        <Section style={legalBox}>
          <Text style={legalTitle}>📋 Rechtliche Hinweise</Text>
          <Text style={legalText}>
            <strong>Widerrufsrecht:</strong> Du kannst dein Abo innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen und erhältst dein Geld zurück.<br/>
            <strong>Kündigung:</strong> Jederzeit in deinem Account möglich.<br/>
            <strong>Datenschutz:</strong> Deine Daten sind bei uns sicher und werden nicht an Dritte weitergegeben.
          </Text>
        </Section>

        <Text style={text}>
          Bei Fragen sind wir jederzeit für dich da. Antworte einfach auf diese E-Mail.
        </Text>

        <Text style={text}>
          Viel Freude beim Training!<br/>
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

const featuresBox = {
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '5px',
  borderLeft: '4px solid #22c55e',
  margin: '16px 0',
}

const featuresText = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const trialBox = {
  backgroundColor: '#dbeafe',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #93c5fd',
  margin: '25px 0',
}

const trialText = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const legalBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  margin: '25px 0',
}

const legalTitle = {
  color: '#374151',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const legalText = {
  color: '#374151',
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
