from fastapi import APIRouter, File, UploadFile, HTTPException
from handlers.v2.handlers import transcribe_summarize_agent

api_router = APIRouter()

@api_router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        result = await transcribe_summarize_agent(file=file, summarize=None)

        print('Returning transcription...')
        return {"result": result['transcript']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occured: {str(e)}")

@api_router.post("/summarize")
async def summarize_audio(file: UploadFile = File(...)):
    try:
        result = await transcribe_summarize_agent(file=file, summarize=True)

        print('Returning summary...')
        return {"result": result['summary']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occured: {str(e)}")
