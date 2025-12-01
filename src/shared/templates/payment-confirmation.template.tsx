import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Img,
  Row,
  Column,
} from '@react-email/components';

interface PaymentConfirmationEmailProps {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  consultationType: string;
  videoRoomUrl: string;
  calendarUrl: string;
}

export const PaymentConfirmationEmail = ({
  patientName,
  doctorName,
  date,
  time,
  consultationType,
  videoRoomUrl,
  calendarUrl,
}: PaymentConfirmationEmailProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              body, .container {
                background-color: #1f2937 !important;
                color: #f9fafb !important;
              }
              h2, p, li, a {
                color: #f9fafb !important;
              }
              .button-primary {
                background-color: #0f766e !important;
                color: #ffffff !important;
              }
              .button-secondary {
                background-color: transparent !important;
                color: #34d399 !important;
                border: 1px solid #34d399 !important;
              }
              .footer a {
                color: #34d399 !important;
              }
            }
          `}
        </style>
      </Head>

      <Preview>
        Payment Confirmed! Your Appointment with {doctorName} is Booked
      </Preview>

      <Body style={main}>
        <Container className="container" style={container}>
          {/* Header: Logo + Social Icons */}
          <Section style={header}>
            <Row>
              <Column style={{ width: '50%' }}>
                <Img
                  src="https://your-logo-url.com/logo.png"
                  width="120"
                  alt="Allof Health"
                />
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <a
                  href="https://linkedin.com/company/allofhealth"
                  style={iconLink}
                >
                  <Img
                    src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                    width="20"
                    height="20"
                    alt="LinkedIn"
                    style={icon}
                  />
                </a>
                <a href="https://instagram.com/allofhealth" style={iconLink}>
                  <Img
                    src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                    width="20"
                    height="20"
                    alt="Instagram"
                    style={icon}
                  />
                </a>
                <a href="https://youtube.com/@allofhealth" style={iconLink}>
                  <Img
                    src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                    width="20"
                    height="20"
                    alt="YouTube"
                    style={icon}
                  />
                </a>
              </Column>
            </Row>
          </Section>

          {/* Heading */}
          <Heading as="h2" style={heading}>
            ✅ Payment Confirmed! Your Appointment with {doctorName} is Booked
          </Heading>

          {/* Greeting */}
          <Text style={paragraph}>Hi {patientName},</Text>

          {/* Intro */}
          <Text style={paragraph}>
            Your payment has been confirmed, and your appointment with{' '}
            <strong>{doctorName}</strong> is successfully booked.
          </Text>

          <Text style={paragraph}>
            You can join your consultation directly from the link below when
            it’s time.
          </Text>

          <Text style={paragraph}>
            To secure your session, please complete your payment within the next
            hour. Unpaid sessions are automatically released to other patients
            after that time.
          </Text>

          {/* Appointment Details */}
          <Text style={paragraph}>
            <strong>Appointment Details:</strong>
          </Text>
          <ul style={list}>
            <li style={listItem}>
              👨‍⚕️ Doctor: <strong>{doctorName}</strong>
            </li>
            <li style={listItem}>📅 Date: {date}</li>
            <li style={listItem}>⏰ Time: {time}</li>
            <li style={listItem}>🏥 Consultation Type: {consultationType}</li>
          </ul>

          <Text style={paragraph}>
            🔗 Join Video Room:{' '}
            <a href={videoRoomUrl} style={link}>
              {videoRoomUrl}
            </a>
          </Text>
          <Text style={paragraph}>
            🗓️ Add to Calendar:{' '}
            <a href={calendarUrl} style={link}>
              {calendarUrl}
            </a>
          </Text>

          <Text style={paragraph}>
            Please ensure you join at least 5 minutes before your scheduled
            time.
          </Text>

          <Text style={paragraph}>
            Thank you for choosing Allof Health, where secure, seamless care
            meets patient empowerment.
          </Text>

          {/* Signature */}
          <Text style={paragraph}>
            Thanks, <br />
            <strong>Allof Health Team</strong> <br />
            Empowering people. Connecting care.
          </Text>

          {/* Action Buttons */}
          <Section style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button
              className="button-primary"
              style={buttonPrimary}
              href={videoRoomUrl}
            >
              Join Video Room
            </Button>
            <Button
              className="button-secondary"
              style={buttonSecondary}
              href={calendarUrl}
            >
              Add to Calendar
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text className="footer" style={footer}>
            Questions or FAQs? Contact us at{' '}
            <a href="mailto:contact@allofhealth.africa" style={link}>
              contact@allofhealth.africa
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const iconLink = {
  display: 'inline-block',
  marginLeft: '8px',
};

const icon = {
  verticalAlign: 'middle',
  borderRadius: '4px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  color: '#374151',
  marginBottom: '16px',
};

const list = {
  paddingLeft: '20px',
  marginBottom: '16px',
};

const listItem = {
  fontSize: '16px',
  color: '#374151',
  marginBottom: '6px',
};

const buttonPrimary = {
  backgroundColor: '#0f5d63',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  fontWeight: '600',
  marginRight: '12px',
  display: 'inline-block',
};

const buttonSecondary = {
  backgroundColor: 'transparent',
  border: '1px solid #0f5d63',
  color: '#0f5d63',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  fontWeight: '600',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  fontSize: '14px',
  color: '#6b7280',
};

const link = {
  color: '#0f5d63',
  textDecoration: 'none',
};

export default PaymentConfirmationEmail;
