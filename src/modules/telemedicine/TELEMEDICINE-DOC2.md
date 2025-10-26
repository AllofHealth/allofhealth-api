# 🔄 Telemedicine Frontend Integration Guide - Addendum

**Version:** 1.1.0  
**Last Updated:** October 2025
**Backend Developer:** Idiege Inah  
**Status:** Payment Integration & Notifications Complete

---

## 📢 What's New

This addendum covers the **complete Flutterwave payment integration** and **automated notification system** that were implemented after the initial guide.

### Recent Updates

✅ **Complete Flutterwave Payment Integration**
- Payment initialization endpoint updated
- Payment webhook handling
- Refund processing
- Payment verification

✅ **Automated Email Notifications**
- Booking confirmation emails (with ICS calendar files)
- Reminder emails (24h and 1h before consultation)
- Cancellation emails (with refund details)
- Follow-up surveys

✅ **Event-Driven Architecture**
- Booking lifecycle events
- Automated workflows
- Queue-based processing

---

## 1. Updated Payment Flow

### 1.1 Payment Initialization (UPDATED)

The payment initialization endpoint now returns a **Flutterwave payment link** directly.

**Updated Request:**
```typescript
POST /api/v1/telemedicine/bookings/initialize-payment
Authorization: Bearer {token}

Body:
{
  "calcomBookingId": "cal_abc123xyz"
}
```

**Updated Response:**
```json
{
  "success": true,
  "message": "Payment session initialized",
  "data": {
    "bookingId": "booking-uuid",
    "bookingReference": "AOH-TEL-123456",
    "amount": 50.00,
    "currency": "USD",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "paymentLink": "https://checkout.flutterwave.com/v3/hosted/pay/xxxxx",
    "paymentId": "123456"
  }
}
```

### 1.2 Updated Frontend Implementation

```typescript
// PaymentPage.tsx - UPDATED VERSION

const PaymentPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const calcomBookingId = searchParams.get('calcomBookingId');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePayment();
  }, [calcomBookingId]);

  const initializePayment = async () => {
    try {
      const response = await fetch('/api/v1/telemedicine/bookings/initialize-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ calcomBookingId })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data.data);
        
        // Option 1: Redirect to Flutterwave hosted page (RECOMMENDED)
        window.location.href = data.data.paymentLink;
        
        // Option 2: Use Flutterwave inline payment (if you prefer modal)
        // See section 1.3 below
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      {loading && <LoadingSpinner message="Redirecting to payment..." />}
    </div>
  );
};
```

### 1.3 Alternative: Inline Payment Modal

If you prefer to keep users on your site, use Flutterwave inline:

```typescript
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const PaymentPage = () => {
  const [paymentData, setPaymentData] = useState(null);

  const flutterwaveConfig = {
    public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: paymentData?.bookingReference,
    amount: paymentData?.amount,
    currency: paymentData?.currency || 'USD',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: currentUser.email,
      phone_number: currentUser.phoneNumber,
      name: currentUser.fullName,
    },
    customizations: {
      title: 'AllOf Health Consultation',
      description: `Payment for booking ${paymentData?.bookingReference}`,
      logo: 'https://your-logo-url.com/logo.png',
    },
    meta: {
      bookingId: paymentData?.bookingId,
    },
  };

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const initiatePayment = () => {
    handleFlutterPayment({
      callback: (response) => {
        console.log(response);
        closePaymentModal(); // Close modal
        
        if (response.status === 'successful') {
          // Payment successful - redirect to confirmation
          navigate(`/booking/confirmation/${paymentData.bookingId}`);
        } else {
          // Payment failed
          alert('Payment failed. Please try again.');
        }
      },
      onClose: () => {
        console.log('Payment modal closed');
      },
    });
  };

  return (
    <div className="payment-page">
      <div className="booking-summary">
        <h2>Booking Summary</h2>
        <p>Reference: {paymentData?.bookingReference}</p>
        <p>Amount: {paymentData?.currency} {paymentData?.amount}</p>
      </div>

      <button onClick={initiatePayment} className="pay-button">
        Pay Now
      </button>
    </div>
  );
};
```

### 1.4 Payment Verification (Optional)

To verify payment status manually:

```typescript
GET /api/v1/telemedicine/bookings/verify-payment/{transactionId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 123456,
    "tx_ref": "AOH-TEL-123456",
    "amount": 50.00,
    "status": "successful",
    "currency": "USD",
    "payment_type": "card",
    "created_at": "2024-02-01T10:00:00Z"
  }
}
```

---

## 2. Automated Email Notifications

### 2.1 What Emails Are Sent

The backend now automatically sends these emails:

