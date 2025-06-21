# PushGrade

AI-Powered Mock Interview Platform

---

## 🚀 Overview
PushGrade is an advanced AI-powered mock interview platform designed to help users prepare for real-world interviews. It leverages the latest in AI, voice technology, and real-time data to deliver a seamless, interactive, and personalized interview experience.

---

## ✨ Features
- **AI-Generated Interview Questions**: Dynamic, role-specific questions powered by Google Gemini AI.
- **Voice Interaction**: Practice interviews with VY Voice AI for realistic, spoken Q&A.
- **Real-Time Feedback**: Instant, AI-driven feedback and scoring after each session.
- **Secure Authentication**: User accounts and session management via Clerk.
- **File Uploads**: Upload resumes, documents, and more with UploadThing.
- **Real-Time Data**: Live updates and chat using Socket.io.
- **Beautiful UI**: Responsive, accessible design with Shadcn UI and Tailwind CSS.
- **Dark/Light Theme**: Toggle and persist user theme preferences.
- **Performance Optimized**: Lazy loading, caching, and infinite scroll for a smooth experience.
- **Error Boundaries & 404**: Friendly error and not-found pages for robust UX.
- **Unit Testing**: Jest and React Testing Library for reliable, maintainable code.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini AI, VY Voice AI
- **File Uploads**: UploadThing
- **Real-Time**: Socket.io
- **State/Data**: TanStack React Query
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PushGrade.git
cd PushGrade/ai-mach-interview-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in `ai-mach-interview-system/`:
```env
# MongoDB
MONGODB_URI=your-mongodb-uri

# Clerk
CLERK_SECRET_KEY=your-clerk-secret
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

# UploadThing
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# VY Voice AI
VY_API_KEY=your-vy-api-key
```

### 4. Run the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### Deploy to Vercel
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com/) and import your repo.
3. Set environment variables in the Vercel dashboard.
4. Click **Deploy**.

### Production Environment Variables
Set the same variables as in `.env.local` in your Vercel project settings.

---

## 🧪 Testing
- Run all unit tests:
  ```bash
  npm test
  ```
- Tests are located in `src/components/__tests__/` and use Jest + React Testing Library.

---

## 📦 Project Structure
```
ai-mach-interview-system/
├── src/
│   ├── app/           # Next.js app directory (routes, pages, API)
│   ├── components/    # UI and feature components
│   ├── lib/           # Utilities, DB, socket, cache
│   ├── models/        # Mongoose models
│   └── ...
├── public/            # Static assets
├── jest.config.js     # Jest configuration
├── babel.config.js    # Babel configuration
├── ...
```

---

## 🔒 Security & Best Practices
- All sensitive keys are stored in environment variables.
- API routes are protected and validated.
- Error boundaries and 404 pages for robust UX.
- Linting and formatting enforced.

---

## 🤝 Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License
[MIT](LICENSE)

---

## 🙋‍♂️ Questions?
Open an issue or contact [@your-username](https://github.com/pratyush-Chandra) on GitHub.

---

**PushGrade – Level up your interview prep with AI!**
