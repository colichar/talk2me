from fastapi import FastAPI, File, UploadFile
from transformers import WhisperProcessor, WhisperForConditionalGeneration, pipeline
import io
import soundfile as sf
import torch

app = FastAPI()

# Initialize transcription model
transcription_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
transcription_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny")
transcription_model.config.forced_decoder_ids = None

# Initialize summarization model
summarizer_model = pipeline("summarization", model="facebook/bart-large-cnn")

async def transcribe_audio_file(file):
    content = await file.read()

    audio_array, sampling_rate = sf.read(io.BytesIO(content))

    input_features = transcription_processor(audio_array, sampling_rate=sampling_rate, return_tensors="pt").input_features 

    predicted_ids = transcription_model.generate(input_features)

    transcription = transcription_processor.batch_decode(predicted_ids, skip_special_tokens=True)

    return transcription[0]

async def summarize_audio_file(file):
    transcription = await transcribe_audio_file(file=file)

    summary = summarizer_model(transcription, max_length=130, min_length=30, do_sample=False)

    return summary[0]['summary_text']


@app.post("/transcribe")
async def process_audio(file: UploadFile = File(...)):
    try:
        transcription = await transcribe_audio_file(file=file)

        return {"transcription": transcription}

    except Exception as e:
        return {"error": str(e)}

@app.post("/summarize")
async def process_audio(file: UploadFile = File(...)):
    try:
        summary = await summarize_audio_file(file=file)

        return {"summary": summary}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)


