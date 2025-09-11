
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
  language?: string
}

export const PaymentNotificationEmail = ({
  userName,
  paymentType,
  amount,
  currency,
  nextRetry,
  failureReason,
  language = 'de',
}: PaymentNotificationEmailProps) => {
  const content = language === 'en' ? {
    paymentFailed: 'Payment problem with your TierTrainer subscription',
    paymentRetry: 'Payment will be retried',
    paymentMethodRequired: 'Payment method update required',
    paymentProblem: '⚠️ Payment Problem',
    paymentRetrying: '🔄 Payment Retrying',
    paymentMethodUpdate: '💳 Update Payment Method',
    greeting: `Hello ${userName},`,
    failedDescription: 'There was a problem processing your TierTrainer subscription payment.',
    paymentDetails: '💳 Payment Details',
    amount: 'Amount:',
    problem: 'Problem:',
    nextAttempt: 'Next attempt:',
    status: 'Status:',
    paymentFailed: 'Payment failed',
    whatYouCanDo: 'What you can do now:',
    failedActions: [
      'Check your account for sufficient funds',
      'Verify your credit card validity',
      'Update your payment method',
      'Contact our support if you have questions'
    ],
    retryDescription: 'Your last payment could not be processed. We will try again automatically.',
    retryPayment: '🔄 Payment Retry',
    retryDetails: 'Retry Details',
    remainingAttempts: 'Remaining attempts:',
    retryRecommendation: 'To ensure your subscription remains active, we recommend checking your payment details.',
    methodRequiredDescription: 'Your payment method needs to be updated to continue your subscription.',
    methodRequiredDetails: 'Method Update Required',
    updateRequired: 'Update Required:',
    updateDescription: 'Please update your payment method to avoid service interruption.',
    supportContact: 'If you need help, please contact our support team.',
    updateNow: 'Update Now',
    contactSupport: 'Contact Support',
    footer: 'This is an automated message. Please do not reply to this email.',
    copyright: '© 2024 TierTrainer24 - Professional Pet Training Platform'
  } : {
    paymentFailed: 'Zahlungsproblem bei Ihrem TierTrainer-Abo',
    paymentRetry: 'Zahlung wird erneut versucht',
    paymentMethodRequired: 'Zahlungsmethode aktualisieren erforderlich',
    paymentProblem: '⚠️ Zahlungsproblem',
    paymentRetrying: '🔄 Zahlung wird wiederholt',
    paymentMethodUpdate: '💳 Zahlungsmethode aktualisieren',
    greeting: `Hallo ${userName},`,
    failedDescription: 'Bei der Abrechnung Ihres TierTrainer-Abonnements ist ein Problem aufgetreten.',
    paymentDetails: '💳 Zahlungsdetails',
    amount: 'Betrag:',
    problem: 'Problem:',
    nextAttempt: 'Nächster Versuch:',
    status: 'Status:',
    paymentFailed: 'Zahlung fehlgeschlagen',
    whatYouCanDo: 'Was Sie jetzt tun können:',
    failedActions: [
      'Überprüfen Sie Ihr Konto auf ausreichende Deckung',
      'Kontrollieren Sie die Gültigkeit Ihrer Kreditkarte',
      'Aktualisieren Sie Ihre Zahlungsmethode',
      'Kontaktieren Sie bei Fragen unseren Support'
    ],
    retryDescription: 'Ihre letzte Zahlung konnte nicht verarbeitet werden. Wir versuchen es automatisch erneut.',
    retryPayment: '🔄 Erneuter Zahlungsversuch',
    retryDetails: 'Wiederholungsdetails',
    remainingAttempts: 'Versuche verbleibend:',
    retryRecommendation: 'Um sicherzustellen, dass Ihr Abo aktiv bleibt, empfehlen wir Ihnen, Ihre Zahlungsdaten zu überprüfen.',
    methodRequiredDescription: 'Ihre Zahlungsmethode muss aktualisiert werden, um Ihr Abonnement fortzusetzen.',
    methodRequiredDetails: 'Methoden-Update erforderlich',
    updateRequired: 'Update erforderlich:',
    updateDescription: 'Bitte aktualisieren Sie Ihre Zahlungsmethode, um eine Dienstunterbrechung zu vermeiden.',
    supportContact: 'Falls Sie Hilfe benötigen, kontaktieren Sie bitte unser Support-Team.',
    updateNow: 'Jetzt aktualisieren',
    contactSupport: 'Support kontaktieren',
    footer: 'Dies ist eine automatisierte Nachricht. Bitte antworten Sie nicht auf diese E-Mail.',
    copyright: '© 2024 TierTrainer24 - Professionelle Haustiertraining-Plattform'
  };

  return (
    <Html>
      <Head />
      <Preview>
        {paymentType === 'payment_failed' && content.paymentFailed}
        {paymentType === 'payment_retry' && content.paymentRetry}
        {paymentType === 'payment_method_required' && content.paymentMethodRequired}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {paymentType === 'payment_failed' && content.paymentProblem}
            {paymentType === 'payment_retry' && content.paymentRetrying}
            {paymentType === 'payment_method_required' && content.paymentMethodUpdate}
          </Heading>
          
          <Text style={text}>
            {content.greeting}
          </Text>
          
          {paymentType === 'payment_failed' && (
            <>
              <Text style={text}>
                {content.failedDescription}
              </Text>
              
              <Section style={errorBox}>
                <Text style={errorTitle}>{content.paymentDetails}</Text>
                <Text style={errorDetails}>
                  <strong>{content.amount}</strong> {amount ? `${(amount / 100).toFixed(2)} ${currency}` : (language === 'en' ? 'See invoice' : 'Siehe Rechnung')}<br/>
                  <strong>{content.problem}</strong> {failureReason || (language === 'en' ? 'Payment could not be processed' : 'Zahlung konnte nicht verarbeitet werden')}<br/>
                  {nextRetry && <><strong>{content.nextAttempt}</strong> {new Date(nextRetry).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}<br/></>}
                  <strong>{content.status}</strong> {content.paymentFailed}
                </Text>
              </Section>
              
              <Text style={text}>
                <strong>{content.whatYouCanDo}</strong>
              </Text>
              
              <Text style={bulletList}>
                {content.failedActions.map(action => `• ${action}`).join('<br/>')}
              </Text>
            </>
          )}

          {paymentType === 'payment_retry' && (
            <>
              <Text style={text}>
                {content.retryDescription}
              </Text>
              
              <Section style={retryBox}>
                <Text style={retryTitle}>{content.retryPayment}</Text>
                <Text style={retryDetails}>
                  <strong>{content.amount}</strong> {amount ? `${(amount / 100).toFixed(2)} ${currency}` : (language === 'en' ? 'See invoice' : 'Siehe Rechnung')}<br/>
                  {nextRetry && <><strong>{content.nextAttempt}</strong> {new Date(nextRetry).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}<br/></>}
                  <strong>{content.remainingAttempts}</strong> {language === 'en' ? '2-3 more attempts' : '2-3 weitere Versuche'}
                </Text>
              </Section>
              
              <Text style={text}>
                {content.retryRecommendation}
              </Text>
            </>
          )}

          {paymentType === 'payment_method_required' && (
            <>
              <Text style={text}>
                {content.methodRequiredDescription}
              </Text>
              
              <Section style={warningBox}>
                <Text style={warningTitle}>{content.methodRequiredDetails}</Text>
                <Text style={warningDetails}>
                  <strong>{content.updateRequired}</strong> {content.updateDescription}<br/>
                  <strong>{content.status}</strong> {language === 'en' ? 'Action required' : 'Aktion erforderlich'}
                </Text>
              </Section>
              
              <Text style={text}>
                {content.supportContact}
              </Text>
            </>
          )}

          <div style={buttonContainer}>
            <Link href="https://tiertrainer24.com/mein-tiertraining" style={button}>
              {content.updateNow}
            </Link>
          </div>

          <div style={helpBox}>
            <Text style={text}>
              <strong>{language === 'en' ? 'Need help?' : 'Brauchen Sie Hilfe?'}</strong><br/>
              {content.supportContact}
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
