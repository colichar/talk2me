from transformers import WhisperProcessor, WhisperForConditionalGeneration, T5Tokenizer, T5ForConditionalGeneration
import soundfile as sf
import io
from pydub import AudioSegment
from scipy.signal import resample
import numpy as np

# Initialize transcription model
transcription_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
transcription_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny")
transcription_model.config.forced_decoder_ids = None

# Initialize summarization model
tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")

async def convert_to_16000Hz(audio_array, original_sampling_rate):
    # Calculate the number of samples for the new sampling rate
    new_sample_count = int(len(audio_array) * 16000 / original_sampling_rate)
    
    # Use scipy to resample
    resampled_audio = resample(audio_array, new_sample_count)
    
    # Convert to float32 format
    resampled_audio = np.array(resampled_audio, dtype=np.float32)
    return resampled_audio, 16000

async def convert_to_wav(file):
    file_format = 'mp3' if file[:3] == b'ID3' else 'wav'


    if file_format == 'mp3':
        audio = AudioSegment.from_file(io.BytesIO(file), format='mp3')
        wav_io = io.BytesIO()
        audio.export(wav_io, format='wav')
        wav_io.seek(0)
        return wav_io
    else:
        return io.BytesIO(file)

async def transcribe_audio_file(file, chunk_duration=30):
    print('Preparing audio for transcription...')
    content = await file.read()

    wav_io = await convert_to_wav(content)

    audio_array, sampling_rate = sf.read(wav_io)

    if sampling_rate != 16000:
        audio_array, sampling_rate = await convert_to_16000Hz(audio_array, sampling_rate)

    print('Sampling rate', sampling_rate)

    chunk_size = int(chunk_duration * sampling_rate)

    transcriptions = []

    print('Transcribing audio...')

    for start in range(0, len(audio_array), chunk_size):
        print('Chunk number', start)
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
    print('Preparing audio file for summarization...')

    try: 
        prompt = await transcribe_audio_file(file=file)
    except Exception as e:
        print(e)

    prompt = f"Summarize the following in concise bullet points, separated by '<bp>': {prompt}"

    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)

    print('Generating summary...')
    summary_ids = model.generate(
        inputs["input_ids"], 
        num_beams=4, 
        max_length=100, 
        min_length=20, 
        no_repeat_ngram_size=2, 
        early_stopping=True
    )

    print('Decoding summary...')
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return summary
