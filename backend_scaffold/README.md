# Plant Disease Detection Backend

This is a scaffolded production-ready API for a Plant Disease Detection system using FastAPI, OpenCV, and Gemini.

## Folder Structure
- `main.py`: FastAPI application setup and endpoints.
- `model_loader.py`: Model loading logic.
- `predictor.py`: Image preprocessing and prediction logic.
- `gemini_client.py`: Integration with the Gemini API to analyze prediction results.
- `prompts.py`: Prompt templates for Gemini.
- `requirements.txt`: Python dependencies.
- `README.md`: This file.

## Instructions to Run

1. **Set up a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the API Server**:
   ```bash
   uvicorn main:app --reload
   ```

5. **Test the Endpoint**:
   The API will be running at `http://localhost:8000`. You can test it via the Swagger UI documentation at `http://localhost:8000/docs`.
