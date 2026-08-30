import os
from google import genai
from typing import Dict, Any

# Configure Gemini using the new google-genai SDK
api_key = os.environ.get("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

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
1. Be polite, professional, and helpful.
2. If asked about fees, mention that rates depend on Grade Level and Membership Type (CBC Member vs Non-Member).
3. If asked about enrollment, guide them to the Digital Forms or Enrollment section.
4. Keep responses concise and easy to read. Do not hallucinate URLs that don't exist in the system.
5. If you do not know the answer, advise them to contact the Registrar or Principal's office.
6. You can help registrar staff with tasks like: generating enrollment reports, checking student requirements, reviewing clearance status, and answering admission-related queries.
7. Format your responses clearly. Use bullet points when listing multiple items.
"""


def chat_with_assistant(message: str, user_role: str, user_context: Dict[str, Any] = None) -> str:
    """Sends a message to the AI assistant and returns the response."""
    
    if not client:
        return "I am currently running in offline mode. Please contact the administrator to enable AI features by configuring the GEMINI_API_KEY environment variable."
        
    try:
        # Build context for the AI
        context_str = f"User Role: {user_role}\n"
        if user_context:
            context_str += f"Context: {user_context}\n"
            
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context_str}\nUser: {message}\nAssistant:"
        
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        error_str = str(e)
        print(f"AI Assistant Error: {error_str}")
        
        # Only return a meaningful error, not a canned response
        if "429" in error_str or "quota" in error_str.lower() or "rate" in error_str.lower():
            return "The AI service is temporarily rate-limited. Please wait a moment and try again."
        elif "403" in error_str or "permission" in error_str.lower():
            return "The AI API key appears to be invalid or expired. Please contact the administrator."
        else:
            return f"I encountered an error processing your request. Please try again in a moment. (Error: {type(e).__name__})"
