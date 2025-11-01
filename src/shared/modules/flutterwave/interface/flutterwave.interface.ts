export type TFlutterMethods = 'POST' | 'GET';

export interface InitializePayment {
  amount: number;
  currency: string;
  email: string;
  name: string;
  phoneNumber?: string;
  txRef: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
    paymentId: string;
  };
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    created_at: string;
    customer: {
      id: number;
      name: string;
      email: string;
      phone_number: string;
    };
    meta?: Record<string, any>;
  };
}

export interface IEncryptCardData {
  iv: string;
  data: Record<string, any>;
}

export interface IHandleFlutterRequest {
  method: TFlutterMethods;
  url: string;
  data?: object;
  src: string;
}

export interface IProcessRefund {
  transactionId: string;
  amount?: number;
}
