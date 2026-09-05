"""
WorkFlow AI Assistant - FastAPI Backend
Week 1 Project | Innovation Hacks AI Internship 2026
"""

import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai
import traceback

# Load environment variables
load_dotenv()

# -------------------------------------------------
# Configuration & Security
# -------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Create a .env file and add your Gemini API key."
    )

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

app = FastAPI(
    title="WorkFlow AI Assistant",
    description="Smart AI tools for summarization, Q&A, content generation, analysis & suggestions",
    version="1.0.0",
)

# Allow frontend (React) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Request / Response Models
# -------------------------------------------------
class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Input text")
    tone: Optional[str] = Field("professional", description="Desired tone")
    length: Optional[str] = Field("medium", description="short | medium | long")


class QuestionRequest(BaseModel):
    context: str = Field(..., min_length=1, description="Source text / document")
    question: str = Field(..., min_length=1, description="Question to answer")


class ContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="What to generate")
    content_type: Optional[str] = Field(
        "general",
        description="email | blog | social | report | general",
    )
    tone: Optional[str] = Field("professional")
    length: Optional[str] = Field("medium")


class SuggestionRequest(BaseModel):
    text: str = Field(..., min_length=1)
    goal: Optional[str] = Field(
        "improve productivity",
        description="What the user wants to achieve",
    )


class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)
    focus: Optional[str] = Field(
        "general",
        description="sentiment | key_points | structure | general",
    )


# -------------------------------------------------
# Helper: Call Gemini safely
# -------------------------------------------------
def call_ai(system_prompt: str, user_prompt: str, max_tokens: int = 1024) -> str:
    try:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.7,
            ),
        )
        return response.text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}",
        )


