from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
from langchain.schema import StrOutputParser
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import SQLChatMessageHistory
from huggingface_hub import InferenceClient
from langchain_core.language_models import LLM
from typing import List
import pyttsx3
import os

app = FastAPI(title="Health Tech Assistant API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # Adjust to your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for favicon
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Root Endpoint ---
@app.get("/")
async def root():
    return {"message": "Welcome to the Health Tech Assistant API. Visit /docs for API documentation."}

# --- Data Loading ---
def load_data():
    return pd.read_csv("clinical_summaries.csv")

df = load_data()

# --- Custom LLM for HuggingFace ---
class LlamaLLM(LLM):
    def _call(self, prompt: str, stop: List[str] = None) -> str:
        messages = [{"role": "user", "content": prompt}]
        response = InferenceClient(
            model="m42-health/Llama3-Med42-8B",
            api_key="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"
        ).chat.completions.create(messages=messages)
        return response.choices[0].message.content.strip()

    @property
    def _llm_type(self) -> str:
        return "llama_custom"

llm = LlamaLLM()


# --- Traduction ---




# --- Prompt Templates ---
desc_prompt = PromptTemplate.from_template("""
Tu es un médecin expérimenté et empathique. Tu vas expliquer les informations médicales suivantes à un patient de façon claire, humaine et rassurante, comme si vous étiez en consultation réelle.

Voici les données du patient :
{contexte}

Explique-lui brièvement son état de santé, avec des mots simples mais précis. Rassure-le si nécessaire, et adapte ton ton en fonction de ce que les données révèlent (ex : fièvre, tension normale ou élevée, diagnostic, etc.).

Termine toujours ta réponse en l’invitant naturellement à poser toutes ses questions via le chat.
""")

llm_prompt = PromptTemplate.from_template("""
You are a compassionate and knowledgeable medical assistant trained to support patients.
Use the information provided in the context to give a clear, medically sound, and respectful response.
Speak with the tone of an experienced physician: reassuring, direct, and empathetic.
Adapt your advice to the patient's age, body temperature, blood pressure, heart rate, and diagnosis when available in the context.
Do not express uncertainty — give confident and context-specific answers based on medical reasoning.

**KEEP THE ANSWER CONCISE, IN 3 TO 5 SENTENCES MAXIMUM** 
**the doctor has already consulted the patient and you are there to answer these concerns**
Ensure the conversation feels natural and supportive.
**Answer the question in the provide language**

{history}
Language : {language}
Patient: {question}
Context: {context}
Answer:
""")

# --- Memory Setup ---
def create_persistent_memory(session_id: str, db_path: str = "chat_memory.sqlite"):
    message_history = SQLChatMessageHistory(session_id=session_id, connection_string=f"sqlite:///{db_path}")
    memory = ConversationBufferMemory(
        chat_memory=message_history,
        memory_key="history",
        input_key="question",
        return_messages=True
    )
    return memory

# --- Pydantic Models for Request/Response ---
class PatientRequest(BaseModel):
    summary_id: str
    language: str = "french"

class ChatRequest(BaseModel):
    summary_id: str
    question: str
    language: str = "french"

class AudioRequest(BaseModel):
    text: str
    language_audio: "french"

# --- API Endpoints ---
@app.post("/patient-description", response_model=dict)
async def get_patient_description(request: PatientRequest):
    if request.summary_id not in df["summary_id"].values:
        raise HTTPException(status_code=404, detail="ID introuvable. Veuillez vérifier.")
    
    patient_info = df[df["summary_id"] == request.summary_id].fillna("Inconnu")
    context_dict = patient_info.to_dict(orient="records")[0]
    
    desc_chain = desc_prompt | llm | StrOutputParser()
    description = desc_chain.invoke({"contexte": context_dict,  "language": request.language})
    
    return {"description": description}

@app.post("/chat-response", response_model=dict)
async def get_chat_response(request: ChatRequest):
    if request.summary_id not in df["summary_id"].values:
        raise HTTPException(status_code=404, detail="ID introuvable. Veuillez vérifier.")
    
    patient_info = df[df["summary_id"] == request.summary_id].fillna("Inconnu")
    context_dict = patient_info.to_dict(orient="records")[0]
    
    memory = create_persistent_memory(session_id=request.summary_id)
    
    rag_chain = (
        {
            "question": lambda x: x["question"],
            "language": lambda x: x["language"],
            "context": lambda x: context_dict,
            "history": lambda x: memory.load_memory_variables({"question": x["question"]})["history"]
        }
        | llm_prompt
        | llm
        | StrOutputParser()
    )
    
    response = rag_chain.invoke({"question": request.question, "language" : request.language})
    memory.save_context({"question": request.question}, {"answer": response})
    
    return {"response": response}

@app.post("/text-to-speech")
async def text_to_speech(request: AudioRequest):
    try:
        # Traduction avant audio si nécessaire
        if request.language_audio != "french" or request.language_audio != "english":
            engine = pyttsx3.init()
            #request.text = translate_text(request.text, target_lang=request.language_audio)
        else:
            engine = pyttsx3.init()
            engine.setProperty('voice', request.language_audio )
            output_file = f"output_{hash(request.text)}.mp3"
            engine.save_to_file(request.text, output_file)
            engine.say(request.text)
            engine.runAndWait()

        return {"file_path": output_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur audio : {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=4000)