# Gym Progress Tracker

An AI-assisted full-stack web application for tracking workouts, monitoring strength progression, analyzing body weight trends, and generating personalized training insights.

Built as my first agentic web application, this project combines a React frontend, Express.js backend, PostgreSQL database, Prisma ORM, automated testing, Docker containerization, and AI-assisted development workflows.

## Overview

Gym Progress Tracker is designed as a personal digital workout notebook with an emphasis on clean architecture, data integrity, security, and useful progress analytics.

The application allows users to:

- Create an account and securely authenticate
- Log and manage workouts
- Track individual exercises and sets
- Monitor personal records and training volume
- Track body weight over time
- Set and monitor a goal weight
- Analyze exercise progression
- Search across workouts, exercises, notes, and body-weight entries
- Use an AI Coach to receive training insights and identify potential plateaus
- Customize units and application theme
- Manage a personal exercise library

## Key Features

### Authentication & Security

- HTTP-Only cookie-based JWT authentication
- SameSite=Strict cookie configuration
- Custom request-header CSRF defense
- bcrypt password hashing
- Authentication middleware and protected routes
- Login and registration rate limiting
- Production error-message sanitization
- No authentication tokens stored in localStorage

### Workout Tracking

- Active workout session tracking
- Exercise and set logging
- Weight and repetition tracking
- Set-level notes
- Workout duration tracking
- Workout history
- Workout editing and detailed workout views
- Real-time rest timer with Web Audio API support

### Progress Analytics

- Highest Weight Personal Record
- Best Single Set Volume
- Highest Workout Session Volume
- Total Lifetime Volume
- Average Session Duration
- Exercise-specific progression tracking
- Weekly and monthly volume analysis
- Interactive SVG-based charts

### Body Weight Tracking

- Daily body-weight entries
- Goal weight tracking
- Historical weight visualization
- 7-day rolling average
- 30-day rolling average
- Time-series progress visualization

### AI Coach

- Personalized training insights
- Workout-based recommendations
- Weekly training velocity analysis
- Plateau detection
- Exercise progression analysis
- Rule-assisted coaching logic
- LLM provider abstraction for AI integration

### Exercise Library

- Custom exercise management
- Exercise categories
- Equipment classification
- Exercise search and filtering
- Native PostgreSQL enums for domain integrity

### Global Search

- Keyboard-accessible global search
- Cmd + K / Ctrl + K support
- Exercise search
- Workout search
- Notes search
- Body-weight entry search
- PostgreSQL-backed search queries

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- TanStack React Query
- React Hook Form
- Axios
- Lucide React
- Vitest
- React Testing Library

### Backend

- Node.js 20
- Express.js
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- bcrypt
- Helmet
- Express Rate Limit
- CORS
- Compression
- Morgan

### Testing

- Vitest
- Supertest
- React Testing Library
- JSDOM

The backend contains integration tests covering authentication, workouts, analytics, body weight, search, AI Coach functionality, sanitization, health checks, and database enums.

### DevOps

- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Multi-stage Docker builds
- Automated database migrations

## Architecture

The application follows a layered full-stack architecture:

React SPA
    |
    v
Axios API Client
    |
    v
Express.js API
    |
    +-- Authentication
    +-- Validation
    +-- Security Middleware
    +-- Controllers
    |
    v
Service Layer
    |
    v
Repository Layer
    |
    v
Prisma ORM
    |
    v
PostgreSQL

The backend separates HTTP concerns from business logic and database access using controllers, services, and repositories.

## Database

The application uses PostgreSQL with Prisma ORM.

Several domain-specific fields use native PostgreSQL enums to provide database-level data integrity:

- ExperienceLevel
- UnitSystem
- Theme
- ExerciseCategory
- EquipmentType

Example exercise categories:

- CHEST
- BACK
- LEGS
- SHOULDERS
- ARMS
- CORE
- CARDIO
- FULL_BODY

Example equipment types:

- BARBELL
- DUMBBELL
- CABLE
- MACHINE
- BODYWEIGHT
- BAND
- OTHER

Database changes are managed through version-controlled Prisma migrations.

## Project Structure

gym-progress-tracker/

├── .github/
│   └── workflows/
│       └── ci.yml

├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── prompts/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   │
│   └── tests/

├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/

├── docker-compose.yml
├── CHANGELOG.md
├── LEARNING.md
├── PROJECT.md
└── README.md

## Local Development

### Prerequisites

Make sure you have:

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- Git

### Clone the Repository

git clone https://github.com/loffxzl/gym-progress-tracker.git

cd gym-progress-tracker

### Backend Setup

cd backend

npm install

Create a `.env` file from the provided example:

cp .env.example .env

Configure the database and authentication variables in `.env`.

Run the Prisma migrations:

npx prisma migrate dev

Generate the Prisma client:

npx prisma generate

Start the backend:

npm run dev

### Frontend Setup

Open another terminal:

cd frontend

npm install

npm run dev

The frontend will be available at:

http://localhost:5173

## Environment Variables

The repository does not contain real secrets.

Backend environment variables include:

- PORT
- NODE_ENV
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CORS_ORIGIN

Environment templates are provided in the repository.

Never commit real `.env` files, database credentials, API keys, or production secrets.

## Testing

### Backend

cd backend

npm test

npm run lint

### Frontend

cd frontend

npm test

npm run lint

npm run build

## Docker

The project includes Docker configuration for running the application as a multi-container stack.

Start the complete stack with:

docker compose up --build

The Docker setup includes:

- PostgreSQL
- Express backend
- Nginx frontend
- Automatic database migration during backend startup

## CI/CD

GitHub Actions is configured to automatically run project checks.

The CI pipeline validates the application through automated testing, linting, and production build checks.

This helps prevent broken code from being merged into the main branch.

## Security Design

Security was considered throughout the application architecture.

Authentication tokens are stored exclusively in HTTP-Only cookies and are not exposed to client-side JavaScript or localStorage.

Additional protections include:

- SameSite cookie policy
- Custom request-header CSRF defense
- Password hashing with bcrypt
- Authentication rate limiting
- Input validation with Zod
- Request sanitization
- Protected API routes
- Resource ownership checks
- Production error sanitization
- Security headers through Helmet
- CORS restrictions

## Project Status

This is my first agentic web application build.

The project was developed using an agentic AI-assisted software development workflow where AI tools were used alongside manual development to:

- Plan application architecture
- Implement features
- Debug application issues
- Audit security
- Design database migrations
- Write tests
- Analyze failures
- Improve documentation
- Validate the final application

The goal of the project was not only to build a working fitness application, but also to learn how to systematically develop, test, audit, and improve a full-stack application using modern engineering practices.

## What I Learned

Through this project I worked with:

- React application architecture
- REST API design
- Express.js middleware
- Authentication and authorization
- HTTP-Only cookie authentication
- CSRF protection
- Rate limiting
- Zod validation
- PostgreSQL
- Prisma ORM
- Database migrations
- PostgreSQL enums
- Repository and service-layer architecture
- React Query
- Data visualization
- Automated testing
- Docker
- Nginx
- GitHub Actions
- CI/CD concepts
- AI-assisted and agentic software development

## Future Improvements

Potential future improvements include:

- 1RM estimation using established formulas
- Workout routine templates
- Workout import/export
- Offline PWA support
- Progressive workout recommendations
- More advanced training analytics
- Social sharing of personal records
- Expanded AI coaching capabilities

## License

This project is currently intended primarily as a learning and portfolio project.

## Author

GitHub: https://github.com/loffxzl

Gym Progress Tracker
My first agentic full-stack web application.
