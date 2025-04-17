from agents import TranSummAgent

agent = TranSummAgent()

async def transcribe_summarize_agent(file, summarize):

    audio = await file.read()

    state_input = {
        'audio': audio,
        'summarize': summarize,
    }
    
    try:
        result = agent(state_input)
    except Exception as err:
        print(f'An error in the agents workflow has occured: {err}')
        print(f'Error type: {type(err).__name__}')

    return result