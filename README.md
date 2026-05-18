# 🤖 AI Chatbot with Zero Short Prompting (Gemini API)

## 📌 Project Overview
This project is a full-stack AI chatbot developed using **React.js** for the frontend and **Node.js (Express)** for the backend, integrated with the **Gemini API**.

The application delivers a modern conversational experience similar to ChatGPT and Claude, while introducing an enhancement technique called **Zero Short Prompting** to improve response quality even with minimal user input.

---

## 🚀 Key Features

- 💬 ChatGPT-style user interface  
- 📜 Chat history sidebar  
- ⚡ Fast and responsive AI responses  
- 🧠 Context-aware conversations  
- 🌙 Dark mode support  
- 🧾 Markdown and code formatting  
- ⏳ Typing indicator  
- 📱 Fully responsive design  

---

## 🧠 What is Zero Short Prompting?

### 🔹 Definition
**Zero Short Prompting** is a method where short or simple user inputs are automatically enhanced with structured context before being sent to the AI model.

This allows users to interact naturally without needing to write detailed prompts while still receiving high-quality responses.

---

### 🔹 How It Works

Instead of sending raw user input directly:

1. User enters a short query  
2. System analyzes user intent  
3. A hidden system prompt is added  
4. Conversation history and context are injected  
5. Enhanced prompt is sent to Gemini API  

---

## ⚙️ Zero Short Prompting Architecture


User Input
↓
Intent Analyzer
↓
Prompt Enhancement Layer (Zero Short Prompting)
↓
Context Injection (History + Rules)
↓
Gemini API
↓
Response Processing
↓
Frontend Display


---

## 🧩 Implementation Details

### Backend Prompt Enhancement

```javascript
const systemPrompt = `
You are an intelligent AI assistant.
Provide clear, structured, and helpful responses.
Understand user intent even if the input is short.
`;

const finalPrompt = `${systemPrompt}\nUser: ${userMessage}`;
🔥 Enhancements Included
Intent recognition for short queries
Context-aware response generation
Automatic prompt structuring
Improved clarity and accuracy
🛠️ Tech Stack
Frontend
React.js
Tailwind CSS
Backend
Node.js
Express.js
AI Integration
Gemini API
🔑 Environment Setup

Create a .env file in the backend folder:

GEMINI_API_KEY=your_api_key_here
▶️ Running the Project
Backend
cd backend
npm install
npm start
Frontend
cd client
npm install
npm run dev
