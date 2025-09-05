import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

interface OnboardingEmailProps {
  name: string;
  dashboardUrl: string;
}

export const OnboardingEmail = ({
  name,
  dashboardUrl,
}: OnboardingEmailProps) => {
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
              h2, p, a {
                color: #f9fafb !important;
              }
              .button {
                background-color: #34d399 !important;
                color: #1f2937 !important;
              }
              .footer a {
                color: #34d399 !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>Welcome to Allof Health – Your Records, Your Control</Preview>
      <Body style={main}>
        <Container className="container" style={container}>
          {/* Logo */}
          <Section style={{ marginBottom: '24px' }}>
            <Img
              src="https://your-logo-url.com/logo.png"
              width="120"
              alt="Allof Health"
            />
          </Section>

          {/* Heading */}
          <Heading as="h2" style={heading}>
            Welcome to Allof Health – Your Records, Your Control
          </Heading>

          {/* Greeting */}
          <Text style={paragraph}>Hi {name},</Text>

          {/* Intro */}
          <Text style={paragraph}>Welcome to Allof Health</Text>

          <Text style={paragraph}>
            We’re excited to have you join Allof Health, the secure,
            blockchain-powered platform that puts your medical records back in
            your hands.
          </Text>

          {/* Features */}
          <Text style={paragraph}>With your account, you can:</Text>
          <ul style={list}>
            <li style={listItem}>
              📄 Access and manage your health records anytime
            </li>
            <li style={listItem}>
              👩‍⚕️ Share records seamlessly with trusted doctors and providers
            </li>
            <li style={listItem}>
              🔒 Stay confident knowing your data is fully protected
            </li>
          </ul>

          <Text style={paragraph}>
            Get started today and experience healthcare, redefined.
          </Text>

          {/* Button */}
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button className="button" style={button} href={dashboardUrl}>
              Go To My Dashboard
            </Button>
          </Section>

          {/* Closing */}
          <Text style={paragraph}>
            Thanks, <br />
            <strong>Allof Health Team</strong>
          </Text>

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

// ==================== Styles ====================

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

const heading = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const list = {
  paddingLeft: '20px',
  margin: '0 0 16px 0',
};

const listItem = {
  fontSize: '16px',
  color: '#374151',
  marginBottom: '8px',
};

const button = {
  backgroundColor: '#0f5d63',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '600',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '16px',
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

export default OnboardingEmail;
