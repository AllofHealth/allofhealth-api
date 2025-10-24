# Telemedicine Feature - Frontend Integration Guide

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Backend Developer:** Idiege Inah
**Status:** Telemedicine Implementation.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Pages & Components](#frontend-pages--components)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Cal.com Widget Integration](#calcom-widget-integration)
6. [Doxy.me Video Integration](#doxyme-video-integration)
7. [Data Flow & User Journeys](#data-flow--user-journeys)
8. [Error Handling](#error-handling)
9. [Testing Guide](#testing-guide)

---

## 1. Overview

### What Has Been Implemented

The telemedicine backend provides:
- ✅ Doctor availability management
- ✅ Appointment booking system
- ✅ Cal.com integration for scheduling
- ✅ Doxy.me integration for video consultations
- ✅ Payment initialization (Flutterwave integration pending)
- ✅ Webhook handlers for real-time updates

### How It Works

```
Patient → Views Doctor Profile → Sees Availability (Cal.com) → Books Slot
    → Pays via Flutterwave → Receives Video Link (Doxy.me) → Joins Consultation
```

---

## 2. System Architecture

### Components Interaction

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Doctor List  │  │ Doctor Profile│  │ Patient     │ │
│  │ Page         │  │ Page          │  │ Dashboard   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│               YOUR BACKEND (AllOf Health)               │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  API Endpoints (15+ endpoints)                   │ │
│  │  - Doctor availability                           │ │
│  │  - Booking management                            │ │
│  │  - Payment initialization                        │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Cal.com    │  │ Flutterwave  │  │   Doxy.me    │
│  (Scheduling)│  │  (Payment)   │  │   (Video)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Frontend Pages & Components

### 3.1 Doctor List Page

**Purpose:** Show all available doctors  
**Needs Cal.com Widget:**  NO  
**API Calls Required:**

```typescript
// GET all doctors (existing endpoint - not in telemedicine)
GET /api/doctors?role=DOCTOR&status=ACTIVE

// Response:
{
  "doctors": [
    {
      "id": "uuid",
      "fullName": "Dr. John Smith",
      "specialization": "Cardiology",
      "profilePicture": "url",
      "yearsOfExperience": 10
    }
  ]
}
```

**Frontend Implementation:**
```typescript
// Example: DoctorListPage.tsx
const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch('/api/doctors?role=DOCTOR&status=ACTIVE')
      .then(res => res.json())
      .then(data => setDoctors(data.doctors));
  }, []);

  return (
    <div>
      {doctors.map(doctor => (
        <DoctorCard 
          key={doctor.id}
          doctor={doctor}
          onBookAppointment={() => navigate(`/doctors/${doctor.id}`)}
        />
      ))}
    </div>
  );
};
```

---

### 3.2 Doctor Profile Page

**Purpose:** Show doctor details and allow booking  
**Needs Cal.com Widget:**  YES  
**API Calls Required:**

#### Step 1: Get Doctor Details
```typescript
// GET doctor info (existing endpoint)
GET /api/doctors/{doctorId}

// Response:
{
  "id": "uuid",
  "fullName": "Dr. John Smith",
  "specialization": "Cardiology",
  "bio": "20 years experience...",
  "profilePicture": "url"
}
```

#### Step 2: Get Consultation Types
```typescript
// GET consultation types (NEW - Telemedicine)
GET /telemedicine/doctors/{doctorId}/consultation-types

// Response:
{
  "success": true,
  "data": [
    {
      "id": "consultation-type-uuid",
      "name": "General Consultation",
      "description": "30-minute general health consultation",
      "duration": 30,
      "price": 50.00,
      "currency": "USD",
      "calcomEventTypeId": 123456
    },
    {
      "id": "consultation-type-uuid-2",
      "name": "Follow-up Consultation",
      "description": "15-minute follow-up",
      "duration": 15,
      "price": 25.00,
      "currency": "USD",
      "calcomEventTypeId": 123457
    }
  ]
}
```

#### Step 3: Get Cal.com Embed Config
```typescript
// GET embed configuration (NEW - Telemedicine)
GET /telemedicine/doctors/{doctorId}/embed-config?consultationTypeId={typeId}

// Response:
{
  "success": true,
  "data": {
    "eventTypeId": 123456,
    "consultationType": {
      "id": "uuid",
      "name": "General Consultation",
      "description": "30-minute consultation",
      "duration": 30,
      "price": 50.00,
      "currency": "USD"
    },
    "embedConfig": {
      "theme": "light",
      "hideEventTypeDetails": false,
      "layout": "month_view"
    }
  }
}
```

**Frontend Implementation:**

```typescript
// Example: DoctorProfilePage.tsx
import Cal from '@calcom/embed-react';

const DoctorProfilePage = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [embedConfig, setEmbedConfig] = useState(null);

  // 1. Load doctor info
  useEffect(() => {
    fetch(`/api/doctors/${doctorId}`)
      .then(res => res.json())
      .then(data => setDoctor(data));
  }, [doctorId]);

  // 2. Load consultation types
  useEffect(() => {
    fetch(`/telemedicine/doctors/${doctorId}/consultation-types`)
      .then(res => res.json())
      .then(data => setConsultationTypes(data.data));
  }, [doctorId]);

  // 3. Load embed config when consultation type selected
  useEffect(() => {
    if (selectedType) {
      fetch(`/telemedicine/doctors/${doctorId}/embed-config?consultationTypeId=${selectedType.id}`)
        .then(res => res.json())
        .then(data => setEmbedConfig(data.data));
    }
  }, [selectedType]);

  // 4. Handle booking completion
  const handleBookingSuccess = (event) => {
    const calcomBookingId = event.detail.uid;
    // Redirect to payment page
    navigate(`/booking/payment?calcomBookingId=${calcomBookingId}`);
  };

  return (
    <div className="doctor-profile">
      {/* Doctor Info Section */}
      <DoctorInfoCard doctor={doctor} />

      {/* Consultation Type Selector */}
      <div className="consultation-types">
        <h3>Select Consultation Type</h3>
        {consultationTypes.map(type => (
          <button 
            key={type.id}
            onClick={() => setSelectedType(type)}
            className={selectedType?.id === type.id ? 'active' : ''}
          >
            {type.name} - ${type.price} ({type.duration} min)
          </button>
        ))}
      </div>

      {/* Cal.com Booking Widget */}
      {embedConfig && (
        <div className="booking-widget">
          <h3>Select Date & Time</h3>
          <Cal
            calLink={`allofhealth/${embedConfig.eventTypeId}`}
            config={{
              theme: embedConfig.embedConfig.theme,
              layout: embedConfig.embedConfig.layout,
              metadata: {
                patientId: currentUser.id, // Pass patient ID
                consultationTypeId: selectedType.id,
              }
            }}
            onBookingSuccessful={handleBookingSuccess}
          />
        </div>
      )}
    </div>
  );
};
```

**Important Notes for Doctor Profile Page:**

1. **Widget Display:** Show Cal.com widget ONLY after consultation type is selected
2. **Patient ID:** Always pass patient ID in metadata - backend needs it
3. **Redirect:** After successful booking, redirect to payment page
4. **Loading States:** Show skeleton loaders while fetching data

---

### 3.3 Payment Page

**Purpose:** Handle payment for booking  
**Needs Cal.com Widget:** NO  (it is independent)
**API Calls Required:**

#### Step 1: Initialize Payment
```typescript
// POST initialize payment (NEW - Telemedicine)
POST /telemedicine/bookings/initialize-payment
Authorization: Bearer {token}

// Request Body:
{
  "calcomBookingId": "cal_abc123xyz" // From URL parameter
}

// Response:
{
  "success": true,
  "message": "Payment session initialized",
  "data": {
    "bookingId": "booking-uuid",
    "bookingReference": "AOH-TEL-123456",
    "amount": 50.00,
    "currency": "USD" || "NGN",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid"
  }
}
```

#### Step 2: Process Payment (Flutterwave)
```typescript
// This is being implemented by Chike (3ill)
// For now, you'll integrate Flutterwave SDK directly
```

**Frontend Implementation:**

```typescript
// Example: PaymentPage.tsx
import { FlutterwaveButton } from 'flutterwave-react-v3';

const PaymentPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const calcomBookingId = searchParams.get('calcomBookingId');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize payment
  useEffect(() => {
    fetch('/telemedicine/bookings/initialize-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ calcomBookingId })
    })
      .then(res => res.json())
      .then(data => {
        setPaymentData(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Payment init failed:', err);
        setLoading(false);
      });
  }, [calcomBookingId]);

  // 2. Flutterwave config
  const flutterwaveConfig = {
    public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: paymentData?.bookingReference,
    amount: paymentData?.amount,
    currency: paymentData?.currency || 'USD',
    customer: {
      email: currentUser.email,
      name: currentUser.fullName,
    },
    customizations: {
      title: 'Telemedicine Consultation',
      description: `Payment for booking ${paymentData?.bookingReference}`,
      logo: 'your-logo-url',
    },
    meta: {
      bookingId: paymentData?.bookingId,
    },
  };

  // 3. Handle payment response
  const handleFlutterwavePayment = (response) => {
    if (response.status === 'successful') {
      // Payment successful
      // Backend will receive webhook and confirm booking
      navigate(`/booking/confirmation/${paymentData.bookingId}`);
    } else {
      // Payment failed
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="payment-page">
      <div className="booking-summary">
        <h2>Booking Summary</h2>
        <p>Reference: {paymentData.bookingReference}</p>
        <p>Amount: ${paymentData.amount}</p>
        <p>Currency: {paymentData.currency}</p>
      </div>

      <FlutterwaveButton
        {...flutterwaveConfig}
        callback={handleFlutterwavePayment}
        onClose={() => console.log('Payment closed')}
        text="Pay Now"
        className="payment-button"
      />
    </div>
  );
};
```

**Important Notes for Payment Page:**

1. **Security:** Always use Authorization header
2. **Booking ID:** Store it - you'll need it for confirmation page
3. **Webhook:** Backend receives payment confirmation via webhook (not your responsibility)
4. **Error Handling:** Show clear error messages if payment init fails

---

### 3.4 Booking Confirmation Page

**Purpose:** Show booking details and video link  
**Needs Cal.com Widget:** ❌ NO  
**API Calls Required:**

```typescript
// GET booking details (NEW - Telemedicine)
GET /telemedicine/bookings/{bookingId}
Authorization: Bearer {token}

// Response:
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "bookingReference": "AOH-TEL-123456",
    "status": "confirmed",
    "paymentStatus": "paid",
    "startTime": "2024-02-01T09:00:00Z",
    "endTime": "2024-02-01T09:30:00Z",
    "amount": "50.00",
    "currency": "USD" || "NGN",
    "videoRoomUrl": "https://allofhealth.doxy.me/dr-smith?pid=patient123&booking=booking-uuid",
    "doctorId": "doctor-uuid",
    "consultationTypeId": "type-uuid"
  }
}
```

**Frontend Implementation:**

```typescript
// Example: BookingConfirmationPage.tsx
const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetch(`/telemedicine/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setBooking(data.data));
  }, [bookingId]);

  const handleJoinCall = () => {
    // Open Doxy.me in new window
    window.open(booking.videoRoomUrl, '_blank');
  };

  return (
    <div className="confirmation-page">
      <div className="success-icon">✅</div>
      <h1>Booking Confirmed!</h1>
      
      <div className="booking-details">
        <p><strong>Reference:</strong> {booking.bookingReference}</p>
        <p><strong>Date & Time:</strong> {formatDate(booking.startTime)}</p>
        <p><strong>Duration:</strong> 30 minutes</p>
        <p><strong>Amount Paid:</strong> ${booking.amount}</p>
      </div>

      <div className="actions">
        <button onClick={handleJoinCall}>
          Join Video Consultation
        </button>
        <button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>

      <div className="email-notice">
         A confirmation email with calendar invite has been sent to your email
      </div>
    </div>
  );
};
```

---

### 3.5 Patient Dashboard

**Purpose:** Show patient's bookings  
**Needs Cal.com Widget:**  NO  
**API Calls Required:**

```typescript
// GET patient's bookings (NEW - Telemedicine)
GET /telemedicine/bookings/me/list?status=confirmed
Authorization: Bearer {token}

// Response:
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "bookingReference": "AOH-TEL-123456",
      "status": "confirmed",
      "startTime": "2024-02-01T09:00:00Z",
      "endTime": "2024-02-01T09:30:00Z",
      "amount": "50.00",
      "videoRoomUrl": "https://...",
      "doctorId": "doctor-uuid"
    }
  ],
  "count": 1
}
```

**Frontend Implementation:**

```typescript
// Example: PatientDashboard.tsx
const PatientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all'); // all, confirmed, completed

  useEffect(() => {
    const url = filter === 'all' 
      ? '/telemedicine/bookings/me/list'
      : `/telemedicine/bookings/me/list?status=${filter}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data.data));
  }, [filter]);

  return (
    <div className="dashboard">
      <h1>My Appointments</h1>

      {/* Filter Tabs */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('confirmed')}>Upcoming</button>
        <button onClick={() => setFilter('completed')}>Past</button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {bookings.map(booking => (
          <BookingCard 
            key={booking.id}
            booking={booking}
            onJoinCall={() => window.open(booking.videoRoomUrl, '_blank')}
            onCancel={() => handleCancelBooking(booking.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

---

### 3.6 Doctor Dashboard

**Purpose:** Show doctor's appointments  
**Needs Cal.com Widget:** NO  
**API Calls Required:**

```typescript
// GET doctor's bookings (NEW - Telemedicine)
GET /telemedicine/bookings/doctor/list?status=confirmed&startDate=2024-02-01&endDate=2024-02-07
Authorization: Bearer {token}

// Response:
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "bookingReference": "AOH-TEL-123456",
      "status": "confirmed",
      "startTime": "2024-02-01T09:00:00Z",
      "patientId": "patient-uuid",
      "videoRoomUrl": "https://..."
    }
  ],
  "count": 5
}
```

**Frontend Implementation:**

```typescript
// Example: DoctorDashboard.tsx
const DoctorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: addDays(new Date(), 7)
  });

  useEffect(() => {
    const params = new URLSearchParams({
      status: 'confirmed',
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    });

    fetch(`/telemedicine/bookings/doctor/list?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data.data));
  }, [dateRange]);

  return (
    <div className="doctor-dashboard">
      <h1>My Schedule</h1>
      
      {/* Calendar View */}
      <Calendar 
        appointments={bookings}
        onDateChange={setDateRange}
      />

      {/* Upcoming Appointments */}
      <div className="upcoming-appointments">
        {bookings.map(booking => (
          <AppointmentCard
            key={booking.id}
            booking={booking}
            onJoinCall={() => window.open(booking.videoRoomUrl, '_blank')}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 4. API Endpoints Reference

### Complete Endpoint List

| Endpoint | Method | Auth Required | Widget Needed | Purpose |
|----------|--------|---------------|---------------|---------|
| `/telemedicine/doctors/:id/consultation-types` | GET | ❌ No | ❌ No | Get consultation types |
| `/telemedicine/doctors/consultation-types` | POST | ✅ Yes (Doctor) | ❌ No | Create consultation type |
| `/telemedicine/doctors/consultation-types/:id` | PATCH | ✅ Yes (Doctor) | ❌ No | Update consultation type |
| `/telemedicine/doctors/:id/availability` | GET | ❌ No | ❌ No | Get available slots |
| `/telemedicine/doctors/:id/embed-config` | GET | ❌ No | ✅ Use for Cal.com | Get widget config |
| `/telemedicine/bookings/initialize-payment` | POST | ✅ Yes (Patient) | ❌ No | Initialize payment |
| `/telemedicine/bookings/:id` | GET | ✅ Yes | ❌ No | Get booking details |
| `/telemedicine/bookings/:id/cancel` | POST | ✅ Yes | ❌ No | Cancel booking |
| `/telemedicine/bookings/:id/video-link` | GET | ✅ Yes | ❌ No | Get video room URL |
| `/telemedicine/bookings/me/list` | GET | ✅ Yes (Patient) | ❌ No | Get patient bookings |
| `/telemedicine/bookings/doctor/list` | GET | ✅ Yes (Doctor) | ❌ No | Get doctor bookings |

---

## 5. Cal.com Widget Integration

### When to Use Cal.com Widget

**✅ USE Widget On:**
- Doctor Profile Page (for booking appointments)

**❌ DON'T USE Widget On:**
- Doctor List Page
- Payment Page
- Confirmation Page
- Dashboard Pages

### How to Integrate Cal.com Widget

#### Step 1: Install Package

```bash
npm install @calcom/embed-react
```

#### Step 2: Add Script to HTML (if needed)

```html
<!-- In public/index.html -->
<script src="https://app.cal.com/embed/embed.js"></script>
```

#### Step 3: Implement in Component

```typescript
import Cal from '@calcom/embed-react';

// In your component
<Cal
  calLink={`allofhealth/${eventTypeId}`}
  config={{
    theme: 'light',
    layout: 'month_view',
    metadata: {
      patientId: currentUser.id,
      consultationTypeId: selectedConsultationType.id,
    }
  }}
  onBookingSuccessful={(event) => {
    const bookingId = event.detail.uid;
    navigate(`/payment?calcomBookingId=${bookingId}`);
  }}
/>
```

### Important Widget Configuration

```typescript
const calConfig = {
  // REQUIRED: Cal.com username + event type ID
  calLink: 'allofhealth/123456',
  
  // Theme: 'light' | 'dark' | 'auto'
  theme: 'light',
  
  // Layout: 'month_view' | 'week_view' | 'column_view'
  layout: 'month_view',
  
  // CRITICAL: Pass patient info in metadata
  metadata: {
    patientId: 'patient-uuid', // Backend needs this!
    consultationTypeId: 'consultation-type-uuid',
    // Add any other data you want backend to receive
  },
  
  // Styling
  styles: {
    branding: {
      brandColor: '#your-brand-color',
    }
  },
  
  // Hide Cal.com branding (requires paid plan)
  hideEventTypeDetails: false,
};
```

### Widget Events

```typescript
// Listen for booking success
Cal('on', {
  action: 'bookingSuccessful',
  callback: (event) => {
    console.log('Booking UID:', event.detail.uid);
    console.log('Event Type:', event.detail.eventTypeId);
    // Redirect to payment
  }
});

// Listen for booking cancelled
Cal('on', {
  action: 'bookingCancelled',
  callback: (event) => {
    console.log('Booking was cancelled');
  }
});

// Listen for slot selected
Cal('on', {
  action: 'slotSelected',
  callback: (event) => {
    console.log('Slot selected:', event.detail.date);
  }
});
```

---

## 6. Doxy.me Video Integration

### When to Show Video Link

**✅ Show Video Link When:**
- Booking status is `confirmed`
- Payment status is `paid`
- Video room URL exists in booking object

**❌ Don't Show Video Link When:**
- Booking status is `pending_payment`
- Payment status is `pending` or `failed`
- Consultation hasn't started yet (optional - you decide)

### How to Use Video Link

#### Option 1: Open in New Window (Recommended)

```typescript
const joinVideoCall = (videoRoomUrl) => {
  window.open(videoRoomUrl, '_blank', 'width=1200,height=800');
};

// In your component
<button onClick={() => joinVideoCall(booking.videoRoomUrl)}>
  Join Video Call
</button>
```

#### Option 2: Embed in iFrame (Not Recommended)

```typescript
// Doxy.me works better in new window
<iframe 
  src={booking.videoRoomUrl}
  width="100%"
  height="600px"
  allow="camera; microphone"
/>
```

### Video Room URL Format

The backend generates URLs like this:

```
https://allofhealth.doxy.me/dr-john-smith?pid=patient123&booking=booking-uuid
```

**URL Parts:**
- `allofhealth` = Your clinic subdomain
- `dr-john-smith` = Doctor's room name
- `pid=patient123` = Patient identifier
- `booking=booking-uuid` = Booking reference

### Important Doxy.me Notes

1. **Browser Permissions:** Doxy.me requires camera/microphone access
2. **Mobile Support:** Works on mobile browsers
3. **No App Required:** Patients don't need to download anything
4. **Waiting Room:** Patients enter waiting room until doctor joins
5. **Privacy:** Rooms are private (not accessible without link)

---

## 7. Data Flow & User Journeys

### Complete Patient Journey

```
Step 1: Browse Doctors
└─ Frontend: Doctor List Page
└─ API Call: GET /api/doctors
└─ Widget: ❌ None

Step 2: View Doctor Profile
└─ Frontend: Doctor Profile Page
└─ API Calls:
    ├─ GET /api/doctors/{id}
    ├─ GET /telemedicine/doctors/{id}/consultation-types
    └─ GET /telemedicine/doctors/{id}/embed-config
└─ Widget: ❌ None (just data)

Step 3: Select Consultation Type
└─ Frontend: User clicks consultation type button
└─ Trigger: Load Cal.com widget with selected type
└─ Widget: ✅ Cal.com (appears after type selected)

Step 4: Book Appointment via Cal.com
└─ Frontend: Cal.com widget displays
└─ User Action: Selects date/time, fills form, submits
└─ Cal.com: Creates booking, sends webhook to backend
└─ Frontend: Receives booking success event
└─ Navigate: Redirect to Payment Page
└─ Widget: ❌ Widget closes, redirect happens

Step 5: Payment
└─ Frontend: Payment Page
└─ API Call: POST /telemedicine/bookings/initialize-payment
└─ Payment: Flutterwave button appears
└─ User Action: Pays via Flutterwave
└─ Backend: Receives webhook, confirms booking, creates video link
└─ Navigate: Redirect to Confirmation Page
└─ Widget: ❌ None

Step 6: Confirmation
└─ Frontend: Booking Confirmation Page
└─ API Call: GET /telemedicine/bookings/{id}
└─ Display: Booking details + Video link button
└─ Widget: ❌ None

Step 7: Join Video Call (on appointment day)
└─ Frontend: Dashboard or Confirmation Page
└─ User Action: Clicks "Join Video Call"
└─ Action: Opens Doxy.me in new window
└─ Widget: ❌ None (external link)
```

### Data That Needs to Be Sent

| From Page | To API | Data Required |
|-----------|--------|---------------|
| Doctor Profile | `GET /embed-config` | `doctorId`, `consultationTypeId` |
| Cal.com Widget | Backend (via webhook) | `patientId` (in metadata), booking details |
| Payment Page | `POST /initialize-payment` | `calcomBookingId` |
| Payment Success | Backend (via webhook) | Payment details (Flutterwave handles this) |
| Dashboard | `GET /bookings/me/list` | `status` (optional filter) |
| Confirmation | `GET /bookings/{id}` | `bookingId` |

---

## 8. Error Handling

### Common Errors and Solutions

#### 8.1 Payment Initialization Failed

**Error Response:**
```json
{
  "statusCode": 404,
  "message": "Booking not found",
  "error": "Not Found"
}
```

**Possible Causes:**
1. Cal.com webhook didn't reach backend yet (timing issue)
2. Invalid Cal.com booking ID
3. Booking was already processed

**Frontend Solution:**
```typescript
const initializePayment = async (calcomBookingId) => {
  try {
    const response = await fetch('/telemedicine/bookings/initialize-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ calcomBookingId })
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Wait and retry (webhook may be delayed)
        await new Promise(resolve => setTimeout(resolve, 3000));
        return initializePayment(calcomBookingId); // Retry once
      }
      throw new Error('Payment initialization failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment error:', error);
    // Show user-friendly error
    showError('Unable to initialize payment. Please try again or contact support.');
  }
};
```

#### 8.2 Booking Already Paid

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Booking already paid",
  "error": "Bad Request"
}
```

**Frontend Solution:**
```typescript
// Check if booking already paid before showing payment
const checkBookingStatus = async (bookingId) => {
  const response = await fetch(`/telemedicine/bookings/${bookingId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  if (data.data.paymentStatus === 'paid') {
    // Redirect to confirmation instead
    navigate(`/booking/confirmation/${bookingId}`);
    return;
  }
  
  // Show payment page
  showPaymentForm();
};
```

#### 8.3 Consultation Type Not Found

**Error Response:**
```json
{
  "statusCode": 404,
  "message": "Consultation type not found",
  "error": "Not Found"
}
```

**Frontend Solution:**
```typescript
const loadConsultationTypes = async (doctorId) => {
  try {
    const response = await fetch(`/telemedicine/doctors/${doctorId}/consultation-types`);
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      // Doctor hasn't set up telemedicine yet
      showMessage('This doctor is not available for online consultations at the moment.');
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to load consultation types:', error);
    return [];
  }
};
```

#### 8.4 Unauthorized Access

**Error Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Frontend Solution:**
```typescript
// Add interceptor to handle 401 globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
```

#### 8.5 Cal.com Widget Errors

**Common Issues:**

**Issue 1: Widget Not Loading**
```typescript
// Check if Cal.com script loaded
useEffect(() => {
  if (typeof Cal === 'undefined') {
    console.error('Cal.com script not loaded');
    // Load script dynamically
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    document.body.appendChild(script);
  }
}, []);
```

**Issue 2: Invalid Event Type ID**
```typescript
// Always validate embed config before showing widget
if (!embedConfig || !embedConfig.eventTypeId) {
  showError('Unable to load booking calendar. Please try again.');
  return null;
}
```

**Issue 3: Booking Failed in Cal.com**
```typescript
// Listen for error events
Cal('on', {
  action: 'bookingFailed',
  callback: (event) => {
    console.error('Cal.com booking failed:', event.detail);
    showError('Booking failed. Please try a different time slot.');
  }
});
```

---

## 9. Testing Guide

### 9.1 Manual Testing Checklist

#### Test Case 1: Complete Booking Flow
```
✅ Prerequisites:
- Backend server running
- Test doctor account created
- Test patient account created
- Cal.com account configured
- Doxy.me account configured

✅ Steps:
1. Login as patient
2. Navigate to doctors list
3. Click on a doctor → Should see doctor profile
4. Verify consultation types load → Should see list of types with prices
5. Select a consultation type → Cal.com widget should appear
6. Select available time slot → Fill booking form
7. Submit booking → Should redirect to payment page
8. Verify booking details on payment page → Amount, reference should match
9. Complete payment (use Flutterwave test cards)
10. Verify redirect to confirmation page → Booking reference shown
11. Check video link is present → Click should open Doxy.me
12. Check email received → Calendar invite attached

✅ Expected Results:
- All pages load without errors
- Data displays correctly
- Video link opens Doxy.me waiting room
- Email received with booking details

✅ API Calls to Monitor:
1. GET /api/doctors/{id}
2. GET /telemedicine/doctors/{id}/consultation-types
3. GET /telemedicine/doctors/{id}/embed-config
4. POST /telemedicine/bookings/initialize-payment
5. GET /telemedicine/bookings/{id}
```

#### Test Case 2: Cal.com Widget Integration
```
✅ Steps:
1. Open doctor profile page
2. Select consultation type
3. Wait for Cal.com widget to load
4. Check available time slots appear
5. Try selecting different dates
6. Fill in patient information
7. Submit booking

✅ Expected Results:
- Widget loads within 3 seconds
- Time slots are clickable
- Form validation works
- Successful booking shows confirmation
- Redirect to payment page happens

✅ Check Console For:
- No JavaScript errors
- Cal.com event callbacks firing
- Booking UID returned in event
```

#### Test Case 3: Payment Flow
```
✅ Steps:
1. Complete booking in Cal.com
2. Get redirected to payment page
3. Wait for payment initialization
4. Check booking summary displayed
5. Click "Pay Now" button
6. Complete Flutterwave payment modal

✅ Expected Results:
- Payment page loads < 2 seconds
- Booking details correct
- Flutterwave modal opens
- Payment processes successfully
- Redirect to confirmation after success

✅ Test Different Scenarios:
- Successful payment
- Failed payment (use test cards)
- Cancelled payment (close modal)
- Payment timeout
```

#### Test Case 4: Video Link Access
```
✅ Steps:
1. Complete booking and payment
2. Navigate to confirmation page
3. Click "Join Video Call" button
4. New window opens with Doxy.me

✅ Expected Results:
- Video link only visible for confirmed bookings
- New window opens (not same window)
- Doxy.me waiting room loads
- Camera/microphone permissions requested
- Patient can see waiting room message

✅ Check Different States:
- Pending payment → No video link
- Payment failed → No video link
- Confirmed → Video link visible
- Completed → Video link still accessible
```

#### Test Case 5: Dashboard Views
```
✅ Patient Dashboard:
1. Login as patient
2. Navigate to dashboard
3. Check bookings list displays
4. Filter by status (confirmed, completed)
5. Click on a booking → View details
6. Try cancelling a booking

✅ Doctor Dashboard:
1. Login as doctor
2. Navigate to dashboard
3. Check appointments list
4. Filter by date range
5. Click on appointment → View patient details
6. Join video call from dashboard

✅ Expected Results:
- Bookings load correctly
- Filters work
- Details are accurate
- Actions (cancel, join) work
```

### 9.2 API Testing with Postman/cURL

#### Test Authentication
```bash
# Get token first (use your existing auth endpoint)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@test.com", "password": "password"}'

# Save token for subsequent requests
export TOKEN="your_jwt_token_here"
```

#### Test Get Consultation Types
```bash
curl -X GET http://localhost:3000/telemedicine/doctors/DOCTOR_ID/consultation-types
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "General Consultation",
      "duration": 30,
      "price": 50.00
    }
  ]
}
```

#### Test Get Embed Config
```bash
curl -X GET "http://localhost:3000/telemedicine/doctors/DOCTOR_ID/embed-config?consultationTypeId=TYPE_ID"
```

#### Test Initialize Payment
```bash
curl -X POST http://localhost:3000/telemedicine/bookings/initialize-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calcomBookingId": "cal_abc123"}'
```

#### Test Get Booking
```bash
curl -X GET http://localhost:3000/telemedicine/bookings/BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Get Patient Bookings
```bash
curl -X GET http://localhost:3000/telemedicine/bookings/me/list \
  -H "Authorization: Bearer $TOKEN"
```

