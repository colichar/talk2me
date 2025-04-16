from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from models import ProcessedAudioResponse
import httpx

api_router = APIRouter()

SERVICE_URL = "http://localhost:8010/"

@api_router.post("/upload")
async def upload_file(audio_file: UploadFile = File(...), operation: str = Form(...)):
    try:
        content = await audio_file.read()

        new_url = SERVICE_URL + operation

        if operation == 'transcribe':
            async with httpx.AsyncClient(timeout=60) as client:
                files = {'file': (audio_file.filename, content, audio_file.content_type)}
                response = await client.post(new_url, files=files)
        elif operation == 'summarize':
            async with httpx.AsyncClient(timeout=60) as client:
                files = {'file': (audio_file.filename, content, audio_file.content_type)}
                response = await client.post(new_url, files=files)

        else:
            raise HTTPException(status_code=400, detail='Invalid operation')

        if response.status_code == 200:
            processed_audio = response.json()
            return ProcessedAudioResponse(
                message="File processed successfully",
                result=processed_audio
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail="Processing service failed to process audio file."
            )

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with processing service: {str(e)}"
        )
     
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occured: {str(e)}"
        )