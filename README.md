# 🏠 Key-2-Rent - Property Rental Marketplace

A modern, secure property rental platform built for Machakos, Kenya. Connect landlords with tenants through an intuitive interface with AI-powered features.

## ✨ Features

### 🔐 Authentication
- Email/Password signup and login
- Phone number (OTP) authentication
- GitHub OAuth integration
- Secure user profile management

### 🏢 Property Listings
- **Categorized View**: Browse properties organized by type (Bedsitter, 1BR, 2BR, Business, etc.)
- **Grid View**: Traditional listing grid with filters
- **Advanced Filtering**: Filter by location, property type, and price range
- **Image Upload**: Automatic compression and optimization
- **AI Image Analysis**: Get suggestions for improving your listings
- **Status Management**: Track vacancy status (Vacant, Occupied, Available Soon)

### 👤 User Features
- Personal listing dashboard
- Quick status updates
- Contact information protection
- Listing management (create, update, delete)

### 🎨 Modern UI
- Dark/Light mode toggle
- Responsive design for all devices
- Smooth animations and transitions
- Accessible components (Radix UI)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Google AI API key (for image analysis)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sieless/studio1.git
   cd Key-2-Rent
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   ```

4. **Deploy Firestore rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:9002](http://localhost:9002)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── listings/[id]/     # Individual listing page
│   ├── my-listings/       # User dashboard
│   ├── login/             # Authentication
│   └── signup/            # User registration
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── categorized-listing-grid.tsx  # NEW: Category-based view
│   ├── listing-card.tsx  # Listing display card
│   └── header.tsx        # Navigation header
├── firebase/             # Firebase configuration
│   ├── config.ts         # Firebase credentials
│   ├── storage-enhanced.ts  # NEW: Enhanced image upload
│   └── index.ts          # Firebase initialization
├── lib/                  # Utility functions
│   ├── validation.ts     # NEW: Input validation
│   ├── image-utils.ts    # NEW: Image compression
│   ├── error-handler.ts  # NEW: Error handling
│   └── utils.ts          # General utilities
└── types/                # TypeScript types
    └── index.ts          # Data models
```

## 🔒 Security Features

- ✅ Environment variable protection for API keys
- ✅ Firestore security rules enforcing ownership
- ✅ Input sanitization and validation
- ✅ XSS protection
- ✅ Secure file upload paths
- ✅ Phone number validation (Kenyan format)
- ✅ Image file type and size restrictions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Genkit
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 📝 Available Scripts

```bash
npm run dev          # Start development server (port 9002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run genkit:dev   # Start Genkit AI development server
```

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Firebase:
```bash
npm run build
firebase deploy
```

## 🐛 Troubleshooting

### Images not uploading?
- Check Firebase Storage is enabled
- Verify storage rules are deployed
- Ensure images are < 5MB and JPEG/PNG/WebP

### Authentication failing?
- Check environment variables are set
- Enable auth methods in Firebase Console
- For Phone: Verify billing is set up

### Permission denied errors?
- Redeploy Firestore rules: `firebase deploy --only firestore:rules`
- Check user is logged in
- Verify user owns the resource

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support:
- Email: titwzmaihya@gmail.com
- GitHub: [@sieless](https://github.com/sieless)

---

**Built with ❤️ for Machakos, Kenya**