### 9.3 Error Scenario Testing

#### Test Invalid Booking ID
```bash
curl -X POST http://localhost:3000/telemedicine/bookings/initialize-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calcomBookingId": "invalid_id"}'

# Expected: 404 Not Found
```

#### Test Unauthorized Access
```bash
curl -X GET http://localhost:3000/telemedicine/bookings/BOOKING_ID

# Expected: 401 Unauthorized
```

#### Test Already Paid Booking
```bash
# Try to initialize payment for already paid booking
curl -X POST http://localhost:3000/telemedicine/bookings/initialize-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calcomBookingId": "already_paid_booking_id"}'

# Expected: 400 Bad Request - "Booking already paid"
```

---

## 10. Additional Information

### 10.1 Environment Variables Frontend Needs

```env
# Cal.com (if using direct integration)
REACT_APP_CALCOM_EMBED_URL=https://app.cal.com/embed/embed.js

# Flutterwave
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx

# Your Backend API
REACT_APP_API_URL=http://localhost:3000/api

# Doxy.me (for reference)
REACT_APP_DOXY_SUBDOMAIN=allofhealth
```

### 10.2 Required NPM Packages

```bash
# Cal.com integration
npm install @calcom/embed-react

# Flutterwave payment
npm install flutterwave-react-v3

# Date handling (optional but recommended)
npm install date-fns

# HTTP client (if not already installed)
npm install axios
```

