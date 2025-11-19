# 🎤 Beatbox Mic - Professional Preset Analyzer & Live Processor

A web application where beatboxers upload professional audio recordings to extract EQ curves, compression settings, and reverb characteristics. Users can then apply these analyzed presets to their own microphone in real-time for live beatboxing with professional-grade sound.

## 🎯 Features

### Core Audio Processing
- ✅ **Advanced DSP Analysis** - FFT-based frequency analysis, dynamic range detection, reverb estimation
- ✅ **Real-Time Processing** - <20ms latency audio processing chain using Web Audio API
- ✅ **10-Band Parametric EQ** - Professional-grade equalizer with smooth parameter transitions
- ✅ **Dynamic Compression** - Automatic detection and application of compression settings
- ✅ **Reverb Processing** - Multiple reverb types (room, hall, plate, spring)
- ✅ **Live Visualization** - Real-time waveform and spectrum analyzer

### Platform Features
- 🔐 **Authentication** - NextAuth with email/password + OAuth (Google, GitHub, Facebook)
- 📦 **Preset Library** - Community-driven preset sharing with search, filter, and pagination
- 💬 **Social Features** - Comments, likes, follows, notifications
- 💳 **Subscriptions** - Stripe integration with Free/Premium/Pro tiers
- 📊 **Analytics** - Track views, downloads, and preset performance
- ⚡ **Admin Panel** - Moderation tools and system monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 15+ database
- AWS S3 or Cloudflare R2 (for audio file storage)
- Stripe account (for payments)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/beatbox-mic.git
cd beatbox-mic

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Start database (using Docker)
docker-compose up -d db redis

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database with sample data (optional)
npm run db:seed

# 7. Start development server
npm run dev

# 8. Open http://localhost:3000
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🎨 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: TailwindCSS 3.4 with custom design system
- **UI Components**: Radix UI (headless, accessible)
- **Audio Processing**: Web Audio API (native browser API)
- **Audio Analysis**: Meyda.js + custom FFT algorithms
- **Visualization**: Canvas API + D3.js
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 20 LTS
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL 15 + Prisma ORM
- **Authentication**: NextAuth.js v4
- **File Storage**: AWS S3 / Cloudflare R2
- **Email**: SendGrid / Resend
- **Payments**: Stripe

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking)
- **Analytics**: Plausible / PostHog

## 📁 Project Structure

```
beatbox-mic/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # User dashboard
│   ├── (marketing)/       # Public pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, inputs)
│   ├── audio/            # Audio-specific components
│   ├── presets/          # Preset-related components
│   └── layout/           # Layout components (header, footer)
├── lib/                   # Core libraries
│   ├── audio/            # Audio processing (CORE)
│   │   ├── analysis.ts   # FFT analysis, EQ/compression detection
│   │   └── processor.ts  # Real-time audio processing
│   ├── api/              # Business logic
│   ├── db/               # Database utilities
│   └── utils/            # Helper functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
├── types/                # TypeScript type definitions
├── hooks/                # React hooks
├── store/                # Zustand stores
├── public/               # Static assets
└── tests/                # Tests (unit, integration, E2E)
```

## 🎛️ How It Works

### 1. Upload Audio
Users upload a professional beatbox recording (MP3, WAV, OGG, M4A)

### 2. Analysis
The system performs DSP analysis:
- **FFT Analysis**: Extracts frequency response across 10 EQ bands
- **Dynamic Range Analysis**: Detects compression settings (threshold, ratio, attack/release)
- **Reverb Detection**: Estimates reverb type and wet/dry mix
- **Spectral Analysis**: Identifies filters and limiting

### 3. Preset Generation
Detected settings are saved as a preset with:
- 10-band EQ curve
- Compressor parameters
- Reverb settings
- Metadata and tags

### 4. Live Application
Users apply presets to their microphone in real-time:
- <20ms latency processing
- Smooth parameter transitions
- Real-time visualization
- Clipping detection

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run format       # Format code with Prettier
```

## 🔒 Security

- ✅ **Authentication**: Secure password hashing (bcrypt), JWT tokens, 2FA support
- ✅ **Input Validation**: Zod schemas for all inputs, MIME type verification
- ✅ **XSS Protection**: DOMPurify for user-generated content
- ✅ **SQL Injection**: Prisma ORM with parameterized queries
- ✅ **CSRF Protection**: NextAuth automatic CSRF tokens
- ✅ **Rate Limiting**: Prevent brute force and DoS attacks
- ✅ **File Upload**: Malware scanning, size limits, MIME validation
- ✅ **HTTPS Only**: Force HTTPS, HSTS headers
- ✅ **Data Encryption**: Encrypted sensitive fields (2FA secrets, etc.)

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

Ensure all environment variables from `.env.example` are set in your production environment.

## 📊 Performance

- **Latency**: <20ms (microphone input → processed output)
- **FFT Processing**: Optimized with Float32Array and Web Workers
- **UI**: 60fps during real-time audio processing
- **Lighthouse Score**: >90 on all metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Web Audio API documentation
- Meyda.js for audio feature extraction
- Radix UI for accessible components
- Vercel for hosting platform

## 📧 Support

For questions or issues:
- GitHub Issues: [github.com/yourusername/beatbox-mic/issues](https://github.com/yourusername/beatbox-mic/issues)
- Email: support@beatboxmic.com

---

**Built with ❤️ for the beatbox community**
