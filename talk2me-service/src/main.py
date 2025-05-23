from fastapi import FastAPI
from routes import api_router

app = FastAPI()

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)


