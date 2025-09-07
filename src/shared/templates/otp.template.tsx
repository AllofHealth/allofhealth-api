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
  Row,
  Column,
  Hr,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  code: string;
  verifyUrl?: string;
}

export const VerificationEmail = ({
  name,
  code,
  verifyUrl,
}: VerificationEmailProps) => {
  const digits = code.split('');

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
              h2, p, a, td {
                color: #f9fafb !important;
              }
              .code-box {
                border-color: #34d399 !important;
                background-color: #374151 !important;
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
      <Preview>Your Allof Health verification code</Preview>
      <Body style={main}>
        <Container className="container" style={container}>
          {/* Logo */}
          <Section
            style={{
              marginBottom: '24px',
              width: '100%',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            <Img
              src="https://res.cloudinary.com/dojfgco87/image/upload/v1757275101/Banner_uot1xr.png"
              width="auto"
              height="auto"
              alt="Allof Health"
              style={{
                objectFit: 'cover',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Section>

          {/* Heading */}
          <Heading as="h2" style={heading}>
            Confirm Verification Code
          </Heading>

          <Text style={paragraph}>Hi {name},</Text>

          <Text style={paragraph}>This is your verification code:</Text>

          {/* Code Display */}
          <Row style={codeRow}>
            {digits.map((digit, i) => (
              <Column key={i} className="code-box" style={codeBox}>
                {digit}
              </Column>
            ))}
          </Row>

          <Text style={smallText}>
            This code will expire in 15 minutes. Please do not share it with
            anyone.
            <br />
            <br />
            If you didn’t request this code, you can safely ignore this email.
          </Text>

          {/* Button */}
          {/*<Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button className="button" style={button} href={verifyUrl}>
              Verify Email
            </Button>
          </Section>*/}

          <Text style={paragraph}>
            Thanks, <br />
            <strong>Allof Health Team</strong>
          </Text>

          <Hr style={hr} />

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

const codeRow = {
  margin: '20px 0',
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
};

const codeBox = {
  border: '2px solid #0f5d63',
  borderRadius: '8px',
  padding: '12px 18px',
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  textAlign: 'center' as const,
  color: '#111827',
  backgroundColor: '#ffffff', // light mode fill
};

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '24px',
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

export default VerificationEmail;
