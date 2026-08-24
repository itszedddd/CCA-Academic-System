import os
import google.generativeai as genai
from typing import Dict, Any

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using the standard gemini model for text
    model = genai.GenerativeModel('gemini-3.6-flash')
else:
    model = None

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

Guidelines:
1. Be polite, professional, and helpful.
2. If asked about fees, mention that rates depend on Grade Level and Membership Type (CBC Member vs Non-Member).
3. If asked about enrollment, guide them to the Digital Forms or Enrollment section.
4. Keep responses concise and easy to read. Do not hallucinate URLs that don't exist in the system.
5. If you do not know the answer, advise them to contact the Registrar or Principal's office.
"""

def chat_with_assistant(message: str, user_role: str, user_context: Dict[str, Any] = None) -> str:
    """Sends a message to the AI assistant and returns the response."""
    
    if not model:
        # Fallback if no API key is provided
        return "I am currently running in offline mode. Please contact the administrator to enable AI features by configuring the Gemini API key."
        
    try:
        # Build context for the AI
        context_str = f"User Role: {user_role}\n"
        if user_context:
            context_str += f"Context: {user_context}\n"
            
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context_str}\nUser: {message}\nAssistant:"
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"AI Assistant Error: {e}")
        return "I'm sorry, I'm having trouble processing your request right now. Please try again later."
