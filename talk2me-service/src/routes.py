from fastapi import APIRouter, File, UploadFile, HTTPException
from handlers import transcribe_audio_file, summarize_audio_file

api_router = APIRouter()

@api_router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        transcription = await transcribe_audio_file(file=file)

        return {"result": transcription}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occured: {str(e)}")

@api_router.post("/summarize")
async def summarize_audio(file: UploadFile = File(...)):
    try:
        summary = await summarize_audio_file(file=file)

        return {"result": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occured: {str(e)}")
