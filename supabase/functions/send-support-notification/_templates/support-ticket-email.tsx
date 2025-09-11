
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
  language?: string
}

export const SupportTicketEmail = ({
  emailType,
  userName,
  ticketId,
  ticketSubject,
  adminMessage,
  ticketStatus,
  language = 'de',
}: SupportTicketEmailProps) => {
  const shortTicketId = ticketId.slice(-8);
  
  const content = language === 'en' ? {
    ticketCreated: `Support ticket #${shortTicketId} was created`,
    ticketResponse: `New response to your support ticket #${shortTicketId}`,
    ticketResolved: `Support ticket #${shortTicketId} was resolved`,
    ticketCreatedTitle: '🎫 Support Ticket Created',
    ticketResponseTitle: '💬 New Response Received',
    ticketResolvedTitle: '✅ Ticket Resolved',
    greeting: `Hello ${userName},`,
    createdDescription: 'Your support ticket has been successfully created. Our team will address your concern as quickly as possible.',
    ticketDetails: '📋 Ticket Details',
    ticketNumber: 'Ticket No.:',
    subject: 'Subject:',
    status: 'Status:',
    responseTime: 'Response Time:',
    openStatus: 'Open',
    responseTimeValue: 'Usually within 24 hours',
    statusCheck: 'You can check the status of your ticket at any time in your support area.',
    teamResponse: 'Our support team has responded to your ticket:',
    ticket: 'Ticket',
    inProgress: 'In Progress',
    teamResponseTitle: '💬 Response from our team:',
    furtherQuestions: 'If you have further questions, you can reply directly to this email or manage your ticket through the support area.',
    ticketResolvedDescription: 'Your support ticket has been successfully resolved. Thank you for your patience.',
    resolvedStatus: 'Resolved',
    resolvedDate: 'Resolution Date:',
    feedback: 'We hope we were able to help you. If you have any feedback about our support service, please let us know.',
    viewTicket: 'View Ticket',
    contactSupport: 'Contact Support',
    footer: 'This is an automated message. Please do not reply to this email.',
    copyright: '© 2024 TierTrainer24 - Professional Pet Training Platform'
  } : {
    ticketCreated: `Support-Ticket #${shortTicketId} wurde erstellt`,
    ticketResponse: `Neue Antwort auf Ihr Support-Ticket #${shortTicketId}`,
    ticketResolved: `Support-Ticket #${shortTicketId} wurde gelöst`,
    ticketCreatedTitle: '🎫 Support-Ticket erstellt',
    ticketResponseTitle: '💬 Neue Antwort erhalten',
    ticketResolvedTitle: '✅ Ticket gelöst',
    greeting: `Hallo ${userName},`,
    createdDescription: 'Ihr Support-Ticket wurde erfolgreich erstellt. Unser Team wird sich schnellstmöglich um Ihr Anliegen kümmern.',
    ticketDetails: '📋 Ticket-Details',
    ticketNumber: 'Ticket-Nr.:',
    subject: 'Betreff:',
    status: 'Status:',
    responseTime: 'Antwortzeit:',
    openStatus: 'Offen',
    responseTimeValue: 'Normalerweise innerhalb von 24 Stunden',
    statusCheck: 'Sie können den Status Ihres Tickets jederzeit in Ihrem Support-Bereich einsehen.',
    teamResponse: 'Unser Support-Team hat auf Ihr Ticket geantwortet:',
    ticket: 'Ticket',
    inProgress: 'In Bearbeitung',
    teamResponseTitle: '💬 Antwort unseres Teams:',
    furtherQuestions: 'Falls Sie weitere Fragen haben, können Sie direkt auf diese E-Mail antworten oder Ihr Ticket über den Support-Bereich verwalten.',
    ticketResolvedDescription: 'Ihr Support-Ticket wurde erfolgreich gelöst. Vielen Dank für Ihre Geduld.',
    resolvedStatus: 'Gelöst',
    resolvedDate: 'Lösungsdatum:',
    feedback: 'Wir hoffen, dass wir Ihnen helfen konnten. Falls Sie Feedback zu unserem Support-Service haben, lassen Sie es uns gerne wissen.',
    viewTicket: 'Ticket anzeigen',
    contactSupport: 'Support kontaktieren',
    footer: 'Dies ist eine automatisierte Nachricht. Bitte antworten Sie nicht auf diese E-Mail.',
    copyright: '© 2024 TierTrainer24 - Professionelle Haustiertraining-Plattform'
  };
  
  return (
    <Html>
      <Head />
      <Preview>
        {emailType === 'ticket_created' && content.ticketCreated}
        {emailType === 'ticket_response' && content.ticketResponse}
        {emailType === 'ticket_resolved' && content.ticketResolved}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {emailType === 'ticket_created' && content.ticketCreatedTitle}
            {emailType === 'ticket_response' && content.ticketResponseTitle}
            {emailType === 'ticket_resolved' && content.ticketResolvedTitle}
          </Heading>
          
          <Text style={text}>
            {content.greeting}
          </Text>
          
          {emailType === 'ticket_created' && (
            <>
              <Text style={text}>
                {content.createdDescription}
              </Text>
              
              <Section style={ticketBox}>
                <Text style={ticketTitle}>{content.ticketDetails}</Text>
                <Text style={ticketDetails}>
                  <strong>{content.ticketNumber}</strong> #{shortTicketId}<br/>
                  <strong>{content.subject}</strong> {ticketSubject}<br/>
                  <strong>{content.status}</strong> {content.openStatus}<br/>
                  <strong>{content.responseTime}</strong> {content.responseTimeValue}
                </Text>
              </Section>
              
              <Text style={text}>
                {content.statusCheck}
              </Text>
            </>
          )}

          {emailType === 'ticket_response' && adminMessage && (
            <>
              <Text style={text}>
                {content.teamResponse}
              </Text>
              
              <Section style={ticketBox}>
                <Text style={ticketTitle}>{content.ticket} #{shortTicketId}</Text>
                <Text style={ticketDetails}>
                  <strong>{content.subject}</strong> {ticketSubject}<br/>
                  <strong>{content.status}</strong> {ticketStatus || content.inProgress}
                </Text>
              </Section>

              <Section style={responseBox}>
                <Text style={responseTitle}>{content.teamResponseTitle}</Text>
                <Text style={responseText}>{adminMessage}</Text>
              </Section>
              
              <Text style={text}>
                {content.furtherQuestions}
              </Text>
            </>
          )}

          {emailType === 'ticket_resolved' && (
            <>
              <Text style={text}>
                {content.ticketResolvedDescription}
              </Text>
              
              <Section style={ticketBox}>
                <Text style={ticketTitle}>{content.ticket} #{shortTicketId}</Text>
                <Text style={ticketDetails}>
                  <strong>{content.subject}</strong> {ticketSubject}<br/>
                  <strong>{content.status}</strong> {content.resolvedStatus}<br/>
                  <strong>{content.resolvedDate}</strong> {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}
                </Text>
              </Section>
              
              <Text style={text}>
                {content.feedback}
              </Text>
            </>
          )}

          <div style={buttonContainer}>
            <Link href="https://tiertrainer24.com/support" style={button}>
              {content.viewTicket}
            </Link>
          </div>

          <div style={helpBox}>
            <Text style={text}>
              <strong>{language === 'en' ? 'Need help?' : 'Brauchen Sie Hilfe?'}</strong><br/>
              {language === 'en' ? 'Contact our support team for assistance.' : 'Kontaktieren Sie unser Support-Team für Hilfe.'}
            </Text>
          </div>

          <div style={footer}>
            <Text style={footer}>
              {content.footer}
            </Text>
            <Text style={footer}>
              {content.copyright}
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
};

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
