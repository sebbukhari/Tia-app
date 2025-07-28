# Tia Charity App - Technical Documentation

## Project Overview

Tia Charity App is a complete cross-platform mobile application built with React Native (frontend) and Node.js/Express (backend) for charitable donations and community engagement.

## Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with MongoDB
- **Authentication**: JWT with refresh tokens
- **Payment Processing**: Stripe integration
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM

### Frontend (React Native)
- **Framework**: React Native 0.72+
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6
- **Payment**: Stripe React Native SDK
- **UI Components**: Native components with custom styling

## Key Features Implemented

### Authentication & Security
- ✅ User registration and login
- ✅ JWT token authentication with auto-refresh
- ✅ Password reset via email
- ✅ Email verification
- ✅ Secure password hashing (bcrypt)
- ✅ Input validation and sanitization

### User Management
- ✅ User profiles with preferences
- ✅ Donation history tracking
- ✅ Event participation tracking
- ✅ Account deactivation

### Donation System
- ✅ Secure payment processing with Stripe
- ✅ One-time and recurring donations
- ✅ Multiple donation categories
- ✅ Anonymous donation support
- ✅ Receipt generation
- ✅ Donation statistics and analytics

### Event Management
- ✅ Event creation and management
- ✅ Event registration and volunteering
- ✅ Geospatial event search
- ✅ Event categories and filtering
- ✅ Waitlist support
- ✅ Attendee check-in system

### Mobile App Features
- ✅ Cross-platform React Native app
- ✅ Redux state management
- ✅ Secure token storage
- ✅ Onboarding flow
- ✅ Tab-based navigation
- ✅ Form validation
- ✅ Error handling
- ✅ Offline-ready architecture

## Database Models

### User Model
```javascript
{
  firstName, lastName, email, password,
  phone, dateOfBirth, profileImage,
  address: { street, city, state, zipCode, country },
  role: 'user' | 'volunteer' | 'admin',
  preferences: { notifications, donationReminders, ... },
  totalDonated, volunteerHours,
  isEmailVerified, isActive
}
```

### Donation Model
```javascript
{
  user, amount, currency, type, category,
  stripePaymentIntentId, status, paymentMethod,
  isAnonymous, message, dedicatedTo,
  recurringSchedule: { frequency, nextPaymentDate, ... },
  receipt: { receiptNumber, taxDeductible, ... }
}
```

### Event Model
```javascript
{
  title, description, category, type,
  startDate, endDate, location,
  organizer, capacity, registeredCount,
  attendees: [{ user, status, registeredAt }],
  volunteers: [{ user, role, registeredAt }],
  status: 'draft' | 'published' | 'cancelled' | 'completed'
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password` - Reset password
- `PATCH /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/preferences` - Update preferences
- `GET /api/users/donations` - Get donation history
- `GET /api/users/events` - Get user events

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get user donations
- `GET /api/donations/stats` - Get public donation stats
- `PATCH /api/donations/:id/cancel` - Cancel recurring donation

### Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/volunteer` - Register as volunteer

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook handler

## Security Features

### Backend Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Input Validation**: Express-validator
- **MongoDB Injection Protection**: mongo-sanitize
- **XSS Protection**: xss-clean
- **JWT Security**: Secure token handling

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **Token Encryption**: JWT with expiration
- **Input Sanitization**: Prevent injection attacks
- **Error Handling**: Secure error responses

## Development Setup

### Prerequisites
- Node.js 16+
- MongoDB
- React Native development environment
- Stripe account (for payments)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure environment variables
npm run ios    # or npm run android
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tia-charity
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

### Frontend (.env)
```
API_BASE_URL=http://localhost:3000/api
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing Strategy

### Backend Testing
- Unit tests for models and utilities
- Integration tests for API endpoints
- Stripe webhook testing
- Security testing

### Frontend Testing
- Component unit tests
- Redux store testing
- Integration tests for user flows
- Payment flow testing

## Deployment Considerations

### Backend Deployment
- Environment configuration
- Database setup and migrations
- Stripe webhook configuration
- Email service setup
- SSL/TLS certificates

### Mobile App Deployment
- iOS App Store submission
- Google Play Store submission
- Code signing and certificates
- Environment-specific builds

## Future Enhancements

### Planned Features
- Push notifications
- Real-time chat support
- Social media integration
- Multi-language support
- Advanced analytics dashboard
- Volunteer hour tracking
- Campaign management
- In-app messaging

### Technical Improvements
- GraphQL API implementation
- Microservices architecture
- CDN for static assets
- Advanced caching strategies
- Performance monitoring
- Automated testing pipelines

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

## License

This project is licensed under the GPL v2 License - see the [LICENSE](../LICENSE) file for details.