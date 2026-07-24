import uvicorn
from app.main import app
from common.config import HOST, LLM_SVC_PORT

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=LLM_SVC_PORT)
