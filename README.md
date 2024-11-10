# talk2me

talk2me is an application that lets users upload audio files via a user interface and receive either a transcript or a summary of the uploaded audio. The app is organized as a monorepo with separate components for the frontend, API, and audio processing service.

## Project Structure

- **talk2me-ui**: Frontend for the application, built with JavaScript and managed with npm.
- **talk2me-api**: FastAPI-based backend API that handles requests and coordinates between the UI and processing service.
- **talk2me-service**: FastAPI-based audio processing service that performs transcription and summarization tasks on audio files.

## Getting Started

### Prerequisites

- **npm**: Required for frontend dependencies.
- **Python** (3.12.6 or higher recommended): Required for backend API and service.
- **Virtual Environment**: Recommended for managing dependencies in the backend.

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/colichar/talk2me.git
   cd talk2me
   ```

2. **Frontend (talk2me-ui)**

   Navigate to the talk2me-ui directory and install dependencies:

   ```bash
   cd talk2me-ui
   npm install
   ```

   To start the frontend, run:

   ```bash
   npm start
   ```
   
   This will launch the UI on the default port (usually http://localhost:3000).

3. **API (talk2me-api)**

   In a separate terminal, navigate to the talk2me-api directory:

   ```bash
   cd ../talk2me-api
   ```
   
   Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

   Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```
   
   Start the API server:

   ```bash
   uvicorn main:app --reload
   ```
   
   The API will start on http://localhost:8000.


4. **Service (talk2me-service)**

   Open a new terminal, navigate to talk2me-service, and repeat the steps to set up a virtual environment:

   ```bash
   cd ../talk2me-service
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt

   ```
   
   Start the processing service:

   ```bash
   uvicorn main:app --reload
   ```

   This service will be available on http://localhost:8010.

## Usage

- Open the UI, upload an audio file, and select either the **Transcript** or **Summary** option.
- The API will coordinate the request, passing it to the service, which will process the audio and return the requested output.