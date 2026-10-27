# Competitive Exam Portal

A full-stack MERN application for competitive exam preparation featuring mock tests, performance analytics, community posts, educational reels, and user profiles.

## Tech Stack

- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt (httpOnly cookies)
- **File Storage:** Cloudinary (images & videos)
- **Charts:** Recharts
- **Icons:** Lucide React

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (v20 recommended)
- [MongoDB](https://www.mongodb.com/) v6+ (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account (for media uploads)

## Project Structure

```
competitive-exam-portal/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route page components
│       ├── layouts/         # Layout wrappers
│       ├── context/         # React Context providers
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API service functions
│       ├── utils/           # Utility functions
│       └── App.jsx          # Root component
├── server/                  # Express backend
│   └── src/
│       ├── config/          # Database & cloud config
│       ├── controllers/     # Route handlers
│       ├── models/          # Mongoose models
│       ├── routes/          # Express routes
│       ├── middleware/       # Auth, error handling, uploads
│       ├── validators/      # Input validation
│       ├── utils/           # Utility classes
│       └── seeds/           # Database seed scripts
├── .env.example             # Environment template
└── README.md
```

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd competitive-exam-portal
```

### 2. Set up environment variables

```bash
cp .env.example server/.env
```

Edit `server/.env` with your values:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a strong random string) |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NODE_ENV` | `development` or `production` |

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Seed the database

```bash
cd server
npm run seed
```

This creates:
- 2 demo users (tushar@example.com / priya@example.com, password: `password123`)
- 6 mock tests across SSC, Banking, Railway, MPSC, UPSC categories
- 60 questions with explanations
- 4 sample community posts

### 5. Start the application

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Update password |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/dashboard/performance-chart` | Performance chart data |

### Mock Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tests` | List mock tests |
| GET | `/api/tests/:id` | Test details |
| POST | `/api/tests/:id/start` | Start a test |
| POST | `/api/tests/attempts/:attemptId/submit` | Submit test |
| GET | `/api/tests/attempts/:attemptId/result` | View results |
| GET | `/api/tests/history` | Test history |

### Community Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get posts feed |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/saved` | Get saved posts |
| GET | `/api/posts/:id` | Get single post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comments` | Add comment |
| DELETE | `/api/posts/:id/comments/:commentId` | Delete comment |
| POST | `/api/posts/:id/save` | Toggle save |

### Reels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reels` | Get reels feed |
| POST | `/api/reels` | Upload reel |
| GET | `/api/reels/saved` | Get saved reels |
| GET | `/api/reels/:id` | Get single reel |
| PUT | `/api/reels/:id` | Update reel |
| DELETE | `/api/reels/:id` | Delete reel |
| POST | `/api/reels/:id/like` | Toggle like |
| POST | `/api/reels/:id/comments` | Add comment |
| DELETE | `/api/reels/:id/comments/:commentId` | Delete comment |
| POST | `/api/reels/:id/save` | Toggle save |
| GET | `/api/reels/:id/share` | Get share link |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/profile/posts` | User's posts |
| GET | `/api/profile/reels` | User's reels |
| GET | `/api/profile/analytics` | Performance analytics |

## Features

### 🎯 Mock Tests
- Multiple exam categories (SSC, Banking, Railway, MPSC, UPSC)
- Timed tests with auto-submit
- Question navigation with mark for review
- Detailed results with explanations
- Score calculation with negative marking

### 📊 Performance Analytics
- Score trends over time
- Subject-wise performance breakdown
- Accuracy tracking
- Historical comparisons

### 💬 Community Posts
- Create text and image posts
- Like, comment, and save posts
- Edit and delete your own content
- Sort by newest or most popular

### 🎬 Educational Reels
- Upload short educational videos
- Like, comment, share, and save reels
- Vertical video feed experience
- Hashtag support

### 👤 User Profile
- Profile management with avatar upload
- View personal posts, reels, and saved content
- Test history and performance stats
- Secure password change

## Security

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication via httpOnly cookies
- Rate limiting on auth routes
- Helmet security headers
- CORS configured for frontend origin
- Input validation with express-validator
- Ownership checks on all mutations
- File upload size/type validation
- No passwords or secrets in API responses

## Design Decisions

- **Cookie-based JWT:** httpOnly cookies prevent XSS attacks on tokens. SameSite=lax prevents CSRF for GET requests. The trade-off is cookies are less flexible for multi-domain setups.
- **Embedded Comments:** Comments are embedded in Post/Reel documents for simplicity and read performance. For very high-volume commenting, separate collections would be better.
- **Likes as Arrays:** User IDs in likes arrays enable simple duplicate prevention and toggling. For millions of likes, a separate Likes collection with indexes would scale better.
- **Cloudinary for Media:** Offloads storage and provides CDN, transformations, and optimization out of the box.

## Testing

```bash
cd server
npm test
```

## License

MIT
