# WorkFlow AI Assistant

An AI-powered productivity tool that helps you summarize text, answer questions, generate content, analyze documents, and get intelligent suggestions — all in one place.

Built with **FastAPI**, **React**, and **Gemini API**.

## Features

- **Text Summarization** – Paste any long text and get a clear, concise summary in your preferred tone and length.
- **Question Answering** – Provide a context or document and ask questions to get precise answers based on the given information.
- **Content Generation** – Generate emails, social media posts, reports, or any other content using a simple prompt.
- **Text Analysis** – Analyze text for key points, sentiment, structure, and overall clarity.
- **Smart Suggestions** – Receive practical and actionable recommendations to improve productivity or writing.
- **Document Upload** – Upload `.txt` or `.md` files to summarize them or ask questions about their content.

## Setup

### Backend

cd backend
python -m venv venv
venv\Scripts\activate          
pip install -r requirements.txt

Create a .env file in the backend folder:

GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Frontend
cd frontend
npm install
Run the App

Terminal 1 – Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000

Terminal 2 – Frontend
Bashcd frontend
npm run dev

Open: http://localhost:5173
This version stays clean while giving proper context about the app and how each feature works.