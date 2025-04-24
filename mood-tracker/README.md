# 📝 MoodTracker Journal

## Project Description
A modern, intuitive web application for tracking your daily moods, emotions, and activities. This application helps users monitor their emotional well-being, identify patterns in their mood changes, and understand how different activities affect their mental state.

## 🛠️ Tech Stack

### Core Technologies
- **React.js (v18.2.0)**
  - Functional Components
  - React Hooks (useState, useEffect, useContext, custom hooks)
  - React Router v6 for navigation

### State Management
- React Context API for:
  - Authentication state
  - Theme management
  - User profile data

### Styling
- CSS Modules for component-specific styling
- Custom CSS with CSS Variables for theming
- Responsive design using modern CSS features

### Backend & API
- Supabase for:
  - User Authentication
  - Real-time Database
  - File Storage (profile images)
  - REST API endpoints

### Development & Deployment
- Vite for build tooling
- GitHub Pages for deployment
- Environment variables for API configuration

## 🌟 Core Features

### 1. Authentication (`/login`)
- Email/Password authentication
- Protected routes
- User session management

### 2. Mood Logging (`/`)
- Emoji-based mood selection
- Activity tagging
- Intensity level slider
- Note taking capability
- Form validation for required fields

### 3. History & Analytics (`/history`)
- Interactive mood timeline chart
- Mood distribution visualization
- Activity correlation insights
- Filterable date ranges
- Data grid with sorting capabilities

### 4. Profile Management (`/settings`)
- Profile picture upload
- Theme toggling
- Account settings
- Data export functionality

## 📱 Responsive Design
- Mobile-first approach
- Breakpoints for:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Adaptive navigation (hamburger menu on mobile)
- Flexible grid layouts

## 🏗️ Project Structure

```
mood-tracker/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── MoodSelector/
│   │   ├── LoadingSpinner/
│   │   └── Charts/
│   ├── context/       # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── layout/        # Page layouts
│   │   ├── HomeLayout/
│   │   └── HistoryLayout/
│   ├── lib/           # Utilities & API
│   │   └── SupabaseClient.js
│   ├── hooks/         # Custom hooks
│   │   └── useTheme.js
│   └── pages/         # Route components
├── public/            # Static assets
└── .env.example       # Environment variables template
```

## 🚀 Live Demo

Visit the application: [MoodTracker Journal](https://AkshTheDev.github.io/MoodTrackerJournal)

## 📥 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AkshTheDev/MoodTrackerJournal.git
   cd MoodTrackerJournal/mood-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 📸 Screenshots

### Desktop View
![Desktop Home](screenshots/desktop-home.png)
*Home page with mood logging interface*

### Mobile View
![Mobile History](screenshots/mobile-history.png)
*History page on mobile showing responsive design*

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

## 👤 Author

**Akshansh Sinha**
- GitHub: [@AkshTheDev](https://github.com/AkshTheDev)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the framework
- Supabase team for backend services
- Chart.js team for visualization tools
- Course instructors and peers for guidance