# -------------------------------------------------
# Health Check
# -------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "AI Productivity Assistant API is running",
        "version": "1.0.0",
        "endpoints": [
            "/summarize",
            "/ask",
            "/generate",
            "/analyze",
            "/suggest",
            "/analyze-document",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model": GEMINI_MODEL}


# -------------------------------------------------
# 1. Text Summarization
# -------------------------------------------------
@app.post("/summarize")
async def summarize(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    length_map = {
        "short": "2-3 sentences",
        "medium": "1 short paragraph",
        "long": "detailed multi-paragraph summary",
    }
    length_instruction = length_map.get(request.length, "1 short paragraph")

    system = (
        "You are an expert productivity assistant. "
        "Create clear, accurate, and useful summaries."
    )
    user = (
        f"Summarize the following text in a {request.tone} tone. "
        f"Length: {length_instruction}.\n\n"
        f"TEXT:\n{request.text}"
    )

    summary = call_ai(system, user)
    return {
        "success": True,
        "feature": "summarization",
        "result": summary,
        "meta": {"tone": request.tone, "length": request.length},
    }


# -------------------------------------------------
# 2. Question Answering
# -------------------------------------------------
@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if not request.context.strip() or not request.question.strip():
        raise HTTPException(status_code=400, detail="Context and question are required")

    system = (
        "You are a precise question-answering assistant. "
        "Answer ONLY based on the provided context. "
        "If the answer is not in the context, clearly say so."
    )
    user = (
        f"CONTEXT:\n{request.context}\n\n"
        f"QUESTION: {request.question}\n\n"
        "Provide a clear and helpful answer."
    )

    answer = call_ai(system, user)
    return {
        "success": True,
        "feature": "question_answering",
        "result": answer,
    }


# -------------------------------------------------
# 3. Content Generation
# -------------------------------------------------
@app.post("/generate")
async def generate_content(request: ContentRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    type_instructions = {
        "email": "Write a professional email.",
        "blog": "Write an engaging blog post section.",
        "social": "Write a catchy social media post.",
        "report": "Write a clear business report paragraph.",
        "general": "Generate useful content.",
    }
    type_instruction = type_instructions.get(request.content_type, "Generate useful content.")

    length_map = {
        "short": "Keep it concise (under 100 words).",
        "medium": "Aim for 150-250 words.",
        "long": "Write a detailed response (300+ words).",
    }
    length_instruction = length_map.get(request.length, "Aim for 150-250 words.")

    system = (
        f"You are a skilled content writer. {type_instruction} "
        f"Use a {request.tone} tone. {length_instruction}"
    )
    user = f"Generate content for this request:\n\n{request.prompt}"

    content = call_ai(system, user, max_tokens=1500)
    return {
        "success": True,
        "feature": "content_generation",
        "result": content,
        "meta": {
            "content_type": request.content_type,
            "tone": request.tone,
            "length": request.length,
        },
    }


# -------------------------------------------------
# 4. Text / Document Analysis
# -------------------------------------------------
@app.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    focus_prompts = {
        "sentiment": "Analyze the sentiment (positive/negative/neutral) and emotional tone.",
        "key_points": "Extract the main key points and important insights.",
        "structure": "Analyze the structure, clarity, and organization of the text.",
        "general": "Provide a comprehensive analysis covering key points, tone, strengths, and improvement areas.",
    }
    focus_instruction = focus_prompts.get(request.focus, focus_prompts["general"])

    system = (
        "You are an expert text analyst and productivity coach. "
        "Give structured, actionable insights."
    )
    user = (
        f"{focus_instruction}\n\n"
        f"TEXT TO ANALYZE:\n{request.text}"
    )

    analysis = call_ai(system, user, max_tokens=1200)
    return {
        "success": True,
        "feature": "text_analysis",
        "result": analysis,
        "meta": {"focus": request.focus},
    }


# -------------------------------------------------
# 5. Intelligent Suggestions
# -------------------------------------------------
@app.post("/suggest")
async def intelligent_suggestions(request: SuggestionRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    system = (
        "You are a productivity and writing coach. "
        "Give practical, specific, and actionable suggestions."
    )
    user = (
        f"The user wants to: {request.goal}\n\n"
        f"Based on the following text, provide intelligent suggestions "
        f"(improvements, next actions, better phrasing, productivity tips):\n\n"
        f"{request.text}"
    )

    suggestions = call_ai(system, user, max_tokens=1000)
    return {
        "success": True,
        "feature": "intelligent_suggestions",
        "result": suggestions,
        "meta": {"goal": request.goal},
    }


# -------------------------------------------------
# Bonus: Document Upload Analysis (PDF/TXT)
# -------------------------------------------------
@app.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    question: Optional[str] = Form(None),
):
    """
    Accept a text or PDF file, extract text, and either summarize
    or answer a question about it.
    """
    allowed = {
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    # Simple content-type check (frontend also filters)
    if file.content_type and file.content_type not in allowed and not file.filename.endswith((".txt", ".md", ".pdf")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload .txt, .md or .pdf",
        )

    try:
        content = await file.read()
        # For simplicity we treat everything as text (for real PDF use pypdf)
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file")

    if not text.strip():
        raise HTTPException(status_code=400, detail="File appears to be empty")

    # Limit very large files
    if len(text) > 30000:
        text = text[:30000] + "\n\n[Text truncated due to length]"

    if question and question.strip():
        # Q&A mode
        system = (
            "You are a precise document Q&A assistant. "
            "Answer only from the document content."
        )
        user = f"DOCUMENT:\n{text}\n\nQUESTION: {question}"
        result = call_ai(system, user)
        feature = "document_qa"
    else:
        # Summarize mode
        system = "You are an expert document summarizer."
        user = f"Provide a clear, structured summary of this document:\n\n{text}"
        result = call_ai(system, user, max_tokens=1200)
        feature = "document_summary"

    return {
        "success": True,
        "feature": feature,
        "filename": file.filename,
        "result": result,
    }


# -------------------------------------------------
# Global Exception Handler
# -------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print("Unhandled error:", traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "An internal server error occurred. Please try again.",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
