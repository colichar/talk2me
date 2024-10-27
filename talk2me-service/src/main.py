from fastapi import FastAPI, File, UploadFile
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import io
import soundfile as sf
import torch

app = FastAPI()

processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny")
model.config.forced_decoder_ids = None

@app.post("/process")
async def process_audio(file: UploadFile = File(...)):
    try:
        content = await file.read()

        audio_array, sampling_rate = sf.read(io.BytesIO(content))

        input_features = processor(audio_array, sampling_rate=sampling_rate, return_tensors="pt").input_features 

        predicted_ids = model.generate(input_features)

        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

        return {"transcription": transcription[0]}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)