### 10.3 TypeScript Types (Optional)

```typescript
// types/telemedicine.ts

export interface ConsultationType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  currency: string;
  calcomEventTypeId?: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingReference: string;
  patientId: string;
  doctorId: string;
  consultationTypeId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: string;
  currency: string;
  videoRoomUrl?: string;
  createdAt: string;
}

export type BookingStatus = 
  | 'pending_payment'
  | 'processing_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface EmbedConfig {
  eventTypeId: number;
  consultationType: ConsultationType;
  embedConfig: {
    theme: 'light' | 'dark' | 'auto';
    hideEventTypeDetails: boolean;
    layout: 'month_view' | 'week_view' | 'column_view';
  };
}

export interface PaymentData {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  patientId: string;
  doctorId: string;
}
```

### 10.4 Useful Helper Functions

```typescript
// utils/telemedicine.ts

/**
 * Format booking date and time
 */
export const formatBookingDateTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const date = start.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const time = `${start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })} - ${end.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  
  return { date, time };
};

/**
 * Check if booking is upcoming
 */
export const isUpcomingBooking = (startTime: string): boolean => {
  return new Date(startTime) > new Date();
};

/**
 * Check if booking is happening now
 */
export const isBookingLive = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  return now >= new Date(startTime) && now <= new Date(endTime);
};

