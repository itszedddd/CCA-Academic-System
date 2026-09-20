import os
from google import genai
from typing import Dict, Any, Optional

# We will initialize the client dynamically to ensure env vars are loaded
client = None

# System prompt to give the AI its persona and context
SYSTEM_PROMPT = """
You are the official AI Assistant for Calvary Christian Academy (CCA) EduSys portal.
Your role is to help students, parents, teachers, and staff navigate the system and answer their questions about CCA.

Current School Year: 2026-2027
Available Features:
- Student Registration & Enrollment Forms
- Tuition Tracking (CBC Member vs Non-Member rates)
- Student Clearance (Cashier, Library, Clinic, Registrar, Principal)
- Digitalized Print-Ready Forms
- School-Wide Reports
- AI Performance Tracker (Academic Warnings)
- Student Archive
- Document Requests

Guidelines:
1. Be polite, helpful, and kind.
2. IMPORTANT: Always reply in simple, easy-to-understand English. Your audience includes staff, teachers, and parents, so keep a warm, respectful tone. Avoid corporate jargon or complex terms.
3. You have REAL-TIME ACCESS to the school database. When a user asks about student counts, enrollment numbers, grades, attendance, tuition, or any school data, use the LIVE SCHOOL DATA section below to answer with actual numbers. Do NOT say you don't have access — you DO.
4. When asked to generate a report or summary, create a clear, well-formatted report using the live data provided. Use bullet points, tables, and sections to organize the information.
5. If asked about fees, briefly mention that rates depend on Grade Level and Membership Type (CBC Member vs Non-Member). Use the actual tuition data if available.
6. If asked about enrollment, use the real enrollment numbers from the data, and also mention they can go to the Digital Forms or Enrollment section for actions.
7. Keep responses concise, clear, and easy to read. Do not hallucinate URLs that don't exist.
8. If the data doesn't contain information for a specific question, politely say the data isn't available for that specific query and advise them to ask the Registrar or Principal's office.
9. Format your responses clearly. Use bullet points when helpful, but keep it simple.
10. When presenting peso amounts, format them with the ₱ symbol and comma separators (e.g., ₱50,000.00).
11. When presenting percentages, round to one decimal place.
"""


def chat_with_assistant(message: str, user_role: str, user_context: Dict[str, Any] = None, model: str = "gemini-3.5-flash-lite", db_snapshot: Optional[str] = None) -> str:
    """Sends a message to the AI assistant and returns the response.
    
    Args:
        message: The user's chat message
        user_role: The role of the current user (Principal, Teacher, etc.)
        user_context: Optional additional context from the frontend page
        model: The Gemini model to use
        db_snapshot: A pre-built text summary of live school database data
    """
    
    global client
    if not client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
            
    if not client:
        return "I am currently running in offline mode. Please contact the administrator to enable AI features by configuring the GEMINI_API_KEY environment variable."
        
    try:
        # Build context for the AI
        context_str = f"User Role: {user_role}\n"
        if user_context:
            context_str += f"Page Context: {user_context}\n"
        
        # Inject the live database snapshot
        data_section = ""
        if db_snapshot:
            data_section = f"\n=== LIVE SCHOOL DATA (Real-Time from Database) ===\n{db_snapshot}\n=== END OF LIVE DATA ===\n"
            
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context_str}{data_section}\nUser: {message}\nAssistant:"
        
        response = client.models.generate_content(
            model=model,
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        error_str = str(e)
        print(f"AI Assistant Error: {error_str}")
        
        # Only return a meaningful error, not a canned response
        if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
            return "The AI service is temporarily rate-limited. Please wait a moment and try again."
        elif "403" in error_str or "permission" in error_str.lower():
            return "The AI API key appears to be invalid or expired. Please contact the administrator."
        else:
            return f"I encountered an error processing your request. Please try again in a moment. (Error: {type(e).__name__})"
