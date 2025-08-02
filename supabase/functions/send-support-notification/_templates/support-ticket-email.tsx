
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

interface SupportTicketEmailProps {
  emailType: 'ticket_created' | 'ticket_response' | 'ticket_resolved'
  userName: string
  ticketId: string
  ticketSubject: string
  adminMessage?: string
  ticketStatus?: string
}

export const SupportTicketEmail = ({
  emailType,
  userName,
  ticketId,
  ticketSubject,
  adminMessage,
  ticketStatus,
}: SupportTicketEmailProps) => {
  const shortTicketId = ticketId.slice(-8);
  
  return (
    <Html>
      <Head />
      <Preview>
        {emailType === 'ticket_created' && `Support-Ticket #${shortTicketId} wurde erstellt`}
        {emailType === 'ticket_response' && `Neue Antwort auf Ihr Support-Ticket #${shortTicketId}`}
        {emailType === 'ticket_resolved' && `Support-Ticket #${shortTicketId} wurde gelöst`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {emailType === 'ticket_created' && '🎫 Support-Ticket erstellt'}
            {emailType === 'ticket_response' && '💬 Neue Antwort erhalten'}
            {emailType === 'ticket_resolved' && '✅ Ticket gelöst'}
          </Heading>
          
          <Text style={text}>
            Hallo {userName},
          </Text>
          
          {emailType === 'ticket_created' && (
            <>
              <Text style={text}>
                Ihr Support-Ticket wurde erfolgreich erstellt. Unser Team wird sich schnellstmöglich um Ihr Anliegen kümmern.
              </Text>
              
              <Section style={ticketBox}>
                <Text style={ticketTitle}>📋 Ticket-Details</Text>
                <Text style={ticketDetails}>
                  <strong>Ticket-Nr.:</strong> #{shortTicketId}<br/>
                  <strong>Betreff:</strong> {ticketSubject}<br/>
                  <strong>Status:</strong> Offen<br/>
                  <strong>Antwortzeit:</strong> Normalerweise innerhalb von 24 Stunden
                </Text>
              </Section>
              
              <Text style={text}>
                Sie können den Status Ihres Tickets jederzeit in Ihrem Support-Bereich einsehen.
              </Text>
            </>
          )}

          {emailType === 'ticket_response' && adminMessage && (
            <>
              <Text style={text}>
                Unser Support-Team hat auf Ihr Ticket geantwortet:
              </Text>
              
              <Section style={ticketBox}>
                <Text style={ticketTitle}>📋 Ticket #{shortTicketId}</Text>
                <Text style={ticketDetails}>
                  <strong>Betreff:</strong> {ticketSubject}<br/>
                  <strong>Status:</strong> {ticketStatus || 'In Bearbeitung'}
                </Text>
              </Section>

              <Section style={responseBox}>
                <Text style={responseTitle}>💬 Antwort unseres Teams:</Text>
                <Text style={responseText}>{adminMessage}</Text>
              </Section>
              
              <Text style={text}>
                Falls Sie weitere Fragen haben, können Sie direkt auf diese E-Mail antworten oder Ihr Ticket über den Support-Bereich verwalten.
              </Text>
            </>
          )}

          {emailType === 'ticket_resolved' && (
            <>
              <Text style={text}>
                Großartig! Ihr Support-Ticket wurde erfolgreich gelöst.
              </Text>
              
              <Section style={resolvedBox}>
                <Text style={resolvedTitle}>✅ Gelöstes Ticket</Text>
                <Text style={resolvedDetails}>
                  <strong>Ticket-Nr.:</strong> #{shortTicketId}<br/>
                  <strong>Betreff:</strong> {ticketSubject}<br/>
                  <strong>Status:</strong> Gelöst<br/>
                  <strong>Gelöst am:</strong> {new Date().toLocaleDateString('de-DE')}
                </Text>
              </Section>
              
              <Text style={text}>
                <strong>Sind Sie zufrieden mit unserem Support?</strong><br/>
                Ihre Bewertung hilft uns, unseren Service zu verbessern.
              </Text>
              
              <Section style={buttonContainer}>
                <Button style={button} href={`https://tiertrainer24.com/support?feedback=${ticketId}`}>
                  💖 Bewertung abgeben
                </Button>
              </Section>
            </>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href="https://tiertrainer24.com/support">
              🎫 Support-Bereich öffnen
            </Button>
          </Section>

          <Text style={text}>
            Bei weiteren Fragen sind wir gerne für Sie da!<br/>
            Ihr TierTrainer-Support-Team 🐾
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
}

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

const ticketBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  margin: '25px 0',
}

const ticketTitle = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const ticketDetails = {
  color: '#333',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const responseBox = {
  backgroundColor: '#e3f2fd',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #2196f3',
  margin: '25px 0',
}

const responseTitle = {
  color: '#1565c0',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const responseText = {
  color: '#1565c0',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
}

const resolvedBox = {
  backgroundColor: '#e8f5e8',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #4caf50',
  margin: '25px 0',
}

const resolvedTitle = {
  color: '#2e7d32',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const resolvedDetails = {
  color: '#2e7d32',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
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
