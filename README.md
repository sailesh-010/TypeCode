# TypeCode – Typing Practice Platform

TypeCode is a full-stack typing practice web application built for improving typing speed and accuracy. It includes real-time feedback, AI-powered assistance, secure authentication, and competitive leaderboards.

This project was developed as a college full-stack application using Express.js, MongoDB, and vanilla JavaScript.

---

## Features

- Real-time typing practice with WPM and accuracy calculation  
- AI-powered suggestions and typing analysis  
- Global leaderboard with live score updates  
- Secure user authentication (OAuth2 + sessions)  
- User profile and settings management  
- Responsive design for desktop and mobile  
- Visual keyboard feedback during typing  

---

## Tech Stack

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- Passport.js  
- Express-session  
- CORS  
- Dotenv  

### Frontend
- HTML5  
- CSS3  
- Vanilla JavaScript  
- Axios  

### AI Integration
- Google Generative AI  
- OpenAI API  

---

## Project Structure

```
typecode/
├── backend/
│   ├── server.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── src/
│
├── frontend/
│   └── public/
│       ├── index.html
│       ├── practice.html
│       ├── leaderboard.html
│       ├── account.html
│
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Clone the Repository

```
git clone https://github.com/yourusername/typecode.git
cd typecode
```

### 2. Install Dependencies

```
npm run install-all
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```
DB_CONNECTION_STRING=mongodb://localhost:27017/typecode

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key

OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

### 4. Run the Project

Development mode:

```
npm run dev
```

Production mode:

```
npm start
```

The application will run at:

```
http://localhost:3000
```

---

## Security Features

- OAuth2 authentication  
- Session management  
- Environment variable configuration  
- CORS protection  
- Structured error handling  

---


## License

ISC License  

---

## Author

Your Name  
GitHub: https://github.com/yourusername  
Email: your.email@example.com  