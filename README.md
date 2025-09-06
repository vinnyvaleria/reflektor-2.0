# Reflektor 2.0

**Reflektor** is a full-stack pixel-style puzzle game inspired by mirror mechanics. Built with SvelteKit, Prisma, and modern web technologies, players control a character navigating a main grid while a mirrored NPC follows on an inverted grid. The objective is to reach the goal without hitting obstacles on either side.

![Reflektor Gameplay](./static/game-screenshot.png)

## 🎯 Project Overview

**Reflektor 2.0** represents a complete evolution from the original HTML/CSS/JavaScript prototype to a full-featured web application with user authentication, database persistence, multiple game modes, and competitive leaderboards. The game challenges players to think about spatial patterns and movement while managing mirrored grid logic.

## 🎮 Game Modes

### 🎲 Freeplay Mode

- **3-minute time limit** with continuous puzzle generation
- **Multiple difficulties**: Easy (5×5), Medium (7×7), Hard (9×9)
- **Score-based gameplay** with global leaderboards
- **Guest and registered user support**
- Perfect for quick competitive sessions

### 📖 Story Mode

- **30 handcrafted levels** with progressive difficulty
- **3-star rating system** based on performance
- **Level progression** that unlocks new challenges
- **Persistent progress tracking** for registered users

## 🧱 Core Mechanics

- **Mirror Logic**: Your NPC companion moves in opposite horizontal directions
- **Grid Navigation**: Use arrow keys or on-screen controls for movement
- **Helper Tools**:
  - 🔨 **Hammer** - Remove walls/obstacles
  - 🪓 **Axe** - Cut down trees
  - 🔪 **Sickle** - Clear grass patches
- **Obstacle Avoidance**: Navigate around randomly generated barriers
- **Goal Achievement**: Reach the target (X) to complete puzzles

## 🛠 Technology Stack

### Frontend

- **SvelteKit** - Full-stack web framework
- **Svelte 5** - Component framework with modern reactivity
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend & Database

- **Prisma ORM** - Database toolkit and query builder
- **SQLite** (development) / **PostgreSQL** (production)
- **Auth.js (SvelteKit)** - Authentication system
- **bcryptjs** - Password hashing

### Infrastructure

- **Vercel** - Deployment platform
- **Neon** - Serverless PostgreSQL (production)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd reflektor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # Authentication
   AUTH_SECRET="your-auth-secret-here"
   JWT_SECRET="your-jwt-secret-here"
   TOKEN_EXPIRES_IN="30d"

   # Environment
   NODE_ENV="development"
   PUBLIC_BASE_URL="http://localhost:5173"
   ```

4. **Set up the database**

   ```bash
   npm run db:setup
   ```

   This will:
   - Generate Prisma client
   - Push schema to database
   - Seed initial data

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   ├── server/
│   │   ├── auth.js         # Authentication configuration
│   │   └── database.js     # Prisma client setup
│   └── stores/             # Svelte stores for state management
├── routes/
│   ├── api/                # API endpoints
│   │   ├── auth/           # Authentication routes
│   │   ├── game/           # Game session management
│   │   ├── leaderboard/    # Leaderboard data
│   │   └── user/           # User progress tracking
│   ├── auth/               # Authentication pages
│   ├── freeplay/           # Freeplay game mode
│   ├── story/              # Story mode
│   └── leaderboard/        # Leaderboard views
├── app.html                # Main HTML template
└── app.d.ts               # TypeScript declarations

prisma/
├── schema.prisma           # Database schema
└── seed.js                # Database seeding

static/                     # Static assets
├── api-test.html          # API testing interface
└── assets/                # Game assets and images
```

## 🎯 Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database Management

```bash
npm run db:setup         # Initial database setup
npm run db:push          # Push schema changes
npm run db:seed          # Seed database with initial data
npm run db:reset         # Reset and reseed database
npm run db:studio        # Open Prisma Studio
```

### Code Quality

```bash
npm run format           # Format code with Prettier
npm run lint             # Run ESLint
npm run check            # Type checking with Svelte
```

### Testing & Deployment

```bash
npm run test:api         # Open API testing interface
npm run deploy           # Deploy to Vercel
npm run deploy:prod      # Deploy to production
```

## 🏗 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - User login

### Game Management

- `POST /api/game/start` - Start new game session
- `POST /api/game/move` - Submit player move
- `POST /api/game/helper` - Use helper tool
- `POST /api/game/complete` - Complete puzzle/session

### Data & Progress

- `GET /api/leaderboard` - Fetch leaderboard data
- `GET /api/user/progress` - Get user progress and stats

## 🏆 Features

- ✅ **User Authentication** - Secure sign-up/sign-in system
- ✅ **Multiple Game Modes** - Freeplay and Story modes
- ✅ **Persistent Progress** - Database-backed save system
- ✅ **Global Leaderboards** - Competitive scoring system
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Guest Play Support** - Play without account creation
- ✅ **Real-time Feedback** - Instant game state updates
- ✅ **Difficulty Scaling** - Multiple grid sizes and complexity
- ✅ **Helper Tool System** - Strategic obstacle removal
- ✅ **Pixel Art Styling** - Retro game aesthetics

## 🚀 Deployment

### Environment Setup

1. Set up a Neon PostgreSQL database
2. Configure environment variables for production
3. Update `DATABASE_URL` to point to your production database

### Vercel Deployment

```bash
# Quick deploy
npm run deploy

# Production deployment
npm run deploy:prod
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."  # Neon database URL
AUTH_SECRET="production-secret"
JWT_SECRET="production-jwt-secret"
NODE_ENV="production"
PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

## 🎨 Design Credits

- **Fonts**: [Google Fonts - Pixelify Sans & Jersey 10](https://fonts.google.com/)
- **Game Background**: Pixel Art Backgrounds by Fez Escalante
- **Tool Icons**: Various pixel art asset sources
- **UI Design**: Custom pixel-perfect interface elements

## 📚 Game Evolution

**Reflektor 2.0** represents a significant evolution from the original prototype:

### Version 1.0 (Original)

- Simple HTML/CSS/JavaScript
- Single 5×5 grid mode
- Local storage only
- No user accounts

### Version 2.0 (Current)

- Full-stack SvelteKit application
- Multiple game modes and difficulty levels
- Database persistence with Prisma
- User authentication and progress tracking
- Global leaderboards and competitive features
- Modern responsive design
- RESTful API architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for personal and educational use. All assets and source code are owned by the developer unless otherwise stated.

---

**Designed and developed by Vinny Valeria** 🎮

_A pixel-perfect puzzle adventure that challenges your spatial thinking!_