/**
 * Get booking status badge color
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
  const colors = {
    pending_payment: 'yellow',
    processing_payment: 'blue',
    confirmed: 'green',
    completed: 'gray',
    cancelled: 'red',
    no_show: 'orange'
  };
  return colors[status] || 'gray';
};

/**
 * Format price with currency
 */
export const formatPrice = (amount: number | string, currency: string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(numAmount);
};

/**
 * Validate Cal.com booking ID format
 */
export const isValidCalcomBookingId = (bookingId: string): boolean => {
  return /^cal_[a-zA-Z0-9]+$/.test(bookingId);
};

/**
 * Extract patient ID from Doxy.me URL
 */
export const extractPatientIdFromDoxyUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('pid');
  } catch {
    return null;
  }
};
```

### 10.5 State Management Example (React Context)

```typescript
// context/TelemedicineContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TelemedicineContextType {
  selectedConsultationType: ConsultationType | null;
  setSelectedConsultationType: (type: ConsultationType | null) => void;
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;
  loadingBooking: boolean;
  fetchBooking: (bookingId: string) => Promise<void>;
}

const TelemedicineContext = createContext<TelemedicineContextType | undefined>(undefined);

export const TelemedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const fetchBooking = useCallback(async (bookingId: string) => {
    setLoadingBooking(true);
    try {
      const response = await fetch(`/telemedicine/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCurrentBooking(data.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoadingBooking(false);
    }
  }, []);

  return (
    <TelemedicineContext.Provider
      value={{
        selectedConsultationType,
        setSelectedConsultationType,
        currentBooking,
        setCurrentBooking,
        loadingBooking,
        fetchBooking
      }}
    >
      {children}
    </TelemedicineContext.Provider>
  );
};

export const useTelemedicine = () => {
  const context = useContext(TelemedicineContext);
  if (context === undefined) {
    throw new Error('useTelemedicine must be used within a TelemedicineProvider');
  }
  return context;
};
```

---

## 11. Frequently Asked Questions (FAQ)

### Q1: Do I need to create a Cal.com account?
**A:** No, as a frontend developer, you don't need your own Cal.com account. The backend has already configured it. You just need to integrate the widget using the embed config from the API.

### Q2: Where does the Cal.com widget data go?
**A:** When a patient books through the Cal.com widget, Cal.com sends a webhook to the backend. The backend creates a booking record in the database. You don't need to worry about this - just redirect the user to the payment page after booking success.

### Q3: How do I test payments without real money?
**A:** Use Flutterwave test cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Q4: Can patients book without creating an account?
**A:** No. Patients must be logged in. The backend needs the patient ID to create bookings. Always check authentication before showing the booking flow.

### Q5: What happens if payment fails?
**A:** The booking stays in `pending_payment` status. The patient can retry payment by going back to the payment page with the same booking ID. The booking doesn't get deleted.

### Q6: Can doctors cancel bookings?
**A:** Yes, doctors can cancel bookings using the same cancel endpoint. The `cancelledBy` field tracks who cancelled (patient or doctor).

### Q7: How long is a video room link valid?
**A:** The video room link is permanent but is tied to the specific booking. It's accessible until the consultation is marked as completed. After that, it remains in the booking record for reference.

### Q8: Do I need to implement email notifications?
**A:** No, the backend handles all email notifications automatically via webhooks. When a booking is confirmed, the backend sends emails to both patient and doctor with calendar invites.

### Q9: What timezone should I use?
**A:** Cal.com handles timezone conversion automatically. Just ensure you pass the patient's timezone in the Cal.com widget config. The backend stores times in UTC and the database schema has a timezone field.

### Q10: How do I handle booking conflicts (double bookings)?
**A:** Cal.com prevents double bookings automatically by checking doctor availability in real-time. If a slot is taken, it won't appear in the calendar widget. Additionally, the backend implements Redis slot locking (coming in week 2) for extra safety.

### Q11: Can I customize the Cal.com widget appearance?
**A:** Yes, you can customize colors, layout, and theme through the `config` prop. See the Cal.com Widget Integration section for details.

### Q12: What happens if the backend webhook fails?
**A:** The backend has retry logic and fallback mechanisms. If the Cal.com webhook fails, when the patient tries to pay, the backend will fetch the booking from Cal.com's API as a fallback.

### Q13: Should I validate the Cal.com booking ID format?
**A:** Yes, use the helper function `isValidCalcomBookingId()` provided in section 10.4 before making API calls.

### Q14: How do I show a loading state while waiting for Cal.com widget?
**A:** Show a skeleton loader or spinner while `embedConfig` is being fetched. Once it's loaded, the widget will render almost instantly.

### Q15: Can I use this with React Native?
**A:** Cal.com has limited support for React Native. You'd need to use a WebView component to embed the widget. The REST API calls work normally in React Native.

---

## 12. Support and Troubleshooting

### Backend Developer Contact
**Name:** [Your Name]  
**Email:** [Your Email]  
**Availability:** [Your working hours]

### Common Issues Resolution Time
- **Cal.com widget not loading:** < 5 minutes
- **Payment initialization fails:** < 10 minutes
- **Video link not appearing:** < 5 minutes
- **API endpoint errors:** < 15 minutes

### Debugging Checklist
When something goes wrong, check:

1. ✅ Is the backend server running?
2. ✅ Is the auth token valid?
3. ✅ Are you using the correct API endpoint?
4. ✅ Is the request body formatted correctly?
5. ✅ Check browser console for errors
6. ✅ Check network tab for failed requests
7. ✅ Verify Cal.com script is loaded
8. ✅ Check if doctor has consultation types set up

### Useful Browser Console Commands
```javascript
// Check if Cal.com is loaded
typeof Cal !== 'undefined'

// Check current token
localStorage.getItem('token')

// Test API endpoint
fetch('/telemedicine/doctors/DOCTOR_ID/consultation-types')
  .then(r => r.json())
  .then(console.log)

// Clear Cal.com cache
Cal('clearCache')
```

---

## 13. Summary

### Pages Overview

| Page | Widgets Needed | API Calls | Auth Required |
|------|----------------|-----------|---------------|
| Doctor List | ❌ None | 1 (existing) | ❌ No |
| Doctor Profile | ✅ Cal.com | 3 (telemedicine) | ❌ No |
| Payment | ❌ None (Flutterwave) | 1 (telemedicine) | ✅ Yes |
| Confirmation | ❌ None | 1 (telemedicine) | ✅ Yes |
| Patient Dashboard | ❌ None | 1 (telemedicine) | ✅ Yes |
| Doctor Dashboard | ❌ None | 1 (telemedicine) | ✅ Yes |

### Critical Implementation Points

1. **Only use Cal.com widget on Doctor Profile page** after consultation type is selected
2. **Always pass patient ID** in Cal.com widget metadata
3. **Never store video links** in frontend state - always fetch fresh from API
4. **Handle payment page timing** - booking may not exist immediately after Cal.com booking
5. **Use authorization headers** for all protected endpoints
6. **Open Doxy.me in new window** - don't embed in iframe
7. **Show clear error messages** to users when things fail

### Implementation Priority

**Week 1 (Current):**
- ✅ Doctor profile with Cal.com widget
- ✅ Payment page
- ✅ Confirmation page
- ✅ Basic dashboard

**Week 2 (After Payment Integration):**
- ⏳ Complete payment flow testing
- ⏳ Email notification testing
- ⏳ Reminder system (backend handles this)

---

## Document Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| Jan 2024 | 1.0.0 | Initial documentation | [Your Name] |

---

**END OF DOCUMENT**

This documentation covers everything the frontend team needs to integrate the telemedicine feature. For questions not covered here, please contact the backend developer.