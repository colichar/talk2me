from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import httpx

app = FastAPI()

SERVICE_URL = "http://localhost:8010/"

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(audio_file: UploadFile = File(...), operation: str = Form(...)):
    try:
        content = await audio_file.read()

        new_url = SERVICE_URL + operation

        if operation == 'transcribe':
            async with httpx.AsyncClient() as client:
                files = {'file': (audio_file.filename, content, audio_file.content_type)}
                response = await client.post(new_url, files=files)
        elif operation == 'summarize':
            async with httpx.AsyncClient() as client:
                files = {'file': (audio_file.filename, content, audio_file.content_type)}
                response = await client.post(new_url, files=files)

        else:
            raise HTTPException(status_code=400, detail='Invalid operation')

        if response.status_code == 200:
            processed_audio = response.json()
            return {
                "message": "File processed successfully",
                "result": processed_audio
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail="Processing service failed to process audio file."
            )

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with processing service: {stre(e)}"
        )
     
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occured: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