| Event | Recipient | When | Contents |
|-------|-----------|------|----------|
| **Booking Confirmed** | Patient | After payment success | Booking details, video link, ICS calendar file |
| **New Booking** | Doctor | After payment success | Patient info, booking details, video link, ICS file |
| **24h Reminder** | Both | 24 hours before | Reminder + video link |
| **1h Reminder** | Both | 1 hour before | Reminder + video link |
| **Cancellation** | Both | When cancelled | Cancellation confirmation, refund details (if applicable) |
| **Follow-up Survey** | Patient | After consultation | Survey link (future) |
| **Review Request** | Patient | After consultation | Rating request (future) |

### 2.2 Email Samples

#### Booking Confirmation Email (Patient)

```
Subject: Consultation Confirmed - AOH-TEL-123456

Hi John Doe,

Your consultation with Dr. Jane Smith has been confirmed.

Booking Details:
- Reference: AOH-TEL-123456
- Date & Time: February 1, 2024 at 9:00 AM
- Duration: 30 minutes

[Join Video Consultation Button]

💡 Tip: The calendar invite is attached to this email. Add it to your calendar!

📧 Attached: consultation.ics
```

#### Reminder Email (1 hour before)

```
Subject: Reminder: Consultation in 1 hour

Hi John Doe,

This is a friendly reminder that your consultation is in 1 hour.

Consultation Time: February 1, 2024 at 9:00 AM
Reference: AOH-TEL-123456

[Join Now Button]

💡 Make sure you have a stable internet connection and your camera/microphone are working.
```

### 2.3 Frontend Considerations

**You don't need to implement email sending** - the backend handles everything automatically. However:

1. **Inform users:** Show a message after successful booking:
   ```
   "✅ Booking confirmed! We've sent a confirmation email with your appointment details."
   ```

2. **Email support:** Add a "Resend confirmation email" button (optional):
   ```typescript
   POST /api/v1/telemedicine/bookings/{bookingId}/resend-email
   ```

3. **Calendar integration:** Mention that calendar invites are attached to emails

---

## 3. Payment Configuration Endpoint

### 3.1 Get Payment Config

Before showing payment UI, fetch configuration:

```typescript
GET /api/v1/telemedicine/bookings/payment-config

Response:
{
  "success": true,
  "data": {
    "publicKey": "FLWPUBK_TEST-xxxxx",
    "currency": "USD",
    "country": "US"
  }
}
```

Use this to configure Flutterwave:

```typescript
const PaymentSetup = () => {
  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    fetch('/api/v1/telemedicine/bookings/payment-config')
      .then(res => res.json())
      .then(data => setPaymentConfig(data.data));
  }, []);

  // Use paymentConfig.publicKey in Flutterwave initialization
};
```

---

## 4. Updated Booking Statuses

### 4.1 Booking Status Flow

```
pending_payment (Cal.com booking created)
    ↓
processing_payment (User clicked "Pay Now")
    ↓
confirmed (Payment successful + Video room created)
    ↓
completed (Consultation finished)

OR

cancelled (User/doctor cancelled)
    ↓
refunded (If payment was made)
```

### 4.2 Status Display in Frontend

```typescript
const getStatusBadge = (status: string) => {
  const badges = {
    pending_payment: { color: 'yellow', text: 'Pending Payment' },
    processing_payment: { color: 'blue', text: 'Processing...' },
    confirmed: { color: 'green', text: 'Confirmed' },
    completed: { color: 'gray', text: 'Completed' },
    cancelled: { color: 'red', text: 'Cancelled' },
    no_show: { color: 'orange', text: 'No Show' },
  };

  return badges[status] || { color: 'gray', text: status };
};

// Usage in component
<span className={`badge badge-${getStatusBadge(booking.status).color}`}>
  {getStatusBadge(booking.status).text}
</span>
```

---

## 5. Testing Payments

### 5.1 Flutterwave Test Cards

| Scenario | Card Number | CVV | Expiry | PIN | OTP |
|----------|-------------|-----|--------|-----|-----|
| **Successful Payment** | 5531886652142950 | 564 | 09/32 | 3310 | 12345 |
| **Insufficient Funds** | 5143010522339965 | 276 | 09/32 | 1111 | - |
| **Declined (fraud)** | 5590131743294314 | 887 | 11/32 | - | - |

### 5.2 Test Flow

1. Create booking via Cal.com widget
2. Get redirected to payment page
3. Use test card above
4. Complete payment
5. Verify:
   - Redirect to confirmation page ✅
   - Email received ✅
   - Video link visible ✅
   - Status is "confirmed" ✅

### 5.3 Test Refunds

To test cancellation + refund:

```typescript
POST /api/v1/telemedicine/bookings/{bookingId}/cancel
Authorization: Bearer {token}

Body:
{
  "reason": "Testing refund process"
}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "status": "cancelled",
    "paymentStatus": "refunded",
    "refundAmount": 50.00
  }
}
```

---

## 6. Updated Error Handling

### 6.1 New Error Scenarios

#### Payment Link Generation Failed

```json
{
  "statusCode": 500,
  "message": "Failed to initialize Flutterwave payment",
  "error": "Internal Server Error"
}
```

