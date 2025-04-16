import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from langgraph.graph import StateGraph, END
from typing import TypedDict

load_dotenv()
GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')

class State(TypedDict):
    audio: bytes
    transcript: str
    summary: str

class TranSummAgent:
    def __init__(self):
        self.client = self._init_client()
        self.graph = self._build_graph()

    def __call__(self, state):
        return self.graph.invoke(state)

    def transcribe_audio(self, state: State, model='gemini-2.0-flash'):
        response = self.client.models.generate_content(
            model=model,
            contents=[
                'Transcribe the following audio recording',
                types.Part.from_bytes(
                    data=state['audio'],
                    mime_type='audio/mp3',
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0,
                seed=42
            )
        )

        return {
            'transcript': response.text,
            'audio': None
        }

    def summarize_text(self, state: State, model='gemini-2.0-flash'):
        response = self.client.models.generate_content(
            model=model,
            contents=f'''Summarize the following transcription of the meeting:

                        {state['transcript']}

                        Start your summary now:''',
            config=types.GenerateContentConfig(
                system_instruction='''
                    You are an assistant attending a meeting and taking notes of the meeting as bullet points.
                    You want to catch the essence of the provided transcription in your bullet points and you want
                    to be as concise as possible. Your summary should not be longer then the initial transcript.
                    ''',
                temperature=0,
                seed=42
            )
        )

        return {'summary': response.text}
    
    def _init_client(self):
        return genai.Client(api_key=GOOGLE_API_KEY)
    
    def _build_graph(self):
        graph = StateGraph(State)

        graph.add_node("transcribe", self.transcribe_audio)
        graph.add_node("summarize", self.summarize_text)

        graph.set_entry_point("transcribe")
        graph.add_edge("transcribe", "summarize")
        graph.add_edge("summarize", END)

        return graph.compile()