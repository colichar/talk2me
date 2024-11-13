from transformers import WhisperProcessor, WhisperForConditionalGeneration, pipeline
import soundfile as sf
import io

# Initialize transcription model
transcription_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
transcription_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny")
transcription_model.config.forced_decoder_ids = None

# Initialize summarization model
summarizer_model = pipeline("summarization", model="facebook/bart-large-cnn")

async def transcribe_audio_file(file, chunk_duration=30):
    content = await file.read()
    audio_array, sampling_rate = sf.read(io.BytesIO(content))

    chunk_size = int(chunk_duration * sampling_rate)

    transcriptions = []

    for start in range(0, len(audio_array), chunk_size):
        audio_chunk = audio_array[start:start + chunk_size]
        
        input_features = transcription_processor(
            audio_chunk,
            sampling_rate=sampling_rate,
            return_tensors="pt"
        ).input_features 

        predicted_ids = transcription_model.generate(input_features)
        chunk_transcription = transcription_processor.batch_decode(predicted_ids, skip_special_tokens=True)
        transcriptions.append(chunk_transcription[0])

    transcription = " ".join(transcriptions)

    return transcription

async def summarize_audio_file(file):
    transcription = await transcribe_audio_file(file=file)

    summary = summarizer_model(transcription, max_length=130, min_length=30, do_sample=False)

    return summary[0]['summary_text']