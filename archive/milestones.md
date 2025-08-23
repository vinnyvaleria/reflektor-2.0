# Reflektor 2.0: Milestones (Game First, Auth Later)

## 🎮 **PHASE 1: Core Game Development** (Days 1-6)

### **Day 1: Database Setup & Map Generation**

**Goal**: Auto-generate playable game maps

#### 🅿️ Planned Tasks:

- [ ] Clean up project structure (remove backend folder)
- [ ] Set up local .env with SQLite
- [ ] Create simplified Prisma schema (Game data only, no User initially)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create map generator (`src/lib/server/mapGenerator.js`)
- [ ] Create game start API (`src/routes/api/game/start/+server.js`)
- [ ] Test map generation with `npx prisma studio`

**✅ Day 1 Success Criteria:**

- Database generates and stores game maps
- Can create new games via API
- Maps are solvable (have valid path)

### **Day 2: Basic Game Interface**

**Goal**: Display playable game grids

#### 🅿️ Planned Tasks:

- [ ] Create GameGrid component (`src/lib/components/GameGrid.svelte`)
- [ ] Create game page layout (`src/routes/game/+page.svelte`)
- [ ] Display main grid and mirrored grid side by side
- [ ] Show player (P) and goal (X) positions
- [ ] Style grids with Tailwind (pixel art aesthetic)
- [ ] Add game info display (round counter, difficulty)
- [ ] Create "New Game" button that calls API

**✅ Day 2 Success Criteria:**

- Game page displays two grids correctly
- Can start new games and see different maps
- UI looks like original Reflektor game

### **Day 3: Player Movement System**

**Goal**: Working game mechanics

#### 🅿️ Planned Tasks:

- [ ] Create movement API (`src/routes/api/game/move/+server.js`)
- [ ] Implement collision detection and boundary checking
- [ ] Add player movement in main grid
- [ ] Add mirrored NPC movement in secondary grid
- [ ] Add keyboard controls (arrow keys)
- [ ] Add on-screen arrow buttons
- [ ] Test: Player and NPC move in opposite directions

**✅ Day 3 Success Criteria:**

- Player moves with arrow keys and buttons
- NPC mirrors movement horizontally
- Collision detection prevents invalid moves
- Game over condition works

### **Day 4: Helper Tools & Game Logic**

**Goal**: Complete game mechanics

#### 🅿️ Planned Tasks:

- [ ] Create HelperTools component (`src/lib/components/HelperTools.svelte`)
- [ ] Implement obstacle removal (hammer/axe/sickle)
- [ ] Add helper usage limits and tracking
- [ ] Create win detection logic
- [ ] Add game over and win modals
- [ ] Implement game reset functionality
- [ ] Add step counter and timer
- [ ] Test complete game flow

**✅ Day 4 Success Criteria:**

- Helper tools work with usage limits
- Win/lose conditions trigger correctly
- Game can be reset and replayed
- All original game mechanics work

### **Day 5: Multiple Difficulties & Polish**

**Goal**: Enhanced game experience

#### 🅿️ Planned Tasks:

- [ ] Add medium (7x7) and hard (9x9) difficulty levels
- [ ] Create difficulty selection screen
- [ ] Improve map generation for larger grids
- [ ] Add game session persistence (save/resume)
- [ ] Add smooth animations for movements
- [ ] Implement hover effects and visual feedback
- [ ] Add sound effects (optional)
- [ ] Mobile responsiveness

**✅ Day 5 Success Criteria:**

- All three difficulty levels work
- Games can be paused and resumed
- Smooth, polished game experience
- Works on mobile devices

### **Day 6: Basic Leaderboard (Local)**

**Goal**: Score tracking without accounts

#### 🅿️ Planned Tasks:

- [ ] Create simple leaderboard system (no users yet)
- [ ] Implement score calculation algorithm
- [ ] Save completed games to database
- [ ] Create leaderboard page (`src/routes/leaderboard/+page.svelte`)
- [ ] Display top scores by difficulty
- [ ] Add "Enter Name" prompt for high scores
- [ ] Style leaderboard with rankings
- [ ] Test: Play game, get high score, see on leaderboard

**✅ Day 6 Success Criteria:**

- Completed games save scores
- Leaderboard displays top players
- Players can enter names for high scores
- **FULLY PLAYABLE GAME** 🎉

---

## 🔐 **PHASE 2: Authentication & User System** (Days 7-9)

### **Day 7: User System & Authentication**

**Goal**: Convert to user-based system

#### 🅿️ Planned Tasks:

- [ ] Add User model to Prisma schema
- [ ] Create authentication utilities (`src/lib/server/auth.js`)
- [ ] Create login/register APIs
- [ ] Create authentication hook (`src/hooks.server.js`)
- [ ] Create login page (`src/routes/login/+page.svelte`)
- [ ] Create register page (`src/routes/register/+page.svelte`)
- [ ] Update game to associate with logged-in users
- [ ] Test authentication flow

**✅ Day 7 Success Criteria:**

- Users can register and login
- Games are associated with user accounts
- Protected routes work (redirect to login)

### **Day 8: Personal vs Global Leaderboards**

**Goal**: Enhanced ranking system

#### 🅿️ Planned Tasks:

- [ ] Update leaderboard to use User relationships
- [ ] Migrate existing anonymous scores (optional)
- [ ] Create personal best tracking
- [ ] Add user profile pages
- [ ] Display both global and personal rankings
- [ ] Add user statistics (games played, best times)
- [ ] Implement real-time leaderboard updates
- [ ] Add social features (view other players' profiles)

**✅ Day 8 Success Criteria:**

- Personal and global leaderboards work
- Users can track their progress over time
- Real-time updates when new scores achieved

### **Day 9: Advanced Features & Polish**

**Goal**: Professional user experience

#### 🅿️ Planned Tasks:

- [ ] Add game history (view past games)
- [ ] Implement achievement system
- [ ] Add user preferences (dark mode, sound settings)
- [ ] Create user dashboard
- [ ] Add social sharing for high scores
- [ ] Implement friend system (optional)
- [ ] Add email verification (optional)
- [ ] Final UI/UX polish

**✅ Day 9 Success Criteria:**

- Rich user experience with profiles and history
- Optional social features working
- Professional-looking interface

---

## 🚀 **PHASE 3: Testing & Deployment** (Days 10-14)

### **Day 10-11: Testing & Bug Fixes**

**Goal**: Stable, polished application

- [ ] Comprehensive testing of all features
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Fix any discovered bugs

### **Day 12-13: Production Setup**

**Goal**: Ready for deployment

- [ ] Set up production PostgreSQL database
- [ ] Configure secure environment variables
- [ ] Set up monitoring and error tracking
- [ ] Final security review

### **Day 14: Launch**

**Goal**: Live application

- [ ] Deploy to production (Vercel)
- [ ] Set up custom domain (optional)
- [ ] Final testing and optimization
- [ ] Launch celebration! 🎉
