/**
 * @fileoverview Manual Support Response Email Template
 */

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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ManualSupportEmailProps {
  userName: string;
  userMessage: string;
  subject: string;
  adminResponse: string;
  priority: string;
  requestId: string;
  language?: string;
}

export const ManualSupportEmail = ({
  userName,
  userMessage,
  subject,
  adminResponse,
  priority,
  requestId,
  language = 'de',
}: ManualSupportEmailProps) => {
  const shortId = requestId.slice(-8);

  const content = language === 'en' ? {
    previewText: `Response to your support request: ${subject}`,
    title: '💬 Support Team Response',
    greeting: `Hello ${userName},`,
    intro: 'Our support team has reviewed your request and provided a detailed response:',
    yourRequest: 'Your Request',
    priority: 'Priority',
    requestNumber: 'Request No.',
    subject: 'Subject',
    yourMessage: 'Your Message',
    responseTitle: '✅ Our Response',
    furtherHelp: 'Need More Help?',
    furtherHelpText: 'If you have additional questions or need further assistance, you can submit a new support request at any time.',
    viewSupport: 'View Support Center',
    thanksTitle: 'Thank You',
    thanksText: 'We appreciate your patience. Our goal is to provide you with the best possible support experience.',
    footer: 'This is an automated notification. Please do not reply to this email.',
    copyright: '© 2025 TierTrainer24 - Professional Pet Training Platform',
    priorities: {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      urgent: 'Urgent'
    }
  } : {
    previewText: `Antwort auf Ihre Support-Anfrage: ${subject}`,
    title: '💬 Antwort vom Support-Team',
    greeting: `Hallo ${userName},`,
    intro: 'Unser Support-Team hat Ihre Anfrage geprüft und eine detaillierte Antwort bereitgestellt:',
    yourRequest: 'Ihre Anfrage',
    priority: 'Priorität',
    requestNumber: 'Anfrage-Nr.',
    subject: 'Betreff',
    yourMessage: 'Ihre Nachricht',
    responseTitle: '✅ Unsere Antwort',
    furtherHelp: 'Weitere Hilfe benötigt?',
    furtherHelpText: 'Falls Sie weitere Fragen haben oder zusätzliche Unterstützung benötigen, können Sie jederzeit eine neue Support-Anfrage stellen.',
    viewSupport: 'Support-Center öffnen',
    thanksTitle: 'Vielen Dank',
    thanksText: 'Wir schätzen Ihre Geduld. Unser Ziel ist es, Ihnen die bestmögliche Support-Erfahrung zu bieten.',
    footer: 'Dies ist eine automatische Benachrichtigung. Bitte antworten Sie nicht auf diese E-Mail.',
    copyright: '© 2025 TierTrainer24 - Professionelle Haustiertraining-Plattform',
    priorities: {
      low: 'Niedrig',
      normal: 'Normal',
      high: 'Hoch',
      urgent: 'Dringend'
    }
  };

  const priorityColors = {
    low: '#6b7280',
    normal: '#3b82f6',
    high: '#f97316',
    urgent: '#ef4444'
  };

  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal;

  return (
    <Html>
      <Head />
      <Preview>{content.previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <div style={header}>
            <Heading style={h1}>{content.title}</Heading>
          </div>

          {/* Greeting */}
          <Text style={text}>{content.greeting}</Text>
          <Text style={text}>{content.intro}</Text>

          {/* Request Details */}
          <Section style={requestBox}>
            <Text style={sectionTitle}>{content.yourRequest}</Text>
            <table style={{ width: '100%', marginTop: '10px' }}>
              <tr>
                <td style={labelCell}>{content.requestNumber}:</td>
                <td style={valueCell}>#{shortId}</td>
              </tr>
              <tr>
                <td style={labelCell}>{content.subject}:</td>
                <td style={valueCell}>{subject}</td>
              </tr>
              <tr>
                <td style={labelCell}>{content.priority}:</td>
                <td style={{ ...valueCell, color: priorityColor, fontWeight: 'bold' }}>
                  {content.priorities[priority as keyof typeof content.priorities] || priority}
                </td>
              </tr>
            </table>
            
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <Text style={{ ...text, margin: '0', fontSize: '14px', color: '#6b7280' }}>
                {content.yourMessage}:
              </Text>
              <Text style={{ ...text, margin: '8px 0 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {userMessage}
              </Text>
            </div>
          </Section>

          {/* Admin Response */}
          <Section style={responseBox}>
            <Text style={responseTitle}>{content.responseTitle}</Text>
            <Text style={responseText}>{adminResponse}</Text>
          </Section>

          {/* CTA Button */}
          <div style={buttonContainer}>
            <Link href="https://tiertrainer24.com/support" style={button}>
              {content.viewSupport}
            </Link>
          </div>

          {/* Further Help Section */}
          <Section style={helpBox}>
            <Text style={{ ...text, margin: '0' }}>
              <strong>{content.furtherHelp}</strong>
            </Text>
            <Text style={{ ...text, margin: '8px 0 0 0', fontSize: '14px' }}>
              {content.furtherHelpText}
            </Text>
          </Section>

          {/* Thanks Section */}
          <Section style={thanksBox}>
            <Text style={{ ...text, margin: '0', fontWeight: 'bold', color: '#9333ea' }}>
              {content.thanksTitle}
            </Text>
            <Text style={{ ...text, margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {content.thanksText}
            </Text>
          </Section>

          {/* Footer */}
          <div style={footer}>
            <Text style={footerText}>{content.footer}</Text>
            <Text style={footerText}>{content.copyright}</Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  padding: '40px',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '600px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const header = {
  borderBottom: '3px solid #9333ea',
  paddingBottom: '20px',
  marginBottom: '30px',
};

const h1 = {
  color: '#9333ea',
  fontFamily: 'Arial, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const sectionTitle = {
  color: '#111827',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const requestBox = {
  backgroundColor: '#faf5ff',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #e9d5ff',
  margin: '25px 0',
};

const labelCell = {
  color: '#6b7280',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  padding: '6px 12px 6px 0',
  fontWeight: 'bold',
  verticalAlign: 'top',
  width: '30%',
};

const valueCell = {
  color: '#374151',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top',
};

const responseBox = {
  backgroundColor: '#f0f9ff',
  padding: '24px',
  borderRadius: '8px',
  border: '2px solid #9333ea',
  margin: '25px 0',
  boxShadow: '0 2px 4px rgba(147, 51, 234, 0.1)',
};

const responseTitle = {
  color: '#9333ea',
  fontFamily: 'Arial, sans-serif',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const responseText = {
  color: '#1f2937',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#9333ea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px -1px rgba(147, 51, 234, 0.3)',
};

const helpBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #fde047',
  margin: '20px 0',
};

const thanksBox = {
  backgroundColor: '#faf5ff',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e9d5ff',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  marginTop: '30px',
};

const footerText = {
  color: '#9ca3af',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

