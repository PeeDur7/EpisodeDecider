# 🎲 EpisodeRoulette

EpisodeRoulette is a personal mobile app designed to eliminate **decision fatigue** by randomly selecting an episode from a TV show and launching it directly on your preferred streaming service. It is built for users who enjoy **low-plot, episodic shows**, where choosing an episode often takes longer than watching one.

Instead of scrolling through seasons, reading episode descriptions, and overthinking, EpisodeRoulette lets users start watching instantly with a single tap.

---

## 🚀 Features

- **User Authentication**
  - Sign up, login, logout, and forgot password functionality using Firebase Authentication

- **Episode Randomization**
  - Random episode from all seasons
  - Random episode from a single selected season
  - Random episode from a custom season range defined by the user

- **Streaming Service Preferences**
  - Users can choose preferred streaming services
  - Preferred services appear first when episode links are available

- **Dynamic Search**
  - Live search results update as the user types
  - Supports fast discovery of TV shows

- **Recently Watched Tracking**
  - Stores the 20 most recently watched shows and episodes
  - One-click access to previous content without re-searching

- **Direct Episode Launch**
  - Opens the selected episode directly on the supported streaming platform

---

## 🛠 Tech Stack

### Frontend
- React Native  
- TypeScript  
- Expo  

### Backend & Authentication
- Firebase Authentication  
- Firebase configuration for user data  

### APIs
- TMDB (The Movie Database)  
- TVMaze  
- RapidAPI  

---

## 📱 Installation & Setup

This app is intended to **run locally on a mobile device or emulator** and is not deployed to an app store.

### Prerequisites
- Node.js  
- npm  
- Expo CLI  
- React Native development environment (Xcode or Android Studio)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EpisodeRoulette.git
   cd EpisodeRoulette

**2. Install dependencies**

  - npm install
  - npm install firebase

**3. Environment Variables**

   Create a .env file in the project root and add the following:

  - TMDB_API_KEY=your_tmdb_key
  - TVMAZE_API_KEY=your_tvmaze_key
  - RAPID_API_KEY=your_rapidapi_key
  
  - FIREBASE_API_KEY=your_firebase_api_key
  - FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
  - FIREBASE_PROJECT_ID=your_firebase_project_id
  - FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
  - FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
  - FIREBASE_APP_ID=your_firebase_app_id

**4. Run the application**

 - npx expo start

**5. Open the app using**

 - Expo Go on a physical device,

 - An iOS or Android emulator

 - Running the app on a physical device

## 🎯 Motivation
 EpisodeRoulette was built to solve a personal problem: spending too much time deciding which episode to watch for low-plot TV shows. Instead of endlessly browsing seasons and reading episode summaries, this app removes    the decision-making process entirely by generating a random episode with a single click.

## 📚 What I Learned
 - Native mobile app development with React Native

 - Type-safe development using TypeScript

 - Firebase authentication workflows

 - Integrating and managing multiple third-party APIs

 - Designing user-focused features that prioritize speed and convenience

## 🔮 Future Improvements
- UI/UX redesign for a more polished experience

- Improved animations and transitions

- Additional episode filters (ratings, runtime, popularity)

- Offline support for previously fetched content

- User analytics and viewing statistics

## 📄 License
 This project is licensed under the MIT License.
