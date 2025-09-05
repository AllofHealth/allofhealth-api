export enum RESEND_SUCCESS_MESSAGE {
  EMAIL_SENT = 'Email sent successfully',
}

export enum RESEND_ERROR_MESSAGE {
  EMAIL_NOT_SENT = 'Email not sent',
  ERROR_SENDING_EMAIL = 'Error sending email',
  ERROR_CREATING_ONBOARDING_TEMPLATE = 'Error creating onboarding template',
}

export enum RESEND_EMAIL_CONFIG {
  FROM = 'support@allofhealth.africa',
  SUBJECT = 'Verification',
  ONBOARDING_FROM = 'noreply@allofhealth.africa',
  ONBOARDING_SUBJECT = 'Welcome to AllofHealth',
  ONBOARDING_LOGIN_URL = 'https://allofhealth.africa/login',
}
