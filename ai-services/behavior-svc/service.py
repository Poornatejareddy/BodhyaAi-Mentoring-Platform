import base64
import cv2 # pyright: ignore[reportMissingImports]
import numpy as np # pyright: ignore[reportMissingImports]
import mediapipe as mp # pyright: ignore[reportMissingImports]
from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from pydantic import BaseModel # pyright: ignore[reportMissingImports]

app = FastAPI(
    title="BodhyaAI Behavior Analysis Service",
    description="A microservice to analyze student engagement from video frames.",
    version="0.1.0"
)

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()

# --- Pydantic Models ---
class FrameRequest(BaseModel):
    image_b64: str # Base64 encoded image string

class BehaviorResponse(BaseModel):
    face_detected: bool
    attention_score: float # A score from 0.0 to 1.0

@app.post("/analyze", response_model=BehaviorResponse)
def analyze_frame(request: FrameRequest):
    """
    Analyzes a single video frame to detect student engagement.
    """
    # 1. Decode the base64 image
    try:
        img_data = base64.b64decode(request.image_b64)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception:
        return BehaviorResponse(face_detected=False, attention_score=0.0)

    # 2. Process the image with MediaPipe
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    # 3. Mock Engagement Logic
    # For now, our "attention score" is simply whether a face is detected or not.
    # In a real implementation, we would analyze eye aspect ratio, head pose, etc.
    if results.multi_face_landmarks:
        face_detected = True
        attention_score = 0.85 # Mock score indicating attention
    else:
        face_detected = False
        attention_score = 0.1 # Mock score indicating no attention

    return BehaviorResponse(
        face_detected=face_detected,
        attention_score=attention_score
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}