**Frontend Solution:**
```typescript
if (error.message.includes('Flutterwave')) {
  showError('Payment system temporarily unavailable. Please try again in a few minutes.');
}
```

#### Email Sending Failed

Emails are sent asynchronously via queue. If email fails:
- Booking is still confirmed
- User can access booking via dashboard
- Optional: Add "Resend email" button

---

## 7. Monitoring & Logs

### 7.1 Payment Status Polling (Optional)

If user closes payment window, poll for status:

```typescript
const checkPaymentStatus = async (bookingId) => {
  const response = await fetch(
    `/api/v1/telemedicine/bookings/${bookingId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const data = await response.json();
  
  if (data.data.paymentStatus === 'paid') {
    // Payment successful
    navigate(`/booking/confirmation/${bookingId}`);
  } else if (data.data.paymentStatus === 'failed') {
    // Payment failed
    showError('Payment failed. Please try again.');
  }
};

// Poll every 3 seconds for max 30 seconds
const pollInterval = setInterval(() => {
  checkPaymentStatus(bookingId);
}, 3000);

setTimeout(() => clearInterval(pollInterval), 30000);
```

---

## 8. Calendar Integration

### 8.1 ICS File Handling

The backend automatically generates and attaches ICS calendar files to emails. Users can:

1. **Open email** → See `.ics` attachment
2. **Click attachment** → Opens in default calendar app
3. **Add to calendar** → Event is added automatically

### 8.2 Manual Calendar Download (Optional)

Provide a manual download option:

```typescript
const downloadCalendarFile = async (bookingId) => {
  const response = await fetch(
    `/api/v1/telemedicine/bookings/${bookingId}/calendar-file`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consultation-${bookingId}.ics`;
  a.click();
};
```

---

## 9. Updated Complete Flow Diagram

```
1. Patient views doctor profile
   ↓
2. Selects consultation type
   ↓
3. Cal.com widget loads
   ↓
4. Books slot via Cal.com
   ↓ (webhook to backend)
5. Backend creates booking record
   ↓
6. Patient redirected to payment page
   ↓
7. Backend initializes Flutterwave payment
   ↓
8. Patient completes payment
   ↓ (webhook to backend)
9. Backend:
   - Confirms booking ✅
   - Creates Doxy.me video link ✅
   - Sends confirmation emails ✅
   - Schedules 24h reminder ✅
   - Schedules 1h reminder ✅
   ↓
10. Patient receives email with:
    - Booking details ✅
    - Video link ✅
    - ICS calendar file ✅
   ↓
11. Doctor receives email with:
    - Patient info ✅
    - Booking details ✅
    - Video link ✅
    - ICS calendar file ✅
   ↓
12. 24 hours before:
    - Both receive reminder email ✅
   ↓
13. 1 hour before:
    - Both receive reminder email ✅
   ↓
14. At consultation time:
    - Both click video link
    - Join Doxy.me consultation ✅
```

---

## 10. Implementation Checklist

### Frontend Tasks

- [ ] Update payment page to use `paymentLink` from API
- [ ] Handle Flutterwave payment responses
- [ ] Add payment success/failure UI
- [ ] Show "email sent" confirmation message
- [ ] Test with Flutterwave test cards
- [ ] Add payment status polling (optional)
- [ ] Update booking status badges
- [ ] Test cancellation flow
- [ ] Handle edge cases (payment timeout, etc.)

### Testing Tasks

- [ ] Test complete booking flow end-to-end
- [ ] Verify emails received (check spam folder)
- [ ] Test with different payment cards
- [ ] Test cancellation + refund
- [ ] Verify ICS calendar files work
- [ ] Test reminder emails (modify delay for testing)
- [ ] Check video links work after payment
- [ ] Test dashboard displays correctly

---

## 11. Support & Questions

### Common Questions

**Q: Why am I not receiving emails?**
A: Check:
1. Backend logs for email send errors
2. Email spam folder
3. RESEND_API_KEY is configured correctly

**Q: Payment succeeds but booking not confirmed?**
A: The webhook might be delayed. Wait 30 seconds or refresh the page. If still not confirmed, contact backend developer.

**Q: Can I customize email templates?**
A: Yes, the backend developer (Idiege Inah) can update email templates in `notification.service.ts`.

**Q: How do I test reminders without waiting 24 hours?**
A: Ask backend developer to temporarily change reminder delay for testing.

---

## 12. Next Steps

### Week 2 & Beyond

⏳ **Planned Features:**
- Doctor payout processing
- Video recording (if Doxy.me plan supports)
- Post-consultation reviews/ratings
- Follow-up appointment suggestions
- Prescription upload
- Medical notes

---

**Document Version:** 1.1.0  
**Last Updated:** 26th October 2025  
**Backend Developer:** Idiege Inah  
**Status:** Complete Payment & Notification System

---

**For questions about this addendum, contact backend developer.**