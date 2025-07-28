# Tia Charity App

A complete cross-platform mobile application for charity purposes that works on both iOS and Android devices.

## 🌟 Features

### Core Features
- **User Registration & Authentication** - Secure signup and login
- **Donation Interface** - Secure payment processing with Stripe
- **Charity Information** - Mission display and organization details
- **Event Management** - Listing and participation in charity events
- **Volunteer Registration** - Sign up for volunteer opportunities
- **News & Updates** - Stay informed with latest charity news
- **User Profile** - Manage personal information and preferences
- **Donation History** - Track all past donations
- **Contact & Support** - Easy communication with charity

### Technical Features
- Cross-platform mobile app (iOS & Android)
- Secure authentication with JWT
- Real-time updates for donations and events
- Offline capability for basic features
- Push notifications
- Analytics integration
- Multi-language support preparation
- Accessibility features

## 🏗️ Architecture

### Frontend
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
- **UI Components**: Native Base / React Native Elements
- **Payment**: Stripe React Native SDK

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Processing**: Stripe
- **Real-time**: Socket.io
- **Email**: Nodemailer

## 📁 Project Structure

```
├── frontend/          # React Native mobile app
├── backend/           # Node.js/Express API server
├── docs/             # Documentation
├── README.md         # This file
└── LICENSE           # GPL v2 License
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- MongoDB
- Android Studio / Xcode for mobile development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sebbukhari/Tia-app.git
   cd Tia-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # For iOS
   cd ios && pod install && cd ..
   # Start the app
   npm run ios    # or npm run android
   ```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories with the required configuration:

#### Backend (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tia-charity
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

#### Frontend (.env)
```
API_BASE_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Mobile App Features

### Authentication
- Secure registration and login
- Password reset functionality
- Biometric authentication support

### Donations
- Multiple payment methods
- Recurring donation options
- Tax receipt generation
- Donation goal tracking

### Events
- Browse upcoming events
- Register for events
- Share events with friends
- Calendar integration

### Volunteer
- Browse volunteer opportunities
- Sign up for volunteer shifts
- Track volunteer hours
- Skill-based volunteering

## 🔒 Security

- HTTPS/TLS encryption
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- OWASP security guidelines compliance
- Secure payment processing

## 🌍 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the GPL v2 License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@tia-charity.org or join our community Discord.

## 🙏 Acknowledgements

- React Native community
- Express.js team
- MongoDB team
- Stripe for payment processing
- All our volunteers and contributors